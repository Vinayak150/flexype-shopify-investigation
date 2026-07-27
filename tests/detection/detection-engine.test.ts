import { describe, expect, it } from "vitest";

import {
  createInvestigationContext,
  createInvestigationId,
  createStorefrontTarget,
  InvestigationState,
} from "../../src/investigation/index.js";
import {
  createEvidenceItem,
  createEvidenceItemId,
  createEvidenceProvenance,
  createNormalizedEvidence,
  EvidenceSignalClass,
} from "../../src/evidence/index.js";
import {
  assertClosedProductCatalog,
  assertMultiSignalDefinition,
  createDefaultDefinitionRegistry,
  createDetectionPackage,
  DetectionEngine,
  DetectionEngineError,
  DetectionEngineErrorCode,
  DetectionOutcome,
  FlexyPeProductId,
} from "../../src/detection/index.js";

function context(id = "inv-det-engine-1") {
  return createInvestigationContext({
    investigationId: createInvestigationId(id),
    storefrontTarget: createStorefrontTarget("https://demo.myshopify.com"),
    state: InvestigationState.InProgress,
  });
}

function item(input: {
  readonly investigationId: ReturnType<typeof createInvestigationId>;
  readonly id: string;
  readonly signalClass: (typeof EvidenceSignalClass)[keyof typeof EvidenceSignalClass];
  readonly summary: string;
  readonly ordinal: number;
}) {
  return createEvidenceItem({
    evidenceItemId: createEvidenceItemId(input.id),
    investigationId: input.investigationId,
    signalClass: input.signalClass,
    observationSummary: input.summary,
    provenance: createEvidenceProvenance({
      investigationId: input.investigationId,
      storefrontUrl: "https://demo.myshopify.com",
      sourceRef: input.summary,
      collectionOrdinal: input.ordinal,
    }),
  });
}

function emptyEvidence(investigationId: ReturnType<typeof createInvestigationId>) {
  return createNormalizedEvidence({
    investigationId,
    items: [],
    unobtainableSignalClasses: Object.values(EvidenceSignalClass),
  });
}

function checkoutDetectedEvidence(
  investigationId: ReturnType<typeof createInvestigationId>,
) {
  return createNormalizedEvidence({
    investigationId,
    items: [
      item({
        investigationId,
        id: "e1",
        signalClass: EvidenceSignalClass.ScriptUrls,
        summary: "script carries flexype.product.Checkout",
        ordinal: 1,
      }),
      item({
        investigationId,
        id: "e2",
        signalClass: EvidenceSignalClass.DomElements,
        summary: "dom carries flexype.presence.Checkout",
        ordinal: 2,
      }),
      item({
        investigationId,
        id: "e3",
        signalClass: EvidenceSignalClass.GlobalBrowserObjects,
        summary: "Public storefront context available for observation",
        ordinal: 3,
      }),
    ],
  });
}

