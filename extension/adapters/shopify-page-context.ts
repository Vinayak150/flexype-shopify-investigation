/**
 * Shopify page-context extraction (extension boundary only).
 * Reads public Shopify globals from the page MAIN world via chrome.scripting.
 */
import {
  EMPTY_SHOPIFY_PAGE_SOURCES,
  type StorefrontShopifyPageSources,
} from "./storefront-observation.js";

function readStringProperty(source: unknown, key: string): string | undefined {
  if (source === null || source === undefined || typeof source !== "object") {
    return undefined;
  }

  const value = Reflect.get(source as object, key);
  if (typeof value === "string" && value.trim().length > 0) {
    return value.trim();
  }

  return undefined;
}

function serializeShopifyCurrency(
  currency: unknown,
): { readonly active: string } | undefined {
  if (currency === null || currency === undefined || typeof currency !== "object") {
    return undefined;
  }

  const active = readStringProperty(currency, "active");
  return active !== undefined ? Object.freeze({ active }) : undefined;
}

function serializeShopifyGlobal(shopify: unknown): Record<string, unknown> | undefined {
  if (shopify === null || shopify === undefined || typeof shopify !== "object") {
    return undefined;
  }

  const record = shopify as Record<string, unknown>;
  const theme = record.theme;
  let themePayload: Record<string, string> | undefined;

  if (theme !== null && theme !== undefined && typeof theme === "object") {
    const themeRecord = theme as Record<string, unknown>;
    const name = readStringProperty(themeRecord, "name");
    const schemaName = readStringProperty(themeRecord, "schema_name");
    themePayload = Object.freeze({
      ...(name !== undefined ? { name } : {}),
      ...(schemaName !== undefined ? { schema_name: schemaName } : {}),
    });
    if (Object.keys(themePayload).length === 0) {
      themePayload = undefined;
    }
  }

  const currency = serializeShopifyCurrency(record.currency);
  const payload = Object.freeze({
    ...(readStringProperty(record, "shop") !== undefined
      ? { shop: readStringProperty(record, "shop")! }
      : {}),
    ...(readStringProperty(record, "locale") !== undefined
      ? { locale: readStringProperty(record, "locale")! }
      : {}),
    ...(readStringProperty(record, "country") !== undefined
      ? { country: readStringProperty(record, "country")! }
      : {}),
    ...(currency !== undefined ? { currency } : {}),
    ...(themePayload !== undefined ? { theme: themePayload } : {}),
  });

  return Object.keys(payload).length > 0 ? payload : undefined;
}

function serializeShopifyAnalytics(
  shopifyAnalytics: unknown,
): Record<string, unknown> | undefined {
  if (
    shopifyAnalytics === null ||
    shopifyAnalytics === undefined ||
    typeof shopifyAnalytics !== "object"
  ) {
    return undefined;
  }

  const meta = Reflect.get(shopifyAnalytics as object, "meta");
  if (meta === null || meta === undefined || typeof meta !== "object") {
    return undefined;
  }

  const currency = readStringProperty(meta, "currency");
  if (currency === undefined) {
    return undefined;
  }

  return Object.freeze({
    meta: Object.freeze({
      currency,
    }),
  });
}

function serializeMetaGlobal(
  meta: unknown,
): Record<string, string | number | boolean> | undefined {
  if (meta === null || meta === undefined || typeof meta !== "object") {
    return undefined;
  }

  const payload: Record<string, string | number | boolean> = {};
  for (const [key, value] of Object.entries(meta as Record<string, unknown>)) {
    if (
      typeof value === "string" ||
      typeof value === "number" ||
      typeof value === "boolean"
    ) {
      payload[key] = value;
    }
  }

  return Object.keys(payload).length > 0 ? Object.freeze(payload) : undefined;
}

export function serializeShopifyPageSourcesFromGlobals(input: {
  readonly shopify?: unknown;
  readonly shopifyAnalytics?: unknown;
  readonly meta?: unknown;
}): StorefrontShopifyPageSources {
  const shopify = serializeShopifyGlobal(input.shopify);
  const shopifyAnalytics = serializeShopifyAnalytics(input.shopifyAnalytics);
  const meta = serializeMetaGlobal(input.meta);

  if (shopify === undefined && shopifyAnalytics === undefined && meta === undefined) {
    return EMPTY_SHOPIFY_PAGE_SOURCES;
  }

  return Object.freeze({
    ...(shopify !== undefined ? { shopify } : {}),
    ...(shopifyAnalytics !== undefined ? { shopifyAnalytics } : {}),
    ...(meta !== undefined ? { meta } : {}),
  });
}

/**
 * Self-contained MAIN-world extraction function for chrome.scripting.executeScript.
 * Must not reference module scope — Chrome serializes this function into the page.
 */
