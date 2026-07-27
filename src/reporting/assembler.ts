import type { InvestigationContext } from "../investigation/index.js";
import { CompletenessAnnotator } from "./completeness.js";
import { createDiagnosticReport, type DiagnosticReport } from "./diagnostic-report.js";
import { ReportingEngineErrorCode, throwReportingError } from "./engine-errors.js";
import { ExplanationAggregator } from "./explanations.js";
import type { ReportAssemblyInput } from "./inputs.js";
import { createReportMetadata } from "./metadata.js";
import { buildReportSections } from "./sections.js";

/**
 * Assemble IO-009 from Detection outputs (+ optional Configuration adjunct).
 * Must not call Evidence/Observation/Detection evaluation or mutate outcomes.
 */
export class ReportAssembler {
  private readonly explanations = new ExplanationAggregator();
  private readonly completeness = new CompletenessAnnotator();

  assemble(
    context: InvestigationContext,
    input: ReportAssemblyInput,
    options?: { readonly assembledAtIso?: string },
  ): DiagnosticReport {
    this.validate(context, input);

    const detection = input.detection;
    const unknownQualifications = Object.freeze([...detection.unknownQualifications]);
    const aggregatedExplanations = this.explanations.aggregate(detection.explanations);
    const completeness = this.completeness.annotate({
      storeInformation: detection.storeInformation,
      detectionResultSet: detection.detectionResultSet,
      unknownQualifications,
      configurationAbsent: input.productConfiguration === undefined,
    });

    const sections = buildReportSections({
      storeInformation: detection.storeInformation,
      results: detection.detectionResultSet.results,
      unknownQualifications,
      completenessKind: completeness.completenessKind,
      ...(input.productConfiguration !== undefined
        ? { productConfiguration: input.productConfiguration }
        : {}),
    });

    return createDiagnosticReport({
      investigationId: context.investigationId,
      metadata: createReportMetadata({
        investigationId: context.investigationId,
        storefrontTarget: context.storefrontTarget,
        ...(options?.assembledAtIso !== undefined
          ? { assembledAtIso: options.assembledAtIso }
          : { assembledAtIso: "1970-01-01T00:00:00.000Z" }),
      }),
      storeInformation: detection.storeInformation,
      detectionResultSet: detection.detectionResultSet,
      unknownQualifications,
      explanations: aggregatedExplanations,
      sections,
      completeness,
      ...(input.productConfiguration !== undefined
        ? { productConfiguration: input.productConfiguration }
        : {}),
    });
  }

  private validate(context: InvestigationContext, input: ReportAssemblyInput): void {
    const { detection } = input;
    if (
      detection.storeInformation === undefined ||
      detection.detectionResultSet === undefined
    ) {
      throwReportingError(
        ReportingEngineErrorCode.MissingDetectionOutputs,
        "Reporting requires Store Information and Detection Result Set",
      );
    }
    if (
      detection.storeInformation.investigationId !== context.investigationId ||
      detection.detectionResultSet.investigationId !== context.investigationId
    ) {
      throwReportingError(
        ReportingEngineErrorCode.InvestigationMismatch,
        "Detection outputs must belong to the same Investigation as assembly context",
      );
    }
    if (detection.detectionResultSet.kind !== "DetectionResultSet") {
      throwReportingError(
        ReportingEngineErrorCode.InvalidReportInput,
        "Invalid DetectionResultSet for report assembly",
      );
    }
  }
}
