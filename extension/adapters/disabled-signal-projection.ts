/**
 * Resolves human-readable disabled-integration reasons for popup presentation.
 */
import {
  FlexyPeProductId,
  type FlexyPeProductId as FlexyPeProductIdType,
} from "../../src/detection/catalogs.js";
import { inferDisabledProductFromText } from "./disabled-integration-facts.js";
import type {
  StorefrontDisabledElementIndicator,
  StorefrontDisabledSignals,
} from "./storefront-observation.js";

function disabledElementText(indicator: StorefrontDisabledElementIndicator): string {
  const parts = [
    indicator.tag,
    indicator.id,
    ...(indicator.classes ?? []),
    ...(indicator.dataAttributes ?? []),
  ].filter((part): part is string => part !== undefined && part.length > 0);
  return parts.join(" ");
}

function reasonForHiddenProduct(productId: FlexyPeProductIdType): string {
  switch (productId) {
    case FlexyPeProductId.FlexyPass:
      return "Hidden FlexyPass container detected";
    case FlexyPeProductId.FlexyCart:
      return "Hidden FlexyCart container detected";
    case FlexyPeProductId.Checkout:
      return "Hidden FlexyPe Checkout container detected";
    default: {
      const _exhaustive: never = productId;
      return _exhaustive;
    }
  }
}

function reasonForDisabledProduct(productId: FlexyPeProductIdType): string {
  switch (productId) {
    case FlexyPeProductId.FlexyCart:
      return "FlexyCart integration disabled attribute detected";
    case FlexyPeProductId.FlexyPass:
      return "FlexyPass integration disabled attribute detected";
    case FlexyPeProductId.Checkout:
      return "FlexyPe Checkout integration disabled attribute detected";
    default: {
      const _exhaustive: never = productId;
      return _exhaustive;
    }
  }
}

export function resolveDisabledIntegrationReason(
  productId: FlexyPeProductIdType,
  disabledSignals: StorefrontDisabledSignals | undefined,
): string | undefined {
  if (disabledSignals === undefined) {
    return undefined;
  }

  for (const comment of disabledSignals.htmlComments) {
    if (inferDisabledProductFromText(comment) === productId) {
      return "FlexyPe Checkout reference found in commented script";
    }
  }

  for (const scriptRef of disabledSignals.commentedScripts) {
    if (inferDisabledProductFromText(scriptRef) === productId) {
      return "FlexyPe Checkout reference found in commented script";
    }
  }

  for (const indicator of disabledSignals.hiddenFlexyElements) {
    if (inferDisabledProductFromText(disabledElementText(indicator)) === productId) {
      return reasonForHiddenProduct(productId);
    }
  }

  for (const indicator of disabledSignals.disabledFlexyElements) {
    if (inferDisabledProductFromText(disabledElementText(indicator)) === productId) {
      return reasonForDisabledProduct(productId);
    }
  }

  return undefined;
}
