import { describe, expect, it } from "vitest";
import { readFileSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { PACKAGE_ID as investigationPkg } from "../../src/investigation/index.js";
import { PACKAGE_ID as observationPkg } from "../../src/observation/index.js";
import { PACKAGE_ID as evidencePkg } from "../../src/evidence/index.js";
import { PACKAGE_ID as detectionPkg } from "../../src/detection/index.js";
import { PACKAGE_ID as reportingPkg } from "../../src/reporting/index.js";
import { PACKAGE_ID as presentationPkg } from "../../src/presentation/index.js";
import { PACKAGE_ID as configurationPkg } from "../../src/configuration/index.js";
import { PACKAGE_ID as traceabilityPkg } from "../../src/traceability/index.js";
import { runCorePathE2E } from "./fixtures.js";

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), "../..");

function packageSources(packageName: string): string[] {
  const dir = join(repoRoot, "src", packageName);
  return readdirSync(dir)
    .filter((name) => name.endsWith(".ts"))
    .map((name) => readFileSync(join(dir, name), "utf8"));
}

function extensionSources(): string[] {
  const dir = join(repoRoot, "extension");
  return readdirSync(dir)
    .filter((name) => name.endsWith(".ts"))
    .map((name) => readFileSync(join(dir, name), "utf8"));
}

describe("E-012 e2e — architecture ownership boundaries (VD-002 / VD-008)", () => {
  it("preserves package ownership IDs", () => {
    expect(investigationPkg).toBe("P-001");
    expect(observationPkg).toBe("P-002");
    expect(evidencePkg).toBe("P-003");
    expect(detectionPkg).toBe("P-004");
    expect(reportingPkg).toBe("P-005");
    expect(presentationPkg).toBe("P-006");
    expect(configurationPkg).toBe("P-007");
    expect(traceabilityPkg).toBe("P-008");
  });

  it("Observation does not detect or own Evidence/Detection conclusions", () => {
    for (const source of packageSources("observation")) {
      expect(source).not.toMatch(/from ["']\.\.\/detection\//);
      expect(source).not.toMatch(/from ["']\.\.\/evidence\//);
      expect(source).not.toMatch(
        /DetectionOutcome|NormalizedEvidence|DiagnosticReport/,
      );
      expect(source).not.toMatch(/evaluateDetection|assembleReport/);
    }
  });

  it("Evidence does not conclude products or evaluate Detection", () => {
    for (const source of packageSources("evidence")) {
      expect(source).not.toMatch(/from ["']\.\.\/detection\//);
      expect(source).not.toMatch(
        /DetectionOutcome|DetectionEngine|DefinitionEvaluator/,
      );
      expect(source).not.toMatch(/assembleReport|PresentationReadyView/);
    }
  });

  it("Detection does not collect Evidence or access Observation browser ports", () => {
    for (const source of packageSources("detection")) {
      expect(source).not.toMatch(/from ["']\.\.\/observation\//);
      expect(source).not.toMatch(
        /EvidenceCollector|acquireAndNormalize|FactSourcePort/,
      );
      expect(source).not.toMatch(/createMemoryBrowserPorts|BrowserDiscoveryPorts/);
      expect(source).not.toMatch(/assembleReport|PresentationEngine/);
    }
  });

  it("Reporting does not evaluate Detection or recollect Evidence", () => {
    for (const source of packageSources("reporting")) {
      expect(source).not.toMatch(/from ["']\.\.\/evidence\//);
      expect(source).not.toMatch(/from ["']\.\.\/observation\//);
      expect(source).not.toMatch(/DefinitionEvaluator|DetectionEngine\.evaluate/);
      expect(source).not.toMatch(/EvidenceCollector|acquireAndNormalize/);
    }
  });

  it("Presentation does not modify Detection meaning or collect Evidence", () => {
    for (const source of packageSources("presentation")) {
      expect(source).not.toMatch(/from ["']\.\.\/evidence\//);
      expect(source).not.toMatch(/from ["']\.\.\/observation\//);
      expect(source).not.toMatch(/EvidenceCollector|acquireAndNormalize/);
      expect(source).not.toMatch(/DefinitionEvaluator|DetectionEngine/);
      expect(source).not.toMatch(/createDiagnosticReport|ReportAssembler/);
    }
  });

  it("extension composition wires packages without absorbing business engines", () => {
    for (const source of extensionSources()) {
      expect(source).not.toMatch(/class DefinitionEvaluator/);
      expect(source).not.toMatch(/createDefaultDefinitionRegistry/);
      expect(source).not.toMatch(/class EvidenceCollector/);
      expect(source).not.toMatch(/class ReportAssembler/);
      expect(source).not.toMatch(/class ViewProjector/);
    }
  });

  it("runtime path still yields Report/View without ownership inversion", async () => {
    const { runtime, result } = await runCorePathE2E();
    expect(result.report?.kind).toBe("DiagnosticReport");
    expect(result.view?.kind).toBe("PresentationReadyView");
    expect(result.view?.report).toBe(result.report);
    runtime.shutdown();
  });
});
