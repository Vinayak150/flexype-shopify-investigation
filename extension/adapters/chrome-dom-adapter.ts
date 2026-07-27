/**
 * Chrome DOM adapter — content-script observation boundary only.
 * Translates page capability signals and observation snapshots; does not detect products.
 */

import type { StorefrontTarget } from "../../src/investigation/index.js";
import type { DomDiscoveryPorts } from "../../src/observation/index.js";
import {
  probeStorefrontObservationWithRetry as runProbeWithRetry,
  waitForStorefrontObservationReady as runWaitForReady,
  DEFAULT_OBSERVATION_MAX_ATTEMPTS,
  DEFAULT_OBSERVATION_RETRY_DELAY_MS,
  DEFAULT_READY_MAX_ATTEMPTS,
  DEFAULT_READY_RETRY_DELAY_MS,
  hasMeaningfulStorefrontSignals,
  type ObservationRetryOptions,
  type StorefrontReadyWaitOptions,
} from "./storefront-observation-readiness.js";
import {
  isStorefrontObservationSnapshot,
  isStorefrontReadyResponse,
  STOREFRONT_PROBE_MESSAGE,
  STOREFRONT_READY_MESSAGE,
  type StorefrontObservationSnapshot,
  type StorefrontProbeRequest,
  type StorefrontReadyRequest,
} from "./storefront-observation.js";
import { enrichStorefrontObservationSnapshot } from "./resolve-storefront-metadata.js";
import {
  extractShopifyPageSourcesFromPageContext,
  hasShopifyShop,
  mergeShopifyPageSources,
} from "./shopify-page-context.js";

export {
  STOREFRONT_PROBE_MESSAGE,
  STOREFRONT_READY_MESSAGE,
} from "./storefront-observation.js";
export type { StorefrontObservationSnapshot } from "./storefront-observation.js";
export {
  DEFAULT_OBSERVATION_MAX_ATTEMPTS,
  DEFAULT_OBSERVATION_RETRY_DELAY_MS,
  DEFAULT_READY_MAX_ATTEMPTS,
  DEFAULT_READY_RETRY_DELAY_MS,
  hasMeaningfulStorefrontSignals,
};
export type {
  ObservationRetryOptions,
  StorefrontReadyWaitOptions,
} from "./storefront-observation-readiness.js";

function sendTabMessage<T>(tabId: number, message: unknown): Promise<T | undefined> {
  return new Promise((resolve) => {
    chrome.tabs.sendMessage(tabId, message, (response: unknown) => {
      if (chrome.runtime.lastError !== undefined) {
        resolve(undefined);
        return;
      }
      resolve(response as T | undefined);
    });
  });
}

export async function probeStorefrontObservation(
  tabId: number,
): Promise<StorefrontObservationSnapshot | undefined> {
  const request: StorefrontProbeRequest = { kind: STOREFRONT_PROBE_MESSAGE };
  const response = await sendTabMessage<unknown>(tabId, request);
  if (!isStorefrontObservationSnapshot(response)) {
    return undefined;
  }

  const shopifySources = hasShopifyShop(response.shopifySources)
    ? response.shopifySources
    : mergeShopifyPageSources(
        response.shopifySources,
        await extractShopifyPageSourcesFromPageContext(tabId),
      );

  return enrichStorefrontObservationSnapshot(
    Object.freeze({
      ...response,
      shopifySources,
    }),
  );
}

export async function pingStorefrontObservationReady(tabId: number): Promise<boolean> {
  const request: StorefrontReadyRequest = { kind: STOREFRONT_READY_MESSAGE };
  const response = await sendTabMessage<unknown>(tabId, request);
  if (!isStorefrontReadyResponse(response)) {
    return false;
  }
  return response.ready;
}

export async function isStorefrontAgentPresent(tabId: number): Promise<boolean> {
  const request: StorefrontReadyRequest = { kind: STOREFRONT_READY_MESSAGE };
  const response = await sendTabMessage<unknown>(tabId, request);
  return isStorefrontReadyResponse(response);
}

export async function probeStorefrontObservationWithRetry(
  tabId: number,
  options: ObservationRetryOptions = {},
): Promise<StorefrontObservationSnapshot | undefined> {
  return runProbeWithRetry(tabId, {
    probe: probeStorefrontObservation,
    ...options,
  });
}

export async function waitForStorefrontObservationReady(
  tabId: number,
  options: StorefrontReadyWaitOptions = {},
): Promise<boolean> {
  return runWaitForReady(tabId, {
    pingReady: pingStorefrontObservationReady,
    ...options,
  });
}

export function createChromeDomPorts(tabId: number): DomDiscoveryPorts {
  return Object.freeze({
    traversal: {
      async canTraverse(target: StorefrontTarget) {
        void target;
        const probe = await probeStorefrontObservationWithRetry(tabId);
        return probe?.canTraverse ?? false;
      },
    },
    query: {
      async canLocateStructures(target: StorefrontTarget) {
        void target;
        const probe = await probeStorefrontObservationWithRetry(tabId);
        return probe?.canQuery ?? false;
      },
    },
  });
}
