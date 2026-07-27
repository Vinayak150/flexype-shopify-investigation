import {
  InvestigationState,
  type InvestigationContext,
} from "../investigation/index.js";
import { ReportAssembler } from "./assembler.js";
import type { DiagnosticReport } from "./diagnostic-report.js";
import { ReportingEngineErrorCode, throwReportingError } from "./engine-errors.js";
import type { ReportAssemblyInput } from "./inputs.js";

export type ReportingSessionStatus = "closed" | "open" | "assembled" | "sealed";

/**
 * Assembly session: open → assemble sections/explanations/completeness → seal.
 */
export class ReportingSession {
  private status: ReportingSessionStatus = "closed";
  private report: DiagnosticReport | undefined;
  private readonly context: InvestigationContext;
  private readonly input: ReportAssemblyInput;
  private readonly assembler: ReportAssembler;

  constructor(
    context: InvestigationContext,
    input: ReportAssemblyInput,
    assembler = new ReportAssembler(),
  ) {
    if (context.state !== InvestigationState.InProgress) {
      throwReportingError(
        ReportingEngineErrorCode.InvestigationNotInProgress,
        `Reporting requires InProgress Investigation; got ${context.state}`,
      );
    }
    this.context = context;
    this.input = input;
    this.assembler = assembler;
  }

  getStatus(): ReportingSessionStatus {
    return this.status;
  }

  open(): void {
    if (this.status !== "closed") {
      throwReportingError(
        ReportingEngineErrorCode.SessionNotOpen,
        `Cannot open ReportingSession from status ${this.status}`,
      );
    }
    this.status = "open";
  }

  assemble(options?: { readonly assembledAtIso?: string }): DiagnosticReport {
    if (this.status !== "open") {
      throwReportingError(
        ReportingEngineErrorCode.SessionNotOpen,
        `assemble requires open session; got ${this.status}`,
      );
    }
    this.report = this.assembler.assemble(this.context, this.input, options);
    this.status = "assembled";
    return this.report;
  }

  seal(): DiagnosticReport {
    if (this.report === undefined || this.status !== "assembled") {
      throwReportingError(
        ReportingEngineErrorCode.SessionNotOpen,
        "seal requires assembly to complete first",
      );
    }
    this.status = "sealed";
    return this.report;
  }
}
