import { TraceabilityEngine } from "./engine.js";
import {
  TraceabilityEngineErrorCode,
  throwTraceabilityError,
} from "./engine-errors.js";

export type TraceabilityPackageStatus = "uninitialized" | "ready" | "shutdown";

/**
 * P-008 package initialization / shutdown (E-010).
 * Safe even if no diagnostics ran; never required by core engines.
 */
export class TraceabilityPackage {
  private status: TraceabilityPackageStatus = "uninitialized";
  private engine: TraceabilityEngine | undefined;

  initialize(): TraceabilityEngine {
    if (this.status === "shutdown") {
      throwTraceabilityError(
        TraceabilityEngineErrorCode.PackageAlreadyShutdown,
        "Traceability package was shut down and cannot be re-initialized in this instance",
      );
    }

    this.engine = new TraceabilityEngine();
    this.status = "ready";
    return this.engine;
  }

  getEngine(): TraceabilityEngine {
    if (this.status !== "ready" || this.engine === undefined) {
      throwTraceabilityError(
        TraceabilityEngineErrorCode.PackageNotInitialized,
        "Traceability package is not initialized",
      );
    }
    return this.engine;
  }

  getStatus(): TraceabilityPackageStatus {
    return this.status;
  }

  shutdown(): void {
    this.engine = undefined;
    this.status = "shutdown";
  }
}

export function createTraceabilityPackage(): TraceabilityPackage {
  return new TraceabilityPackage();
}
