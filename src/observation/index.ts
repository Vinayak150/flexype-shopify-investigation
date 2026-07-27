/**
 * P-002 Observation — domain contracts (E-002) + Observation Engine (E-004).
 *
 * Owns: Observation Affordance (IO-002); discovery of what can be observed.
 * Must never own: Evidence contents/normalization, Detection Results, Report assembly,
 * Presentation, Configuration, product classification/scoring.
 *
 * Normative: Observation discovers WHAT CAN BE OBSERVED — not WHAT IT MEANS.
 */
export const PACKAGE_ID = "P-002" as const;
export const PACKAGE_NAME = "observation" as const;

export * from "./errors.js";
export * from "./incompleteness.js";
export * from "./observation-affordance.js";
export * from "./observation-context.js";
export * from "./browser.js";
export * from "./dom.js";
export * from "./session.js";
export * from "./coordinator.js";
export * from "./observation-port.js";
export * from "./package.js";
