import type { EvidenceId, InvestigationId } from "../../shared/types/identifiers";

export interface EvidenceSnapshot {
  readonly id: EvidenceId;
  readonly investigationId: InvestigationId;
  readonly capturedAt: Date;
}
