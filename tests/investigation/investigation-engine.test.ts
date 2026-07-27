import { describe, expect, it } from "vitest";

import {
  CollaboratorStage,
  CompletionDisposition,
  createCompletionReadiness,
  createInvestigationPackage,
  createStorefrontTarget,
  InvestigationEngineError,
  InvestigationEngineErrorCode,
  InvestigationLifecycle,
  InvestigationState,
  ORCHESTRATION_ORDER,
  resolveCompletionDisposition,
  type CollaboratorPorts,
  type PortStageResult,
} from "../../src/investigation/index.js";

function ok(
  stage: PortStageResult["stage"],
  extra?: Partial<PortStageResult>,
): PortStageResult {
  return Object.freeze({
    stage,
    ok: true,
    ...extra,
  });
}

function createRecordingPorts(
  overrides?: Partial<Record<PortStageResult["stage"], PortStageResult>>,
): { ports: CollaboratorPorts; order: PortStageResult["stage"][] } {
  const order: PortStageResult["stage"][] = [];

  const record =
    (stage: PortStageResult["stage"]) => async (): Promise<PortStageResult> => {
      order.push(stage);
      return (
        overrides?.[stage] ??
        ok(stage, {
          partial: false,
          unknownQualified: false,
        })
      );
    };

  return {
    order,
    ports: {
      observation: { requestAffordance: record(CollaboratorStage.Observation) },
      evidence: { requestAcquisition: record(CollaboratorStage.Evidence) },
      detection: { requestEvaluation: record(CollaboratorStage.Detection) },
      reporting: { requestAssembly: record(CollaboratorStage.Reporting) },
      presentation: {
        requestPreparation: record(CollaboratorStage.Presentation),
      },
    },
  };
}

