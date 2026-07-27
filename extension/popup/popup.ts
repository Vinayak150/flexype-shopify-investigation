/// <reference lib="dom" />

/**
 * Popup presentation surface — displays investigation results via extension messaging only.
 * Must not scan storefronts, collect Evidence, or run Detection.
 */
import type {
  ExtensionPresentationViewPayload,
  ExtensionRuntimeStatusPayload,
} from "../runtime/extension-runtime.js";

const ExtensionCommand = {
  GET_STATUS: "GET_STATUS",
  GET_PRESENTATION_VIEW: "GET_PRESENTATION_VIEW",
} as const;

type HeaderStatus = "Ready" | "Running" | "Completed" | "Partial";

interface SuccessResponse<T> {
  readonly ok: true;
  readonly command: string;
  readonly payload: T;
}

function isSuccessResponse<T>(value: unknown): value is SuccessResponse<T> {
  return (
    value !== null &&
    typeof value === "object" &&
    (value as SuccessResponse<T>).ok === true &&
    "payload" in (value as SuccessResponse<T>)
  );
}

async function sendCommand<T>(command: string): Promise<T | undefined> {
  return new Promise((resolve) => {
    chrome.runtime.sendMessage({ command }, (response: unknown) => {
      if (chrome.runtime.lastError !== undefined) {
        resolve(undefined);
        return;
      }
      if (!isSuccessResponse<T>(response)) {
        resolve(undefined);
        return;
      }
      resolve(response.payload);
    });
  });
}

function deriveHeaderStatus(status: ExtensionRuntimeStatusPayload): HeaderStatus {
  if (status.investigationState === "InProgress") {
    return "Running";
  }
  if (status.investigationState === "Completed") {
    return "Completed";
  }
  if (
    status.investigationState === "CompletedPartial" ||
    status.completionDisposition === "UnknownQualified"
  ) {
    return "Partial";
  }
  return "Ready";
}

function statusClassName(status: HeaderStatus): string {
  switch (status) {
    case "Running":
      return "status-indicator--running";
    case "Completed":
      return "status-indicator--completed";
    case "Partial":
      return "status-indicator--partial";
    default:
      return "status-indicator--ready";
  }
}

function productStatusClass(status: string): string {
  const normalized = status.toLowerCase();
  if (normalized === "detected") {
    return "product-item__status--detected";
  }
  if (normalized === "not detected") {
    return "product-item__status--not-detected";
  }
  return "product-item__status--unknown";
}

function setText(id: string, value: string | undefined, fallback = "—"): void {
  const element = document.getElementById(id);
  if (element !== null) {
    element.textContent = value !== undefined && value.length > 0 ? value : fallback;
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
  setText("store-theme", view.store.theme);
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

async function loadPopup(): Promise<void> {
  const status = await sendCommand<ExtensionRuntimeStatusPayload>(
    ExtensionCommand.GET_STATUS,
  );
  if (status !== undefined) {
    renderHeader(status);
  }

  const view = await sendCommand<ExtensionPresentationViewPayload | undefined>(
    ExtensionCommand.GET_PRESENTATION_VIEW,
  );

  if (view === undefined || view === null) {
    renderEmptyState();
    return;
  }

  renderInvestigationView(view);
}

void loadPopup().catch(() => {
  renderEmptyState();
});
