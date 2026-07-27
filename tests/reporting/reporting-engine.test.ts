import { describe, expect, it } from "vitest";

import {
  createInvestigationContext,
  createInvestigationId,
  createStorefrontTarget,
  InvestigationState,
} from "../../src/investigation/index.js";
import {
  createAgendaItemId,
  createDetectionResult,
  createDetectionResultId,
  createDetectionResultSet,
  createExplanationReference,
  createStoreInformation,
  createUnknownQualification,
  DetectionOutcome,
  FlexyPeProductId,
  ThemeAvailability,
} from "../../src/detection/index.js";
import {
  assertReportImmutable,
  createReportingPackage,
  ReportCompletenessKind,
  ReportSectionId,
  ReportingEngine,
  ReportingEngineError,
  ReportingEngineErrorCode,
} from "../../src/reporting/index.js";

function context(id = "inv-rep-engine-1") {
  return createInvestigationContext({
    investigationId: createInvestigationId(id),
    storefrontTarget: createStorefrontTarget("https://demo.myshopify.com"),
    state: InvestigationState.InProgress,
  });
}

function detectionInputs(investigationId: ReturnType<typeof createInvestigationId>) {
  const notDetected = createDetectionResult({
    detectionResultId: createDetectionResultId("dr-checkout"),
    investigationId,
    agendaItemId: createAgendaItemId("agenda.product.Checkout"),
    subject: {
      kind: "FlexyPeProduct",
      productId: FlexyPeProductId.Checkout,
    },
    outcome: DetectionOutcome.NotDetected,
    explanationIntent: "Insufficient multi-signal Evidence; NotDetected (FR-013)",
  });
  const unknownFeature = createDetectionResult({
    detectionResultId: createDetectionResultId("dr-feature"),
    investigationId,
    agendaItemId: createAgendaItemId("agenda.storefrontFeature"),
    subject: { kind: "StorefrontFeature" },
    outcome: DetectionOutcome.Unknown,
    unknownQualification: createUnknownQualification({
      domainUnknownId: "U-001",
      agendaItemId: createAgendaItemId("agenda.storefrontFeature"),
    }),
  });
  const unknownQualifications = [
    createUnknownQualification({
      domainUnknownId: "U-001",
      agendaItemId: createAgendaItemId("agenda.storefrontFeature"),
    }),
  ];

  return {
    storeInformation: createStoreInformation({
      investigationId,
      themeAvailability: ThemeAvailability.Unavailable,
    }),
    detectionResultSet: createDetectionResultSet({
      investigationId,
      results: [notDetected, unknownFeature],
      unknownQualifications,
    }),
    unknownQualifications,
    explanations: [
      createExplanationReference({
        definitionId: "def.flexype.product.Checkout",
        restraintReason: "MultiSignalUnsatisfied",
      }),
      createExplanationReference({
        definitionId: "def.unknown.storefrontFeature",
        restraintReason: "OpenUnknown",
      }),
    ],
  };
}

