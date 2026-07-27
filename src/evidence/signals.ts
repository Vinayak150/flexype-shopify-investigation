import {
  EvidenceSignalClass,
  EVIDENCE_SIGNAL_CLASSES,
  isEvidenceSignalClass,
  type EvidenceSignalClass as EvidenceSignalClassType,
} from "./signal-class.js";
import { EvidenceEngineErrorCode, throwEvidenceError } from "./engine-errors.js";

/**
 * Classify collected items into approved Evidence Signal Classes only.
 * Must not perform multi-signal fusion or product Detected/Not Detected decisions.
 */
export class SignalClassifier {
  classify(signalClass: string): EvidenceSignalClassType {
    if (!isEvidenceSignalClass(signalClass)) {
      throwEvidenceError(
        EvidenceEngineErrorCode.InvalidEvidenceItem,
        `Signal class not in approved collection catalog: ${signalClass}`,
      );
    }
    return signalClass;
  }

  allApprovedClasses(): readonly EvidenceSignalClassType[] {
    return EVIDENCE_SIGNAL_CLASSES;
  }

  /**
   * Map observation capability flags to candidate collection classes.
   * Discovery mapping only — not Detection definitions.
   */
  classesEnabledByAffordance(capabilities: {
    readonly documentReachable: boolean;
    readonly metadataReachable: boolean;
    readonly traversalCapable: boolean;
    readonly queryCapable: boolean;
  }): readonly EvidenceSignalClassType[] {
    const enabled = new Set<EvidenceSignalClassType>();

    if (capabilities.documentReachable) {
      enabled.add(EvidenceSignalClass.DomElements);
      enabled.add(EvidenceSignalClass.HtmlStructure);
      enabled.add(EvidenceSignalClass.LoadedJavaScriptAssets);
      enabled.add(EvidenceSignalClass.ScriptUrls);
    }
    if (capabilities.metadataReachable) {
      enabled.add(EvidenceSignalClass.GlobalBrowserObjects);
      enabled.add(EvidenceSignalClass.ShopifyThemeAssets);
    }
    if (capabilities.traversalCapable || capabilities.queryCapable) {
      enabled.add(EvidenceSignalClass.DomElements);
      enabled.add(EvidenceSignalClass.HtmlStructure);
    }
    // Network may be unobtainable under U-007; only when document path exists as public context.
    if (capabilities.documentReachable && capabilities.metadataReachable) {
      enabled.add(EvidenceSignalClass.NetworkRequests);
    }

    return EVIDENCE_SIGNAL_CLASSES.filter((signalClass) => enabled.has(signalClass));
  }
}
