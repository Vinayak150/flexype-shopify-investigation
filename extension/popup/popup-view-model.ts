/**
 * Popup view-model — pure presentation state derivation for extension popup.
 * No messaging, DOM, Detection, or Evidence logic.
 */
import type {
  ExtensionPresentationViewPayload,
  ExtensionRuntimeStatusPayload,
} from "../runtime/extension-runtime.js";

export type HeaderStatus = "Ready" | "Running" | "Completed" | "Partial";

export type PopupDisplayState = "empty" | "running" | "completed" | "partial" | "error";

export function deriveHeaderStatus(
  status: ExtensionRuntimeStatusPayload,
): HeaderStatus {
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

export function statusClassName(status: HeaderStatus): string {
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

export function productStatusClass(status: string): string {
  const normalized = status.toLowerCase();
  if (normalized === "detected") {
    return "product-item__status--detected";
  }
  if (normalized === "not detected") {
    return "product-item__status--not-detected";
  }
  if (normalized === "disabled") {
    return "product-item__status--disabled";
  }
  return "product-item__status--unknown";
}

export function resolvePopupDisplayState(input: {
  readonly running?: boolean;
  readonly error?: string;
  readonly view?: ExtensionPresentationViewPayload | null | undefined;
  readonly status?: ExtensionRuntimeStatusPayload;
}): PopupDisplayState {
  if (input.running === true) {
    return "running";
  }
  if (input.error !== undefined && input.error.length > 0) {
    return "error";
  }
  if (input.view === undefined || input.view === null) {
    return "empty";
  }
  if (input.status !== undefined) {
    const headerStatus = deriveHeaderStatus(input.status);
    if (headerStatus === "Partial") {
      return "partial";
    }
    if (headerStatus === "Completed") {
      return "completed";
    }
  }
  return "completed";
}

export function isExtensionResponse<T>(value: unknown): value is
  | {
      readonly ok: true;
      readonly payload: T;
    }
  | {
      readonly ok: false;
      readonly error: string;
    } {
  return (
    value !== null && typeof value === "object" && "ok" in (value as { ok: boolean })
  );
}

export function parseExtensionResponse<T>(
  response: unknown,
  runtimeError?: string,
):
  | { readonly ok: true; readonly payload: T }
  | { readonly ok: false; readonly error: string } {
  if (runtimeError !== undefined && runtimeError.length > 0) {
    return { ok: false, error: runtimeError };
  }
  if (!isExtensionResponse<T>(response)) {
    return { ok: false, error: "Invalid extension response" };
  }
  if (response.ok) {
    return { ok: true, payload: response.payload };
  }
  return { ok: false, error: response.error };
}
