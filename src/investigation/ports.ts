import type { InvestigationContext } from "./investigation-context.js";

/**
 * Collaborator orchestration ports (E-003).
 * Implementations belong to later packages; Investigation must not own their meanings.
 *
 * Must never own inside P-001: Evidence contents, Detection Results, Report assembly,
 * Presentation semantics, Configuration fetch, Observation affordance meaning.
 */

export const CollaboratorStage = {
  Observation: "Observation",
  Evidence: "Evidence",
  Detection: "Detection",
  Reporting: "Reporting",
  Presentation: "Presentation",
} as const;

export type CollaboratorStage =
  (typeof CollaboratorStage)[keyof typeof CollaboratorStage];

/**
 * Opaque stage readiness — Investigation reads readiness only, not collaborator payloads.
 */
export interface PortStageResult {
  readonly stage: CollaboratorStage;
  readonly ok: boolean;
  /** Upstream incompleteness signal (ADR-006); not Detection ownership. */
  readonly partial?: boolean;
  /** Open Unknown impact signal; not a catalog invention. */
  readonly unknownQualified?: boolean;
  readonly detail?: string;
}

export interface ObservationPort {
  requestAffordance(context: InvestigationContext): Promise<PortStageResult>;
}

export interface EvidencePort {
  requestAcquisition(context: InvestigationContext): Promise<PortStageResult>;
}

export interface DetectionPort {
  requestEvaluation(context: InvestigationContext): Promise<PortStageResult>;
}

export interface ReportingPort {
  requestAssembly(context: InvestigationContext): Promise<PortStageResult>;
}

export interface PresentationPort {
  requestPreparation(context: InvestigationContext): Promise<PortStageResult>;
}

export interface CollaboratorPorts {
  readonly observation: ObservationPort;
  readonly evidence: EvidencePort;
  readonly detection: DetectionPort;
  readonly reporting: ReportingPort;
  readonly presentation: PresentationPort;
}
