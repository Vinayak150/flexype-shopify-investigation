import type { InvestigationContext, InvestigationId } from "../investigation/index.js";
import type { NormalizedEvidence } from "../evidence/index.js";
import {
  createDefaultDefinitionRegistry,
  type DetectionDefinitionRegistry,
} from "./definitions.js";
import type { DetectionEvaluationOutput } from "./session.js";
import { DetectionSession } from "./session.js";

/**
 * Detection Engine entry point (E-006).
 * Evaluates definitions against immutable Normalized Evidence only.
 */
export class DetectionEngine {
  private readonly registry: DetectionDefinitionRegistry;
  private readonly outputs = new Map<InvestigationId, DetectionEvaluationOutput>();

  constructor(
    registry: DetectionDefinitionRegistry = createDefaultDefinitionRegistry(),
  ) {
    this.registry = registry;
  }

  /**
   * open → build agenda → evaluate → seal.
   * Deterministic for the same Evidence snapshot + definitions.
   */
  evaluate(
    context: InvestigationContext,
    normalizedEvidence: NormalizedEvidence,
  ): DetectionEvaluationOutput {
    const existing = this.outputs.get(context.investigationId);
    if (existing !== undefined) {
      return existing;
    }

    const session = new DetectionSession(context, normalizedEvidence, this.registry);
    session.open();
    session.evaluate();
    const output = session.seal();
    this.outputs.set(context.investigationId, output);
    return output;
  }

  getOutput(investigationId: InvestigationId): DetectionEvaluationOutput | undefined {
    return this.outputs.get(investigationId);
  }

  hasEvaluated(investigationId: InvestigationId): boolean {
    return this.outputs.has(investigationId);
  }
}
