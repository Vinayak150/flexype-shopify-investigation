import type { DetectionResultId } from "../../shared/types/identifiers";
import { OutcomeState } from "../domain/outcome-state";

export interface DetectionResult {
  readonly id: DetectionResultId;
  readonly state: OutcomeState;
  readonly explanation?: string;
}
