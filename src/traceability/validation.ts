import type { TraceGraph } from "./graph.js";
import {
  TraceabilityEngineErrorCode,
  throwTraceabilityError,
} from "./engine-errors.js";

/**
 * Structural validation of TraceGraph — governance assurance only.
 */
export function validateTraceGraph(graph: TraceGraph): void {
  if (graph.kind !== "TraceGraph") {
    throwTraceabilityError(
      TraceabilityEngineErrorCode.InvalidTraceInput,
      "Invalid TraceGraph kind",
    );
  }

  if (!Object.isFrozen(graph) || !Object.isFrozen(graph.nodes) || !Object.isFrozen(graph.links)) {
    throwTraceabilityError(
      TraceabilityEngineErrorCode.InvalidTraceInput,
      "TraceGraph must be immutable",
    );
  }

  const nodeIds = new Set(graph.nodes.map((node) => node.nodeId));
  for (const link of graph.links) {
    if (!nodeIds.has(link.from) || !nodeIds.has(link.to)) {
      throwTraceabilityError(
        TraceabilityEngineErrorCode.InvalidTraceInput,
        `TraceLink references missing node: ${link.from} → ${link.to}`,
      );
    }
  }
}

/**
 * Explicit isolation guard — Traceability must never mutate business artifacts.
 */
export function rejectBusinessArtifactMutation(): never {
  throwTraceabilityError(
    TraceabilityEngineErrorCode.BusinessMutationForbidden,
    "Traceability must never mutate Evidence, Detection Results, Reports, Views, or Configuration",
  );
}
