import type { TraceGraph } from "./graph.js";
import type { ProvenanceRecord } from "./provenance.js";

/**
 * Machine-readable export for review/verification (VD-001 / VD-009).
 * Format is delivery detail — not architecture redesign.
 */
export interface TraceExport {
  readonly kind: "TraceExport";
  readonly matrixSourceOfTruth: "architecture/03_TRACEABILITY_MATRIX.md";
  readonly graph: TraceGraph;
  readonly provenance: readonly ProvenanceRecord[];
  readonly openUnknownKeys: readonly string[];
  readonly exportedAtIso: string;
}

export class TraceExporter {
  export(input: {
    readonly graph: TraceGraph;
    readonly provenance: readonly ProvenanceRecord[];
    readonly exportedAtIso?: string;
  }): TraceExport {
    const openUnknownKeys = Object.freeze(
      input.graph.nodes
        .filter((node) => node.nodeKind === "DomainUnknown")
        .map((node) => node.key)
        .sort((a, b) => a.localeCompare(b)),
    );

    return Object.freeze({
      kind: "TraceExport",
      matrixSourceOfTruth: "architecture/03_TRACEABILITY_MATRIX.md",
      graph: input.graph,
      provenance: Object.freeze([...input.provenance]),
      openUnknownKeys,
      exportedAtIso: input.exportedAtIso ?? "1970-01-01T00:00:00.000Z",
    });
  }
}
