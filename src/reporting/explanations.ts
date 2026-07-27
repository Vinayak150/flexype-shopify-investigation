import type { ExplanationReference } from "../detection/index.js";

/**
 * Preserve and aggregate Detection ExplanationReferences into the Report (ADR-004).
 * Must not invent Evidence facts or Part 3 reasons.
 */
export class ExplanationAggregator {
  aggregate(
    explanations: readonly ExplanationReference[],
  ): readonly ExplanationReference[] {
    const byDefinition = new Map<string, ExplanationReference>();
    for (const explanation of explanations) {
      if (explanation.kind !== "ExplanationReference") {
        continue;
      }
      // Preserve first occurrence; do not invent replacements.
      if (!byDefinition.has(explanation.definitionId)) {
        byDefinition.set(explanation.definitionId, explanation);
      }
    }
    return Object.freeze(
      [...byDefinition.values()].sort((a, b) =>
        a.definitionId.localeCompare(b.definitionId),
      ),
    );
  }
}
