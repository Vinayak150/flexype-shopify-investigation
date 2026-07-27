import type { InvestigationContext } from "../investigation/index.js";
import type { DiagnosticReport } from "../reporting/index.js";
import {
  PresentationEngineErrorCode,
  throwPresentationError,
} from "./engine-errors.js";
import { PresentationFormatter } from "./formatter.js";
import { createPresentationMetadata } from "./metadata.js";
import {
  createPresentationReadyView,
  type PresentationReadyView,
} from "./presentation-view.js";
import { CORE_BEFORE_OPTIONAL_SECTION_ORDER } from "./sections.js";
import { projectViewSections } from "./view-sections.js";

/**
 * Project Report content into a Presentation-ready View (IO-011).
 * Framework-independent; does not assemble reports or evaluate Evidence.
 */
export class ViewProjector {
  private readonly formatter: PresentationFormatter;

  constructor(formatter = new PresentationFormatter()) {
    this.formatter = formatter;
  }

  project(
    context: InvestigationContext,
    report: DiagnosticReport,
  ): PresentationReadyView {
    this.validate(context, report);

    const viewSections = projectViewSections(report, this.formatter);
    return createPresentationReadyView({
      report,
      sectionOrder: CORE_BEFORE_OPTIONAL_SECTION_ORDER,
      viewSections,
      metadata: createPresentationMetadata({
        investigationId: context.investigationId,
        storefrontTarget: context.storefrontTarget,
      }),
      explanations: report.explanations,
      completenessLabel: this.formatter.formatCompleteness(
        report.completeness.completenessKind,
      ),
      unknownVisible: report.unknownQualifications.length > 0,
      notDetectedVisible: report.detectionResultSet.results.some(
        (result) => result.outcome === "NotDetected",
      ),
    });
  }

  private validate(context: InvestigationContext, report: DiagnosticReport): void {
    if (report === undefined || report.kind !== "DiagnosticReport") {
      throwPresentationError(
        PresentationEngineErrorCode.MissingDiagnosticReport,
        "Presentation requires a sealed DiagnosticReport",
      );
    }
    if (report.investigationId !== context.investigationId) {
      throwPresentationError(
        PresentationEngineErrorCode.InvestigationMismatch,
        "DiagnosticReport InvestigationId must match Investigation Context",
      );
    }
    if (report.detectionResultSet.kind !== "DetectionResultSet") {
      throwPresentationError(
        PresentationEngineErrorCode.InvalidReportInput,
        "DiagnosticReport is missing Detection Result Set",
      );
    }
  }
}
