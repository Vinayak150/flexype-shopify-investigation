/**
 * Presentation Engine error boundaries (E-008 / P-006).
 * Invalid Report inputs are projection errors—not invented Detected outcomes.
 */
export const PresentationEngineErrorCode = {
  MissingDiagnosticReport: "MissingDiagnosticReport",
  InvestigationMismatch: "InvestigationMismatch",
  InvestigationNotInProgress: "InvestigationNotInProgress",
  InvalidReportInput: "InvalidReportInput",
  SessionNotOpen: "SessionNotOpen",
  PackageNotInitialized: "PackageNotInitialized",
  PackageAlreadyShutdown: "PackageAlreadyShutdown",
} as const;

export type PresentationEngineErrorCode =
  (typeof PresentationEngineErrorCode)[keyof typeof PresentationEngineErrorCode];

export class PresentationEngineError extends Error {
  readonly kind = "PresentationEngineError" as const;
  readonly code: PresentationEngineErrorCode;

  constructor(code: PresentationEngineErrorCode, message: string) {
    super(message);
    this.name = "PresentationEngineError";
    this.code = code;
  }
}

export function throwPresentationError(
  code: PresentationEngineErrorCode,
  message: string,
): never {
  throw new PresentationEngineError(code, message);
}
