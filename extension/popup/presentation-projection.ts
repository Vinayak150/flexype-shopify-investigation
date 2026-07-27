/**
 * Popup presentation projection — maps PresentationReadyView to extension-safe payload.
 * Display boundary only; no Detection, Evidence, or Report assembly.
 */
import { FlexyPeProductId } from "../../src/detection/catalogs.js";
import type { CompletionDisposition } from "../../src/investigation/states.js";
import type { PresentationReadyView } from "../../src/presentation/index.js";
import { PresentationSectionId } from "../../src/presentation/sections.js";
import type { ViewFindingItem } from "../../src/presentation/view-sections.js";
import {
  projectPopupStoreInformation,
  type PopupStoreInformation,
} from "../adapters/store-metadata-projection.js";
import { resolveDisabledIntegrationReason } from "../adapters/disabled-signal-projection.js";
import type { StorefrontDisabledSignals } from "../adapters/storefront-observation.js";
import type { StorefrontMetadataSnapshot } from "../adapters/store-metadata.js";

export type PopupStoreInfo = PopupStoreInformation;

export interface PopupProductStatus {
  readonly productLabel: string;
  readonly status: string;
  readonly explanation?: string;
}

export interface PopupInvestigationSummary {
  readonly completionState: string;
  readonly completenessLabel: string;
  readonly completenessKind: string;
  readonly hasUnknownQualifications: boolean;
  readonly hasNotDetectedOutcomes: boolean;
}

export interface PopupPresentationPayload {
  readonly kind: "PresentationReadyView";
  readonly investigationId: string;
  readonly completenessLabel: string;
  readonly unknownVisible: boolean;
  readonly notDetectedVisible: boolean;
  readonly sectionOrder: readonly string[];
  readonly store: PopupStoreInfo;
  readonly products: readonly PopupProductStatus[];
  readonly summary: PopupInvestigationSummary;
}

const PRODUCT_CATALOG: readonly {
  readonly productId: (typeof FlexyPeProductId)[keyof typeof FlexyPeProductId];
  readonly label: string;
}[] = Object.freeze([
  { productId: FlexyPeProductId.Checkout, label: "FlexyPe Checkout" },
  { productId: FlexyPeProductId.FlexyPass, label: "FlexyPass" },
  { productId: FlexyPeProductId.FlexyCart, label: "FlexyCart" },
]);

function formatCompletionState(
  disposition: CompletionDisposition | undefined,
  completenessKind: string,
): string {
  switch (disposition) {
    case "Completed":
      return "Completed";
    case "CompletedPartial":
      return "Completed Partial";
    case "UnknownQualified":
      return "Unknown Qualified";
    case "NotApplicable":
      return "Not Applicable";
    default:
      break;
  }

  switch (completenessKind) {
    case "CompleteAsObtainable":
      return "Completed";
    case "Partial":
      return "Completed Partial";
    case "UnknownInfluenced":
      return "Unknown Qualified";
    default:
      return completenessKind;
  }
}

function resolveExplanation(
  finding: ViewFindingItem,
  view: PresentationReadyView,
): string | undefined {
  if (finding.explanationIntent !== undefined && finding.explanationIntent.length > 0) {
    return finding.explanationIntent;
  }

  const explanation = view.explanations.find((item) =>
    finding.supportingExplanationIds.includes(item.definitionId),
  );
  if (explanation?.restraintReason !== undefined) {
    switch (explanation.restraintReason) {
      case "InsufficientEvidence":
        return "Insufficient supporting evidence";
      case "OpenUnknown":
        return "Open unknown qualification";
      case "Unavailable":
        return "Required signals unavailable";
      case "MultiSignalUnsatisfied":
        return "Required signal combination not satisfied";
      default:
        return explanation.restraintReason;
    }
  }

  return undefined;
}

function findProductFinding(
  view: PresentationReadyView,
  productId: string,
): ViewFindingItem | undefined {
  const section = view.viewSections.find(
    (item) => item.sectionId === PresentationSectionId.PS003_FlexyPeProducts,
  );
  if (
    section === undefined ||
    section.sectionId !== PresentationSectionId.PS003_FlexyPeProducts
  ) {
    return undefined;
  }

  return section.findings.find((finding) => finding.subjectLabel.includes(productId));
}

function findDisabledFinding(
  view: PresentationReadyView,
  productId: string,
): ViewFindingItem | undefined {
  const section = view.viewSections.find(
    (item) => item.sectionId === PresentationSectionId.PS004_DisabledIntegrations,
  );
  if (
    section === undefined ||
    section.sectionId !== PresentationSectionId.PS004_DisabledIntegrations
  ) {
    return undefined;
  }

  return section.findings.find((finding) => finding.subjectLabel.includes(productId));
}

export function projectPresentationForPopup(
  view: PresentationReadyView,
  completionDisposition?: CompletionDisposition,
  storeMetadata?: StorefrontMetadataSnapshot,
  disabledSignals?: StorefrontDisabledSignals,
): PopupPresentationPayload {
  const statusSection = view.viewSections.find(
    (item) => item.sectionId === PresentationSectionId.PS009_InvestigationStatus,
  );

  const store = projectPopupStoreInformation({
    reportStore: view.report.storeInformation,
    ...(storeMetadata !== undefined ? { metadata: storeMetadata } : {}),
  });

  const products = Object.freeze(
    PRODUCT_CATALOG.map(({ productId, label }) => {
      const presenceFinding = findProductFinding(view, productId);
      const disabledFinding = findDisabledFinding(view, productId);
      const detected = presenceFinding?.outcomeLabel === "Detected";
      const disabled = !detected && disabledFinding?.outcomeLabel === "Disabled";
      const status = detected
        ? "Detected"
        : disabled
          ? "Disabled"
          : (presenceFinding?.outcomeLabel ?? "Unknown");
      const explanation = detected
        ? presenceFinding !== undefined
          ? resolveExplanation(presenceFinding, view)
          : undefined
        : disabled
          ? (resolveDisabledIntegrationReason(productId, disabledSignals) ??
            (disabledFinding !== undefined
              ? resolveExplanation(disabledFinding, view)
              : undefined))
          : presenceFinding !== undefined
            ? resolveExplanation(presenceFinding, view)
            : undefined;

      return Object.freeze({
        productLabel: label,
        status,
        ...(explanation !== undefined ? { explanation } : {}),
      });
    }),
  );

  const completenessKind =
    statusSection !== undefined &&
    statusSection.sectionId === PresentationSectionId.PS009_InvestigationStatus
      ? statusSection.completenessKind
      : view.report.completeness.completenessKind;

  const completenessLabel =
    statusSection !== undefined &&
    statusSection.sectionId === PresentationSectionId.PS009_InvestigationStatus
      ? statusSection.completenessLabel
      : view.completenessLabel;

  const summary: PopupInvestigationSummary = Object.freeze({
    completionState: formatCompletionState(completionDisposition, completenessKind),
    completenessLabel,
    completenessKind,
    hasUnknownQualifications: view.report.completeness.hasUnknownQualifications,
    hasNotDetectedOutcomes: view.report.completeness.hasNotDetectedOutcomes,
  });

  return Object.freeze({
    kind: "PresentationReadyView",
    investigationId: String(view.report.investigationId),
    completenessLabel: view.completenessLabel,
    unknownVisible: view.unknownVisible,
    notDetectedVisible: view.notDetectedVisible,
    sectionOrder: Object.freeze([...view.sectionOrder]),
    store,
    products,
    summary,
  });
}
