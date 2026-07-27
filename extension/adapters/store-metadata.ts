/**
 * Storefront store metadata model (extension boundary only).
 */
export const StorefrontPageType = {
  Home: "Home",
  Product: "Product",
  Collection: "Collection",
  Cart: "Cart",
  Unknown: "Unknown",
} as const;

export type StorefrontPageType =
  (typeof StorefrontPageType)[keyof typeof StorefrontPageType];

export interface StorefrontMetadataSnapshot {
  readonly storeUrl?: string;
  readonly shopifyDomain?: string;
  readonly shopName?: string;
  readonly baseCurrency?: string;
  readonly country?: string;
  readonly locale?: string;
  readonly themeName?: string;
  readonly pageType: StorefrontPageType;
}

export interface ShopifyGlobalSnapshot {
  readonly shop?: string;
  readonly locale?: string;
  readonly country?: string;
  readonly currency?: string;
  readonly themeName?: string;
  readonly themeSchemaName?: string;
}

function readShopifyStringProperty(source: object, key: string): string | undefined {
  let value: unknown;
  try {
    value = Reflect.get(source, key);
  } catch {
    return undefined;
  }

  if (typeof value === "string") {
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : undefined;
  }

  return undefined;
}

function readShopifyObjectProperty(source: object, key: string): Record<string, unknown> | undefined {
  let value: unknown;
  try {
    value = Reflect.get(source, key);
  } catch {
    return undefined;
  }

  if (value !== null && typeof value === "object") {
    return value as Record<string, unknown>;
  }

  return undefined;
}

export function classifyStorefrontPageType(pathname: string): StorefrontPageType {
  const normalized = pathname.trim().length === 0 ? "/" : pathname;

  if (normalized === "/" || normalized === "/index.html") {
    return StorefrontPageType.Home;
  }

  if (/^\/products(?:\/|$)/i.test(normalized)) {
    return StorefrontPageType.Product;
  }

  if (/^\/collections(?:\/|$)/i.test(normalized)) {
    return StorefrontPageType.Collection;
  }

  if (/^\/cart(?:\/|$)/i.test(normalized)) {
    return StorefrontPageType.Cart;
  }

  return StorefrontPageType.Unknown;
}

