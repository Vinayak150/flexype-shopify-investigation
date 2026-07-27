/**
 * Detection Engine error / honesty boundaries (E-006 / P-004).
 * Insufficient Evidence → NotDetected/Unknown/Unavailable—not fabricated Detected.
 */
export const DetectionEngineErrorCode = {
  MissingNormalizedEvidence: "MissingNormalizedEvidence",
  InvestigationMismatch: "InvestigationMismatch",
  InvestigationNotInProgress: "InvestigationNotInProgress",
  MutableEvidenceRejected: "MutableEvidenceRejected",
  InvalidProductCatalog: "InvalidProductCatalog",
  SessionNotOpen: "SessionNotOpen",
  PackageNotInitialized: "PackageNotInitialized",
  PackageAlreadyShutdown: "PackageAlreadyShutdown",
} as const;

export type DetectionEngineErrorCode =
  (typeof DetectionEngineErrorCode)[keyof typeof DetectionEngineErrorCode];

export class DetectionEngineError extends Error {
  readonly kind = "DetectionEngineError" as const;
  readonly code: DetectionEngineErrorCode;

  constructor(code: DetectionEngineErrorCode, message: string) {
    super(message);
    this.name = "DetectionEngineError";
    this.code = code;
  }
}

export function throwDetectionError(
  code: DetectionEngineErrorCode,
  message: string,
): never {
  throw new DetectionEngineError(code, message);
}
