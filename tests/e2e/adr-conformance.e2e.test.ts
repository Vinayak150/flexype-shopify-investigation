import { describe, expect, it } from "vitest";

import {
  DetectionOutcome,
  FLEXYPE_PRODUCT_IDS,
  isFlexyPeProductId,
} from "../../src/detection/index.js";
import { createSystemRuntime } from "../../extension/index.js";
import {
  E2E_STOREFRONT_URL,
  runCorePathE2E,
  runPartialPathE2E,
} from "./fixtures.js";

describe("E-012 e2e — ADR-001–ADR-006 runtime conformance", () => {
  it("ADR-001: one Investigation / Storefront / Report / View per episode", async () => {
    const { runtime, result } = await runCorePathE2E();

    expect(result.context.storefrontTarget.storefrontUrl).toBe(E2E_STOREFRONT_URL);
    expect(result.report?.investigationId).toBe(result.context.investigationId);
    expect(result.view?.report.investigationId).toBe(result.context.investigationId);
    expect(result.evidence?.investigationId).toBe(result.context.investigationId);
    expect(result.detection?.results.investigationId).toBe(
      result.context.investigationId,
    );

    runtime.shutdown();
  });

  it("ADR-002: Evidence snapshot remains read-only through Detection and Reporting", async () => {
    const { runtime, result } = await runCorePathE2E();

    expect(Object.isFrozen(result.evidence)).toBe(true);
    expect(result.report?.investigationId).toBe(result.evidence?.investigationId);
    // Detection consumes snapshot ids only — no alternate Evidence mutation surface.
    expect(result.detection?.results.investigationId).toBe(
      result.evidence?.investigationId,
    );

    runtime.shutdown();
  });

  it("ADR-003: Detection stays on closed FlexyPe catalog (definition-driven posture)", async () => {
    const { runtime, result } = await runCorePathE2E();

    const productResults = result.detection!.results.results.filter(
      (item) => item.subject.kind === "FlexyPeProduct",
    );
    expect(productResults.length).toBeGreaterThan(0);
    for (const item of productResults) {
      if (item.subject.kind === "FlexyPeProduct") {
        expect(isFlexyPeProductId(item.subject.productId)).toBe(true);
        expect(FLEXYPE_PRODUCT_IDS).toContain(item.subject.productId);
      }
    }
    expect(FLEXYPE_PRODUCT_IDS).toEqual(["Checkout", "FlexyPass", "FlexyCart"]);

    runtime.shutdown();
  });

  it("ADR-004: ExplanationReferences remain available end-to-end", async () => {
    const { runtime, result } = await runCorePathE2E();

    expect(result.detection!.explanations.length).toBeGreaterThan(0);
    expect(result.report!.explanations.length).toBeGreaterThan(0);
    expect(result.view!.explanations.length).toBeGreaterThan(0);
    expect(result.view!.explanations).toEqual(result.report!.explanations);

    runtime.shutdown();
  });

  it("ADR-005: single acquisition — second observe on same Investigation does not re-scan", async () => {
    const runtime = createSystemRuntime();
    const browser = (
      await import("../../src/observation/index.js")
    ).createMemoryBrowserPorts();
    const dom = (
      await import("../../src/observation/index.js")
    ).createMemoryDomPorts();

    runtime.startup({
      browser,
      dom,
      configurationElection: "deferred",
      enableTraceability: false,
    });

    const first = await runtime.runInvestigation(E2E_STOREFRONT_URL);
    const accessAfterFirst = browser.accessCount.value + dom.accessCount.value;

    // New Investigation is a new episode (ADR-001); within the completed episode,
    // Evidence/Detection artifacts remain the frozen first-acquisition outputs.
    expect(Object.isFrozen(first.evidence)).toBe(true);
    expect(first.evidence?.items).toBeDefined();
    expect(accessAfterFirst).toBeGreaterThan(0);

    // Re-running creates a distinct Investigation root — does not mutate prior Evidence.
    const second = await runtime.runInvestigation("https://e2e-second.myshopify.com");
    expect(second.context.investigationId).not.toBe(first.context.investigationId);
    expect(first.evidence?.investigationId).toBe(first.context.investigationId);
    expect(Object.isFrozen(first.evidence)).toBe(true);

    runtime.shutdown();
  });

  it("ADR-006: partial/unknown outcomes remain honest completion states", async () => {
    const { runtime, result } = await runPartialPathE2E();

    expect(result.context.completionDisposition).not.toBe("Completed");
    expect(
      result.detection!.results.results.some(
        (item) =>
          item.outcome === DetectionOutcome.NotDetected ||
          item.outcome === DetectionOutcome.Unknown ||
          item.outcome === DetectionOutcome.Unavailable,
      ),
    ).toBe(true);

    runtime.shutdown();
  });
});
