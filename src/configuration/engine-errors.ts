/**
 * Configuration Engine error boundaries (E-009 / P-007).
 * Retrieval failures map to Unavailable — never gate the core Investigation path.
 */
export const ConfigurationEngineErrorCode = {
  InvalidConfigurationMaterial: "InvalidConfigurationMaterial",
  InvalidProductHint: "InvalidProductHint",
  SessionNotOpen: "SessionNotOpen",
  PackageNotInitialized: "PackageNotInitialized",
  PackageAlreadyShutdown: "PackageAlreadyShutdown",
  EvidenceContaminationForbidden: "EvidenceContaminationForbidden",
  DetectionInfluenceForbidden: "DetectionInfluenceForbidden",
} as const;

export type ConfigurationEngineErrorCode =
  (typeof ConfigurationEngineErrorCode)[keyof typeof ConfigurationEngineErrorCode];

export class ConfigurationEngineError extends Error {
  readonly kind = "ConfigurationEngineError" as const;
  readonly code: ConfigurationEngineErrorCode;

  constructor(code: ConfigurationEngineErrorCode, message: string) {
    super(message);
    this.name = "ConfigurationEngineError";
    this.code = code;
  }
}

export function throwConfigurationError(
  code: ConfigurationEngineErrorCode,
  message: string,
): never {
  throw new ConfigurationEngineError(code, message);
}
