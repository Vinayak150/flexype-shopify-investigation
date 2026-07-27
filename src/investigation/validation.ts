import type { InvestigationContext } from "./investigation-context.js";
import {
  createInvestigationContractError,
  type InvestigationContractError,
  InvestigationContractErrorCode,
} from "./errors.js";
import {
  COMPLETION_DISPOSITIONS,
  INVESTIGATION_STATES,
  type CompletionDisposition,
  type InvestigationState,
} from "./states.js";

export function isInvestigationState(value: string): value is InvestigationState {
  return (INVESTIGATION_STATES as readonly string[]).includes(value);
}

export function isCompletionDisposition(value: string): value is CompletionDisposition {
  return (COMPLETION_DISPOSITIONS as readonly string[]).includes(value);
}

/**
 * Structural rule: exactly one Storefront target per InvestigationId (INV-001).
 */
export function validateInvestigationContext(
  context: InvestigationContext,
): InvestigationContractError | undefined {
  if (String(context.investigationId).trim().length === 0) {
    return createInvestigationContractError(
      InvestigationContractErrorCode.EmptyInvestigationId,
      "InvestigationId must be non-empty",
    );
  }

  if (
    context.storefrontTarget === undefined ||
    context.storefrontTarget.storefrontUrl.trim().length === 0
  ) {
    return createInvestigationContractError(
      InvestigationContractErrorCode.MissingStorefrontTarget,
      "InvestigationContext requires exactly one Storefront target",
    );
  }

  if (!isInvestigationState(context.state)) {
    return createInvestigationContractError(
      InvestigationContractErrorCode.InvalidInvestigationState,
      `Invalid InvestigationState: ${String(context.state)}`,
    );
  }

  if (
    context.completionDisposition !== undefined &&
    !isCompletionDisposition(context.completionDisposition)
  ) {
    return createInvestigationContractError(
      InvestigationContractErrorCode.InvalidCompletionDisposition,
      `Invalid CompletionDisposition: ${String(context.completionDisposition)}`,
    );
  }

  return undefined;
}
