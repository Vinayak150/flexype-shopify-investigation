/**
 * P-004 Detection — domain contracts (E-002) + Detection Engine (E-006).
 *
 * Owns: Evaluation Agenda, Store Information, Detection Results, Unknown Qualifications.
 * Must never own: Evidence acquisition/mutation, browser/DOM evaluation, Report assembly,
 * Presentation, Configuration-required core evaluation.
 *
 * Normative: Detection evaluates immutable Evidence against definitions — not live Storefront.
 */
export const PACKAGE_ID = "P-004" as const;
export const PACKAGE_NAME = "detection" as const;

export * from "./identifiers.js";
export * from "./catalogs.js";
export * from "./outcomes.js";
export * from "./store-information.js";
export * from "./unknown-qualification.js";
export * from "./evaluation-agenda.js";
export * from "./detection-result.js";
export * from "./errors.js";
export * from "./validation.js";
export * from "./engine-errors.js";
export * from "./explanation.js";
export * from "./definitions.js";
export * from "./agenda.js";
export * from "./unknowns.js";
export * from "./store-information-projector.js";
export * from "./evaluator.js";
export * from "./session.js";
export * from "./engine.js";
export * from "./detection-port.js";
export * from "./package.js";
