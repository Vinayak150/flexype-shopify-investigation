import { describe, expect, it } from "vitest";

import { createInvestigationId } from "../../src/investigation/index.js";
import {
  createAgendaItemId,
  createDetectionResult,
  createDetectionResultId,
  createDetectionResultSet,
  createStoreInformation,
  createUnknownQualification,
  DetectionOutcome,
  DOMAIN_UNKNOWN_IDS,
  FLEXYPE_PRODUCT_IDS,
  FlexyPeProductId,
  roundTripJson,
  ThemeAvailability,
  validateDetectionResult,
  validateDetectionResultSet,
  validateUnknownQualification,
} from "../../src/detection/index.js";

describe("P-004 Detection domain contracts", () => {
  it("keeps FlexyPe product catalog closed to three products", () => {
    expect(FLEXYPE_PRODUCT_IDS).toEqual([
      FlexyPeProductId.Checkout,
      FlexyPeProductId.FlexyPass,
      FlexyPeProductId.FlexyCart,
    ]);
  });

  it("accepts NotDetected for insufficient-confidence product outcomes", () => {
    const investigationId = createInvestigationId("inv-det-1");
    const result = createDetectionResult({
      detectionResultId: createDetectionResultId("dr-1"),
      investigationId,
      agendaItemId: createAgendaItemId("ag-1"),
      subject: {
        kind: "FlexyPeProduct",
        productId: FlexyPeProductId.Checkout,
      },
      outcome: DetectionOutcome.NotDetected,
    });

    expect(validateDetectionResult(result)).toBeUndefined();
    expect(result.outcome).toBe("NotDetected");
  });

  it("rejects invented FlexyPe product ids", () => {
    const investigationId = createInvestigationId("inv-det-2");
    const result = createDetectionResult({
      detectionResultId: createDetectionResultId("dr-2"),
      investigationId,
      agendaItemId: createAgendaItemId("ag-2"),
      subject: {
        kind: "FlexyPeProduct",
        productId: "InventedProduct" as never,
      },
      outcome: DetectionOutcome.Detected,
    });

    expect(validateDetectionResult(result)?.code).toBe("InvalidFlexyPeProductId");
  });

  it("rejects DomainUnknownId outside U-001–U-010", () => {
    const qualification = createUnknownQualification({
      domainUnknownId: "U-001",
    });
    expect(validateUnknownQualification(qualification)).toBeUndefined();
    expect(DOMAIN_UNKNOWN_IDS).toHaveLength(10);

    const invalid = {
      kind: "UnknownQualification" as const,
      domainUnknownId: "U-999" as never,
    };
    expect(validateUnknownQualification(invalid)?.code).toBe("InvalidDomainUnknownId");
  });

  it("retains Unknown Qualifications across JSON round-trip", () => {
    const investigationId = createInvestigationId("inv-det-3");
    const qualification = createUnknownQualification({
      domainUnknownId: "U-002",
      agendaItemId: createAgendaItemId("ag-app"),
      note: "third-party method Open",
    });
    const set = createDetectionResultSet({
      investigationId,
      results: [
        createDetectionResult({
          detectionResultId: createDetectionResultId("dr-3"),
          investigationId,
          agendaItemId: createAgendaItemId("ag-app"),
          subject: { kind: "ThirdPartyApp" },
          outcome: DetectionOutcome.Unknown,
          unknownQualification: qualification,
        }),
      ],
      unknownQualifications: [qualification],
    });

    const restored = roundTripJson(set);
    expect(validateDetectionResultSet(restored)).toBeUndefined();
    expect(restored.unknownQualifications).toHaveLength(1);
    expect(restored.unknownQualifications[0]?.domainUnknownId).toBe("U-002");
  });

  it("allows partial Store Information with Unavailable theme", () => {
    const info = createStoreInformation({
      investigationId: createInvestigationId("inv-det-4"),
      themeAvailability: ThemeAvailability.Unavailable,
      shopName: "Demo",
    });

    expect(info.themeName).toBeUndefined();
    expect(info.themeAvailability).toBe("Unavailable");
    expect(Object.isFrozen(info)).toBe(true);
  });
});
