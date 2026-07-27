import { describe, expect, it } from "vitest";

import { ProductConfigurationState } from "../../src/configuration/index.js";
import { createUnavailableConfigurationRetriever, runE2E } from "./fixtures.js";

describe("E-012 e2e — optional Configuration and Traceability lanes", () => {
  it("succeeds when Configuration is deferred (core path isolation)", async () => {
    const { runtime, result } = await runE2E({
      configurationElection: "deferred",
      enableTraceability: false,
    });

    expect(result.stageResults.every((stage) => stage.ok)).toBe(true);
    expect(result.report).toBeDefined();
    expect(result.view).toBeDefined();
    expect(result.configuration?.state).toBe(ProductConfigurationState.NotInScope);
    expect(result.report?.productConfiguration).toBeUndefined();

    runtime.shutdown();
  });

  it("succeeds when Configuration is pursued but Unavailable", async () => {
    const { runtime, result } = await runE2E({
      configurationElection: "pursued",
      configurationRetriever: createUnavailableConfigurationRetriever(),
      enableTraceability: false,
    });

    expect(result.report).toBeDefined();
    expect(result.view).toBeDefined();
    expect(result.configuration?.state).toBe(ProductConfigurationState.Unavailable);
    expect(result.report?.productConfiguration).toBeUndefined();
    expect(result.stageResults.every((stage) => stage.ok)).toBe(true);

    runtime.shutdown();
  });

  it("Traceability enabled vs disabled does not change business outcomes", async () => {
    const withTrace = await runE2E({
      configurationElection: "deferred",
      enableTraceability: true,
    });
    const withoutTrace = await runE2E({
      configurationElection: "deferred",
      enableTraceability: false,
    });

    expect(withTrace.result.traceExport?.kind).toBe("TraceExport");
    expect(withoutTrace.result.traceExport).toBeUndefined();

    expect(withTrace.result.stageResults.map((s) => s.stage)).toEqual(
      withoutTrace.result.stageResults.map((s) => s.stage),
    );
    expect(
      withTrace.result.report?.detectionResultSet.results.map((r) => r.outcome),
    ).toEqual(
      withoutTrace.result.report?.detectionResultSet.results.map((r) => r.outcome),
    );
    expect(withTrace.result.context.completionDisposition).toBe(
      withoutTrace.result.context.completionDisposition,
    );

    // Trace export keeps Open Unknowns trackable without closing them.
    if (withTrace.result.traceExport !== undefined) {
      for (const unknownId of withTrace.result.traceExport.openUnknownKeys) {
        expect(unknownId).toMatch(/^U-\d{3}$/);
      }
    }

    withTrace.runtime.shutdown();
    withoutTrace.runtime.shutdown();
  });
});