describe("E-007 Reporting Engine", () => {
  it("creates one DiagnosticReport from Detection outputs without Configuration", () => {
    const ctx = context();
    const engine = new ReportingEngine();
    const report = engine.assemble(
      ctx,
      { detection: detectionInputs(ctx.investigationId) },
      { assembledAtIso: "1970-01-01T00:00:00.000Z" },
    );

    expect(report.kind).toBe("DiagnosticReport");
    expect(report.productConfiguration).toBeUndefined();
    expect(report.detectionResultSet.results).toHaveLength(2);
    expect(assertReportImmutable(report)).toBe(true);
  });

  it("organizes findings into ReportSections without changing outcomes", () => {
    const ctx = context("inv-rep-sections");
    const inputs = detectionInputs(ctx.investigationId);
    const report = new ReportingEngine().assemble(
      ctx,
      { detection: inputs },
      { assembledAtIso: "1970-01-01T00:00:00.000Z" },
    );

    const productSection = report.sections.find(
      (section) => section.sectionId === ReportSectionId.FlexyPeProducts,
    );
    expect(productSection?.sectionId).toBe(ReportSectionId.FlexyPeProducts);
    expect(report.detectionResultSet.results[0]?.outcome).toBe(
      DetectionOutcome.NotDetected,
    );
    expect(inputs.detectionResultSet.results[0]?.outcome).toBe(
      DetectionOutcome.NotDetected,
    );
  });

  it("preserves ExplanationReferences from Detection", () => {
    const ctx = context("inv-rep-explain");
    const report = new ReportingEngine().assemble(
      ctx,
      { detection: detectionInputs(ctx.investigationId) },
      { assembledAtIso: "1970-01-01T00:00:00.000Z" },
    );

    expect(report.explanations.length).toBeGreaterThan(0);
    expect(
      report.explanations.some((entry) => entry.definitionId.includes("Checkout")),
    ).toBe(true);
    expect(JSON.stringify(report.explanations)).not.toMatch(/fabricated|invented/i);
  });

  it("preserves Unknown Qualifications and annotates partial/unknown honesty", () => {
    const ctx = context("inv-rep-partial");
    const report = new ReportingEngine().assemble(
      ctx,
      { detection: detectionInputs(ctx.investigationId) },
      { assembledAtIso: "1970-01-01T00:00:00.000Z" },
    );

    expect(report.unknownQualifications).toHaveLength(1);
    expect(report.completeness.completenessKind).toBe(
      ReportCompletenessKind.UnknownInfluenced,
    );
    expect(report.completeness.configurationAbsent).toBe(true);
  });

  it("rejects Investigation mismatch without inventing findings", () => {
    const ctx = context("inv-rep-mismatch");
    const otherId = createInvestigationId("other-inv");
    expect(() =>
      new ReportingEngine().assemble(ctx, {
        detection: detectionInputs(otherId),
      }),
    ).toThrow(ReportingEngineError);
  });

  it("is deterministic for the same Detection inputs", () => {
    const ctx = context("inv-rep-det");
    const engine = new ReportingEngine();
    const input = {
      detection: detectionInputs(ctx.investigationId),
    };
    const a = engine.assemble(ctx, input, {
      assembledAtIso: "1970-01-01T00:00:00.000Z",
    });
    const b = engine.assemble(ctx, input, {
      assembledAtIso: "1970-01-01T00:00:00.000Z",
    });

    expect(b).toBe(a);
    expect(a.detectionResultSet.results.map((result) => result.outcome)).toEqual(
      b.detectionResultSet.results.map((result) => result.outcome),
    );
  });

  it("fulfills ReportingPort without re-running Detection", async () => {
    const ctx = context("inv-rep-port");
    let resolveCount = 0;
    const pkg = createReportingPackage();
    pkg.initialize({
      resolveDetectionOutputs: () => {
        resolveCount += 1;
        return { detection: detectionInputs(ctx.investigationId) };
      },
    });

    const result = await pkg.getReportingPort().requestAssembly(ctx);
    expect(result.stage).toBe("Reporting");
    expect(result.ok).toBe(true);
    expect(resolveCount).toBe(1);
    expect(pkg.getEngine().hasReport(ctx.investigationId)).toBe(true);
  });

  it("forbids multi-root aggregation", () => {
    const engine = new ReportingEngine();
    expect(() => engine.rejectMultiRootAggregation()).toThrow(
      expect.objectContaining({
        code: ReportingEngineErrorCode.MultiRootForbidden,
      }),
    );
  });

  it("does not require Evidence or browser inputs for assembly", () => {
    const ctx = context("inv-rep-no-browser");
    const report = new ReportingEngine().assemble(
      ctx,
      { detection: detectionInputs(ctx.investigationId) },
      { assembledAtIso: "1970-01-01T00:00:00.000Z" },
    );
    expect(report.metadata.storefrontTarget.storefrontUrl).toBe(
      "https://demo.myshopify.com",
    );
    expect(report).not.toHaveProperty("normalizedEvidence");
  });
});
