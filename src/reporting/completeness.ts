import type {
  DetectionResultSet,
  StoreInformation,
  UnknownQualification,
} from "../detection/index.js";
import { DetectionOutcome } from "../detection/index.js";

/**
 * Honest Report completeness for Completion Disposition readiness (ADR-006).
 * Must not coerce partial content into fabricated Completed certainty.
 */
export const ReportCompletenessKind = {
  CompleteAsObtainable: "CompleteAsObtainable",
  Partial: "Partial",
  UnknownInfluenced: "UnknownInfluenced",
} as const;

export type ReportCompletenessKind =
  (typeof ReportCompletenessKind)[keyof typeof ReportCompletenessKind];

export interface ReportCompleteness {
  readonly kind: "ReportCompleteness";
  readonly completenessKind: ReportCompletenessKind;
  readonly hasUnknownQualifications: boolean;
  readonly hasNotDetectedOutcomes: boolean;
  readonly hasUnavailableTheme: boolean;
  /** Missing optional Configuration is never a core incompleteness failure. */
  readonly configurationAbsent: boolean;
}

export class CompletenessAnnotator {
  annotate(input: {
    readonly storeInformation: StoreInformation;
    readonly detectionResultSet: DetectionResultSet;
    readonly unknownQualifications: readonly UnknownQualification[];
    readonly configurationAbsent: boolean;
  }): ReportCompleteness {
    const hasUnknownQualifications = input.unknownQualifications.length > 0;
    const hasNotDetectedOutcomes = input.detectionResultSet.results.some(
      (result) => result.outcome === DetectionOutcome.NotDetected,
    );
    const hasUnavailableTheme =
      input.storeInformation.themeAvailability === "Unavailable";
    const hasUnknownOutcomes = input.detectionResultSet.results.some(
      (result) => result.outcome === DetectionOutcome.Unknown,
    );

    let completenessKind: ReportCompletenessKind =
      ReportCompletenessKind.CompleteAsObtainable;
    if (hasUnknownQualifications || hasUnknownOutcomes) {
      completenessKind = ReportCompletenessKind.UnknownInfluenced;
    } else if (hasNotDetectedOutcomes || hasUnavailableTheme) {
      completenessKind = ReportCompletenessKind.Partial;
    }

    return Object.freeze({
      kind: "ReportCompleteness",
      completenessKind,
      hasUnknownQualifications,
      hasNotDetectedOutcomes,
      hasUnavailableTheme,
      configurationAbsent: input.configurationAbsent,
    });
  }
}
