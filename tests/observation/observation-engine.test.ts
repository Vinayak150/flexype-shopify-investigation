import { describe, expect, it } from "vitest";

import {
  createInvestigationContext,
  createInvestigationId,
  createStorefrontTarget,
  InvestigationState,
} from "../../src/investigation/index.js";
import {
  createMemoryBrowserPorts,
  createMemoryDomPorts,
  createObservationPackage,
  ObservationEngineError,
  ObservationEngineErrorCode,
  ObservationIncompletenessReason,
  ObservationSession,
  createObservationContext,
} from "../../src/observation/index.js";

function inProgressContext(url = "https://demo.myshopify.com") {
  return createInvestigationContext({
    investigationId: createInvestigationId("inv-obs-engine-1"),
    storefrontTarget: createStorefrontTarget(url),
    state: InvestigationState.InProgress,
  });
}

describe("E-004 Observation Engine", () => {
  it("initializes package and produces ObservationAffordance", async () => {
    const browser = createMemoryBrowserPorts();
    const dom = createMemoryDomPorts();
    const pkg = createObservationPackage();
    const coordinator = pkg.initialize({ browser, dom });

    const affordance = await coordinator.observe(inProgressContext());

    expect(pkg.getStatus()).toBe("ready");
    expect(affordance.kind).toBe("ObservationAffordance");
    expect(affordance.isPubliclyObservable).toBe(true);
    expect(affordance.descriptors.documentReachable).toBe(true);
    expect(Object.isFrozen(affordance)).toBe(true);
    expect(Object.isFrozen(affordance.descriptors)).toBe(true);
  });

  it("binds observation to Investigation Context and rejects NotStarted", () => {
    const notStarted = createInvestigationContext({
      investigationId: createInvestigationId("inv-obs-ns"),
      storefrontTarget: createStorefrontTarget("https://x.example"),
      state: InvestigationState.NotStarted,
    });

    expect(() => createObservationContext(notStarted)).toThrow(ObservationEngineError);
  });

  it("records incompleteness under limited reach without Admin fallback", async () => {
    const browser = createMemoryBrowserPorts({
      documentReachable: false,
      metadataReachable: false,
    });
    const dom = createMemoryDomPorts({ traversalCapable: false });
    const pkg = createObservationPackage();
    const coordinator = pkg.initialize({ browser, dom });

    const affordance = await coordinator.observe(inProgressContext());

    expect(affordance.isPubliclyObservable).toBe(false);
    const reasons = affordance.descriptors.incompletenessMarkers.map(
      (marker) => marker.reason,
    );
    expect(reasons).toContain(ObservationIncompletenessReason.DocumentUnreachable);
    expect(reasons).toContain(ObservationIncompletenessReason.LimitedReach);
    expect(affordance).not.toHaveProperty("outcome");
    expect(JSON.stringify(affordance)).not.toMatch(
      /"Detected"|"NotDetected"|"NormalizedEvidence"/,
    );
  });

  it("enforces single acquisition boundary — second observe does not re-scan", async () => {
    const browser = createMemoryBrowserPorts();
    const dom = createMemoryDomPorts();
    const pkg = createObservationPackage();
    const coordinator = pkg.initialize({ browser, dom });
    const context = inProgressContext("https://once.example");

    const first = await coordinator.observe(context);
    const accessAfterFirst = browser.accessCount.value + dom.accessCount.value;

    const second = await coordinator.observe(context);
    const accessAfterSecond = browser.accessCount.value + dom.accessCount.value;

    expect(second).toBe(first);
    expect(accessAfterSecond).toBe(accessAfterFirst);
    expect(coordinator.hasObserved(context.investigationId)).toBe(true);
  });

  it("session rejects repeated discovery within one pass", async () => {
    const browser = createMemoryBrowserPorts();
    const dom = createMemoryDomPorts();
    const session = new ObservationSession(
      createObservationContext(inProgressContext()),
      browser,
      dom,
    );

    session.open();
    await session.discover();
    await expect(session.discover()).rejects.toMatchObject({
      code: ObservationEngineErrorCode.DiscoveryAlreadyPerformed,
    });
  });

  it("fulfills Investigation ObservationPort with readiness result", async () => {
    const browser = createMemoryBrowserPorts();
    const dom = createMemoryDomPorts();
    const pkg = createObservationPackage();
    pkg.initialize({ browser, dom });

    const result = await pkg
      .getObservationPort()
      .requestAffordance(inProgressContext());

    expect(result.stage).toBe("Observation");
    expect(result.ok).toBe(true);
  });

  it("does not emit Detection or Normalized Evidence fields on affordance", async () => {
    const browser = createMemoryBrowserPorts();
    const dom = createMemoryDomPorts();
    const pkg = createObservationPackage();
    const coordinator = pkg.initialize({ browser, dom });
    const affordance = await coordinator.observe(inProgressContext());

    expect(affordance).not.toHaveProperty("outcome");
    expect(affordance).not.toHaveProperty("detectionResultId");
    expect(affordance).not.toHaveProperty("items");
    expect(affordance.kind).not.toBe("NormalizedEvidence");
  });

  it("supports shutdown without mutating Storefront target", async () => {
    const browser = createMemoryBrowserPorts();
    const dom = createMemoryDomPorts();
    const pkg = createObservationPackage();
    const coordinator = pkg.initialize({ browser, dom });
    const context = inProgressContext();
    await coordinator.observe(context);

    pkg.shutdown();
    expect(pkg.getStatus()).toBe("shutdown");
    expect(context.storefrontTarget.storefrontUrl).toBe("https://demo.myshopify.com");
    expect(() => pkg.getCoordinator()).toThrow(ObservationEngineError);
  });
});
