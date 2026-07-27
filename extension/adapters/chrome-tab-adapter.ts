/**
 * Chrome tab adapter — active tab lookup and metadata only (E-011 hosting).
 * Translates Chrome tabs API; does not own Investigation or Detection meaning.
 */

import type { StorefrontTarget } from "../../src/investigation/index.js";
import type { BrowserDiscoveryPorts } from "../../src/observation/index.js";
import { probeStorefrontObservation } from "./chrome-dom-adapter.js";

export interface ActiveTabInfo {
  readonly tabId: number;
  readonly url: string;
  readonly title?: string;
}

export async function getActiveTab(): Promise<ActiveTabInfo | undefined> {
  return new Promise((resolve) => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const tab = tabs[0];
      if (tab?.id === undefined || tab.url === undefined || tab.url.trim().length === 0) {
        resolve(undefined);
        return;
      }
      resolve(
        Object.freeze({
          tabId: tab.id,
          url: tab.url,
          ...(tab.title !== undefined ? { title: tab.title } : {}),
        }),
      );
    });
  });
}

export function isLikelyPublicStorefrontUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.protocol === "https:" || parsed.protocol === "http:";
  } catch {
    return false;
  }
}

export function createChromeBrowserPorts(input: {
  readonly tabId: number;
  readonly tabUrl: string;
}): BrowserDiscoveryPorts {
  return Object.freeze({
    browserAccess: {
      async getPageContext(target: StorefrontTarget) {
        const probe = await probeStorefrontObservation(input.tabId);
        const url = probe?.url ?? target.storefrontUrl ?? input.tabUrl;
        return Object.freeze({
          url,
          isNavigable: true,
          isPublicStorefrontContext: isLikelyPublicStorefrontUrl(url),
        });
      },
    },
    documentAccess: {
      async isDocumentReachable(target: StorefrontTarget) {
        void target;
        const probe = await probeStorefrontObservation(input.tabId);
        return probe?.documentReachable ?? false;
      },
    },
    pageMetadata: {
      async isMetadataReachable(target: StorefrontTarget) {
        void target;
        const probe = await probeStorefrontObservation(input.tabId);
        return probe?.metadataReachable ?? false;
      },
    },
  });
}
