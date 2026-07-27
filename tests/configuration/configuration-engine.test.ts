import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import {
  createInvestigationContext,
  createInvestigationId,
  createStorefrontTarget,
  InvestigationState,
} from "../../src/investigation/index.js";
import {
  FlexyPeProductId,
  type FlexyPeProductId as FlexyPeProductIdType,
} from "../../src/detection/index.js";
import {
  CONFIGURATION_ELECTION_DEFAULT,
  ConfigurationEngine,
  ConfigurationEngineError,
  ConfigurationEngineErrorCode,
  ConfigurationNormalizer,
  createConfigurationMetadata,
  createConfigurationPackage,
  createDetectedProductHint,
  createMemoryConfigurationRetriever,
  createProductConfiguration,
  ProductConfigurationState,
  rejectDetectionInfluence,
  rejectEvidenceContamination,
  toReportingAdjunct,
  validateConfigurationSnapshot,
} from "../../src/configuration/index.js";

const configurationSrcDir = join(
  dirname(fileURLToPath(import.meta.url)),
  "../../src/configuration",
);

function context(id = "inv-cfg-engine-1") {
  return createInvestigationContext({
    investigationId: createInvestigationId(id),
    storefrontTarget: createStorefrontTarget("https://demo.myshopify.com"),
    state: InvestigationState.InProgress,
  });
}

