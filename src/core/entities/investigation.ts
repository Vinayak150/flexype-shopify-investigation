import type { InvestigationId } from "../../shared/types/identifiers";

export interface Investigation {
  readonly id: InvestigationId;
  readonly storefrontUrl: string;
  readonly createdAt: Date;
}
