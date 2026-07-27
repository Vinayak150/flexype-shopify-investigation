/**
 * P-005 Reporting — domain contracts (E-002) + Reporting Engine (E-007).
 *
 * Owns: Diagnostic Report assembly (IO-009) from Detection outputs.
 * Must never own: Evidence recollection, Detection evaluation, Observation/browser access,
 * Presentation rendering, Configuration fetching.
 *
 * Normative: Reporting assembles — it does not evaluate, detect, or present.
 */
export const PACKAGE_ID = "P-005" as const;
export const PACKAGE_NAME = "reporting" as const;

export * from "./diagnostic-report.js";
export * from "./validation.js";
export * from "./engine-errors.js";
export * from "./metadata.js";
export * from "./sections.js";
export * from "./explanations.js";
export * from "./completeness.js";
export * from "./inputs.js";
export * from "./assembler.js";
export * from "./session.js";
export * from "./engine.js";
export * from "./reporting-port.js";
export * from "./package.js";
