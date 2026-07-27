import {
  TraceabilityEngineErrorCode,
  throwTraceabilityError,
} from "./engine-errors.js";
import { TraceExporter, type TraceExport } from "./exporter.js";
import { buildTraceGraph, type TraceGraph } from "./graph.js";
import { recordArtifactLineage, type ArtifactLineageInput } from "./lineage.js";
import { TraceRecorder } from "./recorder.js";
import { validateTraceGraph } from "./validation.js";

export type TraceSessionStatus =
  "closed" | "open" | "recorded" | "built" | "exported" | "ended";

/**
 * Optional TraceSession: begin → record → buildGraph → export → end.
 * Non-executing relative to S-001–S-009.
 */
export class TraceSession {
  private status: TraceSessionStatus = "closed";
  private readonly investigationKey: string | undefined;
  private readonly recorder = new TraceRecorder();
  private readonly exporter = new TraceExporter();
  private graph: TraceGraph | undefined;
  private lastExport: TraceExport | undefined;

  constructor(investigationKey?: string) {
    this.investigationKey =
      investigationKey !== undefined && investigationKey.trim().length > 0
        ? investigationKey.trim()
        : undefined;
  }

  getStatus(): TraceSessionStatus {
    return this.status;
  }

  begin(): void {
    if (this.status !== "closed") {
      throwTraceabilityError(
        TraceabilityEngineErrorCode.SessionAlreadyOpen,
        `Cannot begin TraceSession from status ${this.status}`,
      );
    }
    this.status = "open";
  }

  record(lineage: ArtifactLineageInput): void {
    if (this.status !== "open" && this.status !== "recorded") {
      throwTraceabilityError(
        TraceabilityEngineErrorCode.SessionNotOpen,
        `record requires open session; got ${this.status}`,
      );
    }
    if (
      this.investigationKey !== undefined &&
      lineage.investigationKey !== this.investigationKey
    ) {
      throwTraceabilityError(
        TraceabilityEngineErrorCode.InvalidTraceInput,
        `Lineage investigationKey ${lineage.investigationKey} does not match session ${this.investigationKey}`,
      );
    }
    recordArtifactLineage(this.recorder, lineage);
    this.status = "recorded";
  }

  getRecorder(): TraceRecorder {
    return this.recorder;
  }

  buildGraph(): TraceGraph {
    if (
      this.status !== "open" &&
      this.status !== "recorded" &&
      this.status !== "built" &&
      this.status !== "exported"
    ) {
      throwTraceabilityError(
        TraceabilityEngineErrorCode.SessionNotOpen,
        `buildGraph requires an active session; got ${this.status}`,
      );
    }

    this.graph = buildTraceGraph({
      ...(this.investigationKey !== undefined
        ? { investigationKey: this.investigationKey }
        : {}),
      nodes: this.recorder.getNodes(),
      links: this.recorder.getLinks(),
    });
    validateTraceGraph(this.graph);
    this.status = "built";
    return this.graph;
  }

  exportTrace(): TraceExport {
    if (this.graph === undefined) {
      this.buildGraph();
    }
    if (this.graph === undefined) {
      throwTraceabilityError(
        TraceabilityEngineErrorCode.GraphNotBuilt,
        "TraceGraph is not available for export",
      );
    }

    this.lastExport = this.exporter.export({
      graph: this.graph,
      provenance: this.recorder.getProvenance(),
    });
    this.status = "exported";
    return this.lastExport;
  }

  end(): TraceGraph | undefined {
    this.recorder.seal();
    this.status = "ended";
    return this.graph;
  }
}
