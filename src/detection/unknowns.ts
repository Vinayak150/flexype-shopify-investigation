import type { EvaluationAgenda } from "./evaluation-agenda.js";
import type { DetectionResult } from "./detection-result.js";
import {
  createUnknownQualification,
  type UnknownQualification,
} from "./unknown-qualification.js";
import { isDomainUnknownId } from "./identifiers.js";
import { DetectionEngineErrorCode, throwDetectionError } from "./engine-errors.js";

/**
 * Emit IO-008 Unknown Qualifications for Open Domain Unknowns.
 * Only approved U-* IDs; do not invent closed catalogs.
 */
export class UnknownQualifier {
  collectFromAgenda(agenda: EvaluationAgenda): UnknownQualification[] {
    const qualifications: UnknownQualification[] = [];
    for (const item of agenda.items) {
      if (item.unknownQualification !== undefined) {
        this.assertApproved(item.unknownQualification);
        qualifications.push(item.unknownQualification);
      }
    }
    return qualifications;
  }

  collectFromResults(results: readonly DetectionResult[]): UnknownQualification[] {
    const qualifications: UnknownQualification[] = [];
    for (const result of results) {
      if (result.unknownQualification !== undefined) {
        this.assertApproved(result.unknownQualification);
        qualifications.push(result.unknownQualification);
      }
    }
    return qualifications;
  }

  merge(
    ...groups: readonly (readonly UnknownQualification[])[]
  ): readonly UnknownQualification[] {
    const byKey = new Map<string, UnknownQualification>();
    for (const group of groups) {
      for (const qualification of group) {
        this.assertApproved(qualification);
        const key = `${qualification.domainUnknownId}:${String(qualification.agendaItemId ?? "")}`;
        byKey.set(key, qualification);
      }
    }
    return Object.freeze([...byKey.values()]);
  }

  qualifyOpenUnknown(input: {
    readonly domainUnknownId: "U-001" | "U-002";
    readonly agendaItemId?: string;
    readonly note?: string;
  }): UnknownQualification {
    return createUnknownQualification({
      domainUnknownId: input.domainUnknownId,
      ...(input.agendaItemId !== undefined
        ? {
            agendaItemId: input.agendaItemId as never,
          }
        : {}),
      ...(input.note !== undefined ? { note: input.note } : {}),
    });
  }

  private assertApproved(qualification: UnknownQualification): void {
    if (!isDomainUnknownId(qualification.domainUnknownId)) {
      throwDetectionError(
        DetectionEngineErrorCode.InvalidProductCatalog,
        `Unknown Qualification must use approved U-* ids; got ${qualification.domainUnknownId}`,
      );
    }
  }
}
