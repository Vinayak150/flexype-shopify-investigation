/// <reference lib="dom" />

/**
 * Popup presentation surface — displays investigation results via extension messaging only.
 * Must not scan storefronts, collect Evidence, or run Detection.
 */
import type {
  ExtensionInvestigationStartedPayload,
  ExtensionPresentationViewPayload,
  ExtensionRuntimeStatusPayload,
} from "../runtime/extension-runtime.js";
import {
  deriveHeaderStatus,
  parseExtensionResponse,
  productStatusClass,
  statusClassName,
} from "./popup-view-model.js";

const ExtensionCommand = {
  START_INVESTIGATION: "START_INVESTIGATION",
  GET_STATUS: "GET_STATUS",
  GET_PRESENTATION_VIEW: "GET_PRESENTATION_VIEW",
} as const;

async function sendCommand<T>(command: string): Promise<
  { readonly ok: true; readonly payload: T } | { readonly ok: false; readonly error: string }
> {
  return new Promise((resolve) => {
    chrome.runtime.sendMessage({ command }, (response: unknown) => {
      resolve(
        parseExtensionResponse<T>(
          response,
          chrome.runtime.lastError?.message,
        ),
      );
    });
  });
}

function setText(id: string, value: string | undefined, fallback = "Unknown"): void {
  const element = document.getElementById(id);
  if (element !== null) {
    element.textContent = value !== undefined && value.length > 0 ? value : fallback;
  }
}

function setRunningHeader(): void {
  const indicator = document.getElementById("status-indicator");
  const label = document.getElementById("status-label");

  if (indicator !== null) {
    indicator.className = `status-indicator ${statusClassName("Running")}`;
  }
  if (label !== null) {
    label.textContent = "Running";
  }
}

function renderHeader(status: ExtensionRuntimeStatusPayload): void {
  const headerStatus = deriveHeaderStatus(status);
  const indicator = document.getElementById("status-indicator");
  const label = document.getElementById("status-label");

  if (indicator !== null) {
    indicator.className = `status-indicator ${statusClassName(headerStatus)}`;
  }
  if (label !== null) {
    label.textContent = headerStatus;
  }
}

function showActionError(message: string): void {
  const errorElement = document.getElementById("action-error");
  if (errorElement === null) {
    return;
  }
  errorElement.textContent = message;
  errorElement.hidden = false;
}

function clearActionError(): void {
  const errorElement = document.getElementById("action-error");
  if (errorElement === null) {
    return;
  }
  errorElement.textContent = "";
  errorElement.hidden = true;
}

function setRunButtonDisabled(disabled: boolean): void {
  const button = document.getElementById("run-investigation");
  if (button instanceof HTMLButtonElement) {
    button.disabled = disabled;
  }
}

function renderProducts(view: ExtensionPresentationViewPayload): void {
  const container = document.getElementById("product-list");
  if (container === null) {
    return;
  }

  container.replaceChildren();
  for (const product of view.products) {
    const item = document.createElement("article");
    item.className = "product-item";

    const header = document.createElement("div");
    header.className = "product-item__header";

    const name = document.createElement("h3");
    name.className = "product-item__name";
    name.textContent = product.productLabel;

    const status = document.createElement("span");
    status.className = `product-item__status ${productStatusClass(product.status)}`;
    status.textContent = product.status;

    header.append(name, status);
    item.append(header);

    if (product.explanation !== undefined) {
      const reason = document.createElement("p");
      reason.className = "product-item__reason";
      reason.innerHTML = `<span class="product-item__reason-label">Reason:</span> ${escapeHtml(product.explanation)}`;
      item.append(reason);
    }

    container.append(item);
  }
}

function renderCompletenessFlags(view: ExtensionPresentationViewPayload): void {
  const list = document.getElementById("completeness-flags");
  if (list === null) {
    return;
  }

  list.replaceChildren();
  const flags: string[] = [];

  if (view.summary.hasUnknownQualifications || view.unknownVisible) {
    flags.push("Unknown qualifications present");
  }
  if (view.summary.hasNotDetectedOutcomes || view.notDetectedVisible) {
    flags.push("Not detected outcomes present");
  }
  if (flags.length === 0) {
    const item = document.createElement("li");
    item.textContent = "No outstanding completeness flags";
    list.append(item);
    return;
  }

  for (const flag of flags) {
    const item = document.createElement("li");
    item.textContent = flag;
    list.append(item);
  }
}

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function renderInvestigationView(view: ExtensionPresentationViewPayload): void {
  const emptyState = document.getElementById("empty-state");
  const investigationView = document.getElementById("investigation-view");

  if (emptyState !== null) {
    emptyState.hidden = true;
  }
  if (investigationView !== null) {
    investigationView.hidden = false;
  }

  setText("store-url", view.store.storeUrl);
  setText("store-shop-name", view.store.shopName);
  setText("store-currency", view.store.baseCurrency);
  setText("store-country", view.store.country);
  setText("store-locale", view.store.locale);
  setText("store-shopify-domain", view.store.shopifyDomain);
  setText("store-theme", view.store.themeName);
  setText("store-page-type", view.store.pageType);
  setText("completion-state", view.summary.completionState);
  setText("completeness-label", view.summary.completenessLabel);

  renderProducts(view);
  renderCompletenessFlags(view);
}

function renderEmptyState(): void {
  const emptyState = document.getElementById("empty-state");
  const investigationView = document.getElementById("investigation-view");

  if (emptyState !== null) {
    emptyState.hidden = false;
  }
  if (investigationView !== null) {
    investigationView.hidden = true;
  }
}

async function refreshPresentation(): Promise<void> {
  const statusResult = await sendCommand<ExtensionRuntimeStatusPayload>(
    ExtensionCommand.GET_STATUS,
  );
  if (statusResult.ok) {
    renderHeader(statusResult.payload);
  }

  const viewResult = await sendCommand<ExtensionPresentationViewPayload | undefined>(
    ExtensionCommand.GET_PRESENTATION_VIEW,
  );

  if (!viewResult.ok) {
    showActionError(viewResult.error);
    renderEmptyState();
    return;
  }

  const view = viewResult.payload;
  if (view === undefined || view === null) {
    renderEmptyState();
    return;
  }

  clearActionError();
  renderInvestigationView(view);
}

async function handleRunInvestigation(): Promise<void> {
  clearActionError();
  setRunButtonDisabled(true);
  setRunningHeader();

  const startResult = await sendCommand<ExtensionInvestigationStartedPayload>(
    ExtensionCommand.START_INVESTIGATION,
  );

  if (!startResult.ok) {
    showActionError(startResult.error);
    await refreshPresentation();
    setRunButtonDisabled(false);
    return;
  }

  await refreshPresentation();
  setRunButtonDisabled(false);
}

function bindRunInvestigation(): void {
  const button = document.getElementById("run-investigation");
  if (button === null) {
    return;
  }

  button.addEventListener("click", () => {
    void handleRunInvestigation().catch((error: unknown) => {
      showActionError(
        error instanceof Error ? error.message : "Investigation request failed",
      );
      setRunButtonDisabled(false);
      void refreshPresentation();
    });
  });
}

async function loadPopup(): Promise<void> {
  bindRunInvestigation();
  await refreshPresentation();
}

void loadPopup().catch(() => {
  renderEmptyState();
});
