import {
  CollaboratorStage,
  type InvestigationContext,
  type PortStageResult,
  type ReportingPort,
} from "../investigation/index.js";
import type { ReportingEngine } from "./engine.js";
import { ReportingEngineError } from "./engine-errors.js";
import type { ReportAssemblyInput } from "./inputs.js";
import { ReportCompletenessKind } from "./completeness.js";

export type DetectionOutputsResolver = (
  context: InvestigationContext,
) => ReportAssemblyInput | undefined | Promise<ReportAssemblyInput | undefined>;

/**
 * Fulfills E-003 ReportingPort using P-005 Reporting Engine.
 */
export function createReportingPort(
  engine: ReportingEngine,
  resolveDetectionOutputs: DetectionOutputsResolver,
): ReportingPort {
  return {
    async requestAssembly(context: InvestigationContext): Promise<PortStageResult> {
      try {
        const input = await resolveDetectionOutputs(context);
        if (input === undefined) {
          return Object.freeze({
            stage: CollaboratorStage.Reporting,
            ok: false,
            partial: true,
            detail: "Missing Detection outputs for Report assembly",
          });
        }

        const report = engine.assemble(context, input, {
          assembledAtIso: "1970-01-01T00:00:00.000Z",
        });
        const partial =
          report.completeness.completenessKind !==
          ReportCompletenessKind.CompleteAsObtainable;
        const unknownQualified =
          report.completeness.completenessKind ===
          ReportCompletenessKind.UnknownInfluenced;

        return Object.freeze({
          stage: CollaboratorStage.Reporting,
          ok: true,
          ...(partial ? { partial: true } : {}),
          ...(unknownQualified ? { unknownQualified: true } : {}),
          detail: "DiagnosticReport assembled from Detection outputs",
        });
      } catch (error) {
        const detail =
          error instanceof ReportingEngineError
            ? error.message
            : "Report assembly failed";
        return Object.freeze({
          stage: CollaboratorStage.Reporting,
          ok: false,
          partial: true,
          detail,
        });
      }
    },
  };
}
