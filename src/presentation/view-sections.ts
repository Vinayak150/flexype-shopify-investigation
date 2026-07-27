import type {
  DetectionOutcome,
  DetectionResult,
  ExplanationReference,
  UnknownQualification,
} from "../detection/index.js";
import type { ProductConfiguration } from "../configuration/index.js";
import type { DiagnosticReport } from "../reporting/index.js";
import { PresentationFormatter } from "./formatter.js";
import {
  CORE_BEFORE_OPTIONAL_SECTION_ORDER,
  PresentationSectionId,
  type PresentationSectionId as PresentationSectionIdType,
} from "./sections.js";

export interface ViewFindingItem {
  readonly kind: "ViewFindingItem";
  readonly outcome: DetectionOutcome;
  readonly outcomeLabel: string;
  readonly subjectLabel: string;
  readonly explanationIntent?: string;
  readonly supportingExplanationIds: readonly string[];
}

export type ViewSection =
  | {
      readonly kind: "ViewSection";
      readonly sectionId: typeof PresentationSectionId.PS001_InvestigationSummary;
      readonly visible: true;
      readonly resultCount: number;
      readonly summaryLabel: string;
    }
  | {
      readonly kind: "ViewSection";
      readonly sectionId: typeof PresentationSectionId.PS002_StoreInformation;
      readonly visible: true;
      readonly themeAvailabilityLabel: string;
      readonly themeNameLabel: string;
      readonly shopNameLabel: string;
      readonly storeUrlLabel: string;
    }
  | {
      readonly kind: "ViewSection";
      readonly sectionId: typeof PresentationSectionId.PS003_FlexyPeProducts;
      readonly visible: true;
      readonly findings: readonly ViewFindingItem[];
    }
  | {
      readonly kind: "ViewSection";
      readonly sectionId: typeof PresentationSectionId.PS004_DisabledIntegrations;
      readonly visible: true;
      readonly findings: readonly ViewFindingItem[];
    }
  | {
      readonly kind: "ViewSection";
      readonly sectionId: typeof PresentationSectionId.PS005_ThirdPartyApps;
      readonly visible: true;
      readonly findings: readonly ViewFindingItem[];
    }
  | {
      readonly kind: "ViewSection";
      readonly sectionId: typeof PresentationSectionId.PS006_StorefrontFeatures;
      readonly visible: true;
      readonly findings: readonly ViewFindingItem[];
    }
  | {
      readonly kind: "ViewSection";
      readonly sectionId: typeof PresentationSectionId.PS008_UnknownQualifications;
      readonly visible: boolean;
      readonly unknownQualifications: readonly UnknownQualification[];
      readonly labels: readonly string[];
    }
  | {
      readonly kind: "ViewSection";
      readonly sectionId: typeof PresentationSectionId.PS007_OptionalProductConfiguration;
      readonly visible: boolean;
      readonly productConfiguration: readonly ProductConfiguration[];
      readonly absentLabel?: string;
    }
  | {
      readonly kind: "ViewSection";
      readonly sectionId: typeof PresentationSectionId.PS009_InvestigationStatus;
      readonly visible: true;
      readonly completenessLabel: string;
      readonly completenessKind: string;
      readonly hasUnknownQualifications: boolean;
      readonly hasNotDetectedOutcomes: boolean;
    };

function subjectLabel(result: DetectionResult): string {
  switch (result.subject.kind) {
    case "FlexyPeProduct":
      return `FlexyPe ${result.subject.productId}`;
    case "DisabledIntegration":
      return `Disabled integration (${result.subject.productId})`;
    case "ThirdPartyApp":
      return "Third-party Apps";
    case "StorefrontFeature":
      return "Storefront Features";
    case "Theme":
      return "Theme";
    case "StoreInformation":
      return "Store Information";
    default: {
      const _exhaustive: never = result.subject;
      return _exhaustive;
    }
  }
}

function toFinding(
  result: DetectionResult,
  formatter: PresentationFormatter,
  explanations: readonly ExplanationReference[],
): ViewFindingItem {
  const supportingExplanationIds = explanations
    .filter((explanation) => {
      if (result.subject.kind === "FlexyPeProduct") {
        return explanation.definitionId.includes(result.subject.productId);
      }
      if (result.subject.kind === "DisabledIntegration") {
        return explanation.definitionId.includes(result.subject.productId);
      }
      if (result.subject.kind === "ThirdPartyApp") {
        return explanation.definitionId.includes("thirdPartyApp");
      }
      if (result.subject.kind === "StorefrontFeature") {
        return explanation.definitionId.includes("storefrontFeature");
      }
      return false;
    })
    .map((explanation) => explanation.definitionId);

  return Object.freeze({
    kind: "ViewFindingItem",
    outcome: result.outcome,
    outcomeLabel: formatter.formatOutcome(result.outcome),
    subjectLabel: subjectLabel(result),
    ...(result.explanationIntent !== undefined
      ? { explanationIntent: result.explanationIntent }
      : {}),
    supportingExplanationIds: Object.freeze(supportingExplanationIds),
  });
}

