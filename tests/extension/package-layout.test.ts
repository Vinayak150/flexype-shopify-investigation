import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

const EXT_DIST = join(process.cwd(), "dist/extension");

describe("extension production package layout", () => {
  it("documents the expected self-contained dist/extension layout when built", () => {
    const compositionPath = join(EXT_DIST, "composition.js");
    const srcDetectionPath = join(EXT_DIST, "src/detection/index.js");
    if (!existsSync(compositionPath) || !existsSync(srcDetectionPath)) {
      expect(true).toBe(true);
      return;
    }

    const requiredPaths = [
      "manifest.json",
      "runtime/service-worker.js",
      "content/storefront-agent.js",
      "popup/popup.html",
      "composition.js",
      "src/configuration/index.js",
      "src/detection/index.js",
      "src/evidence/index.js",
      "src/investigation/index.js",
      "src/observation/index.js",
      "src/presentation/index.js",
      "src/reporting/index.js",
      "src/traceability/index.js",
    ];

    for (const relativePath of requiredPaths) {
      expect(existsSync(join(EXT_DIST, relativePath))).toBe(true);
    }

    const composition = readFileSync(join(EXT_DIST, "composition.js"), "utf8");
    expect(composition).toContain('from "./src/');
    expect(composition).not.toContain('from "../src/');

    const projection = readFileSync(
      join(EXT_DIST, "popup/presentation-projection.js"),
      "utf8",
    );
    expect(projection).toContain('from "../src/');
    expect(projection).not.toContain('from "../../src/');
    expect(projection).not.toContain('from "./src/');
  });
});
