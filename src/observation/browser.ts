import type { StorefrontTarget } from "../investigation/index.js";

/**
 * Browser abstraction ports — discovery of observability only (E-004).
 * Must not interpret page context as FlexyPe Detected/Not Detected.
 */

export interface BrowserPageContext {
  readonly url: string;
  readonly isNavigable: boolean;
  /** Public Storefront authority for core path (EP-006; C-003). */
  readonly isPublicStorefrontContext: boolean;
}

export interface BrowserAccessPort {
  getPageContext(target: StorefrontTarget): Promise<BrowserPageContext>;
}

export interface DocumentAccessPort {
  isDocumentReachable(target: StorefrontTarget): Promise<boolean>;
}

export interface PageMetadataPort {
  isMetadataReachable(target: StorefrontTarget): Promise<boolean>;
}

export interface BrowserDiscoveryPorts {
  readonly browserAccess: BrowserAccessPort;
  readonly documentAccess: DocumentAccessPort;
  readonly pageMetadata: PageMetadataPort;
}

/**
 * In-memory discovery adapter for tests/local tooling — not a Chrome runtime.
 */
export function createMemoryBrowserPorts(options?: {
  readonly isPublicStorefrontContext?: boolean;
  readonly documentReachable?: boolean;
  readonly metadataReachable?: boolean;
}): BrowserDiscoveryPorts & { readonly accessCount: { value: number } } {
  const accessCount = { value: 0 };
  const isPublic = options?.isPublicStorefrontContext ?? true;
  const documentReachable = options?.documentReachable ?? true;
  const metadataReachable = options?.metadataReachable ?? true;

  return {
    accessCount,
    browserAccess: {
      async getPageContext(target) {
        accessCount.value += 1;
        return Object.freeze({
          url: target.storefrontUrl,
          isNavigable: true,
          isPublicStorefrontContext: isPublic,
        });
      },
    },
    documentAccess: {
      async isDocumentReachable() {
        accessCount.value += 1;
        return documentReachable;
      },
    },
    pageMetadata: {
      async isMetadataReachable() {
        accessCount.value += 1;
        return metadataReachable;
      },
    },
  };
}
