import {
  FlexyPeProductId,
  isFlexyPeProductId,
  type FlexyPeProductId as FlexyPeProductIdType,
} from "../detection/index.js";
import {
  ConfigurationEngineErrorCode,
  throwConfigurationError,
} from "./engine-errors.js";

/**
 * Read-only Detection hint: which FlexyPe products were Detected.
 * Configuration must not alter Detection Results.
 */
export interface DetectedProductHint {
  readonly kind: "DetectedProductHint";
  readonly productId: FlexyPeProductIdType;
}

export function createDetectedProductHint(
  productId: FlexyPeProductIdType,
): DetectedProductHint {
  if (!isFlexyPeProductId(productId)) {
    throwConfigurationError(
      ConfigurationEngineErrorCode.InvalidProductHint,
      `Configuration accepts only closed FlexyPe product ids; got ${String(productId)}`,
    );
  }
  return Object.freeze({
    kind: "DetectedProductHint",
    productId,
  });
}

export function assertClosedProductHint(productId: string): FlexyPeProductIdType {
  if (
    productId !== FlexyPeProductId.Checkout &&
    productId !== FlexyPeProductId.FlexyPass &&
    productId !== FlexyPeProductId.FlexyCart
  ) {
    throwConfigurationError(
      ConfigurationEngineErrorCode.InvalidProductHint,
      `Rejected invented product id for Configuration: ${productId}`,
    );
  }
  return productId;
}
