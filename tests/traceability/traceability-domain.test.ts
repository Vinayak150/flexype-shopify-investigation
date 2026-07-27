import { describe, expect, it } from "vitest";

import {
  createAssignmentObligationReference,
  createObligationId,
} from "../../src/traceability/index.js";

describe("P-008 Traceability domain contracts", () => {
  it("preserves ObligationId on AssignmentObligationReference", () => {
    const obligationId = createObligationId("FR-013");
    const reference = createAssignmentObligationReference({
      obligationId,
      description: "Not Detected under insufficient confidence",
    });

    expect(reference.obligationId).toBe(obligationId);
    expect(Object.isFrozen(reference)).toBe(true);
  });

  it("rejects empty ObligationId", () => {
    expect(() => createObligationId("")).toThrow(/non-empty/);
  });
});
