import { describe, expect, it } from "vitest";
import { existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { PACKAGE_ID as investigationId } from "../../src/investigation/index.js";
import { PACKAGE_ID as presentationId } from "../../src/presentation/index.js";
import { PACKAGE_ID as traceabilityId } from "../../src/traceability/index.js";
import { DOMAIN_UNKNOWN_IDS } from "../../src/detection/index.js";
import { createSystemRuntime } from "../../extension/index.js";
import { runCorePathE2E } from "./fixtures.js";
import {
  CORE_VS_OPTIONAL_STATEMENT,
  E012_SUITE_MAP,
  E012_T_STATUS,
  E012_VD_STATUS,
  RESIDUAL_OPEN_UNKNOWNS,
} from "./gate-evidence.js";

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), "../..");

describe("E-012 e2e — regression gates and M8 evidence pack (T1–T6 / VD-001–VD-009)", () => {
  it("reconfirms T0–T2 foundations remain loadable", () => {
    expect(investigationId).toBe("P-001");
    expect(presentationId).toBe("P-006");
    expect(traceabilityId).toBe("P-008");
    expect(existsSync(join(repoRoot, "architecture/00_PROJECT_VISION.md"))).toBe(
      true,
    );
    expect(existsSync(join(repoRoot, "adr"))).toBe(true);
    expect(existsSync(join(repoRoot, "extension/composition.ts"))).toBe(true);
  });

  it("reconfirms T5 integration composition startup/shutdown", () => {
    const runtime = createSystemRuntime();
    runtime.startup({ configurationElection: "deferred" });
    expect(runtime.getStatus()).toBe("ready");
    runtime.shutdown();
    expect(runtime.getStatus()).toBe("shutdown");
  });

  it("reconfirms T6 core path end-to-end under E-011 composition", async () => {
    const { runtime, result } = await runCorePathE2E();
    expect(result.stageResults).toHaveLength(5);
    expect(result.report).toBeDefined();
    expect(result.view).toBeDefined();
    expect(result.context.completionDisposition).toBeDefined();
    runtime.shutdown();
  });

  it("records VD-001–VD-009 and T0–T6 gate evidence without closing Unknowns", () => {
    expect(Object.keys(E012_VD_STATUS)).toEqual([
      "VD-001",
      "VD-002",
      "VD-003",
      "VD-004",
      "VD-005",
      "VD-006",
      "VD-007",
      "VD-008",
      "VD-009",
    ]);
    expect(Object.keys(E012_T_STATUS)).toEqual([
      "T0",
      "T1",
      "T2",
      "T3",
      "T4",
      "T5",
      "T6",
    ]);
    expect(E012_SUITE_MAP.length).toBeGreaterThanOrEqual(8);
    expect(CORE_VS_OPTIONAL_STATEMENT).toMatch(/without Configuration/);
    expect(RESIDUAL_OPEN_UNKNOWNS).toEqual(DOMAIN_UNKNOWN_IDS);
  });

  it("keeps Open Unknown registry explicit (EP-003 / VD-009)", () => {
    expect(RESIDUAL_OPEN_UNKNOWNS).toHaveLength(10);
    for (const id of RESIDUAL_OPEN_UNKNOWNS) {
      expect(id).toMatch(/^U-0(0[1-9]|10)$/);
    }
  });
});
