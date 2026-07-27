import type { PresentationPort } from "../investigation/index.js";
import { PresentationEngine } from "./engine.js";
import {
  PresentationEngineErrorCode,
  throwPresentationError,
} from "./engine-errors.js";
import {
  createPresentationPort,
  type DiagnosticReportResolver,
} from "./presentation-port.js";

export type PresentationPackageStatus = "uninitialized" | "ready" | "shutdown";

export interface PresentationPackageDependencies {
  readonly resolveReport: DiagnosticReportResolver;
}

/**
 * P-006 package initialization / shutdown (E-008).
 * No Evidence/Detection/Report-assembly/Configuration-fetch dependencies.
 */
export class PresentationPackage {
  private status: PresentationPackageStatus = "uninitialized";
  private engine: PresentationEngine | undefined;
  private presentationPort: PresentationPort | undefined;

  initialize(dependencies: PresentationPackageDependencies): PresentationEngine {
    if (this.status === "shutdown") {
      throwPresentationError(
        PresentationEngineErrorCode.PackageAlreadyShutdown,
        "Presentation package was shut down and cannot be re-initialized in this instance",
      );
    }

    this.engine = new PresentationEngine();
    this.presentationPort = createPresentationPort(
      this.engine,
      dependencies.resolveReport,
    );
    this.status = "ready";
    return this.engine;
  }

  getEngine(): PresentationEngine {
    if (this.status !== "ready" || this.engine === undefined) {
      throwPresentationError(
        PresentationEngineErrorCode.PackageNotInitialized,
        "Presentation package is not initialized",
      );
    }
    return this.engine;
  }

  getPresentationPort(): PresentationPort {
    if (this.status !== "ready" || this.presentationPort === undefined) {
      throwPresentationError(
        PresentationEngineErrorCode.PackageNotInitialized,
        "Presentation package is not initialized",
      );
    }
    return this.presentationPort;
  }

  getStatus(): PresentationPackageStatus {
    return this.status;
  }

  shutdown(): void {
    this.engine = undefined;
    this.presentationPort = undefined;
    this.status = "shutdown";
  }
}

export function createPresentationPackage(): PresentationPackage {
  return new PresentationPackage();
}
