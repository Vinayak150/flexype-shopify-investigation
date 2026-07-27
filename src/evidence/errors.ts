export const EvidenceContractErrorCode = {
  EmptyEvidenceItemId: "EmptyEvidenceItemId",
  InvalidSignalClass: "InvalidSignalClass",
  MutableNormalizedEvidence: "MutableNormalizedEvidence",
} as const;

export type EvidenceContractErrorCode =
  (typeof EvidenceContractErrorCode)[keyof typeof EvidenceContractErrorCode];

export interface EvidenceContractError {
  readonly kind: "EvidenceContractError";
  readonly code: EvidenceContractErrorCode;
  readonly message: string;
}

export function createEvidenceContractError(
  code: EvidenceContractErrorCode,
  message: string,
): EvidenceContractError {
  return Object.freeze({
    kind: "EvidenceContractError",
    code,
    message,
  });
}
