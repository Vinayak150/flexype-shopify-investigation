import { describe, expect, it } from "vitest";

import {
  createInvestigationId,
  createStorefrontTarget,
} from "../../src/investigation/index.js";
import {
  createAgendaItemId,
  createDetectionResult,
  createDetectionResultId,
  DetectionOutcome,
  FlexyPeProductId,
} from "../../src/detection/index.js";
import {
  createPresentationReadyView,
  PresentationSectionId,
  viewAgreesWithReport,
} from "../../src/presentation/index.js";
import { buildMinimalReport } from "../reporting/report-fixtures.js";

describe("P-006 Presentation domain contracts", () => {
  it("Presentation-ready View references Report Detection outcomes without alternate fields", () => {
    const investigationId = createInvestigationId("inv-pres-1");
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
      storefrontTarget: createStorefrontTarget("https://shop.example"),
      results: [result],
    });

    const view = createPresentationReadyView({
      report,
      sectionOrder: [
        PresentationSectionId.PS001_InvestigationSummary,
        PresentationSectionId.PS002_StoreInformation,
        PresentationSectionId.PS003_FlexyPeProducts,
      ],
    });

    expect(view.report.detectionResultSet.results[0]?.outcome).toBe("NotDetected");
    expect(viewAgreesWithReport(view)).toBe(true);
    expect(Object.isFrozen(view)).toBe(true);
  });
});
