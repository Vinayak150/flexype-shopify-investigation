import {
  CollaboratorStage,
  type EvidencePort,
  type InvestigationContext,
  type PortStageResult,
} from "../investigation/index.js";
import type { ObservationAffordance } from "../observation/index.js";
import type { EvidenceCoordinator } from "./coordinator.js";
import { EvidenceEngineError } from "./engine-errors.js";

export type ObservationAffordanceResolver = (
  context: InvestigationContext,
) => ObservationAffordance | undefined | Promise<ObservationAffordance | undefined>;

/**
 * Fulfills E-003 EvidencePort using P-003 Evidence Engine.
 */
export function createEvidencePort(
  coordinator: EvidenceCoordinator,
  resolveAffordance: ObservationAffordanceResolver,
): EvidencePort {
  return {
    async requestAcquisition(context: InvestigationContext): Promise<PortStageResult> {
      try {
        const affordance = await resolveAffordance(context);
        if (affordance === undefined) {
          return Object.freeze({
            stage: CollaboratorStage.Evidence,
            ok: false,
            partial: true,
            detail: "Missing ObservationAffordance for Evidence acquisition",
          });
        }

        const snapshot = await coordinator.acquireAndNormalize(context, affordance);
        const partial = snapshot.unobtainableSignalClasses.length > 0;

        return Object.freeze({
          stage: CollaboratorStage.Evidence,
          ok: true,
          ...(partial ? { partial: true } : {}),
          detail: "NormalizedEvidence immutable snapshot ready",
        });
      } catch (error) {
        const detail =
          error instanceof EvidenceEngineError
            ? error.message
            : "Evidence acquisition failed";
        return Object.freeze({
          stage: CollaboratorStage.Evidence,
          ok: false,
          partial: true,
          detail,
        });
      }
    },
  };
}
