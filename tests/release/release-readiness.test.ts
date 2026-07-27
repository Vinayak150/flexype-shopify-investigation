import { describe, expect, it } from "vitest";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { FLEXYPE_PRODUCT_IDS, DOMAIN_UNKNOWN_IDS } from "../../src/detection/index.js";
import {
  CORE_VS_OPTIONAL_STATEMENT,
  RESIDUAL_OPEN_UNKNOWNS,
} from "../e2e/gate-evidence.js";

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), "../..");

describe("E-013 release readiness checks", () => {
  it("keeps CI commands aligned with local release:check scripts", () => {
    const ci = readFileSync(join(repoRoot, ".github/workflows/ci.yml"), "utf8");
    const pkg = JSON.parse(readFileSync(join(repoRoot, "package.json"), "utf8")) as {
      scripts: Record<string, string>;
    };

    expect(pkg.scripts.typecheck).toBeDefined();
    expect(pkg.scripts.lint).toBeDefined();
    expect(pkg.scripts["format:check"]).toBeDefined();
    expect(pkg.scripts.test).toBeDefined();
    expect(pkg.scripts.build).toBeDefined();
    expect(pkg.scripts["release:check"]).toContain("typecheck");
    expect(pkg.scripts["release:check"]).toContain("format:check");

    expect(ci).toMatch(/npm ci/);
    expect(ci).toMatch(/npm run typecheck/);
    expect(ci).toMatch(/npm run lint/);
    expect(ci).toMatch(/npm run format:check/);
    expect(ci).toMatch(/npm test/);
    expect(ci).toMatch(/npm run build/);
  });

  it("preserves repository roots and freeze authorities", () => {
    for (const path of [
      "architecture",
      "adr",
      "implementation",
      "src",
      "extension",
      "tests",
      "docs",
      "assets",
      "tooling",
      "README.md",
      "LICENSE",
      "docs/RELEASE_SIGN_OFF.md",
      "tooling/check-release-readiness.sh",
      "tooling/check-architecture-freeze.sh",
    ]) {
      expect(existsSync(join(repoRoot, path))).toBe(true);
    }
  });

  it("records Configuration election and residual Open Unknowns for release", () => {
    const signOff = readFileSync(join(repoRoot, "docs/RELEASE_SIGN_OFF.md"), "utf8");
    expect(signOff).toMatch(/Pursued/);
    expect(signOff).toMatch(/Deferred/);
    expect(signOff).toMatch(/RG-M9/);
    expect(signOff).toMatch(/Accept/);
    expect(RESIDUAL_OPEN_UNKNOWNS).toEqual(DOMAIN_UNKNOWN_IDS);
    expect(CORE_VS_OPTIONAL_STATEMENT).toMatch(/without Configuration/);
  });

  it("keeps closed FlexyPe product set intact at release", () => {
    expect(FLEXYPE_PRODUCT_IDS).toEqual(["Checkout", "FlexyPass", "FlexyCart"]);
  });

  it("documents setup and package ownership in README", () => {
    const readme = readFileSync(join(repoRoot, "README.md"), "utf8");
    expect(readme).toMatch(/npm install/);
    expect(readme).toMatch(/release:check/);
    expect(readme).toMatch(/src\/investigation\//);
    expect(readme).toMatch(/extension\//);
    expect(readme).toMatch(/FR-026/);
  });
});
