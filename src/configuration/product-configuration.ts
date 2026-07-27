import type { InvestigationId } from "../investigation/index.js";
import type { FlexyPeProductId } from "../detection/index.js";

/**
 * Optional Product Configuration state (Domain Model §6.4).
 */
export const ProductConfigurationState = {
  NotInScope: "NotInScope",
  Unavailable: "Unavailable",
  Available: "Available",
} as const;

export type ProductConfigurationState =
  (typeof ProductConfigurationState)[keyof typeof ProductConfigurationState];

/**
 * IO-010 / D-016 Product Configuration — optional adjunct (INV-008).
 * Absence is valid for the core path.
 */
export interface ProductConfiguration {
  readonly kind: "ProductConfiguration";
  readonly investigationId: InvestigationId;
  readonly productId: FlexyPeProductId;
  readonly state: ProductConfigurationState;
  /** Opaque readable configuration content when Available; shape Unknown (U-006). */
  readonly readableContent?: string;
}

export function createProductConfiguration(input: {
  readonly investigationId: InvestigationId;
  readonly productId: FlexyPeProductId;
  readonly state: ProductConfigurationState;
  readonly readableContent?: string;
}): ProductConfiguration {
  return Object.freeze({
    kind: "ProductConfiguration",
    investigationId: input.investigationId,
    productId: input.productId,
    state: input.state,
    ...(input.readableContent !== undefined
      ? { readableContent: input.readableContent }
      : {}),
  });
}
