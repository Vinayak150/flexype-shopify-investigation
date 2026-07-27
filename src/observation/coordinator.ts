import type { InvestigationContext, InvestigationId } from "../investigation/index.js";
import type { BrowserDiscoveryPorts } from "./browser.js";
import type { DomDiscoveryPorts } from "./dom.js";
import { ObservationEngineErrorCode, throwObservationError } from "./errors.js";
import { createObservationContext } from "./observation-context.js";
import type { ObservationAffordance } from "./observation-affordance.js";
import { ObservationSession } from "./session.js";

/**
 * Runs observation lifecycle for one Investigation and emits Affordance (E-004).
 * Must not normalize Evidence, evaluate products, assemble reports, or fetch Configuration.
 */
export class ObservationCoordinator {
  private readonly browser: BrowserDiscoveryPorts;
  private readonly dom: DomDiscoveryPorts;
  /** Cached affordances — second observe does not re-scan (ADR-005). */
  private readonly affordancesByInvestigation = new Map<
    InvestigationId,
    ObservationAffordance
  >();

  constructor(browser: BrowserDiscoveryPorts, dom: DomDiscoveryPorts) {
    this.browser = browser;
    this.dom = dom;
  }

  /**
   * open → discover → emit → close. Single acquisition boundary per InvestigationId.
   */
  async observe(investigation: InvestigationContext): Promise<ObservationAffordance> {
    const cached = this.affordancesByInvestigation.get(investigation.investigationId);
    if (cached !== undefined) {
      return cached;
    }

    const observationContext = createObservationContext(investigation);
    const session = new ObservationSession(observationContext, this.browser, this.dom);

    session.open();
    await session.discover();
    session.emitAffordance();
    const affordance = session.close();

    this.affordancesByInvestigation.set(investigation.investigationId, affordance);
    return affordance;
  }

  clearEpisode(investigationId: InvestigationId): void {
    this.affordancesByInvestigation.delete(investigationId);
  }

  hasObserved(investigationId: InvestigationId): boolean {
    return this.affordancesByInvestigation.has(investigationId);
  }

  assertInitializedPorts(): void {
    if (this.browser === undefined || this.dom === undefined) {
      throwObservationError(
        ObservationEngineErrorCode.PackageNotInitialized,
        "Observation discovery ports are not available",
      );
    }
  }
}
