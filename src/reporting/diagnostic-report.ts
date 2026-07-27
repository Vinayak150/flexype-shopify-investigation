import type { InvestigationId } from "../investigation/index.js";
import type {
  DetectionResultSet,
  StoreInformation,
  UnknownQualification,
} from "../detection/index.js";
import type { ProductConfiguration } from "../configuration/index.js";

/**
 * IO-009 / D-015 Diagnostic Report — one per Investigation.
 * Core content must assemble without Product Configuration (INV-008).
 */
export interface DiagnosticReport {
  readonly kind: "DiagnosticReport";
  readonly investigationId: InvestigationId;
  readonly storeInformation: StoreInformation;
  readonly detectionResultSet: DetectionResultSet;
  readonly unknownQualifications: readonly UnknownQualification[];
  /** Optional adjunct only — never required for core Report validity. */
  readonly productConfiguration?: readonly ProductConfiguration[];
}

export function createDiagnosticReport(input: {
  readonly investigationId: InvestigationId;
  readonly storeInformation: StoreInformation;
  readonly detectionResultSet: DetectionResultSet;
  readonly unknownQualifications?: readonly UnknownQualification[];
  readonly productConfiguration?: readonly ProductConfiguration[];
}): DiagnosticReport {
  return Object.freeze({
    kind: "DiagnosticReport",
    investigationId: input.investigationId,
    storeInformation: input.storeInformation,
    detectionResultSet: input.detectionResultSet,
    unknownQualifications: Object.freeze([
      ...(input.unknownQualifications ??
        input.detectionResultSet.unknownQualifications),
    ]),
    ...(input.productConfiguration !== undefined
      ? {
          productConfiguration: Object.freeze([...input.productConfiguration]),
        }
      : {}),
  });
}
