/**
 * Investigation episode identity (ADR-001).
 * Opaque, immutable once assigned for an episode.
 */
export type InvestigationId = string & { readonly __brand: "InvestigationId" };

export function createInvestigationId(value: string): InvestigationId {
  const trimmed = value.trim();
  if (trimmed.length === 0) {
    throw new Error("InvestigationId must be a non-empty string");
  }
  return trimmed as InvestigationId;
}
