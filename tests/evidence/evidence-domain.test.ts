import { describe, expect, it } from "vitest";

import { createInvestigationId } from "../../src/investigation/index.js";
import {
  assertNormalizedEvidenceImmutable,
  createEvidenceItem,
  createEvidenceItemId,
  createNormalizedEvidence,
  EvidenceSignalClass,
  validateNormalizedEvidence,
} from "../../src/evidence/index.js";

describe("P-003 Evidence domain contracts", () => {
  it("creates EvidenceItem with preserved identifiers and signal class", () => {
    const investigationId = createInvestigationId("inv-ev-1");
    const evidenceItemId = createEvidenceItemId("ev-1");
    const item = createEvidenceItem({
      evidenceItemId,
      investigationId,
      signalClass: EvidenceSignalClass.ScriptUrls,
      observationSummary: "public script url observed",
    });

    expect(item.evidenceItemId).toBe(evidenceItemId);
    expect(item.investigationId).toBe(investigationId);
    expect(item.signalClass).toBe("ScriptUrls");
  });

  it("NormalizedEvidence is immutable for consumers (ADR-002)", () => {
    const investigationId = createInvestigationId("inv-ev-2");
    const normalized = createNormalizedEvidence({
      investigationId,
      items: [
        createEvidenceItem({
          evidenceItemId: createEvidenceItemId("ev-2"),
          investigationId,
          signalClass: EvidenceSignalClass.DomElements,
          observationSummary: "dom structure observed",
        }),
      ],
    });

    expect(assertNormalizedEvidenceImmutable(normalized)).toBeUndefined();
    expect(validateNormalizedEvidence(normalized)).toBeUndefined();
    expect(() => {
      // @ts-expect-error immutable consumer contract
      normalized.items.push(
        createEvidenceItem({
          evidenceItemId: createEvidenceItemId("ev-x"),
          investigationId,
          signalClass: EvidenceSignalClass.NetworkRequests,
          observationSummary: "should fail",
        }),
      );
    }).toThrow();
  });

  it("rejects invalid signal class structurally", () => {
    const investigationId = createInvestigationId("inv-ev-3");
    const invalid = {
      kind: "NormalizedEvidence" as const,
      investigationId,
      items: [
        {
          kind: "EvidenceItem" as const,
          evidenceItemId: createEvidenceItemId("ev-3"),
          investigationId,
          signalClass: "InventedAppCatalog" as never,
          observationSummary: "invalid",
        },
      ],
    };

    expect(validateNormalizedEvidence(invalid)?.code).toBe("InvalidSignalClass");
  });
});
