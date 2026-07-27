import { InvestigationCoordinator } from "./coordinator.js";
import { InvestigationEngineErrorCode, throwEngineError } from "./engine-errors.js";
import { InvestigationLifecycle } from "./lifecycle.js";
import type { CollaboratorPorts } from "./ports.js";

export type InvestigationPackageStatus = "uninitialized" | "ready" | "shutdown";

/**
 * P-001 package initialization / shutdown (E-003).
 * No Configuration dependency for core success.
 */
export class InvestigationPackage {
  private status: InvestigationPackageStatus = "uninitialized";
  private coordinator: InvestigationCoordinator | undefined;
  private readonly lifecycle = new InvestigationLifecycle();

  initialize(ports: CollaboratorPorts): InvestigationCoordinator {
    if (this.status === "shutdown") {
      throwEngineError(
        InvestigationEngineErrorCode.PackageAlreadyShutdown,
        "Investigation package was shut down and cannot be re-initialized in this instance",
      );
    }
    this.coordinator = new InvestigationCoordinator(ports, this.lifecycle);
    this.status = "ready";
    return this.coordinator;
  }

  getCoordinator(): InvestigationCoordinator {
    if (this.status !== "ready" || this.coordinator === undefined) {
      throwEngineError(
        InvestigationEngineErrorCode.PackageNotInitialized,
        "Investigation package is not initialized",
      );
    }
    return this.coordinator;
  }

  getStatus(): InvestigationPackageStatus {
    return this.status;
  }

  /**
   * Release in-memory episode resources. Does not mutate Storefront or persist invented state.
   */
  shutdown(): void {
    this.coordinator = undefined;
    this.status = "shutdown";
  }
}

export function createInvestigationPackage(): InvestigationPackage {
  return new InvestigationPackage();
}
