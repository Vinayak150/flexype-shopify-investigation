/**
 * Trace graph vocabulary (E-010).
 * Nodes/links correlate existing artifact and obligation identifiers only.
 * Traceability Matrix (`architecture/03_TRACEABILITY_MATRIX.md`) remains SoT.
 */

export const TraceNodeKind = {
  Investigation: "Investigation",
  EvidenceItem: "EvidenceItem",
  DetectionResult: "DetectionResult",
  DiagnosticReport: "DiagnosticReport",
  PresentationView: "PresentationView",
  ConfigurationSnapshot: "ConfigurationSnapshot",
  Obligation: "Obligation",
  Adr: "Adr",
  Package: "Package",
  RuntimeRole: "RuntimeRole",
  DomainUnknown: "DomainUnknown",
  Explanation: "Explanation",
} as const;

export type TraceNodeKind =
  (typeof TraceNodeKind)[keyof typeof TraceNodeKind];

export const TraceLinkKind = {
  InvestigationOwnsEvidence: "InvestigationOwnsEvidence",
  EvidenceSupportsDetection: "EvidenceSupportsDetection",
  DetectionIncludedInReport: "DetectionIncludedInReport",
  ReportProjectedToView: "ReportProjectedToView",
  ObligationReferencesArtifact: "ObligationReferencesArtifact",
  ExplanationReferencesEvidence: "ExplanationReferencesEvidence",
  ConfigurationElectionRecorded: "ConfigurationElectionRecorded",
  PackageMapsToRuntime: "PackageMapsToRuntime",
  AdrGovernsArtifact: "AdrGovernsArtifact",
  UnknownTrackedOpen: "UnknownTrackedOpen",
} as const;

export type TraceLinkKind =
  (typeof TraceLinkKind)[keyof typeof TraceLinkKind];

export const TraceCompleteness = {
  Empty: "Empty",
  Partial: "Partial",
  EndToEnd: "EndToEnd",
} as const;

export type TraceCompleteness =
  (typeof TraceCompleteness)[keyof typeof TraceCompleteness];

export type TraceNodeId = string & { readonly __brand: "TraceNodeId" };

export function createTraceNodeId(
  kind: TraceNodeKind,
  key: string,
): TraceNodeId {
  const trimmed = key.trim();
  if (trimmed.length === 0) {
    throw new Error("Trace node key must be non-empty");
  }
  return `${kind}:${trimmed}` as TraceNodeId;
}

export interface TraceNode {
  readonly kind: "TraceNode";
  readonly nodeId: TraceNodeId;
  readonly nodeKind: TraceNodeKind;
  /** Opaque artifact / obligation / package key as provided by caller. */
  readonly key: string;
}

export interface TraceLink {
  readonly kind: "TraceLink";
  readonly linkKind: TraceLinkKind;
  readonly from: TraceNodeId;
  readonly to: TraceNodeId;
}

export interface TraceGraph {
  readonly kind: "TraceGraph";
  readonly investigationKey?: string;
  readonly nodes: readonly TraceNode[];
  readonly links: readonly TraceLink[];
  readonly completeness: TraceCompleteness;
  readonly missingLineage: readonly string[];
}

export function createTraceNode(input: {
  readonly nodeKind: TraceNodeKind;
  readonly key: string;
}): TraceNode {
  const key = input.key.trim();
  return Object.freeze({
    kind: "TraceNode",
    nodeId: createTraceNodeId(input.nodeKind, key),
    nodeKind: input.nodeKind,
    key,
  });
}

export function createTraceLink(input: {
  readonly linkKind: TraceLinkKind;
  readonly from: TraceNodeId;
  readonly to: TraceNodeId;
}): TraceLink {
  return Object.freeze({
    kind: "TraceLink",
    linkKind: input.linkKind,
    from: input.from,
    to: input.to,
  });
}

function compareNodes(a: TraceNode, b: TraceNode): number {
  return a.nodeId.localeCompare(b.nodeId);
}

function compareLinks(a: TraceLink, b: TraceLink): number {
  const byKind = a.linkKind.localeCompare(b.linkKind);
  if (byKind !== 0) {
    return byKind;
  }
  const byFrom = a.from.localeCompare(b.from);
  if (byFrom !== 0) {
    return byFrom;
  }
  return a.to.localeCompare(b.to);
}

/**
 * Deterministic graph assembly from recorded nodes/links.
 * Missing lineage is listed; never fabricated.
 */
