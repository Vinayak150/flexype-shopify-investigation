import { describe, expect, it } from "vitest";

import {
  createInvestigationContext,
  createInvestigationId,
  createStorefrontTarget,
  InvestigationState,
} from "../../src/investigation/index.js";
import {
  createObservabilityDescriptors,
  createObservationAffordance,
} from "../../src/observation/index.js";
import {
  createEvidencePackage,
  createEvidenceSet,
  EvidenceEngineError,
  EvidenceEngineErrorCode,
  EvidenceNormalizer,
  EvidenceSignalClass,
} from "../../src/evidence/index.js";

function inProgressContext(id = "inv-ev-engine-1") {
  return createInvestigationContext({
    investigationId: createInvestigationId(id),
    storefrontTarget: createStorefrontTarget("https://demo.myshopify.com"),
    state: InvestigationState.InProgress,
  });
}

function fullAffordance(context: ReturnType<typeof inProgressContext>) {
  return createObservationAffordance({
    investigationId: context.investigationId,
    storefrontTarget: context.storefrontTarget,
    isPubliclyObservable: true,
    descriptors: createObservabilityDescriptors({
      documentReachable: true,
      metadataReachable: true,
      traversalCapable: true,
      queryCapable: true,
    }),
  });
}

function limitedAffordance(context: ReturnType<typeof inProgressContext>) {
  return createObservationAffordance({
    investigationId: context.investigationId,
    storefrontTarget: context.storefrontTarget,
    isPubliclyObservable: false,
    descriptors: createObservabilityDescriptors({
      documentReachable: false,
      metadataReachable: false,
      traversalCapable: false,
      queryCapable: false,
    }),
  });
}

