import type { InvestigationId, StorefrontTarget } from "../investigation/index.js";
import type { ObservationIncompletenessMarker } from "./incompleteness.js";

/**
 * Discovery-only observability descriptors (IO-002 contents).
 * Not Detection Results; not Normalized Evidence (ADR-002).
 */
export interface ObservabilityDescriptors {
  readonly kind: "ObservabilityDescriptors";
  readonly documentReachable: boolean;
  readonly metadataReachable: boolean;
  readonly traversalCapable: boolean;
  readonly queryCapable: boolean;
  readonly incompletenessMarkers: readonly ObservationIncompletenessMarker[];
}

/**
 * IO-002 Observation Affordance — Storefront available for public observation.
 * Not a conclusion; not Admin session; does not store Detection Results.
 */
export interface ObservationAffordance {
  readonly kind: "ObservationAffordance";
  readonly investigationId: InvestigationId;
  readonly storefrontTarget: StorefrontTarget;
  /** True when public observation is conceptually available for collection. */
  readonly isPubliclyObservable: boolean;
  readonly descriptors: ObservabilityDescriptors;
}

export function createObservabilityDescriptors(input: {
  readonly documentReachable: boolean;
  readonly metadataReachable: boolean;
  readonly traversalCapable: boolean;
  readonly queryCapable: boolean;
  readonly incompletenessMarkers?: readonly ObservationIncompletenessMarker[];
}): ObservabilityDescriptors {
  return Object.freeze({
    kind: "ObservabilityDescriptors",
    documentReachable: input.documentReachable,
    metadataReachable: input.metadataReachable,
    traversalCapable: input.traversalCapable,
    queryCapable: input.queryCapable,
    incompletenessMarkers: Object.freeze([...(input.incompletenessMarkers ?? [])]),
  });
}

export function createObservationAffordance(input: {
  readonly investigationId: InvestigationId;
  readonly storefrontTarget: StorefrontTarget;
  readonly isPubliclyObservable: boolean;
  readonly descriptors: ObservabilityDescriptors;
}): ObservationAffordance {
  return Object.freeze({
    kind: "ObservationAffordance",
    investigationId: input.investigationId,
    storefrontTarget: input.storefrontTarget,
    isPubliclyObservable: input.isPubliclyObservable,
    descriptors: input.descriptors,
  });
}

export function affordanceHasIncompleteness(
  affordance: ObservationAffordance,
): boolean {
  return affordance.descriptors.incompletenessMarkers.length > 0;
}
