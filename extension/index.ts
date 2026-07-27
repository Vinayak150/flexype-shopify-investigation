/**
 * Extension hosting / composition root (E-011).
 *
 * Hosts RR-* runtime roles by wiring `src/<package>/` public surfaces.
 * Must not own Detection definitions, Evidence normalization, Report assembly,
 * Observation evaluation, or Presentation business projection logic.
 *
 * Normative: Integration composes and connects. It does not evaluate, detect,
 * assemble, or present.
 */
export const EXTENSION_SHELL = "extension" as const;

export * from "./errors.js";
export * from "./popup-shell.js";
export * from "./trace-hooks.js";
export * from "./composition.js";
export * from "./runtime/extension-runtime.js";
export * from "./runtime/message-router.js";
