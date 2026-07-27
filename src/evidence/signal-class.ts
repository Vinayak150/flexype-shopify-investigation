/**
 * D-013 Evidence Signal Class — assignment-listed collection categories.
 * Do not invent app/feature signal catalogs that close U-001/U-002.
 */
export const EvidenceSignalClass = {
  LoadedJavaScriptAssets: "LoadedJavaScriptAssets",
  ScriptUrls: "ScriptUrls",
  DomElements: "DomElements",
  HtmlStructure: "HtmlStructure",
  GlobalBrowserObjects: "GlobalBrowserObjects",
  NetworkRequests: "NetworkRequests",
  ShopifyThemeAssets: "ShopifyThemeAssets",
} as const;

export type EvidenceSignalClass =
  (typeof EvidenceSignalClass)[keyof typeof EvidenceSignalClass];

export const EVIDENCE_SIGNAL_CLASSES: readonly EvidenceSignalClass[] =
  Object.values(EvidenceSignalClass);

export function isEvidenceSignalClass(value: string): value is EvidenceSignalClass {
  return (EVIDENCE_SIGNAL_CLASSES as readonly string[]).includes(value);
}
