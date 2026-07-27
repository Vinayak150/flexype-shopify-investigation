/**
 * Shared storefront observation snapshot types (extension boundary only).
 * Raw public signals — not Detection Results or Evidence.
 */

import type { StorefrontMetadataSnapshot } from "./store-metadata.js";

export const STOREFRONT_PROBE_MESSAGE = "FLEXYPE_STOREFRONT_PROBE" as const;
export const STOREFRONT_READY_MESSAGE = "FLEXYPE_STOREFRONT_READY" as const;

export interface StorefrontReadyResponse {
  readonly kind: "StorefrontObservationReady";
  readonly ready: boolean;
  readonly documentReadyState?: string;
}

export interface StorefrontDomIndicator {
  readonly tag: string;
  readonly id?: string;
  readonly classes?: readonly string[];
  readonly dataAttributes?: readonly string[];
}

export interface StorefrontMetaTag {
  readonly name?: string;
  readonly property?: string;
  readonly content: string;
}

export interface StorefrontDisabledElementIndicator {
  readonly tag: string;
  readonly id?: string;
  readonly classes?: readonly string[];
  readonly dataAttributes?: readonly string[];
  readonly concealment?:
    | "display-none"
    | "hidden-attribute"
    | "aria-hidden"
    | "disabled-attribute";
}

export interface StorefrontDisabledSignals {
  readonly commentedScripts: readonly string[];
  readonly htmlComments: readonly string[];
  readonly hiddenFlexyElements: readonly StorefrontDisabledElementIndicator[];
  readonly disabledFlexyElements: readonly StorefrontDisabledElementIndicator[];
}

export const EMPTY_DISABLED_SIGNALS: StorefrontDisabledSignals = Object.freeze({
  commentedScripts: Object.freeze([]),
  htmlComments: Object.freeze([]),
  hiddenFlexyElements: Object.freeze([]),
  disabledFlexyElements: Object.freeze([]),
});

export interface StorefrontShopifyPageSources {
  readonly shopify?: unknown;
  readonly shopifyAnalytics?: unknown;
  readonly meta?: unknown;
}

export const EMPTY_SHOPIFY_PAGE_SOURCES: StorefrontShopifyPageSources = Object.freeze({});

export interface StorefrontObservationSnapshot {
  readonly kind: "StorefrontObservationSnapshot";
  readonly url: string;
  readonly documentReachable: boolean;
  readonly metadataReachable: boolean;
  readonly canTraverse: boolean;
  readonly canQuery: boolean;
  readonly scriptUrls: readonly string[];
  readonly stylesheetUrls: readonly string[];
  readonly domIndicators: readonly StorefrontDomIndicator[];
  readonly globalObjects: readonly string[];
  readonly metadata: {
    readonly title?: string;
    readonly canonicalUrl?: string;
    readonly metaTags: readonly StorefrontMetaTag[];
  };
  readonly themeHints: readonly string[];
  readonly shopifySources: StorefrontShopifyPageSources;
  readonly documentLang?: string;
  readonly storeMetadata: StorefrontMetadataSnapshot;
  readonly disabledSignals: StorefrontDisabledSignals;
}

export interface StorefrontProbeRequest {
  readonly kind: typeof STOREFRONT_PROBE_MESSAGE;
}

export interface StorefrontReadyRequest {
  readonly kind: typeof STOREFRONT_READY_MESSAGE;
}

export function isStorefrontReadyResponse(value: unknown): value is StorefrontReadyResponse {
  return (
    value !== null &&
    typeof value === "object" &&
    (value as StorefrontReadyResponse).kind === "StorefrontObservationReady" &&
    typeof (value as StorefrontReadyResponse).ready === "boolean"
  );
}

export function isStorefrontObservationSnapshot(
  value: unknown,
): value is StorefrontObservationSnapshot {
  return (
    value !== null &&
    typeof value === "object" &&
    (value as StorefrontObservationSnapshot).kind === "StorefrontObservationSnapshot" &&
    typeof (value as StorefrontObservationSnapshot).storeMetadata === "object" &&
    (value as StorefrontObservationSnapshot).storeMetadata !== null &&
    typeof (value as StorefrontObservationSnapshot).shopifySources === "object" &&
    (value as StorefrontObservationSnapshot).shopifySources !== null &&
    typeof (value as StorefrontObservationSnapshot).disabledSignals === "object" &&
    (value as StorefrontObservationSnapshot).disabledSignals !== null
  );
}
