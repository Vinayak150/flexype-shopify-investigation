/**
 * Reporting Engine error boundaries (E-007 / P-005).
 * Missing Detection inputs are assembly errors—not invented Detected results.
 */
export const ReportingEngineErrorCode = {
  MissingDetectionOutputs: "MissingDetectionOutputs",
  InvestigationMismatch: "InvestigationMismatch",
  InvestigationNotInProgress: "InvestigationNotInProgress",
  MultiRootForbidden: "MultiRootForbidden",
  SessionNotOpen: "SessionNotOpen",
  InvalidReportInput: "InvalidReportInput",
  PackageNotInitialized: "PackageNotInitialized",
  PackageAlreadyShutdown: "PackageAlreadyShutdown",
} as const;

export type ReportingEngineErrorCode =
  (typeof ReportingEngineErrorCode)[keyof typeof ReportingEngineErrorCode];

export class ReportingEngineError extends Error {
  readonly kind = "ReportingEngineError" as const;
  readonly code: ReportingEngineErrorCode;

  constructor(code: ReportingEngineErrorCode, message: string) {
    super(message);
    this.name = "ReportingEngineError";
    this.code = code;
  }
}

export function throwReportingError(
  code: ReportingEngineErrorCode,
  message: string,
): never {
  throw new ReportingEngineError(code, message);
}
