/**
 * Assignment obligation reference IDs (FR/NFR/C/U/EP/ADR).
 * Must match registry strings; do not invent IDs here.
 */
export type ObligationId = string & { readonly __brand: "ObligationId" };

/**
 * D-018 Assignment Obligation Reference — governance vocabulary only.
 */
export interface AssignmentObligationReference {
  readonly kind: "AssignmentObligationReference";
  readonly obligationId: ObligationId;
  readonly description?: string;
}

export function createObligationId(value: string): ObligationId {
  const trimmed = value.trim();
  if (trimmed.length === 0) {
    throw new Error("ObligationId must be a non-empty string");
  }
  return trimmed as ObligationId;
}

export function createAssignmentObligationReference(input: {
  readonly obligationId: ObligationId;
  readonly description?: string;
}): AssignmentObligationReference {
  return Object.freeze({
    kind: "AssignmentObligationReference",
    obligationId: input.obligationId,
    ...(input.description !== undefined ? { description: input.description } : {}),
  });
}
