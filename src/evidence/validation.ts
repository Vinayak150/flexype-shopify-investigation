import type { NormalizedEvidence } from "./normalized-evidence.js";
import {
  createEvidenceContractError,
  type EvidenceContractError,
  EvidenceContractErrorCode,
} from "./errors.js";
import { isEvidenceSignalClass } from "./signal-class.js";

export function validateNormalizedEvidence(
  evidence: NormalizedEvidence,
): EvidenceContractError | undefined {
  for (const item of evidence.items) {
    if (String(item.evidenceItemId).trim().length === 0) {
      return createEvidenceContractError(
        EvidenceContractErrorCode.EmptyEvidenceItemId,
        "EvidenceItemId must be non-empty",
      );
    }
    if (!isEvidenceSignalClass(item.signalClass)) {
      return createEvidenceContractError(
        EvidenceContractErrorCode.InvalidSignalClass,
        `Invalid EvidenceSignalClass: ${String(item.signalClass)}`,
      );
    }
    if (item.provenance === undefined) {
      return createEvidenceContractError(
        EvidenceContractErrorCode.InvalidSignalClass,
        "EvidenceItem requires provenance for explainability basis",
      );
    }
  }
  return undefined;
}

/**
 * Structural immutability posture check for Normalized Evidence (ADR-002).
 */
export function assertNormalizedEvidenceImmutable(
  evidence: NormalizedEvidence,
): EvidenceContractError | undefined {
  if (!Object.isFrozen(evidence) || !Object.isFrozen(evidence.items)) {
    return createEvidenceContractError(
      EvidenceContractErrorCode.MutableNormalizedEvidence,
      "NormalizedEvidence must be frozen/immutable for consumers",
    );
  }
  if (
    evidence.unobtainableSignalClasses !== undefined &&
    !Object.isFrozen(evidence.unobtainableSignalClasses)
  ) {
    return createEvidenceContractError(
      EvidenceContractErrorCode.MutableNormalizedEvidence,
      "NormalizedEvidence.unobtainableSignalClasses must be frozen",
    );
  }
  for (const item of evidence.items) {
    if (!Object.isFrozen(item) || !Object.isFrozen(item.provenance)) {
      return createEvidenceContractError(
        EvidenceContractErrorCode.MutableNormalizedEvidence,
        "EvidenceItem and provenance must be frozen",
      );
    }
  }
  return undefined;
}
