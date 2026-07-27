/**
 * Chrome FactSourcePort — maps content-script observations into Evidence facts.
 * Does not evaluate Detection definitions or emit Detection outcomes.
 */
import type { InvestigationContext } from "../../src/investigation/index.js";
import type { ObservationAffordance } from "../../src/observation/index.js";
import type { FactSourcePort } from "../../src/evidence/collector.js";
import { probeStorefrontObservationWithRetry } from "./chrome-dom-adapter.js";
import { mapStorefrontSnapshotToFacts } from "./map-storefront-facts.js";

export function createChromeFactSource(tabId: number): FactSourcePort {
  return Object.freeze({
    async collectFacts(_context: InvestigationContext, affordance: ObservationAffordance) {
      if (!affordance.isPubliclyObservable) {
        return Object.freeze([]);
      }

      const snapshot = await probeStorefrontObservationWithRetry(tabId);
      if (snapshot === undefined) {
        return Object.freeze([]);
      }

      return mapStorefrontSnapshotToFacts(snapshot);
    },
  });
}
