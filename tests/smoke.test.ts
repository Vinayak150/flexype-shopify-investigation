import { describe, expect, it } from "vitest";

import { PACKAGE_ID as investigationId } from "../src/investigation/index.js";

describe("E-001 workspace smoke", () => {
  it("loads package ownership placeholders", () => {
    expect(investigationId).toBe("P-001");
  });
});
