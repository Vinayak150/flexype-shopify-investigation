import type { ConfigurationSnapshot } from "./snapshot.js";
import {
  ConfigurationEngineErrorCode,
  throwConfigurationError,
} from "./engine-errors.js";
import { ProductConfigurationState } from "./product-configuration.js";
import { isFlexyPeProductId } from "../detection/index.js";

/**
 * Structural validation of Configuration snapshots (adjunct only).
 */
export function validateConfigurationSnapshot(snapshot: ConfigurationSnapshot): void {
  if (snapshot.kind !== "ConfigurationSnapshot") {
    throwConfigurationError(
      ConfigurationEngineErrorCode.InvalidConfigurationMaterial,
      "Invalid ConfigurationSnapshot kind",
    );
  }

  for (const item of snapshot.items) {
    if (!isFlexyPeProductId(item.productId)) {
      throwConfigurationError(
        ConfigurationEngineErrorCode.InvalidProductHint,
        `Invalid product id in ConfigurationSnapshot: ${String(item.productId)}`,
      );
    }
    if (
      item.state === ProductConfigurationState.Available &&
      (item.readableContent === undefined || item.readableContent.trim().length === 0)
    ) {
      throwConfigurationError(
        ConfigurationEngineErrorCode.InvalidConfigurationMaterial,
        "Available ProductConfiguration requires readableContent",
      );
    }
  }

  if (!Object.isFrozen(snapshot) || !Object.isFrozen(snapshot.items)) {
    throwConfigurationError(
      ConfigurationEngineErrorCode.InvalidConfigurationMaterial,
      "ConfigurationSnapshot must be immutable",
    );
  }
}

/**
 * Explicit isolation guards — Configuration must never become Evidence/Detection.
 */
export function rejectEvidenceContamination(): never {
  throwConfigurationError(
    ConfigurationEngineErrorCode.EvidenceContaminationForbidden,
    "Configuration must never source or contaminate Evidence",
  );
}

export function rejectDetectionInfluence(): never {
  throwConfigurationError(
    ConfigurationEngineErrorCode.DetectionInfluenceForbidden,
    "Configuration must never influence Detection evaluation outcomes",
  );
}
