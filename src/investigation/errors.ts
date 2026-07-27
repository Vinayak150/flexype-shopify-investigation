/**
 * Structural domain contract errors for Investigation (not runtime orchestration).
 */
export const InvestigationContractErrorCode = {
  MissingStorefrontTarget: "MissingStorefrontTarget",
  EmptyInvestigationId: "EmptyInvestigationId",
  InvalidInvestigationState: "InvalidInvestigationState",
  InvalidCompletionDisposition: "InvalidCompletionDisposition",
} as const;

export type InvestigationContractErrorCode =
  (typeof InvestigationContractErrorCode)[keyof typeof InvestigationContractErrorCode];

export interface InvestigationContractError {
  readonly kind: "InvestigationContractError";
  readonly code: InvestigationContractErrorCode;
  readonly message: string;
}

export function createInvestigationContractError(
  code: InvestigationContractErrorCode,
  message: string,
): InvestigationContractError {
  return Object.freeze({
    kind: "InvestigationContractError",
    code,
    message,
  });
}
