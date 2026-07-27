import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import {
  createObligationId,
  createTraceabilityPackage,
  rejectBusinessArtifactMutation,
  TraceabilityEngine,
  TraceabilityEngineError,
  TraceabilityEngineErrorCode,
  TraceCompleteness,
  TraceLinkKind,
  TraceNodeKind,
  TRACEABILITY_MATRIX_SOT,
  validateTraceGraph,
} from "../../src/traceability/index.js";

const traceabilitySrcDir = join(
  dirname(fileURLToPath(import.meta.url)),
  "../../src/traceability",
);

function sampleLineage(investigationKey = "inv-trace-1") {
  return {
    investigationKey,
    evidenceItemKeys: ["ev-script-1", "ev-network-1"],
    detectionLinks: [
      {
        detectionResultKey: "dr-checkout",
        supportingEvidenceKeys: ["ev-script-1"],
      },
      {
        detectionResultKey: "dr-feature",
        supportingEvidenceKeys: ["ev-network-1"],
      },
    ],
    reportKey: `report:${investigationKey}`,
    viewKey: `view:${investigationKey}`,
    obligationIds: [
      createObligationId("FR-013"),
      createObligationId("ADR-004"),
    ],
    openUnknownIds: ["U-001"],
    explanationLinks: [
      {
        definitionId: "def.flexype.product.Checkout",
        supportingEvidenceKeys: ["ev-script-1"],
      },
    ],
    adrIds: ["ADR-004", "ADR-006"],
    packageRuntimeMaps: [{ packageId: "P-008", runtimeRoleId: "RR-008" }],
    configurationSnapshotKey: `cfg:${investigationKey}`,
    configurationElection: "deferred" as const,
  };
}

