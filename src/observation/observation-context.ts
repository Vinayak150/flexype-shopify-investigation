import {
  InvestigationState,
  type InvestigationContext,
} from "../investigation/index.js";
import { ObservationEngineErrorCode, throwObservationError } from "./errors.js";

/**
 * Observation work bound to one Investigation Context / Storefront (ADR-001).
 */
export interface ObservationContext {
  readonly kind: "ObservationContext";
  readonly investigation: InvestigationContext;
}

export function createObservationContext(
  investigation: InvestigationContext,
): ObservationContext {
  if (investigation.kind !== "InvestigationContext") {
    throwObservationError(
      ObservationEngineErrorCode.InvalidInvestigationContext,
      "Observation requires a valid InvestigationContext",
    );
  }
  if (investigation.state !== InvestigationState.InProgress) {
    throwObservationError(
      ObservationEngineErrorCode.InvestigationNotInProgress,
      `Observation requires InProgress Investigation; got ${investigation.state}`,
    );
  }
  if (investigation.storefrontTarget.storefrontUrl.trim().length === 0) {
    throwObservationError(
      ObservationEngineErrorCode.InvalidInvestigationContext,
      "Observation requires a bound Storefront target",
    );
  }

  return Object.freeze({
    kind: "ObservationContext",
    investigation,
  });
}
