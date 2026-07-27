import type { DetectionPort } from "../investigation/index.js";
import {
  createDetectionPort,
  type NormalizedEvidenceResolver,
} from "./detection-port.js";
import {
  createDefaultDefinitionRegistry,
  type DetectionDefinitionRegistry,
} from "./definitions.js";
import { DetectionEngine } from "./engine.js";
import { DetectionEngineErrorCode, throwDetectionError } from "./engine-errors.js";

export type DetectionPackageStatus = "uninitialized" | "ready" | "shutdown";

export interface DetectionPackageDependencies {
  readonly resolveEvidence: NormalizedEvidenceResolver;
  readonly registry?: DetectionDefinitionRegistry;
}

/**
 * P-004 package initialization / shutdown (E-006).
 * No Configuration or browser ports required for core evaluation.
 */
export class DetectionPackage {
  private status: DetectionPackageStatus = "uninitialized";
  private engine: DetectionEngine | undefined;
  private detectionPort: DetectionPort | undefined;

  initialize(dependencies: DetectionPackageDependencies): DetectionEngine {
    if (this.status === "shutdown") {
      throwDetectionError(
        DetectionEngineErrorCode.PackageAlreadyShutdown,
        "Detection package was shut down and cannot be re-initialized in this instance",
      );
    }

    this.engine = new DetectionEngine(
      dependencies.registry ?? createDefaultDefinitionRegistry(),
    );
    this.detectionPort = createDetectionPort(this.engine, dependencies.resolveEvidence);
    this.status = "ready";
    return this.engine;
  }

  getEngine(): DetectionEngine {
    if (this.status !== "ready" || this.engine === undefined) {
      throwDetectionError(
        DetectionEngineErrorCode.PackageNotInitialized,
        "Detection package is not initialized",
      );
    }
    return this.engine;
  }

  getDetectionPort(): DetectionPort {
    if (this.status !== "ready" || this.detectionPort === undefined) {
      throwDetectionError(
        DetectionEngineErrorCode.PackageNotInitialized,
        "Detection package is not initialized",
      );
    }
    return this.detectionPort;
  }

  getStatus(): DetectionPackageStatus {
    return this.status;
  }

  shutdown(): void {
    this.engine = undefined;
    this.detectionPort = undefined;
    this.status = "shutdown";
  }
}

export function createDetectionPackage(): DetectionPackage {
  return new DetectionPackage();
}
