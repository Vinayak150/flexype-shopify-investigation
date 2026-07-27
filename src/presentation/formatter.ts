import type { DetectionOutcome } from "../detection/index.js";
import type { ReportCompletenessKind } from "../reporting/index.js";

/**
 * Semantic-neutral display formatting (data-level only).
 * Must not invent outcomes, Theme names, or explanations.
 */
export class PresentationFormatter {
  formatOutcome(outcome: DetectionOutcome): string {
    switch (outcome) {
      case "NotDetected":
        return "Not Detected";
      case "NotApplicable":
        return "Not Applicable";
      default:
        return outcome;
    }
  }

  formatCompleteness(kind: ReportCompletenessKind): string {
    switch (kind) {
      case "CompleteAsObtainable":
        return "Complete as obtainable";
      case "Partial":
        return "Partial";
      case "UnknownInfluenced":
        return "Unknown-influenced";
      default: {
        const _exhaustive: never = kind;
        return _exhaustive;
      }
    }
  }

  formatOptionalText(value: string | undefined, unavailableLabel: string): string {
    if (value === undefined || value.trim().length === 0) {
      return unavailableLabel;
    }
    return value;
  }
}
