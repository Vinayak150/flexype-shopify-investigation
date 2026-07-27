/**
 * Presentation section organization keys (UI Architecture PS-001…PS-009).
 * Organization identifiers only — not UI widgets.
 */
export const PresentationSectionId = {
  PS001_InvestigationSummary: "PS-001",
  PS002_StoreInformation: "PS-002",
  PS003_FlexyPeProducts: "PS-003",
  PS004_DisabledIntegrations: "PS-004",
  PS005_ThirdPartyApps: "PS-005",
  PS006_StorefrontFeatures: "PS-006",
  PS007_OptionalProductConfiguration: "PS-007",
  PS008_UnknownQualifications: "PS-008",
  PS009_InvestigationStatus: "PS-009",
} as const;

export type PresentationSectionId =
  (typeof PresentationSectionId)[keyof typeof PresentationSectionId];

export const PRESENTATION_SECTION_IDS: readonly PresentationSectionId[] =
  Object.values(PresentationSectionId);
