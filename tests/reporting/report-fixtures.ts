import type {
  InvestigationId,
  StorefrontTarget,
} from "../../src/investigation/index.js";
import {
  createDetectionResultSet,
  createStoreInformation,
  ThemeAvailability,
  type DetectionResult,
  type ExplanationReference,
  type UnknownQualification,
} from "../../src/detection/index.js";
import {
  CompletenessAnnotator,
  createDiagnosticReport,
  createReportMetadata,
  buildReportSections,
  ExplanationAggregator,
  type DiagnosticReport,
} from "../../src/reporting/index.js";

export function buildMinimalReport(input: {
  readonly investigationId: InvestigationId;
  readonly storefrontTarget: StorefrontTarget;
  readonly results?: readonly DetectionResult[];
  readonly unknownQualifications?: readonly UnknownQualification[];
  readonly explanations?: readonly ExplanationReference[];
  readonly themeAvailability?: (typeof ThemeAvailability)[keyof typeof ThemeAvailability];
}): DiagnosticReport {
  const storeInformation = createStoreInformation({
    investigationId: input.investigationId,
    themeAvailability: input.themeAvailability ?? ThemeAvailability.Unavailable,
  });
  const detectionResultSet = createDetectionResultSet({
    investigationId: input.investigationId,
    results: input.results ?? [],
    unknownQualifications: input.unknownQualifications ?? [],
  });
  const unknownQualifications = input.unknownQualifications ?? [];
  const explanations = new ExplanationAggregator().aggregate(input.explanations ?? []);
  const completeness = new CompletenessAnnotator().annotate({
    storeInformation,
    detectionResultSet,
    unknownQualifications,
    configurationAbsent: true,
  });
  const sections = buildReportSections({
    storeInformation,
    results: detectionResultSet.results,
    unknownQualifications,
    completenessKind: completeness.completenessKind,
  });

  return createDiagnosticReport({
    investigationId: input.investigationId,
    metadata: createReportMetadata({
      investigationId: input.investigationId,
      storefrontTarget: input.storefrontTarget,
      assembledAtIso: "1970-01-01T00:00:00.000Z",
    }),
    storeInformation,
    detectionResultSet,
    unknownQualifications,
    explanations,
    sections,
    completeness,
  });
}
