import type { InvestigationId } from "../investigation/index.js";
import type { EvidenceItemId } from "../evidence/index.js";
import type { EvaluationSubject } from "./evaluation-agenda.js";
import type { AgendaItemId, DetectionResultId } from "./identifiers.js";
import type { DetectionOutcome, DisabledIntegrationState } from "./outcomes.js";
import type { UnknownQualification } from "./unknown-qualification.js";

/**
 * D-014 / Detection Result value object.
 */
export interface DetectionResult {
  readonly kind: "DetectionResult";
  readonly detectionResultId: DetectionResultId;
  readonly investigationId: InvestigationId;
  readonly agendaItemId: AgendaItemId;
  readonly subject: EvaluationSubject;
  readonly outcome: DetectionOutcome;
  readonly supportingEvidenceIds?: readonly EvidenceItemId[];
  readonly disabledIntegrationState?: DisabledIntegrationState;
  readonly unknownQualification?: UnknownQualification;
  /** Optional Part 3 explanation/snippet intent (depth U-005 Open). */
  readonly explanationIntent?: string;
}

/**
 * IO-007 Detection Result Set.
 */
export interface DetectionResultSet {
  readonly kind: "DetectionResultSet";
  readonly investigationId: InvestigationId;
  readonly results: readonly DetectionResult[];
  readonly unknownQualifications: readonly UnknownQualification[];
}

export function createDetectionResult(input: {
  readonly detectionResultId: DetectionResultId;
  readonly investigationId: InvestigationId;
  readonly agendaItemId: AgendaItemId;
  readonly subject: EvaluationSubject;
  readonly outcome: DetectionOutcome;
  readonly supportingEvidenceIds?: readonly EvidenceItemId[];
  readonly disabledIntegrationState?: DisabledIntegrationState;
  readonly unknownQualification?: UnknownQualification;
  readonly explanationIntent?: string;
}): DetectionResult {
  return Object.freeze({
    kind: "DetectionResult",
    detectionResultId: input.detectionResultId,
    investigationId: input.investigationId,
    agendaItemId: input.agendaItemId,
    subject: Object.freeze({ ...input.subject }),
    outcome: input.outcome,
    ...(input.supportingEvidenceIds !== undefined
      ? { supportingEvidenceIds: Object.freeze([...input.supportingEvidenceIds]) }
      : {}),
    ...(input.disabledIntegrationState !== undefined
      ? { disabledIntegrationState: input.disabledIntegrationState }
      : {}),
    ...(input.unknownQualification !== undefined
      ? { unknownQualification: input.unknownQualification }
      : {}),
    ...(input.explanationIntent !== undefined
      ? { explanationIntent: input.explanationIntent }
      : {}),
  });
}

export function createDetectionResultSet(input: {
  readonly investigationId: InvestigationId;
  readonly results: readonly DetectionResult[];
  readonly unknownQualifications?: readonly UnknownQualification[];
}): DetectionResultSet {
  return Object.freeze({
    kind: "DetectionResultSet",
    investigationId: input.investigationId,
    results: Object.freeze([...input.results]),
    unknownQualifications: Object.freeze([...(input.unknownQualifications ?? [])]),
  });
}
