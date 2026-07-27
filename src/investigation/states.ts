/**
 * Investigation lifecycle states (Domain Model §6.1).
 * NotApplicable is reserved; U-008 remains Open.
 */
export const InvestigationState = {
  NotStarted: "NotStarted",
  InProgress: "InProgress",
  Completed: "Completed",
  CompletedPartial: "CompletedPartial",
  NotApplicable: "NotApplicable",
} as const;

export type InvestigationState =
  (typeof InvestigationState)[keyof typeof InvestigationState];

/**
 * Completion disposition (IO-012).
 * NotApplicable reserved under U-008.
 */
export const CompletionDisposition = {
  Completed: "Completed",
  CompletedPartial: "CompletedPartial",
  UnknownQualified: "UnknownQualified",
  NotApplicable: "NotApplicable",
} as const;

export type CompletionDisposition =
  (typeof CompletionDisposition)[keyof typeof CompletionDisposition];

export const INVESTIGATION_STATES: readonly InvestigationState[] =
  Object.values(InvestigationState);

export const COMPLETION_DISPOSITIONS: readonly CompletionDisposition[] =
  Object.values(CompletionDisposition);
