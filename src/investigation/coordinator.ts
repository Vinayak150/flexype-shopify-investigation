import type { InvestigationContext, OperatorRef } from "./investigation-context.js";
import { InvestigationLifecycle } from "./lifecycle.js";
import {
  CollaboratorStage,
  type CollaboratorPorts,
  type PortStageResult,
} from "./ports.js";
import {
  createCompletionReadiness,
  readinessFromPortResults,
  type CompletionReadiness,
} from "./readiness.js";
import { resolveCompletionDisposition } from "./disposition.js";
import { InvestigationEngineErrorCode, throwEngineError } from "./engine-errors.js";
import { InvestigationState } from "./states.js";

export interface OperatorIntent {
  readonly kind: "OperatorIntent";
  readonly label?: string;
}

export interface InvestigationRunResult {
  readonly context: InvestigationContext;
  readonly stageResults: readonly PortStageResult[];
  readonly readiness: CompletionReadiness;
}

/**
 * Orchestrates one Investigation via collaborator ports (E-003).
 * Does not acquire Evidence, evaluate Detection, assemble Report, render UI, or fetch Configuration.
 */
export class InvestigationCoordinator {
  private readonly lifecycle: InvestigationLifecycle;
  private readonly ports: CollaboratorPorts;

  constructor(ports: CollaboratorPorts, lifecycle = new InvestigationLifecycle()) {
    this.ports = ports;
    this.lifecycle = lifecycle;
  }

  /**
   * Bind one InvestigationId + one Storefront target and enter InProgress (S-001).
   */
  start(intent: OperatorIntent, storefrontTarget: string): InvestigationContext {
    const operator: OperatorRef =
      intent.label !== undefined
        ? { kind: "Operator", label: intent.label }
        : { kind: "Operator" };

    const created = this.lifecycle.create({
      storefrontTarget,
      operator,
    });
    return this.lifecycle.initiate(created);
  }

  /**
   * Progress collaborators in pipeline order without owning their result meanings.
   * Order: Observation → Evidence → Detection → Reporting → Presentation.
   * Port failures become readiness/partial signals (ADR-006)—not invented Detection outcomes.
   */
  async run(context: InvestigationContext): Promise<InvestigationRunResult> {
    if (context.state !== InvestigationState.InProgress) {
      throwEngineError(
        InvestigationEngineErrorCode.EpisodeNotInProgress,
        `run requires InProgress; got ${context.state}`,
      );
    }

    const stageResults: PortStageResult[] = [
      await this.ports.observation.requestAffordance(context),
      await this.ports.evidence.requestAcquisition(context),
      await this.ports.detection.requestEvaluation(context),
      await this.ports.reporting.requestAssembly(context),
      await this.ports.presentation.requestPreparation(context),
    ];

    const readiness = readinessFromPortResults(stageResults);
    return Object.freeze({
      context,
      stageResults: Object.freeze([...stageResults]),
      readiness,
    });
  }

  /**
   * Declare Completion Disposition from readiness (S-009). Does not re-enter Detection/Evidence.
   */
  complete(
    context: InvestigationContext,
    readiness: CompletionReadiness,
  ): InvestigationContext {
    const disposition = resolveCompletionDisposition(
      createCompletionReadiness(readiness),
    );
    return this.lifecycle.dispose(context, disposition);
  }

  /**
   * Convenience: run ports then dispose honestly from aggregated readiness.
   */
  async runToCompletion(context: InvestigationContext): Promise<InvestigationContext> {
    const result = await this.run(context);
    return this.complete(result.context, result.readiness);
  }

  getLifecycle(): InvestigationLifecycle {
    return this.lifecycle;
  }
}

export const ORCHESTRATION_ORDER: readonly (typeof CollaboratorStage)[keyof typeof CollaboratorStage][] =
  [
    CollaboratorStage.Observation,
    CollaboratorStage.Evidence,
    CollaboratorStage.Detection,
    CollaboratorStage.Reporting,
    CollaboratorStage.Presentation,
  ];
