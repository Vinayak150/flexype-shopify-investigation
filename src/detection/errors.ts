export const DetectionContractErrorCode = {
  InvalidFlexyPeProductId: "InvalidFlexyPeProductId",
  InvalidDetectionOutcome: "InvalidDetectionOutcome",
  InvalidDomainUnknownId: "InvalidDomainUnknownId",
  InvalidCurrentPageKind: "InvalidCurrentPageKind",
} as const;

export type DetectionContractErrorCode =
  (typeof DetectionContractErrorCode)[keyof typeof DetectionContractErrorCode];

export interface DetectionContractError {
  readonly kind: "DetectionContractError";
  readonly code: DetectionContractErrorCode;
  readonly message: string;
}

export function createDetectionContractError(
  code: DetectionContractErrorCode,
  message: string,
): DetectionContractError {
  return Object.freeze({
    kind: "DetectionContractError",
    code,
    message,
  });
}
