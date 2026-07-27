/**
 * Closed FlexyPe product catalog (INV-007; C-011).
 */
export const FlexyPeProductId = {
  Checkout: "Checkout",
  FlexyPass: "FlexyPass",
  FlexyCart: "FlexyCart",
} as const;

export type FlexyPeProductId = (typeof FlexyPeProductId)[keyof typeof FlexyPeProductId];

export const FLEXYPE_PRODUCT_IDS: readonly FlexyPeProductId[] =
  Object.values(FlexyPeProductId);

/**
 * Assignment-listed Current Page kinds (U-004 exhaustiveness Open).
 */
export const CurrentPageKind = {
  Home: "Home",
  Product: "Product",
  Collection: "Collection",
  Cart: "Cart",
} as const;

export type CurrentPageKind = (typeof CurrentPageKind)[keyof typeof CurrentPageKind];

export const CURRENT_PAGE_KINDS: readonly CurrentPageKind[] =
  Object.values(CurrentPageKind);

export function isFlexyPeProductId(value: string): value is FlexyPeProductId {
  return (FLEXYPE_PRODUCT_IDS as readonly string[]).includes(value);
}

export function isCurrentPageKind(value: string): value is CurrentPageKind {
  return (CURRENT_PAGE_KINDS as readonly string[]).includes(value);
}
