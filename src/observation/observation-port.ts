import {
  CollaboratorStage,
  type InvestigationContext,
  type ObservationPort,
  type PortStageResult,
} from "../investigation/index.js";
import type { ObservationCoordinator } from "./coordinator.js";
import { ObservationEngineError } from "./errors.js";
import { affordanceHasIncompleteness } from "./observation-affordance.js";

/**
 * Fulfills E-003 ObservationPort using P-002 Observation Engine.
 */
export function createObservationPort(
  coordinator: ObservationCoordinator,
): ObservationPort {
  return {
    async requestAffordance(context: InvestigationContext): Promise<PortStageResult> {
      try {
        const affordance = await coordinator.observe(context);
        const incomplete = affordanceHasIncompleteness(affordance);
        return Object.freeze({
          stage: CollaboratorStage.Observation,
          ok: affordance.isPubliclyObservable || incomplete,
          ...(incomplete ? { partial: true } : {}),
          detail: affordance.isPubliclyObservable
            ? "ObservationAffordance ready"
            : "Observation incomplete; no Admin fallback",
        });
      } catch (error) {
        const detail =
          error instanceof ObservationEngineError
            ? error.message
            : "Observation failed";
        return Object.freeze({
          stage: CollaboratorStage.Observation,
          ok: false,
          partial: true,
          detail,
        });
      }
    },
  };
}
