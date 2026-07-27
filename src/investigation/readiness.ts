import type { PortStageResult } from "./ports.js";

/**
 * Opaque completion readiness inputs for IO-012 disposition (P-001).
 * Investigation must not re-enter Evidence/Detection ownership to “fix” outcomes.
 */
export interface CompletionReadiness {
  readonly reportReady: boolean;
  readonly presentationReady: boolean;
  readonly hasPartialSignals: boolean;
  readonly hasUnknownQualificationSignals: boolean;
  /**
   * Reserved U-008 path only when explicitly signaled.
   * No mandated non-Shopify empty-state behavior is invented here.
   */
  readonly notApplicableRequested?: boolean;
}

export function createCompletionReadiness(
  input: CompletionReadiness,
): CompletionReadiness {
  return Object.freeze({
    reportReady: input.reportReady,
    presentationReady: input.presentationReady,
    hasPartialSignals: input.hasPartialSignals,
    hasUnknownQualificationSignals: input.hasUnknownQualificationSignals,
    ...(input.notApplicableRequested !== undefined
      ? { notApplicableRequested: input.notApplicableRequested }
      : {}),
  });
}

export function readinessFromPortResults(
  results: readonly PortStageResult[],
): CompletionReadiness {
  const byStage = new Map(results.map((result) => [result.stage, result]));
  const reporting = byStage.get("Reporting");
  const presentation = byStage.get("Presentation");

  return createCompletionReadiness({
    reportReady: reporting?.ok === true,
    presentationReady: presentation?.ok === true,
    hasPartialSignals: results.some((result) => result.partial === true),
    hasUnknownQualificationSignals: results.some(
      (result) => result.unknownQualified === true,
    ),
  });
}
