/**
 * P-001 Investigation — domain contracts (E-002).
 * Vocabulary SoT remains architecture/04_DOMAIN_MODEL.md.
 * No Investigation workflow behavior in this milestone.
 */
export const PACKAGE_ID = "P-001" as const;
export const PACKAGE_NAME = "investigation" as const;

export * from "./identifiers.js";
export * from "./states.js";
export * from "./investigation-context.js";
export * from "./errors.js";
export * from "./validation.js";
