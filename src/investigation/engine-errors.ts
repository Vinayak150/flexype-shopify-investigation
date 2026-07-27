/**
 * Investigation Engine error boundaries (E-003 / P-001).
 * Collaborator failures must not invent Detected/Absent outcomes here.
 */
export const InvestigationEngineErrorCode = {
  IllegalTransition: "IllegalTransition",
  StorefrontRebindForbidden: "StorefrontRebindForbidden",
  CompletionWithoutDisposition: "CompletionWithoutDisposition",
  CompletionWithoutReadiness: "CompletionWithoutReadiness",
  EpisodeNotInProgress: "EpisodeNotInProgress",
  PackageNotInitialized: "PackageNotInitialized",
  PackageAlreadyShutdown: "PackageAlreadyShutdown",
  PortStageFailed: "PortStageFailed",
} as const;

export type InvestigationEngineErrorCode =
  (typeof InvestigationEngineErrorCode)[keyof typeof InvestigationEngineErrorCode];

export class InvestigationEngineError extends Error {
  readonly kind = "InvestigationEngineError" as const;
  readonly code: InvestigationEngineErrorCode;

  constructor(code: InvestigationEngineErrorCode, message: string) {
    super(message);
    this.name = "InvestigationEngineError";
    this.code = code;
  }
}

export function throwEngineError(
  code: InvestigationEngineErrorCode,
  message: string,
): never {
  throw new InvestigationEngineError(code, message);
}
