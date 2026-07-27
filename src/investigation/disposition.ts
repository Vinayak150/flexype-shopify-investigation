import {
  CompletionDisposition,
  type CompletionDisposition as CompletionDispositionType,
} from "./states.js";
import type { CompletionReadiness } from "./readiness.js";
import { InvestigationEngineErrorCode, throwEngineError } from "./engine-errors.js";

/**
 * Resolve IO-012 Completion Disposition from readiness signals (ADR-006).
 * Never fabricates Completed when incompleteness/Unknown is signaled.
 */
export function resolveCompletionDisposition(
  readiness: CompletionReadiness,
): CompletionDispositionType {
  if (readiness.notApplicableRequested === true) {
    return CompletionDisposition.NotApplicable;
  }

  if (!readiness.reportReady) {
    throwEngineError(
      InvestigationEngineErrorCode.CompletionWithoutReadiness,
      "Cannot dispose Investigation without Report readiness",
    );
  }

  if (readiness.hasUnknownQualificationSignals) {
    return CompletionDisposition.UnknownQualified;
  }

  if (readiness.hasPartialSignals || !readiness.presentationReady) {
    return CompletionDisposition.CompletedPartial;
  }

  return CompletionDisposition.Completed;
}
