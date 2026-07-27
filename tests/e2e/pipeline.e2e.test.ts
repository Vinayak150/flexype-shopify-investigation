import { describe, expect, it } from "vitest";

import { InvestigationState, ORCHESTRATION_ORDER } from "../../src/investigation/index.js";
import { ProductConfigurationState } from "../../src/configuration/index.js";
import {
  assertPresentationViewImmutable,
  viewAgreesWithReport,
} from "../../src/presentation/index.js";
import { E2E_STOREFRONT_URL, runCorePathE2E } from "./fixtures.js";

describe("E-012 e2e — successful investigation pipeline (S-001–S-009)", () => {
  it("starts Investigation bound to one Storefront without requiring Configuration", async () => {
    const { runtime, result } = await runCorePathE2E();

    expect(result.context.storefrontTarget.storefrontUrl).toBe(E2E_STOREFRONT_URL);
    expect(result.context.investigationId).toBeTruthy();
    expect(result.configuration?.state).toBe(ProductConfigurationState.NotInScope);
    expect([
      InvestigationState.Completed,
      InvestigationState.CompletedPartial,
    ]).toContain(result.context.state);

    runtime.shutdown();
  });

  it("executes Observation → Evidence → Detection → Reporting → Presentation in order", async () => {
    const { runtime, result } = await runCorePathE2E();

    expect(result.stageResults.map((stage) => stage.stage)).toEqual([
      ...ORCHESTRATION_ORDER,
    ]);
    expect(result.stageResults.every((stage) => stage.ok)).toBe(true);

    expect(result.evidence?.kind).toBe("NormalizedEvidence");
    expect(result.evidence?.items.length).toBeGreaterThan(0);
    expect(result.detection?.results.kind).toBe("DetectionResultSet");
    expect(result.detection?.results.results.length).toBeGreaterThan(0);
    expect(result.detection?.explanations.length).toBeGreaterThan(0);
    expect(result.report?.kind).toBe("DiagnosticReport");
    expect(result.view?.kind).toBe("PresentationReadyView");
    expect(viewAgreesWithReport(result.view!)).toBe(true);
    expect(assertPresentationViewImmutable(result.view!)).toBe(true);
    expect(result.context.completionDisposition).toBeDefined();

    runtime.shutdown();
  });

  it("produces one Report and one View for the Investigation root", async () => {
    const { runtime, result } = await runCorePathE2E();

    expect(result.report?.investigationId).toBe(result.context.investigationId);
    expect(result.view?.report.investigationId).toBe(result.context.investigationId);
    expect(result.view?.report).toBe(result.report);
    expect(result.popupShell?.view).toBe(result.view);

    runtime.shutdown();
  });
});
