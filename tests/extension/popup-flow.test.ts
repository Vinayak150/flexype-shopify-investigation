import { describe, expect, it } from "vitest";

import {
  deriveHeaderStatus,
  parseExtensionResponse,
  productStatusClass,
  resolvePopupDisplayState,
  statusClassName,
} from "../../extension/popup/popup-view-model.js";

describe("extension popup flow", () => {
  it("shows empty state when no presentation view exists", () => {
    expect(
      resolvePopupDisplayState({
        view: undefined,
        status: {
          extensionReady: true,
          systemRuntimeStatus: "ready",
        },
      }),
    ).toBe("empty");
  });

  it("shows running state while investigation is in progress", () => {
    expect(resolvePopupDisplayState({ running: true })).toBe("running");
    expect(
      deriveHeaderStatus({
        extensionReady: true,
        systemRuntimeStatus: "ready",
        investigationState: "InProgress",
      }),
    ).toBe("Running");
    expect(statusClassName("Running")).toBe("status-indicator--running");
  });

  it("shows completed state when investigation finished with a view", () => {
    const display = resolvePopupDisplayState({
      view: {
        kind: "PresentationReadyView",
        investigationId: "inv-1",
        completenessLabel: "Complete as obtainable",
        unknownVisible: false,
        notDetectedVisible: false,
        sectionOrder: [],
        store: {},
        products: [],
        summary: {
          completionState: "Completed",
          completenessLabel: "Complete as obtainable",
          completenessKind: "CompleteAsObtainable",
          hasUnknownQualifications: false,
          hasNotDetectedOutcomes: false,
        },
      },
      status: {
        extensionReady: true,
        systemRuntimeStatus: "ready",
        investigationState: "Completed",
      },
    });

    expect(display).toBe("completed");
    expect(
      deriveHeaderStatus({
        extensionReady: true,
        systemRuntimeStatus: "ready",
        investigationState: "Completed",
      }),
    ).toBe("Completed");
    expect(statusClassName("Completed")).toBe("status-indicator--completed");
  });

  it("shows partial state for partial or unknown-qualified investigations", () => {
    expect(
      resolvePopupDisplayState({
        view: {
          kind: "PresentationReadyView",
          investigationId: "inv-2",
          completenessLabel: "Partial",
          unknownVisible: true,
          notDetectedVisible: false,
          sectionOrder: [],
          store: {},
          products: [],
          summary: {
            completionState: "Completed Partial",
            completenessLabel: "Partial",
            completenessKind: "Partial",
            hasUnknownQualifications: true,
            hasNotDetectedOutcomes: false,
          },
        },
        status: {
          extensionReady: true,
          systemRuntimeStatus: "ready",
          investigationState: "CompletedPartial",
        },
      }),
    ).toBe("partial");

    expect(
      deriveHeaderStatus({
        extensionReady: true,
        systemRuntimeStatus: "ready",
        completionDisposition: "UnknownQualified",
      }),
    ).toBe("Partial");
  });

  it("shows error state for failed commands without fabricating success", () => {
    expect(
      resolvePopupDisplayState({
        error: "Active tab is not a supported storefront page",
      }),
    ).toBe("error");

    const parsed = parseExtensionResponse(
      {
        ok: false,
        error: "No active tab available for Investigation",
      },
      undefined,
    );
    expect(parsed.ok).toBe(false);
    if (!parsed.ok) {
      expect(parsed.error).toBe("No active tab available for Investigation");
    }
  });

  it("maps product status labels to presentation classes only", () => {
    expect(productStatusClass("Detected")).toBe("product-item__status--detected");
    expect(productStatusClass("Not Detected")).toBe("product-item__status--not-detected");
    expect(productStatusClass("Unknown")).toBe("product-item__status--unknown");
  });

  it("parses chrome runtime messaging failures honestly", () => {
    const parsed = parseExtensionResponse(undefined, "Could not establish connection");
    expect(parsed.ok).toBe(false);
    if (!parsed.ok) {
      expect(parsed.error).toBe("Could not establish connection");
    }
  });
});
