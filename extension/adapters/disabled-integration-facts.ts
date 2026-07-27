/**
 * Maps storefront disabled-integration observations to Evidence facts.
 * Emits disabled markers only — never presence / active-detection markers.
 */
import {
  FlexyPeProductId,
  type FlexyPeProductId as FlexyPeProductIdType,
} from "../../src/detection/catalogs.js";
import type { CollectableFact } from "../../src/evidence/collector.js";
import { EvidenceSignalClass } from "../../src/evidence/signal-class.js";
import type {
  StorefrontDisabledElementIndicator,
  StorefrontDisabledSignals,
} from "./storefront-observation.js";

const DISABLED_MARKERS = Object.freeze({
  Checkout: Object.freeze([
    `flexype.disabled.${FlexyPeProductId.Checkout}`,
    `flexype.integration.disabled.${FlexyPeProductId.Checkout}`,
  ]),
  FlexyPass: Object.freeze([
    `flexype.disabled.${FlexyPeProductId.FlexyPass}`,
    `flexype.integration.disabled.${FlexyPeProductId.FlexyPass}`,
  ]),
  FlexyCart: Object.freeze([
    `flexype.disabled.${FlexyPeProductId.FlexyCart}`,
    `flexype.integration.disabled.${FlexyPeProductId.FlexyCart}`,
  ]),
});

const FLEXYPE_SDK_URL_PATTERNS = Object.freeze([
  /flexype\.in/i,
  /flexype-v2/i,
  /static\.flexype/i,
  /flexype\.net/i,
]);

const PASS_HINTS = [/flexypass/i, /flexy-pass/i];
const CART_HINTS = [/flexycart/i, /flexy-cart/i, /flexcart/i];
const FLEXYPE_HINT = /flexype/i;

function appendMarkers(summary: string, markers: readonly string[]): string {
  if (markers.length === 0) {
    return summary;
  }
  return `${summary}; ${markers.join(" ")}`;
}

function isFlexyPeSdkAssetUrl(text: string): boolean {
  return FLEXYPE_SDK_URL_PATTERNS.some((pattern) => pattern.test(text));
}

function hasFlexyPassBranding(text: string): boolean {
  if (PASS_HINTS.some((pattern) => pattern.test(text))) {
    return true;
  }
  if (/data-flexy-pass/i.test(text)) {
    return true;
  }
  return /pass\.min\.js/i.test(text) && /flexypass|flexy-pass/i.test(text);
}

