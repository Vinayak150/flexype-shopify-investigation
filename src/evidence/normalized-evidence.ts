import type { InvestigationId } from "../investigation/index.js";
import type { EvidenceItem } from "./evidence.js";
import type { EvidenceSignalClass } from "./signal-class.js";

/**
 * IO-005 Normalized Evidence — evaluation-ready Evidence set.
 * Immutable after normalization (ADR-002).
 */
export interface NormalizedEvidence {
  readonly kind: "NormalizedEvidence";
  readonly investigationId: InvestigationId;
  readonly items: readonly EvidenceItem[];
  readonly unobtainableSignalClasses: readonly EvidenceSignalClass[];
}

export function createNormalizedEvidence(input: {
  readonly investigationId: InvestigationId;
  readonly items: readonly EvidenceItem[];
  readonly unobtainableSignalClasses?: readonly EvidenceSignalClass[];
}): NormalizedEvidence {
  return Object.freeze({
    kind: "NormalizedEvidence",
    investigationId: input.investigationId,
    items: Object.freeze([...input.items]),
    unobtainableSignalClasses: Object.freeze([
      ...(input.unobtainableSignalClasses ?? []),
    ]),
  });
}
