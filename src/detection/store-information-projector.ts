import type { InvestigationId } from "../investigation/index.js";
import type { NormalizedEvidence } from "../evidence/index.js";
import { EvidenceSignalClass } from "../evidence/index.js";
import { createStoreInformation, type StoreInformation } from "./store-information.js";
import { ThemeAvailability } from "./outcomes.js";

/**
 * Project Store Information (IO-003) from immutable Evidence only.
 * Available/Unavailable honesty for Theme; no Detected product semantics here.
 */
export function projectStoreInformation(
  investigationId: InvestigationId,
  evidence: NormalizedEvidence,
): StoreInformation {
  const hasThemeAssets = evidence.items.some(
    (item) => item.signalClass === EvidenceSignalClass.ShopifyThemeAssets,
  );
  const hasGlobals = evidence.items.some(
    (item) => item.signalClass === EvidenceSignalClass.GlobalBrowserObjects,
  );
  const hasPublicContext = evidence.items.some((item) =>
    item.observationSummary
      .toLowerCase()
      .includes("public storefront context available"),
  );

  const themeNameMarker = evidence.items
    .map((item) => item.observationSummary)
    .find((summary) => summary.startsWith("store.themeName:"));

  const storeUrlMarker = evidence.items
    .map((item) => item.observationSummary)
    .find((summary) => summary.startsWith("store.url:"));

  const shopNameMarker = evidence.items
    .map((item) => item.observationSummary)
    .find((summary) => summary.startsWith("store.shopName:"));

  const themeAvailability =
    hasThemeAssets || themeNameMarker !== undefined
      ? ThemeAvailability.Available
      : ThemeAvailability.Unavailable;

  const fallbackUrl = evidence.items[0]?.provenance.storefrontUrl;

  return createStoreInformation({
    investigationId,
    themeAvailability,
    ...(storeUrlMarker !== undefined
      ? { storeUrl: storeUrlMarker.slice("store.url:".length).trim() }
      : hasPublicContext && fallbackUrl !== undefined
        ? { storeUrl: fallbackUrl }
        : {}),
    ...(shopNameMarker !== undefined
      ? { shopName: shopNameMarker.slice("store.shopName:".length).trim() }
      : {}),
    ...(themeNameMarker !== undefined
      ? { themeName: themeNameMarker.slice("store.themeName:".length).trim() }
      : {}),
    ...(hasGlobals || hasPublicContext
      ? fallbackUrl !== undefined
        ? { shopifyDomain: fallbackUrl }
        : {}
      : {}),
  });
}
