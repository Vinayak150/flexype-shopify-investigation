import type { InvestigationId } from "../investigation/index.js";
import {
  ConfigurationEngineErrorCode,
  throwConfigurationError,
} from "./engine-errors.js";
import { assertClosedProductHint } from "./hints.js";
import type { ConfigurationMetadata } from "./metadata.js";
import {
  createProductConfiguration,
  ProductConfigurationState,
} from "./product-configuration.js";
import type { RawConfigurationMaterial } from "./retriever.js";
import {
  createConfigurationSnapshot,
  type ConfigurationSnapshot,
} from "./snapshot.js";

/**
 * Deterministically normalize retrieved material into ConfigurationSnapshot.
 * Must not invent Detection outcomes or Evidence facts.
 */
export class ConfigurationNormalizer {
  normalize(input: {
    readonly investigationId: InvestigationId;
    readonly materials: readonly RawConfigurationMaterial[];
    readonly metadata: ConfigurationMetadata;
  }): ConfigurationSnapshot {
    const sorted = [...input.materials].sort((a, b) =>
      a.productId.localeCompare(b.productId),
    );

    const items = sorted.map((material) => {
      assertClosedProductHint(material.productId);
      if (material.readableContent.trim().length === 0) {
        throwConfigurationError(
          ConfigurationEngineErrorCode.InvalidConfigurationMaterial,
          `Available Configuration for ${material.productId} requires non-empty readable content`,
        );
      }
      return createProductConfiguration({
        investigationId: input.investigationId,
        productId: material.productId,
        state: ProductConfigurationState.Available,
        readableContent: material.readableContent.trim(),
      });
    });

    return createConfigurationSnapshot({
      investigationId: input.investigationId,
      state:
        items.length > 0
          ? ProductConfigurationState.Available
          : ProductConfigurationState.Unavailable,
      items,
      metadata: input.metadata,
    });
  }
}
