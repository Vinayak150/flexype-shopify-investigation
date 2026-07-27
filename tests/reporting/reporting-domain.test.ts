import { describe, expect, it } from "vitest";

import {
  createInvestigationId,
  createStorefrontTarget,
} from "../../src/investigation/index.js";
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
  CompletenessAnnotator,
  createDiagnosticReport,
  createReportMetadata,
  buildReportSections,
  ExplanationAggregator,
  isCoreDiagnosticReportComplete,
  reportRequiresProductConfiguration,
} from "../../src/reporting/index.js";

function assemble(input: {
  readonly investigationId: ReturnType<typeof createInvestigationId>;
  readonly themeAvailability: (typeof ThemeAvailability)[keyof typeof ThemeAvailability];
  readonly themeName?: string;
  readonly withConfig?: boolean;
}) {
  const storeInformation = createStoreInformation({
    investigationId: input.investigationId,
    themeAvailability: input.themeAvailability,
    ...(input.themeName !== undefined ? { themeName: input.themeName } : {}),
  });
  const detectionResultSet = createDetectionResultSet({
    investigationId: input.investigationId,
    results: [],
  });
  const completeness = new CompletenessAnnotator().annotate({
    storeInformation,
    detectionResultSet,
    unknownQualifications: [],
    configurationAbsent: input.withConfig !== true,
  });
  const productConfiguration =
    input.withConfig === true
      ? [
          createProductConfiguration({
            investigationId: input.investigationId,
            productId: FlexyPeProductId.FlexyCart,
            state: ProductConfigurationState.Available,
            readableContent: "opaque-config",
          }),
        ]
      : undefined;

  return createDiagnosticReport({
    investigationId: input.investigationId,
    metadata: createReportMetadata({
      investigationId: input.investigationId,
      storefrontTarget: createStorefrontTarget("https://shop.example"),
      assembledAtIso: "1970-01-01T00:00:00.000Z",
    }),
    storeInformation,
    detectionResultSet,
    unknownQualifications: [],
    explanations: new ExplanationAggregator().aggregate([]),
    sections: buildReportSections({
      storeInformation,
      results: [],
      unknownQualifications: [],
      completenessKind: completeness.completenessKind,
      ...(productConfiguration !== undefined ? { productConfiguration } : {}),
    }),
    completeness,
    ...(productConfiguration !== undefined ? { productConfiguration } : {}),
  });
}

describe("P-005 Reporting domain contracts", () => {
  it("creates core DiagnosticReport without Product Configuration", () => {
    const report = assemble({
      investigationId: createInvestigationId("inv-rep-1"),
      themeAvailability: ThemeAvailability.Unavailable,
    });

    expect(report.productConfiguration).toBeUndefined();
    expect(isCoreDiagnosticReportComplete(report)).toBe(true);
    expect(reportRequiresProductConfiguration(report)).toBe(false);
    expect(Object.isFrozen(report)).toBe(true);
  });

  it("may optionally carry Product Configuration without requiring it", () => {
    const report = assemble({
      investigationId: createInvestigationId("inv-rep-2"),
      themeAvailability: ThemeAvailability.Available,
      themeName: "Dawn",
      withConfig: true,
    });

    expect(report.productConfiguration).toHaveLength(1);
    expect(isCoreDiagnosticReportComplete(report)).toBe(true);
  });
});
