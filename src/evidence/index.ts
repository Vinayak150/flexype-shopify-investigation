/**
 * P-003 Evidence — domain contracts (E-002).
 * No acquisition/normalization behavior in this milestone.
 */
export const PACKAGE_ID = "P-003" as const;
export const PACKAGE_NAME = "evidence" as const;

export * from "./identifiers.js";
export * from "./signal-class.js";
export * from "./evidence.js";
export * from "./normalized-evidence.js";
export * from "./errors.js";
export * from "./validation.js";
