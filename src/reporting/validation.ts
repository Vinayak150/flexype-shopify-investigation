import type { DiagnosticReport } from "./diagnostic-report.js";

/**
 * Structural rule: core Report carries Store Information + Detection Results
 * and does not require Product Configuration.
 */
export function isCoreDiagnosticReportComplete(report: DiagnosticReport): boolean {
  return (
    report.kind === "DiagnosticReport" &&
    report.storeInformation.kind === "StoreInformation" &&
    report.detectionResultSet.kind === "DetectionResultSet" &&
    report.sections.length > 0 &&
    report.completeness.kind === "ReportCompleteness"
  );
}

export function reportRequiresProductConfiguration(report: DiagnosticReport): false {
  void report;
  return false;
}

export function assertReportImmutable(report: DiagnosticReport): boolean {
  return (
    Object.isFrozen(report) &&
    Object.isFrozen(report.sections) &&
    Object.isFrozen(report.explanations) &&
    Object.isFrozen(report.unknownQualifications)
  );
}
