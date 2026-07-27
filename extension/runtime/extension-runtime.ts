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
  isLikelyPublicStorefrontUrl,
} from "../adapters/chrome-tab-adapter.js";
import { ensureStorefrontAgent } from "../adapters/chrome-content-script-adapter.js";
import {
  createChromeDomPorts,
  probeStorefrontObservationWithRetry,
} from "../adapters/chrome-dom-adapter.js";
import { createChromeFactSource } from "../adapters/chrome-fact-source.js";
import type { StorefrontMetadataSnapshot } from "../adapters/store-metadata.js";
import type { StorefrontDisabledSignals } from "../adapters/storefront-observation.js";
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

interface TabInvestigationState {
  readonly url: string;
  readonly result?: IntegratedInvestigationResult;
  readonly metadata?: StorefrontMetadataSnapshot;
  readonly disabledSignals?: StorefrontDisabledSignals;
  readonly updatedAt: number;
}

export class ExtensionRuntime {
  private systemRuntime: SystemRuntime | undefined;
  private activeRuntimeTabId: number | undefined;
  private readonly investigations = new Map<number, TabInvestigationState>();
  private initialized = false;

  async initialize(): Promise<void> {
    if (this.initialized && this.systemRuntime?.getStatus() === "ready") {
      return;
    }

    await this.ensureSystemRuntimeForActiveTab();
    this.initialized = true;
  }

  async startInvestigation(): Promise<ExtensionInvestigationStartedPayload> {
    const tab = await getActiveTab();
    if (tab === undefined) {
      throw new Error("No active tab available for Investigation");
    }

    if (!isLikelyPublicStorefrontUrl(tab.url)) {
      throw new Error("Active tab is not a supported storefront page");
    }

    await this.ensureSystemRuntimeForActiveTab();

    await ensureStorefrontAgent(tab.tabId);

    const observationSnapshot = await probeStorefrontObservationWithRetry(tab.tabId);

    let result: IntegratedInvestigationResult;
    try {
      result = await this.requireSystemRuntime().runInvestigation(tab.url, {
        kind: "OperatorIntent",
        label: "chrome-extension",
      });
    } catch (error) {
      throw new Error(
        error instanceof Error ? error.message : "Investigation failed",
      );
    }

    if (result.view === undefined) {
      throw new Error("Investigation completed without presentation results");
    }

    this.investigations.set(tab.tabId, Object.freeze({
      url: tab.url,
      result,
      ...(observationSnapshot?.storeMetadata !== undefined
        ? { metadata: observationSnapshot.storeMetadata }
        : {}),
      ...(observationSnapshot?.disabledSignals !== undefined
        ? { disabledSignals: observationSnapshot.disabledSignals }
        : {}),
      updatedAt: Date.now(),
    }));

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

  async getStatus(): Promise<ExtensionRuntimeStatusPayload> {
    const tab = await getActiveTab();
    const runtime = this.systemRuntime;
    const ready = runtime?.getStatus() === "ready";
    const tabState =
      tab !== undefined ? this.investigations.get(tab.tabId) : undefined;
    const result = tabState?.result;

    return Object.freeze({
      extensionReady: this.initialized && ready,
      systemRuntimeStatus: runtime?.getStatus() ?? "uninitialized",
      ...(tab?.url !== undefined ? { activeTabUrl: tab.url } : {}),
      ...(result !== undefined
        ? {
            investigationId: String(result.context.investigationId),
            investigationState: result.context.state,
            ...(result.context.completionDisposition !== undefined
              ? {
                  completionDisposition: result.context.completionDisposition,
                }
              : {}),
          }
        : {}),
    });
  }

  async getPresentationView(): Promise<ExtensionPresentationViewPayload | undefined> {
    const tab = await getActiveTab();
    if (tab === undefined) {
      return undefined;
    }

    const tabState = this.investigations.get(tab.tabId);
    const lastResult = tabState?.result;
    const view = lastResult?.view;
    if (tabState === undefined || view === undefined || lastResult === undefined) {
      return undefined;
    }

    return projectPresentationForPopup(
      view,
      lastResult.context.completionDisposition,
      tabState.metadata,
      tabState.disabledSignals,
    );
  }

  removeInvestigationForTab(tabId: number): void {
    this.investigations.delete(tabId);
    if (this.activeRuntimeTabId === tabId) {
      this.systemRuntime?.shutdown();
      this.systemRuntime = undefined;
      this.activeRuntimeTabId = undefined;
    }
  }

  shutdown(): void {
    this.systemRuntime?.shutdown();
    this.systemRuntime = undefined;
    this.activeRuntimeTabId = undefined;
    this.investigations.clear();
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
      this.activeRuntimeTabId === tab.tabId
    ) {
      return;
    }

    this.systemRuntime?.shutdown();
    this.systemRuntime = createSystemRuntime();
    this.systemRuntime.startup({
      browser: createChromeBrowserPorts({ tabId: tab.tabId, tabUrl: tab.url }),
      dom: createChromeDomPorts(tab.tabId),
      factSource: createChromeFactSource(tab.tabId),
      configurationElection: "deferred",
      enableTraceability: true,
    });
    this.activeRuntimeTabId = tab.tabId;
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