function hasFlexyCartBranding(text: string): boolean {
  if (CART_HINTS.some((pattern) => pattern.test(text))) {
    return true;
  }
  return /data-flexy-type(?:=|:|\s|"|')(?:cart|flexycart)/i.test(text);
}

function hasFlexyCheckoutBranding(text: string): boolean {
  if (/flexy-btn/i.test(text)) {
    return true;
  }
  if (/data-flexy-type(?:=|:|\s|"|')checkout/i.test(text)) {
    return true;
  }
  if (/flexy[\s_-]*checkout/i.test(text)) {
    return true;
  }
  return false;
}

export function inferDisabledProductFromText(text: string): FlexyPeProductIdType | undefined {
  if (/data-flexy-type(?:=|:|\s|"|')(?:"|')?(?:cart|flexycart)/i.test(text)) {
    return FlexyPeProductId.FlexyCart;
  }
  if (/data-flexy-type(?:=|:|\s|"|')(?:"|')?checkout/i.test(text)) {
    return FlexyPeProductId.Checkout;
  }
  if (hasFlexyPassBranding(text)) {
    return FlexyPeProductId.FlexyPass;
  }
  if (hasFlexyCartBranding(text)) {
    return FlexyPeProductId.FlexyCart;
  }
  if (isFlexyPeSdkAssetUrl(text) || hasFlexyCheckoutBranding(text) || FLEXYPE_HINT.test(text)) {
    return FlexyPeProductId.Checkout;
  }
  return undefined;
}

function disabledElementText(indicator: StorefrontDisabledElementIndicator): string {
  const parts = [
    indicator.tag,
    indicator.id,
    ...(indicator.classes ?? []),
    ...(indicator.dataAttributes ?? []),
  ].filter((part): part is string => part !== undefined && part.length > 0);
  return parts.join(" ");
}

function disabledMarkersForProduct(
  productId: FlexyPeProductIdType,
): readonly string[] {
  switch (productId) {
    case FlexyPeProductId.Checkout:
      return DISABLED_MARKERS.Checkout;
    case FlexyPeProductId.FlexyPass:
      return DISABLED_MARKERS.FlexyPass;
    case FlexyPeProductId.FlexyCart:
      return DISABLED_MARKERS.FlexyCart;
    default: {
      const _exhaustive: never = productId;
      return _exhaustive;
    }
  }
}

function checkoutDisabledSummaries(text: string): readonly string[] {
  if (/<!--|<script/i.test(text)) {
    return Object.freeze(["FlexyPe Checkout reference found in commented script"]);
  }
  if (/^\s*\/\//.test(text.trim())) {
    return Object.freeze(["FlexyPe Checkout reference found in commented script"]);
  }
  return Object.freeze(["FlexyPe Checkout integration reference found in inactive markup"]);
}

function disabledSummaryForProduct(
  productId: FlexyPeProductIdType,
  context: "comment" | "hidden" | "disabled",
  text: string,
): string {
  switch (productId) {
    case FlexyPeProductId.Checkout:
      return checkoutDisabledSummaries(text)[0] ?? "FlexyPe Checkout integration appears inactive";
    case FlexyPeProductId.FlexyPass:
      return context === "hidden"
        ? "FlexyPass container exists but is hidden"
        : "FlexyPass integration appears inactive";
    case FlexyPeProductId.FlexyCart:
      return context === "disabled"
        ? "FlexyCart integration disabled attribute detected"
        : "FlexyCart integration appears inactive";
    default: {
      const _exhaustive: never = productId;
      return _exhaustive;
    }
  }
}

function pushDisabledCommentFacts(
  facts: CollectableFact[],
  text: string,
  sourceRef: string,
): void {
  const productId = inferDisabledProductFromText(text);
  if (productId === undefined) {
    return;
  }

  const markers = disabledMarkersForProduct(productId);
  const summary = disabledSummaryForProduct(productId, "comment", text);

  facts.push({
    signalClass: EvidenceSignalClass.HtmlStructure,
    observationSummary: appendMarkers(summary, markers),
    sourceRef: `content.disabled.html:${sourceRef}`,
  });

  if (productId === FlexyPeProductId.Checkout) {
    facts.push({
      signalClass: EvidenceSignalClass.ScriptUrls,
      observationSummary: appendMarkers(
        `Commented script URL reference: ${text.slice(0, 240)}`,
        markers,
      ),
      sourceRef: `content.disabled.script:${sourceRef}`,
    });
  } else {
    facts.push({
      signalClass: EvidenceSignalClass.DomElements,
      observationSummary: appendMarkers(summary, markers),
      sourceRef: `content.disabled.dom:${sourceRef}`,
    });
  }
}

function pushDisabledElementFacts(
  facts: CollectableFact[],
  indicator: StorefrontDisabledElementIndicator,
  context: "hidden" | "disabled",
  sourceRef: string,
): void {
  const text = disabledElementText(indicator);
  const productId = inferDisabledProductFromText(text);
  if (productId === undefined) {
    return;
  }

  const markers = disabledMarkersForProduct(productId);
  const summary = disabledSummaryForProduct(productId, context, text);

  facts.push({
    signalClass: EvidenceSignalClass.DomElements,
    observationSummary: appendMarkers(summary, markers),
    sourceRef: `content.disabled.dom:${sourceRef}`,
  });
  facts.push({
    signalClass: EvidenceSignalClass.HtmlStructure,
    observationSummary: appendMarkers(summary, markers),
    sourceRef: `content.disabled.html:${sourceRef}`,
  });
}

export function appendDisabledIntegrationFacts(
  facts: CollectableFact[],
  disabledSignals: StorefrontDisabledSignals,
): void {
  for (const [index, comment] of disabledSignals.htmlComments.entries()) {
    pushDisabledCommentFacts(facts, comment, `comment-${index}`);
  }

  for (const [index, scriptRef] of disabledSignals.commentedScripts.entries()) {
    if (disabledSignals.htmlComments.includes(scriptRef)) {
      continue;
    }
    pushDisabledCommentFacts(facts, scriptRef, `commented-script-${index}`);
  }

  for (const [index, indicator] of disabledSignals.hiddenFlexyElements.entries()) {
    pushDisabledElementFacts(
      facts,
      indicator,
      "hidden",
      `hidden-${indicator.tag}${indicator.id !== undefined ? `#${indicator.id}` : ""}-${index}`,
    );
  }

  for (const [index, indicator] of disabledSignals.disabledFlexyElements.entries()) {
    pushDisabledElementFacts(
      facts,
      indicator,
      "disabled",
      `disabled-${indicator.tag}${indicator.id !== undefined ? `#${indicator.id}` : ""}-${index}`,
    );
  }
}
