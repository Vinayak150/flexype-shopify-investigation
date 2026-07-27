import type { InvestigationId } from "../investigation/index.js";
import type { FlexyPeProductId } from "../detection/index.js";
import type { DetectedProductHint } from "./hints.js";

/**
 * Raw configuration material from an optional external source (U-006 Open).
 * Transport is delivery detail — not frozen architecture.
 */
export interface RawConfigurationMaterial {
  readonly kind: "RawConfigurationMaterial";
  readonly productId: FlexyPeProductId;
  readonly readableContent: string;
}

export type ConfigurationRetrievalResult =
  | {
      readonly ok: true;
      readonly materials: readonly RawConfigurationMaterial[];
    }
  | {
      readonly ok: false;
      readonly reason: string;
    };

/**
 * ConfigurationRetriever port — optional external source boundary.
 * Failures must map to Unavailable, never to core Investigation failure.
 */
export interface ConfigurationRetriever {
  retrieve(input: {
    readonly investigationId: InvestigationId;
    readonly detectedProductHints: readonly DetectedProductHint[];
  }): Promise<ConfigurationRetrievalResult>;
}

/**
 * In-memory fixture retriever for tests/local tooling — not an API architecture.
 */
export function createMemoryConfigurationRetriever(options?: {
  readonly materialsByProduct?: ReadonlyMap<FlexyPeProductId, string>;
  readonly failWith?: string;
}): ConfigurationRetriever {
  return {
    async retrieve({ detectedProductHints }) {
      if (options?.failWith !== undefined) {
        return Object.freeze({
          ok: false as const,
          reason: options.failWith,
        });
      }

      const materials: RawConfigurationMaterial[] = [];
      for (const hint of detectedProductHints) {
        const content = options?.materialsByProduct?.get(hint.productId);
        if (content !== undefined) {
          materials.push(
            Object.freeze({
              kind: "RawConfigurationMaterial",
              productId: hint.productId,
              readableContent: content,
            }),
          );
        }
      }

      return Object.freeze({
        ok: true as const,
        materials: Object.freeze(materials),
      });
    },
  };
}
