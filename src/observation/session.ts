import type { InvestigationId } from "../investigation/index.js";
import type { BrowserDiscoveryPorts } from "./browser.js";
import type { DomDiscoveryPorts } from "./dom.js";
import { ObservationEngineErrorCode, throwObservationError } from "./errors.js";
import {
  createIncompletenessMarker,
  ObservationIncompletenessReason,
  type ObservationIncompletenessMarker,
} from "./incompleteness.js";
import type { ObservationContext } from "./observation-context.js";
import {
  createObservabilityDescriptors,
  createObservationAffordance,
  type ObservationAffordance,
  type ObservabilityDescriptors,
} from "./observation-affordance.js";

export type ObservationSessionStatus = "closed" | "open" | "discovered" | "emitted";

export interface DiscoverySnapshot {
  readonly descriptors: ObservabilityDescriptors;
  readonly isPubliclyObservable: boolean;
}

/**
 * Scoped session for one Investigation observation pass (S-002).
 * open → discover/traverse → emit affordance → close.
 * Single discovery pass per session (ADR-005 acquisition boundary support).
 */
export class ObservationSession {
  private status: ObservationSessionStatus = "closed";
  private discovery: DiscoverySnapshot | undefined;
  private affordance: ObservationAffordance | undefined;
  private readonly observationContext: ObservationContext;
  private readonly browser: BrowserDiscoveryPorts;
  private readonly dom: DomDiscoveryPorts;

  constructor(
    observationContext: ObservationContext,
    browser: BrowserDiscoveryPorts,
    dom: DomDiscoveryPorts,
  ) {
    this.observationContext = observationContext;
    this.browser = browser;
    this.dom = dom;
  }

  getInvestigationId(): InvestigationId {
    return this.observationContext.investigation.investigationId;
  }

  getStatus(): ObservationSessionStatus {
    return this.status;
  }

  open(): void {
    if (this.status !== "closed") {
      throwObservationError(
        ObservationEngineErrorCode.SessionNotOpen,
        `Cannot open ObservationSession from status ${this.status}`,
      );
    }
    this.status = "open";
  }

  /**
   * Discover observability once. Does not classify products or normalize Evidence.
   */
  async discover(): Promise<DiscoverySnapshot> {
    if (this.discovery !== undefined) {
      throwObservationError(
        ObservationEngineErrorCode.DiscoveryAlreadyPerformed,
        "Observation discovery already performed for this session (single acquisition boundary)",
      );
    }
    if (this.status !== "open") {
      throwObservationError(
        ObservationEngineErrorCode.SessionNotOpen,
        `discover requires open session; got ${this.status}`,
      );
    }

    const target = this.observationContext.investigation.storefrontTarget;
    const page = await this.browser.browserAccess.getPageContext(target);
    const documentReachable =
      await this.browser.documentAccess.isDocumentReachable(target);
    const metadataReachable =
      await this.browser.pageMetadata.isMetadataReachable(target);
    const traversalCapable = await this.dom.traversal.canTraverse(target);
    const queryCapable = await this.dom.query.canLocateStructures(target);

    const markers: ObservationIncompletenessMarker[] = [];
    if (!page.isPublicStorefrontContext) {
      markers.push(
        createIncompletenessMarker(
          ObservationIncompletenessReason.NonPublicContext,
          "Core observation requires public Storefront authority",
        ),
      );
    }
    if (!documentReachable) {
      markers.push(
        createIncompletenessMarker(ObservationIncompletenessReason.DocumentUnreachable),
      );
    }
    if (!metadataReachable) {
      markers.push(
        createIncompletenessMarker(ObservationIncompletenessReason.MetadataUnreachable),
      );
    }
    if (!traversalCapable) {
      markers.push(
        createIncompletenessMarker(
          ObservationIncompletenessReason.TraversalUnavailable,
        ),
      );
    }
    if (!queryCapable) {
      markers.push(
        createIncompletenessMarker(ObservationIncompletenessReason.QueryUnavailable),
      );
    }
    if (markers.length > 0) {
      markers.push(
        createIncompletenessMarker(
          ObservationIncompletenessReason.LimitedReach,
          "Incomplete observation reach; no privileged backend substitute (U-007)",
        ),
      );
    }

    const isPubliclyObservable =
      page.isPublicStorefrontContext && documentReachable && page.isNavigable;

    const snapshot: DiscoverySnapshot = Object.freeze({
      isPubliclyObservable,
      descriptors: createObservabilityDescriptors({
        documentReachable,
        metadataReachable,
        traversalCapable,
        queryCapable,
        incompletenessMarkers: markers,
      }),
    });

    this.discovery = snapshot;
    this.status = "discovered";
    return snapshot;
  }

  emitAffordance(): ObservationAffordance {
    if (this.discovery === undefined || this.status !== "discovered") {
      throwObservationError(
        ObservationEngineErrorCode.SessionNotOpen,
        "emitAffordance requires discovery to complete first",
      );
    }

    const affordance = createObservationAffordance({
      investigationId: this.observationContext.investigation.investigationId,
      storefrontTarget: this.observationContext.investigation.storefrontTarget,
      isPubliclyObservable: this.discovery.isPubliclyObservable,
      descriptors: this.discovery.descriptors,
    });
    this.affordance = affordance;
    this.status = "emitted";
    return affordance;
  }

  close(): ObservationAffordance {
    if (this.affordance === undefined) {
      throwObservationError(
        ObservationEngineErrorCode.SessionAlreadyClosed,
        "Cannot close ObservationSession before affordance emission",
      );
    }
    const result = this.affordance;
    this.status = "closed";
    return result;
  }

  getEmittedAffordance(): ObservationAffordance | undefined {
    return this.affordance;
  }
}
