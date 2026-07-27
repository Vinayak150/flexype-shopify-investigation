import { describe, expect, it, vi } from "vitest";

import {
  ExtensionCommand,
  MessageRouter,
  isExtensionMessage,
} from "../../extension/runtime/message-router.js";
import type { ExtensionRuntime } from "../../extension/runtime/extension-runtime.js";

function createMockRuntime(): ExtensionRuntime {
  return {
    initialize: vi.fn(async () => undefined),
    startInvestigation: vi.fn(async () => ({
      investigationId: "inv-1",
      storefrontUrl: "https://demo.myshopify.com",
      state: "Completed",
      stageCount: 5,
    })),
    getStatus: vi.fn(() => ({
      extensionReady: true,
      systemRuntimeStatus: "ready",
    })),
    getPresentationView: vi.fn(() => ({
      kind: "PresentationReadyView",
      investigationId: "inv-1",
    })),
    shutdown: vi.fn(),
  } as unknown as ExtensionRuntime;
}

describe("extension message router", () => {
  it("routes START_INVESTIGATION to ExtensionRuntime.startInvestigation", async () => {
    const runtime = createMockRuntime();
    const router = new MessageRouter(runtime);

    const response = await router.handle({
      command: ExtensionCommand.START_INVESTIGATION,
    });

    expect(response.ok).toBe(true);
    if (response.ok) {
      expect(response.command).toBe(ExtensionCommand.START_INVESTIGATION);
      expect(response.payload).toMatchObject({
        investigationId: "inv-1",
        storefrontUrl: "https://demo.myshopify.com",
      });
    }
    expect(runtime.initialize).toHaveBeenCalledOnce();
    expect(runtime.startInvestigation).toHaveBeenCalledOnce();
  });

  it("routes GET_STATUS without requiring initialization", async () => {
    const runtime = createMockRuntime();
    const router = new MessageRouter(runtime);

    const response = await router.handle({
      command: ExtensionCommand.GET_STATUS,
    });

    expect(response.ok).toBe(true);
    if (response.ok) {
      expect(response.command).toBe(ExtensionCommand.GET_STATUS);
      expect(response.payload).toMatchObject({
        extensionReady: true,
        systemRuntimeStatus: "ready",
      });
    }
    expect(runtime.initialize).not.toHaveBeenCalled();
    expect(runtime.getStatus).toHaveBeenCalledOnce();
  });

  it("routes GET_PRESENTATION_VIEW without requiring initialization", async () => {
    const runtime = createMockRuntime();
    const router = new MessageRouter(runtime);

    const response = await router.handle({
      command: ExtensionCommand.GET_PRESENTATION_VIEW,
    });

    expect(response.ok).toBe(true);
    if (response.ok) {
      expect(response.command).toBe(ExtensionCommand.GET_PRESENTATION_VIEW);
      expect(response.payload).toMatchObject({
        kind: "PresentationReadyView",
        investigationId: "inv-1",
      });
    }
    expect(runtime.initialize).not.toHaveBeenCalled();
    expect(runtime.getPresentationView).toHaveBeenCalledOnce();
  });

  it("rejects invalid message shapes", async () => {
    const runtime = createMockRuntime();
    const router = new MessageRouter(runtime);

    const response = await router.handle({ command: "SCAN_PRODUCTS" });

    expect(response.ok).toBe(false);
    if (!response.ok) {
      expect(response.error).toBe("Invalid extension message shape");
    }
  });

  it("returns honest errors from runtime failures", async () => {
    const runtime = createMockRuntime();
    vi.mocked(runtime.startInvestigation).mockRejectedValueOnce(
      new Error("No active tab available for Investigation"),
    );
    const router = new MessageRouter(runtime);

    const response = await router.handle({
      command: ExtensionCommand.START_INVESTIGATION,
    });

    expect(response.ok).toBe(false);
    if (!response.ok) {
      expect(response.command).toBe(ExtensionCommand.START_INVESTIGATION);
      expect(response.error).toBe("No active tab available for Investigation");
    }
  });

  it("validates supported extension commands only", () => {
    expect(isExtensionMessage({ command: ExtensionCommand.GET_STATUS })).toBe(true);
    expect(isExtensionMessage({ command: "RUN_DETECTION" })).toBe(false);
    expect(isExtensionMessage(null)).toBe(false);
  });
});
