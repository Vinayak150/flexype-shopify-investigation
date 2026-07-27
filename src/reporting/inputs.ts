import type {
  DetectionResultSet,
  ExplanationReference,
  StoreInformation,
  UnknownQualification,
} from "../detection/index.js";
import type { ProductConfiguration } from "../configuration/index.js";

/**
 * Readonly Detection outputs consumed by Reporting (no re-evaluation).
 * Mirrors DetectionEvaluationOutput assembly surface without owning Detection.
 */
export interface ReportingDetectionInputs {
  readonly storeInformation: StoreInformation;
  readonly detectionResultSet: DetectionResultSet;
  readonly unknownQualifications: readonly UnknownQualification[];
  readonly explanations: readonly ExplanationReference[];
}

export interface ReportAssemblyInput {
  readonly detection: ReportingDetectionInputs;
  readonly productConfiguration?: readonly ProductConfiguration[];
}