export function isThemeAssetReference(value: string): boolean {
  const trimmed = value.trim();
  return (
    /^https?:\/\//i.test(trimmed) ||
    /\/assets\//i.test(trimmed) ||
    /\.js(?:\?|#|$)/i.test(trimmed)
  );
}

export function parseShopifyCurrency(value: unknown): string | undefined {
  if (typeof value === "string" && value.trim().length > 0) {
    return value.trim();
  }

  if (value !== null && typeof value === "object") {
    const active = Reflect.get(value as object, "active");
    if (typeof active === "string" && active.trim().length > 0) {
      return active.trim();
    }
  }

  return undefined;
}

export function parseShopifyAnalyticsCurrency(value: unknown): string | undefined {
  if (value === null || typeof value !== "object") {
    return undefined;
  }

  const meta = readShopifyObjectProperty(value, "meta");
  if (meta === undefined) {
    return undefined;
  }

  return readShopifyStringProperty(meta, "currency");
}

export function parseShopifyGlobal(value: unknown): ShopifyGlobalSnapshot | undefined {
  if (value === null || typeof value !== "object") {
    return undefined;
  }

  const shopify = value as object;
  const theme = readShopifyObjectProperty(shopify, "theme");
  const themeName =
    theme !== undefined ? readShopifyStringProperty(theme, "name") : undefined;
  const themeSchemaName =
    theme !== undefined ? readShopifyStringProperty(theme, "schema_name") : undefined;
  const currency = parseShopifyCurrency(Reflect.get(shopify, "currency"));

  const snapshot: ShopifyGlobalSnapshot = Object.freeze({
    ...(readShopifyStringProperty(shopify, "shop") !== undefined
      ? { shop: readShopifyStringProperty(shopify, "shop")! }
      : {}),
    ...(readShopifyStringProperty(shopify, "locale") !== undefined
      ? { locale: readShopifyStringProperty(shopify, "locale")! }
      : {}),
    ...(readShopifyStringProperty(shopify, "country") !== undefined
      ? { country: readShopifyStringProperty(shopify, "country")! }
      : {}),
    ...(currency !== undefined ? { currency } : {}),
    ...(themeName !== undefined ? { themeName } : {}),
    ...(themeSchemaName !== undefined ? { themeSchemaName } : {}),
  });

  if (
    snapshot.shop === undefined &&
    snapshot.locale === undefined &&
    snapshot.country === undefined &&
    snapshot.currency === undefined &&
    snapshot.themeName === undefined &&
    snapshot.themeSchemaName === undefined
  ) {
    return undefined;
  }

  return snapshot;
}

export function normalizeShopifyDomainCandidate(value: string | undefined): string | undefined {
  if (value === undefined || value.trim().length === 0) {
    return undefined;
  }

  const trimmed = value.trim();
  if (/^https?:\/\//i.test(trimmed)) {
    return safeParseUrl(trimmed)?.hostname;
  }

  if (trimmed.includes("/")) {
    const parsed = safeParseUrl(`https://${trimmed.replace(/^\/+/, "")}`);
    if (parsed?.hostname !== undefined) {
      return parsed.hostname;
    }
    return trimmed.split("/")[0];
  }

  return trimmed;
}

export function hostnameFromPageUrl(pageUrl: string): string | undefined {
  return safeParseUrl(pageUrl)?.hostname;
}

export function resolveShopifyDomain(input: {
  readonly shopifyShop?: string;
  readonly pageUrl: string;
  readonly shopifyGlobalProvided?: boolean;
}): string | undefined {
  const fromShop = normalizeShopifyDomainCandidate(input.shopifyShop);
  if (fromShop !== undefined) {
    return fromShop;
  }

  if (input.shopifyGlobalProvided === true) {
    return undefined;
  }

  return hostnameFromPageUrl(input.pageUrl);
}

export function resolveBaseCurrency(input: {
  readonly shopifyCurrency?: string;
  readonly analyticsCurrency?: string;
}): string | undefined {
  if (input.shopifyCurrency !== undefined && input.shopifyCurrency.trim().length > 0) {
    return input.shopifyCurrency.trim();
  }

  if (input.analyticsCurrency !== undefined && input.analyticsCurrency.trim().length > 0) {
    return input.analyticsCurrency.trim();
  }

  return undefined;
}

export function resolveLocale(input: {
  readonly shopifyLocale?: string;
  readonly documentLang?: string;
}): string | undefined {
  if (input.shopifyLocale !== undefined && input.shopifyLocale.trim().length > 0) {
    return input.shopifyLocale.trim();
  }

  if (input.documentLang !== undefined && input.documentLang.trim().length > 0) {
    return input.documentLang.trim();
  }

  return undefined;
}

export function resolveCountry(input: {
  readonly shopifyCountry?: string;
}): string | undefined {
  if (input.shopifyCountry !== undefined && input.shopifyCountry.trim().length > 0) {
    return input.shopifyCountry.trim();
  }

  return undefined;
}

export function resolveThemeName(input: {
  readonly shopifyThemeName?: string;
  readonly shopifyThemeSchemaName?: string;
}): string | undefined {
  if (input.shopifyThemeName !== undefined && input.shopifyThemeName.trim().length > 0) {
    const trimmed = input.shopifyThemeName.trim();
    if (!isThemeAssetReference(trimmed)) {
      return trimmed;
    }
  }

  if (
    input.shopifyThemeSchemaName !== undefined &&
    input.shopifyThemeSchemaName.trim().length > 0
  ) {
    const trimmed = input.shopifyThemeSchemaName.trim();
    if (!isThemeAssetReference(trimmed)) {
      return trimmed;
    }
  }

  return undefined;
}

export function buildStorefrontMetadataSnapshot(input: {
  readonly pageUrl: string;
  readonly canonicalUrl?: string;
  readonly pageTitle?: string;
  readonly shopify?: unknown;
  readonly shopifyGlobal?: ShopifyGlobalSnapshot;
  readonly shopifyAnalyticsCurrency?: string;
  readonly documentLang?: string;
}): StorefrontMetadataSnapshot {
  const parsedUrl = safeParseUrl(input.pageUrl);
  const storeUrl =
    input.canonicalUrl !== undefined && input.canonicalUrl.trim().length > 0
      ? input.canonicalUrl.trim()
      : parsedUrl?.href;

  const shopify =
    input.shopifyGlobal ??
    (input.shopify !== undefined ? parseShopifyGlobal(input.shopify) : undefined);
  const shopifyGlobalProvided =
    input.shopify !== undefined ||
    input.shopifyGlobal !== undefined;

  const shopifyDomain = resolveShopifyDomain({
    ...(shopify?.shop !== undefined ? { shopifyShop: shopify.shop } : {}),
    pageUrl: input.pageUrl,
    shopifyGlobalProvided,
  });
  const themeName = resolveThemeName({
    ...(shopify?.themeName !== undefined ? { shopifyThemeName: shopify.themeName } : {}),
    ...(shopify?.themeSchemaName !== undefined
      ? { shopifyThemeSchemaName: shopify.themeSchemaName }
      : {}),
  });
  const locale = resolveLocale({
    ...(shopify?.locale !== undefined ? { shopifyLocale: shopify.locale } : {}),
    ...(input.documentLang !== undefined ? { documentLang: input.documentLang } : {}),
  });
  const country = resolveCountry({
    ...(shopify?.country !== undefined ? { shopifyCountry: shopify.country } : {}),
  });
  const baseCurrency = resolveBaseCurrency({
    ...(shopify?.currency !== undefined ? { shopifyCurrency: shopify.currency } : {}),
    ...(input.shopifyAnalyticsCurrency !== undefined
      ? { analyticsCurrency: input.shopifyAnalyticsCurrency }
      : {}),
  });

  const shopName =
    input.pageTitle !== undefined && input.pageTitle.trim().length > 0
      ? input.pageTitle.trim()
      : shopify?.shop;

  return Object.freeze({
    pageType: classifyStorefrontPageType(parsedUrl?.pathname ?? "/"),
    ...(storeUrl !== undefined ? { storeUrl } : {}),
    ...(shopifyDomain !== undefined ? { shopifyDomain } : {}),
    ...(shopName !== undefined ? { shopName } : {}),
    ...(baseCurrency !== undefined ? { baseCurrency } : {}),
    ...(country !== undefined ? { country } : {}),
    ...(locale !== undefined ? { locale } : {}),
    ...(themeName !== undefined ? { themeName } : {}),
  });
}

export function buildStorefrontMetadataFromShopifyGlobals(input: {
  readonly pageUrl: string;
  readonly canonicalUrl?: string;
  readonly pageTitle?: string;
  readonly shopify?: unknown;
  readonly shopifyAnalytics?: unknown;
  readonly documentLang?: string;
}): StorefrontMetadataSnapshot {
  const shopifyGlobal =
    input.shopify !== undefined ? parseShopifyGlobal(input.shopify) : undefined;
  const shopifyAnalyticsCurrency =
    input.shopifyAnalytics !== undefined
      ? parseShopifyAnalyticsCurrency(input.shopifyAnalytics)
      : undefined;

  return buildStorefrontMetadataSnapshot({
    pageUrl: input.pageUrl,
    ...(input.canonicalUrl !== undefined ? { canonicalUrl: input.canonicalUrl } : {}),
    ...(input.pageTitle !== undefined ? { pageTitle: input.pageTitle } : {}),
    ...(input.shopify !== undefined ? { shopify: input.shopify } : {}),
    ...(shopifyGlobal !== undefined ? { shopifyGlobal } : {}),
    ...(shopifyAnalyticsCurrency !== undefined
      ? { shopifyAnalyticsCurrency }
      : {}),
    ...(input.documentLang !== undefined ? { documentLang: input.documentLang } : {}),
  });
}

function safeParseUrl(value: string): URL | undefined {
  try {
    return new URL(value);
  } catch {
    return undefined;
  }
}
