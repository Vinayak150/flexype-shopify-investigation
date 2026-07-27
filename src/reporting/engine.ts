import type { InvestigationContext, InvestigationId } from "../investigation/index.js";
import { ReportAssembler } from "./assembler.js";
import type { DiagnosticReport } from "./diagnostic-report.js";
import { ReportingEngineErrorCode, throwReportingError } from "./engine-errors.js";
import type { ReportAssemblyInput } from "./inputs.js";
import { ReportingSession } from "./session.js";

/**
 * Reporting Engine entry point (E-007).
 * Assembles one Diagnostic Report per Investigation from Detection outputs only.
 */
export class ReportingEngine {
  private readonly assembler: ReportAssembler;
  private readonly reports = new Map<InvestigationId, DiagnosticReport>();

  constructor(assembler = new ReportAssembler()) {
    this.assembler = assembler;
  }

  assemble(
    context: InvestigationContext,
    input: ReportAssemblyInput,
    options?: { readonly assembledAtIso?: string },
  ): DiagnosticReport {
    const existing = this.reports.get(context.investigationId);
    if (existing !== undefined) {
      return existing;
    }

    const session = new ReportingSession(context, input, this.assembler);
    session.open();
    session.assemble(options);
    const report = session.seal();
    this.reports.set(context.investigationId, report);
    return report;
  }

  getReport(investigationId: InvestigationId): DiagnosticReport | undefined {
    return this.reports.get(investigationId);
  }

  hasReport(investigationId: InvestigationId): boolean {
    return this.reports.has(investigationId);
  }

  /**
   * Explicit guard: Reporting must not merge multiple Investigation roots.
   */
  rejectMultiRootAggregation(): never {
    throwReportingError(
      ReportingEngineErrorCode.MultiRootForbidden,
      "Reporting forbids multi-Investigation Report aggregation (ADR-001)",
    );
  }
}
