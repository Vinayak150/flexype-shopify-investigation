import { describe, expect, it } from "vitest";
import { readFileSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import {
  createMemoryConfigurationRetriever,
  ProductConfigurationState,
} from "../../src/configuration/index.js";
import { FlexyPeProductId } from "../../src/detection/index.js";
import {
  InvestigationState,
  ORCHESTRATION_ORDER,
} from "../../src/investigation/index.js";
import {
  createMemoryBrowserPorts,
  createMemoryDomPorts,
} from "../../src/observation/index.js";
import {
  createSystemRuntime,
  IntegrationError,
} from "../../extension/index.js";

const extensionDir = join(
  dirname(fileURLToPath(import.meta.url)),
  "../../extension",
);

describe("E-011 System Integration", () => {
  it("starts up, runs full Investigation pipeline, and shuts down", async () => {
    const runtime = createSystemRuntime();
    expect(runtime.getStatus()).toBe("uninitialized");

    runtime.startup({
      enableTraceability: true,
      configurationElection: "deferred",
    });
    expect(runtime.getStatus()).toBe("ready");

    const result = await runtime.runInvestigation("https://demo.myshopify.com", {
      kind: "OperatorIntent",
      label: "integration-operator",
    });

    expect(result.kind).toBe("IntegratedInvestigationResult");
    expect(result.stageResults.map((stage) => stage.stage)).toEqual([
      ...ORCHESTRATION_ORDER,
    ]);
    expect(result.stageResults.every((stage) => stage.ok)).toBe(true);
    expect(result.evidence?.kind).toBe("NormalizedEvidence");
    expect(result.detection?.results.kind).toBe("DetectionResultSet");
    expect(result.report?.kind).toBe("DiagnosticReport");
    expect(result.view?.kind).toBe("PresentationReadyView");
    expect(result.popupShell?.kind).toBe("PopupShellBinding");
    expect(result.popupShell?.view).toBe(result.view);
    expect([
      InvestigationState.Completed,
      InvestigationState.CompletedPartial,
    ]).toContain(result.context.state);
    expect(result.context.completionDisposition).toBeDefined();

    runtime.shutdown();
    expect(runtime.getStatus()).toBe("shutdown");
    expect(() => runtime.startup()).toThrow(IntegrationError);
  });

  it("wires collaborator ports in approved pipeline order", async () => {
    const runtime = createSystemRuntime();
    runtime.startup();

    const result = await runtime.runInvestigation("https://ports.example");
    expect(result.stageResults.map((stage) => stage.stage)).toEqual([
      ...ORCHESTRATION_ORDER,
    ]);
    expect(result.evidence).toBeDefined();
    expect(result.report).toBeDefined();
    expect(result.view).toBeDefined();
    runtime.shutdown();
  });

  it("completes Observation → Evidence → Detection → Reporting → Presentation", async () => {
    const runtime = createSystemRuntime();
    runtime.startup();
    const result = await runtime.runInvestigation("https://flow.example");

    const byStage = new Map(
      result.stageResults.map((stage) => [stage.stage, stage]),
    );
    expect(byStage.get("Observation")?.ok).toBe(true);
    expect(byStage.get("Evidence")?.ok).toBe(true);
    expect(byStage.get("Detection")?.ok).toBe(true);
    expect(byStage.get("Reporting")?.ok).toBe(true);
    expect(byStage.get("Presentation")?.ok).toBe(true);
    expect(result.view?.report).toBe(result.report);
    runtime.shutdown();
  });

  it("completes core path without Configuration (FR-026)", async () => {
    const runtime = createSystemRuntime();
    runtime.startup({
      configurationElection: "deferred",
      enableTraceability: false,
    });

    const result = await runtime.runInvestigation("https://no-config.example");

    expect(result.report).toBeDefined();
    expect(result.view).toBeDefined();
    expect(result.configuration?.state).toBe(
      ProductConfigurationState.NotInScope,
    );
    expect(result.report?.productConfiguration).toBeUndefined();
    expect(result.traceExport).toBeUndefined();
    runtime.shutdown();
  });

  it("supports optional Configuration pursue without gating core success", async () => {
    const runtime = createSystemRuntime();
    runtime.startup({
      configurationElection: "pursued",
      configurationRetriever: createMemoryConfigurationRetriever({
        materialsByProduct: new Map([
          [FlexyPeProductId.Checkout, "checkout.fixture=true"],
        ]),
      }),
    });

    const result = await runtime.runInvestigation("https://cfg.example");

    expect(result.report).toBeDefined();
    expect(result.view).toBeDefined();
    expect(result.configuration).toBeDefined();
    expect([
      ProductConfigurationState.Available,
      ProductConfigurationState.Unavailable,
    ]).toContain(result.configuration?.state);
    runtime.shutdown();
  });

  it("keeps Traceability non-blocking and optional", async () => {
    const withTrace = createSystemRuntime();
    withTrace.startup({ enableTraceability: true });
    const traced = await withTrace.runInvestigation("https://trace-on.example");
    expect(traced.traceExport?.kind).toBe("TraceExport");
    expect(traced.report).toBeDefined();
    withTrace.shutdown();

    const withoutTrace = createSystemRuntime();
    withoutTrace.startup({ enableTraceability: false });
    const plain = await withoutTrace.runInvestigation(
      "https://trace-off.example",
    );
    expect(plain.traceExport).toBeUndefined();
    expect(plain.report).toBeDefined();
    withoutTrace.shutdown();
  });

  it("propagates partial outcomes honestly without fabricating Detected certainty", async () => {
    const runtime = createSystemRuntime();
    runtime.startup({
      browser: createMemoryBrowserPorts({
        documentReachable: false,
        metadataReachable: false,
      }),
      dom: createMemoryDomPorts({
        traversalCapable: false,
        queryCapable: false,
      }),
    });

    const result = await runtime.runInvestigation("https://partial.example");

    expect(result.stageResults.some((stage) => stage.partial === true)).toBe(
      true,
    );
    expect(result.context.state).toBe(InvestigationState.CompletedPartial);
    expect(result.context.completionDisposition).not.toBe("Completed");
    const detected = result.detection?.results.results.filter(
      (item) => item.outcome === "Detected",
    );
    expect(detected?.length ?? 0).toBe(0);
    runtime.shutdown();
  });

  it("preserves Evidence immutability across later pipeline stages", async () => {
    const runtime = createSystemRuntime();
    runtime.startup();
    const result = await runtime.runInvestigation("https://immutable.example");

    expect(result.evidence).toBeDefined();
    expect(Object.isFrozen(result.evidence)).toBe(true);
    expect(Object.isFrozen(result.evidence?.items)).toBe(true);
    expect(() => {
      (result.evidence as unknown as { items: unknown[] }).items = [];
    }).toThrow();
    expect(result.report?.investigationId).toBe(result.evidence?.investigationId);
    expect(result.view?.report.investigationId).toBe(
      result.evidence?.investigationId,
    );
    runtime.shutdown();
  });

  it("keeps composition free of package business implementations", () => {
    const files = readdirSync(extensionDir).filter((name) =>
      name.endsWith(".ts"),
    );
    const sources = files.map((file) =>
      readFileSync(join(extensionDir, file), "utf8"),
    );

    for (const source of sources) {
      expect(source).not.toMatch(/class DefinitionEvaluator/);
      expect(source).not.toMatch(/createDefaultDefinitionRegistry/);
      expect(source).not.toMatch(/normalize\(evidenceSet/);
      expect(source).not.toMatch(/assembleDiagnosticReport/);
    }
  });
});
