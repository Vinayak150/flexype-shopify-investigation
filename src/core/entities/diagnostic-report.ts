import type { ReportId, InvestigationId } from "../../shared/types/identifiers";

export interface DiagnosticReport {
  readonly id: ReportId;
  readonly investigationId: InvestigationId;
  readonly generatedAt: Date;
}
