import type { InvestigationId } from "../investigation/index.js";
import type {
  DetectionResultSet,
  ExplanationReference,
  StoreInformation,
  UnknownQualification,
} from "../detection/index.js";
import type { ProductConfiguration } from "../configuration/index.js";
import type { ReportCompleteness } from "./completeness.js";
import type { ReportMetadata } from "./metadata.js";
import type { ReportSection } from "./sections.js";

/**
 * IO-009 / D-015 Diagnostic Report — one per Investigation.
 * Core content must assemble without Product Configuration (INV-008).
 */
export interface DiagnosticReport {
  readonly kind: "DiagnosticReport";
  readonly investigationId: InvestigationId;
  readonly metadata: ReportMetadata;
  readonly storeInformation: StoreInformation;
  readonly detectionResultSet: DetectionResultSet;
  readonly unknownQualifications: readonly UnknownQualification[];
  readonly explanations: readonly ExplanationReference[];
  readonly sections: readonly ReportSection[];
  readonly completeness: ReportCompleteness;
  /** Optional adjunct only — never required for core Report validity. */
  readonly productConfiguration?: readonly ProductConfiguration[];
}

export function createDiagnosticReport(input: {
  readonly investigationId: InvestigationId;
  readonly metadata: ReportMetadata;
  readonly storeInformation: StoreInformation;
  readonly detectionResultSet: DetectionResultSet;
  readonly unknownQualifications: readonly UnknownQualification[];
  readonly explanations: readonly ExplanationReference[];
  readonly sections: readonly ReportSection[];
  readonly completeness: ReportCompleteness;
  readonly productConfiguration?: readonly ProductConfiguration[];
}): DiagnosticReport {
  return Object.freeze({
    kind: "DiagnosticReport",
    investigationId: input.investigationId,
    metadata: input.metadata,
    storeInformation: input.storeInformation,
    detectionResultSet: input.detectionResultSet,
    unknownQualifications: Object.freeze([...input.unknownQualifications]),
    explanations: Object.freeze([...input.explanations]),
    sections: Object.freeze([...input.sections]),
    completeness: input.completeness,
    ...(input.productConfiguration !== undefined
      ? {
          productConfiguration: Object.freeze([...input.productConfiguration]),
        }
      : {}),
  });
}
