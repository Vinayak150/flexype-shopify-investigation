import type { InvestigationId, StorefrontTarget } from "../investigation/index.js";

/**
 * Episode/view metadata derived from Report/Investigation identity.
 * Must not rebind Storefront target or pull live browser state.
 */
export interface PresentationMetadata {
  readonly kind: "PresentationMetadata";
  readonly investigationId: InvestigationId;
  readonly storefrontTarget: StorefrontTarget;
  readonly sourceReportKind: "DiagnosticReport";
}

export function createPresentationMetadata(input: {
  readonly investigationId: InvestigationId;
  readonly storefrontTarget: StorefrontTarget;
}): PresentationMetadata {
  return Object.freeze({
    kind: "PresentationMetadata",
    investigationId: input.investigationId,
    storefrontTarget: input.storefrontTarget,
    sourceReportKind: "DiagnosticReport",
  });
}