describe("E-010 Traceability Engine", () => {
  it("creates traces via beginSession → record → buildGraph → export", () => {
    const engine = new TraceabilityEngine();
    engine.beginSession("inv-trace-create");
    engine.record(sampleLineage("inv-trace-create"));
    const graph = engine.buildGraph();
    const exported = engine.export();
    engine.endSession();

    expect(graph.kind).toBe("TraceGraph");
    expect(graph.nodes.length).toBeGreaterThan(0);
    expect(exported.kind).toBe("TraceExport");
    expect(exported.matrixSourceOfTruth).toBe(TRACEABILITY_MATRIX_SOT);
  });

  it("links Investigation → Evidence → Detection → Report → View", () => {
    const result = new TraceabilityEngine().tryTrace(sampleLineage("inv-e2e"));
    const kinds = new Set(result.graph.links.map((link) => link.linkKind));

    expect(kinds.has(TraceLinkKind.InvestigationOwnsEvidence)).toBe(true);
    expect(kinds.has(TraceLinkKind.EvidenceSupportsDetection)).toBe(true);
    expect(kinds.has(TraceLinkKind.DetectionIncludedInReport)).toBe(true);
    expect(kinds.has(TraceLinkKind.ReportProjectedToView)).toBe(true);
    expect(result.completeness).toBe(TraceCompleteness.EndToEnd);
  });

  it("records obligation references and ADR targets", () => {
    const { graph, export: exported } = new TraceabilityEngine().tryTrace(
      sampleLineage("inv-obligation"),
    );

    const obligations = graph.nodes.filter(
      (node) => node.nodeKind === TraceNodeKind.Obligation,
    );
    expect(obligations.some((node) => node.key === "FR-013")).toBe(true);
    expect(
      graph.links.some(
        (link) => link.linkKind === TraceLinkKind.ObligationReferencesArtifact,
      ),
    ).toBe(true);
    expect(
      graph.nodes.some(
        (node) => node.nodeKind === TraceNodeKind.Adr && node.key === "ADR-004",
      ),
    ).toBe(true);
    expect(exported.provenance.length).toBeGreaterThan(0);
  });

  it("records Evidence → Detection lineage from existing ids only", () => {
    const engine = new TraceabilityEngine();
    const session = engine.beginSession("inv-ev-det");
    session.getRecorder().recordEvidenceToDetection("ev-1", "dr-1");
    session.getRecorder().recordNode(TraceNodeKind.Investigation, "inv-ev-det");
    const graph = engine.buildGraph();

    expect(
      graph.links.some(
        (link) => link.linkKind === TraceLinkKind.EvidenceSupportsDetection,
      ),
    ).toBe(true);
    expect(
      graph.nodes.some((node) => node.nodeKind === TraceNodeKind.EvidenceItem),
    ).toBe(true);
    expect(
      graph.nodes.some(
        (node) => node.nodeKind === TraceNodeKind.DetectionResult,
      ),
    ).toBe(true);
  });

  it("records Detection → Report lineage from existing ids only", () => {
    const engine = new TraceabilityEngine();
    const session = engine.beginSession("inv-det-rep");
    session.getRecorder().recordDetectionToReport("dr-1", "report:inv-det-rep");
    const graph = engine.buildGraph();

    expect(
      graph.links.some(
        (link) => link.linkKind === TraceLinkKind.DetectionIncludedInReport,
      ),
    ).toBe(true);
  });

  it("handles missing lineage without fabrication (Partial completeness)", () => {
    const result = new TraceabilityEngine().tryTrace({
      investigationKey: "inv-partial",
      evidenceItemKeys: ["ev-only"],
      // No detection/report/view — honest Partial
    });

    expect(result.completeness).toBe(TraceCompleteness.Partial);
    expect(result.graph.missingLineage.length).toBeGreaterThan(0);
    expect(
      result.graph.nodes.some(
        (node) => node.nodeKind === TraceNodeKind.DetectionResult,
      ),
    ).toBe(false);
    expect(
      result.graph.links.some(
        (link) => link.linkKind === TraceLinkKind.EvidenceSupportsDetection,
      ),
    ).toBe(false);
  });

  it("produces immutable TraceGraph and TraceExport records", () => {
    const { graph, export: exported } = new TraceabilityEngine().tryTrace(
      sampleLineage("inv-immutable"),
    );

    expect(Object.isFrozen(graph)).toBe(true);
    expect(Object.isFrozen(graph.nodes)).toBe(true);
    expect(Object.isFrozen(graph.links)).toBe(true);
    expect(Object.isFrozen(exported)).toBe(true);
    expect(() => validateTraceGraph(graph)).not.toThrow();
    expect(() => {
      (graph as { completeness: string }).completeness = "Empty";
    }).toThrow();
  });

  it("generates deterministic graphs for the same lineage inputs", () => {
    const lineage = sampleLineage("inv-deterministic");
    const a = new TraceabilityEngine().tryTrace(lineage);
    const b = new TraceabilityEngine().tryTrace(lineage);

    expect(a.graph.nodes.map((node) => node.nodeId)).toEqual(
      b.graph.nodes.map((node) => node.nodeId),
    );
    expect(
      a.graph.links.map((link) => `${link.linkKind}|${link.from}|${link.to}`),
    ).toEqual(
      b.graph.links.map((link) => `${link.linkKind}|${link.from}|${link.to}`),
    );
  });

  it("does not mutate source lineage input objects", () => {
    const lineage = sampleLineage("inv-no-mutate");
    const evidenceBefore = [...(lineage.evidenceItemKeys ?? [])];
    const frozenCopy = Object.freeze({
      ...lineage,
      evidenceItemKeys: Object.freeze([...(lineage.evidenceItemKeys ?? [])]),
    });

    new TraceabilityEngine().tryTrace(frozenCopy);

    expect(lineage.evidenceItemKeys).toEqual(evidenceBefore);
    expect(frozenCopy.evidenceItemKeys).toEqual(evidenceBefore);
  });

  it("keeps Open Unknowns Open in export (does not auto-close)", () => {
    const { export: exported } = new TraceabilityEngine().tryTrace(
      sampleLineage("inv-unknowns"),
    );

    expect(exported.openUnknownKeys).toContain("U-001");
    expect(
      exported.graph.links.some(
        (link) => link.linkKind === TraceLinkKind.UnknownTrackedOpen,
      ),
    ).toBe(true);
  });

  it("contains no Evidence/Detection/Report business evaluation APIs", () => {
    const sources = [
      "engine.ts",
      "session.ts",
      "recorder.ts",
      "lineage.ts",
      "graph.ts",
      "exporter.ts",
      "package.ts",
    ].map((file) => readFileSync(join(traceabilitySrcDir, file), "utf8"));

    for (const source of sources) {
      expect(source).not.toMatch(/DetectionEngine|EvidenceEngine|ReportingEngine/);
      expect(source).not.toMatch(/evaluateDetection|normalizeEvidence|assembleReport/);
      expect(source).not.toMatch(/from ["'].*\/(evidence|detection|reporting|presentation|configuration)\//);
    }

    expect(() => rejectBusinessArtifactMutation()).toThrow(
      TraceabilityEngineError,
    );
    try {
      rejectBusinessArtifactMutation();
    } catch (error) {
      expect((error as TraceabilityEngineError).code).toBe(
        TraceabilityEngineErrorCode.BusinessMutationForbidden,
      );
    }
  });

  it("package initialize/shutdown is safe and optional for core path", () => {
    const pkg = createTraceabilityPackage();
    expect(pkg.getStatus()).toBe("uninitialized");

    const engine = pkg.initialize();
    expect(pkg.getStatus()).toBe("ready");
    expect(pkg.getEngine()).toBe(engine);

    const empty = engine.buildGraph();
    expect(empty.completeness).toBe(TraceCompleteness.Empty);

    pkg.shutdown();
    expect(pkg.getStatus()).toBe("shutdown");
    expect(() => pkg.initialize()).toThrow(TraceabilityEngineError);
  });
});
