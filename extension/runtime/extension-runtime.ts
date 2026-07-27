/**
 * Browser-facing extension runtime — hosts existing SystemRuntime (E-011).
 * Wires Chrome adapters; does not duplicate Investigation/Detection/Evidence engines.
 */
import {
  createSystemRuntime,
  type IntegratedInvestigationResult,
  type SystemRuntime,
  type SystemRuntimeStatus,
} from "../composition.js";
import {
  createChromeBrowserPorts,
  getActiveTab,
} from "../adapters/chrome-tab-adapter.js";
import { createChromeDomPorts } from "../adapters/chrome-dom-adapter.js";
import {
  projectPresentationForPopup,
  type PopupInvestigationSummary,
  type PopupProductStatus,
  type PopupStoreInfo,
} from "../popup/presentation-projection.js";

export interface ExtensionRuntimeStatusPayload {
  readonly extensionReady: boolean;
  readonly systemRuntimeStatus: SystemRuntimeStatus;
  readonly activeTabUrl?: string;
  readonly investigationId?: string;
  readonly investigationState?: string;
  readonly completionDisposition?: string;
}

export type {
  PopupInvestigationSummary,
  PopupProductStatus,
  PopupStoreInfo,
} from "../popup/presentation-projection.js";

export interface ExtensionPresentationViewPayload {
  readonly kind: "PresentationReadyView";
  readonly investigationId: string;
  readonly completenessLabel: string;
  readonly unknownVisible: boolean;
  readonly notDetectedVisible: boolean;
  readonly sectionOrder: readonly string[];
  readonly store: PopupStoreInfo;
  readonly products: readonly PopupProductStatus[];
  readonly summary: PopupInvestigationSummary;
}

export interface ExtensionInvestigationStartedPayload {
  readonly investigationId: string;
  readonly storefrontUrl: string;
  readonly state: string;
  readonly completionDisposition?: string;
  readonly stageCount: number;
}

export class ExtensionRuntime {
  private systemRuntime: SystemRuntime | undefined;
  private lastResult: IntegratedInvestigationResult | undefined;
  private activeTabUrl: string | undefined;
  private initialized = false;

  async initialize(): Promise<void> {
    if (this.initialized && this.systemRuntime?.getStatus() === "ready") {
      return;
    }

    await this.ensureSystemRuntimeForActiveTab();
    this.initialized = true;
  }

  async startInvestigation(): Promise<ExtensionInvestigationStartedPayload> {
    await this.ensureSystemRuntimeForActiveTab();
    const tab = await getActiveTab();
    if (tab === undefined) {
      throw new Error("No active tab available for Investigation");
    }

    const result = await this.requireSystemRuntime().runInvestigation(tab.url, {
      kind: "OperatorIntent",
      label: "chrome-extension",
    });

    this.lastResult = result;
    this.activeTabUrl = tab.url;

    return Object.freeze({
      investigationId: String(result.context.investigationId),
      storefrontUrl: result.context.storefrontTarget.storefrontUrl,
      state: result.context.state,
      ...(result.context.completionDisposition !== undefined
        ? { completionDisposition: result.context.completionDisposition }
        : {}),
      stageCount: result.stageResults.length,
    });
  }

  getStatus(): ExtensionRuntimeStatusPayload {
    const runtime = this.systemRuntime;
    const ready = runtime?.getStatus() === "ready";

    return Object.freeze({
      extensionReady: this.initialized && ready,
      systemRuntimeStatus: runtime?.getStatus() ?? "uninitialized",
      ...(this.activeTabUrl !== undefined ? { activeTabUrl: this.activeTabUrl } : {}),
      ...(this.lastResult !== undefined
        ? {
            investigationId: String(this.lastResult.context.investigationId),
            investigationState: this.lastResult.context.state,
            ...(this.lastResult.context.completionDisposition !== undefined
              ? {
                  completionDisposition: this.lastResult.context.completionDisposition,
                }
              : {}),
          }
        : {}),
    });
  }

  getPresentationView(): ExtensionPresentationViewPayload | undefined {
    const lastResult = this.lastResult;
    const view = lastResult?.view;
    if (view === undefined || lastResult === undefined) {
      return undefined;
    }

    return projectPresentationForPopup(
      view,
      lastResult.context.completionDisposition,
    );
  }

  shutdown(): void {
    this.systemRuntime?.shutdown();
    this.systemRuntime = undefined;
    this.initialized = false;
  }

  private async ensureSystemRuntimeForActiveTab(): Promise<void> {
    const tab = await getActiveTab();
    if (tab === undefined) {
      throw new Error("No active tab available for extension runtime startup");
    }

    if (
      this.systemRuntime !== undefined &&
      this.systemRuntime.getStatus() === "ready" &&
      this.activeTabUrl === tab.url
    ) {
      return;
    }

    this.systemRuntime?.shutdown();
    this.systemRuntime = createSystemRuntime();
    this.systemRuntime.startup({
      browser: createChromeBrowserPorts({ tabId: tab.tabId, tabUrl: tab.url }),
      dom: createChromeDomPorts(tab.tabId),
      configurationElection: "deferred",
      enableTraceability: true,
    });
    this.activeTabUrl = tab.url;
  }

  private requireSystemRuntime(): SystemRuntime {
    if (this.systemRuntime === undefined || this.systemRuntime.getStatus() !== "ready") {
      throw new Error("SystemRuntime is not ready");
    }
    return this.systemRuntime;
  }
}

export function createExtensionRuntime(): ExtensionRuntime {
  return new ExtensionRuntime();
}
