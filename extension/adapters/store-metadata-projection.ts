/**
 * Projects extension store metadata into popup-safe store information labels.
 */
import {
  hostnameFromPageUrl,
  isThemeAssetReference,
  normalizeShopifyDomainCandidate,
  type StorefrontMetadataSnapshot,
} from "./store-metadata.js";

export interface PopupStoreInformation {
  readonly storeUrl: string;
  readonly shopName: string;
  readonly baseCurrency: string;
  readonly country: string;
  readonly locale: string;
  readonly shopifyDomain: string;
  readonly themeName: string;
  readonly pageType: string;
}

export interface ReportStoreInformationLike {
  readonly storeUrl?: string;
  readonly shopName?: string;
  readonly baseCurrency?: string;
  readonly country?: string;
  readonly locale?: string;
  readonly shopifyDomain?: string;
  readonly themeName?: string;
  readonly currentPage?: string;
}

const UNKNOWN_LABEL = "Unknown";

function label(value: string | undefined): string {
  return value !== undefined && value.trim().length > 0 ? value.trim() : UNKNOWN_LABEL;
}

function sanitizeShopifyDomain(
  value: string | undefined,
  storeUrlFallback?: string,
): string | undefined {
  const normalized = normalizeShopifyDomainCandidate(value);
  if (normalized !== undefined) {
    return normalized;
  }

  if (storeUrlFallback !== undefined) {
    return hostnameFromPageUrl(storeUrlFallback);
  }

  return undefined;
}

function sanitizeThemeName(value: string | undefined): string | undefined {
  if (value === undefined || value.trim().length === 0) {
    return undefined;
  }

  const trimmed = value.trim();
  if (isThemeAssetReference(trimmed)) {
    return undefined;
  }

  return trimmed;
}

export function projectPopupStoreInformation(input: {
  readonly reportStore: ReportStoreInformationLike;
  readonly metadata?: StorefrontMetadataSnapshot;
}): PopupStoreInformation {
  const metadata = input.metadata;
  const reportStore = input.reportStore;
  const storeUrl = metadata?.storeUrl ?? reportStore.storeUrl;

  return Object.freeze({
    storeUrl: label(storeUrl),
    shopName: label(metadata?.shopName ?? reportStore.shopName),
    baseCurrency: label(metadata?.baseCurrency ?? reportStore.baseCurrency),
    country: label(metadata?.country ?? reportStore.country),
    locale: label(metadata?.locale ?? reportStore.locale),
    shopifyDomain: label(
      sanitizeShopifyDomain(
        metadata?.shopifyDomain ?? reportStore.shopifyDomain,
        storeUrl,
      ),
    ),
    themeName: label(
      sanitizeThemeName(metadata?.themeName ?? reportStore.themeName),
    ),
    pageType: label(metadata?.pageType ?? reportStore.currentPage),
  });
}
