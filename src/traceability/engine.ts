import type { TraceExport } from "./exporter.js";
import {
  buildTraceGraph,
  type TraceCompleteness,
  type TraceGraph,
} from "./graph.js";
import type { ArtifactLineageInput } from "./lineage.js";
import { createProvenanceRecord } from "./provenance.js";
import {
  TraceSession,
  type TraceSessionStatus,
} from "./session.js";

/**
 * Traceability Engine entry point (E-010 / P-008).
 * Records relationships; never changes runtime diagnostic behavior.
 */
export class TraceabilityEngine {
  private session: TraceSession | undefined;
  private lastGraph: TraceGraph | undefined;
  private lastExport: TraceExport | undefined;

  beginSession(investigationKey?: string): TraceSession {
    this.session = new TraceSession(investigationKey);
    this.session.begin();
    return this.session;
  }

  getSessionStatus(): TraceSessionStatus | "none" {
    return this.session?.getStatus() ?? "none";
  }

  /**
   * Append lineage facts. Non-blocking: failures yield empty Partial graph.
   */
  record(lineage: ArtifactLineageInput): void {
    try {
      if (this.session === undefined) {
        this.beginSession(lineage.investigationKey);
      }
      this.session?.record(lineage);
    } catch {
      // Non-blocking: leave session state; core path unaffected.
      this.lastGraph = buildTraceGraph({
        investigationKey: lineage.investigationKey,
        nodes: [],
        links: [],
      });
    }
  }

  buildGraph(): TraceGraph {
    try {
      if (this.session === undefined) {
        this.lastGraph = buildTraceGraph({ nodes: [], links: [] });
        return this.lastGraph;
      }
      this.lastGraph = this.session.buildGraph();
      return this.lastGraph;
    } catch {
      this.lastGraph = buildTraceGraph({ nodes: [], links: [] });
      return this.lastGraph;
    }
  }

  export(): TraceExport {
    try {
      if (this.session === undefined) {
        const empty = buildTraceGraph({ nodes: [], links: [] });
        this.lastExport = Object.freeze({
          kind: "TraceExport" as const,
          matrixSourceOfTruth:
            "architecture/03_TRACEABILITY_MATRIX.md" as const,
          graph: empty,
          provenance: Object.freeze([] as const),
          openUnknownKeys: Object.freeze([] as const),
          exportedAtIso: "1970-01-01T00:00:00.000Z",
        });
        return this.lastExport;
      }
      this.lastExport = this.session.exportTrace();
      return this.lastExport;
    } catch {
      const empty = buildTraceGraph({ nodes: [], links: [] });
      this.lastExport = Object.freeze({
        kind: "TraceExport" as const,
        matrixSourceOfTruth:
          "architecture/03_TRACEABILITY_MATRIX.md" as const,
        graph: empty,
        provenance: Object.freeze([
          createProvenanceRecord({
            recordId: "trace-export-failure",
            subjectKey: "traceability",
            note: "Export failed locally; core Investigation unaffected",
          }),
        ]),
        openUnknownKeys: Object.freeze([] as const),
        exportedAtIso: "1970-01-01T00:00:00.000Z",
      });
      return this.lastExport;
    }
  }

  endSession(): TraceGraph | undefined {
    const graph = this.session?.end();
    this.session = undefined;
    return graph ?? this.lastGraph;
  }

  getLastGraph(): TraceGraph | undefined {
    return this.lastGraph;
  }

  /**
   * Convenience: one-shot record → build → export for an investigation lineage.
   * Never throws into the core Investigation path.
   */
  tryTrace(lineage: ArtifactLineageInput): {
    readonly graph: TraceGraph;
    readonly export: TraceExport;
    readonly completeness: TraceCompleteness;
  } {
    this.beginSession(lineage.investigationKey);
    this.record(lineage);
    const graph = this.buildGraph();
    const exported = this.export();
    this.endSession();
    return Object.freeze({
      graph,
      export: exported,
      completeness: graph.completeness,
    });
  }
}
