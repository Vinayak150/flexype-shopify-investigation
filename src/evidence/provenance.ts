import type { InvestigationId } from "../investigation/index.js";

/**
 * Provenance for explainability attribution (ADR-004 upstream basis).
 * Evidence preserves origin metadata; it does not generate Detection explanations.
 */
export interface EvidenceProvenance {
  readonly kind: "EvidenceProvenance";
  readonly investigationId: InvestigationId;
  readonly storefrontUrl: string;
  /** Stable reference to observation/capability origin — not a Detection outcome. */
  readonly sourceRef: string;
  readonly collectionOrdinal: number;
}

export function createEvidenceProvenance(input: {
  readonly investigationId: InvestigationId;
  readonly storefrontUrl: string;
  readonly sourceRef: string;
  readonly collectionOrdinal: number;
}): EvidenceProvenance {
  return Object.freeze({
    kind: "EvidenceProvenance",
    investigationId: input.investigationId,
    storefrontUrl: input.storefrontUrl,
    sourceRef: input.sourceRef,
    collectionOrdinal: input.collectionOrdinal,
  });
}
