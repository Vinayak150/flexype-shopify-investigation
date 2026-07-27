/**
 * Traceability Engine error boundaries (E-010 / P-008).
 * Failures stay local — never gate Investigation or core engines.
 */
export const TraceabilityEngineErrorCode = {
  SessionNotOpen: "SessionNotOpen",
  SessionAlreadyOpen: "SessionAlreadyOpen",
  PackageNotInitialized: "PackageNotInitialized",
  PackageAlreadyShutdown: "PackageAlreadyShutdown",
  InvalidTraceInput: "InvalidTraceInput",
  BusinessMutationForbidden: "BusinessMutationForbidden",
  GraphNotBuilt: "GraphNotBuilt",
} as const;

export type TraceabilityEngineErrorCode =
  (typeof TraceabilityEngineErrorCode)[keyof typeof TraceabilityEngineErrorCode];

export class TraceabilityEngineError extends Error {
  readonly kind = "TraceabilityEngineError" as const;
  readonly code: TraceabilityEngineErrorCode;

  constructor(code: TraceabilityEngineErrorCode, message: string) {
    super(message);
    this.name = "TraceabilityEngineError";
    this.code = code;
  }
}

export function throwTraceabilityError(
  code: TraceabilityEngineErrorCode,
  message: string,
): never {
  throw new TraceabilityEngineError(code, message);
}
