/// <reference lib="dom" />

/**
 * Storefront content script — observation bridge only.
 * Collects public storefront signals; must not detect products or create Evidence.
 */

const STOREFRONT_PROBE_MESSAGE = "FLEXYPE_STOREFRONT_PROBE";
const STOREFRONT_READY_MESSAGE = "FLEXYPE_STOREFRONT_READY";
const MAX_DOM_INDICATORS = 40;
const MAX_META_TAGS = 20;
const MAX_DISABLED_SNIPPETS = 20;
const FLEXY_DISABLED_SELECTORS = [
  "[id*='flexy' i]",
  "[class*='flexy' i]",
  "[data-flexy]",
  "[data-flexype]",
  "[data-flexy-type]",
  "[data-flexy-pass]",
];
const GLOBAL_CANDIDATES = [
  "Shopify",
  "flexype",
  "FlexyPe",
  "openFlexyCheckout",
  "flexypeMid",
  "flexypeRegion",
  "openFlexyPass",
  "flexyPassActive",
  "flexyPassUser",
  "flexyPassNewFlow",
  "flexyPassConsent",
  "ShopifyAnalytics",
  "theme",
];

function collectScriptUrls() {
  const urls = [];
  for (const script of Array.from(document.scripts)) {
    if (script.src && script.src.trim().length > 0) {
      urls.push(script.src);
    }
  }
  return urls;
}

function collectStylesheetUrls() {
  const urls = [];
  for (const sheet of Array.from(document.styleSheets)) {
    if (typeof sheet.href === "string" && sheet.href.trim().length > 0) {
      urls.push(sheet.href);
    }
  }
  return urls;
}

function isFlexyRelatedText(text: string) {
  return /flexype|flexy-pass|flexy-cart|flexycart|flexypass|data-flexy|data-flexype|flexy-btn/i.test(
    text,
  );
}

function elementObservationKey(element: Element) {
  return `${element.tagName}:${element.id}:${element.className}`;
}

function extractCommentedScriptReference(text: string) {
  const scriptMatch = text.match(/<script[^>]*src=["']([^"']+)["'][^>]*>/i);
  if (scriptMatch?.[1] !== undefined && isFlexyRelatedText(scriptMatch[1])) {
    return scriptMatch[1];
  }
  if (isFlexyRelatedText(text)) {
    return text.slice(0, 500);
  }
  return undefined;
}

function isFlexyRelatedElement(element: Element) {
  const attributes = Array.from(element.attributes)
    .map((attribute) => `${attribute.name}=${attribute.value}`)
    .join(" ");
  return isFlexyRelatedText(
    `${element.tagName} ${element.id} ${element.className} ${attributes}`,
  );
}

function getHiddenConcealment(element: HTMLElement) {
  if (element.hasAttribute("hidden")) {
    return "hidden-attribute";
  }
  if (element.getAttribute("aria-hidden") === "true") {
    return "aria-hidden";
  }
  const inlineStyle = element.getAttribute("style") ?? "";
  if (/display\s*:\s*none/i.test(inlineStyle)) {
    return "display-none";
  }
  return undefined;
}

function toDisabledElementIndicator(
  element: HTMLElement,
  concealment:
    "display-none" | "hidden-attribute" | "aria-hidden" | "disabled-attribute",
) {
  const dataAttributes = [];
  for (const attribute of Array.from(element.attributes)) {
    if (attribute.name.startsWith("data-")) {
      dataAttributes.push(`${attribute.name}=${attribute.value}`);
    }
  }

  const classes =
    typeof element.className === "string" && element.className.trim().length > 0
      ? element.className.trim().split(/\s+/).slice(0, 8)
      : undefined;

  return Object.freeze({
    tag: element.tagName.toLowerCase(),
    concealment,
    ...(element.id ? { id: element.id } : {}),
    ...(classes ? { classes } : {}),
    ...(dataAttributes.length > 0 ? { dataAttributes } : {}),
  });
}

