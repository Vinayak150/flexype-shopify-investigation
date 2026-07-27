import type { InvestigationContext, InvestigationId } from "../investigation/index.js";
import type { DetectedProductHint } from "./hints.js";
import { createConfigurationMetadata } from "./metadata.js";
import type { ConfigurationRetriever } from "./retriever.js";
import {
  ConfigurationSession,
  type ConfigurationElection,
} from "./session.js";
import {
  createUnavailableSnapshot,
  toReportingAdjunct,
  type ConfigurationSnapshot,
} from "./snapshot.js";
import type { ProductConfiguration } from "./product-configuration.js";

export type ConfigurationLoadResult = ConfigurationSnapshot;

/**
 * Optional Configuration Engine entry point (E-009).
 * Enriches Reporting optionally; never enables/disables core Investigation.
 */
export class ConfigurationEngine {
  private readonly election: ConfigurationElection;
  private readonly retriever: ConfigurationRetriever | undefined;
  private readonly snapshots = new Map<InvestigationId, ConfigurationSnapshot>();

  constructor(options?: {
    readonly election?: ConfigurationElection;
    readonly retriever?: ConfigurationRetriever;
  }) {
    this.election = options?.election ?? "deferred";
    this.retriever = options?.retriever;
  }

  getElection(): ConfigurationElection {
    return this.election;
  }

  /**
   * Non-blocking load. Deferred → NotInScope; failures → Unavailable.
   * Never throws into the core Investigation path.
   */
  async tryLoad(
    context: InvestigationContext,
    detectedProductHints: readonly DetectedProductHint[],
  ): Promise<ConfigurationLoadResult> {
    const existing = this.snapshots.get(context.investigationId);
    if (existing !== undefined) {
      return existing;
    }

    try {
      const session = new ConfigurationSession({
        context,
        detectedProductHints,
        election: this.election,
        ...(this.retriever !== undefined ? { retriever: this.retriever } : {}),
      });
      session.open();
      await session.load();
      const snapshot = session.seal();
      this.snapshots.set(context.investigationId, snapshot);
      return snapshot;
    } catch (error) {
      const snapshot = createUnavailableSnapshot(
        context.investigationId,
        createConfigurationMetadata({
          sourceKind: "ExternalOptional",
          note:
            error instanceof Error
              ? error.message
              : "Configuration load failed without escalating to core path",
        }),
        detectedProductHints.map((hint) => hint.productId),
      );
      this.snapshots.set(context.investigationId, snapshot);
      return snapshot;
    }
  }

  getSnapshot(
    investigationId: InvestigationId,
  ): ConfigurationSnapshot | undefined {
    return this.snapshots.get(investigationId);
  }

  /**
   * Optional adjunct for Reporting attach — undefined when not Available.
   */
  asReportingAdjunct(
    investigationId: InvestigationId,
  ): readonly ProductConfiguration[] | undefined {
    const snapshot = this.snapshots.get(investigationId);
    if (snapshot === undefined) {
      return undefined;
    }
    return toReportingAdjunct(snapshot);
  }
}
