import { describe, expect, it } from "vitest";

import { projectPopupStoreInformation } from "../../extension/adapters/store-metadata-projection.js";
import { StorefrontPageType } from "../../extension/adapters/store-metadata.js";

describe("projectPopupStoreInformation", () => {
  it("prefers observation metadata and fills Unknown for missing fields", () => {
    const store = projectPopupStoreInformation({
      reportStore: {},
      metadata: Object.freeze({
        pageType: StorefrontPageType.Product,
        storeUrl: "https://demo.myshopify.com/products/test",
        shopName: "Demo Shop",
        baseCurrency: "INR",
        country: "IN",
        locale: "en-IN",
        shopifyDomain: "demo.myshopify.com",
        themeName: "Dawn",
      }),
    });

    expect(store.storeUrl).toBe("https://demo.myshopify.com/products/test");
    expect(store.shopName).toBe("Demo Shop");
    expect(store.baseCurrency).toBe("INR");
    expect(store.country).toBe("IN");
    expect(store.locale).toBe("en-IN");
    expect(store.shopifyDomain).toBe("demo.myshopify.com");
    expect(store.themeName).toBe("Dawn");
    expect(store.pageType).toBe("Product");
  });

  it("uses Unknown labels when metadata and report fields are unavailable", () => {
    const store = projectPopupStoreInformation({
      reportStore: {},
      metadata: Object.freeze({
        pageType: StorefrontPageType.Unknown,
        storeUrl: "https://example.com/",
      }),
    });

    expect(store.storeUrl).toBe("https://example.com/");
    expect(store.shopName).toBe("Unknown");
    expect(store.themeName).toBe("Unknown");
    expect(store.shopifyDomain).toBe("example.com");
    expect(store.pageType).toBe("Unknown");
  });
});
