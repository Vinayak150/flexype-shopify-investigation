import type { EvidenceItem, EvidenceSet } from "./evidence.js";
import {
  createNormalizedEvidence,
  type NormalizedEvidence,
} from "./normalized-evidence.js";
import { EvidenceEngineErrorCode, throwEvidenceError } from "./engine-errors.js";
import { isEvidenceSignalClass } from "./signal-class.js";

function compareItems(a: EvidenceItem, b: EvidenceItem): number {
  const byClass = a.signalClass.localeCompare(b.signalClass);
  if (byClass !== 0) {
    return byClass;
  }
  const byOrdinal = a.provenance.collectionOrdinal - b.provenance.collectionOrdinal;
  if (byOrdinal !== 0) {
    return byOrdinal;
  }
  return String(a.evidenceItemId).localeCompare(String(b.evidenceItemId));
}

/**
 * Transform EvidenceSet into NormalizedEvidence (S-004).
 * Deterministic for the same input; no invented facts; no conclusion-driven edits.
 */
export class EvidenceNormalizer {
  normalize(evidenceSet: EvidenceSet): NormalizedEvidence {
    if (evidenceSet.kind !== "EvidenceSet") {
      throwEvidenceError(
        EvidenceEngineErrorCode.InvalidEvidenceItem,
        "Normalizer requires a sealed EvidenceSet",
      );
    }

    for (const item of evidenceSet.items) {
      if (!isEvidenceSignalClass(item.signalClass)) {
        throwEvidenceError(
          EvidenceEngineErrorCode.InvalidEvidenceItem,
          `Invalid signal class during normalization: ${String(item.signalClass)}`,
        );
      }
      if (item.investigationId !== evidenceSet.investigationId) {
        throwEvidenceError(
          EvidenceEngineErrorCode.InvestigationMismatch,
          "EvidenceItem InvestigationId must match EvidenceSet",
        );
      }
      if (item.provenance.investigationId !== evidenceSet.investigationId) {
        throwEvidenceError(
          EvidenceEngineErrorCode.InvalidEvidenceItem,
          "Evidence provenance InvestigationId mismatch",
        );
      }
    }

    const sorted = [...evidenceSet.items].sort(compareItems);
    // Deduplicate identical summaries within the same signal class (structural only).
    const seen = new Set<string>();
    const unique: EvidenceItem[] = [];
    for (const item of sorted) {
      const key = `${item.signalClass}|${item.observationSummary}|${item.provenance.sourceRef}`;
      if (seen.has(key)) {
        continue;
      }
      seen.add(key);
      unique.push(item);
    }

    const unobtainable = [...evidenceSet.unobtainableSignalClasses].sort((a, b) =>
      a.localeCompare(b),
    );

    return createNormalizedEvidence({
      investigationId: evidenceSet.investigationId,
      items: unique,
      unobtainableSignalClasses: unobtainable,
    });
  }
}