export function buildTraceGraph(input: {
  readonly investigationKey?: string;
  readonly nodes: readonly TraceNode[];
  readonly links: readonly TraceLink[];
}): TraceGraph {
  const nodeMap = new Map<string, TraceNode>();
  for (const node of input.nodes) {
    nodeMap.set(node.nodeId, node);
  }
  const nodes = Object.freeze([...nodeMap.values()].sort(compareNodes));

  const linkKeys = new Set<string>();
  const links: TraceLink[] = [];
  for (const link of input.links) {
    const key = `${link.linkKind}|${link.from}|${link.to}`;
    if (linkKeys.has(key)) {
      continue;
    }
    linkKeys.add(key);
    links.push(link);
  }
  const sortedLinks = Object.freeze(links.sort(compareLinks));

  const missing = detectMissingLineage(nodes, sortedLinks, input.investigationKey);
  const completeness = deriveCompleteness(nodes, sortedLinks, missing);

  return Object.freeze({
    kind: "TraceGraph",
    ...(input.investigationKey !== undefined
      ? { investigationKey: input.investigationKey }
      : {}),
    nodes,
    links: sortedLinks,
    completeness,
    missingLineage: Object.freeze(missing),
  });
}

function hasKind(nodes: readonly TraceNode[], kind: TraceNodeKind): boolean {
  return nodes.some((node) => node.nodeKind === kind);
}

function hasLinkKind(
  links: readonly TraceLink[],
  kind: TraceLinkKind,
): boolean {
  return links.some((link) => link.linkKind === kind);
}

function detectMissingLineage(
  nodes: readonly TraceNode[],
  links: readonly TraceLink[],
  investigationKey: string | undefined,
): string[] {
  const missing: string[] = [];

  if (investigationKey === undefined && !hasKind(nodes, TraceNodeKind.Investigation)) {
    missing.push("Investigation node absent");
  }

  if (
    hasKind(nodes, TraceNodeKind.EvidenceItem) &&
    !hasLinkKind(links, TraceLinkKind.InvestigationOwnsEvidence)
  ) {
    missing.push("Evidence present without Investigation→Evidence link");
  }

  // Incomplete chain gaps — listed honestly; never fabricate missing nodes/links (ADR-006).
  if (
    hasKind(nodes, TraceNodeKind.EvidenceItem) &&
    !hasKind(nodes, TraceNodeKind.DetectionResult)
  ) {
    missing.push("Evidence present without Detection lineage");
  }

  if (
    hasKind(nodes, TraceNodeKind.DetectionResult) &&
    !hasLinkKind(links, TraceLinkKind.EvidenceSupportsDetection) &&
    !hasKind(nodes, TraceNodeKind.EvidenceItem)
  ) {
    missing.push("Detection present without Evidence→Detection lineage");
  }

  if (
    hasKind(nodes, TraceNodeKind.DetectionResult) &&
    !hasKind(nodes, TraceNodeKind.DiagnosticReport)
  ) {
    missing.push("Detection present without Report lineage");
  }

  if (
    hasKind(nodes, TraceNodeKind.DiagnosticReport) &&
    hasKind(nodes, TraceNodeKind.DetectionResult) &&
    !hasLinkKind(links, TraceLinkKind.DetectionIncludedInReport)
  ) {
    missing.push("Report present without Detection→Report link");
  }

  if (
    hasKind(nodes, TraceNodeKind.DiagnosticReport) &&
    !hasKind(nodes, TraceNodeKind.PresentationView)
  ) {
    missing.push("Report present without View lineage");
  }

  if (
    hasKind(nodes, TraceNodeKind.PresentationView) &&
    hasKind(nodes, TraceNodeKind.DiagnosticReport) &&
    !hasLinkKind(links, TraceLinkKind.ReportProjectedToView)
  ) {
    missing.push("View present without Report→View link");
  }

  return missing.sort((a, b) => a.localeCompare(b));
}

function deriveCompleteness(
  nodes: readonly TraceNode[],
  links: readonly TraceLink[],
  missing: readonly string[],
): TraceCompleteness {
  if (nodes.length === 0 && links.length === 0) {
    return TraceCompleteness.Empty;
  }

  const endToEnd =
    hasKind(nodes, TraceNodeKind.Investigation) &&
    hasKind(nodes, TraceNodeKind.EvidenceItem) &&
    hasKind(nodes, TraceNodeKind.DetectionResult) &&
    hasKind(nodes, TraceNodeKind.DiagnosticReport) &&
    hasKind(nodes, TraceNodeKind.PresentationView) &&
    hasLinkKind(links, TraceLinkKind.InvestigationOwnsEvidence) &&
    hasLinkKind(links, TraceLinkKind.EvidenceSupportsDetection) &&
    hasLinkKind(links, TraceLinkKind.DetectionIncludedInReport) &&
    hasLinkKind(links, TraceLinkKind.ReportProjectedToView) &&
    missing.length === 0;

  return endToEnd ? TraceCompleteness.EndToEnd : TraceCompleteness.Partial;
}
