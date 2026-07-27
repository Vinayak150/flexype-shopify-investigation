import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  createMemoryBrowserPorts,
  createMemoryDomPorts,
} from "../../src/observation/index.js";
import { StorefrontPageType } from "../../extension/adapters/store-metadata.js";
import { EMPTY_DISABLED_SIGNALS, EMPTY_SHOPIFY_PAGE_SOURCES } from "../../extension/adapters/storefront-observation.js";
import { ExtensionRuntime } from "../../extension/runtime/extension-runtime.js";

const getActiveTab = vi.fn();
const createChromeBrowserPorts = vi.fn();
const createChromeDomPorts = vi.fn();
const createChromeFactSource = vi.fn();
const ensureStorefrontAgent = vi.fn();
const probeStorefrontObservationWithRetry = vi.fn();

vi.mock("../../extension/adapters/chrome-tab-adapter.js", () => ({
  getActiveTab: (...args: unknown[]) => getActiveTab(...args),
  isLikelyPublicStorefrontUrl: (url: string) => {
    try {
      const parsed = new URL(url);
      return parsed.protocol === "https:" || parsed.protocol === "http:";
    } catch {
      return false;
    }
  },
  createChromeBrowserPorts: (...args: unknown[]) => createChromeBrowserPorts(...args),
}));

vi.mock("../../extension/adapters/chrome-dom-adapter.js", () => ({
  createChromeDomPorts: (...args: unknown[]) => createChromeDomPorts(...args),
  probeStorefrontObservation: vi.fn(),
  probeStorefrontObservationWithRetry: (...args: unknown[]) =>
    probeStorefrontObservationWithRetry(...args),
  STOREFRONT_PROBE_MESSAGE: "FLEXYPE_STOREFRONT_PROBE",
  STOREFRONT_READY_MESSAGE: "FLEXYPE_STOREFRONT_READY",
}));

vi.mock("../../extension/adapters/chrome-content-script-adapter.js", () => ({
  ensureStorefrontAgent: (...args: unknown[]) => ensureStorefrontAgent(...args),
}));

vi.mock("../../extension/adapters/chrome-fact-source.js", () => ({
  createChromeFactSource: (...args: unknown[]) => createChromeFactSource(...args),
}));

function mockObservationSnapshot(shopName: string) {
  return Object.freeze({
    kind: "StorefrontObservationSnapshot" as const,
    url: "https://store.example/",
    documentReachable: true,
    metadataReachable: true,
    canTraverse: true,
    canQuery: true,
    scriptUrls: Object.freeze([]),
    stylesheetUrls: Object.freeze([]),
    domIndicators: Object.freeze([]),
    globalObjects: Object.freeze([]),
    metadata: Object.freeze({ metaTags: Object.freeze([]) }),
    themeHints: Object.freeze([]),
    shopifySources: EMPTY_SHOPIFY_PAGE_SOURCES,
    storeMetadata: Object.freeze({
      pageType: StorefrontPageType.Home,
      shopName,
    }),
    disabledSignals: EMPTY_DISABLED_SIGNALS,
  });
}

