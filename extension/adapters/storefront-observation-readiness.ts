/**
 * Storefront observation readiness and bounded retry (extension boundary only).
 * Waits for content-script availability and meaningful public signals before Evidence collection.
 */
import type { StorefrontObservationSnapshot } from "./storefront-observation.js";

export const DEFAULT_OBSERVATION_MAX_ATTEMPTS = 3;
export const DEFAULT_OBSERVATION_RETRY_DELAY_MS = 500;
export const DEFAULT_READY_MAX_ATTEMPTS = 10;
export const DEFAULT_READY_RETRY_DELAY_MS = 100;

export interface ObservationRetryOptions {
  readonly maxAttempts?: number;
  readonly delayMs?: number;
  readonly sleep?: (delayMs: number) => Promise<void>;
  readonly probe?: (
    tabId: number,
  ) => Promise<StorefrontObservationSnapshot | undefined>;
}

export interface StorefrontReadyWaitOptions {
  readonly maxAttempts?: number;
  readonly delayMs?: number;
  readonly sleep?: (delayMs: number) => Promise<void>;
  readonly pingReady?: (tabId: number) => Promise<boolean>;
}

export function hasMeaningfulStorefrontSignals(
  snapshot: StorefrontObservationSnapshot,
): boolean {
  if (!snapshot.documentReachable || !snapshot.canTraverse || !snapshot.canQuery) {
    return false;
  }

  if (snapshot.scriptUrls.length > 0) {
    return true;
  }

  if (snapshot.globalObjects.includes("Shopify")) {
    return true;
  }

  return (
    snapshot.metadataReachable &&
    snapshot.domIndicators.length > 0 &&
    (snapshot.stylesheetUrls.length > 0 || snapshot.themeHints.length > 0)
  );
}

export async function defaultSleep(delayMs: number): Promise<void> {
  await new Promise<void>((resolve) => {
    setTimeout(resolve, delayMs);
  });
}

export async function probeStorefrontObservationWithRetry(
  tabId: number,
  options: ObservationRetryOptions = {},
): Promise<StorefrontObservationSnapshot | undefined> {
  const maxAttempts = options.maxAttempts ?? DEFAULT_OBSERVATION_MAX_ATTEMPTS;
  const delayMs = options.delayMs ?? DEFAULT_OBSERVATION_RETRY_DELAY_MS;
  const sleep = options.sleep ?? defaultSleep;
  const probe = options.probe;

  if (probe === undefined) {
    throw new Error("probeStorefrontObservationWithRetry requires a probe function");
  }

  let lastSnapshot: StorefrontObservationSnapshot | undefined;

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    lastSnapshot = await probe(tabId);

    if (lastSnapshot === undefined) {
      if (attempt < maxAttempts) {
        await sleep(delayMs);
      }
      continue;
    }

    if (hasMeaningfulStorefrontSignals(lastSnapshot) || attempt >= maxAttempts) {
      return lastSnapshot;
    }

    if (attempt < maxAttempts) {
      await sleep(delayMs);
    }
  }

  return lastSnapshot;
}

export async function waitForStorefrontObservationReady(
  tabId: number,
  options: StorefrontReadyWaitOptions = {},
): Promise<boolean> {
  const maxAttempts = options.maxAttempts ?? DEFAULT_READY_MAX_ATTEMPTS;
  const delayMs = options.delayMs ?? DEFAULT_READY_RETRY_DELAY_MS;
  const sleep = options.sleep ?? defaultSleep;
  const pingReady = options.pingReady;

  if (pingReady === undefined) {
    throw new Error("waitForStorefrontObservationReady requires a pingReady function");
  }

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    const ready = await pingReady(tabId);
    if (ready) {
      return true;
    }

    if (attempt < maxAttempts) {
      await sleep(delayMs);
    }
  }

  return false;
}
