import type { StorefrontTarget } from "../investigation/index.js";

/**
 * DOM abstraction ports — observability discovery only (E-004).
 * Allowed: inspect, enumerate, locate, traverse.
 * Forbidden: classify, infer, evaluate, score, detect products, normalize Evidence.
 */

export interface DomTraversalPort {
  canTraverse(target: StorefrontTarget): Promise<boolean>;
}

export interface DomQueryPort {
  canLocateStructures(target: StorefrontTarget): Promise<boolean>;
}

export interface DomDiscoveryPorts {
  readonly traversal: DomTraversalPort;
  readonly query: DomQueryPort;
}

/**
 * In-memory DOM discovery adapter — not product-definition selectors.
 */
export function createMemoryDomPorts(options?: {
  readonly traversalCapable?: boolean;
  readonly queryCapable?: boolean;
}): DomDiscoveryPorts & { readonly accessCount: { value: number } } {
  const accessCount = { value: 0 };
  const traversalCapable = options?.traversalCapable ?? true;
  const queryCapable = options?.queryCapable ?? true;

  return {
    accessCount,
    traversal: {
      async canTraverse() {
        accessCount.value += 1;
        return traversalCapable;
      },
    },
    query: {
      async canLocateStructures() {
        accessCount.value += 1;
        return queryCapable;
      },
    },
  };
}
