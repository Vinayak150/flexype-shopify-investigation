import {
  InvestigationState,
  type InvestigationContext,
} from "../investigation/index.js";
import type { NormalizedEvidence } from "../evidence/index.js";
import { buildEvaluationAgenda } from "./agenda.js";
import {
  createDefaultDefinitionRegistry,
  type DetectionDefinitionRegistry,
} from "./definitions.js";
import {
  createDetectionResultSet,
  type DetectionResultSet,
} from "./detection-result.js";
import { DetectionEngineErrorCode, throwDetectionError } from "./engine-errors.js";
import { DefinitionEvaluator } from "./evaluator.js";
import type { EvaluationAgenda } from "./evaluation-agenda.js";
import type { ExplanationReference } from "./explanation.js";
import type { StoreInformation } from "./store-information.js";
import { projectStoreInformation } from "./store-information-projector.js";
import { UnknownQualifier } from "./unknowns.js";
import type { UnknownQualification } from "./unknown-qualification.js";
import { assertNormalizedEvidenceImmutable } from "../evidence/index.js";

export type DetectionSessionStatus = "closed" | "open" | "evaluated" | "sealed";

export interface DetectionEvaluationOutput {
  readonly agenda: EvaluationAgenda;
  readonly storeInformation: StoreInformation;
  readonly results: DetectionResultSet;
  readonly unknownQualifications: readonly UnknownQualification[];
  readonly explanations: readonly ExplanationReference[];
}

/**
 * Evaluation session lifecycle over one immutable NormalizedEvidence snapshot.
 */
export class DetectionSession {
  private status: DetectionSessionStatus = "closed";
  private output: DetectionEvaluationOutput | undefined;
  private readonly context: InvestigationContext;
  private readonly evidence: NormalizedEvidence;
  private readonly evaluator: DefinitionEvaluator;
  private readonly unknownQualifier = new UnknownQualifier();

  constructor(
    context: InvestigationContext,
    evidence: NormalizedEvidence,
    registry: DetectionDefinitionRegistry = createDefaultDefinitionRegistry(),
  ) {
    if (context.state !== InvestigationState.InProgress) {
      throwDetectionError(
        DetectionEngineErrorCode.InvestigationNotInProgress,
        `Detection requires InProgress Investigation; got ${context.state}`,
      );
    }
    if (evidence.kind !== "NormalizedEvidence") {
      throwDetectionError(
        DetectionEngineErrorCode.MissingNormalizedEvidence,
        "Detection requires NormalizedEvidence",
      );
    }
    if (evidence.investigationId !== context.investigationId) {
      throwDetectionError(
        DetectionEngineErrorCode.InvestigationMismatch,
        "NormalizedEvidence InvestigationId must match Investigation Context",
      );
    }
    if (assertNormalizedEvidenceImmutable(evidence) !== undefined) {
      throwDetectionError(
        DetectionEngineErrorCode.MutableEvidenceRejected,
        "Detection rejects non-immutable NormalizedEvidence",
      );
    }

    this.context = context;
    this.evidence = evidence;
    this.evaluator = new DefinitionEvaluator(registry);
  }

  getStatus(): DetectionSessionStatus {
    return this.status;
  }

  open(): void {
    if (this.status !== "closed") {
      throwDetectionError(
        DetectionEngineErrorCode.SessionNotOpen,
        `Cannot open DetectionSession from status ${this.status}`,
      );
    }
    this.status = "open";
  }

  evaluate(): DetectionEvaluationOutput {
    if (this.status !== "open") {
      throwDetectionError(
        DetectionEngineErrorCode.SessionNotOpen,
        `evaluate requires open session; got ${this.status}`,
      );
    }

    const agenda = buildEvaluationAgenda(this.context.investigationId);
    const evaluated = agenda.items.map((item) =>
      this.evaluator.evaluateItem(this.context.investigationId, item, this.evidence),
    );
    const results = evaluated.map((entry) => entry.result);
    const explanations = evaluated.map((entry) => entry.explanation);
    const unknownQualifications = this.unknownQualifier.merge(
      this.unknownQualifier.collectFromAgenda(agenda),
      this.unknownQualifier.collectFromResults(results),
    );

    this.output = Object.freeze({
      agenda,
      storeInformation: projectStoreInformation(
        this.context.investigationId,
        this.evidence,
      ),
      results: createDetectionResultSet({
        investigationId: this.context.investigationId,
        results,
        unknownQualifications,
      }),
      unknownQualifications,
      explanations: Object.freeze(explanations),
    });
    this.status = "evaluated";
    return this.output;
  }

  seal(): DetectionEvaluationOutput {
    if (this.output === undefined || this.status !== "evaluated") {
      throwDetectionError(
        DetectionEngineErrorCode.SessionNotOpen,
        "seal requires evaluation to complete first",
      );
    }
    this.status = "sealed";
    return this.output;
  }
}
