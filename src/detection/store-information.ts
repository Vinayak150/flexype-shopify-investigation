import type { InvestigationId } from "../investigation/index.js";
import type { CurrentPageKind } from "./catalogs.js";
import type { ThemeAvailability } from "./outcomes.js";

/**
 * IO-003 / D-004 Store Information — Part 1 field bundle (may be partial).
 */
export interface StoreInformation {
  readonly kind: "StoreInformation";
  readonly investigationId: InvestigationId;
  readonly storeUrl?: string;
  readonly shopName?: string;
  readonly baseCurrency?: string;
  readonly country?: string;
  readonly locale?: string;
  readonly shopifyDomain?: string;
  readonly themeName?: string;
  readonly themeAvailability: ThemeAvailability;
  readonly currentPage?: CurrentPageKind;
}

export function createStoreInformation(input: {
  readonly investigationId: InvestigationId;
  readonly themeAvailability: ThemeAvailability;
  readonly storeUrl?: string;
  readonly shopName?: string;
  readonly baseCurrency?: string;
  readonly country?: string;
  readonly locale?: string;
  readonly shopifyDomain?: string;
  readonly themeName?: string;
  readonly currentPage?: CurrentPageKind;
}): StoreInformation {
  return Object.freeze({
    kind: "StoreInformation",
    investigationId: input.investigationId,
    themeAvailability: input.themeAvailability,
    ...(input.storeUrl !== undefined ? { storeUrl: input.storeUrl } : {}),
    ...(input.shopName !== undefined ? { shopName: input.shopName } : {}),
    ...(input.baseCurrency !== undefined ? { baseCurrency: input.baseCurrency } : {}),
    ...(input.country !== undefined ? { country: input.country } : {}),
    ...(input.locale !== undefined ? { locale: input.locale } : {}),
    ...(input.shopifyDomain !== undefined
      ? { shopifyDomain: input.shopifyDomain }
      : {}),
    ...(input.themeName !== undefined ? { themeName: input.themeName } : {}),
    ...(input.currentPage !== undefined ? { currentPage: input.currentPage } : {}),
  });
}
