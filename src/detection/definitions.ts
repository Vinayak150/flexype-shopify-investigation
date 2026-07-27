import {
  EvidenceSignalClass,
  type EvidenceSignalClass as EvidenceSignalClassType,
} from "../evidence/index.js";
import {
  FlexyPeProductId,
  FLEXYPE_PRODUCT_IDS,
  type FlexyPeProductId as FlexyPeProductIdType,
} from "./catalogs.js";
import { DetectionEngineErrorCode, throwDetectionError } from "./engine-errors.js";

/**
 * Architectural detection definition (ADR-003).
 * Expresses meaning + required Evidence signal-class corroboration.
 * Not CSS selectors / DOM paths as architectural truth.
 */
export interface ProductPresenceDefinition {
  readonly kind: "ProductPresenceDefinition";
  readonly definitionId: string;
  readonly productId: FlexyPeProductIdType;
  /** Minimum distinct Evidence Signal Classes required for Detected (multi-signal). */
  readonly minDistinctSignalClasses: number;
  readonly candidateSignalClasses: readonly EvidenceSignalClassType[];
  /**
   * Architectural presence markers that Evidence summaries may carry.
   * Not selectors; mechanisms may evolve without changing this meaning.
   */
  readonly presenceMarkers: readonly string[];
}

export interface DisabledIntegrationDefinition {
  readonly kind: "DisabledIntegrationDefinition";
  readonly definitionId: string;
  readonly productId: FlexyPeProductIdType;
  readonly minDistinctSignalClasses: number;
  readonly candidateSignalClasses: readonly EvidenceSignalClassType[];
  readonly disabledMarkers: readonly string[];
}

export interface DetectionDefinitionRegistry {
  readonly products: readonly ProductPresenceDefinition[];
  readonly disabledIntegrations: readonly DisabledIntegrationDefinition[];
}

const MULTI_SIGNAL_CANDIDATES: readonly EvidenceSignalClassType[] = [
  EvidenceSignalClass.LoadedJavaScriptAssets,
  EvidenceSignalClass.ScriptUrls,
  EvidenceSignalClass.DomElements,
  EvidenceSignalClass.HtmlStructure,
  EvidenceSignalClass.GlobalBrowserObjects,
  EvidenceSignalClass.NetworkRequests,
  EvidenceSignalClass.ShopifyThemeAssets,
];

function productDefinition(productId: FlexyPeProductIdType): ProductPresenceDefinition {
  return Object.freeze({
    kind: "ProductPresenceDefinition",
    definitionId: `def.flexype.product.${productId}`,
    productId,
    minDistinctSignalClasses: 2,
    candidateSignalClasses: MULTI_SIGNAL_CANDIDATES,
    presenceMarkers: Object.freeze([
      `flexype.product.${productId}`,
      `flexype.presence.${productId}`,
    ]),
  });
}

function disabledDefinition(
  productId: FlexyPeProductIdType,
): DisabledIntegrationDefinition {
  return Object.freeze({
    kind: "DisabledIntegrationDefinition",
    definitionId: `def.flexype.disabled.${productId}`,
    productId,
    minDistinctSignalClasses: 2,
    candidateSignalClasses: MULTI_SIGNAL_CANDIDATES,
    disabledMarkers: Object.freeze([
      `flexype.disabled.${productId}`,
      `flexype.integration.disabled.${productId}`,
    ]),
  });
}

/**
 * Approved closed FlexyPe definition registry (C-011).
 * Rejects additional product ids.
 */
export function createDefaultDefinitionRegistry(): DetectionDefinitionRegistry {
  return Object.freeze({
    products: Object.freeze(
      FLEXYPE_PRODUCT_IDS.map((productId) => productDefinition(productId)),
    ),
    disabledIntegrations: Object.freeze(
      FLEXYPE_PRODUCT_IDS.map((productId) => disabledDefinition(productId)),
    ),
  });
}

export function assertClosedProductCatalog(productId: string): FlexyPeProductIdType {
  if (
    productId !== FlexyPeProductId.Checkout &&
    productId !== FlexyPeProductId.FlexyPass &&
    productId !== FlexyPeProductId.FlexyCart
  ) {
    throwDetectionError(
      DetectionEngineErrorCode.InvalidProductCatalog,
      `FlexyPe product catalog is closed; rejected: ${productId}`,
    );
  }
  return productId;
}

/**
 * Guard: a product definition that relies on a single signal class as sole basis
 * is architecturally invalid (C-004; C-005; ADR-003).
 */
export function assertMultiSignalDefinition(
  definition: ProductPresenceDefinition | DisabledIntegrationDefinition,
): void {
  if (definition.minDistinctSignalClasses < 2) {
    throwDetectionError(
      DetectionEngineErrorCode.InvalidProductCatalog,
      `${definition.definitionId} must require at least 2 distinct signal classes`,
    );
  }
  if (definition.candidateSignalClasses.length < 2) {
    throwDetectionError(
      DetectionEngineErrorCode.InvalidProductCatalog,
      `${definition.definitionId} must list multiple candidate signal classes`,
    );
  }
}
