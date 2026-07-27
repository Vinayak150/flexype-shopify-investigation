import { describe, expect, it } from "vitest";

import {
  CompletionDisposition,
  createInvestigationContext,
  createInvestigationId,
  createStorefrontTarget,
  InvestigationState,
  validateInvestigationContext,
} from "../../src/investigation/index.js";

describe("P-001 Investigation domain contracts", () => {
  it("creates InvestigationContext and preserves InvestigationId", () => {
    const investigationId = createInvestigationId("inv-001");
    const context = createInvestigationContext({
      investigationId,
      storefrontTarget: createStorefrontTarget("https://example.myshopify.com"),
      state: InvestigationState.InProgress,
    });

    expect(context.investigationId).toBe(investigationId);
    expect(context.storefrontTarget.storefrontUrl).toBe(
      "https://example.myshopify.com",
    );
    expect(Object.isFrozen(context)).toBe(true);
  });

  it("rejects empty InvestigationId", () => {
    expect(() => createInvestigationId("   ")).toThrow(/non-empty/);
  });

  it("accepts valid InvestigationState and CompletionDisposition members", () => {
    const context = createInvestigationContext({
      investigationId: createInvestigationId("inv-002"),
      storefrontTarget: createStorefrontTarget("https://shop.example"),
      state: InvestigationState.CompletedPartial,
      completionDisposition: CompletionDisposition.UnknownQualified,
    });

    expect(validateInvestigationContext(context)).toBeUndefined();
  });

  it("flags missing storefront target as invalid domain state", () => {
    const broken = {
      kind: "InvestigationContext" as const,
      investigationId: createInvestigationId("inv-003"),
      storefrontTarget: {
        kind: "StorefrontTarget" as const,
        storefrontUrl: "   ",
      },
      state: InvestigationState.NotStarted,
    };

    const error = validateInvestigationContext(broken);
    expect(error?.code).toBe("MissingStorefrontTarget");
  });
});
