import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  createMemoryBrowserPorts,
  createMemoryDomPorts,
} from "../../src/observation/index.js";
import { ExtensionRuntime } from "../../extension/runtime/extension-runtime.js";

const getActiveTab = vi.fn();
const createChromeBrowserPorts = vi.fn();
const createChromeDomPorts = vi.fn();

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
  STOREFRONT_PROBE_MESSAGE: "FLEXYPE_STOREFRONT_PROBE",
}));

describe("extension runtime", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    createChromeBrowserPorts.mockReturnValue(createMemoryBrowserPorts());
    createChromeDomPorts.mockReturnValue(createMemoryDomPorts());
  });

  it("initializes SystemRuntime for the active tab", async () => {
    getActiveTab.mockResolvedValue({
      tabId: 42,
      url: "https://demo.myshopify.com",
      title: "Demo",
    });

    const runtime = new ExtensionRuntime();
    await runtime.initialize();

    const status = runtime.getStatus();
    expect(status.extensionReady).toBe(true);
    expect(status.systemRuntimeStatus).toBe("ready");
    expect(status.activeTabUrl).toBe("https://demo.myshopify.com");
    expect(createChromeBrowserPorts).toHaveBeenCalledWith({
      tabId: 42,
      tabUrl: "https://demo.myshopify.com",
    });
    expect(createChromeDomPorts).toHaveBeenCalledWith(42);
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

    const status = runtime.getStatus();
    expect(status.investigationId).toBe(started.investigationId);
    expect(status.investigationState).toBeDefined();

    const view = runtime.getPresentationView();
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
    expect(runtime.getPresentationView()).toBeUndefined();
  });

  it("returns uninitialized status before startup", () => {
    const runtime = new ExtensionRuntime();
    const status = runtime.getStatus();

    expect(status.extensionReady).toBe(false);
    expect(status.systemRuntimeStatus).toBe("uninitialized");
    expect(runtime.getPresentationView()).toBeUndefined();
  });
});
