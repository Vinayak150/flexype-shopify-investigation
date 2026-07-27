import { describe, expect, it } from "vitest";

import {
  createInvestigationContext,
  createInvestigationId,
  createStorefrontTarget,
  InvestigationState,
} from "../../src/investigation/index.js";
import {
  createAgendaItemId,
  createDetectionResult,
  createDetectionResultId,
  DetectionOutcome,
  FlexyPeProductId,
} from "../../src/detection/index.js";
import {
  CORE_BEFORE_OPTIONAL_SECTION_ORDER,
  PresentationEngine,
  viewAgreesWithReport,
} from "../../src/presentation/index.js";
import { buildMinimalReport } from "../reporting/report-fixtures.js";

describe("P-006 Presentation domain contracts", () => {
  it("Presentation-ready View references Report Detection outcomes without alternate fields", () => {
    const investigationId = createInvestigationId("inv-pres-1");
    const context = createInvestigationContext({
      investigationId,
      storefrontTarget: createStorefrontTarget("https://shop.example"),
      state: InvestigationState.InProgress,
    });
    const result = createDetectionResult({
      detectionResultId: createDetectionResultId("dr-p1"),
      investigationId,
      agendaItemId: createAgendaItemId("ag-p1"),
      subject: {
        kind: "FlexyPeProduct",
        productId: FlexyPeProductId.FlexyPass,
      },
      outcome: DetectionOutcome.NotDetected,
    });
    const report = buildMinimalReport({
      investigationId,
      storefrontTarget: context.storefrontTarget,
      results: [result],
    });

    const view = new PresentationEngine().present(context, report);

    expect(view.report.detectionResultSet.results[0]?.outcome).toBe("NotDetected");
    expect(view.sectionOrder).toEqual([...CORE_BEFORE_OPTIONAL_SECTION_ORDER]);
    expect(viewAgreesWithReport(view)).toBe(true);
    expect(Object.isFrozen(view)).toBe(true);
  });
});
