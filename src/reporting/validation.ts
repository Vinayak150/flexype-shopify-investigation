import type { DiagnosticReport } from "./diagnostic-report.js";

/**
 * Structural rule: core Report carries Store Information + Detection Results
 * and does not require Product Configuration.
 */
export function isCoreDiagnosticReportComplete(report: DiagnosticReport): boolean {
  return (
    report.kind === "DiagnosticReport" &&
    report.storeInformation.kind === "StoreInformation" &&
    report.detectionResultSet.kind === "DetectionResultSet"
  );
}

export function reportRequiresProductConfiguration(report: DiagnosticReport): false {
  void report;
  return false;
}