/**
 * Build ordered ViewSections from a sealed DiagnosticReport.
 * Core findings precede optional Configuration (UI-INV-003).
 */
export function projectViewSections(
  report: DiagnosticReport,
  formatter = new PresentationFormatter(),
): readonly ViewSection[] {
  const results = report.detectionResultSet.results;
  const products = results.filter((result) => result.subject.kind === "FlexyPeProduct");
  const disabled = results.filter(
    (result) => result.subject.kind === "DisabledIntegration",
  );
  const apps = results.filter((result) => result.subject.kind === "ThirdPartyApp");
  const features = results.filter(
    (result) => result.subject.kind === "StorefrontFeature",
  );
  const config = report.productConfiguration ?? [];
  const unknownsVisible = report.unknownQualifications.length > 0;

  const byId = new Map<PresentationSectionIdType, ViewSection>([
    [
      PresentationSectionId.PS001_InvestigationSummary,
      Object.freeze({
        kind: "ViewSection",
        sectionId: PresentationSectionId.PS001_InvestigationSummary,
        visible: true,
        resultCount: results.length,
        summaryLabel: `Investigation ${String(report.investigationId)}`,
      }),
    ],
    [
      PresentationSectionId.PS002_StoreInformation,
      Object.freeze({
        kind: "ViewSection",
        sectionId: PresentationSectionId.PS002_StoreInformation,
        visible: true,
        themeAvailabilityLabel: report.storeInformation.themeAvailability,
        themeNameLabel: formatter.formatOptionalText(
          report.storeInformation.themeName,
          "Unavailable",
        ),
        shopNameLabel: formatter.formatOptionalText(
          report.storeInformation.shopName,
          "Unavailable",
        ),
        storeUrlLabel: formatter.formatOptionalText(
          report.storeInformation.storeUrl,
          "Unavailable",
        ),
      }),
    ],
    [
      PresentationSectionId.PS003_FlexyPeProducts,
      Object.freeze({
        kind: "ViewSection",
        sectionId: PresentationSectionId.PS003_FlexyPeProducts,
        visible: true,
        findings: Object.freeze(
          products.map((result) => toFinding(result, formatter, report.explanations)),
        ),
      }),
    ],
    [
      PresentationSectionId.PS004_DisabledIntegrations,
      Object.freeze({
        kind: "ViewSection",
        sectionId: PresentationSectionId.PS004_DisabledIntegrations,
        visible: true,
        findings: Object.freeze(
          disabled.map((result) => toFinding(result, formatter, report.explanations)),
        ),
      }),
    ],
    [
      PresentationSectionId.PS005_ThirdPartyApps,
      Object.freeze({
        kind: "ViewSection",
        sectionId: PresentationSectionId.PS005_ThirdPartyApps,
        visible: true,
        findings: Object.freeze(
          apps.map((result) => toFinding(result, formatter, report.explanations)),
        ),
      }),
    ],
    [
      PresentationSectionId.PS006_StorefrontFeatures,
      Object.freeze({
        kind: "ViewSection",
        sectionId: PresentationSectionId.PS006_StorefrontFeatures,
        visible: true,
        findings: Object.freeze(
          features.map((result) => toFinding(result, formatter, report.explanations)),
        ),
      }),
    ],
    [
      PresentationSectionId.PS008_UnknownQualifications,
      Object.freeze({
        kind: "ViewSection",
        sectionId: PresentationSectionId.PS008_UnknownQualifications,
        visible: unknownsVisible,
        unknownQualifications: Object.freeze([...report.unknownQualifications]),
        labels: Object.freeze(
          report.unknownQualifications.map(
            (qualification) =>
              `${qualification.domainUnknownId}${qualification.note !== undefined ? `: ${qualification.note}` : ""}`,
          ),
        ),
      }),
    ],
    [
      PresentationSectionId.PS007_OptionalProductConfiguration,
      Object.freeze({
        kind: "ViewSection",
        sectionId: PresentationSectionId.PS007_OptionalProductConfiguration,
        visible: config.length > 0,
        productConfiguration: Object.freeze([...config]),
        ...(config.length === 0
          ? { absentLabel: "Optional configuration not attached" }
          : {}),
      }),
    ],
    [
      PresentationSectionId.PS009_InvestigationStatus,
      Object.freeze({
        kind: "ViewSection",
        sectionId: PresentationSectionId.PS009_InvestigationStatus,
        visible: true,
        completenessLabel: formatter.formatCompleteness(
          report.completeness.completenessKind,
        ),
        completenessKind: report.completeness.completenessKind,
        hasUnknownQualifications: report.completeness.hasUnknownQualifications,
        hasNotDetectedOutcomes: report.completeness.hasNotDetectedOutcomes,
      }),
    ],
  ]);

  return Object.freeze(
    CORE_BEFORE_OPTIONAL_SECTION_ORDER.map((sectionId) => {
      const section = byId.get(sectionId);
      if (section === undefined) {
        throw new Error(`Missing projected section ${sectionId}`);
      }
      return section;
    }),
  );
}
