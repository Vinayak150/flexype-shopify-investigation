/**
 * Integration/composition error boundaries (E-011).
 * Wiring misbind is a hard startup failure — never bypass by inventing package logic here.
 */
export const IntegrationErrorCode = {
  RuntimeNotReady: "RuntimeNotReady",
  RuntimeAlreadyShutdown: "RuntimeAlreadyShutdown",
  RuntimeAlreadyStarted: "RuntimeAlreadyStarted",
  WiringMisbind: "WiringMisbind",
} as const;

export type IntegrationErrorCode =
  (typeof IntegrationErrorCode)[keyof typeof IntegrationErrorCode];

export class IntegrationError extends Error {
  readonly kind = "IntegrationError" as const;
  readonly code: IntegrationErrorCode;

  constructor(code: IntegrationErrorCode, message: string) {
    super(message);
    this.name = "IntegrationError";
    this.code = code;
  }
}

export function throwIntegrationError(
  code: IntegrationErrorCode,
  message: string,
): never {
  throw new IntegrationError(code, message);
}
