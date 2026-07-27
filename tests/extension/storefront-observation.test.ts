import { describe, expect, it } from "vitest";

import {
  isStorefrontObservationSnapshot,
  isStorefrontReadyResponse,
  STOREFRONT_PROBE_MESSAGE,
  STOREFRONT_READY_MESSAGE,
  EMPTY_DISABLED_SIGNALS,
  EMPTY_SHOPIFY_PAGE_SOURCES,
  type StorefrontObservationSnapshot,
} from "../../extension/adapters/storefront-observation.js";
import { StorefrontPageType } from "../../extension/adapters/store-metadata.js";

describe("storefront observation snapshot", () => {
  it("validates the content-script probe message kind", () => {
    expect(STOREFRONT_PROBE_MESSAGE).toBe("FLEXYPE_STOREFRONT_PROBE");
    expect(STOREFRONT_READY_MESSAGE).toBe("FLEXYPE_STOREFRONT_READY");
  });

  it("validates storefront readiness responses", () => {
    expect(
      isStorefrontReadyResponse({
        kind: "StorefrontObservationReady",
        ready: true,
        documentReadyState: "interactive",
      }),
    ).toBe(true);
    expect(
      isStorefrontReadyResponse({ kind: "StorefrontObservationReady", ready: false }),
    ).toBe(true);
    expect(isStorefrontReadyResponse({ kind: "StorefrontObservationSnapshot" })).toBe(
      false,
    );
  });

  it("accepts a full public storefront observation payload", () => {
    const payload: StorefrontObservationSnapshot = Object.freeze({
      kind: "StorefrontObservationSnapshot",
      url: "https://store.example/products/test",
      documentReachable: true,
      metadataReachable: true,
      canTraverse: true,
      canQuery: true,
      scriptUrls: Object.freeze([
        "https://cdn.shopify.com/s/files/1/theme.js",
        "https://assets.flexype.io/checkout/v2/main.js",
      ]),
      stylesheetUrls: Object.freeze(["https://cdn.shopify.com/theme.css"]),
      domIndicators: Object.freeze([
        Object.freeze({
          tag: "div",
          id: "flexype-checkout",
          classes: Object.freeze(["flexype-root"]),
          dataAttributes: Object.freeze(["data-flexype=checkout"]),
        }),
      ]),
      globalObjects: Object.freeze(["Shopify", "flexype"]),
      metadata: Object.freeze({
        title: "Example Store",
        canonicalUrl: "https://store.example/products/test",
        metaTags: Object.freeze([
          Object.freeze({ property: "og:title", content: "Example Store" }),
        ]),
      }),
      themeHints: Object.freeze([
        "script:https://cdn.shopify.com/s/files/1/theme.js",
        "theme-name:Refresh",
      ]),
      shopifySources: EMPTY_SHOPIFY_PAGE_SOURCES,
      storeMetadata: Object.freeze({
        pageType: StorefrontPageType.Product,
        storeUrl: "https://store.example/products/test",
        shopifyDomain: "demo.myshopify.com",
        shopName: "Example Store",
        baseCurrency: "INR",
        country: "IN",
        locale: "en-IN",
        themeName: "Refresh",
      }),
      disabledSignals: EMPTY_DISABLED_SIGNALS,
    });

    expect(isStorefrontObservationSnapshot(payload)).toBe(true);
    expect(payload.scriptUrls.length).toBe(2);
    expect(payload.domIndicators[0]?.dataAttributes?.[0]).toContain("data-flexype");
    expect(payload.globalObjects).toContain("Shopify");
  });

  it("rejects legacy capability-only probe payloads", () => {
    expect(
      isStorefrontObservationSnapshot({
        kind: "StorefrontObservationProbe",
        url: "https://store.example/",
        documentReachable: true,
        metadataReachable: true,
        canTraverse: true,
        canQuery: true,
      }),
    ).toBe(false);
  });
});
