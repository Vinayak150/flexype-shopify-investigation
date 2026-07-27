/**
 * Opaque provenance for optional Configuration (U-006 Open).
 * Must not claim public Storefront Evidence authority.
 */
export interface ConfigurationMetadata {
  readonly kind: "ConfigurationMetadata";
  /** Opaque source kind — not an architectural API contract. */
  readonly sourceKind: "ExternalOptional" | "MemoryFixture" | "Deferred";
  readonly retrievedAtIso: string;
  readonly note?: string;
}

export function createConfigurationMetadata(input: {
  readonly sourceKind: ConfigurationMetadata["sourceKind"];
  readonly retrievedAtIso?: string;
  readonly note?: string;
}): ConfigurationMetadata {
  return Object.freeze({
    kind: "ConfigurationMetadata",
    sourceKind: input.sourceKind,
    retrievedAtIso: input.retrievedAtIso ?? "1970-01-01T00:00:00.000Z",
    ...(input.note !== undefined ? { note: input.note } : {}),
  });
}
