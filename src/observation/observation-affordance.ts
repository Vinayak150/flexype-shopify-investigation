import type { InvestigationId, StorefrontTarget } from "../investigation/index.js";

/**
 * IO-002 Observation Affordance — Storefront available for public observation.
 * Not a conclusion; not Admin session.
 */
export interface ObservationAffordance {
  readonly kind: "ObservationAffordance";
  readonly investigationId: InvestigationId;
  readonly storefrontTarget: StorefrontTarget;
  /** True when public observation is conceptually available for collection. */
  readonly isPubliclyObservable: boolean;
}

export function createObservationAffordance(input: {
  readonly investigationId: InvestigationId;
  readonly storefrontTarget: StorefrontTarget;
  readonly isPubliclyObservable: boolean;
}): ObservationAffordance {
  return Object.freeze({
    kind: "ObservationAffordance",
    investigationId: input.investigationId,
    storefrontTarget: input.storefrontTarget,
    isPubliclyObservable: input.isPubliclyObservable,
  });
}
