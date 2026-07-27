import {
  createConfigurationPackage,
  createDetectedProductHint,
  type ConfigurationElection,
  type ConfigurationEngine,
  type ConfigurationPackage,
  type ConfigurationRetriever,
  type ConfigurationSnapshot,
  type DetectedProductHint,
} from "../src/configuration/index.js";
import {
  createDetectionPackage,
  DetectionOutcome,
  type DetectionEngine,
  type DetectionEvaluationOutput,
  type DetectionPackage,
} from "../src/detection/index.js";
import {
  createEvidencePackage,
  type EvidenceCoordinator,
  type EvidencePackage,
  type FactSourcePort,
  type NormalizedEvidence,
} from "../src/evidence/index.js";
import {
  createInvestigationPackage,
  type CollaboratorPorts,
  type InvestigationCoordinator,
  type InvestigationPackage,
  type InvestigationRunResult,
  type OperatorIntent,
  type PortStageResult,
  type InvestigationContext,
} from "../src/investigation/index.js";
import {
  createMemoryBrowserPorts,
  createMemoryDomPorts,
  createObservationPackage,
  type BrowserDiscoveryPorts,
  type DomDiscoveryPorts,
  type ObservationCoordinator,
  type ObservationPackage,
} from "../src/observation/index.js";
import {
  createPresentationPackage,
  type PresentationEngine,
  type PresentationPackage,
  type PresentationReadyView,
} from "../src/presentation/index.js";
import {
  createReportingPackage,
  type DiagnosticReport,
  type ReportingEngine,
  type ReportingPackage,
} from "../src/reporting/index.js";
import {
  createTraceabilityPackage,
  type TraceabilityEngine,
  type TraceabilityPackage,
  type TraceExport,
} from "../src/traceability/index.js";
import { IntegrationErrorCode, throwIntegrationError } from "./errors.js";
import { bindPopupShell, type PopupShellBinding } from "./popup-shell.js";
import { recordInvestigationTrace } from "./trace-hooks.js";

export type SystemRuntimeStatus = "uninitialized" | "ready" | "shutdown";

export interface SystemRuntimeOptions {
  readonly browser?: BrowserDiscoveryPorts;
  readonly dom?: DomDiscoveryPorts;
  readonly factSource?: FactSourcePort;
  /** Default deferred — core path never requires Configuration (FR-026). */
  readonly configurationElection?: ConfigurationElection;
  readonly configurationRetriever?: ConfigurationRetriever;
  /** Default true; disable without failing core path. */
  readonly enableTraceability?: boolean;
  readonly acceptNewInvestigations?: boolean;
}

export interface IntegratedInvestigationResult {
  readonly kind: "IntegratedInvestigationResult";
  readonly context: InvestigationContext;
  readonly run: InvestigationRunResult;
  readonly stageResults: readonly PortStageResult[];
  readonly evidence?: NormalizedEvidence;
  readonly detection?: DetectionEvaluationOutput;
  readonly report?: DiagnosticReport;
  readonly view?: PresentationReadyView;
  readonly configuration?: ConfigurationSnapshot;
  readonly traceExport?: TraceExport;
  readonly popupShell?: PopupShellBinding;
}

/**
 * Extension composition root (E-011).
 * Wires existing package engines/ports — does not evaluate, detect, assemble, or present.
 */
export class SystemRuntime {
  private status: SystemRuntimeStatus = "uninitialized";
  private acceptNewInvestigations = true;

  private traceabilityPackage: TraceabilityPackage | undefined;
  private investigationPackage: InvestigationPackage | undefined;
  private observationPackage: ObservationPackage | undefined;
  private evidencePackage: EvidencePackage | undefined;
  private detectionPackage: DetectionPackage | undefined;
  private reportingPackage: ReportingPackage | undefined;
  private presentationPackage: PresentationPackage | undefined;
  private configurationPackage: ConfigurationPackage | undefined;

  private observationCoordinator: ObservationCoordinator | undefined;
  private evidenceCoordinator: EvidenceCoordinator | undefined;
  private detectionEngine: DetectionEngine | undefined;
  private reportingEngine: ReportingEngine | undefined;
  private presentationEngine: PresentationEngine | undefined;
  private configurationEngine: ConfigurationEngine | undefined;
  private traceabilityEngine: TraceabilityEngine | undefined;
  private investigationCoordinator: InvestigationCoordinator | undefined;

  getStatus(): SystemRuntimeStatus {
    return this.status;
  }

