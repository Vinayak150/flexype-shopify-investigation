import { describe, expect, it, vi } from "vitest";

import { createChromeFactSource } from "../../extension/adapters/chrome-fact-source.js";
import type { StorefrontObservationSnapshot } from "../../extension/adapters/storefront-observation.js";
import { EMPTY_SHOPIFY_PAGE_SOURCES } from "../../extension/adapters/storefront-observation.js";
import { EMPTY_DISABLED_SIGNALS } from "../../extension/adapters/storefront-observation.js";
import { StorefrontPageType } from "../../extension/adapters/store-metadata.js";
import type { InvestigationContext } from "../../src/investigation/index.js";
import type { ObservationAffordance } from "../../src/observation/index.js";
import { EvidenceSignalClass } from "../../src/evidence/signal-class.js";

const probeStorefrontObservationWithRetry = vi.fn();

vi.mock("../../extension/adapters/chrome-dom-adapter.js", () => ({
  probeStorefrontObservationWithRetry: (...args: unknown[]) =>
    probeStorefrontObservationWithRetry(...args),
}));

const snapshot: StorefrontObservationSnapshot = Object.freeze({
  kind: "StorefrontObservationSnapshot",
  url: "https://store.example/",
  documentReachable: true,
  metadataReachable: true,
  canTraverse: true,
  canQuery: true,
  scriptUrls: Object.freeze(["https://cdn.flexype.io/checkout.js"]),
  stylesheetUrls: Object.freeze([]),
  domIndicators: Object.freeze([]),
  globalObjects: Object.freeze(["flexype"]),
  metadata: Object.freeze({
    metaTags: Object.freeze([]),
  }),
  themeHints: Object.freeze([]),
  shopifySources: EMPTY_SHOPIFY_PAGE_SOURCES,
  storeMetadata: Object.freeze({
    pageType: StorefrontPageType.Unknown,
  }),
  disabledSignals: EMPTY_DISABLED_SIGNALS,
});

const affordance = Object.freeze({
  kind: "ObservationAffordance",
  investigationId: "inv-1",
  isPubliclyObservable: true,
  descriptors: Object.freeze({
    documentReachable: true,
    metadataReachable: true,
    traversalCapable: true,
    queryCapable: true,
  }),
}) as ObservationAffordance;

const context = Object.freeze({
  investigationId: "inv-1",
  storefrontTarget: Object.freeze({ storefrontUrl: "https://store.example/" }),
}) as InvestigationContext;

describe("createChromeFactSource", () => {
  it("returns empty facts when observation is not publicly observable", async () => {
    const factSource = createChromeFactSource(12);
    const facts = await factSource.collectFacts(context, {
      ...affordance,
      isPubliclyObservable: false,
    });

    expect(facts).toEqual([]);
    expect(probeStorefrontObservationWithRetry).not.toHaveBeenCalled();
  });

  it("maps probed storefront snapshot into Evidence-compatible facts", async () => {
    probeStorefrontObservationWithRetry.mockResolvedValue(snapshot);
    const factSource = createChromeFactSource(12);

    const facts = await factSource.collectFacts(context, affordance);

    expect(probeStorefrontObservationWithRetry).toHaveBeenCalledWith(12);
    expect(facts.length).toBeGreaterThan(0);
    expect(
      facts.some((fact) => fact.signalClass === EvidenceSignalClass.ScriptUrls),
    ).toBe(true);
    expect(
      facts.some(
        (fact) => fact.signalClass === EvidenceSignalClass.GlobalBrowserObjects,
      ),
    ).toBe(true);
  });

  it("returns empty facts when content script probe is unavailable", async () => {
    probeStorefrontObservationWithRetry.mockResolvedValue(undefined);
    const factSource = createChromeFactSource(99);

    const facts = await factSource.collectFacts(context, affordance);

    expect(facts).toEqual([]);
  });
});
