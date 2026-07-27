import type { DetectionEvaluationOutput } from "../src/detection/index.js";
import type { NormalizedEvidence } from "../src/evidence/index.js";
import type { InvestigationContext } from "../src/investigation/index.js";
import type { DiagnosticReport } from "../src/reporting/index.js";
import type { PresentationReadyView } from "../src/presentation/index.js";
import type { ConfigurationSnapshot } from "../src/configuration/index.js";
import {
  createObligationId,
  type ArtifactLineageInput,
  type TraceabilityEngine,
  type TraceExport,
} from "../src/traceability/index.js";

/**
 * Non-blocking Traceability registration hooks (E-011 / RR-008).
 * Failures never alter Investigation outcomes.
 */
export function recordInvestigationTrace(
  engine: TraceabilityEngine | undefined,
  input: {
    readonly context: InvestigationContext;
    readonly evidence?: NormalizedEvidence;
    readonly detection?: DetectionEvaluationOutput;
    readonly report?: DiagnosticReport;
    readonly view?: PresentationReadyView;
    readonly configuration?: ConfigurationSnapshot;
  },
): TraceExport | undefined {
  if (engine === undefined) {
    return undefined;
  }

  try {
    const investigationKey = String(input.context.investigationId);
    const lineage: ArtifactLineageInput = {
      investigationKey,
      evidenceItemKeys: (input.evidence?.items ?? []).map((item) =>
        String(item.evidenceItemId),
      ),
      detectionLinks: (input.detection?.results.results ?? []).map((result) =>
        Object.freeze({
          detectionResultKey: String(result.detectionResultId),
          supportingEvidenceKeys: (result.supportingEvidenceIds ?? []).map((id) =>
            String(id),
          ),
        }),
      ),
      ...(input.report !== undefined
        ? { reportKey: `report:${investigationKey}` }
        : {}),
      ...(input.view !== undefined ? { viewKey: `view:${investigationKey}` } : {}),
      ...(input.configuration !== undefined
        ? {
            configurationSnapshotKey: `cfg:${investigationKey}`,
            configurationElection:
              input.configuration.metadata.sourceKind === "Deferred"
                ? ("deferred" as const)
                : ("pursued" as const),
          }
        : {}),
      obligationIds: [
        createObligationId("ADR-001"),
        createObligationId("ADR-004"),
        createObligationId("ADR-006"),
      ],
      openUnknownIds: (input.detection?.unknownQualifications ?? []).map(
        (qualification) => qualification.domainUnknownId,
      ),
      explanationLinks: (input.detection?.explanations ?? []).map((explanation) =>
        Object.freeze({
          definitionId: explanation.definitionId,
          supportingEvidenceKeys: explanation.supportingEvidenceIds.map((id) =>
            String(id),
          ),
        }),
      ),
      adrIds: ["ADR-001", "ADR-002", "ADR-003", "ADR-004", "ADR-005", "ADR-006"],
      packageRuntimeMaps: [
        { packageId: "P-001", runtimeRoleId: "RR-001" },
        { packageId: "P-002", runtimeRoleId: "RR-002" },
        { packageId: "P-003", runtimeRoleId: "RR-003" },
        { packageId: "P-004", runtimeRoleId: "RR-004" },
        { packageId: "P-005", runtimeRoleId: "RR-005" },
        { packageId: "P-006", runtimeRoleId: "RR-006" },
        { packageId: "P-008", runtimeRoleId: "RR-008" },
      ],
    };

    return engine.tryTrace(lineage).export;
  } catch {
    return undefined;
  }
}
