import type { AgendaItemId, DomainUnknownId } from "./identifiers.js";

/**
 * IO-008 Unknown Qualification — links an item to an Open U-* (EP-003).
 * Must not be stripped for convenience.
 */
export interface UnknownQualification {
  readonly kind: "UnknownQualification";
  readonly domainUnknownId: DomainUnknownId;
  readonly agendaItemId?: AgendaItemId;
  readonly note?: string;
}

export function createUnknownQualification(input: {
  readonly domainUnknownId: DomainUnknownId;
  readonly agendaItemId?: AgendaItemId;
  readonly note?: string;
}): UnknownQualification {
  return Object.freeze({
    kind: "UnknownQualification",
    domainUnknownId: input.domainUnknownId,
    ...(input.agendaItemId !== undefined ? { agendaItemId: input.agendaItemId } : {}),
    ...(input.note !== undefined ? { note: input.note } : {}),
  });
}
