import type { InvestigationId } from "../investigation/index.js";
import type { EvidenceItem } from "./evidence.js";

/**
 * IO-005 Normalized Evidence — evaluation-ready Evidence set.
 * Immutable after normalization (ADR-002).
 */
export interface NormalizedEvidence {
  readonly kind: "NormalizedEvidence";
  readonly investigationId: InvestigationId;
  readonly items: readonly EvidenceItem[];
}

export function createNormalizedEvidence(input: {
  readonly investigationId: InvestigationId;
  readonly items: readonly EvidenceItem[];
}): NormalizedEvidence {
  return Object.freeze({
    kind: "NormalizedEvidence",
    investigationId: input.investigationId,
    items: Object.freeze([...input.items]),
  });
}
