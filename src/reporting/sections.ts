import type { DetectionResult } from "../detection/index.js";
import type { StoreInformation } from "../detection/index.js";
import type { UnknownQualification } from "../detection/index.js";
import type { ProductConfiguration } from "../configuration/index.js";

/**
 * Structural Report sections aligned with UI PS-* organization only.
 * Not rendering widgets; does not change DetectionOutcome meanings.
 */
export const ReportSectionId = {
  InvestigationSummary: "PS-001",
  StoreInformation: "PS-002",
  FlexyPeProducts: "PS-003",
  DisabledIntegrations: "PS-004",
  ThirdPartyApps: "PS-005",
  StorefrontFeatures: "PS-006",
  OptionalProductConfiguration: "PS-007",
  UnknownQualifications: "PS-008",
  InvestigationStatus: "PS-009",
} as const;

export type ReportSectionId = (typeof ReportSectionId)[keyof typeof ReportSectionId];

export type ReportSection =
  | {
      readonly kind: "ReportSection";
      readonly sectionId: typeof ReportSectionId.StoreInformation;
      readonly storeInformation: StoreInformation;
    }
  | {
      readonly kind: "ReportSection";
      readonly sectionId: typeof ReportSectionId.FlexyPeProducts;
      readonly results: readonly DetectionResult[];
    }
  | {
      readonly kind: "ReportSection";
      readonly sectionId: typeof ReportSectionId.DisabledIntegrations;
      readonly results: readonly DetectionResult[];
    }
  | {
      readonly kind: "ReportSection";
      readonly sectionId: typeof ReportSectionId.ThirdPartyApps;
      readonly results: readonly DetectionResult[];
    }
  | {
      readonly kind: "ReportSection";
      readonly sectionId: typeof ReportSectionId.StorefrontFeatures;
      readonly results: readonly DetectionResult[];
    }
  | {
      readonly kind: "ReportSection";
      readonly sectionId: typeof ReportSectionId.UnknownQualifications;
      readonly unknownQualifications: readonly UnknownQualification[];
    }
  | {
      readonly kind: "ReportSection";
      readonly sectionId: typeof ReportSectionId.OptionalProductConfiguration;
      readonly productConfiguration: readonly ProductConfiguration[];
    }
  | {
      readonly kind: "ReportSection";
      readonly sectionId: typeof ReportSectionId.InvestigationSummary;
      readonly resultCount: number;
    }
  | {
      readonly kind: "ReportSection";
      readonly sectionId: typeof ReportSectionId.InvestigationStatus;
      readonly completenessKind: string;
    };

export function buildReportSections(input: {
  readonly storeInformation: StoreInformation;
  readonly results: readonly DetectionResult[];
  readonly unknownQualifications: readonly UnknownQualification[];
  readonly productConfiguration?: readonly ProductConfiguration[];
  readonly completenessKind: string;
}): readonly ReportSection[] {
  const products = input.results.filter(
    (result) => result.subject.kind === "FlexyPeProduct",
  );
  const disabled = input.results.filter(
    (result) => result.subject.kind === "DisabledIntegration",
  );
  const apps = input.results.filter(
    (result) => result.subject.kind === "ThirdPartyApp",
  );
  const features = input.results.filter(
    (result) => result.subject.kind === "StorefrontFeature",
  );

  const sections: ReportSection[] = [
    Object.freeze({
      kind: "ReportSection",
      sectionId: ReportSectionId.InvestigationSummary,
      resultCount: input.results.length,
    }),
    Object.freeze({
      kind: "ReportSection",
      sectionId: ReportSectionId.StoreInformation,
      storeInformation: input.storeInformation,
    }),
    Object.freeze({
      kind: "ReportSection",
      sectionId: ReportSectionId.FlexyPeProducts,
      results: Object.freeze([...products]),
    }),
    Object.freeze({
      kind: "ReportSection",
      sectionId: ReportSectionId.DisabledIntegrations,
      results: Object.freeze([...disabled]),
    }),
    Object.freeze({
      kind: "ReportSection",
      sectionId: ReportSectionId.ThirdPartyApps,
      results: Object.freeze([...apps]),
    }),
    Object.freeze({
      kind: "ReportSection",
      sectionId: ReportSectionId.StorefrontFeatures,
      results: Object.freeze([...features]),
    }),
    Object.freeze({
      kind: "ReportSection",
      sectionId: ReportSectionId.UnknownQualifications,
      unknownQualifications: Object.freeze([...input.unknownQualifications]),
    }),
  ];

  if (input.productConfiguration !== undefined) {
    sections.push(
      Object.freeze({
        kind: "ReportSection",
        sectionId: ReportSectionId.OptionalProductConfiguration,
        productConfiguration: Object.freeze([...input.productConfiguration]),
      }),
    );
  }

  sections.push(
    Object.freeze({
      kind: "ReportSection",
      sectionId: ReportSectionId.InvestigationStatus,
      completenessKind: input.completenessKind,
    }),
  );

  return Object.freeze(sections);
}
