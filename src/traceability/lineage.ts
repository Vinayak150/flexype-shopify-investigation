import { TraceLinkKind, TraceNodeKind } from "./graph.js";
import type { ObligationId } from "./obligation.js";
import type { TraceRecorder } from "./recorder.js";

/**
 * Structured lineage input from existing upstream artifact identifiers.
 * Missing fields are omitted honestly — never fabricated (ADR-006).
 */
export interface ArtifactLineageInput {
  readonly investigationKey: string;
  readonly evidenceItemKeys?: readonly string[];
  readonly detectionLinks?: readonly {
    readonly detectionResultKey: string;
    readonly supportingEvidenceKeys?: readonly string[];
  }[];
  readonly reportKey?: string;
  readonly viewKey?: string;
  readonly configurationSnapshotKey?: string;
  readonly configurationElection?: "deferred" | "pursued";
  readonly obligationIds?: readonly ObligationId[];
  readonly openUnknownIds?: readonly string[];
  readonly explanationLinks?: readonly {
    readonly definitionId: string;
    readonly supportingEvidenceKeys?: readonly string[];
  }[];
  readonly adrIds?: readonly string[];
  readonly packageRuntimeMaps?: readonly {
    readonly packageId: string;
    readonly runtimeRoleId: string;
  }[];
}

/**
 * Deterministically record artifact lineage onto an append-only recorder.
 */
export function recordArtifactLineage(
  recorder: TraceRecorder,
  input: ArtifactLineageInput,
): void {
  const investigation = recorder.recordNode(
    TraceNodeKind.Investigation,
    input.investigationKey,
  );

  for (const evidenceKey of input.evidenceItemKeys ?? []) {
    const evidence = recorder.recordNode(TraceNodeKind.EvidenceItem, evidenceKey);
    recorder.recordLink(
      TraceLinkKind.InvestigationOwnsEvidence,
      investigation,
      evidence,
    );
  }

  for (const detection of input.detectionLinks ?? []) {
    const detectionNode = recorder.recordNode(
      TraceNodeKind.DetectionResult,
      detection.detectionResultKey,
    );
    for (const evidenceKey of detection.supportingEvidenceKeys ?? []) {
      const evidence = recorder.recordNode(TraceNodeKind.EvidenceItem, evidenceKey);
      recorder.recordLink(
        TraceLinkKind.EvidenceSupportsDetection,
        evidence,
        detectionNode,
      );
    }

    if (input.reportKey !== undefined) {
      const report = recorder.recordNode(
        TraceNodeKind.DiagnosticReport,
        input.reportKey,
      );
      recorder.recordLink(
        TraceLinkKind.DetectionIncludedInReport,
        detectionNode,
        report,
      );
    }
  }

  if (input.reportKey !== undefined && input.viewKey !== undefined) {
    const report = recorder.recordNode(TraceNodeKind.DiagnosticReport, input.reportKey);
    const view = recorder.recordNode(TraceNodeKind.PresentationView, input.viewKey);
    recorder.recordLink(TraceLinkKind.ReportProjectedToView, report, view);
  } else if (input.reportKey !== undefined) {
    recorder.recordNode(TraceNodeKind.DiagnosticReport, input.reportKey);
  }

  if (input.configurationSnapshotKey !== undefined) {
    const config = recorder.recordNode(
      TraceNodeKind.ConfigurationSnapshot,
      input.configurationSnapshotKey,
    );
    recorder.recordLink(
      TraceLinkKind.ConfigurationElectionRecorded,
      investigation,
      config,
    );
    recorder.recordProvenance({
      recordId: `cfg-election:${input.investigationKey}`,
      subjectKey: input.configurationSnapshotKey,
      note: `Configuration election: ${input.configurationElection ?? "unspecified"}`,
    });
  }

  for (const obligationId of input.obligationIds ?? []) {
    recorder.recordObligationReference(
      obligationId,
      TraceNodeKind.Investigation,
      input.investigationKey,
    );
  }

  for (const unknownId of input.openUnknownIds ?? []) {
    const unknown = recorder.recordNode(TraceNodeKind.DomainUnknown, unknownId);
    recorder.recordLink(TraceLinkKind.UnknownTrackedOpen, investigation, unknown);
  }

  for (const explanation of input.explanationLinks ?? []) {
    const explanationNode = recorder.recordNode(
      TraceNodeKind.Explanation,
      explanation.definitionId,
    );
    for (const evidenceKey of explanation.supportingEvidenceKeys ?? []) {
      const evidence = recorder.recordNode(TraceNodeKind.EvidenceItem, evidenceKey);
      recorder.recordLink(
        TraceLinkKind.ExplanationReferencesEvidence,
        explanationNode,
        evidence,
      );
    }
    recorder.recordProvenance({
      recordId: `explanation:${explanation.definitionId}`,
      subjectKey: explanation.definitionId,
      explanationDefinitionIds: [explanation.definitionId],
      supportingEvidenceKeys: explanation.supportingEvidenceKeys ?? [],
      note: "Established ExplanationReference provenance (ADR-004)",
    });
  }

  for (const adrId of input.adrIds ?? []) {
    const adr = recorder.recordNode(TraceNodeKind.Adr, adrId);
    recorder.recordLink(TraceLinkKind.AdrGovernsArtifact, adr, investigation);
  }

  for (const mapping of input.packageRuntimeMaps ?? []) {
    const pkg = recorder.recordNode(TraceNodeKind.Package, mapping.packageId);
    const runtime = recorder.recordNode(
      TraceNodeKind.RuntimeRole,
      mapping.runtimeRoleId,
    );
    recorder.recordLink(TraceLinkKind.PackageMapsToRuntime, pkg, runtime);
  }
}
