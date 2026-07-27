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

/**
 * Core-before-optional reading order (UI Architecture).
 * PS-008 Unknowns remain visible before optional PS-007 Configuration.
 */
export const CORE_BEFORE_OPTIONAL_SECTION_ORDER: readonly PresentationSectionId[] =
  Object.freeze([
    PresentationSectionId.PS001_InvestigationSummary,
    PresentationSectionId.PS002_StoreInformation,
    PresentationSectionId.PS003_FlexyPeProducts,
    PresentationSectionId.PS004_DisabledIntegrations,
    PresentationSectionId.PS005_ThirdPartyApps,
    PresentationSectionId.PS006_StorefrontFeatures,
    PresentationSectionId.PS008_UnknownQualifications,
    PresentationSectionId.PS007_OptionalProductConfiguration,
    PresentationSectionId.PS009_InvestigationStatus,
  ]);
