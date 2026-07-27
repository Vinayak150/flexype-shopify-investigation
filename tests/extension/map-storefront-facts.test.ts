import { describe, expect, it } from "vitest";

import { FlexyPeProductId } from "../../src/detection/catalogs.js";
import { mapStorefrontSnapshotToFacts } from "../../extension/adapters/map-storefront-facts.js";
import { StorefrontPageType } from "../../extension/adapters/store-metadata.js";
import type { StorefrontObservationSnapshot } from "../../extension/adapters/storefront-observation.js";
import { EMPTY_DISABLED_SIGNALS, EMPTY_SHOPIFY_PAGE_SOURCES } from "../../extension/adapters/storefront-observation.js";
import { EvidenceSignalClass } from "../../src/evidence/signal-class.js";

const DEFAULT_STORE_METADATA = Object.freeze({
  pageType: StorefrontPageType.Unknown,
});

function createSnapshot(
  overrides: Partial<StorefrontObservationSnapshot> = {},
): StorefrontObservationSnapshot {
  return Object.freeze({
    kind: "StorefrontObservationSnapshot",
    url: "https://store.example/",
    documentReachable: true,
    metadataReachable: true,
    canTraverse: true,
    canQuery: true,
    scriptUrls: Object.freeze([]),
    stylesheetUrls: Object.freeze([]),
    domIndicators: Object.freeze([]),
    globalObjects: Object.freeze([]),
    metadata: Object.freeze({
      metaTags: Object.freeze([]),
    }),
    themeHints: Object.freeze([]),
    storeMetadata: DEFAULT_STORE_METADATA,
    shopifySources: EMPTY_SHOPIFY_PAGE_SOURCES,
    disabledSignals: EMPTY_DISABLED_SIGNALS,
    ...overrides,
  });
}

