import type { ReportingPort } from "../investigation/index.js";
import { ReportingEngine } from "./engine.js";
import { ReportingEngineErrorCode, throwReportingError } from "./engine-errors.js";
import {
  createReportingPort,
  type DetectionOutputsResolver,
} from "./reporting-port.js";

export type ReportingPackageStatus = "uninitialized" | "ready" | "shutdown";

export interface ReportingPackageDependencies {
  readonly resolveDetectionOutputs: DetectionOutputsResolver;
}

/**
 * P-005 package initialization / shutdown (E-007).
 * No Evidence/Detection-eval/browser/Configuration-fetch dependencies.
 */
export class ReportingPackage {
  private status: ReportingPackageStatus = "uninitialized";
  private engine: ReportingEngine | undefined;
  private reportingPort: ReportingPort | undefined;

  initialize(dependencies: ReportingPackageDependencies): ReportingEngine {
    if (this.status === "shutdown") {
      throwReportingError(
        ReportingEngineErrorCode.PackageAlreadyShutdown,
        "Reporting package was shut down and cannot be re-initialized in this instance",
      );
    }

    this.engine = new ReportingEngine();
    this.reportingPort = createReportingPort(
      this.engine,
      dependencies.resolveDetectionOutputs,
    );
    this.status = "ready";
    return this.engine;
  }

  getEngine(): ReportingEngine {
    if (this.status !== "ready" || this.engine === undefined) {
      throwReportingError(
        ReportingEngineErrorCode.PackageNotInitialized,
        "Reporting package is not initialized",
      );
    }
    return this.engine;
  }

  getReportingPort(): ReportingPort {
    if (this.status !== "ready" || this.reportingPort === undefined) {
      throwReportingError(
        ReportingEngineErrorCode.PackageNotInitialized,
        "Reporting package is not initialized",
      );
    }
    return this.reportingPort;
  }

  getStatus(): ReportingPackageStatus {
    return this.status;
  }

  shutdown(): void {
    this.engine = undefined;
    this.reportingPort = undefined;
    this.status = "shutdown";
  }
}

export function createReportingPackage(): ReportingPackage {
  return new ReportingPackage();
}
