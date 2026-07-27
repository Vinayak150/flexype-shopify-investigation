import { describe, expect, it } from "vitest";

import { assertPresentationViewImmutable } from "../../src/presentation/index.js";
import { runCorePathE2E } from "./fixtures.js";

describe("E-012 e2e — immutability guarantees (ADR-002 / ADR-004)", () => {
  it("keeps NormalizedEvidence immutable after pipeline completion", async () => {
    const { runtime, result } = await runCorePathE2E();

    expect(result.evidence).toBeDefined();
    expect(Object.isFrozen(result.evidence)).toBe(true);
    expect(Object.isFrozen(result.evidence!.items)).toBe(true);
    expect(() => {
      (result.evidence as unknown as { items: unknown[] }).items = [];
    }).toThrow();
    expect(() => {
      (result.evidence!.items as unknown as unknown[]).push({});
    }).toThrow();

    runtime.shutdown();
  });

  it("keeps DiagnosticReport immutable", async () => {
    const { runtime, result } = await runCorePathE2E();

    expect(result.report).toBeDefined();
    expect(Object.isFrozen(result.report)).toBe(true);
    expect(Object.isFrozen(result.report!.detectionResultSet.results)).toBe(true);
    expect(Object.isFrozen(result.report!.unknownQualifications)).toBe(true);
    expect(Object.isFrozen(result.report!.explanations)).toBe(true);
    expect(() => {
      (result.report as unknown as { sections: unknown[] }).sections = [];
    }).toThrow();

    runtime.shutdown();
  });

  it("keeps PresentationReadyView immutable and report-aligned", async () => {
    const { runtime, result } = await runCorePathE2E();

    expect(result.view).toBeDefined();
    expect(assertPresentationViewImmutable(result.view!)).toBe(true);
    expect(Object.isFrozen(result.view)).toBe(true);
    expect(() => {
      (result.view as unknown as { completenessLabel: string }).completenessLabel =
        "mutated";
    }).toThrow();

    // Presentation does not invent alternate Detection meanings.
    expect(result.view!.report.detectionResultSet).toBe(
      result.report!.detectionResultSet,
    );

    runtime.shutdown();
  });
});
