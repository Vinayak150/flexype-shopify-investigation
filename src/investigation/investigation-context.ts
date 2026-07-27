import type { InvestigationId } from "./identifiers.js";
import type { CompletionDisposition, InvestigationState } from "./states.js";

/**
 * Minimal Operator identity reference (D-001).
 * Not a merchant customer (INV-012).
 */
export interface OperatorRef {
  readonly kind: "Operator";
  readonly label?: string;
}

/**
 * Single Storefront target for an Investigation (INV-001; ADR-001).
 */
export interface StorefrontTarget {
  readonly kind: "StorefrontTarget";
  /** Public storefront URL or equivalent stable reference string. */
  readonly storefrontUrl: string;
}

/**
 * IO-001 Investigation Context — episode binding + one Storefront target.
 */
export interface InvestigationContext {
  readonly kind: "InvestigationContext";
  readonly investigationId: InvestigationId;
  readonly storefrontTarget: StorefrontTarget;
  readonly state: InvestigationState;
  readonly operator?: OperatorRef;
  readonly completionDisposition?: CompletionDisposition;
}

export function createStorefrontTarget(storefrontUrl: string): StorefrontTarget {
  const trimmed = storefrontUrl.trim();
  if (trimmed.length === 0) {
    throw new Error("StorefrontTarget.storefrontUrl must be non-empty");
  }
  return Object.freeze({
    kind: "StorefrontTarget",
    storefrontUrl: trimmed,
  });
}

export function createInvestigationContext(input: {
  readonly investigationId: InvestigationId;
  readonly storefrontTarget: StorefrontTarget;
  readonly state: InvestigationState;
  readonly operator?: OperatorRef;
  readonly completionDisposition?: CompletionDisposition;
}): InvestigationContext {
  const context: InvestigationContext = {
    kind: "InvestigationContext",
    investigationId: input.investigationId,
    storefrontTarget: input.storefrontTarget,
    state: input.state,
    ...(input.operator !== undefined
      ? { operator: Object.freeze({ ...input.operator }) }
      : {}),
    ...(input.completionDisposition !== undefined
      ? { completionDisposition: input.completionDisposition }
      : {}),
  };
  return Object.freeze(context);
}
