import { describe, expect, it } from "vitest";

import {
  createInvestigationId,
  createStorefrontTarget,
} from "../../src/investigation/index.js";
import { createObservationAffordance } from "../../src/observation/index.js";

describe("P-002 Observation domain contracts", () => {
  it("creates ObservationAffordance bound to InvestigationId and StorefrontTarget", () => {
    const investigationId = createInvestigationId("inv-obs-1");
    const storefrontTarget = createStorefrontTarget("https://store.example");
    const affordance = createObservationAffordance({
      investigationId,
      storefrontTarget,
      isPubliclyObservable: true,
    });

    expect(affordance.investigationId).toBe(investigationId);
    expect(affordance.storefrontTarget).toBe(storefrontTarget);
    expect(Object.isFrozen(affordance)).toBe(true);
  });
});
