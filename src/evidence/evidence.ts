import type { InvestigationId } from "../investigation/index.js";
import type { EvidenceItemId } from "./identifiers.js";
import type { EvidenceProvenance } from "./provenance.js";
import type { EvidenceSignalClass } from "./signal-class.js";

/**
 * One observable public fact (D-012 / Evidence Item value object).
 * Must not represent invented facts (INV-003) or Detection conclusions.
 */
export interface EvidenceItem {
  readonly kind: "EvidenceItem";
  readonly evidenceItemId: EvidenceItemId;
  readonly investigationId: InvestigationId;
  readonly signalClass: EvidenceSignalClass;
  /** Structural description of the observable fact — not a Detection conclusion. */
  readonly observationSummary: string;
  readonly provenance: EvidenceProvenance;
}

/**
 * IO-004 Evidence / EvidenceSet — collected facts prior to or at normalization.
 */
export interface EvidenceSet {
  readonly kind: "EvidenceSet";
  readonly investigationId: InvestigationId;
  readonly items: readonly EvidenceItem[];
  /** Approved signal classes that could not be obtained — honesty, not fabrication. */
  readonly unobtainableSignalClasses: readonly EvidenceSignalClass[];
}

/** @deprecated Use EvidenceSet — alias retained for E-002 naming continuity. */
export type Evidence = EvidenceSet;

export function createEvidenceItem(input: {
  readonly evidenceItemId: EvidenceItemId;
  readonly investigationId: InvestigationId;
  readonly signalClass: EvidenceSignalClass;
  readonly observationSummary: string;
  readonly provenance: EvidenceProvenance;
}): EvidenceItem {
  if (input.observationSummary.trim().length === 0) {
    throw new Error("EvidenceItem.observationSummary must be non-empty");
  }
  return Object.freeze({
    kind: "EvidenceItem",
    evidenceItemId: input.evidenceItemId,
    investigationId: input.investigationId,
    signalClass: input.signalClass,
    observationSummary: input.observationSummary,
    provenance: input.provenance,
  });
}

export function createEvidenceSet(input: {
  readonly investigationId: InvestigationId;
  readonly items: readonly EvidenceItem[];
  readonly unobtainableSignalClasses?: readonly EvidenceSignalClass[];
}): EvidenceSet {
  return Object.freeze({
    kind: "EvidenceSet",
    investigationId: input.investigationId,
    items: Object.freeze([...input.items]),
    unobtainableSignalClasses: Object.freeze([
      ...(input.unobtainableSignalClasses ?? []),
    ]),
  });
}

/** @deprecated Prefer createEvidenceSet */
export const createEvidence = createEvidenceSet;
