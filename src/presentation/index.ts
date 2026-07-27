/**
 * P-006 Presentation — domain contracts (E-002) + Presentation Engine (E-008).
 *
 * Owns: Presentation-ready View (IO-011) projection from Diagnostic Report.
 * Must never own: Evidence evaluation, Detection, Report assembly, Observation/browser access,
 * Configuration fetching, UI-framework rendering.
 *
 * Normative: Presentation projects Report meaning — it does not discover, capture, evaluate, or assemble.
 */
export const PACKAGE_ID = "P-006" as const;
export const PACKAGE_NAME = "presentation" as const;

export * from "./sections.js";
export * from "./presentation-view.js";
export * from "./engine-errors.js";
export * from "./formatter.js";
export * from "./metadata.js";
export * from "./view-sections.js";
export * from "./projector.js";
export * from "./session.js";
export * from "./engine.js";
export * from "./presentation-port.js";
export * from "./package.js";
