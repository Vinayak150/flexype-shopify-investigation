import type { InvestigationContext, InvestigationId } from "../investigation/index.js";
import type { ObservationAffordance } from "../observation/index.js";
import { EvidenceAcquisition } from "./acquisition.js";
import { EvidenceCollector, type FactSourcePort } from "./collector.js";
import { EvidenceEngineErrorCode, throwEvidenceError } from "./engine-errors.js";
import type { NormalizedEvidence } from "./normalized-evidence.js";
import { EvidenceNormalizer } from "./normalizer.js";
import { SignalClassifier } from "./signals.js";
import { assertNormalizedEvidenceImmutable } from "./validation.js";

/**
 * Evidence Engine entry: collect from ObservationAffordance → normalize → freeze.
 * Must not detect products, score confidence, or assemble reports.
 */
export class EvidenceCoordinator {
  private readonly collector: EvidenceCollector;
  private readonly normalizer: EvidenceNormalizer;
  private readonly snapshots = new Map<InvestigationId, NormalizedEvidence>();

  constructor(options?: {
    readonly factSource?: FactSourcePort;
    readonly classifier?: SignalClassifier;
    readonly normalizer?: EvidenceNormalizer;
  }) {
    this.collector = new EvidenceCollector(
      options?.classifier ?? new SignalClassifier(),
      options?.factSource,
    );
    this.normalizer = options?.normalizer ?? new EvidenceNormalizer();
  }

  /**
   * Single acquisition phase per Investigation (ADR-005).
   * Second call returns the frozen snapshot without re-collection.
   */
  async acquireAndNormalize(
    context: InvestigationContext,
    affordance: ObservationAffordance,
  ): Promise<NormalizedEvidence> {
    const existing = this.snapshots.get(context.investigationId);
    if (existing !== undefined) {
      return existing;
    }

    if (affordance === undefined || affordance.kind !== "ObservationAffordance") {
      throwEvidenceError(
        EvidenceEngineErrorCode.MissingObservationAffordance,
        "Cannot collect Evidence without ObservationAffordance",
      );
    }

    const acquisition = new EvidenceAcquisition(context, affordance, this.collector);
    acquisition.open();
    await acquisition.collect();
    const evidenceSet = acquisition.seal();
    const normalized = this.normalizer.normalize(evidenceSet);

    const immutabilityError = assertNormalizedEvidenceImmutable(normalized);
    if (immutabilityError !== undefined) {
      throwEvidenceError(
        EvidenceEngineErrorCode.InvalidEvidenceItem,
        immutabilityError.message,
      );
    }

    this.snapshots.set(context.investigationId, normalized);
    return normalized;
  }

  getSnapshot(investigationId: InvestigationId): NormalizedEvidence | undefined {
    return this.snapshots.get(investigationId);
  }

  hasSnapshot(investigationId: InvestigationId): boolean {
    return this.snapshots.has(investigationId);
  }

  /**
   * Reject Configuration-as-Evidence wiring explicitly (DF-RISK-003).
   */
  rejectConfigurationAsEvidenceSource(): never {
    throwEvidenceError(
      EvidenceEngineErrorCode.ConfigurationAsEvidenceForbidden,
      "Product Configuration must never source or contaminate Evidence",
    );
  }
}
