/**
 * Maps raw storefront observation snapshots to CollectableFact inputs.
 * Translates observable public signals; does not emit Detection outcomes.
 */
import { FlexyPeProductId } from "../../src/detection/catalogs.js";
import type { CollectableFact } from "../../src/evidence/collector.js";
import { EvidenceSignalClass } from "../../src/evidence/signal-class.js";
import { appendDisabledIntegrationFacts } from "./disabled-integration-facts.js";
import type { StorefrontObservationSnapshot } from "./storefront-observation.js";
import type { StorefrontMetadataSnapshot } from "./store-metadata.js";

const PRODUCT_MARKERS = Object.freeze({
  Checkout: Object.freeze([
    `flexype.product.${FlexyPeProductId.Checkout}`,
    `flexype.presence.${FlexyPeProductId.Checkout}`,
  ]),
  FlexyPass: Object.freeze([
    `flexype.product.${FlexyPeProductId.FlexyPass}`,
    `flexype.presence.${FlexyPeProductId.FlexyPass}`,
  ]),
  FlexyCart: Object.freeze([
    `flexype.product.${FlexyPeProductId.FlexyCart}`,
    `flexype.presence.${FlexyPeProductId.FlexyCart}`,
  ]),
});

const CHECKOUT_HINTS = [/checkout/i, /flexycheckout/i];
const PASS_HINTS = [/flexypass/i, /flexy-pass/i];
const CART_HINTS = [/flexycart/i, /flexy-cart/i, /flexcart/i];
const FLEXYPE_HINT = /flexype/i;

const FLEXYPE_SDK_URL_PATTERNS = Object.freeze([
  /flexype\.in/i,
  /flexype-v2/i,
  /static\.flexype/i,
  /flexype\.net/i,
]);

const FLEXYPE_CHECKOUT_GLOBALS = Object.freeze(
  new Set(["flexype", "openflexycheckout", "flexypemid", "flexyperegion"]),
);

const FLEXYPE_PASS_GLOBALS = Object.freeze(
  new Set([
    "openflexypass",
    "flexypassactive",
    "flexypassuser",
    "flexypassnewflow",
    "flexypassconsent",
  ]),
);

function appendMarkers(summary: string, markers: readonly string[]): string {
  if (markers.length === 0) {
    return summary;
  }
  return `${summary}; ${markers.join(" ")}`;
}

function markersAlreadyPresent(text: string, markers: readonly string[]): readonly string[] {
  return markers.filter((marker) => text.includes(marker));
}

function addCheckoutMarkers(found: Set<string>): void {
  for (const marker of PRODUCT_MARKERS.Checkout) {
    found.add(marker);
  }
}

function addFlexyPassMarkers(found: Set<string>): void {
  for (const marker of PRODUCT_MARKERS.FlexyPass) {
    found.add(marker);
  }
}

function isFlexyPeSdkAssetUrl(text: string): boolean {
  return FLEXYPE_SDK_URL_PATTERNS.some((pattern) => pattern.test(text));
}

function isFlexyPassAssetUrl(text: string): boolean {
  if (/flexypass/i.test(text)) {
    return true;
  }

  return /pass\.min\.js/i.test(text) && /flexypass|flexy-pass/i.test(text);
}