describe("E-009 Configuration Engine", () => {
  it("defaults election to deferred (optional, non-gating)", () => {
    expect(CONFIGURATION_ELECTION_DEFAULT).toBe("deferred");
    const engine = new ConfigurationEngine();
    expect(engine.getElection()).toBe("deferred");
  });

  it("creates Available configuration via pursued load + memory retriever", async () => {
    const ctx = context("inv-cfg-available");
    const materials = new Map<FlexyPeProductIdType, string>([
      [FlexyPeProductId.Checkout, "checkout.enabled=true"],
    ]);
    const engine = new ConfigurationEngine({
      election: "pursued",
      retriever: createMemoryConfigurationRetriever({
        materialsByProduct: materials,
      }),
    });

    const snapshot = await engine.tryLoad(ctx, [
      createDetectedProductHint(FlexyPeProductId.Checkout),
    ]);

    expect(snapshot.state).toBe(ProductConfigurationState.Available);
    expect(snapshot.items).toHaveLength(1);
    expect(snapshot.items[0]?.readableContent).toBe("checkout.enabled=true");
    expect(snapshot.kind).toBe("ConfigurationSnapshot");
  });

  it("validates Available snapshots and rejects empty Available content", () => {
    const investigationId = createInvestigationId("inv-cfg-validate");
    const valid = createProductConfiguration({
      investigationId,
      productId: FlexyPeProductId.FlexyPass,
      state: ProductConfigurationState.Available,
      readableContent: "pass.mode=strict",
    });
    const snapshot = Object.freeze({
      kind: "ConfigurationSnapshot" as const,
      investigationId,
      state: ProductConfigurationState.Available,
      items: Object.freeze([valid]),
      metadata: createConfigurationMetadata({ sourceKind: "MemoryFixture" }),
    });
    expect(() => validateConfigurationSnapshot(snapshot)).not.toThrow();

    expect(() =>
      new ConfigurationNormalizer().normalize({
        investigationId,
        materials: [
          {
            kind: "RawConfigurationMaterial",
            productId: FlexyPeProductId.Checkout,
            readableContent: "   ",
          },
        ],
        metadata: createConfigurationMetadata({ sourceKind: "MemoryFixture" }),
      }),
    ).toThrow(ConfigurationEngineError);
  });

  it("returns NotInScope when election is deferred", async () => {
    const engine = new ConfigurationEngine({ election: "deferred" });
    const snapshot = await engine.tryLoad(context("inv-cfg-deferred"), [
      createDetectedProductHint(FlexyPeProductId.Checkout),
    ]);

    expect(snapshot.state).toBe(ProductConfigurationState.NotInScope);
    expect(snapshot.items).toHaveLength(0);
    expect(snapshot.metadata.sourceKind).toBe("Deferred");
    expect(engine.asReportingAdjunct(snapshot.investigationId)).toBeUndefined();
  });

  it("returns Unavailable when retriever fails or is missing", async () => {
    const failing = new ConfigurationEngine({
      election: "pursued",
      retriever: createMemoryConfigurationRetriever({
        failWith: "source unreachable",
      }),
    });
    const failed = await failing.tryLoad(context("inv-cfg-fail"), [
      createDetectedProductHint(FlexyPeProductId.FlexyCart),
    ]);
    expect(failed.state).toBe(ProductConfigurationState.Unavailable);
    expect(failed.metadata.note).toContain("source unreachable");

    const missingRetriever = new ConfigurationEngine({ election: "pursued" });
    const unavailable = await missingRetriever.tryLoad(
      context("inv-cfg-no-retriever"),
      [createDetectedProductHint(FlexyPeProductId.Checkout)],
    );
    expect(unavailable.state).toBe(ProductConfigurationState.Unavailable);
  });

  it("rejects invented product ids and maps load failures without throwing", async () => {
    expect(() => createDetectedProductHint("InventedProduct" as never)).toThrowError(
      /closed FlexyPe product ids/,
    );

    const engine = new ConfigurationEngine({
      election: "pursued",
      retriever: {
        async retrieve() {
          throw new Error("transport boom");
        },
      },
    });

    await expect(
      engine.tryLoad(context("inv-cfg-boom"), [
        createDetectedProductHint(FlexyPeProductId.Checkout),
      ]),
    ).resolves.toMatchObject({
      state: ProductConfigurationState.Unavailable,
    });
  });

  it("freezes immutable ConfigurationSnapshot after normalize", async () => {
    const engine = new ConfigurationEngine({
      election: "pursued",
      retriever: createMemoryConfigurationRetriever({
        materialsByProduct: new Map([[FlexyPeProductId.Checkout, "a=1"]]),
      }),
    });
    const snapshot = await engine.tryLoad(context("inv-cfg-immutable"), [
      createDetectedProductHint(FlexyPeProductId.Checkout),
    ]);

    expect(Object.isFrozen(snapshot)).toBe(true);
    expect(Object.isFrozen(snapshot.items)).toBe(true);
    expect(() => {
      (snapshot as { state: string }).state = "Available";
    }).toThrow();
  });

  it("supports optional Reporting adjunct attachment only when Available", async () => {
    const ctx = context("inv-cfg-adjunct");
    const engine = new ConfigurationEngine({
      election: "pursued",
      retriever: createMemoryConfigurationRetriever({
        materialsByProduct: new Map([[FlexyPeProductId.FlexyPass, "pass=on"]]),
      }),
    });
    const snapshot = await engine.tryLoad(ctx, [
      createDetectedProductHint(FlexyPeProductId.FlexyPass),
    ]);

    const adjunct = toReportingAdjunct(snapshot);
    expect(adjunct).toBeDefined();
    expect(adjunct?.[0]?.productId).toBe(FlexyPeProductId.FlexyPass);
    expect(engine.asReportingAdjunct(ctx.investigationId)).toEqual(adjunct);

    const deferred = await new ConfigurationEngine().tryLoad(
      context("inv-cfg-adjunct-none"),
      [],
    );
    expect(toReportingAdjunct(deferred)).toBeUndefined();
  });

  it("does not depend on Evidence modules or accept Evidence inputs", () => {
    const sources = [
      "engine.ts",
      "session.ts",
      "normalizer.ts",
      "retriever.ts",
      "snapshot.ts",
      "package.ts",
      "validation.ts",
    ].map((file) => readFileSync(join(configurationSrcDir, file), "utf8"));

    for (const source of sources) {
      expect(source).not.toMatch(/from ["'].*evidence/);
      expect(source).not.toMatch(/NormalizedEvidence|EvidenceRecord/);
    }

    expect(() => rejectEvidenceContamination()).toThrow(ConfigurationEngineError);
    try {
      rejectEvidenceContamination();
    } catch (error) {
      expect(error).toBeInstanceOf(ConfigurationEngineError);
      expect((error as ConfigurationEngineError).code).toBe(
        ConfigurationEngineErrorCode.EvidenceContaminationForbidden,
      );
    }
  });

  it("does not depend on Detection evaluation or alter Detection outcomes", async () => {
    const sources = [
      "engine.ts",
      "session.ts",
      "normalizer.ts",
      "retriever.ts",
      "snapshot.ts",
    ].map((file) => readFileSync(join(configurationSrcDir, file), "utf8"));

    for (const source of sources) {
      expect(source).not.toMatch(/DetectionResult|DetectionEngine|evaluate/);
    }

    // Hints are configuration-owned identities only — no DetectionResultSet required.
    const engine = new ConfigurationEngine({
      election: "pursued",
      retriever: createMemoryConfigurationRetriever({
        materialsByProduct: new Map([[FlexyPeProductId.Checkout, "ok"]]),
      }),
    });
    const snapshot = await engine.tryLoad(context("inv-cfg-no-detection"), [
      createDetectedProductHint(FlexyPeProductId.Checkout),
    ]);
    expect(snapshot.state).toBe(ProductConfigurationState.Available);

    expect(() => rejectDetectionInfluence()).toThrow(ConfigurationEngineError);
  });

  it("package initialize/shutdown is safe and optional", () => {
    const pkg = createConfigurationPackage();
    expect(pkg.getStatus()).toBe("uninitialized");

    const deferredEngine = pkg.initialize({ election: "deferred" });
    expect(pkg.getStatus()).toBe("ready");
    expect(pkg.getEngine()).toBe(deferredEngine);

    pkg.shutdown();
    expect(pkg.getStatus()).toBe("shutdown");
    expect(() => pkg.initialize()).toThrow(ConfigurationEngineError);
  });

  it("normalizes deterministically for the same materials", () => {
    const investigationId = createInvestigationId("inv-cfg-deterministic");
    const normalizer = new ConfigurationNormalizer();
    const metadata = createConfigurationMetadata({
      sourceKind: "MemoryFixture",
      retrievedAtIso: "1970-01-01T00:00:00.000Z",
    });
    const materials = [
      {
        kind: "RawConfigurationMaterial" as const,
        productId: FlexyPeProductId.FlexyCart,
        readableContent: "cart=1",
      },
      {
        kind: "RawConfigurationMaterial" as const,
        productId: FlexyPeProductId.Checkout,
        readableContent: "checkout=1",
      },
    ];

    const a = normalizer.normalize({ investigationId, materials, metadata });
    const b = normalizer.normalize({
      investigationId,
      materials: [...materials].reverse(),
      metadata,
    });

    expect(a.items.map((item) => item.productId)).toEqual(
      b.items.map((item) => item.productId),
    );
    expect(a.items[0]?.productId).toBe(FlexyPeProductId.Checkout);
  });
});
