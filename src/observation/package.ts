import type { BrowserDiscoveryPorts } from "./browser.js";
import { ObservationCoordinator } from "./coordinator.js";
import type { DomDiscoveryPorts } from "./dom.js";
import { ObservationEngineErrorCode, throwObservationError } from "./errors.js";
import { createObservationPort } from "./observation-port.js";
import type { ObservationPort } from "../investigation/index.js";

export type ObservationPackageStatus = "uninitialized" | "ready" | "shutdown";

export interface ObservationPackageDependencies {
  readonly browser: BrowserDiscoveryPorts;
  readonly dom: DomDiscoveryPorts;
}

/**
 * P-002 package initialization / shutdown (E-004).
 * No Configuration dependency.
 */
export class ObservationPackage {
  private status: ObservationPackageStatus = "uninitialized";
  private coordinator: ObservationCoordinator | undefined;
  private observationPort: ObservationPort | undefined;

  initialize(dependencies: ObservationPackageDependencies): ObservationCoordinator {
    if (this.status === "shutdown") {
      throwObservationError(
        ObservationEngineErrorCode.PackageAlreadyShutdown,
        "Observation package was shut down and cannot be re-initialized in this instance",
      );
    }

    this.coordinator = new ObservationCoordinator(
      dependencies.browser,
      dependencies.dom,
    );
    this.observationPort = createObservationPort(this.coordinator);
    this.status = "ready";
    return this.coordinator;
  }

  getCoordinator(): ObservationCoordinator {
    if (this.status !== "ready" || this.coordinator === undefined) {
      throwObservationError(
        ObservationEngineErrorCode.PackageNotInitialized,
        "Observation package is not initialized",
      );
    }
    return this.coordinator;
  }

  getObservationPort(): ObservationPort {
    if (this.status !== "ready" || this.observationPort === undefined) {
      throwObservationError(
        ObservationEngineErrorCode.PackageNotInitialized,
        "Observation package is not initialized",
      );
    }
    return this.observationPort;
  }

  getStatus(): ObservationPackageStatus {
    return this.status;
  }

  /**
   * End sessions / release handles. Does not mutate Storefront.
   */
  shutdown(): void {
    this.coordinator = undefined;
    this.observationPort = undefined;
    this.status = "shutdown";
  }
}

export function createObservationPackage(): ObservationPackage {
  return new ObservationPackage();
}
