import { describe, expect, it } from "vitest";

import { projectPopupStoreInformation } from "../../extension/adapters/store-metadata-projection.js";
import {
  buildStorefrontMetadataFromShopifyGlobals,
  buildStorefrontMetadataSnapshot,
  classifyStorefrontPageType,
  parseShopifyAnalyticsCurrency,
  parseShopifyGlobal,
  resolveThemeName,
  StorefrontPageType,
} from "../../extension/adapters/store-metadata.js";

const LIVE_SHOPIFY = Object.freeze({
  shop: "aseem-shakti.myshopify.com",
  locale: "en",
  country: "IN",
  currency: Object.freeze({ active: "INR" }),
  theme: Object.freeze({ name: "Dawn" }),
});

const ZOURA_LIVE_SHOPIFY = Object.freeze({
  shop: "ahxrdn-ai.myshopify.com",
  locale: "en",
  country: "IN",
  currency: Object.freeze({ active: "INR" }),
  theme: Object.freeze({ name: "Dawn" }),
});

describe("store metadata collection", () => {
  it("extracts Shopify.shop on a custom domain storefront instead of the public hostname", () => {
    const metadata = buildStorefrontMetadataFromShopifyGlobals({
      pageUrl: "https://zouraofficial.com/",
      shopify: ZOURA_LIVE_SHOPIFY,
    });

    expect(metadata.shopifyDomain).toBe("ahxrdn-ai.myshopify.com");
    expect(metadata.shopifyDomain).not.toBe("zouraofficial.com");
    expect(metadata.baseCurrency).toBe("INR");
    expect(metadata.country).toBe("IN");
    expect(metadata.locale).toBe("en");
    expect(metadata.themeName).toBe("Dawn");
  });

  it("extracts live Shopify globals from aseem-shakti.myshopify.com", () => {
    const metadata = buildStorefrontMetadataFromShopifyGlobals({
      pageUrl: "https://aseemshakti.com/",
      shopify: LIVE_SHOPIFY,
    });

    expect(metadata.shopifyDomain).toBe("aseem-shakti.myshopify.com");
    expect(metadata.baseCurrency).toBe("INR");
    expect(metadata.country).toBe("IN");
    expect(metadata.locale).toBe("en");
    expect(metadata.themeName).toBe("Dawn");
  });

  it("uses Shopify.shop for Shopify Domain", () => {
    const shopifyGlobal = parseShopifyGlobal({
      shop: "demo.myshopify.com",
    });
    expect(shopifyGlobal).toBeDefined();

    const metadata = buildStorefrontMetadataSnapshot({
      pageUrl: "https://zouraofficial.com/",
      shopifyGlobal: shopifyGlobal!,
    });

    expect(metadata.shopifyDomain).toBe("demo.myshopify.com");
  });

  it("falls back to hostname when Shopify.shop is missing and never uses a full URL", () => {
    const metadata = buildStorefrontMetadataSnapshot({
      pageUrl: "https://zouraofficial.com/products/test",
    });

    expect(metadata.shopifyDomain).toBe("zouraofficial.com");
    expect(metadata.shopifyDomain).not.toMatch(/^https?:\/\//);
  });

  it("normalizes Shopify.shop when it is provided as a full URL", () => {
    const metadata = buildStorefrontMetadataSnapshot({
      pageUrl: "https://zouraofficial.com/",
      shopifyGlobal: parseShopifyGlobal({
        shop: "https://demo.myshopify.com/",
      })!,
    });

    expect(metadata.shopifyDomain).toBe("demo.myshopify.com");
  });

  it("uses Shopify.theme.name before schema_name for theme name", () => {
    const metadata = buildStorefrontMetadataSnapshot({
      pageUrl: "https://demo.myshopify.com/",
      shopifyGlobal: parseShopifyGlobal({
        shop: "demo.myshopify.com",
        theme: { name: "Dawn", schema_name: "Refresh" },
      })!,
    });

    expect(metadata.themeName).toBe("Dawn");
    expect(
      resolveThemeName({
        shopifyThemeName: "Dawn",
        shopifyThemeSchemaName: "Refresh",
      }),
    ).toBe("Dawn");
  });

  it("uses Shopify.theme.schema_name when theme name is missing", () => {
    const metadata = buildStorefrontMetadataSnapshot({
      pageUrl: "https://demo.myshopify.com/",
      shopifyGlobal: parseShopifyGlobal({
        shop: "demo.myshopify.com",
        theme: { schema_name: "Refresh" },
      })!,
    });

    expect(metadata.themeName).toBe("Refresh");
  });

  it("does not use theme asset URLs as theme names", () => {
    const themeAssetUrl = "https://cdn.shopify.com/s/files/1/theme/assets/theme.js?v=1";

    expect(
      resolveThemeName({
        shopifyThemeSchemaName: themeAssetUrl,
      }),
    ).toBeUndefined();
  });

  it("extracts currency from Shopify.currency.active", () => {
    const metadata = buildStorefrontMetadataSnapshot({
      pageUrl: "https://demo.myshopify.com/",
      shopifyGlobal: parseShopifyGlobal({
        shop: "demo.myshopify.com",
        currency: { active: "INR" },
      })!,
    });

    expect(metadata.baseCurrency).toBe("INR");
  });

  it("falls back to ShopifyAnalytics.meta.currency when Shopify.currency.active is missing", () => {
    expect(
      parseShopifyAnalyticsCurrency({
        meta: { currency: "INR" },
      }),
    ).toBe("INR");

    const metadata = buildStorefrontMetadataFromShopifyGlobals({
      pageUrl: "https://aseemshakti.com/",
      shopify: Object.freeze({
        shop: "aseem-shakti.myshopify.com",
        country: "IN",
        locale: "en",
      }),
      shopifyAnalytics: Object.freeze({
        meta: Object.freeze({ currency: "INR" }),
      }),
    });

    expect(metadata.baseCurrency).toBe("INR");
  });

  it("extracts locale from Shopify.locale with html lang fallback", () => {
    const fromShopify = buildStorefrontMetadataSnapshot({
      pageUrl: "https://demo.myshopify.com/",
      shopifyGlobal: parseShopifyGlobal({
        shop: "demo.myshopify.com",
        locale: "en-IN",
      })!,
    });

    expect(fromShopify.locale).toBe("en-IN");

    const fromDocument = buildStorefrontMetadataSnapshot({
      pageUrl: "https://aseemshakti.com/",
      documentLang: "en-IN",
    });

    expect(fromDocument.locale).toBe("en-IN");
  });

  it("extracts country only from Shopify.country", () => {
    expect(
      buildStorefrontMetadataSnapshot({
        pageUrl: "https://demo.myshopify.com/",
        shopifyGlobal: parseShopifyGlobal({
          shop: "demo.myshopify.com",
          country: "IN",
        })!,
      }).country,
    ).toBe("IN");

    expect(
      buildStorefrontMetadataSnapshot({
        pageUrl: "https://demo.myshopify.com/",
        shopifyGlobal: parseShopifyGlobal({
          shop: "demo.myshopify.com",
          locale: "en-IN",
        })!,
      }).country,
    ).toBeUndefined();

    expect(
      buildStorefrontMetadataSnapshot({
        pageUrl: "https://aseemshakti.com/",
        documentLang: "en-IN",
      }).country,
    ).toBeUndefined();
  });

  it("populates full metadata when Shopify global exists", () => {
    const shopifyGlobal = parseShopifyGlobal({
      shop: "demo.myshopify.com",
      currency: "INR",
      locale: "en-IN",
      country: "IN",
    });
    expect(shopifyGlobal).toBeDefined();

    const metadata = buildStorefrontMetadataSnapshot({
      pageUrl: "https://demo.myshopify.com/",
      shopifyGlobal: shopifyGlobal!,
    });

    expect(metadata.shopifyDomain).toBe("demo.myshopify.com");
    expect(metadata.baseCurrency).toBe("INR");
    expect(metadata.locale).toBe("en-IN");
    expect(metadata.country).toBe("IN");
    expect(metadata.storeUrl).toBe("https://demo.myshopify.com/");
  });

  it("classifies product URLs as Product page type", () => {
    expect(classifyStorefrontPageType("/products/test-product")).toBe(
      StorefrontPageType.Product,
    );

    const metadata = buildStorefrontMetadataSnapshot({
      pageUrl: "https://demo.myshopify.com/products/test-product",
    });

    expect(metadata.pageType).toBe(StorefrontPageType.Product);
  });

  it("classifies cart URLs as Cart page type", () => {
    expect(classifyStorefrontPageType("/cart")).toBe(StorefrontPageType.Cart);

    const metadata = buildStorefrontMetadataSnapshot({
      pageUrl: "https://demo.myshopify.com/cart",
    });

    expect(metadata.pageType).toBe(StorefrontPageType.Cart);
  });
});

describe("projectPopupStoreInformation metadata sanitization", () => {
  it("never displays a full URL as Shopify Domain", () => {
    const store = projectPopupStoreInformation({
      reportStore: {
        shopifyDomain: "https://zouraofficial.com/",
      },
      metadata: Object.freeze({
        pageType: StorefrontPageType.Home,
        shopifyDomain: "demo.myshopify.com",
      }),
    });

    expect(store.shopifyDomain).toBe("demo.myshopify.com");
  });

  it("sanitizes report fallback Shopify Domain URLs to hostname", () => {
    const store = projectPopupStoreInformation({
      reportStore: {
        shopifyDomain: "https://zouraofficial.com/",
        storeUrl: "https://zouraofficial.com/",
      },
      metadata: Object.freeze({
        pageType: StorefrontPageType.Home,
      }),
    });

    expect(store.shopifyDomain).toBe("zouraofficial.com");
  });

  it("shows Unknown for theme asset URLs from report fallback", () => {
    const store = projectPopupStoreInformation({
      reportStore: {
        themeName: "https://cdn.shopify.com/s/files/1/theme/assets/theme.js?v=1",
      },
      metadata: Object.freeze({
        pageType: StorefrontPageType.Home,
      }),
    });

    expect(store.themeName).toBe("Unknown");
  });

  it("shows live Shopify metadata in popup instead of Unknown", () => {
    const metadata = buildStorefrontMetadataFromShopifyGlobals({
      pageUrl: "https://aseemshakti.com/",
      shopify: LIVE_SHOPIFY,
    });

    const store = projectPopupStoreInformation({
      reportStore: {},
      metadata,
    });

    expect(store.shopifyDomain).toBe("aseem-shakti.myshopify.com");
    expect(store.baseCurrency).toBe("INR");
    expect(store.country).toBe("IN");
    expect(store.locale).toBe("en");
    expect(store.themeName).toBe("Dawn");
  });

  it("shows zoura Shopify.shop domain and store fields in popup", () => {
    const metadata = buildStorefrontMetadataFromShopifyGlobals({
      pageUrl: "https://zouraofficial.com/",
      shopify: ZOURA_LIVE_SHOPIFY,
    });

    const store = projectPopupStoreInformation({
      reportStore: {
        shopifyDomain: "https://zouraofficial.com/",
      },
      metadata,
    });

    expect(store.shopifyDomain).toBe("ahxrdn-ai.myshopify.com");
    expect(store.baseCurrency).toBe("INR");
    expect(store.country).toBe("IN");
    expect(store.locale).toBe("en");
    expect(store.themeName).toBe("Dawn");
  });
});
