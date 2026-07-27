import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { describe, expect, it, vi } from "vitest";

import {
  extractShopifyPageSourcesFromPageContext,
  extractShopifyPageSourcesMainWorld,
  mergeShopifyPageSources,
  serializeShopifyPageSourcesFromGlobals,
} from "../../extension/adapters/shopify-page-context.js";
import { EMPTY_SHOPIFY_PAGE_SOURCES } from "../../extension/adapters/storefront-observation.js";

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), "../..");
const storefrontAgentSource = readFileSync(
  join(repoRoot, "extension/content/storefront-agent.ts"),
  "utf8",
);

describe("shopify page context extraction", () => {
  it("returns serialized Shopify data from page globals", () => {
    const result = serializeShopifyPageSourcesFromGlobals({
      shopify: Object.freeze({
        shop: "demo-catalog.myshopify.com",
        locale: "en",
        country: "IN",
        currency: Object.freeze({ active: "INR" }),
        theme: Object.freeze({ name: "Demo Theme", schema_name: "demo-theme" }),
      }),
      shopifyAnalytics: Object.freeze({
        meta: Object.freeze({ currency: "INR" }),
      }),
      meta: Object.freeze({ page: "home" }),
    });

    expect(result.shopify).toEqual(
      Object.freeze({
        shop: "demo-catalog.myshopify.com",
        locale: "en",
        country: "IN",
        currency: Object.freeze({ active: "INR" }),
        theme: Object.freeze({ name: "Demo Theme", schema_name: "demo-theme" }),
      }),
    );
    expect(result.shopifyAnalytics).toEqual(
      Object.freeze({
        meta: Object.freeze({ currency: "INR" }),
      }),
    );
    expect(result.meta).toEqual(Object.freeze({ page: "home" }));
  });

  it("returns empty sources when Shopify globals are missing", () => {
    expect(serializeShopifyPageSourcesFromGlobals({})).toBe(EMPTY_SHOPIFY_PAGE_SOURCES);
    expect(extractShopifyPageSourcesMainWorld()).toEqual({});
  });

  it("extracts Shopify globals through the MAIN-world bridge function", () => {
    const previousShopify = Reflect.get(globalThis, "Shopify");
    const previousAnalytics = Reflect.get(globalThis, "ShopifyAnalytics");
    const previousMeta = Reflect.get(globalThis, "meta");

    Reflect.set(
      globalThis,
      "Shopify",
      Object.freeze({
        shop: "bridge-store.myshopify.com",
        locale: "en",
        country: "US",
        currency: Object.freeze({ active: "USD" }),
        theme: Object.freeze({ name: "Bridge Theme" }),
      }),
    );
    Reflect.set(
      globalThis,
      "ShopifyAnalytics",
      Object.freeze({
        meta: Object.freeze({ currency: "USD" }),
      }),
    );
    Reflect.set(globalThis, "meta", Object.freeze({ page: "product" }));

    try {
      const result = extractShopifyPageSourcesMainWorld();

      expect(result.shopify).toEqual(
        Object.freeze({
          shop: "bridge-store.myshopify.com",
          locale: "en",
          country: "US",
          currency: Object.freeze({ active: "USD" }),
          theme: Object.freeze({ name: "Bridge Theme" }),
        }),
      );
      expect(result.shopifyAnalytics).toEqual(
        Object.freeze({
          meta: Object.freeze({ currency: "USD" }),
        }),
      );
      expect(result.meta).toEqual(Object.freeze({ page: "product" }));
    } finally {
      if (previousShopify === undefined) {
        Reflect.deleteProperty(globalThis, "Shopify");
      } else {
        Reflect.set(globalThis, "Shopify", previousShopify);
      }

      if (previousAnalytics === undefined) {
        Reflect.deleteProperty(globalThis, "ShopifyAnalytics");
      } else {
        Reflect.set(globalThis, "ShopifyAnalytics", previousAnalytics);
      }

      if (previousMeta === undefined) {
        Reflect.deleteProperty(globalThis, "meta");
      } else {
        Reflect.set(globalThis, "meta", previousMeta);
      }
    }
  });

  it("uses chrome.scripting.executeScript with world MAIN", async () => {
    const executeScript = vi.fn(
      (
        injection: { target: { tabId: number }; world?: string; func?: () => unknown },
        callback: (results: Array<{ result?: unknown }>) => void,
      ) => {
        expect(injection.world).toBe("MAIN");
        expect(typeof injection.func).toBe("function");
        callback([
          {
            result: {
              shopify: {
                shop: "scripted-store.myshopify.com",
                locale: "en",
              },
            },
          },
        ]);
      },
    );

    vi.stubGlobal("chrome", {
      scripting: { executeScript },
      runtime: { lastError: undefined },
    });

    const result = await extractShopifyPageSourcesFromPageContext(42);

    expect(executeScript).toHaveBeenCalledWith(
      expect.objectContaining({
        target: { tabId: 42 },
        world: "MAIN",
      }),
      expect.any(Function),
    );
    expect(result.shopify).toEqual(
      Object.freeze({
        shop: "scripted-store.myshopify.com",
        locale: "en",
      }),
    );

    vi.unstubAllGlobals();
  });

  it("merges MAIN-world Shopify sources when isolated sources lack shop", () => {
    const merged = mergeShopifyPageSources(
      EMPTY_SHOPIFY_PAGE_SOURCES,
      Object.freeze({
        shopify: Object.freeze({
          shop: "merged-store.myshopify.com",
          country: "IN",
        }),
      }),
    );

    expect(merged.shopify).toEqual(
      Object.freeze({
        shop: "merged-store.myshopify.com",
        country: "IN",
      }),
    );
  });

  it("does not use inline script injection in the storefront content script", () => {
    expect(storefrontAgentSource).not.toContain(
      "collectShopifyPageSourcesFromPageContext",
    );
    expect(storefrontAgentSource).not.toContain("data-flexype-shopify-globals");
    expect(storefrontAgentSource).not.toMatch(
      /createElement\(\s*["']script["']\s*\)[\s\S]*textContent/,
    );
  });
});
