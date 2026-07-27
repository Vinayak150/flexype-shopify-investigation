import { describe, expect, it } from "vitest";

import { createInvestigationId } from "../../src/investigation/index.js";
import { FlexyPeProductId } from "../../src/detection/index.js";
import {
  createProductConfiguration,
  ProductConfigurationState,
} from "../../src/configuration/index.js";

describe("P-007 Configuration domain contracts", () => {
  it("models optional ProductConfiguration states including NotInScope", () => {
    const config = createProductConfiguration({
      investigationId: createInvestigationId("inv-cfg-1"),
      productId: FlexyPeProductId.Checkout,
      state: ProductConfigurationState.NotInScope,
    });

    expect(config.state).toBe("NotInScope");
    expect(config.readableContent).toBeUndefined();
    expect(Object.isFrozen(config)).toBe(true);
  });
});
