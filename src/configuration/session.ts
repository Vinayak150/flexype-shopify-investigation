import {
  InvestigationState,
  type InvestigationContext,
} from "../investigation/index.js";
import {
  ConfigurationEngineErrorCode,
  throwConfigurationError,
} from "./engine-errors.js";
import type { DetectedProductHint } from "./hints.js";
import { createConfigurationMetadata } from "./metadata.js";
import { ConfigurationNormalizer } from "./normalizer.js";
import type { ConfigurationRetriever } from "./retriever.js";
import {
  createNotInScopeSnapshot,
  createUnavailableSnapshot,
  type ConfigurationSnapshot,
} from "./snapshot.js";
import { validateConfigurationSnapshot } from "./validation.js";

export type ConfigurationElection = "deferred" | "pursued";

export type ConfigurationSessionStatus =
  | "closed"
  | "open"
  | "loaded"
  | "sealed";

/**
 * Optional Configuration session: open → retrieve → normalize → freeze.
 * Never participates in Observation/Evidence/Detection/Report assembly ownership.
 */
export class ConfigurationSession {
  private status: ConfigurationSessionStatus = "closed";
  private snapshot: ConfigurationSnapshot | undefined;
  private readonly context: InvestigationContext;
  private readonly hints: readonly DetectedProductHint[];
  private readonly election: ConfigurationElection;
  private readonly retriever: ConfigurationRetriever | undefined;
  private readonly normalizer: ConfigurationNormalizer;

  constructor(input: {
    readonly context: InvestigationContext;
    readonly detectedProductHints: readonly DetectedProductHint[];
    readonly election: ConfigurationElection;
    readonly retriever?: ConfigurationRetriever;
    readonly normalizer?: ConfigurationNormalizer;
  }) {
    if (input.context.state !== InvestigationState.InProgress) {
      // Non-blocking: still allow deferred NotInScope without throwing into core.
      // For pursued mode we require InProgress for honest episode binding.
      if (input.election === "pursued") {
        throwConfigurationError(
          ConfigurationEngineErrorCode.SessionNotOpen,
          `Pursued Configuration requires InProgress Investigation; got ${input.context.state}`,
        );
      }
    }
    this.context = input.context;
    this.hints = Object.freeze([...input.detectedProductHints]);
    this.election = input.election;
    this.retriever = input.retriever;
    this.normalizer = input.normalizer ?? new ConfigurationNormalizer();
  }

  getStatus(): ConfigurationSessionStatus {
    return this.status;
  }

  open(): void {
    if (this.status !== "closed") {
      throwConfigurationError(
        ConfigurationEngineErrorCode.SessionNotOpen,
        `Cannot open ConfigurationSession from status ${this.status}`,
      );
    }
    this.status = "open";
  }

  async load(): Promise<ConfigurationSnapshot> {
    if (this.status !== "open") {
      throwConfigurationError(
        ConfigurationEngineErrorCode.SessionNotOpen,
        `load requires open session; got ${this.status}`,
      );
    }

    if (this.election === "deferred") {
      this.snapshot = createNotInScopeSnapshot(
        this.context.investigationId,
        createConfigurationMetadata({
          sourceKind: "Deferred",
          note: "Configuration bonus deferred; core path unaffected (FR-026)",
        }),
      );
      this.status = "loaded";
      return this.snapshot;
    }

    if (this.retriever === undefined) {
      this.snapshot = createUnavailableSnapshot(
        this.context.investigationId,
        createConfigurationMetadata({
          sourceKind: "ExternalOptional",
          note: "Configuration pursued but retriever not configured (U-006)",
        }),
        this.hints.map((hint) => hint.productId),
      );
      this.status = "loaded";
      return this.snapshot;
    }

    if (this.hints.length === 0) {
      this.snapshot = createUnavailableSnapshot(
        this.context.investigationId,
        createConfigurationMetadata({
          sourceKind: "ExternalOptional",
          note: "No Detected product hints for Configuration retrieval",
        }),
      );
      this.status = "loaded";
      return this.snapshot;
    }

    try {
      const retrieved = await this.retriever.retrieve({
        investigationId: this.context.investigationId,
        detectedProductHints: this.hints,
      });

      if (!retrieved.ok) {
        this.snapshot = createUnavailableSnapshot(
          this.context.investigationId,
          createConfigurationMetadata({
            sourceKind: "ExternalOptional",
            note: retrieved.reason,
          }),
          this.hints.map((hint) => hint.productId),
        );
      } else {
        this.snapshot = this.normalizer.normalize({
          investigationId: this.context.investigationId,
          materials: retrieved.materials,
          metadata: createConfigurationMetadata({
            sourceKind: "MemoryFixture",
            note: "Normalized optional Configuration adjunct",
          }),
        });
      }
    } catch (error) {
      // Graceful Unavailable — never escalate into core Investigation failure.
      this.snapshot = createUnavailableSnapshot(
        this.context.investigationId,
        createConfigurationMetadata({
          sourceKind: "ExternalOptional",
          note:
            error instanceof Error
              ? error.message
              : "Configuration retrieval failed",
        }),
        this.hints.map((hint) => hint.productId),
      );
    }

    validateConfigurationSnapshot(this.snapshot);
    this.status = "loaded";
    return this.snapshot;
  }

  seal(): ConfigurationSnapshot {
    if (this.snapshot === undefined || this.status !== "loaded") {
      throwConfigurationError(
        ConfigurationEngineErrorCode.SessionNotOpen,
        "seal requires load to complete first",
      );
    }
    this.status = "sealed";
    return this.snapshot;
  }
}
