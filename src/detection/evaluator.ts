import type {
  EvidenceItem,
  EvidenceSignalClass,
  NormalizedEvidence,
} from "../evidence/index.js";
import type { InvestigationId } from "../investigation/index.js";
import type { EvaluationAgendaItem } from "./evaluation-agenda.js";
import {
  assertMultiSignalDefinition,
  type DetectionDefinitionRegistry,
  type DisabledIntegrationDefinition,
  type ProductPresenceDefinition,
} from "./definitions.js";
import { createDetectionResult, type DetectionResult } from "./detection-result.js";
import { createDetectionResultId } from "./identifiers.js";
import { DetectionOutcome, DisabledIntegrationState } from "./outcomes.js";
import {
  createExplanationReference,
  type ExplanationReference,
} from "./explanation.js";
import { createUnknownQualification } from "./unknown-qualification.js";

export interface EvaluatedDetection {
  readonly result: DetectionResult;
  readonly explanation: ExplanationReference;
}

function matchesAnyMarker(item: EvidenceItem, markers: readonly string[]): boolean {
  const haystack = `${item.observationSummary} ${item.provenance.sourceRef}`;
  return markers.some((marker) => haystack.includes(marker));
}

function matchingEvidence(
  evidence: NormalizedEvidence,
  markers: readonly string[],
  candidateClasses: readonly string[],
): readonly EvidenceItem[] {
  const candidates = new Set(candidateClasses);
  return evidence.items.filter(
    (item) => candidates.has(item.signalClass) && matchesAnyMarker(item, markers),
  );
}

function distinctSignalClasses(
  items: readonly EvidenceItem[],
): readonly EvidenceSignalClass[] {
  return [...new Set(items.map((item) => item.signalClass))];
}

/**
 * Definition-driven evaluator over immutable Normalized Evidence (S-006 / ADR-003).
 * No browser access; no Evidence mutation; no invented catalogs for U-001/U-002.
 */
export class DefinitionEvaluator {
  private readonly registry: DetectionDefinitionRegistry;

  constructor(registry: DetectionDefinitionRegistry) {
    this.registry = registry;
    for (const definition of registry.products) {
      assertMultiSignalDefinition(definition);
    }
    for (const definition of registry.disabledIntegrations) {
      assertMultiSignalDefinition(definition);
    }
  }

  evaluateItem(
    investigationId: InvestigationId,
    item: EvaluationAgendaItem,
    evidence: NormalizedEvidence,
  ): EvaluatedDetection {
    switch (item.subject.kind) {
      case "FlexyPeProduct":
        return this.evaluateProduct(
          investigationId,
          item,
          evidence,
          this.requireProductDefinition(item.subject.productId),
        );
      case "DisabledIntegration":
        return this.evaluateDisabled(
          investigationId,
          item,
          evidence,
          this.requireDisabledDefinition(item.subject.productId),
        );
      case "Theme":
        return this.evaluateTheme(investigationId, item, evidence);
      case "StoreInformation":
        return this.evaluateStoreInformation(investigationId, item, evidence);
      case "ThirdPartyApp":
        return this.evaluateOpenUnknown(
          investigationId,
          item,
          "U-002",
          "def.unknown.thirdPartyApp",
        );
      case "StorefrontFeature":
        return this.evaluateOpenUnknown(
          investigationId,
          item,
          "U-001",
          "def.unknown.storefrontFeature",
        );
      default: {
        const _exhaustive: never = item.subject;
        return _exhaustive;
      }
    }
  }

  private requireProductDefinition(productId: string): ProductPresenceDefinition {
    const definition = this.registry.products.find(
      (entry) => entry.productId === productId,
    );
    if (definition === undefined) {
      throw new Error(`Missing product definition for ${productId}`);
    }
    return definition;
  }

  private requireDisabledDefinition(productId: string): DisabledIntegrationDefinition {
    const definition = this.registry.disabledIntegrations.find(
      (entry) => entry.productId === productId,
    );
    if (definition === undefined) {
      throw new Error(`Missing disabled definition for ${productId}`);
    }
    return definition;
  }

  private evaluateProduct(
    investigationId: InvestigationId,
    item: EvaluationAgendaItem,
    evidence: NormalizedEvidence,
    definition: ProductPresenceDefinition,
  ): EvaluatedDetection {
    const matched = matchingEvidence(
      evidence,
      definition.presenceMarkers,
      definition.candidateSignalClasses,
    );
    const classes = distinctSignalClasses(matched);
    const detected = classes.length >= definition.minDistinctSignalClasses;

    const explanation = createExplanationReference({
      definitionId: definition.definitionId,
      supportingEvidenceIds: matched.map((entry) => entry.evidenceItemId),
      supportingSignalClasses: classes,
      ...(detected ? {} : { restraintReason: "MultiSignalUnsatisfied" as const }),
    });

    const result = createDetectionResult({
      detectionResultId: createDetectionResultId(`dr.${String(item.agendaItemId)}`),
      investigationId,
      agendaItemId: item.agendaItemId,
      subject: item.subject,
      outcome: detected ? DetectionOutcome.Detected : DetectionOutcome.NotDetected,
      supportingEvidenceIds: matched.map((entry) => entry.evidenceItemId),
      explanationIntent: detected
        ? `Satisfied ${definition.definitionId} across ${String(classes.length)} signal classes`
        : `Insufficient multi-signal Evidence for ${definition.productId}; NotDetected (FR-013)`,
    });

    return Object.freeze({ result, explanation });
  }