export function extractShopifyPageSourcesMainWorld(): StorefrontShopifyPageSources {
  const readString = (source: unknown, key: string): string | undefined => {
    if (source === null || source === undefined || typeof source !== "object") {
      return undefined;
    }

    const value = Reflect.get(source as object, key);
    if (typeof value === "string" && value.trim().length > 0) {
      return value.trim();
    }

    return undefined;
  };

  const serializeCurrency = (currency: unknown): { active: string } | undefined => {
    if (currency === null || currency === undefined || typeof currency !== "object") {
      return undefined;
    }

    const active = readString(currency, "active");
    return active !== undefined ? { active } : undefined;
  };

  const serializeShopify = (shopify: unknown): Record<string, unknown> | undefined => {
    if (shopify === null || shopify === undefined || typeof shopify !== "object") {
      return undefined;
    }

    const record = shopify as Record<string, unknown>;
    const theme = record.theme;
    let themePayload: Record<string, string> | undefined;

    if (theme !== null && theme !== undefined && typeof theme === "object") {
      const themeRecord = theme as Record<string, unknown>;
      const name = readString(themeRecord, "name");
      const schemaName = readString(themeRecord, "schema_name");
      themePayload = {
        ...(name !== undefined ? { name } : {}),
        ...(schemaName !== undefined ? { schema_name: schemaName } : {}),
      };
      if (Object.keys(themePayload).length === 0) {
        themePayload = undefined;
      }
    }

    const currency = serializeCurrency(record.currency);
    const payload = {
      ...(readString(record, "shop") !== undefined
        ? { shop: readString(record, "shop")! }
        : {}),
      ...(readString(record, "locale") !== undefined
        ? { locale: readString(record, "locale")! }
        : {}),
      ...(readString(record, "country") !== undefined
        ? { country: readString(record, "country")! }
        : {}),
      ...(currency !== undefined ? { currency } : {}),
      ...(themePayload !== undefined ? { theme: themePayload } : {}),
    };

    return Object.keys(payload).length > 0 ? payload : undefined;
  };

  const serializeAnalytics = (
    shopifyAnalytics: unknown,
  ): Record<string, unknown> | undefined => {
    if (
      shopifyAnalytics === null ||
      shopifyAnalytics === undefined ||
      typeof shopifyAnalytics !== "object"
    ) {
      return undefined;
    }

    const meta = Reflect.get(shopifyAnalytics as object, "meta");
    if (meta === null || meta === undefined || typeof meta !== "object") {
      return undefined;
    }

    const currency = readString(meta, "currency");
    if (currency === undefined) {
      return undefined;
    }

    return {
      meta: {
        currency,
      },
    };
  };

  const serializeMeta = (
    meta: unknown,
  ): Record<string, string | number | boolean> | undefined => {
    if (meta === null || meta === undefined || typeof meta !== "object") {
      return undefined;
    }

    const payload: Record<string, string | number | boolean> = {};
    for (const [key, value] of Object.entries(meta as Record<string, unknown>)) {
      if (
        typeof value === "string" ||
        typeof value === "number" ||
        typeof value === "boolean"
      ) {
        payload[key] = value;
      }
    }

    return Object.keys(payload).length > 0 ? payload : undefined;
  };

  const globalRecord = globalThis as Record<string, unknown>;
  const shopify = serializeShopify(globalRecord.Shopify);
  const shopifyAnalytics = serializeAnalytics(globalRecord.ShopifyAnalytics);
  const meta = serializeMeta(globalRecord.meta);

  if (shopify === undefined && shopifyAnalytics === undefined && meta === undefined) {
    return {};
  }

  return {
    ...(shopify !== undefined ? { shopify } : {}),
    ...(shopifyAnalytics !== undefined ? { shopifyAnalytics } : {}),
    ...(meta !== undefined ? { meta } : {}),
  };
}

function normalizePageSources(value: unknown): StorefrontShopifyPageSources {
  if (value === null || typeof value !== "object") {
    return EMPTY_SHOPIFY_PAGE_SOURCES;
  }

  const record = value as Record<string, unknown>;
  return serializeShopifyPageSourcesFromGlobals({
    ...(record.shopify !== undefined ? { shopify: record.shopify } : {}),
    ...(record.shopifyAnalytics !== undefined
      ? { shopifyAnalytics: record.shopifyAnalytics }
      : {}),
    ...(record.meta !== undefined ? { meta: record.meta } : {}),
  });
}

export function hasShopifyShop(sources: StorefrontShopifyPageSources): boolean {
  return readStringProperty(sources.shopify, "shop") !== undefined;
}

export function mergeShopifyPageSources(
  isolated: StorefrontShopifyPageSources,
  page: StorefrontShopifyPageSources,
): StorefrontShopifyPageSources {
  if (hasShopifyShop(isolated)) {
    return isolated;
  }

  const hasPageData =
    hasShopifyShop(page) ||
    page.shopifyAnalytics !== undefined ||
    page.meta !== undefined;

  if (!hasPageData) {
    return isolated;
  }

  return Object.freeze({
    ...(page.shopify !== undefined
      ? { shopify: page.shopify }
      : isolated.shopify !== undefined
        ? { shopify: isolated.shopify }
        : {}),
    ...(page.shopifyAnalytics !== undefined
      ? { shopifyAnalytics: page.shopifyAnalytics }
      : isolated.shopifyAnalytics !== undefined
        ? { shopifyAnalytics: isolated.shopifyAnalytics }
        : {}),
    ...(page.meta !== undefined
      ? { meta: page.meta }
      : isolated.meta !== undefined
        ? { meta: isolated.meta }
        : {}),
  });
}

export async function extractShopifyPageSourcesFromPageContext(
  tabId: number,
): Promise<StorefrontShopifyPageSources> {
  return new Promise((resolve) => {
    chrome.scripting.executeScript(
      {
        target: { tabId },
        world: "MAIN",
        func: extractShopifyPageSourcesMainWorld,
      },
      (results) => {
        if (chrome.runtime.lastError !== undefined) {
          resolve(EMPTY_SHOPIFY_PAGE_SOURCES);
          return;
        }

        const firstResult = results[0] as { result?: unknown } | undefined;
        resolve(normalizePageSources(firstResult?.result));
      },
    );
  });
}