  /**
   * Startup sequence §5 — foundations → core chain → optional adjuncts → wire ports.
   */
  startup(options: SystemRuntimeOptions = {}): void {
    if (this.status === "shutdown") {
      throwIntegrationError(
        IntegrationErrorCode.RuntimeAlreadyShutdown,
        "SystemRuntime was shut down and cannot be restarted in this instance",
      );
    }
    if (this.status === "ready") {
      throwIntegrationError(
        IntegrationErrorCode.RuntimeAlreadyStarted,
        "SystemRuntime is already started",
      );
    }

    this.acceptNewInvestigations = options.acceptNewInvestigations ?? true;

    // 3. Traceability early register (non-blocking; never gates subsequent steps)
    if (options.enableTraceability !== false) {
      this.traceabilityPackage = createTraceabilityPackage();
      this.traceabilityEngine = this.traceabilityPackage.initialize();
    }

    const browser = options.browser ?? createMemoryBrowserPorts();
    const dom = options.dom ?? createMemoryDomPorts();

    // 5. Observation
    this.observationPackage = createObservationPackage();
    this.observationCoordinator = this.observationPackage.initialize({
      browser,
      dom,
    });

    // 6. Evidence — resolve Affordance from Observation (cached observe; ADR-005)
    this.evidencePackage = createEvidencePackage();
    this.evidenceCoordinator = this.evidencePackage.initialize({
      resolveAffordance: (context) => this.observationCoordinator?.observe(context),
      ...(options.factSource !== undefined ? { factSource: options.factSource } : {}),
    });

    // 7. Detection — immutable Evidence snapshot only
    this.detectionPackage = createDetectionPackage();
    this.detectionEngine = this.detectionPackage.initialize({
      resolveEvidence: (context) =>
        this.evidenceCoordinator?.getSnapshot(context.investigationId),
    });

    // 8. Reporting — Detection outputs + optional Configuration adjunct
    this.reportingPackage = createReportingPackage();
    this.reportingEngine = this.reportingPackage.initialize({
      resolveDetectionOutputs: async (context) => {
        const output = this.detectionEngine?.getOutput(context.investigationId);
        if (output === undefined) {
          return undefined;
        }

        const productConfiguration = await this.resolveOptionalConfiguration(
          context,
          output,
        );

        return Object.freeze({
          detection: Object.freeze({
            storeInformation: output.storeInformation,
            detectionResultSet: output.results,
            unknownQualifications: output.unknownQualifications,
            explanations: output.explanations,
          }),
          ...(productConfiguration !== undefined ? { productConfiguration } : {}),
        });
      },
    });

    // 9. Presentation — Report projection only
    this.presentationPackage = createPresentationPackage();
    this.presentationEngine = this.presentationPackage.initialize({
      resolveReport: (context) =>
        this.reportingEngine?.getReport(context.investigationId),
    });

    // 10. Configuration (if elected) — failure must not fail core startup
    const election = options.configurationElection ?? "deferred";
    try {
      this.configurationPackage = createConfigurationPackage();
      this.configurationEngine = this.configurationPackage.initialize({
        election,
        ...(options.configurationRetriever !== undefined
          ? { retriever: options.configurationRetriever }
          : {}),
      });
    } catch {
      this.configurationPackage = undefined;
      this.configurationEngine = undefined;
    }

    // 11–12. Wire ports into InvestigationCoordinator
    const ports = this.buildCollaboratorPorts();
    this.investigationPackage = createInvestigationPackage();
    this.investigationCoordinator = this.investigationPackage.initialize(ports);

    // 14. Runtime ready — core path runnable without Configuration
    this.status = "ready";
  }

  /**
   * One Investigation episode through wired ports (S-001–S-009).
   */
  async runInvestigation(
    storefrontTarget: string,
    intent: OperatorIntent = { kind: "OperatorIntent" },
  ): Promise<IntegratedInvestigationResult> {
    this.assertReady();
    if (!this.acceptNewInvestigations) {
      throwIntegrationError(
        IntegrationErrorCode.RuntimeNotReady,
        "SystemRuntime is not accepting new Investigations",
      );
    }

    const coordinator = this.requireCoordinator();
    const started = coordinator.start(intent, storefrontTarget);
    const run = await coordinator.run(started);
    const completed = coordinator.complete(run.context, run.readiness);

    const evidence = this.evidenceCoordinator?.getSnapshot(completed.investigationId);
    const detection = this.detectionEngine?.getOutput(completed.investigationId);
    const report = this.reportingEngine?.getReport(completed.investigationId);
    const view = this.presentationEngine?.getView(completed.investigationId);
    const configuration = this.configurationEngine?.getSnapshot(
      completed.investigationId,
    );

    const popupShell = view !== undefined ? bindPopupShell(view) : undefined;

    const traceExport = recordInvestigationTrace(this.traceabilityEngine, {
      context: completed,
      ...(evidence !== undefined ? { evidence } : {}),
      ...(detection !== undefined ? { detection } : {}),
      ...(report !== undefined ? { report } : {}),
      ...(view !== undefined ? { view } : {}),
      ...(configuration !== undefined ? { configuration } : {}),
    });

    return Object.freeze({
      kind: "IntegratedInvestigationResult",
      context: completed,
      run,
      stageResults: run.stageResults,
      ...(evidence !== undefined ? { evidence } : {}),
      ...(detection !== undefined ? { detection } : {}),
      ...(report !== undefined ? { report } : {}),
      ...(view !== undefined ? { view } : {}),
      ...(configuration !== undefined ? { configuration } : {}),
      ...(traceExport !== undefined ? { traceExport } : {}),
      ...(popupShell !== undefined ? { popupShell } : {}),
    });
  }