describe("E-003 Investigation Engine", () => {
  it("creates an Investigation with identity, one Storefront, and InProgress after start", () => {
    const { ports } = createRecordingPorts();
    const pkg = createInvestigationPackage();
    const coordinator = pkg.initialize(ports);

    const context = coordinator.start(
      { kind: "OperatorIntent", label: "support-eng" },
      "https://demo.myshopify.com",
    );

    expect(context.state).toBe(InvestigationState.InProgress);
    expect(context.investigationId).toBeTruthy();
    expect(context.storefrontTarget.storefrontUrl).toBe("https://demo.myshopify.com");
    expect(Object.isFrozen(context)).toBe(true);
    expect(Object.isFrozen(context.storefrontTarget)).toBe(true);
  });

  it("preserves InvestigationId across lifecycle transitions", () => {
    const lifecycle = new InvestigationLifecycle();
    const created = lifecycle.create({
      storefrontTarget: "https://shop.example",
      investigationId: "fixed-inv-id",
    });
    const inProgress = lifecycle.initiate(created);
    const completed = lifecycle.dispose(inProgress, CompletionDisposition.Completed);

    expect(created.investigationId).toBe("fixed-inv-id");
    expect(inProgress.investigationId).toBe(created.investigationId);
    expect(completed.investigationId).toBe(created.investigationId);
    expect(completed.storefrontTarget).toBe(created.storefrontTarget);
  });

  it("starts from NotStarted and allows valid transitions to terminal dispositions", () => {
    const lifecycle = new InvestigationLifecycle();
    const created = lifecycle.create({
      storefrontTarget: createStorefrontTarget("https://a.example"),
    });
    expect(created.state).toBe(InvestigationState.NotStarted);

    const inProgress = lifecycle.initiate(created);
    expect(inProgress.state).toBe(InvestigationState.InProgress);

    const partial = lifecycle.dispose(
      inProgress,
      CompletionDisposition.CompletedPartial,
    );
    expect(partial.state).toBe(InvestigationState.CompletedPartial);
    expect(partial.completionDisposition).toBe(CompletionDisposition.CompletedPartial);
  });

  it("rejects illegal lifecycle transitions", () => {
    const lifecycle = new InvestigationLifecycle();
    const created = lifecycle.create({
      storefrontTarget: "https://b.example",
    });

    expect(() => lifecycle.dispose(created, CompletionDisposition.Completed)).toThrow(
      InvestigationEngineError,
    );

    const inProgress = lifecycle.initiate(created);
    expect(() => lifecycle.initiate(inProgress)).toThrow(/Cannot initiate/);

    const completed = lifecycle.dispose(inProgress, CompletionDisposition.Completed);
    expect(() =>
      lifecycle.dispose(completed, CompletionDisposition.CompletedPartial),
    ).toThrow(InvestigationEngineError);
  });

  it("forbids Storefront rebind on the same Investigation", () => {
    const lifecycle = new InvestigationLifecycle();
    const context = lifecycle.create({
      storefrontTarget: "https://original.example",
    });

    expect(() =>
      lifecycle.assertSameStorefrontBinding(
        context,
        createStorefrontTarget("https://other.example"),
      ),
    ).toThrow(
      expect.objectContaining({
        code: InvestigationEngineErrorCode.StorefrontRebindForbidden,
      }),
    );
  });

  it("represents partial completion without fabricating Completed (ADR-006)", () => {
    const disposition = resolveCompletionDisposition(
      createCompletionReadiness({
        reportReady: true,
        presentationReady: true,
        hasPartialSignals: true,
        hasUnknownQualificationSignals: false,
      }),
    );
    expect(disposition).toBe(CompletionDisposition.CompletedPartial);

    const unknownDisposition = resolveCompletionDisposition(
      createCompletionReadiness({
        reportReady: true,
        presentationReady: true,
        hasPartialSignals: false,
        hasUnknownQualificationSignals: true,
      }),
    );
    expect(unknownDisposition).toBe(CompletionDisposition.UnknownQualified);

    const completed = resolveCompletionDisposition(
      createCompletionReadiness({
        reportReady: true,
        presentationReady: true,
        hasPartialSignals: false,
        hasUnknownQualificationSignals: false,
      }),
    );
    expect(completed).toBe(CompletionDisposition.Completed);
  });

  it("orchestrates stub ports in Observation→Evidence→Detection→Reporting→Presentation order", async () => {
    const { ports, order } = createRecordingPorts();
    const pkg = createInvestigationPackage();
    const coordinator = pkg.initialize(ports);
    const context = coordinator.start(
      { kind: "OperatorIntent" },
      "https://order.example",
    );

    const result = await coordinator.run(context);
    expect(order).toEqual([...ORCHESTRATION_ORDER]);
    expect(result.stageResults.map((stage) => stage.stage)).toEqual([
      ...ORCHESTRATION_ORDER,
    ]);

    const completed = coordinator.complete(result.context, result.readiness);
    expect(completed.state).toBe(InvestigationState.Completed);
    expect(completed.completionDisposition).toBe(CompletionDisposition.Completed);
  });

  it("completes as CompletedPartial when ports signal incompleteness", async () => {
    const { ports } = createRecordingPorts({
      [CollaboratorStage.Detection]: ok(CollaboratorStage.Detection, {
        partial: true,
      }),
    });
    const pkg = createInvestigationPackage();
    const coordinator = pkg.initialize(ports);
    const context = coordinator.start(
      { kind: "OperatorIntent" },
      "https://partial.example",
    );

    const completed = await coordinator.runToCompletion(context);
    expect(completed.completionDisposition).toBe(
      CompletionDisposition.CompletedPartial,
    );
    expect(completed.state).toBe(InvestigationState.CompletedPartial);
  });

  it("keeps context immutable and succeeds without Configuration", async () => {
    const { ports } = createRecordingPorts();
    const pkg = createInvestigationPackage();
    const coordinator = pkg.initialize(ports);
    const context = coordinator.start(
      { kind: "OperatorIntent" },
      "https://cfg-free.example",
    );

    expect(Object.isFrozen(context)).toBe(true);
    const finished = await coordinator.runToCompletion(context);
    expect(Object.isFrozen(finished)).toBe(true);
    expect(finished.investigationId).toBe(context.investigationId);
    // No Configuration import or parameter is required for success.
    expect(pkg.getStatus()).toBe("ready");
  });

  it("supports initialize and shutdown without mutating Storefront", () => {
    const { ports } = createRecordingPorts();
    const pkg = createInvestigationPackage();
    pkg.initialize(ports);
    expect(pkg.getStatus()).toBe("ready");
    pkg.shutdown();
    expect(pkg.getStatus()).toBe("shutdown");
    expect(() => pkg.getCoordinator()).toThrow(InvestigationEngineError);
  });

  it("rejects completion without Report readiness", () => {
    expect(() =>
      resolveCompletionDisposition(
        createCompletionReadiness({
          reportReady: false,
          presentationReady: false,
          hasPartialSignals: false,
          hasUnknownQualificationSignals: false,
        }),
      ),
    ).toThrow(
      expect.objectContaining({
        code: InvestigationEngineErrorCode.CompletionWithoutReadiness,
      }),
    );
  });
});
