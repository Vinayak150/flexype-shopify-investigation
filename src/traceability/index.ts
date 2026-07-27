/**
 * P-008 Traceability — domain contracts (E-002) + Traceability Support (E-010).
 *
 * Owns: obligation vocabulary; relationship recording; TraceGraph / provenance / export.
 * Must never own: Evidence, Detection, Reporting, Presentation, Configuration, Observation,
 * Investigation lifecycle, or runtime diagnostic decisions.
 *
 * Normative: Traceability records relationships. It never changes runtime behavior.
 * Source of truth for obligation registries remains architecture/03_TRACEABILITY_MATRIX.md.
 */
export const PACKAGE_ID = "P-008" as const;
export const PACKAGE_NAME = "traceability" as const;

/** Explicit note — Matrix document is SoT; this package extends discipline only. */
export const TRACEABILITY_MATRIX_SOT =
  "architecture/03_TRACEABILITY_MATRIX.md" as const;

export * from "./obligation.js";
export * from "./engine-errors.js";
export * from "./graph.js";
export * from "./provenance.js";
export * from "./recorder.js";
export * from "./lineage.js";
export * from "./validation.js";
export * from "./exporter.js";
export * from "./session.js";
export * from "./engine.js";
export * from "./package.js";