describe("E-006 Detection Engine", () => {
  it("consumes immutable NormalizedEvidence without browser ports", () => {
    const ctx = context();
    const evidence = emptyEvidence(ctx.investigationId);
    const engine = new DetectionEngine();

    const output = engine.evaluate(ctx, evidence);

    expect(output.results.kind).toBe("DetectionResultSet");
    expect(Object.isFrozen(evidence)).toBe(true);
    expect(Object.isFrozen(output.results)).toBe(true);
  });

  it("builds agenda retaining Unknown-qualified app/feature items", () => {
    const ctx = context("inv-det-agenda");
    const output = new DetectionEngine().evaluate(
      ctx,
      emptyEvidence(ctx.investigationId),
    );

    const kinds = output.agenda.items.map((entry) => entry.subject.kind);
    expect(kinds).toContain("FlexyPeProduct");
    expect(kinds).toContain("ThirdPartyApp");
    expect(kinds).toContain("StorefrontFeature");
    expect(
      output.agenda.items.some(
        (entry) => entry.unknownQualification?.domainUnknownId === "U-001",
      ),
    ).toBe(true);
    expect(
      output.agenda.items.some(
        (entry) => entry.unknownQualification?.domainUnknownId === "U-002",
      ),
    ).toBe(true);
  });

  it("yields Detected when multi-signal Evidence satisfies product definition", () => {
    const ctx = context("inv-det-detected");
    const output = new DetectionEngine().evaluate(
      ctx,
      checkoutDetectedEvidence(ctx.investigationId),
    );

    const checkout = output.results.results.find(
      (result) =>
        result.subject.kind === "FlexyPeProduct" &&
        result.subject.productId === FlexyPeProductId.Checkout,
    );
    expect(checkout?.outcome).toBe(DetectionOutcome.Detected);
    expect(checkout?.supportingEvidenceIds?.length).toBeGreaterThanOrEqual(2);
  });

  it("yields NotDetected for insufficient FlexyPe Evidence (FR-013)", () => {
    const ctx = context("inv-det-not");
    const evidence = createNormalizedEvidence({
      investigationId: ctx.investigationId,
      items: [
        item({
          investigationId: ctx.investigationId,
          id: "only-one",
          signalClass: EvidenceSignalClass.ScriptUrls,
          summary: "script carries flexype.product.Checkout",
          ordinal: 1,
        }),
      ],
    });

    const output = new DetectionEngine().evaluate(ctx, evidence);
    const checkout = output.results.results.find(
      (result) =>
        result.subject.kind === "FlexyPeProduct" &&
        result.subject.productId === FlexyPeProductId.Checkout,
    );

    expect(checkout?.outcome).toBe(DetectionOutcome.NotDetected);
    expect(checkout?.outcome).not.toBe(DetectionOutcome.Detected);
  });

  it("yields Unknown for Open U-001/U-002 agenda items", () => {
    const ctx = context("inv-det-unknown");
    const output = new DetectionEngine().evaluate(
      ctx,
      emptyEvidence(ctx.investigationId),
    );

    const feature = output.results.results.find(
      (result) => result.subject.kind === "StorefrontFeature",
    );
    const app = output.results.results.find(
      (result) => result.subject.kind === "ThirdPartyApp",
    );

    expect(feature?.outcome).toBe(DetectionOutcome.Unknown);
    expect(app?.outcome).toBe(DetectionOutcome.Unknown);
    expect(output.unknownQualifications.length).toBeGreaterThan(0);
  });

  it("preserves explanation references to Evidence support", () => {
    const ctx = context("inv-det-explain");
    const output = new DetectionEngine().evaluate(
      ctx,
      checkoutDetectedEvidence(ctx.investigationId),
    );

    const checkoutExplanation = output.explanations.find((entry) =>
      entry.definitionId.includes("Checkout"),
    );
    expect(checkoutExplanation?.supportingEvidenceIds.length).toBeGreaterThan(0);
    expect(checkoutExplanation?.supportingSignalClasses.length).toBeGreaterThan(1);
  });

  it("rejects single-signal-sole-basis product definitions", () => {
    const registry = createDefaultDefinitionRegistry();
    const broken = {
      ...registry.products[0]!,
      minDistinctSignalClasses: 1,
      candidateSignalClasses: [EvidenceSignalClass.ScriptUrls],
    };
    expect(() => assertMultiSignalDefinition(broken)).toThrow(DetectionEngineError);
  });

  it("rejects invented FlexyPe product ids", () => {
    expect(() => assertClosedProductCatalog("InventedProduct")).toThrow(
      expect.objectContaining({
        code: DetectionEngineErrorCode.InvalidProductCatalog,
      }),
    );
  });

  it("is deterministic for the same Evidence snapshot", () => {
    const ctx = context("inv-det-det");
    const evidence = checkoutDetectedEvidence(ctx.investigationId);
    const engine = new DetectionEngine();
    const a = engine.evaluate(ctx, evidence);
    const b = engine.evaluate(ctx, evidence);

    expect(b).toBe(a);
    expect(a.results.results.map((result) => result.outcome)).toEqual(
      b.results.results.map((result) => result.outcome),
    );
  });

  it("fulfills Investigation DetectionPort without Configuration", async () => {
    const ctx = context("inv-det-port");
    const evidence = emptyEvidence(ctx.investigationId);
    const pkg = createDetectionPackage();
    pkg.initialize({
      resolveEvidence: () => evidence,
    });

    const result = await pkg.getDetectionPort().requestEvaluation(ctx);
    expect(result.stage).toBe("Detection");
    expect(result.ok).toBe(true);
    expect(result.unknownQualified).toBe(true);
  });

  it("rejects Investigation mismatch on Evidence", () => {
    const ctx = context("inv-det-mismatch");
    const other = emptyEvidence(createInvestigationId("other-inv"));
    expect(() => new DetectionEngine().evaluate(ctx, other)).toThrow(
      DetectionEngineError,
    );
  });
});
