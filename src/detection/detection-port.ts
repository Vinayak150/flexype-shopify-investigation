import {
  CollaboratorStage,
  type DetectionPort,
  type InvestigationContext,
  type PortStageResult,
} from "../investigation/index.js";
import type { NormalizedEvidence } from "../evidence/index.js";
import type { DetectionEngine } from "./engine.js";
import { DetectionEngineError } from "./engine-errors.js";
import { DetectionOutcome } from "./outcomes.js";

export type NormalizedEvidenceResolver = (
  context: InvestigationContext,
) => NormalizedEvidence | undefined | Promise<NormalizedEvidence | undefined>;

/**
 * Fulfills E-003 DetectionPort using P-004 Detection Engine.
 */
export function createDetectionPort(
  engine: DetectionEngine,
  resolveEvidence: NormalizedEvidenceResolver,
): DetectionPort {
  return {
    async requestEvaluation(context: InvestigationContext): Promise<PortStageResult> {
      try {
        const evidence = await resolveEvidence(context);
        if (evidence === undefined) {
          return Object.freeze({
            stage: CollaboratorStage.Detection,
            ok: false,
            partial: true,
            detail: "Missing NormalizedEvidence for Detection evaluation",
          });
        }

        const output = engine.evaluate(context, evidence);
        const hasUnknown = output.results.results.some(
          (result) => result.outcome === DetectionOutcome.Unknown,
        );
        const hasPartial =
          output.storeInformation.themeAvailability === "Unavailable" ||
          output.results.results.some(
            (result) => result.outcome === DetectionOutcome.NotDetected,
          );

        return Object.freeze({
          stage: CollaboratorStage.Detection,
          ok: true,
          ...(hasPartial ? { partial: true } : {}),
          ...(hasUnknown ? { unknownQualified: true } : {}),
          detail: "DetectionResultSet ready from immutable Evidence",
        });
      } catch (error) {
        const detail =
          error instanceof DetectionEngineError
            ? error.message
            : "Detection evaluation failed";
        return Object.freeze({
          stage: CollaboratorStage.Detection,
          ok: false,
          partial: true,
          detail,
        });
      }
    },
  };
}
