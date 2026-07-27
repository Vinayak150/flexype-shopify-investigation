import { describe, expect, it, vi } from "vitest";

import type { StorefrontObservationSnapshot } from "../../extension/adapters/storefront-observation.js";
import { EMPTY_SHOPIFY_PAGE_SOURCES } from "../../extension/adapters/storefront-observation.js";
import { EMPTY_DISABLED_SIGNALS } from "../../extension/adapters/storefront-observation.js";
import { StorefrontPageType } from "../../extension/adapters/store-metadata.js";
import {
  DEFAULT_OBSERVATION_MAX_ATTEMPTS,
  DEFAULT_OBSERVATION_RETRY_DELAY_MS,
  hasMeaningfulStorefrontSignals,
  probeStorefrontObservationWithRetry,
  waitForStorefrontObservationReady,
} from "../../extension/adapters/storefront-observation-readiness.js";

function createSnapshot(
  overrides: Partial<StorefrontObservationSnapshot> = {},
): StorefrontObservationSnapshot {
  return Object.freeze({
    kind: "StorefrontObservationSnapshot",
    url: "https://store.example/",
    documentReachable: true,
    metadataReachable: true,
    canTraverse: true,
    canQuery: true,
    scriptUrls: Object.freeze(["https://cdn.shopify.com/theme.js"]),
    stylesheetUrls: Object.freeze([]),
    domIndicators: Object.freeze([]),
    globalObjects: Object.freeze([]),
    metadata: Object.freeze({
      metaTags: Object.freeze([]),
    }),
    themeHints: Object.freeze([]),
    storeMetadata: Object.freeze({
      pageType: StorefrontPageType.Unknown,
    }),
    shopifySources: EMPTY_SHOPIFY_PAGE_SOURCES,
    disabledSignals: EMPTY_DISABLED_SIGNALS,
    ...overrides,
  });
}

describe("hasMeaningfulStorefrontSignals", () => {
  it("treats script URLs as meaningful storefront signals", () => {
    expect(hasMeaningfulStorefrontSignals(createSnapshot())).toBe(true);
  });

  it("treats Shopify global presence as meaningful when scripts are not yet present", () => {
    expect(
      hasMeaningfulStorefrontSignals(
        createSnapshot({
          scriptUrls: Object.freeze([]),
          globalObjects: Object.freeze(["Shopify"]),
        }),
      ),
    ).toBe(true);
  });

  it("does not treat empty early snapshots as meaningful", () => {
    expect(
      hasMeaningfulStorefrontSignals(
        createSnapshot({
          scriptUrls: Object.freeze([]),
          globalObjects: Object.freeze([]),
          domIndicators: Object.freeze([]),
          stylesheetUrls: Object.freeze([]),
          themeHints: Object.freeze([]),
        }),
      ),
    ).toBe(false);
  });
});

describe("probeStorefrontObservationWithRetry", () => {
  it("returns undefined when the content script never responds", async () => {
    const sleep = vi.fn(async () => undefined);
    const probe = vi.fn(async () => undefined);

    const snapshot = await probeStorefrontObservationWithRetry(7, {
      maxAttempts: 3,
      delayMs: 10,
      sleep,
      probe,
    });

    expect(snapshot).toBeUndefined();
    expect(probe).toHaveBeenCalledTimes(3);
    expect(sleep).toHaveBeenCalledTimes(2);
  });

  it("retries until delayed storefront signals become meaningful", async () => {
    const sleep = vi.fn(async () => undefined);
    const emptySnapshot = createSnapshot({
      scriptUrls: Object.freeze([]),
      globalObjects: Object.freeze([]),
      domIndicators: Object.freeze([]),
    });
    const populatedSnapshot = createSnapshot({
      scriptUrls: Object.freeze(["https://static.flexype.in/scripts/flexype-v2.min.js"]),
    });
    const probe = vi
      .fn()
      .mockResolvedValueOnce(emptySnapshot)
      .mockResolvedValueOnce(populatedSnapshot);

    const snapshot = await probeStorefrontObservationWithRetry(7, {
      maxAttempts: 3,
      delayMs: 10,
      sleep,
      probe,
    });

    expect(snapshot).toBe(populatedSnapshot);
    expect(probe).toHaveBeenCalledTimes(2);
    expect(sleep).toHaveBeenCalledTimes(1);
    expect(sleep).toHaveBeenCalledWith(10);
  });

  it("returns the last snapshot when retry limit is reached without meaningful signals", async () => {
    const sleep = vi.fn(async () => undefined);
    const emptySnapshot = createSnapshot({
      scriptUrls: Object.freeze([]),
      globalObjects: Object.freeze([]),
      domIndicators: Object.freeze([]),
    });
    const probe = vi.fn(async () => emptySnapshot);

    const snapshot = await probeStorefrontObservationWithRetry(7, {
      maxAttempts: DEFAULT_OBSERVATION_MAX_ATTEMPTS,
      delayMs: DEFAULT_OBSERVATION_RETRY_DELAY_MS,
      sleep,
      probe,
    });

    expect(snapshot).toBe(emptySnapshot);
    expect(probe).toHaveBeenCalledTimes(DEFAULT_OBSERVATION_MAX_ATTEMPTS);
    expect(sleep).toHaveBeenCalledTimes(DEFAULT_OBSERVATION_MAX_ATTEMPTS - 1);
  });
});

describe("waitForStorefrontObservationReady", () => {
  it("returns false when the content script never becomes ready", async () => {
    const sleep = vi.fn(async () => undefined);
    const pingReady = vi.fn(async () => false);

    const ready = await waitForStorefrontObservationReady(9, {
      maxAttempts: 3,
      delayMs: 10,
      sleep,
      pingReady,
    });

    expect(ready).toBe(false);
    expect(pingReady).toHaveBeenCalledTimes(3);
    expect(sleep).toHaveBeenCalledTimes(2);
  });

  it("returns true once the content script reports readiness", async () => {
    const sleep = vi.fn(async () => undefined);
    const pingReady = vi
      .fn()
      .mockResolvedValueOnce(false)
      .mockResolvedValueOnce(true);

    const ready = await waitForStorefrontObservationReady(9, {
      maxAttempts: 3,
      delayMs: 10,
      sleep,
      pingReady,
    });

    expect(ready).toBe(true);
    expect(pingReady).toHaveBeenCalledTimes(2);
    expect(sleep).toHaveBeenCalledTimes(1);
  });
});