describe("extension runtime", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    createChromeBrowserPorts.mockReturnValue(createMemoryBrowserPorts());
    createChromeDomPorts.mockReturnValue(createMemoryDomPorts());
    createChromeFactSource.mockReturnValue({
      collectFacts: vi.fn(async () => Object.freeze([])),
    });
    ensureStorefrontAgent.mockResolvedValue(undefined);
    probeStorefrontObservationWithRetry.mockResolvedValue(undefined);
  });

  it("initializes SystemRuntime for the active tab", async () => {
    getActiveTab.mockResolvedValue({
      tabId: 42,
      url: "https://demo.myshopify.com",
      title: "Demo",
    });

    const runtime = new ExtensionRuntime();
    await runtime.initialize();

    const status = await runtime.getStatus();
    expect(status.extensionReady).toBe(true);
    expect(status.systemRuntimeStatus).toBe("ready");
    expect(status.activeTabUrl).toBe("https://demo.myshopify.com");
    expect(createChromeBrowserPorts).toHaveBeenCalledWith({
      tabId: 42,
      tabUrl: "https://demo.myshopify.com",
    });
    expect(createChromeDomPorts).toHaveBeenCalledWith(42);
    expect(createChromeFactSource).toHaveBeenCalledWith(42);
    expect(ensureStorefrontAgent).not.toHaveBeenCalled();
  });

  it("fails honestly when no active tab is available", async () => {
    getActiveTab.mockResolvedValue(undefined);
    const runtime = new ExtensionRuntime();

    await expect(runtime.initialize()).rejects.toThrow(
      "No active tab available for extension runtime startup",
    );
    await expect(runtime.startInvestigation()).rejects.toThrow(
      "No active tab available for Investigation",
    );
  });

  it("rejects unsupported restricted pages", async () => {
    getActiveTab.mockResolvedValue({
      tabId: 7,
      url: "chrome://settings",
    });
    const runtime = new ExtensionRuntime();

    await expect(runtime.startInvestigation()).rejects.toThrow(
      "Active tab is not a supported storefront page",
    );
    expect(ensureStorefrontAgent).not.toHaveBeenCalled();
  });

  it("runs investigation through SystemRuntime and stores presentation results", async () => {
    getActiveTab.mockResolvedValue({
      tabId: 99,
      url: "https://store.example/products/test",
    });

    const runtime = new ExtensionRuntime();
    const started = await runtime.startInvestigation();

    expect(started.storefrontUrl).toBe("https://store.example/products/test");
    expect(started.stageCount).toBeGreaterThan(0);
    expect(started.investigationId.length).toBeGreaterThan(0);
    expect(ensureStorefrontAgent).toHaveBeenCalledWith(99);

    const status = await runtime.getStatus();
    expect(status.investigationId).toBe(started.investigationId);
    expect(status.investigationState).toBeDefined();

    const view = await runtime.getPresentationView();
    expect(view?.kind).toBe("PresentationReadyView");
    expect(view?.investigationId).toBe(started.investigationId);
    expect(view?.products.length).toBe(3);
  });

  it("does not fabricate presentation when investigation yields no view", async () => {
    getActiveTab.mockResolvedValue({
      tabId: 11,
      url: "https://demo.myshopify.com",
    });

    const runtime = new ExtensionRuntime();
    const systemRuntime = (
      runtime as unknown as {
        systemRuntime?: { runInvestigation: ReturnType<typeof vi.fn> };
      }
    ).systemRuntime;
    expect(systemRuntime).toBeUndefined();

    await runtime.initialize();
    const wiredRuntime = (
      runtime as unknown as {
        systemRuntime: { runInvestigation: ReturnType<typeof vi.fn> };
      }
    ).systemRuntime;

    wiredRuntime.runInvestigation = vi.fn(async () => ({
      kind: "IntegratedInvestigationResult",
      context: {
        investigationId: "inv-empty",
        state: "Completed",
        storefrontTarget: { storefrontUrl: "https://demo.myshopify.com" },
      },
      run: { stageResults: [] },
      stageResults: [],
      view: undefined,
    }));

    await expect(runtime.startInvestigation()).rejects.toThrow(
      "Investigation completed without presentation results",
    );
    expect(await runtime.getPresentationView()).toBeUndefined();
  });

  it("surfaces storefront agent injection failures before investigation", async () => {
    getActiveTab.mockResolvedValue({
      tabId: 55,
      url: "https://store.example/",
    });
    ensureStorefrontAgent.mockRejectedValue(
      new Error("Unable to inject storefront observation agent: Cannot access contents of url"),
    );

    const runtime = new ExtensionRuntime();

    await expect(runtime.startInvestigation()).rejects.toThrow(
      "Unable to inject storefront observation agent: Cannot access contents of url",
    );
    expect(ensureStorefrontAgent).toHaveBeenCalledWith(55);
  });

  it("returns uninitialized status before startup", async () => {
    getActiveTab.mockResolvedValue(undefined);
    const runtime = new ExtensionRuntime();
    const status = await runtime.getStatus();

    expect(status.extensionReady).toBe(false);
    expect(status.systemRuntimeStatus).toBe("uninitialized");
    expect(await runtime.getPresentationView()).toBeUndefined();
  });

  it("returns tab 101 Aseem results when tab 101 is active", async () => {
    getActiveTab.mockResolvedValue({
      tabId: 101,
      url: "https://aseemshakti.com/",
    });
    probeStorefrontObservationWithRetry.mockResolvedValue(
      mockObservationSnapshot("Aseem Shakti"),
    );

    const runtime = new ExtensionRuntime();
    await runtime.startInvestigation();

    getActiveTab.mockResolvedValue({
      tabId: 102,
      url: "https://zouraofficial.com/",
    });
    probeStorefrontObservationWithRetry.mockResolvedValue(
      mockObservationSnapshot("Zoura Official"),
    );
    await runtime.startInvestigation();

    getActiveTab.mockResolvedValue({
      tabId: 101,
      url: "https://aseemshakti.com/",
    });

    const view = await runtime.getPresentationView();
    expect(view?.store.shopName).toBe("Aseem Shakti");

    const status = await runtime.getStatus();
    expect(status.activeTabUrl).toBe("https://aseemshakti.com/");
    expect(status.investigationId).toBeDefined();
  });

  it("returns tab 102 Zoura results when tab 102 is active", async () => {
    getActiveTab.mockResolvedValue({
      tabId: 101,
      url: "https://aseemshakti.com/",
    });
    probeStorefrontObservationWithRetry.mockResolvedValue(
      mockObservationSnapshot("Aseem Shakti"),
    );

    const runtime = new ExtensionRuntime();
    await runtime.startInvestigation();

    getActiveTab.mockResolvedValue({
      tabId: 102,
      url: "https://zouraofficial.com/",
    });
    probeStorefrontObservationWithRetry.mockResolvedValue(
      mockObservationSnapshot("Zoura Official"),
    );
    await runtime.startInvestigation();

    getActiveTab.mockResolvedValue({
      tabId: 102,
      url: "https://zouraofficial.com/",
    });

    const view = await runtime.getPresentationView();
    expect(view?.store.shopName).toBe("Zoura Official");

    const status = await runtime.getStatus();
    expect(status.activeTabUrl).toBe("https://zouraofficial.com/");
  });

  it("returns empty presentation for a new tab without a prior investigation", async () => {
    getActiveTab.mockResolvedValue({
      tabId: 101,
      url: "https://aseemshakti.com/",
    });
    probeStorefrontObservationWithRetry.mockResolvedValue(
      mockObservationSnapshot("Aseem Shakti"),
    );

    const runtime = new ExtensionRuntime();
    await runtime.startInvestigation();

    getActiveTab.mockResolvedValue({
      tabId: 103,
      url: "https://newstore.example/",
    });

    expect(await runtime.getPresentationView()).toBeUndefined();

    const status = await runtime.getStatus();
    expect(status.activeTabUrl).toBe("https://newstore.example/");
    expect(status.investigationId).toBeUndefined();
  });

  it("does not leak another tab's investigation when switching tabs without rerun", async () => {
    getActiveTab.mockResolvedValue({
      tabId: 101,
      url: "https://aseemshakti.com/",
    });
    probeStorefrontObservationWithRetry.mockResolvedValue(
      mockObservationSnapshot("Aseem Shakti"),
    );

    const runtime = new ExtensionRuntime();
    const aseemStarted = await runtime.startInvestigation();

    getActiveTab.mockResolvedValue({
      tabId: 102,
      url: "https://zouraofficial.com/",
    });
    probeStorefrontObservationWithRetry.mockResolvedValue(
      mockObservationSnapshot("Zoura Official"),
    );
    const zouraStarted = await runtime.startInvestigation();

    getActiveTab.mockResolvedValue({
      tabId: 101,
      url: "https://aseemshakti.com/",
    });

    const aseemView = await runtime.getPresentationView();
    expect(aseemView?.investigationId).toBe(aseemStarted.investigationId);
    expect(aseemView?.store.shopName).toBe("Aseem Shakti");

    getActiveTab.mockResolvedValue({
      tabId: 102,
      url: "https://zouraofficial.com/",
    });

    const zouraView = await runtime.getPresentationView();
    expect(zouraView?.investigationId).toBe(zouraStarted.investigationId);
    expect(zouraView?.store.shopName).toBe("Zoura Official");
    expect(zouraView?.investigationId).not.toBe(aseemStarted.investigationId);
  });

  it("removes stored investigation state when a tab is closed", async () => {
    getActiveTab.mockResolvedValue({
      tabId: 101,
      url: "https://aseemshakti.com/",
    });
    probeStorefrontObservationWithRetry.mockResolvedValue(
      mockObservationSnapshot("Aseem Shakti"),
    );

    const runtime = new ExtensionRuntime();
    await runtime.startInvestigation();

    runtime.removeInvestigationForTab(101);

    expect(await runtime.getPresentationView()).toBeUndefined();
    const status = await runtime.getStatus();
    expect(status.investigationId).toBeUndefined();
  });
});
