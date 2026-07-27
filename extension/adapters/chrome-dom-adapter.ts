/**
 * Chrome DOM adapter — content-script observation boundary only.
 * Translates page capability signals; does not detect products or create Evidence.
 */

import type { StorefrontTarget } from "../../src/investigation/index.js";
import type { DomDiscoveryPorts } from "../../src/observation/index.js";

export const STOREFRONT_PROBE_MESSAGE = "FLEXYPE_STOREFRONT_PROBE" as const;

export interface StorefrontObservationProbe {
  readonly kind: "StorefrontObservationProbe";
  readonly url: string;
  readonly documentReachable: boolean;
  readonly metadataReachable: boolean;
  readonly canTraverse: boolean;
  readonly canQuery: boolean;
}

export interface StorefrontProbeRequest {
  readonly kind: typeof STOREFRONT_PROBE_MESSAGE;
}

export async function probeStorefrontObservation(
  tabId: number,
): Promise<StorefrontObservationProbe | undefined> {
  return new Promise((resolve) => {
    const request: StorefrontProbeRequest = { kind: STOREFRONT_PROBE_MESSAGE };
    chrome.tabs.sendMessage(tabId, request, (response: unknown) => {
      if (chrome.runtime.lastError !== undefined) {
        resolve(undefined);
        return;
      }
      if (
        response === null ||
        typeof response !== "object" ||
        (response as StorefrontObservationProbe).kind !== "StorefrontObservationProbe"
      ) {
        resolve(undefined);
        return;
      }
      resolve(response as StorefrontObservationProbe);
    });
  });
}

export function createChromeDomPorts(tabId: number): DomDiscoveryPorts {
  return Object.freeze({
    traversal: {
      async canTraverse(target: StorefrontTarget) {
        void target;
        const probe = await probeStorefrontObservation(tabId);
        return probe?.canTraverse ?? false;
      },
    },
    query: {
      async canLocateStructures(target: StorefrontTarget) {
        void target;
        const probe = await probeStorefrontObservation(tabId);
        return probe?.canQuery ?? false;
      },
    },
  });
}
