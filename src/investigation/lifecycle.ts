import { randomUUID } from "node:crypto";

import { createInvestigationId } from "./identifiers.js";
import {
  createInvestigationContext,
  createStorefrontTarget,
  type InvestigationContext,
  type OperatorRef,
  type StorefrontTarget,
} from "./investigation-context.js";
import {
  CompletionDisposition,
  InvestigationState,
  type CompletionDisposition as CompletionDispositionType,
} from "./states.js";
import { InvestigationEngineErrorCode, throwEngineError } from "./engine-errors.js";
import { validateInvestigationContext } from "./validation.js";

function assertValid(context: InvestigationContext): void {
  const error = validateInvestigationContext(context);
  if (error !== undefined) {
    throwEngineError(InvestigationEngineErrorCode.IllegalTransition, error.message);
  }
}

function dispositionToState(
  disposition: CompletionDispositionType,
): (typeof InvestigationState)[keyof typeof InvestigationState] {
  switch (disposition) {
    case CompletionDisposition.Completed:
      return InvestigationState.Completed;
    case CompletionDisposition.CompletedPartial:
      return InvestigationState.CompletedPartial;
    case CompletionDisposition.UnknownQualified:
      // Domain Investigation states have no separate UnknownQualified; honesty maps to partial.
      return InvestigationState.CompletedPartial;
    case CompletionDisposition.NotApplicable:
      return InvestigationState.NotApplicable;
    default: {
      const _exhaustive: never = disposition;
      return _exhaustive;
    }
  }
}

/**
 * Owns legal InvestigationState transitions for one episode (E-003).
 * Identity and Storefront target are immutable after creation (ADR-001).
 */
export class InvestigationLifecycle {
  /**
   * Create a NotStarted Investigation bound to exactly one Storefront target.
   */
  create(input: {
    readonly storefrontTarget: StorefrontTarget | string;
    readonly operator?: OperatorRef;
    readonly investigationId?: string;
  }): InvestigationContext {
    const storefrontTarget =
      typeof input.storefrontTarget === "string"
        ? createStorefrontTarget(input.storefrontTarget)
        : input.storefrontTarget;

    const context = createInvestigationContext({
      investigationId: createInvestigationId(input.investigationId ?? randomUUID()),
      storefrontTarget,
      state: InvestigationState.NotStarted,
      ...(input.operator !== undefined ? { operator: input.operator } : {}),
    });
    assertValid(context);
    return context;
  }

  /**
   * S-001: NotStarted → InProgress. Configuration is never required.
   */
  initiate(context: InvestigationContext): InvestigationContext {
    assertValid(context);
    if (context.state !== InvestigationState.NotStarted) {
      throwEngineError(
        InvestigationEngineErrorCode.IllegalTransition,
        `Cannot initiate from state ${context.state}`,
      );
    }

    const next = createInvestigationContext({
      investigationId: context.investigationId,
      storefrontTarget: context.storefrontTarget,
      state: InvestigationState.InProgress,
      ...(context.operator !== undefined ? { operator: context.operator } : {}),
    });
    assertValid(next);
    return next;
  }

  /**
   * Apply Completion Disposition → terminal InvestigationState.
   */
  dispose(
    context: InvestigationContext,
    disposition: CompletionDispositionType,
  ): InvestigationContext {
    assertValid(context);
    if (context.state !== InvestigationState.InProgress) {
      throwEngineError(
        InvestigationEngineErrorCode.EpisodeNotInProgress,
        `Cannot dispose from state ${context.state}`,
      );
    }
    if (disposition === undefined) {
      throwEngineError(
        InvestigationEngineErrorCode.CompletionWithoutDisposition,
        "Completion requires an explicit CompletionDisposition",
      );
    }

    const next = createInvestigationContext({
      investigationId: context.investigationId,
      storefrontTarget: context.storefrontTarget,
      state: dispositionToState(disposition),
      completionDisposition: disposition,
      ...(context.operator !== undefined ? { operator: context.operator } : {}),
    });
    assertValid(next);
    return next;
  }

  /**
   * Forbidden: rebinding Storefront on the same InvestigationId (ADR-001).
   */
  assertSameStorefrontBinding(
    context: InvestigationContext,
    candidate: StorefrontTarget,
  ): void {
    if (context.storefrontTarget.storefrontUrl !== candidate.storefrontUrl) {
      throwEngineError(
        InvestigationEngineErrorCode.StorefrontRebindForbidden,
        "Storefront target is immutable for an Investigation; create a new Investigation instead",
      );
    }
  }

  isTerminal(context: InvestigationContext): boolean {
    return (
      context.state === InvestigationState.Completed ||
      context.state === InvestigationState.CompletedPartial ||
      context.state === InvestigationState.NotApplicable
    );
  }
}
