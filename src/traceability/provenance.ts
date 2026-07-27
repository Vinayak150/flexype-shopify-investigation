import type { ObligationId } from "./obligation.js";

/**
 * Immutable ProvenanceRecord — captures established upstream provenance only.
 * Must not invent Evidence or explanations (ADR-004).
 */
export interface ProvenanceRecord {
  readonly kind: "ProvenanceRecord";
  readonly recordId: string;
  readonly subjectKey: string;
  readonly obligationIds: readonly ObligationId[];
  readonly explanationDefinitionIds: readonly string[];
  readonly supportingEvidenceKeys: readonly string[];
  readonly note?: string;
}

export function createProvenanceRecord(input: {
  readonly recordId: string;
  readonly subjectKey: string;
  readonly obligationIds?: readonly ObligationId[];
  readonly explanationDefinitionIds?: readonly string[];
  readonly supportingEvidenceKeys?: readonly string[];
  readonly note?: string;
}): ProvenanceRecord {
  const recordId = input.recordId.trim();
  const subjectKey = input.subjectKey.trim();
  if (recordId.length === 0 || subjectKey.length === 0) {
    throw new Error("ProvenanceRecord requires non-empty recordId and subjectKey");
  }

  return Object.freeze({
    kind: "ProvenanceRecord",
    recordId,
    subjectKey,
    obligationIds: Object.freeze([...(input.obligationIds ?? [])]),
    explanationDefinitionIds: Object.freeze([
      ...(input.explanationDefinitionIds ?? []),
    ]),
    supportingEvidenceKeys: Object.freeze([
      ...(input.supportingEvidenceKeys ?? []),
    ]),
    ...(input.note !== undefined ? { note: input.note } : {}),
  });
}
