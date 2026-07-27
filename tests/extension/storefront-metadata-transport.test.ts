import { describe, expect, it } from "vitest";

import { projectPopupStoreInformation } from "../../extension/adapters/store-metadata-projection.js";
import {
  enrichStorefrontObservationSnapshot,
  resolveStoreMetadataFromObservation,
} from "../../extension/adapters/resolve-storefront-metadata.js";
import { StorefrontPageType } from "../../extension/adapters/store-metadata.js";
import {
  EMPTY_DISABLED_SIGNALS,
  EMPTY_SHOPIFY_PAGE_SOURCES,
  type StorefrontObservationSnapshot,
} from "../../extension/adapters/storefront-observation.js";

const GENERIC_SHOPIFY = Object.freeze({
  shop: "2d3ae1-3.myshopify.com",
  locale: "en",
  country: "IN",
  currency: Object.freeze({ active: "INR" }),
  theme: Object.freeze({ name: "Gaurav's Version 2026" }),
});

function createObservationSnapshot(
  overrides: Partial<StorefrontObservationSnapshot> = {},
): StorefrontObservationSnapshot {
  return Object.freeze({
    kind: "StorefrontObservationSnapshot",
    url: "https://store.example/",
    documentReachable: true,
    metadataReachable: true,
    canTraverse: true,
    canQuery: true,
    scriptUrls: Object.freeze([]),
    stylesheetUrls: Object.freeze([]),
    domIndicators: Object.freeze([]),
    globalObjects: Object.freeze(["Shopify"]),
    metadata: Object.freeze({
      title: "Example Store",
      canonicalUrl: "https://store.example/",
      metaTags: Object.freeze([]),
    }),
    themeHints: Object.freeze([]),
    shopifySources: EMPTY_SHOPIFY_PAGE_SOURCES,
    storeMetadata: Object.freeze({
      pageType: StorefrontPageType.Home,
      storeUrl: "https://store.example/",
      shopName: "Example Store",
    }),
    disabledSignals: EMPTY_DISABLED_SIGNALS,
    ...overrides,
  });
}

describe("storefront metadata transport", () => {
  it("enriches observation snapshots with Shopify metadata from page sources", () => {
    const snapshot = createObservationSnapshot({
      shopifySources: Object.freeze({
        shopify: GENERIC_SHOPIFY,
      }),
    });

    const enriched = enrichStorefrontObservationSnapshot(snapshot);

    expect(enriched.storeMetadata.shopifyDomain).toBe("2d3ae1-3.myshopify.com");
    expect(enriched.storeMetadata.baseCurrency).toBe("INR");
    expect(enriched.storeMetadata.country).toBe("IN");
    expect(enriched.storeMetadata.locale).toBe("en");
    expect(enriched.storeMetadata.themeName).toBe("Gaurav's Version 2026");

    const popup = projectPopupStoreInformation({
      reportStore: {},
      metadata: enriched.storeMetadata,
    });

    expect(popup.shopifyDomain).toBe("2d3ae1-3.myshopify.com");
    expect(popup.baseCurrency).toBe("INR");
    expect(popup.country).toBe("IN");
    expect(popup.locale).toBe("en");
    expect(popup.themeName).toBe("Gaurav's Version 2026");
  });

  it("returns Unknown popup labels when Shopify sources are missing", () => {
    const metadata = resolveStoreMetadataFromObservation(
      createObservationSnapshot({
        shopifySources: EMPTY_SHOPIFY_PAGE_SOURCES,
      }),
    );

    const popup = projectPopupStoreInformation({
      reportStore: {},
      metadata,
    });

    expect(popup.shopifyDomain).toBe("store.example");
    expect(popup.baseCurrency).toBe("Unknown");
    expect(popup.country).toBe("Unknown");
    expect(popup.locale).toBe("Unknown");
    expect(popup.themeName).toBe("Unknown");
  });

  it("preserves available Shopify fields from partial page sources", () => {
    const metadata = resolveStoreMetadataFromObservation(
      createObservationSnapshot({
        shopifySources: Object.freeze({
          shopify: Object.freeze({
            shop: "demo-catalog.myshopify.com",
            country: "IN",
          }),
        }),
      }),
    );

    expect(metadata.shopifyDomain).toBe("demo-catalog.myshopify.com");
    expect(metadata.country).toBe("IN");
    expect(metadata.baseCurrency).toBeUndefined();
    expect(metadata.locale).toBeUndefined();
    expect(metadata.themeName).toBeUndefined();
  });
});
