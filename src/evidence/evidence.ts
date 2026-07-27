import type { InvestigationId } from "../investigation/index.js";
import type { EvidenceItemId } from "./identifiers.js";
import type { EvidenceSignalClass } from "./signal-class.js";

/**
 * One observable public fact (D-012 / Evidence Item value object).
 * Must not represent invented facts (INV-003).
 */
export interface EvidenceItem {
  readonly kind: "EvidenceItem";
  readonly evidenceItemId: EvidenceItemId;
  readonly investigationId: InvestigationId;
  readonly signalClass: EvidenceSignalClass;
  /** Structural description of the observable fact — not a Detection conclusion. */
  readonly observationSummary: string;
}

/**
 * IO-004 Evidence — collected observable facts for an Investigation.
 */
export interface Evidence {
  readonly kind: "Evidence";
  readonly investigationId: InvestigationId;
  readonly items: readonly EvidenceItem[];
}

export function createEvidenceItem(input: {
  readonly evidenceItemId: EvidenceItemId;
  readonly investigationId: InvestigationId;
  readonly signalClass: EvidenceSignalClass;
  readonly observationSummary: string;
}): EvidenceItem {
  return Object.freeze({
    kind: "EvidenceItem",
    evidenceItemId: input.evidenceItemId,
    investigationId: input.investigationId,
    signalClass: input.signalClass,
    observationSummary: input.observationSummary,
  });
}

export function createEvidence(input: {
  readonly investigationId: InvestigationId;
  readonly items: readonly EvidenceItem[];
}): Evidence {
  return Object.freeze({
    kind: "Evidence",
    investigationId: input.investigationId,
    items: Object.freeze([...input.items]),
  });
}