function collectDisabledSignals() {
  const htmlComments: string[] = [];
  const commentedScripts: string[] = [];
  const hiddenFlexyElements = [];
  const disabledFlexyElements = [];
  const excludedDomKeys = new Set<string>();

  if (typeof document !== "undefined" && document.documentElement !== null) {
    const walker = document.createTreeWalker(
      document.documentElement,
      NodeFilter.SHOW_COMMENT,
    );
    let commentNode = walker.nextNode();
    while (commentNode !== null && htmlComments.length < MAX_DISABLED_SNIPPETS) {
      const text = (commentNode.textContent ?? "").trim();
      if (text.length > 0 && isFlexyRelatedText(text)) {
        htmlComments.push(text.slice(0, 500));
        const scriptRef = extractCommentedScriptReference(text);
        if (
          scriptRef !== undefined &&
          commentedScripts.length < MAX_DISABLED_SNIPPETS &&
          !commentedScripts.includes(scriptRef)
        ) {
          commentedScripts.push(scriptRef);
        }
      }
      commentNode = walker.nextNode();
    }
  }

  for (const script of Array.from(document.scripts)) {
    if (script.src && script.src.trim().length > 0) {
      continue;
    }
    const text = script.textContent ?? "";
    for (const line of text.split("\n")) {
      if (commentedScripts.length >= MAX_DISABLED_SNIPPETS) {
        break;
      }
      const trimmed = line.trim();
      if (
        /^\s*\/\//.test(trimmed) &&
        isFlexyRelatedText(trimmed) &&
        !commentedScripts.includes(trimmed)
      ) {
        commentedScripts.push(trimmed.slice(0, 500));
      }
    }
  }

  for (const selector of FLEXY_DISABLED_SELECTORS) {
    for (const element of Array.from(document.querySelectorAll(selector))) {
      if (!(element instanceof HTMLElement) || !isFlexyRelatedElement(element)) {
        continue;
      }

      const key = elementObservationKey(element);

      if (
        element.hasAttribute("disabled") ||
        (element instanceof HTMLButtonElement && element.disabled)
      ) {
        if (disabledFlexyElements.length < MAX_DISABLED_SNIPPETS) {
          disabledFlexyElements.push(
            toDisabledElementIndicator(element, "disabled-attribute"),
          );
        }
        excludedDomKeys.add(key);
        continue;
      }

      const concealment = getHiddenConcealment(element);
      if (
        concealment !== undefined &&
        hiddenFlexyElements.length < MAX_DISABLED_SNIPPETS
      ) {
        hiddenFlexyElements.push(toDisabledElementIndicator(element, concealment));
        excludedDomKeys.add(key);
      }
    }
  }

  return Object.freeze({
    htmlComments: Object.freeze(htmlComments),
    commentedScripts: Object.freeze(commentedScripts),
    hiddenFlexyElements: Object.freeze(hiddenFlexyElements),
    disabledFlexyElements: Object.freeze(disabledFlexyElements),
    excludedDomKeys,
  });
}

function collectDomIndicators(excludedDomKeys = new Set()) {
  const indicators = [];
  const selectors = [
    "[id]",
    "[class*='flexy' i]",
    "[class*='checkout' i]",
    "[data-flexype]",
    "[data-flexy]",
    "[data-shopify]",
    "script[src*='flexy' i]",
    "link[rel='stylesheet']",
  ];

  const seen = new Set();
  for (const selector of selectors) {
    if (indicators.length >= MAX_DOM_INDICATORS) {
      break;
    }
    for (const element of Array.from(document.querySelectorAll(selector))) {
      if (indicators.length >= MAX_DOM_INDICATORS) {
        break;
      }
      const key = `${element.tagName}:${element.id}:${element.className}`;
      if (seen.has(key) || excludedDomKeys.has(key)) {
        continue;
      }
      seen.add(key);

      const dataAttributes = [];
      for (const attribute of Array.from(element.attributes)) {
        if (attribute.name.startsWith("data-")) {
          dataAttributes.push(`${attribute.name}=${attribute.value}`);
        }
      }

      const classes =
        typeof element.className === "string" && element.className.trim().length > 0
          ? element.className.trim().split(/\s+/).slice(0, 8)
          : undefined;

      indicators.push(
        Object.freeze({
          tag: element.tagName.toLowerCase(),
          ...(element.id ? { id: element.id } : {}),
          ...(classes ? { classes } : {}),
          ...(dataAttributes.length > 0 ? { dataAttributes } : {}),
        }),
      );
    }
  }

  return indicators;
}

function collectGlobalObjects() {
  const present = [];
  const globalRecord = window as unknown as Record<string, unknown>;
  for (const name of GLOBAL_CANDIDATES) {
    if (
      Object.prototype.hasOwnProperty.call(globalRecord, name) &&
      globalRecord[name] !== undefined
    ) {
      present.push(name);
    }
  }
  return present;
}

