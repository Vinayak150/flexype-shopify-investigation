import type { InvestigationId } from "../investigation/index.js";
import { FLEXYPE_PRODUCT_IDS } from "./catalogs.js";
import {
  createEvaluationAgenda,
  createEvaluationAgendaItem,
  type EvaluationAgenda,
} from "./evaluation-agenda.js";
import { createAgendaItemId } from "./identifiers.js";
import { createUnknownQualification } from "./unknown-qualification.js";

/**
 * Build Evaluation Agenda (S-005).
 * Retains Unknown-qualified obligated items (U-001 / U-002)—never drops them.
 */
export function buildEvaluationAgenda(
  investigationId: InvestigationId,
): EvaluationAgenda {
  const items = [
    ...FLEXYPE_PRODUCT_IDS.map((productId) =>
      createEvaluationAgendaItem({
        agendaItemId: createAgendaItemId(`agenda.product.${productId}`),
        subject: { kind: "FlexyPeProduct", productId },
      }),
    ),
    ...FLEXYPE_PRODUCT_IDS.map((productId) =>
      createEvaluationAgendaItem({
        agendaItemId: createAgendaItemId(`agenda.disabled.${productId}`),
        subject: { kind: "DisabledIntegration", productId },
      }),
    ),
    createEvaluationAgendaItem({
      agendaItemId: createAgendaItemId("agenda.storeInformation"),
      subject: { kind: "StoreInformation" },
    }),
    createEvaluationAgendaItem({
      agendaItemId: createAgendaItemId("agenda.theme"),
      subject: { kind: "Theme" },
    }),
    createEvaluationAgendaItem({
      agendaItemId: createAgendaItemId("agenda.thirdPartyApp"),
      subject: { kind: "ThirdPartyApp" },
      unknownQualification: createUnknownQualification({
        domainUnknownId: "U-002",
        agendaItemId: createAgendaItemId("agenda.thirdPartyApp"),
        note: "Third-party app detection method/signals remain Open",
      }),
    }),
    createEvaluationAgendaItem({
      agendaItemId: createAgendaItemId("agenda.storefrontFeature"),
      subject: { kind: "StorefrontFeature" },
      unknownQualification: createUnknownQualification({
        domainUnknownId: "U-001",
        agendaItemId: createAgendaItemId("agenda.storefrontFeature"),
        note: "Storefront feature enumeration/definition remains Open",
      }),
    }),
  ];

  return createEvaluationAgenda({ investigationId, items });
}
