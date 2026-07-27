import {
  InvestigationState,
  type InvestigationContext,
} from "../investigation/index.js";
import type { ObservationAffordance } from "../observation/index.js";
import type { EvidenceCollector } from "./collector.js";
import { EvidenceEngineErrorCode, throwEvidenceError } from "./engine-errors.js";
import { createEvidenceSet, type EvidenceSet } from "./evidence.js";

export type EvidenceAcquisitionStatus = "closed" | "open" | "collected" | "sealed";

/**
 * Owns S-003 acquisition session for one Investigation.
 * open → collect → seal collected set → hand to normalizer.
 */
export class EvidenceAcquisition {
  private status: EvidenceAcquisitionStatus = "closed";
  private sealedSet: EvidenceSet | undefined;
  private readonly context: InvestigationContext;
  private readonly affordance: ObservationAffordance;
  private readonly collector: EvidenceCollector;

  constructor(
    context: InvestigationContext,
    affordance: ObservationAffordance,
    collector: EvidenceCollector,
  ) {
    if (context.state !== InvestigationState.InProgress) {
      throwEvidenceError(
        EvidenceEngineErrorCode.InvestigationNotInProgress,
        `Evidence acquisition requires InProgress Investigation; got ${context.state}`,
      );
    }
    this.context = context;
    this.affordance = affordance;
    this.collector = collector;
  }

  getStatus(): EvidenceAcquisitionStatus {
    return this.status;
  }

  open(): void {
    if (this.status !== "closed") {
      throwEvidenceError(
        EvidenceEngineErrorCode.AcquisitionNotOpen,
        `Cannot open acquisition from status ${this.status}`,
      );
    }
    this.status = "open";
  }

  async collect(): Promise<void> {
    if (this.status !== "open") {
      throwEvidenceError(
        EvidenceEngineErrorCode.AcquisitionNotOpen,
        `collect requires open acquisition; got ${this.status}`,
      );
    }
    const collected = await this.collector.collect(this.context, this.affordance);
    this.sealedSet = createEvidenceSet({
      investigationId: this.context.investigationId,
      items: collected.items,
      unobtainableSignalClasses: collected.unobtainableSignalClasses,
    });
    this.status = "collected";
  }

  seal(): EvidenceSet {
    if (this.sealedSet === undefined || this.status !== "collected") {
      throwEvidenceError(
        EvidenceEngineErrorCode.AcquisitionNotOpen,
        "seal requires collection to complete first",
      );
    }
    this.status = "sealed";
    return this.sealedSet;
  }
}