function collectMetadata() {
  const titleElement = document.querySelector("title");
  const canonicalElement = document.querySelector("link[rel='canonical']");
  const metaTags = [];

  for (const meta of Array.from(document.querySelectorAll("meta")).slice(
    0,
    MAX_META_TAGS,
  )) {
    const name = meta.getAttribute("name") ?? undefined;
    const property = meta.getAttribute("property") ?? undefined;
    const content = meta.getAttribute("content") ?? "";
    if (content.trim().length === 0) {
      continue;
    }
    metaTags.push(
      Object.freeze({
        ...(name ? { name } : {}),
        ...(property ? { property } : {}),
        content,
      }),
    );
  }

  return Object.freeze({
    ...(titleElement && titleElement.textContent
      ? { title: titleElement.textContent.trim() }
      : {}),
    ...(canonicalElement instanceof HTMLLinkElement && canonicalElement.href
      ? { canonicalUrl: canonicalElement.href }
      : {}),
    metaTags: Object.freeze(metaTags),
  });
}

function collectThemeHints() {
  const hints = [];
  for (const link of Array.from(
    document.querySelectorAll("link[rel='stylesheet'], link[rel='preload']"),
  )) {
    if (!(link instanceof HTMLLinkElement) || !link.href) {
      continue;
    }
    if (/shopify|theme|assets/i.test(link.href)) {
      hints.push(`stylesheet:${link.href}`);
    }
  }

  for (const script of Array.from(document.scripts)) {
    if (script.src && /shopify|theme|assets/i.test(script.src)) {
      hints.push(`script:${script.src}`);
    }
  }

  const themeMeta = document.querySelector(
    "meta[name='theme-name'], meta[property='theme:name'], meta[name='shopify-theme-name']",
  );
  if (themeMeta instanceof HTMLMetaElement && themeMeta.content.trim().length > 0) {
    hints.push(`theme-name:${themeMeta.content.trim()}`);
  }

  return hints;
}

function classifyPageType(pathname: string) {
  const normalized = pathname.trim().length === 0 ? "/" : pathname;
  if (normalized === "/" || normalized === "/index.html") {
    return "Home";
  }
  if (/^\/products(?:\/|$)/i.test(normalized)) {
    return "Product";
  }
  if (/^\/collections(?:\/|$)/i.test(normalized)) {
    return "Collection";
  }
  if (/^\/cart(?:\/|$)/i.test(normalized)) {
    return "Cart";
  }
  return "Unknown";
}

function readStringProperty(source: unknown, key: string) {
  if (source === null || source === undefined || typeof source !== "object") {
    return undefined;
  }
  const value = (source as Record<string, unknown>)[key];
  if (typeof value === "string" && value.trim().length > 0) {
    return value.trim();
  }
  return undefined;
}

function serializeShopifyGlobal(shopify: unknown) {
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
    ...(record.currency !== undefined ? { currency: record.currency } : {}),
    ...(themePayload !== undefined ? { theme: themePayload } : {}),
  });

  return Object.keys(payload).length > 0 ? payload : undefined;
}

function serializeShopifyAnalytics(shopifyAnalytics: unknown) {
  if (
    shopifyAnalytics === null ||
    shopifyAnalytics === undefined ||
    typeof shopifyAnalytics !== "object"
  ) {
    return undefined;
  }

  const record = shopifyAnalytics as Record<string, unknown>;
  const meta = record.meta;
  if (meta === null || meta === undefined || typeof meta !== "object") {
    return undefined;
  }

  const currency = readStringProperty(meta as Record<string, unknown>, "currency");
  if (currency === undefined) {
    return undefined;
  }

  return Object.freeze({
    meta: Object.freeze({
      currency,
    }),
  });
}

function serializeMetaGlobal(meta: unknown) {
  if (meta === null || meta === undefined || typeof meta !== "object") {
    return undefined;
  }

  return meta;
}

function collectIsolatedShopifyPageSources(): {
  shopify?: unknown;
  shopifyAnalytics?: unknown;
  meta?: unknown;
} {
  const globalRecord = window as unknown as Record<string, unknown>;
  const shopify = serializeShopifyGlobal(globalRecord.Shopify);
  const shopifyAnalytics = serializeShopifyAnalytics(globalRecord.ShopifyAnalytics);
  const meta = serializeMetaGlobal(globalRecord.meta);

  if (shopify === undefined && shopifyAnalytics === undefined && meta === undefined) {
    return Object.freeze({});
  }

  return Object.freeze({
    ...(shopify !== undefined ? { shopify } : {}),
    ...(shopifyAnalytics !== undefined ? { shopifyAnalytics } : {}),
    ...(meta !== undefined ? { meta } : {}),
  });
}