  /**
   * Shutdown sequence §7 — reverse dependency order; no Storefront mutation.
   */
  shutdown(): void {
    if (this.status === "uninitialized") {
      this.status = "shutdown";
      return;
    }
    if (this.status === "shutdown") {
      return;
    }

    this.acceptNewInvestigations = false;

    this.presentationPackage?.shutdown();
    this.reportingPackage?.shutdown();
    this.detectionPackage?.shutdown();
    this.evidencePackage?.shutdown();
    this.observationPackage?.shutdown();
    this.configurationPackage?.shutdown();
    this.investigationPackage?.shutdown();
    this.traceabilityPackage?.shutdown();

    this.presentationEngine = undefined;
    this.reportingEngine = undefined;
    this.detectionEngine = undefined;
    this.evidenceCoordinator = undefined;
    this.observationCoordinator = undefined;
    this.configurationEngine = undefined;
    this.investigationCoordinator = undefined;
    this.traceabilityEngine = undefined;

    this.presentationPackage = undefined;
    this.reportingPackage = undefined;
    this.detectionPackage = undefined;
    this.evidencePackage = undefined;
    this.observationPackage = undefined;
    this.configurationPackage = undefined;
    this.investigationPackage = undefined;
    this.traceabilityPackage = undefined;

    this.status = "shutdown";
  }

  getInvestigationCoordinator(): InvestigationCoordinator {
    this.assertReady();
    return this.requireCoordinator();
  }

  getConfigurationEngine(): ConfigurationEngine | undefined {
    return this.configurationEngine;
  }

  getTraceabilityEngine(): TraceabilityEngine | undefined {
    return this.traceabilityEngine;
  }

  private buildCollaboratorPorts(): CollaboratorPorts {
    const observation = this.observationPackage?.getObservationPort();
    const evidence = this.evidencePackage?.getEvidencePort();
    const detection = this.detectionPackage?.getDetectionPort();
    const reporting = this.reportingPackage?.getReportingPort();
    const presentation = this.presentationPackage?.getPresentationPort();

    if (
      observation === undefined ||
      evidence === undefined ||
      detection === undefined ||
      reporting === undefined ||
      presentation === undefined
    ) {
      throwIntegrationError(
        IntegrationErrorCode.WiringMisbind,
        "Collaborator ports are not fully wired; fix composition startup",
      );
    }

    return Object.freeze({
      observation,
      evidence,
      detection,
      reporting,
      presentation,
    });
  }

  private async resolveOptionalConfiguration(
    context: InvestigationContext,
    output: DetectionEvaluationOutput,
  ) {
    if (this.configurationEngine === undefined) {
      return undefined;
    }

    try {
      const hints = extractDetectedProductHints(output);
      await this.configurationEngine.tryLoad(context, hints);
      return this.configurationEngine.asReportingAdjunct(context.investigationId);
    } catch {
      // Configuration failure → local Unavailable; core continues (FR-026).
      return undefined;
    }
  }

  private assertReady(): void {
    if (this.status !== "ready") {
      throwIntegrationError(
        IntegrationErrorCode.RuntimeNotReady,
        `SystemRuntime is not ready (status=${this.status})`,
      );
    }
  }

  private requireCoordinator(): InvestigationCoordinator {
    if (this.investigationCoordinator === undefined) {
      throwIntegrationError(
        IntegrationErrorCode.WiringMisbind,
        "InvestigationCoordinator is not wired",
      );
    }
    return this.investigationCoordinator;
  }
}

function extractDetectedProductHints(
  output: DetectionEvaluationOutput,
): readonly DetectedProductHint[] {
  const hints: DetectedProductHint[] = [];
  for (const result of output.results.results) {
    if (
      result.outcome === DetectionOutcome.Detected &&
      result.subject.kind === "FlexyPeProduct"
    ) {
      hints.push(createDetectedProductHint(result.subject.productId));
    }
  }
  return Object.freeze(hints);
}

export function createSystemRuntime(): SystemRuntime {
  return new SystemRuntime();
}
