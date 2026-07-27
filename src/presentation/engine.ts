import type { InvestigationContext, InvestigationId } from "../investigation/index.js";
import type { DiagnosticReport } from "../reporting/index.js";
import type { PresentationReadyView } from "./presentation-view.js";
import { ViewProjector } from "./projector.js";
import { PresentationSession } from "./session.js";

/**
 * Presentation Engine entry point (E-008).
 * Projects one Presentation-ready View from one Diagnostic Report per Investigation.
 */
export class PresentationEngine {
  private readonly projector: ViewProjector;
  private readonly views = new Map<InvestigationId, PresentationReadyView>();

  constructor(projector = new ViewProjector()) {
    this.projector = projector;
  }

  present(
    context: InvestigationContext,
    diagnosticReport: DiagnosticReport,
  ): PresentationReadyView {
    const existing = this.views.get(context.investigationId);
    if (existing !== undefined) {
      return existing;
    }

    const session = new PresentationSession(context, diagnosticReport, this.projector);
    session.open();
    session.project();
    const view = session.seal();
    this.views.set(context.investigationId, view);
    return view;
  }

  getView(investigationId: InvestigationId): PresentationReadyView | undefined {
    return this.views.get(investigationId);
  }

  hasView(investigationId: InvestigationId): boolean {
    return this.views.has(investigationId);
  }
}
