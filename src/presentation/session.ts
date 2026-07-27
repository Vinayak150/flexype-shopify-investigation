import {
  InvestigationState,
  type InvestigationContext,
} from "../investigation/index.js";
import type { DiagnosticReport } from "../reporting/index.js";
import {
  PresentationEngineErrorCode,
  throwPresentationError,
} from "./engine-errors.js";
import type { PresentationReadyView } from "./presentation-view.js";
import { ViewProjector } from "./projector.js";

export type PresentationSessionStatus = "closed" | "open" | "projected" | "sealed";

/**
 * Presentation session: open → project ViewSections → seal PresentationView.
 */
export class PresentationSession {
  private status: PresentationSessionStatus = "closed";
  private view: PresentationReadyView | undefined;
  private readonly context: InvestigationContext;
  private readonly report: DiagnosticReport;
  private readonly projector: ViewProjector;

  constructor(
    context: InvestigationContext,
    report: DiagnosticReport,
    projector = new ViewProjector(),
  ) {
    if (context.state !== InvestigationState.InProgress) {
      throwPresentationError(
        PresentationEngineErrorCode.InvestigationNotInProgress,
        `Presentation requires InProgress Investigation; got ${context.state}`,
      );
    }
    this.context = context;
    this.report = report;
    this.projector = projector;
  }

  getStatus(): PresentationSessionStatus {
    return this.status;
  }

  open(): void {
    if (this.status !== "closed") {
      throwPresentationError(
        PresentationEngineErrorCode.SessionNotOpen,
        `Cannot open PresentationSession from status ${this.status}`,
      );
    }
    this.status = "open";
  }

  project(): PresentationReadyView {
    if (this.status !== "open") {
      throwPresentationError(
        PresentationEngineErrorCode.SessionNotOpen,
        `project requires open session; got ${this.status}`,
      );
    }
    this.view = this.projector.project(this.context, this.report);
    this.status = "projected";
    return this.view;
  }

  seal(): PresentationReadyView {
    if (this.view === undefined || this.status !== "projected") {
      throwPresentationError(
        PresentationEngineErrorCode.SessionNotOpen,
        "seal requires projection to complete first",
      );
    }
    this.status = "sealed";
    return this.view;
  }
}