function hasFlexyCheckoutBranding(text: string): boolean {
  if (/flexy-btn/i.test(text)) {
    return true;
  }
  if (/data-flexy-type(?:=|:|\s|"|')checkout/i.test(text)) {
    return true;
  }
  if (/flexy[\s_-]*checkout/i.test(text)) {
    return true;
  }
  return false;
}

function hasFlexyPassBranding(text: string): boolean {
  if (/data-flexy-pass/i.test(text)) {
    return true;
  }
  if (/flexy-pass-wrapper/i.test(text)) {
    return true;
  }
  if (/flexy-pass-header-wrapper/i.test(text)) {
    return true;
  }
  if (/flexy-pass-sidebar-wrapper/i.test(text)) {
    return true;
  }
  return false;
}

function inferMarkersFromText(text: string): readonly string[] {
  const found = new Set<string>();

  for (const marker of markersAlreadyPresent(text, Object.values(PRODUCT_MARKERS).flat())) {
    found.add(marker);
  }

  if (PASS_HINTS.some((pattern) => pattern.test(text))) {
    addFlexyPassMarkers(found);
  }

  if (!FLEXYPE_HINT.test(text)) {
    return Object.freeze([...found]);
  }

  if (CHECKOUT_HINTS.some((pattern) => pattern.test(text))) {
    addCheckoutMarkers(found);
  }
  if (CART_HINTS.some((pattern) => pattern.test(text))) {
    for (const marker of PRODUCT_MARKERS.FlexyCart) {
      found.add(marker);
    }
  }

  return Object.freeze([...found]);
}

function inferScriptUrlMarkers(scriptUrl: string): readonly string[] {
  const found = new Set<string>(inferMarkersFromText(scriptUrl));

  if (isFlexyPeSdkAssetUrl(scriptUrl)) {
    addCheckoutMarkers(found);
  }

  if (isFlexyPassAssetUrl(scriptUrl)) {
    addFlexyPassMarkers(found);
  }

  return Object.freeze([...found]);
}

function inferDomMarkers(text: string): readonly string[] {
  const found = new Set<string>(inferMarkersFromText(text));

  if (hasFlexyCheckoutBranding(text)) {
    addCheckoutMarkers(found);
  }

  if (hasFlexyPassBranding(text)) {
    addFlexyPassMarkers(found);
  }

  return Object.freeze([...found]);
}

function inferGlobalObjectMarkers(globalName: string): readonly string[] {
  if (FLEXYPE_CHECKOUT_GLOBALS.has(globalName.toLowerCase())) {
    return PRODUCT_MARKERS.Checkout;
  }

  if (FLEXYPE_PASS_GLOBALS.has(globalName.toLowerCase())) {
    return PRODUCT_MARKERS.FlexyPass;
  }

  return inferMarkersFromText(globalName);
}

function domIndicatorText(indicator: StorefrontObservationSnapshot["domIndicators"][number]): string {
  return [
    indicator.tag,
    indicator.id ?? "",
    ...(indicator.classes ?? []),
    ...(indicator.dataAttributes ?? []),
  ].join(" ");
}

function appendStoreMetadataFacts(
  facts: CollectableFact[],
  storeMetadata: StorefrontMetadataSnapshot,
): void {
  if (storeMetadata.storeUrl !== undefined && storeMetadata.storeUrl.trim().length > 0) {
    facts.push({
      signalClass: EvidenceSignalClass.GlobalBrowserObjects,
      observationSummary: `store.url: ${storeMetadata.storeUrl.trim()}`,
      sourceRef: "content.storeMetadata.storeUrl",
    });
  }

  if (storeMetadata.shopName !== undefined && storeMetadata.shopName.trim().length > 0) {
    facts.push({
      signalClass: EvidenceSignalClass.ShopifyThemeAssets,
      observationSummary: `store.shopName: ${storeMetadata.shopName.trim()}`,
      sourceRef: "content.storeMetadata.shopName",
    });
  }

  if (storeMetadata.shopifyDomain !== undefined && storeMetadata.shopifyDomain.trim().length > 0) {
    facts.push({
      signalClass: EvidenceSignalClass.GlobalBrowserObjects,
      observationSummary: `store.shopifyDomain: ${storeMetadata.shopifyDomain.trim()}`,
      sourceRef: "content.storeMetadata.shopifyDomain",
    });
  }

  if (storeMetadata.baseCurrency !== undefined && storeMetadata.baseCurrency.trim().length > 0) {
    facts.push({
      signalClass: EvidenceSignalClass.GlobalBrowserObjects,
      observationSummary: `store.baseCurrency: ${storeMetadata.baseCurrency.trim()}`,
      sourceRef: "content.storeMetadata.baseCurrency",
    });
  }

  if (storeMetadata.country !== undefined && storeMetadata.country.trim().length > 0) {
    facts.push({
      signalClass: EvidenceSignalClass.GlobalBrowserObjects,
      observationSummary: `store.country: ${storeMetadata.country.trim()}`,
      sourceRef: "content.storeMetadata.country",
    });
  }

  if (storeMetadata.locale !== undefined && storeMetadata.locale.trim().length > 0) {
    facts.push({
      signalClass: EvidenceSignalClass.GlobalBrowserObjects,
      observationSummary: `store.locale: ${storeMetadata.locale.trim()}`,
      sourceRef: "content.storeMetadata.locale",
    });
  }

  if (storeMetadata.themeName !== undefined && storeMetadata.themeName.trim().length > 0) {
    facts.push({
      signalClass: EvidenceSignalClass.ShopifyThemeAssets,
      observationSummary: `store.themeName: ${storeMetadata.themeName.trim()}`,
      sourceRef: "content.storeMetadata.themeName",
    });
  }

  facts.push({
    signalClass: EvidenceSignalClass.HtmlStructure,
    observationSummary: `store.currentPage: ${storeMetadata.pageType}`,
    sourceRef: "content.storeMetadata.pageType",
  });
}

export function mapStorefrontSnapshotToFacts(
  snapshot: StorefrontObservationSnapshot,
): readonly CollectableFact[] {
  const facts: CollectableFact[] = [];

  for (const scriptUrl of snapshot.scriptUrls) {
    if (scriptUrl.trim().length === 0) {
      continue;
    }
    const markers = inferScriptUrlMarkers(scriptUrl);
    facts.push({
      signalClass: EvidenceSignalClass.ScriptUrls,
      observationSummary: appendMarkers(`script src: ${scriptUrl}`, markers),
      sourceRef: `content.scripts.src:${scriptUrl}`,
    });
    facts.push({
      signalClass: EvidenceSignalClass.LoadedJavaScriptAssets,
      observationSummary: appendMarkers(`loaded javascript asset: ${scriptUrl}`, markers),
      sourceRef: `content.scripts.asset:${scriptUrl}`,
    });
  }

  for (const stylesheetUrl of snapshot.stylesheetUrls) {
    if (stylesheetUrl.trim().length === 0) {
      continue;
    }
    const markers = inferMarkersFromText(stylesheetUrl);
    facts.push({
      signalClass: EvidenceSignalClass.ShopifyThemeAssets,
      observationSummary: appendMarkers(`stylesheet href: ${stylesheetUrl}`, markers),
      sourceRef: `content.stylesheets.href:${stylesheetUrl}`,
    });
  }

  for (const themeHint of snapshot.themeHints) {
    if (themeHint.trim().length === 0) {
      continue;
    }
    facts.push({
      signalClass: EvidenceSignalClass.ShopifyThemeAssets,
      observationSummary: `theme hint: ${themeHint}`,
      sourceRef: `content.themeHint:${themeHint}`,
    });
  }

  for (const globalName of snapshot.globalObjects) {
    const markers = inferGlobalObjectMarkers(globalName);
    facts.push({
      signalClass: EvidenceSignalClass.GlobalBrowserObjects,
      observationSummary: appendMarkers(`global object present: ${globalName}`, markers),
      sourceRef: `content.window.${globalName}`,
    });
  }

  for (const indicator of snapshot.domIndicators) {
    const text = domIndicatorText(indicator);
    const markers = inferDomMarkers(text);
    facts.push({
      signalClass: EvidenceSignalClass.DomElements,
      observationSummary: appendMarkers(`dom indicator: ${text}`, markers),
      sourceRef: `content.dom:${indicator.tag}${indicator.id !== undefined ? `#${indicator.id}` : ""}`,
    });
    facts.push({
      signalClass: EvidenceSignalClass.HtmlStructure,
      observationSummary: appendMarkers(`html structure indicator: ${text}`, markers),
      sourceRef: `content.html:${indicator.tag}`,
    });
  }

  if (snapshot.metadata.title !== undefined && snapshot.metadata.title.length > 0) {
    facts.push({
      signalClass: EvidenceSignalClass.ShopifyThemeAssets,
      observationSummary: `page title: ${snapshot.metadata.title}`,
      sourceRef: "content.metadata.title",
    });
  }

  if (snapshot.metadata.canonicalUrl !== undefined && snapshot.metadata.canonicalUrl.length > 0) {
    facts.push({
      signalClass: EvidenceSignalClass.GlobalBrowserObjects,
      observationSummary: `store.url: ${snapshot.metadata.canonicalUrl}`,
      sourceRef: "content.metadata.canonical",
    });
  }

  for (const metaTag of snapshot.metadata.metaTags) {
    const label = metaTag.name ?? metaTag.property ?? "meta";
    const markers = inferMarkersFromText(metaTag.content);
    facts.push({
      signalClass: EvidenceSignalClass.HtmlStructure,
      observationSummary: appendMarkers(`meta ${label}: ${metaTag.content}`, markers),
      sourceRef: `content.metadata.meta:${label}`,
    });
  }

  const themeNameHint = snapshot.themeHints.find((hint) => hint.startsWith("theme-name:"));
  if (themeNameHint !== undefined) {
    facts.push({
      signalClass: EvidenceSignalClass.ShopifyThemeAssets,
      observationSummary: `store.themeName: ${themeNameHint.slice("theme-name:".length).trim()}`,
      sourceRef: "content.theme.name",
    });
  }

  if (snapshot.documentReachable && snapshot.metadataReachable) {
    facts.push({
      signalClass: EvidenceSignalClass.NetworkRequests,
      observationSummary: "public storefront document and metadata observable",
      sourceRef: "content.snapshot.networkContext",
    });
  }

  appendStoreMetadataFacts(facts, snapshot.storeMetadata);
  appendDisabledIntegrationFacts(facts, snapshot.disabledSignals);

  return Object.freeze(facts);
}
