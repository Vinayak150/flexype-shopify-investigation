import type { DiagnosticReport } from "../reporting/index.js";
import type { PresentationSectionId } from "./sections.js";

/**
 * IO-011 Presentation-ready View — Operator-facing projection of Report.
 * Must not alter Detection meanings or invent Evidence.
 */
export interface PresentationReadyView {
  readonly kind: "PresentationReadyView";
  readonly report: DiagnosticReport;
  readonly sectionOrder: readonly PresentationSectionId[];
}

export function createPresentationReadyView(input: {
  readonly report: DiagnosticReport;
  readonly sectionOrder: readonly PresentationSectionId[];
}): PresentationReadyView {
  return Object.freeze({
    kind: "PresentationReadyView",
    report: input.report,
    sectionOrder: Object.freeze([...input.sectionOrder]),
  });
}

/**
 * Structural honesty: view carries Report content only — no alternate outcome fields.
 */
export function viewAgreesWithReport(view: PresentationReadyView): boolean {
  return (
    view.kind === "PresentationReadyView" &&
    view.report.kind === "DiagnosticReport" &&
    view.report.detectionResultSet.kind === "DetectionResultSet"
  );
}
