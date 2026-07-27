import type { PresentationReadyView } from "../src/presentation/index.js";

/**
 * Popup shell binding — hosts PresentationReadyView only (E-011 / RR-006).
 * Must not call Evidence, Detection, Reporting assembly, or Configuration fetch.
 */
export interface PopupShellBinding {
  readonly kind: "PopupShellBinding";
  readonly view: PresentationReadyView;
}

export function bindPopupShell(view: PresentationReadyView): PopupShellBinding {
  return Object.freeze({
    kind: "PopupShellBinding",
    view,
  });
}
