import type { EvidenceItemId, EvidenceSignalClass } from "../evidence/index.js";

/**
 * Provenance linkage from DetectionResult to Evidence support (ADR-004).
 * Not Presentation copywriting; does not fabricate Evidence snippets.
 */
export interface ExplanationReference {
  readonly kind: "ExplanationReference";
  readonly definitionId: string;
  readonly supportingEvidenceIds: readonly EvidenceItemId[];
  readonly supportingSignalClasses: readonly EvidenceSignalClass[];
  readonly restraintReason?:
    "InsufficientEvidence" | "OpenUnknown" | "Unavailable" | "MultiSignalUnsatisfied";
}

export function createExplanationReference(input: {
  readonly definitionId: string;
  readonly supportingEvidenceIds?: readonly EvidenceItemId[];
  readonly supportingSignalClasses?: readonly EvidenceSignalClass[];
  readonly restraintReason?: ExplanationReference["restraintReason"];
}): ExplanationReference {
  return Object.freeze({
    kind: "ExplanationReference",
    definitionId: input.definitionId,
    supportingEvidenceIds: Object.freeze([...(input.supportingEvidenceIds ?? [])]),
    supportingSignalClasses: Object.freeze([...(input.supportingSignalClasses ?? [])]),
    ...(input.restraintReason !== undefined
      ? { restraintReason: input.restraintReason }
      : {}),
  });
}