function collectStoreMetadata(input: {
  shopify: unknown;
  shopifyAnalytics: unknown;
  meta: unknown;
  pageUrl: string;
  pageMetadata: ReturnType<typeof collectMetadata>;
  documentLang: string | undefined;
}) {
  const storeUrl =
    input.pageMetadata.canonicalUrl !== undefined &&
    input.pageMetadata.canonicalUrl.length > 0
      ? input.pageMetadata.canonicalUrl
      : input.pageUrl;
  const shopName =
    input.pageMetadata.title !== undefined && input.pageMetadata.title.length > 0
      ? input.pageMetadata.title
      : readStringProperty(input.shopify, "shop");

  return Object.freeze({
    pageType: classifyPageType(
      (() => {
        try {
          return new URL(input.pageUrl).pathname;
        } catch {
          return "/";
        }
      })(),
    ),
    ...(storeUrl ? { storeUrl } : {}),
    ...(shopName ? { shopName } : {}),
  });
}

function isDocumentObservationReady() {
  return (
    (document.readyState === "complete" || document.readyState === "interactive") &&
    document.body !== null
  );
}

function buildReadyResponse() {
  return Object.freeze({
    kind: "StorefrontObservationReady",
    ready: isDocumentObservationReady(),
    documentReadyState: document.readyState,
  });
}

function buildObservationSnapshot() {
  const hasDocument = typeof document !== "undefined";
  const documentReachable =
    hasDocument &&
    (document.readyState === "complete" || document.readyState === "interactive");
  const canTraverse = hasDocument && document.body !== null;
  const canQuery = hasDocument && typeof document.querySelector === "function";
  const metadataReachable =
    hasDocument &&
    document.querySelector("meta, title, link[rel='canonical']") !== null;
  const disabledCollection = canQuery ? collectDisabledSignals() : undefined;
  const disabledSignals = disabledCollection
    ? Object.freeze({
        htmlComments: disabledCollection.htmlComments,
        commentedScripts: disabledCollection.commentedScripts,
        hiddenFlexyElements: disabledCollection.hiddenFlexyElements,
        disabledFlexyElements: disabledCollection.disabledFlexyElements,
      })
    : Object.freeze({
        htmlComments: Object.freeze([]),
        commentedScripts: Object.freeze([]),
        hiddenFlexyElements: Object.freeze([]),
        disabledFlexyElements: Object.freeze([]),
      });
  const pageMetadata = collectMetadata();
  const pageUrl = window.location.href;
  const documentLang = document.documentElement.lang?.trim() || undefined;
  const shopifySources = collectIsolatedShopifyPageSources();

  return Object.freeze({
    kind: "StorefrontObservationSnapshot",
    url: pageUrl,
    documentReachable,
    metadataReachable,
    canTraverse,
    canQuery,
    scriptUrls: Object.freeze(collectScriptUrls()),
    stylesheetUrls: Object.freeze(collectStylesheetUrls()),
    domIndicators: Object.freeze(
      collectDomIndicators(disabledCollection?.excludedDomKeys ?? new Set()),
    ),
    globalObjects: Object.freeze(collectGlobalObjects()),
    metadata: pageMetadata,
    themeHints: Object.freeze(collectThemeHints()),
    shopifySources,
    ...(documentLang !== undefined ? { documentLang } : {}),
    storeMetadata: collectStoreMetadata({
      shopify: shopifySources.shopify,
      shopifyAnalytics: shopifySources.shopifyAnalytics,
      meta: shopifySources.meta,
      pageUrl,
      pageMetadata,
      documentLang,
    }),
    disabledSignals,
  });
}

const globalRecord = window as unknown as Record<string, unknown>;
if (globalRecord.__flexypeStorefrontAgentInstalled !== true) {
  globalRecord.__flexypeStorefrontAgentInstalled = true;

  chrome.runtime.onMessage.addListener((message: unknown, _sender, sendResponse) => {
    if (message === null || typeof message !== "object" || !("kind" in message)) {
      return false;
    }

    const kind = (message as { kind: unknown }).kind;

    if (kind === STOREFRONT_READY_MESSAGE) {
      sendResponse(buildReadyResponse());
      return true;
    }

    if (kind !== STOREFRONT_PROBE_MESSAGE) {
      return false;
    }

    sendResponse(buildObservationSnapshot());
    return true;
  });
}