describe("mapStorefrontSnapshotToFacts", () => {
  it("maps script URLs into ScriptUrls and LoadedJavaScriptAssets facts", () => {
    const facts = mapStorefrontSnapshotToFacts(
      createSnapshot({
        scriptUrls: Object.freeze(["https://cdn.example.com/flexype-checkout.js"]),
      }),
    );

    const scriptFact = facts.find((fact) => fact.signalClass === EvidenceSignalClass.ScriptUrls);
    const assetFact = facts.find(
      (fact) => fact.signalClass === EvidenceSignalClass.LoadedJavaScriptAssets,
    );

    expect(scriptFact?.sourceRef).toBe(
      "content.scripts.src:https://cdn.example.com/flexype-checkout.js",
    );
    expect(assetFact?.sourceRef).toBe(
      "content.scripts.asset:https://cdn.example.com/flexype-checkout.js",
    );
    expect(scriptFact?.observationSummary).toContain(
      `flexype.product.${FlexyPeProductId.Checkout}`,
    );
    expect(scriptFact?.observationSummary).toContain(
      `flexype.presence.${FlexyPeProductId.Checkout}`,
    );
  });

  it("maps DOM indicators into DomElements and HtmlStructure facts", () => {
    const facts = mapStorefrontSnapshotToFacts(
      createSnapshot({
        domIndicators: Object.freeze([
          Object.freeze({
            tag: "div",
            id: "flexype-checkout-root",
            classes: Object.freeze(["flexype-widget"]),
            dataAttributes: Object.freeze(["data-flexype-checkout=enabled"]),
          }),
        ]),
      }),
    );

    const domFact = facts.find((fact) => fact.signalClass === EvidenceSignalClass.DomElements);
    const htmlFact = facts.find(
      (fact) => fact.signalClass === EvidenceSignalClass.HtmlStructure,
    );

    expect(domFact?.observationSummary).toContain("flexype-checkout-root");
    expect(htmlFact?.observationSummary).toContain("data-flexype-checkout=enabled");
  });

  it("maps global objects and theme assets without inventing detection outcomes", () => {
    const facts = mapStorefrontSnapshotToFacts(
      createSnapshot({
        globalObjects: Object.freeze(["Shopify", "flexype"]),
        stylesheetUrls: Object.freeze(["https://cdn.shopify.com/theme/assets/app.css"]),
        themeHints: Object.freeze(["theme-name:Dawn"]),
      }),
    );

    expect(
      facts.some(
        (fact) =>
          fact.signalClass === EvidenceSignalClass.GlobalBrowserObjects &&
          fact.observationSummary.includes("Shopify"),
      ),
    ).toBe(true);
    expect(
      facts.some(
        (fact) =>
          fact.signalClass === EvidenceSignalClass.GlobalBrowserObjects &&
          fact.observationSummary.includes("flexype"),
      ),
    ).toBe(true);
    expect(
      facts.some(
        (fact) =>
          fact.signalClass === EvidenceSignalClass.ShopifyThemeAssets &&
          fact.observationSummary.includes("store.themeName: Dawn"),
      ),
    ).toBe(true);
  });

  it("adds Checkout markers for FlexyPe SDK script URLs without checkout in the path", () => {
    const sdkUrl = "https://static.flexype.in/scripts/flexype-v2.min.js";
    const facts = mapStorefrontSnapshotToFacts(
      createSnapshot({
        scriptUrls: Object.freeze([sdkUrl]),
      }),
    );

    const scriptFact = facts.find((fact) => fact.signalClass === EvidenceSignalClass.ScriptUrls);
    const assetFact = facts.find(
      (fact) => fact.signalClass === EvidenceSignalClass.LoadedJavaScriptAssets,
    );

    expect(scriptFact?.observationSummary).toContain(
      `flexype.product.${FlexyPeProductId.Checkout}`,
    );
    expect(scriptFact?.observationSummary).toContain(
      `flexype.presence.${FlexyPeProductId.Checkout}`,
    );
    expect(assetFact?.observationSummary).toContain(
      `flexype.product.${FlexyPeProductId.Checkout}`,
    );
    expect(assetFact?.observationSummary).toContain(
      `flexype.presence.${FlexyPeProductId.Checkout}`,
    );
  });

  it("adds Checkout markers for flexy-branded DOM checkout indicators", () => {
    const facts = mapStorefrontSnapshotToFacts(
      createSnapshot({
        domIndicators: Object.freeze([
          Object.freeze({
            tag: "button",
            classes: Object.freeze(["flexy-btn"]),
            dataAttributes: Object.freeze(['data-flexy-type="checkout"']),
          }),
        ]),
      }),
    );

    const domFact = facts.find((fact) => fact.signalClass === EvidenceSignalClass.DomElements);

    expect(domFact?.observationSummary).toContain(
      `flexype.product.${FlexyPeProductId.Checkout}`,
    );
    expect(domFact?.observationSummary).toContain(
      `flexype.presence.${FlexyPeProductId.Checkout}`,
    );
  });

  it("does not add FlexyPe markers for unrelated script URLs", () => {
    const facts = mapStorefrontSnapshotToFacts(
      createSnapshot({
        scriptUrls: Object.freeze(["https://example.com/app.js"]),
      }),
    );

    for (const fact of facts) {
      expect(fact.observationSummary).not.toContain("flexype.product.");
      expect(fact.observationSummary).not.toContain("flexype.presence.");
    }
  });

  it("adds Checkout markers for FlexyPe checkout global objects", () => {
    const facts = mapStorefrontSnapshotToFacts(
      createSnapshot({
        globalObjects: Object.freeze(["openFlexyCheckout", "flexypeMid", "flexypeRegion"]),
      }),
    );

    for (const globalName of ["openFlexyCheckout", "flexypeMid", "flexypeRegion"]) {
      const globalFact = facts.find(
        (fact) =>
          fact.signalClass === EvidenceSignalClass.GlobalBrowserObjects &&
          fact.observationSummary.includes(`global object present: ${globalName}`),
      );
      expect(globalFact?.observationSummary).toContain(
        `flexype.product.${FlexyPeProductId.Checkout}`,
      );
      expect(globalFact?.observationSummary).toContain(
        `flexype.presence.${FlexyPeProductId.Checkout}`,
      );
    }
  });

  it("adds FlexyPass markers for flexypass Shopify extension script URLs", () => {
    const passUrl =
      "https://cdn.shopify.com/extensions/019f60d5-24b0-7f59-a80d-d4147a1a8b3a/flexypass-85/assets/pass.min.js?v=41ea1fe";
    const facts = mapStorefrontSnapshotToFacts(
      createSnapshot({
        scriptUrls: Object.freeze([passUrl]),
      }),
    );

    const scriptFact = facts.find((fact) => fact.signalClass === EvidenceSignalClass.ScriptUrls);
    const assetFact = facts.find(
      (fact) => fact.signalClass === EvidenceSignalClass.LoadedJavaScriptAssets,
    );

    expect(scriptFact?.observationSummary).toContain(
      `flexype.product.${FlexyPeProductId.FlexyPass}`,
    );
    expect(scriptFact?.observationSummary).toContain(
      `flexype.presence.${FlexyPeProductId.FlexyPass}`,
    );
    expect(assetFact?.observationSummary).toContain(
      `flexype.product.${FlexyPeProductId.FlexyPass}`,
    );
    expect(assetFact?.observationSummary).toContain(
      `flexype.presence.${FlexyPeProductId.FlexyPass}`,
    );
  });

  it("adds FlexyPass markers for flexy-pass DOM indicators", () => {
    const facts = mapStorefrontSnapshotToFacts(
      createSnapshot({
        domIndicators: Object.freeze([
          Object.freeze({
            tag: "div",
            id: "flexy-pass-wrapper",
            dataAttributes: Object.freeze(['data-flexy-pass="true"']),
          }),
        ]),
      }),
    );

    const domFact = facts.find((fact) => fact.signalClass === EvidenceSignalClass.DomElements);

    expect(domFact?.observationSummary).toContain(
      `flexype.product.${FlexyPeProductId.FlexyPass}`,
    );
    expect(domFact?.observationSummary).toContain(
      `flexype.presence.${FlexyPeProductId.FlexyPass}`,
    );
  });

  it("does not add FlexyPass markers for unrelated pass script URLs", () => {
    const facts = mapStorefrontSnapshotToFacts(
      createSnapshot({
        scriptUrls: Object.freeze(["https://example.com/random-pass.js"]),
      }),
    );

    for (const fact of facts) {
      expect(fact.observationSummary).not.toContain(
        `flexype.product.${FlexyPeProductId.FlexyPass}`,
      );
      expect(fact.observationSummary).not.toContain(
        `flexype.presence.${FlexyPeProductId.FlexyPass}`,
      );
    }
  });

  it("does not add FlexyPass markers to generic FlexyPe SDK script URLs", () => {
    const facts = mapStorefrontSnapshotToFacts(
      createSnapshot({
        scriptUrls: Object.freeze(["https://static.flexype.in/scripts/flexype-v2.min.js"]),
      }),
    );

    for (const fact of facts) {
      expect(fact.observationSummary).not.toContain(
        `flexype.product.${FlexyPeProductId.FlexyPass}`,
      );
      expect(fact.observationSummary).not.toContain(
        `flexype.presence.${FlexyPeProductId.FlexyPass}`,
      );
    }
  });

  it("maps store metadata into store.* evidence facts", () => {
    const facts = mapStorefrontSnapshotToFacts(
      createSnapshot({
        storeMetadata: Object.freeze({
          pageType: StorefrontPageType.Product,
          storeUrl: "https://demo.myshopify.com/products/test",
          shopName: "Demo Shop",
          baseCurrency: "INR",
          country: "IN",
          locale: "en-IN",
          shopifyDomain: "demo.myshopify.com",
          themeName: "Dawn",
        }),
      }),
    );

    expect(facts.some((fact) => fact.observationSummary === "store.url: https://demo.myshopify.com/products/test")).toBe(true);
    expect(facts.some((fact) => fact.observationSummary === "store.shopName: Demo Shop")).toBe(true);
    expect(facts.some((fact) => fact.observationSummary === "store.baseCurrency: INR")).toBe(true);
    expect(facts.some((fact) => fact.observationSummary === "store.currentPage: Product")).toBe(true);
  });

  it("adds FlexyPass markers for FlexyPass global objects", () => {
    const facts = mapStorefrontSnapshotToFacts(
      createSnapshot({
        globalObjects: Object.freeze([
          "openFlexyPass",
          "flexyPassActive",
          "flexyPassUser",
          "flexyPassNewFlow",
          "flexyPassConsent",
        ]),
      }),
    );

    for (const globalName of [
      "openFlexyPass",
      "flexyPassActive",
      "flexyPassUser",
      "flexyPassNewFlow",
      "flexyPassConsent",
    ]) {
      const globalFact = facts.find(
        (fact) =>
          fact.signalClass === EvidenceSignalClass.GlobalBrowserObjects &&
          fact.observationSummary.includes(`global object present: ${globalName}`),
      );
      expect(globalFact?.observationSummary).toContain(
        `flexype.product.${FlexyPeProductId.FlexyPass}`,
      );
      expect(globalFact?.observationSummary).toContain(
        `flexype.presence.${FlexyPeProductId.FlexyPass}`,
      );
    }
  });

  it("preserves metadata and network context facts", () => {
    const facts = mapStorefrontSnapshotToFacts(
      createSnapshot({
        metadata: Object.freeze({
          title: "Example Store",
          canonicalUrl: "https://store.example/",
          metaTags: Object.freeze([
            Object.freeze({ name: "description", content: "FlexyPe powered checkout" }),
          ]),
        }),
      }),
    );

    expect(
      facts.some(
        (fact) =>
          fact.observationSummary === "store.url: https://store.example/" &&
          fact.signalClass === EvidenceSignalClass.GlobalBrowserObjects,
      ),
    ).toBe(true);
    expect(
      facts.some((fact) => fact.observationSummary.includes("meta description:")),
    ).toBe(true);
    expect(
      facts.some(
        (fact) =>
          fact.signalClass === EvidenceSignalClass.NetworkRequests &&
          fact.observationSummary.includes("public storefront document"),
      ),
    ).toBe(true);
  });

  it("maps HTML comments containing flexype-v2 script to disabled Checkout evidence", () => {
    const comment =
      '<!--\n<script src="https://static.flexype.in/scripts/flexype-v2.min.js">\n</script>\n-->';
    const facts = mapStorefrontSnapshotToFacts(
      createSnapshot({
        disabledSignals: Object.freeze({
          htmlComments: Object.freeze([comment]),
          commentedScripts: Object.freeze([
            "https://static.flexype.in/scripts/flexype-v2.min.js",
          ]),
          hiddenFlexyElements: Object.freeze([]),
          disabledFlexyElements: Object.freeze([]),
        }),
      }),
    );

    const disabledFacts = facts.filter((fact) =>
      fact.observationSummary.includes(`flexype.disabled.${FlexyPeProductId.Checkout}`),
    );

    expect(disabledFacts.length).toBeGreaterThanOrEqual(2);
    expect(
      disabledFacts.some(
        (fact) =>
          fact.signalClass === EvidenceSignalClass.HtmlStructure &&
          fact.observationSummary.includes("commented script"),
      ),
    ).toBe(true);
    expect(
      disabledFacts.some((fact) => fact.signalClass === EvidenceSignalClass.ScriptUrls),
    ).toBe(true);
    expect(
      disabledFacts.every((fact) => !fact.observationSummary.includes("flexype.product.")),
    ).toBe(true);
  });

  it("maps hidden FlexyPass wrapper to disabled FlexyPass evidence", () => {
    const facts = mapStorefrontSnapshotToFacts(
      createSnapshot({
        disabledSignals: Object.freeze({
          htmlComments: Object.freeze([]),
          commentedScripts: Object.freeze([]),
          hiddenFlexyElements: Object.freeze([
            Object.freeze({
              tag: "div",
              id: "flexy-pass-wrapper",
              concealment: "display-none" as const,
            }),
          ]),
          disabledFlexyElements: Object.freeze([]),
        }),
      }),
    );

    const disabledFacts = facts.filter((fact) =>
      fact.observationSummary.includes(`flexype.disabled.${FlexyPeProductId.FlexyPass}`),
    );

    expect(disabledFacts.length).toBeGreaterThanOrEqual(2);
    expect(
      disabledFacts.some(
        (fact) =>
          fact.signalClass === EvidenceSignalClass.DomElements &&
          fact.observationSummary.includes("hidden"),
      ),
    ).toBe(true);
    expect(
      disabledFacts.some((fact) => fact.signalClass === EvidenceSignalClass.HtmlStructure),
    ).toBe(true);
  });

  it("maps disabled FlexyCart button to disabled FlexyCart evidence", () => {
    const facts = mapStorefrontSnapshotToFacts(
      createSnapshot({
        disabledSignals: Object.freeze({
          htmlComments: Object.freeze([]),
          commentedScripts: Object.freeze([]),
          hiddenFlexyElements: Object.freeze([]),
          disabledFlexyElements: Object.freeze([
            Object.freeze({
              tag: "button",
              classes: Object.freeze(["flexy-btn"]),
              dataAttributes: Object.freeze(['data-flexy-type="cart"']),
              concealment: "disabled-attribute" as const,
            }),
          ]),
        }),
      }),
    );

    const disabledFacts = facts.filter((fact) =>
      fact.observationSummary.includes(`flexype.disabled.${FlexyPeProductId.FlexyCart}`),
    );

    expect(disabledFacts.length).toBeGreaterThanOrEqual(2);
    expect(
      disabledFacts.some((fact) =>
        fact.observationSummary.includes("disabled attribute detected"),
      ),
    ).toBe(true);
  });

  it("does not emit FlexyPe disabled evidence for unrelated hidden divs", () => {
    const facts = mapStorefrontSnapshotToFacts(
      createSnapshot({
        disabledSignals: Object.freeze({
          htmlComments: Object.freeze([]),
          commentedScripts: Object.freeze([]),
          hiddenFlexyElements: Object.freeze([
            Object.freeze({
              tag: "div",
              id: "newsletter-popup",
              concealment: "hidden-attribute" as const,
            }),
          ]),
          disabledFlexyElements: Object.freeze([]),
        }),
      }),
    );

    expect(
      facts.some((fact) => fact.observationSummary.includes("flexype.disabled.")),
    ).toBe(false);
  });
});
