/**
 * Discovery-only incompleteness markers (U-007 honesty).
 * Not Detection outcomes; not Admin fallback authorization.
 */
export const ObservationIncompletenessReason = {
  DocumentUnreachable: "DocumentUnreachable",
  MetadataUnreachable: "MetadataUnreachable",
  TraversalUnavailable: "TraversalUnavailable",
  QueryUnavailable: "QueryUnavailable",
  NonPublicContext: "NonPublicContext",
  LimitedReach: "LimitedReach",
} as const;

export type ObservationIncompletenessReason =
  (typeof ObservationIncompletenessReason)[keyof typeof ObservationIncompletenessReason];

export interface ObservationIncompletenessMarker {
  readonly kind: "ObservationIncompletenessMarker";
  readonly reason: ObservationIncompletenessReason;
  readonly detail?: string;
}

export function createIncompletenessMarker(
  reason: ObservationIncompletenessReason,
  detail?: string,
): ObservationIncompletenessMarker {
  return Object.freeze({
    kind: "ObservationIncompletenessMarker",
    reason,
    ...(detail !== undefined ? { detail } : {}),
  });
}
