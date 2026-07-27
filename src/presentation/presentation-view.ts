import type { ExplanationReference } from "../detection/index.js";
import type { DiagnosticReport } from "../reporting/index.js";
import type { PresentationMetadata } from "./metadata.js";
import type { PresentationSectionId } from "./sections.js";
import type { ViewSection } from "./view-sections.js";

/**
 * IO-011 Presentation-ready View — Operator-facing projection of Report.
 * Must not alter Detection meanings or invent Evidence.
 * Framework-independent ViewModel/structures only.
 */
export interface PresentationReadyView {
  readonly kind: "PresentationReadyView";
  readonly report: DiagnosticReport;
  readonly sectionOrder: readonly PresentationSectionId[];
  readonly viewSections: readonly ViewSection[];
  readonly metadata: PresentationMetadata;
  readonly explanations: readonly ExplanationReference[];
  readonly completenessLabel: string;
  readonly unknownVisible: boolean;
  readonly notDetectedVisible: boolean;
}

export function createPresentationReadyView(input: {
  readonly report: DiagnosticReport;
  readonly sectionOrder: readonly PresentationSectionId[];
  readonly viewSections: readonly ViewSection[];
  readonly metadata: PresentationMetadata;
  readonly explanations: readonly ExplanationReference[];
  readonly completenessLabel: string;
  readonly unknownVisible: boolean;
  readonly notDetectedVisible: boolean;
}): PresentationReadyView {
  return Object.freeze({
    kind: "PresentationReadyView",
    report: input.report,
    sectionOrder: Object.freeze([...input.sectionOrder]),
    viewSections: Object.freeze([...input.viewSections]),
    metadata: input.metadata,
    explanations: Object.freeze([...input.explanations]),
    completenessLabel: input.completenessLabel,
    unknownVisible: input.unknownVisible,
    notDetectedVisible: input.notDetectedVisible,
  });
}

/**
 * Structural honesty: view carries Report content only — no alternate outcome fields.
 * Theme/StoreInformation are projected via PS-002 labels; other subjects via findings.
 */
export function viewAgreesWithReport(view: PresentationReadyView): boolean {
  if (
    view.kind !== "PresentationReadyView" ||
    view.report.kind !== "DiagnosticReport" ||
    view.report.detectionResultSet.kind !== "DetectionResultSet"
  ) {
    return false;
  }

  const hasStoreInformationSection = view.viewSections.some(
    (section) => section.sectionId === "PS-002",
  );
  const findingOutcomes = view.viewSections.flatMap((section) => {
    if (
      section.sectionId === "PS-003" ||
      section.sectionId === "PS-004" ||
      section.sectionId === "PS-005" ||
      section.sectionId === "PS-006"
    ) {
      return section.findings.map((finding) => finding.outcome);
    }
    return [];
  });

  return view.report.detectionResultSet.results.every((result) => {
    if (
      result.subject.kind === "Theme" ||
      result.subject.kind === "StoreInformation"
    ) {
      return hasStoreInformationSection;
    }
    return findingOutcomes.includes(result.outcome);
  });
}

export function assertPresentationViewImmutable(view: PresentationReadyView): boolean {
  return (
    Object.isFrozen(view) &&
    Object.isFrozen(view.sectionOrder) &&
    Object.isFrozen(view.viewSections) &&
    Object.isFrozen(view.explanations)
  );
}
