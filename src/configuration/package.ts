import { ConfigurationEngine } from "./engine.js";
import {
  ConfigurationEngineErrorCode,
  throwConfigurationError,
} from "./engine-errors.js";
import type { ConfigurationRetriever } from "./retriever.js";
import type { ConfigurationElection } from "./session.js";

export type ConfigurationPackageStatus = "uninitialized" | "ready" | "shutdown";

export interface ConfigurationPackageDependencies {
  readonly election?: ConfigurationElection;
  readonly retriever?: ConfigurationRetriever;
}

/**
 * P-007 package initialization / shutdown (E-009).
 * Safe when deferred; never required by core engines.
 */
export class ConfigurationPackage {
  private status: ConfigurationPackageStatus = "uninitialized";
  private engine: ConfigurationEngine | undefined;

  initialize(dependencies: ConfigurationPackageDependencies = {}): ConfigurationEngine {
    if (this.status === "shutdown") {
      throwConfigurationError(
        ConfigurationEngineErrorCode.PackageAlreadyShutdown,
        "Configuration package was shut down and cannot be re-initialized in this instance",
      );
    }

    this.engine = new ConfigurationEngine({
      election: dependencies.election ?? "deferred",
      ...(dependencies.retriever !== undefined
        ? { retriever: dependencies.retriever }
        : {}),
    });
    this.status = "ready";
    return this.engine;
  }

  getEngine(): ConfigurationEngine {
    if (this.status !== "ready" || this.engine === undefined) {
      throwConfigurationError(
        ConfigurationEngineErrorCode.PackageNotInitialized,
        "Configuration package is not initialized",
      );
    }
    return this.engine;
  }

  getStatus(): ConfigurationPackageStatus {
    return this.status;
  }

  shutdown(): void {
    this.engine = undefined;
    this.status = "shutdown";
  }
}

export function createConfigurationPackage(): ConfigurationPackage {
  return new ConfigurationPackage();
}
