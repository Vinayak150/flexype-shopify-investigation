import type { InvestigationId, StorefrontTarget } from "../investigation/index.js";

/**
 * Report identity metadata (episode context only).
 * Must not carry live browser handles or mutable Evidence snapshots.
 */
export interface ReportMetadata {
  readonly kind: "ReportMetadata";
  readonly investigationId: InvestigationId;
  readonly storefrontTarget: StorefrontTarget;
  readonly assembledAtIso: string;
}

export function createReportMetadata(input: {
  readonly investigationId: InvestigationId;
  readonly storefrontTarget: StorefrontTarget;
  readonly assembledAtIso?: string;
}): ReportMetadata {
  return Object.freeze({
    kind: "ReportMetadata",
    investigationId: input.investigationId,
    storefrontTarget: input.storefrontTarget,
    assembledAtIso: input.assembledAtIso ?? new Date(0).toISOString(),
  });
}
