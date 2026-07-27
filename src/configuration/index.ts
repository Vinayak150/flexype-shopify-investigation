/**
 * P-007 Configuration — domain contracts (E-002) + Configuration Engine (E-009).
 *
 * Owns: optional Product Configuration (IO-010) retrieval/normalization for Reporting adjunct.
 * Must never own: Evidence, Detection, Observation, Report assembly, Presentation fetch.
 *
 * Normative: Configuration is OPTIONAL. It enriches the Diagnostic Report.
 * Configuration never enables or disables core Investigation.
 *
 * Election: pursued (optional load) or deferred (NotInScope). U-006 remains Open.
 */
export const PACKAGE_ID = "P-007" as const;
export const PACKAGE_NAME = "configuration" as const;

/** Explicit delivery election record for E-009. */
export const CONFIGURATION_ELECTION_DEFAULT = "deferred" as const;

export * from "./product-configuration.js";
export * from "./engine-errors.js";
export * from "./hints.js";
export * from "./metadata.js";
export * from "./snapshot.js";
export * from "./retriever.js";
export * from "./normalizer.js";
export * from "./validation.js";
export * from "./session.js";
export * from "./engine.js";
export * from "./package.js";
