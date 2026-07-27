import { describe, expect, it, vi } from "vitest";

import {
  ensureStorefrontAgent,
  injectStorefrontAgent,
  STOREFRONT_AGENT_SCRIPT,
} from "../../extension/adapters/chrome-content-script-adapter.js";

interface ChromeContentScriptTestMock {
  readonly scripting: {
    readonly executeScript: (
      injection: { target: { tabId: number }; files: readonly string[] },
      callback: (results: unknown[]) => void,
    ) => void;
  };
  readonly runtime: {
    lastError: { message?: string } | undefined;
    sendMessage: (
      message: unknown,
      responseCallback: (response: unknown) => void,
    ) => void;
  };
}

function createChromeContentScriptTestMock(
  executeScript: ChromeContentScriptTestMock["scripting"]["executeScript"],
): ChromeContentScriptTestMock {
  return {
    scripting: { executeScript },
    runtime: {
      lastError: undefined,
      sendMessage: vi.fn(),
    },
  };
}

describe("ensureStorefrontAgent", () => {
  it("waits for readiness when the content script is already available", async () => {
    const isPresent = vi.fn(async () => true);
    const inject = vi.fn(async () => undefined);
    const waitReady = vi.fn(async () => true);

    await ensureStorefrontAgent(12, { isPresent, inject, waitReady });

    expect(isPresent).toHaveBeenCalledWith(12);
    expect(inject).not.toHaveBeenCalled();
    expect(waitReady).toHaveBeenCalledWith(12);
  });

  it("injects the storefront agent when it is missing", async () => {
    const isPresent = vi.fn().mockResolvedValueOnce(false).mockResolvedValueOnce(true);
    const inject = vi.fn(async () => undefined);
    const waitReady = vi.fn(async () => true);

    await ensureStorefrontAgent(21, { isPresent, inject, waitReady });

    expect(inject).toHaveBeenCalledWith(21);
    expect(isPresent).toHaveBeenCalledTimes(2);
    expect(waitReady).toHaveBeenCalledWith(21);
  });

  it("throws an honest error when injection fails", async () => {
    const isPresent = vi.fn(async () => false);
    const inject = vi.fn(async () => {
      throw new Error("Cannot access contents of url");
    });
    const waitReady = vi.fn(async () => true);

    await expect(
      ensureStorefrontAgent(7, { isPresent, inject, waitReady }),
    ).rejects.toThrow(
      "Unable to inject storefront observation agent: Cannot access contents of url",
    );
    expect(waitReady).not.toHaveBeenCalled();
  });

  it("throws when the agent never responds after injection", async () => {
    const isPresent = vi.fn(async () => false);
    const inject = vi.fn(async () => undefined);
    const waitReady = vi.fn(async () => true);

    await expect(
      ensureStorefrontAgent(8, { isPresent, inject, waitReady }),
    ).rejects.toThrow("Storefront observation agent did not respond after injection");
    expect(waitReady).not.toHaveBeenCalled();
  });

  it("throws when the agent is present but never becomes ready", async () => {
    const isPresent = vi.fn(async () => true);
    const inject = vi.fn(async () => undefined);
    const waitReady = vi.fn(async () => false);

    await expect(
      ensureStorefrontAgent(9, { isPresent, inject, waitReady }),
    ).rejects.toThrow("Storefront observation agent is not ready");
    expect(inject).not.toHaveBeenCalled();
  });
});

describe("injectStorefrontAgent", () => {
  it("targets the packaged storefront agent script", async () => {
    const executeScript = vi.fn(
      (_injection, callback: (results: unknown[]) => void) => {
        callback([]);
      },
    );
    vi.stubGlobal("chrome", createChromeContentScriptTestMock(executeScript));

    await injectStorefrontAgent(3);

    expect(executeScript).toHaveBeenCalledWith(
      {
        target: { tabId: 3 },
        files: [STOREFRONT_AGENT_SCRIPT],
      },
      expect.any(Function),
    );

    vi.unstubAllGlobals();
  });
});
