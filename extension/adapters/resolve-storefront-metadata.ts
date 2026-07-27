/**
 * Resolves storefront metadata from observation snapshots using canonical parsers.
 */
import {
  buildStorefrontMetadataFromShopifyGlobals,
  type StorefrontMetadataSnapshot,
} from "./store-metadata.js";
import type { StorefrontObservationSnapshot } from "./storefront-observation.js";

export function resolveStoreMetadataFromObservation(
  snapshot: StorefrontObservationSnapshot,
): StorefrontMetadataSnapshot {
  return buildStorefrontMetadataFromShopifyGlobals({
    pageUrl: snapshot.url,
    ...(snapshot.metadata.canonicalUrl !== undefined
      ? { canonicalUrl: snapshot.metadata.canonicalUrl }
      : {}),
    ...(snapshot.metadata.title !== undefined ? { pageTitle: snapshot.metadata.title } : {}),
    ...(snapshot.shopifySources.shopify !== undefined
      ? { shopify: snapshot.shopifySources.shopify }
      : {}),
    ...(snapshot.shopifySources.shopifyAnalytics !== undefined
      ? { shopifyAnalytics: snapshot.shopifySources.shopifyAnalytics }
      : {}),
    ...(snapshot.documentLang !== undefined ? { documentLang: snapshot.documentLang } : {}),
  });
}

export function enrichStorefrontObservationSnapshot(
  snapshot: StorefrontObservationSnapshot,
): StorefrontObservationSnapshot {
  return Object.freeze({
    ...snapshot,
    storeMetadata: resolveStoreMetadataFromObservation(snapshot),
  });
}
