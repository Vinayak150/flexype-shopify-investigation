import { describe, expect, it } from "vitest";

import { DetectionOutcome } from "../../src/detection/index.js";
import {
  CompletionDisposition,
  InvestigationState,
} from "../../src/investigation/index.js";
import { runPartialPathE2E } from "./fixtures.js";

describe("E-012 e2e — partial outcome and Unknown honesty (ADR-006)", () => {
  it("propagates incomplete Observation/Evidence without fabricating Detected certainty", async () => {
    const { runtime, result } = await runPartialPathE2E();

    expect(result.stageResults.some((stage) => stage.partial === true)).toBe(true);
    expect(result.evidence).toBeDefined();
    expect(result.detection).toBeDefined();

    const detected = result.detection!.results.results.filter(
      (item) => item.outcome === DetectionOutcome.Detected,
    );
    expect(detected).toHaveLength(0);

    const notDetectedOrUnknown = result.detection!.results.results.filter(
      (item) =>
        item.outcome === DetectionOutcome.NotDetected ||
        item.outcome === DetectionOutcome.Unknown ||
        item.outcome === DetectionOutcome.Unavailable,
    );
    expect(notDetectedOrUnknown.length).toBeGreaterThan(0);

    runtime.shutdown();
  });

  it("preserves Unknown qualifications through Report and Presentation", async () => {
    const { runtime, result } = await runPartialPathE2E();

    const unknowns = result.detection?.unknownQualifications ?? [];
    if (unknowns.length > 0) {
      expect(result.report?.unknownQualifications.length).toBeGreaterThan(0);
      expect(result.view?.unknownVisible).toBe(true);
      for (const qualification of result.report!.unknownQualifications) {
        expect(qualification.domainUnknownId).toMatch(/^U-\d{3}$/);
      }
    }

    expect(result.view?.notDetectedVisible || result.view?.unknownVisible).toBe(
      true,
    );

    runtime.shutdown();
  });

  it("completes with honest CompletedPartial / UnknownQualified disposition", async () => {
    const { runtime, result } = await runPartialPathE2E();

    expect(result.context.state).toBe(InvestigationState.CompletedPartial);
    expect([
      CompletionDisposition.CompletedPartial,
      CompletionDisposition.UnknownQualified,
    ]).toContain(result.context.completionDisposition);
    expect(result.context.completionDisposition).not.toBe(
      CompletionDisposition.Completed,
    );

    runtime.shutdown();
  });
});
