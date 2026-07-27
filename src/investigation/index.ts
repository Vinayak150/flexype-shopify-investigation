/**
 * P-001 Investigation — domain contracts (E-002) + Investigation Engine (E-003).
 *
 * Owns: Investigation Context (IO-001), lifecycle, orchestration via ports, Completion Disposition (IO-012).
 * Must never own: Evidence contents, Detection Results, Report assembly, Presentation semantics,
 * Configuration fetch, Observation affordance meaning, browser/DOM acquisition.
 *
 * Vocabulary SoT: architecture/04_DOMAIN_MODEL.md
 */
export const PACKAGE_ID = "P-001" as const;
export const PACKAGE_NAME = "investigation" as const;

export * from "./identifiers.js";
export * from "./states.js";
export * from "./investigation-context.js";
export * from "./errors.js";
export * from "./validation.js";
export * from "./engine-errors.js";
export * from "./ports.js";
export * from "./readiness.js";
export * from "./disposition.js";
export * from "./lifecycle.js";
export * from "./coordinator.js";
export * from "./package.js";
