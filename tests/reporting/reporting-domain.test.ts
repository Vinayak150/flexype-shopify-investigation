import { describe, expect, it } from "vitest";

import { createInvestigationId } from "../../src/investigation/index.js";
import {
  createDetectionResultSet,
  createStoreInformation,
  FlexyPeProductId,
  ThemeAvailability,
} from "../../src/detection/index.js";
import {
  createProductConfiguration,
  ProductConfigurationState,
} from "../../src/configuration/index.js";
import {
  createDiagnosticReport,
  isCoreDiagnosticReportComplete,
  reportRequiresProductConfiguration,
} from "../../src/reporting/index.js";

describe("P-005 Reporting domain contracts", () => {
  it("creates core DiagnosticReport without Product Configuration", () => {
    const investigationId = createInvestigationId("inv-rep-1");
    const report = createDiagnosticReport({
      investigationId,
      storeInformation: createStoreInformation({
        investigationId,
        themeAvailability: ThemeAvailability.Unavailable,
      }),
      detectionResultSet: createDetectionResultSet({
        investigationId,
        results: [],
      }),
    });

    expect(report.productConfiguration).toBeUndefined();
    expect(isCoreDiagnosticReportComplete(report)).toBe(true);
    expect(reportRequiresProductConfiguration(report)).toBe(false);
    expect(Object.isFrozen(report)).toBe(true);
  });

  it("may optionally carry Product Configuration without requiring it", () => {
    const investigationId = createInvestigationId("inv-rep-2");
    const report = createDiagnosticReport({
      investigationId,
      storeInformation: createStoreInformation({
        investigationId,
        themeAvailability: ThemeAvailability.Available,
        themeName: "Dawn",
      }),
      detectionResultSet: createDetectionResultSet({
        investigationId,
        results: [],
      }),
      productConfiguration: [
        createProductConfiguration({
          investigationId,
          productId: FlexyPeProductId.FlexyCart,
          state: ProductConfigurationState.Available,
          readableContent: "opaque-config",
        }),
      ],
    });

    expect(report.productConfiguration).toHaveLength(1);
    expect(isCoreDiagnosticReportComplete(report)).toBe(true);
  });
});
