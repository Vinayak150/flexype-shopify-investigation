/// <reference lib="dom" />

/**
 * Storefront content script — observation bridge only.
 * Exposes page context and capability signals to the extension runtime.
 * Must not detect FlexyPe products, create Evidence, or assemble Reports.
 */

const STOREFRONT_PROBE_MESSAGE = "FLEXYPE_STOREFRONT_PROBE" as const;

interface StorefrontObservationProbe {
  readonly kind: "StorefrontObservationProbe";
  readonly url: string;
  readonly documentReachable: boolean;
  readonly metadataReachable: boolean;
  readonly canTraverse: boolean;
  readonly canQuery: boolean;
}

interface StorefrontProbeRequest {
  readonly kind: typeof STOREFRONT_PROBE_MESSAGE;
}

function buildObservationProbe(): StorefrontObservationProbe {
  const hasDocument = typeof document !== "undefined";
  const documentReachable =
    hasDocument &&
    (document.readyState === "complete" || document.readyState === "interactive");
  const canTraverse = hasDocument && document.body !== null;
  const canQuery = hasDocument && typeof document.querySelector === "function";
  const metadataReachable =
    hasDocument && document.querySelector("meta, title, link[rel='canonical']") !== null;

  return Object.freeze({
    kind: "StorefrontObservationProbe",
    url: window.location.href,
    documentReachable,
    metadataReachable,
    canTraverse,
    canQuery,
  });
}

chrome.runtime.onMessage.addListener(
  (message: unknown, _sender, sendResponse: (response?: unknown) => void) => {
    if (
      message === null ||
      typeof message !== "object" ||
      (message as StorefrontProbeRequest).kind !== STOREFRONT_PROBE_MESSAGE
    ) {
      return false;
    }

    sendResponse(buildObservationProbe());
    return true;
  },
);
