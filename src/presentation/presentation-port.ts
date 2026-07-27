import {
  CollaboratorStage,
  type InvestigationContext,
  type PortStageResult,
  type PresentationPort,
} from "../investigation/index.js";
import type { DiagnosticReport } from "../reporting/index.js";
import type { PresentationEngine } from "./engine.js";
import { PresentationEngineError } from "./engine-errors.js";

export type DiagnosticReportResolver = (
  context: InvestigationContext,
) => DiagnosticReport | undefined | Promise<DiagnosticReport | undefined>;

/**
 * Fulfills E-003 PresentationPort using P-006 Presentation Engine.
 */
export function createPresentationPort(
  engine: PresentationEngine,
  resolveReport: DiagnosticReportResolver,
): PresentationPort {
  return {
    async requestPreparation(context: InvestigationContext): Promise<PortStageResult> {
      try {
        const report = await resolveReport(context);
        if (report === undefined) {
          return Object.freeze({
            stage: CollaboratorStage.Presentation,
            ok: false,
            partial: true,
            detail: "Missing DiagnosticReport for Presentation projection",
          });
        }

        const view = engine.present(context, report);
        return Object.freeze({
          stage: CollaboratorStage.Presentation,
          ok: true,
          ...(view.unknownVisible || view.notDetectedVisible ? { partial: true } : {}),
          ...(view.unknownVisible ? { unknownQualified: true } : {}),
          detail: "PresentationReadyView projected from DiagnosticReport",
        });
      } catch (error) {
        const detail =
          error instanceof PresentationEngineError
            ? error.message
            : "Presentation projection failed";
        return Object.freeze({
          stage: CollaboratorStage.Presentation,
          ok: false,
          partial: true,
          detail,
        });
      }
    },
  };
}
