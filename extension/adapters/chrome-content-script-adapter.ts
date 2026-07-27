/**
 * MV3 content-script injection for storefront observation (extension boundary only).
 * Ensures storefront-agent exists before Investigation observation begins.
 */
import {
  isStorefrontAgentPresent,
  waitForStorefrontObservationReady,
} from "./chrome-dom-adapter.js";

export const STOREFRONT_AGENT_SCRIPT = "content/storefront-agent.js";

export interface EnsureStorefrontAgentDependencies {
  readonly isPresent?: (tabId: number) => Promise<boolean>;
  readonly inject?: (tabId: number) => Promise<void>;
  readonly waitReady?: (tabId: number) => Promise<boolean>;
}

export async function injectStorefrontAgent(tabId: number): Promise<void> {
  return new Promise((resolve, reject) => {
    chrome.scripting.executeScript(
      {
        target: { tabId },
        files: [STOREFRONT_AGENT_SCRIPT],
      },
      () => {
        if (chrome.runtime.lastError !== undefined) {
          reject(
            new Error(
              chrome.runtime.lastError.message ?? "Storefront agent injection failed",
            ),
          );
          return;
        }
        resolve();
      },
    );
  });
}

export async function ensureStorefrontAgent(
  tabId: number,
  dependencies: EnsureStorefrontAgentDependencies = {},
): Promise<void> {
  const isPresent = dependencies.isPresent ?? isStorefrontAgentPresent;
  const inject = dependencies.inject ?? injectStorefrontAgent;
  const waitReady = dependencies.waitReady ?? waitForStorefrontObservationReady;

  if (await isPresent(tabId)) {
    const ready = await waitReady(tabId);
    if (!ready) {
      throw new Error("Storefront observation agent is not ready");
    }
    return;
  }

  try {
    await inject(tabId);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Storefront agent injection failed";
    throw new Error(`Unable to inject storefront observation agent: ${message}`);
  }

  if (!(await isPresent(tabId))) {
    throw new Error("Storefront observation agent did not respond after injection");
  }

  const ready = await waitReady(tabId);
  if (!ready) {
    throw new Error("Storefront observation agent is not ready");
  }
}