  private evaluateDisabled(
    investigationId: InvestigationId,
    item: EvaluationAgendaItem,
    evidence: NormalizedEvidence,
    definition: DisabledIntegrationDefinition,
  ): EvaluatedDetection {
    const matched = matchingEvidence(
      evidence,
      definition.disabledMarkers,
      definition.candidateSignalClasses,
    );
    const classes = distinctSignalClasses(matched);
    const disabled = classes.length >= definition.minDistinctSignalClasses;

    const explanation = createExplanationReference({
      definitionId: definition.definitionId,
      supportingEvidenceIds: matched.map((entry) => entry.evidenceItemId),
      supportingSignalClasses: classes,
      ...(disabled ? {} : { restraintReason: "InsufficientEvidence" as const }),
    });

    const result = createDetectionResult({
      detectionResultId: createDetectionResultId(`dr.${String(item.agendaItemId)}`),
      investigationId,
      agendaItemId: item.agendaItemId,
      subject: item.subject,
      outcome: disabled ? DetectionOutcome.Disabled : DetectionOutcome.NotDetected,
      disabledIntegrationState: disabled
        ? DisabledIntegrationState.Disabled
        : DisabledIntegrationState.Unknown,
      supportingEvidenceIds: matched.map((entry) => entry.evidenceItemId),
      explanationIntent: disabled
        ? `Disabled integration markers satisfied for ${definition.productId}`
        : `No multi-signal disabled Evidence for ${definition.productId}`,
    });

    return Object.freeze({ result, explanation });
  }

  private evaluateTheme(
    investigationId: InvestigationId,
    item: EvaluationAgendaItem,
    evidence: NormalizedEvidence,
  ): EvaluatedDetection {
    const themeItems = evidence.items.filter(
      (entry) =>
        entry.signalClass === "ShopifyThemeAssets" ||
        entry.observationSummary.startsWith("store.themeName:"),
    );
    const available = themeItems.length > 0;
    const explanation = createExplanationReference({
      definitionId: "def.store.themeAvailability",
      supportingEvidenceIds: themeItems.map((entry) => entry.evidenceItemId),
      supportingSignalClasses: distinctSignalClasses(themeItems),
      ...(available ? {} : { restraintReason: "Unavailable" as const }),
    });
    const result = createDetectionResult({
      detectionResultId: createDetectionResultId(`dr.${String(item.agendaItemId)}`),
      investigationId,
      agendaItemId: item.agendaItemId,
      subject: item.subject,
      outcome: available ? DetectionOutcome.Available : DetectionOutcome.Unavailable,
      supportingEvidenceIds: themeItems.map((entry) => entry.evidenceItemId),
      explanationIntent: available
        ? "Theme-related Evidence present"
        : "Theme Name Unavailable from Evidence",
    });
    return Object.freeze({ result, explanation });
  }

  private evaluateStoreInformation(
    investigationId: InvestigationId,
    item: EvaluationAgendaItem,
    evidence: NormalizedEvidence,
  ): EvaluatedDetection {
    const storeItems = evidence.items.filter(
      (entry) =>
        entry.observationSummary.startsWith("store.") ||
        entry.signalClass === "GlobalBrowserObjects",
    );
    const explanation = createExplanationReference({
      definitionId: "def.store.information",
      supportingEvidenceIds: storeItems.map((entry) => entry.evidenceItemId),
      supportingSignalClasses: distinctSignalClasses(storeItems),
      ...(storeItems.length === 0
        ? { restraintReason: "InsufficientEvidence" as const }
        : {}),
    });
    const result = createDetectionResult({
      detectionResultId: createDetectionResultId(`dr.${String(item.agendaItemId)}`),
      investigationId,
      agendaItemId: item.agendaItemId,
      subject: item.subject,
      outcome:
        storeItems.length > 0
          ? DetectionOutcome.Available
          : DetectionOutcome.Unavailable,
      supportingEvidenceIds: storeItems.map((entry) => entry.evidenceItemId),
      explanationIntent: "Store Information projected from Evidence snapshot",
    });
    return Object.freeze({ result, explanation });
  }

  private evaluateOpenUnknown(
    investigationId: InvestigationId,
    item: EvaluationAgendaItem,
    domainUnknownId: "U-001" | "U-002",
    definitionId: string,
  ): EvaluatedDetection {
    const qualification = createUnknownQualification({
      domainUnknownId,
      agendaItemId: item.agendaItemId,
      note: "Open Unknown retained; no catalog invented",
    });
    const explanation = createExplanationReference({
      definitionId,
      restraintReason: "OpenUnknown",
    });
    const result = createDetectionResult({
      detectionResultId: createDetectionResultId(`dr.${String(item.agendaItemId)}`),
      investigationId,
      agendaItemId: item.agendaItemId,
      subject: item.subject,
      outcome: DetectionOutcome.Unknown,
      unknownQualification: qualification,
      explanationIntent: `Unknown-qualified under ${domainUnknownId}`,
    });
    return Object.freeze({ result, explanation });
  }
}
