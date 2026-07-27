import { describe, expect, it } from "vitest";

import {
  createInvestigationContext,
  createInvestigationId,
  createStorefrontTarget,
  InvestigationState,
} from "../../src/investigation/index.js";
import {
  createEvidenceItem,
  createEvidenceItemId,
  createEvidenceProvenance,
  createNormalizedEvidence,
  EvidenceSignalClass,
} from "../../src/evidence/index.js";
import {
  DetectionEngine,
  DetectionOutcome,
  FlexyPeProductId,
} from "../../src/detection/index.js";
import { mapStorefrontSnapshotToFacts } from "../../extension/adapters/map-storefront-facts.js";
import { StorefrontPageType } from "../../extension/adapters/store-metadata.js";
import {
  EMPTY_DISABLED_SIGNALS,
  EMPTY_SHOPIFY_PAGE_SOURCES,
  type StorefrontObservationSnapshot,
} from "../../extension/adapters/storefront-observation.js";

function createSnapshot(
  disabledSignals: StorefrontObservationSnapshot["disabledSignals"],
): StorefrontObservationSnapshot {
  return Object.freeze({
    kind: "StorefrontObservationSnapshot",
    url: "https://store.example/",
    documentReachable: true,
    metadataReachable: true,
    canTraverse: true,
    canQuery: true,
    scriptUrls: Object.freeze([]),
    stylesheetUrls: Object.freeze([]),
    domIndicators: Object.freeze([]),
    globalObjects: Object.freeze([]),
    metadata: Object.freeze({ metaTags: Object.freeze([]) }),
    themeHints: Object.freeze([]),
    storeMetadata: Object.freeze({ pageType: StorefrontPageType.Unknown }),
    shopifySources: EMPTY_SHOPIFY_PAGE_SOURCES,
    disabledSignals,
  });
}

describe("disabled integration detection flow", () => {
  it("evaluates Disabled outcome for commented FlexyPe Checkout script evidence", () => {
    const investigationId = createInvestigationId("inv-disabled-checkout");
    const context = createInvestigationContext({
      investigationId,
      storefrontTarget: createStorefrontTarget("https://store.example/"),
      state: InvestigationState.InProgress,
    });
    const facts = mapStorefrontSnapshotToFacts(
      createSnapshot(
        Object.freeze({
          htmlComments: Object.freeze([
            '<!--\n<script src="https://static.flexype.in/scripts/flexype-v2.min.js"></script>\n-->',
          ]),
          commentedScripts: Object.freeze([
            "https://static.flexype.in/scripts/flexype-v2.min.js",
          ]),
          hiddenFlexyElements: Object.freeze([]),
          disabledFlexyElements: Object.freeze([]),
        }),
      ),
    );

    const evidence = createNormalizedEvidence({
      investigationId,
      items: facts.map((fact, index) =>
        createEvidenceItem({
          evidenceItemId: createEvidenceItemId(`e-${index}`),
          investigationId,
          signalClass: fact.signalClass,
          observationSummary: fact.observationSummary,
          provenance: createEvidenceProvenance({
            investigationId,
            storefrontUrl: "https://store.example/",
            sourceRef: fact.sourceRef,
            collectionOrdinal: index + 1,
          }),
        }),
      ),
      unobtainableSignalClasses: Object.values(EvidenceSignalClass),
    });

    const engine = new DetectionEngine();
    const detection = engine.evaluate(context, evidence);
    const checkoutDisabled = detection.results.results.find(
      (result) =>
        result.subject.kind === "DisabledIntegration" &&
        result.subject.productId === FlexyPeProductId.Checkout,
    );

    expect(checkoutDisabled?.outcome).toBe(DetectionOutcome.Disabled);
  });

  it("does not evaluate disabled outcome for unrelated hidden div evidence", () => {
    const investigationId = createInvestigationId("inv-disabled-none");
    const context = createInvestigationContext({
      investigationId,
      storefrontTarget: createStorefrontTarget("https://store.example/"),
      state: InvestigationState.InProgress,
    });
    const facts = mapStorefrontSnapshotToFacts(
      createSnapshot(
        Object.freeze({
          ...EMPTY_DISABLED_SIGNALS,
          hiddenFlexyElements: Object.freeze([
            Object.freeze({
              tag: "div",
              id: "newsletter-popup",
              concealment: "hidden-attribute" as const,
            }),
          ]),
        }),
      ),
    );

    const evidence = createNormalizedEvidence({
      investigationId,
      items: facts.map((fact, index) =>
        createEvidenceItem({
          evidenceItemId: createEvidenceItemId(`e-${index}`),
          investigationId,
          signalClass: fact.signalClass,
          observationSummary: fact.observationSummary,
          provenance: createEvidenceProvenance({
            investigationId,
            storefrontUrl: "https://store.example/",
            sourceRef: fact.sourceRef,
            collectionOrdinal: index + 1,
          }),
        }),
      ),
      unobtainableSignalClasses: Object.values(EvidenceSignalClass),
    });

    const engine = new DetectionEngine();
    const detection = engine.evaluate(context, evidence);
    const disabledResults = detection.results.results.filter(
      (result) => result.subject.kind === "DisabledIntegration",
    );

    expect(disabledResults.every((result) => result.outcome === DetectionOutcome.NotDetected)).toBe(
      true,
    );
  });
});
