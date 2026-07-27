import type { InvestigationId } from "../investigation/index.js";
import type { FlexyPeProductId } from "./catalogs.js";
import type { AgendaItemId } from "./identifiers.js";
import type { UnknownQualification } from "./unknown-qualification.js";

/**
 * Subject of an investigatory question — no invented U-001/U-002 catalogs.
 */
export type EvaluationSubject =
  | { readonly kind: "FlexyPeProduct"; readonly productId: FlexyPeProductId }
  | { readonly kind: "DisabledIntegration"; readonly productId: FlexyPeProductId }
  | { readonly kind: "ThirdPartyApp" }
  | { readonly kind: "StorefrontFeature" }
  | { readonly kind: "Theme" }
  | { readonly kind: "StoreInformation" };

/**
 * One Evaluation Agenda item (may be Unknown-qualified).
 */
export interface EvaluationAgendaItem {
  readonly kind: "EvaluationAgendaItem";
  readonly agendaItemId: AgendaItemId;
  readonly subject: EvaluationSubject;
  readonly unknownQualification?: UnknownQualification;
}

/**
 * IO-006 Evaluation Agenda.
 */
export interface EvaluationAgenda {
  readonly kind: "EvaluationAgenda";
  readonly investigationId: InvestigationId;
  readonly items: readonly EvaluationAgendaItem[];
}

export function createEvaluationAgendaItem(input: {
  readonly agendaItemId: AgendaItemId;
  readonly subject: EvaluationSubject;
  readonly unknownQualification?: UnknownQualification;
}): EvaluationAgendaItem {
  return Object.freeze({
    kind: "EvaluationAgendaItem",
    agendaItemId: input.agendaItemId,
    subject: Object.freeze({ ...input.subject }),
    ...(input.unknownQualification !== undefined
      ? { unknownQualification: input.unknownQualification }
      : {}),
  });
}

export function createEvaluationAgenda(input: {
  readonly investigationId: InvestigationId;
  readonly items: readonly EvaluationAgendaItem[];
}): EvaluationAgenda {
  return Object.freeze({
    kind: "EvaluationAgenda",
    investigationId: input.investigationId,
    items: Object.freeze([...input.items]),
  });
}
