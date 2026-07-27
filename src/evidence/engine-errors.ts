/**
 * Evidence Engine error / incompleteness boundaries (E-005 / P-003).
 * Collection failures → incompleteness—not invented Detected/Absent.
 */
export const EvidenceEngineErrorCode = {
  MissingObservationAffordance: "MissingObservationAffordance",
  InvestigationMismatch: "InvestigationMismatch",
  InvestigationNotInProgress: "InvestigationNotInProgress",
  AcquisitionNotOpen: "AcquisitionNotOpen",
  AcquisitionAlreadySealed: "AcquisitionAlreadySealed",
  SnapshotAlreadyEmitted: "SnapshotAlreadyEmitted",
  InvalidEvidenceItem: "InvalidEvidenceItem",
  ConfigurationAsEvidenceForbidden: "ConfigurationAsEvidenceForbidden",
  PackageNotInitialized: "PackageNotInitialized",
  PackageAlreadyShutdown: "PackageAlreadyShutdown",
} as const;

export type EvidenceEngineErrorCode =
  (typeof EvidenceEngineErrorCode)[keyof typeof EvidenceEngineErrorCode];

export class EvidenceEngineError extends Error {
  readonly kind = "EvidenceEngineError" as const;
  readonly code: EvidenceEngineErrorCode;

  constructor(code: EvidenceEngineErrorCode, message: string) {
    super(message);
    this.name = "EvidenceEngineError";
    this.code = code;
  }
}

export function throwEvidenceError(
  code: EvidenceEngineErrorCode,
  message: string,
): never {
  throw new EvidenceEngineError(code, message);
}
