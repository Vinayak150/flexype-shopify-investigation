import {
  createTraceLink,
  createTraceNode,
  TraceLinkKind,
  TraceNodeKind,
  type TraceLink,
  type TraceNode,
} from "./graph.js";
import { createProvenanceRecord, type ProvenanceRecord } from "./provenance.js";
import type { ObligationId } from "./obligation.js";
import {
  TraceabilityEngineErrorCode,
  throwTraceabilityError,
} from "./engine-errors.js";

/**
 * Append-only TraceRecorder — records relationships already established upstream.
 * Must not infer Detection outcomes or transform Report/Evidence meanings.
 */
export class TraceRecorder {
  private readonly nodes: TraceNode[] = [];
  private readonly links: TraceLink[] = [];
  private readonly provenance: ProvenanceRecord[] = [];
  private sealed = false;

  private assertWritable(): void {
    if (this.sealed) {
      throwTraceabilityError(
        TraceabilityEngineErrorCode.InvalidTraceInput,
        "TraceRecorder is sealed (append-only session ended)",
      );
    }
  }

  recordNode(nodeKind: TraceNodeKind, key: string): TraceNode {
    this.assertWritable();
    const node = createTraceNode({ nodeKind, key });
    const existing = this.nodes.find((item) => item.nodeId === node.nodeId);
    if (existing !== undefined) {
      return existing;
    }
    this.nodes.push(node);
    return node;
  }

  recordLink(linkKind: TraceLinkKind, from: TraceNode, to: TraceNode): TraceLink {
    this.assertWritable();
    const link = createTraceLink({
      linkKind,
      from: from.nodeId,
      to: to.nodeId,
    });
    const existing = this.links.find(
      (item) =>
        item.linkKind === link.linkKind &&
        item.from === link.from &&
        item.to === link.to,
    );
    if (existing !== undefined) {
      return existing;
    }
    this.links.push(link);
    return link;
  }

  recordProvenance(input: {
    readonly recordId: string;
    readonly subjectKey: string;
    readonly obligationIds?: readonly ObligationId[];
    readonly explanationDefinitionIds?: readonly string[];
    readonly supportingEvidenceKeys?: readonly string[];
    readonly note?: string;
  }): ProvenanceRecord {
    this.assertWritable();
    const record = createProvenanceRecord(input);
    const existing = this.provenance.find((item) => item.recordId === record.recordId);
    if (existing !== undefined) {
      return existing;
    }
    this.provenance.push(record);
    return record;
  }

  /**
   * Convenience: Evidence → Detection lineage from existing ids only.
   */
  recordEvidenceToDetection(evidenceKey: string, detectionResultKey: string): void {
    const evidence = this.recordNode(TraceNodeKind.EvidenceItem, evidenceKey);
    const detection = this.recordNode(
      TraceNodeKind.DetectionResult,
      detectionResultKey,
    );
    this.recordLink(TraceLinkKind.EvidenceSupportsDetection, evidence, detection);
  }

  /**
   * Convenience: Detection → Report lineage from existing ids only.
   */
  recordDetectionToReport(detectionResultKey: string, reportKey: string): void {
    const detection = this.recordNode(
      TraceNodeKind.DetectionResult,
      detectionResultKey,
    );
    const report = this.recordNode(TraceNodeKind.DiagnosticReport, reportKey);
    this.recordLink(TraceLinkKind.DetectionIncludedInReport, detection, report);
  }

  recordObligationReference(
    obligationId: ObligationId,
    artifactKind: TraceNodeKind,
    artifactKey: string,
  ): void {
    const obligation = this.recordNode(TraceNodeKind.Obligation, String(obligationId));
    const artifact = this.recordNode(artifactKind, artifactKey);
    this.recordLink(TraceLinkKind.ObligationReferencesArtifact, obligation, artifact);
  }

  getNodes(): readonly TraceNode[] {
    return this.nodes;
  }

  getLinks(): readonly TraceLink[] {
    return this.links;
  }

  getProvenance(): readonly ProvenanceRecord[] {
    return this.provenance;
  }

  seal(): void {
    this.sealed = true;
  }

  isSealed(): boolean {
    return this.sealed;
  }
}
