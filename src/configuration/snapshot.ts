import type { InvestigationId } from "../investigation/index.js";
import type { ConfigurationMetadata } from "./metadata.js";
import {
  createProductConfiguration,
  ProductConfigurationState,
  type ProductConfiguration,
  type ProductConfigurationState as ProductConfigurationStateType,
} from "./product-configuration.js";

/**
 * Immutable ConfigurationSnapshot (IO-010 family) after normalization.
 * Adjunct for Reporting only — not Evidence, not Detection Results.
 */
export interface ConfigurationSnapshot {
  readonly kind: "ConfigurationSnapshot";
  readonly investigationId: InvestigationId;
  readonly state: ProductConfigurationStateType;
  readonly items: readonly ProductConfiguration[];
  readonly metadata: ConfigurationMetadata;
}

export function createConfigurationSnapshot(input: {
  readonly investigationId: InvestigationId;
  readonly state: ProductConfigurationStateType;
  readonly items?: readonly ProductConfiguration[];
  readonly metadata: ConfigurationMetadata;
}): ConfigurationSnapshot {
  return Object.freeze({
    kind: "ConfigurationSnapshot",
    investigationId: input.investigationId,
    state: input.state,
    items: Object.freeze([...(input.items ?? [])]),
    metadata: input.metadata,
  });
}

/**
 * Reporting adjunct projection — Available items only.
 * Never invents Evidence or Detection outcomes.
 */
export function toReportingAdjunct(
  snapshot: ConfigurationSnapshot,
): readonly ProductConfiguration[] | undefined {
  if (snapshot.state !== ProductConfigurationState.Available) {
    return undefined;
  }
  if (snapshot.items.length === 0) {
    return undefined;
  }
  return snapshot.items;
}

export function createUnavailableSnapshot(
  investigationId: InvestigationId,
  metadata: ConfigurationMetadata,
  productIds: readonly ProductConfiguration["productId"][] = [],
): ConfigurationSnapshot {
  return createConfigurationSnapshot({
    investigationId,
    state: ProductConfigurationState.Unavailable,
    items: productIds.map((productId) =>
      createProductConfiguration({
        investigationId,
        productId,
        state: ProductConfigurationState.Unavailable,
      }),
    ),
    metadata,
  });
}

export function createNotInScopeSnapshot(
  investigationId: InvestigationId,
  metadata: ConfigurationMetadata,
): ConfigurationSnapshot {
  return createConfigurationSnapshot({
    investigationId,
    state: ProductConfigurationState.NotInScope,
    items: [],
    metadata,
  });
}
