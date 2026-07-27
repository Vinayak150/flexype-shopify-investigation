export type DetectionResultId = string & { readonly __brand: "DetectionResultId" };
export type AgendaItemId = string & { readonly __brand: "AgendaItemId" };

/**
 * Open Domain Unknown identifiers (U-001…U-010). Do not invent meanings.
 */
export type DomainUnknownId =
  | "U-001"
  | "U-002"
  | "U-003"
  | "U-004"
  | "U-005"
  | "U-006"
  | "U-007"
  | "U-008"
  | "U-009"
  | "U-010";

export const DOMAIN_UNKNOWN_IDS: readonly DomainUnknownId[] = [
  "U-001",
  "U-002",
  "U-003",
  "U-004",
  "U-005",
  "U-006",
  "U-007",
  "U-008",
  "U-009",
  "U-010",
] as const;

export function createDetectionResultId(value: string): DetectionResultId {
  const trimmed = value.trim();
  if (trimmed.length === 0) {
    throw new Error("DetectionResultId must be a non-empty string");
  }
  return trimmed as DetectionResultId;
}

export function createAgendaItemId(value: string): AgendaItemId {
  const trimmed = value.trim();
  if (trimmed.length === 0) {
    throw new Error("AgendaItemId must be a non-empty string");
  }
  return trimmed as AgendaItemId;
}

export function isDomainUnknownId(value: string): value is DomainUnknownId {
  return (DOMAIN_UNKNOWN_IDS as readonly string[]).includes(value);
}
