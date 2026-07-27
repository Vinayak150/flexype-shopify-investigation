/**
 * P-007 Configuration — optional domain contracts (E-002).
 * Must not be required by core Investigation/Evidence/Detection contracts.
 */
export const PACKAGE_ID = "P-007" as const;
export const PACKAGE_NAME = "configuration" as const;

export * from "./product-configuration.js";