describe("E-005 Evidence Engine", () => {
  it("creates NormalizedEvidence from Observation Affordance", async () => {
    const context = inProgressContext();
    const pkg = createEvidencePackage();
    const coordinator = pkg.initialize({
      resolveAffordance: () => fullAffordance(context),
    });

    const snapshot = await coordinator.acquireAndNormalize(
      context,
      fullAffordance(context),
    );

    expect(snapshot.kind).toBe("NormalizedEvidence");
    expect(snapshot.investigationId).toBe(context.investigationId);
    expect(snapshot.items.length).toBeGreaterThan(0);
    expect(Object.isFrozen(snapshot)).toBe(true);
    expect(Object.isFrozen(snapshot.items)).toBe(true);
  });

  it("preserves provenance on collected EvidenceItems", async () => {
    const context = inProgressContext("inv-ev-prov");
    const pkg = createEvidencePackage();
    const coordinator = pkg.initialize({
      resolveAffordance: () => fullAffordance(context),
    });

    const snapshot = await coordinator.acquireAndNormalize(
      context,
      fullAffordance(context),
    );

    for (const item of snapshot.items) {
      expect(item.provenance.investigationId).toBe(context.investigationId);
      expect(item.provenance.storefrontUrl).toBe(
        context.storefrontTarget.storefrontUrl,
      );
      expect(item.provenance.sourceRef.length).toBeGreaterThan(0);
      expect(Object.isFrozen(item.provenance)).toBe(true);
    }
  });

  it("records missing/unobtainable signal classes without fabricating Evidence", async () => {
    const context = inProgressContext("inv-ev-missing");
    const pkg = createEvidencePackage();
    const coordinator = pkg.initialize({
      resolveAffordance: () => limitedAffordance(context),
    });

    const snapshot = await coordinator.acquireAndNormalize(
      context,
      limitedAffordance(context),
    );

    expect(snapshot.items.length).toBe(0);
    expect(snapshot.unobtainableSignalClasses.length).toBeGreaterThan(0);
    expect(snapshot.unobtainableSignalClasses).toContain(
      EvidenceSignalClass.NetworkRequests,
    );
    expect(JSON.stringify(snapshot)).not.toMatch(
      /"Detected"|"NotDetected"|"DetectionResult"/,
    );
  });

  it("enforces single acquisition — second call does not replace snapshot", async () => {
    const context = inProgressContext("inv-ev-once");
    const pkg = createEvidencePackage();
    const coordinator = pkg.initialize({
      resolveAffordance: () => fullAffordance(context),
    });

    const first = await coordinator.acquireAndNormalize(
      context,
      fullAffordance(context),
    );
    const second = await coordinator.acquireAndNormalize(
      context,
      limitedAffordance(context),
    );

    expect(second).toBe(first);
    expect(second.items.length).toBe(first.items.length);
  });

  it("rejects missing Observation Affordance without inventing facts", async () => {
    const context = inProgressContext("inv-ev-no-aff");
    const pkg = createEvidencePackage();
    const coordinator = pkg.initialize({
      resolveAffordance: () => undefined,
    });

    await expect(
      coordinator.acquireAndNormalize(context, undefined as never),
    ).rejects.toMatchObject({
      code: EvidenceEngineErrorCode.MissingObservationAffordance,
    });
  });

  it("rejects invalid EvidenceItems during normalization", () => {
    const investigationId = createInvestigationId("inv-ev-bad");
    const normalizer = new EvidenceNormalizer();
    const invalidSet = createEvidenceSet({
      investigationId,
      items: [
        {
          kind: "EvidenceItem",
          evidenceItemId: "bad" as never,
          investigationId,
          signalClass: "InventedClass" as never,
          observationSummary: "nope",
          provenance: {
            kind: "EvidenceProvenance",
            investigationId,
            storefrontUrl: "https://x.example",
            sourceRef: "x",
            collectionOrdinal: 1,
          },
        },
      ],
    });

    expect(() => normalizer.normalize(invalidSet)).toThrow(EvidenceEngineError);
  });

  it("fulfills Investigation EvidencePort with immutable snapshot readiness", async () => {
    const context = inProgressContext("inv-ev-port");
    const pkg = createEvidencePackage();
    pkg.initialize({
      resolveAffordance: () => fullAffordance(context),
    });

    const result = await pkg.getEvidencePort().requestAcquisition(context);
    expect(result.stage).toBe("Evidence");
    expect(result.ok).toBe(true);
    expect(pkg.getCoordinator().hasSnapshot(context.investigationId)).toBe(true);
  });

  it("forbids Configuration as Evidence source", () => {
    const pkg = createEvidencePackage();
    const coordinator = pkg.initialize({
      resolveAffordance: () => undefined,
    });

    expect(() => coordinator.rejectConfigurationAsEvidenceSource()).toThrow(
      expect.objectContaining({
        code: EvidenceEngineErrorCode.ConfigurationAsEvidenceForbidden,
      }),
    );
  });

  it("normalizes the same sealed set to identical content", async () => {
    const context = inProgressContext("inv-ev-same");
    const affordance = fullAffordance(context);
    const pkg = createEvidencePackage();
    const coordinator = pkg.initialize({
      resolveAffordance: () => affordance,
    });

    const a = await coordinator.acquireAndNormalize(context, affordance);
    // Force compare by cloning content shape from a second Investigation with same facts.
    const context2 = inProgressContext("inv-ev-same-2");
    const affordance2 = createObservationAffordance({
      investigationId: context2.investigationId,
      storefrontTarget: context2.storefrontTarget,
      isPubliclyObservable: true,
      descriptors: affordance.descriptors,
    });
    const b = await coordinator.acquireAndNormalize(context2, affordance2);

    expect(a.items.map((item) => item.signalClass)).toEqual(
      b.items.map((item) => item.signalClass),
    );
    expect(a.items.map((item) => item.observationSummary)).toEqual(
      b.items.map((item) => item.observationSummary),
    );
    expect(a.unobtainableSignalClasses).toEqual(b.unobtainableSignalClasses);
  });
});
