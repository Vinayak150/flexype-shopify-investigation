import { isCurrentPageKind, isFlexyPeProductId } from "./catalogs.js";
import type { DetectionResult, DetectionResultSet } from "./detection-result.js";
import type { EvaluationAgenda } from "./evaluation-agenda.js";
import {
  createDetectionContractError,
  type DetectionContractError,
  DetectionContractErrorCode,
} from "./errors.js";
import { isDomainUnknownId } from "./identifiers.js";
import { isDetectionOutcome } from "./outcomes.js";
import type { StoreInformation } from "./store-information.js";
import type { UnknownQualification } from "./unknown-qualification.js";

export function validateUnknownQualification(
  qualification: UnknownQualification,
): DetectionContractError | undefined {
  if (!isDomainUnknownId(qualification.domainUnknownId)) {
    return createDetectionContractError(
      DetectionContractErrorCode.InvalidDomainUnknownId,
      `DomainUnknownId must be one of U-001–U-010; got ${String(qualification.domainUnknownId)}`,
    );
  }
  return undefined;
}

export function validateDetectionResult(
  result: DetectionResult,
): DetectionContractError | undefined {
  if (!isDetectionOutcome(result.outcome)) {
    return createDetectionContractError(
      DetectionContractErrorCode.InvalidDetectionOutcome,
      `Invalid DetectionOutcome: ${String(result.outcome)}`,
    );
  }

  if (
    (result.subject.kind === "FlexyPeProduct" ||
      result.subject.kind === "DisabledIntegration") &&
    !isFlexyPeProductId(result.subject.productId)
  ) {
    return createDetectionContractError(
      DetectionContractErrorCode.InvalidFlexyPeProductId,
      `Invalid FlexyPeProductId: ${String(result.subject.productId)}`,
    );
  }

  if (result.unknownQualification !== undefined) {
    return validateUnknownQualification(result.unknownQualification);
  }

  return undefined;
}

export function validateDetectionResultSet(
  set: DetectionResultSet,
): DetectionContractError | undefined {
  for (const result of set.results) {
    const error = validateDetectionResult(result);
    if (error !== undefined) {
      return error;
    }
  }
  for (const qualification of set.unknownQualifications) {
    const error = validateUnknownQualification(qualification);
    if (error !== undefined) {
      return error;
    }
  }
  return undefined;
}

export function validateStoreInformation(
  info: StoreInformation,
): DetectionContractError | undefined {
  if (info.currentPage !== undefined && !isCurrentPageKind(info.currentPage)) {
    return createDetectionContractError(
      DetectionContractErrorCode.InvalidCurrentPageKind,
      `Invalid CurrentPageKind: ${String(info.currentPage)}`,
    );
  }
  return undefined;
}

export function validateEvaluationAgenda(
  agenda: EvaluationAgenda,
): DetectionContractError | undefined {
  for (const item of agenda.items) {
    if (
      (item.subject.kind === "FlexyPeProduct" ||
        item.subject.kind === "DisabledIntegration") &&
      !isFlexyPeProductId(item.subject.productId)
    ) {
      return createDetectionContractError(
        DetectionContractErrorCode.InvalidFlexyPeProductId,
        `Invalid FlexyPeProductId: ${String(item.subject.productId)}`,
      );
    }
    if (item.unknownQualification !== undefined) {
      const error = validateUnknownQualification(item.unknownQualification);
      if (error !== undefined) {
        return error;
      }
    }
  }
  return undefined;
}

/**
 * Structural serialize/deserialize that must retain Unknown Qualifications.
 */
export function roundTripJson<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}
