import { describe, expect, it } from "vitest";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), "../..");

describe("E-012 e2e — documentation obligations (FR-024 / NFR-003)", () => {
  it("keeps operator/submission documentation roots present", () => {
    expect(existsSync(join(repoRoot, "docs/README.md"))).toBe(true);
    expect(existsSync(join(repoRoot, "docs/DOMAIN_VOCABULARY.md"))).toBe(true);
    expect(
      existsSync(join(repoRoot, "implementation/06_ACCEPTANCE_CHECKLIST.md")),
    ).toBe(true);
  });

  it("documents local setup and points to architecture as SoT", () => {
    const readme = readFileSync(join(repoRoot, "docs/README.md"), "utf8");
    expect(readme).toMatch(/FR-024/);
    expect(readme).toMatch(/npm install/);
    expect(readme).toMatch(/npm test/);
    expect(readme).toMatch(/architecture\//);
  });

  it("keeps Acceptance Checklist available for M8→M9 evidence", () => {
    const checklist = readFileSync(
      join(repoRoot, "implementation/06_ACCEPTANCE_CHECKLIST.md"),
      "utf8",
    );
    expect(checklist).toMatch(/FR-026/);
    expect(checklist).toMatch(/U-001/);
    expect(checklist).toMatch(/ADR-001/);
  });
});
