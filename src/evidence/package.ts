import type { EvidencePort } from "../investigation/index.js";
import type { FactSourcePort } from "./collector.js";
import { EvidenceCoordinator } from "./coordinator.js";
import {
  createEvidencePort,
  type ObservationAffordanceResolver,
} from "./evidence-port.js";
import { EvidenceEngineErrorCode, throwEvidenceError } from "./engine-errors.js";

export type EvidencePackageStatus = "uninitialized" | "ready" | "shutdown";

export interface EvidencePackageDependencies {
  readonly resolveAffordance: ObservationAffordanceResolver;
  readonly factSource?: FactSourcePort;
}

/**
 * P-003 package initialization / shutdown (E-005).
 * No Configuration dependency or Configuration-as-Evidence source.
 */
export class EvidencePackage {
  private status: EvidencePackageStatus = "uninitialized";
  private coordinator: EvidenceCoordinator | undefined;
  private evidencePort: EvidencePort | undefined;

  initialize(dependencies: EvidencePackageDependencies): EvidenceCoordinator {
    if (this.status === "shutdown") {
      throwEvidenceError(
        EvidenceEngineErrorCode.PackageAlreadyShutdown,
        "Evidence package was shut down and cannot be re-initialized in this instance",
      );
    }

    this.coordinator = new EvidenceCoordinator({
      ...(dependencies.factSource !== undefined
        ? { factSource: dependencies.factSource }
        : {}),
    });
    this.evidencePort = createEvidencePort(
      this.coordinator,
      dependencies.resolveAffordance,
    );
    this.status = "ready";
    return this.coordinator;
  }

  getCoordinator(): EvidenceCoordinator {
    if (this.status !== "ready" || this.coordinator === undefined) {
      throwEvidenceError(
        EvidenceEngineErrorCode.PackageNotInitialized,
        "Evidence package is not initialized",
      );
    }
    return this.coordinator;
  }

  getEvidencePort(): EvidencePort {
    if (this.status !== "ready" || this.evidencePort === undefined) {
      throwEvidenceError(
        EvidenceEngineErrorCode.PackageNotInitialized,
        "Evidence package is not initialized",
      );
    }
    return this.evidencePort;
  }

  getStatus(): EvidencePackageStatus {
    return this.status;
  }

  shutdown(): void {
    this.coordinator = undefined;
    this.evidencePort = undefined;
    this.status = "shutdown";
  }
}

export function createEvidencePackage(): EvidencePackage {
  return new EvidencePackage();
}
