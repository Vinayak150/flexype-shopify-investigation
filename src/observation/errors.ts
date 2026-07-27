/**
 * Observation-owned error / incompleteness boundaries (E-004 / P-002).
 * Failures become affordance incompleteness—not invented Detected/Absent.
 */
export const ObservationEngineErrorCode = {
  InvalidInvestigationContext: "InvalidInvestigationContext",
  InvestigationNotInProgress: "InvestigationNotInProgress",
  SessionNotOpen: "SessionNotOpen",
  SessionAlreadyClosed: "SessionAlreadyClosed",
  DiscoveryAlreadyPerformed: "DiscoveryAlreadyPerformed",
  PackageNotInitialized: "PackageNotInitialized",
  PackageAlreadyShutdown: "PackageAlreadyShutdown",
} as const;

export type ObservationEngineErrorCode =
  (typeof ObservationEngineErrorCode)[keyof typeof ObservationEngineErrorCode];

export class ObservationEngineError extends Error {
  readonly kind = "ObservationEngineError" as const;
  readonly code: ObservationEngineErrorCode;

  constructor(code: ObservationEngineErrorCode, message: string) {
    super(message);
    this.name = "ObservationEngineError";
    this.code = code;
  }
}

export function throwObservationError(
  code: ObservationEngineErrorCode,
  message: string,
): never {
  throw new ObservationEngineError(code, message);
}
