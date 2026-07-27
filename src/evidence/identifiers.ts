/**
 * Evidence item identity scoped to one Investigation (not a global pool).
 */
export type EvidenceItemId = string & { readonly __brand: "EvidenceItemId" };

export function createEvidenceItemId(value: string): EvidenceItemId {
  const trimmed = value.trim();
  if (trimmed.length === 0) {
    throw new Error("EvidenceItemId must be a non-empty string");
  }
  return trimmed as EvidenceItemId;
}
