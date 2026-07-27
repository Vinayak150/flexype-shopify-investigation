import type { InvestigationContext } from "../investigation/index.js";
import type { ObservationAffordance } from "../observation/index.js";
import { createEvidenceItem, type EvidenceItem } from "./evidence.js";
import { EvidenceEngineErrorCode, throwEvidenceError } from "./engine-errors.js";
import { createEvidenceItemId } from "./identifiers.js";
import { createEvidenceProvenance } from "./provenance.js";
import {
  EvidenceSignalClass,
  type EvidenceSignalClass as EvidenceSignalClassType,
} from "./signal-class.js";
import { SignalClassifier } from "./signals.js";

export interface CollectableFact {
  readonly signalClass: EvidenceSignalClassType;
  readonly observationSummary: string;
  readonly sourceRef: string;
}

/**
 * Optional fact source for injectable observables.
 * Must not supply Configuration-derived facts as Storefront Evidence.
 */
export interface FactSourcePort {
  collectFacts(
    context: InvestigationContext,
    affordance: ObservationAffordance,
  ): Promise<readonly CollectableFact[]>;
}

/**
 * Collect EvidenceItems from Observation Affordance for one Investigation.
 * Does not evaluate definitions, score confidence, or emit Detection Results.
 */
export class EvidenceCollector {
  private readonly classifier: SignalClassifier;
  private readonly factSource: FactSourcePort | undefined;

  constructor(classifier = new SignalClassifier(), factSource?: FactSourcePort) {
    this.classifier = classifier;
    this.factSource = factSource;
  }

  async collect(
    context: InvestigationContext,
    affordance: ObservationAffordance,
  ): Promise<{
    readonly items: readonly EvidenceItem[];
    readonly unobtainableSignalClasses: readonly EvidenceSignalClassType[];
  }> {
    if (affordance.kind !== "ObservationAffordance") {
      throwEvidenceError(
        EvidenceEngineErrorCode.MissingObservationAffordance,
        "Evidence collection requires ObservationAffordance (IO-002)",
      );
    }
    if (affordance.investigationId !== context.investigationId) {
      throwEvidenceError(
        EvidenceEngineErrorCode.InvestigationMismatch,
        "ObservationAffordance InvestigationId must match Investigation Context",
      );
    }

    const enabled = new Set(
      this.classifier.classesEnabledByAffordance(affordance.descriptors),
    );
    const unobtainable = this.classifier
      .allApprovedClasses()
      .filter((signalClass) => !enabled.has(signalClass));

    const facts: CollectableFact[] = [];

    // Affordance-derived public facts only — never invent product presence.
    if (affordance.isPubliclyObservable) {
      facts.push({
        signalClass: EvidenceSignalClass.GlobalBrowserObjects,
        observationSummary: "Public storefront context available for observation",
        sourceRef: "observation.affordance.isPubliclyObservable",
      });
    }

    if (affordance.descriptors.documentReachable) {
      facts.push({
        signalClass: EvidenceSignalClass.DomElements,
        observationSummary: "Public DOM document reachable",
        sourceRef: "observation.descriptors.documentReachable",
      });
      facts.push({
        signalClass: EvidenceSignalClass.HtmlStructure,
        observationSummary: "Public HTML structure reachable",
        sourceRef: "observation.descriptors.documentReachable",
      });
    }

    if (affordance.descriptors.metadataReachable) {
      facts.push({
        signalClass: EvidenceSignalClass.ShopifyThemeAssets,
        observationSummary: "Public page metadata reachable",
        sourceRef: "observation.descriptors.metadataReachable",
      });
    }

    if (affordance.descriptors.traversalCapable) {
      facts.push({
        signalClass: EvidenceSignalClass.DomElements,
        observationSummary: "DOM traversal capability available",
        sourceRef: "observation.descriptors.traversalCapable",
      });
    }

    if (this.factSource !== undefined) {
      const external = await this.factSource.collectFacts(context, affordance);
      for (const fact of external) {
        this.classifier.classify(fact.signalClass);
        if (enabled.has(fact.signalClass)) {
          facts.push(fact);
        }
        // Facts for unobtainable classes are dropped — no fabrication path.
      }
    }

    const acceptedFacts = facts.filter((fact) => {
      const signalClass = this.classifier.classify(fact.signalClass);
      return enabled.has(signalClass);
    });

    const items = acceptedFacts.map((fact, index) => {
      const signalClass = this.classifier.classify(fact.signalClass);
      return createEvidenceItem({
        evidenceItemId: createEvidenceItemId(
          `${context.investigationId}:ev:${index + 1}`,
        ),
        investigationId: context.investigationId,
        signalClass,
        observationSummary: fact.observationSummary,
        provenance: createEvidenceProvenance({
          investigationId: context.investigationId,
          storefrontUrl: context.storefrontTarget.storefrontUrl,
          sourceRef: fact.sourceRef,
          collectionOrdinal: index + 1,
        }),
      });
    });

    return Object.freeze({
      items: Object.freeze(items),
      unobtainableSignalClasses: Object.freeze(unobtainable),
    });
  }
}
