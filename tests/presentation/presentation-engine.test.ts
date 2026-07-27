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
  createExplanationReference,
  createUnknownQualification,
  DetectionOutcome,
  FlexyPeProductId,
} from "../../src/detection/index.js";
import {
  assertPresentationViewImmutable,
  CORE_BEFORE_OPTIONAL_SECTION_ORDER,
  createPresentationPackage,
  PresentationEngine,
  PresentationEngineError,
  PresentationSectionId,
  viewAgreesWithReport,
} from "../../src/presentation/index.js";
import { buildMinimalReport } from "../reporting/report-fixtures.js";

function context(id = "inv-pres-engine-1") {
  return createInvestigationContext({
    investigationId: createInvestigationId(id),
    storefrontTarget: createStorefrontTarget("https://demo.myshopify.com"),
    state: InvestigationState.InProgress,
  });
}

function sampleReport(investigationId: ReturnType<typeof createInvestigationId>) {
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

  return buildMinimalReport({
    investigationId,
    storefrontTarget: createStorefrontTarget("https://demo.myshopify.com"),
    results: [notDetected, unknownFeature],
    unknownQualifications: [
      createUnknownQualification({
        domainUnknownId: "U-001",
        agendaItemId: createAgendaItemId("agenda.storefrontFeature"),
      }),
    ],
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
  });
}

describe("E-008 Presentation Engine", () => {
  it("creates PresentationReadyView from DiagnosticReport", () => {
    const ctx = context();
    const report = sampleReport(ctx.investigationId);
    const view = new PresentationEngine().present(ctx, report);

    expect(view.kind).toBe("PresentationReadyView");
    expect(assertPresentationViewImmutable(view)).toBe(true);
    expect(viewAgreesWithReport(view)).toBe(true);
  });

  it("uses core-before-optional section order with Unknowns before Configuration", () => {
    const ctx = context("inv-pres-order");
    const view = new PresentationEngine().present(
      ctx,
      sampleReport(ctx.investigationId),
    );

    expect(view.sectionOrder).toEqual([...CORE_BEFORE_OPTIONAL_SECTION_ORDER]);
    const unknownIndex = view.sectionOrder.indexOf(
      PresentationSectionId.PS008_UnknownQualifications,
    );
    const configIndex = view.sectionOrder.indexOf(
      PresentationSectionId.PS007_OptionalProductConfiguration,
    );
    expect(unknownIndex).toBeLessThan(configIndex);
  });

  it("preserves explanations from the Report", () => {
    const ctx = context("inv-pres-explain");
    const report = sampleReport(ctx.investigationId);
    const view = new PresentationEngine().present(ctx, report);

    expect(view.explanations).toEqual(report.explanations);
    expect(view.explanations.length).toBeGreaterThan(0);
  });

  it("preserves completeness and Unknown/NotDetected visibility", () => {
    const ctx = context("inv-pres-partial");
    const view = new PresentationEngine().present(
      ctx,
      sampleReport(ctx.investigationId),
    );

    expect(view.unknownVisible).toBe(true);
    expect(view.notDetectedVisible).toBe(true);
    expect(view.completenessLabel.length).toBeGreaterThan(0);

    const products = view.viewSections.find(
      (section) => section.sectionId === PresentationSectionId.PS003_FlexyPeProducts,
    );
    expect(products?.kind).toBe("ViewSection");
    if (products?.sectionId === PresentationSectionId.PS003_FlexyPeProducts) {
      expect(products.findings[0]?.outcomeLabel).toBe("Not Detected");
      expect(products.findings[0]?.outcome).toBe(DetectionOutcome.NotDetected);
    }

    const unknowns = view.viewSections.find(
      (section) =>
        section.sectionId === PresentationSectionId.PS008_UnknownQualifications,
    );
    expect(unknowns?.visible).toBe(true);
  });

  it("does not mutate the DiagnosticReport", () => {
    const ctx = context("inv-pres-immutable-report");
    const report = sampleReport(ctx.investigationId);
    const before = JSON.stringify(report);
    new PresentationEngine().present(ctx, report);
    expect(JSON.stringify(report)).toBe(before);
    expect(Object.isFrozen(report)).toBe(true);
  });

  it("rejects Investigation mismatch", () => {
    const ctx = context("inv-pres-mismatch");
    const other = sampleReport(createInvestigationId("other-inv"));
    expect(() => new PresentationEngine().present(ctx, other)).toThrow(
      PresentationEngineError,
    );
  });

  it("is deterministic for the same Report", () => {
    const ctx = context("inv-pres-det");
    const report = sampleReport(ctx.investigationId);
    const engine = new PresentationEngine();
    const a = engine.present(ctx, report);
    const b = engine.present(ctx, report);
    expect(b).toBe(a);
  });

  it("fulfills PresentationPort without Report assembly or Detection", async () => {
    const ctx = context("inv-pres-port");
    const report = sampleReport(ctx.investigationId);
    let resolveCount = 0;
    const pkg = createPresentationPackage();
    pkg.initialize({
      resolveReport: () => {
        resolveCount += 1;
        return report;
      },
    });

    const result = await pkg.getPresentationPort().requestPreparation(ctx);
    expect(result.stage).toBe("Presentation");
    expect(result.ok).toBe(true);
    expect(resolveCount).toBe(1);
    expect(pkg.getEngine().hasView(ctx.investigationId)).toBe(true);
  });

  it("does not depend on Evidence or browser inputs", () => {
    const ctx = context("inv-pres-no-browser");
    const view = new PresentationEngine().present(
      ctx,
      sampleReport(ctx.investigationId),
    );
    expect(view).not.toHaveProperty("normalizedEvidence");
    expect(view.metadata.sourceReportKind).toBe("DiagnosticReport");
  });
});
