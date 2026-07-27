/**
 * P-003 Evidence — domain contracts (E-002) + Evidence Engine (E-005).
 *
 * Owns: Evidence acquisition/collection (IO-004), normalization, immutable Normalized Evidence (IO-005).
 * Must never own: Observation affordance meaning, Detection Results, product conclusions,
 * Report assembly, Presentation, Configuration-as-Evidence source.
 *
 * Normative: Evidence owns observable facts — not WHAT THOSE FACTS MEAN.
 */
export const PACKAGE_ID = "P-003" as const;
export const PACKAGE_NAME = "evidence" as const;

export * from "./identifiers.js";
export * from "./signal-class.js";
export * from "./provenance.js";
export * from "./evidence.js";
export * from "./normalized-evidence.js";
export * from "./errors.js";
export * from "./engine-errors.js";
export * from "./validation.js";
export * from "./signals.js";
export * from "./collector.js";
export * from "./acquisition.js";
export * from "./normalizer.js";
export * from "./coordinator.js";
export * from "./evidence-port.js";
export * from "./package.js";
