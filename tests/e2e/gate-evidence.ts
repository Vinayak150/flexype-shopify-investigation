/**
 * E-012 / RG-M8 gate evidence pack (verification record — not architecture).
 * Maps suites to VD/T/ADR obligations; residual Open Unknowns remain explicit.
 */

export const CORE_VS_OPTIONAL_STATEMENT =
  "Core Investigation path succeeds without Configuration (FR-026). Configuration and Traceability are optional/non-blocking adjuncts." as const;

export const RESIDUAL_OPEN_UNKNOWNS = [
  "U-001",
  "U-002",
  "U-003",
  "U-004",
  "U-005",
  "U-006",
  "U-007",
  "U-008",
  "U-009",
  "U-010",
] as const;

export const E012_SUITE_MAP = [
  {
    suite: "tests/e2e/pipeline.e2e.test.ts",
    covers: ["S-001–S-009", "VD-003", "VD-008", "T5", "T6"],
  },
  {
    suite: "tests/e2e/partial-unknown.e2e.test.ts",
    covers: ["ADR-006", "VD-004", "VD-005", "VD-006", "VD-007"],
  },
  {
    suite: "tests/e2e/optional-lanes.e2e.test.ts",
    covers: ["FR-026", "VD-006", "VD-008", "VD-009", "EP-011"],
  },
  {
    suite: "tests/e2e/immutability.e2e.test.ts",
    covers: ["ADR-002", "ADR-004", "ADR-005", "VD-004"],
  },
  {
    suite: "tests/e2e/architecture-boundaries.e2e.test.ts",
    covers: ["VD-002", "VD-008", "Package Architecture"],
  },
  {
    suite: "tests/e2e/adr-conformance.e2e.test.ts",
    covers: ["ADR-001", "ADR-002", "ADR-003", "ADR-004", "ADR-005", "ADR-006"],
  },
  {
    suite: "tests/e2e/regression-gates.e2e.test.ts",
    covers: ["T1", "T2", "T3", "T4", "T5", "VD-001–VD-009"],
  },
  {
    suite: "tests/e2e/documentation.e2e.test.ts",
    covers: ["FR-024", "NFR-003", "EV-006"],
  },
] as const;

export const E012_VD_STATUS = {
  "VD-001": "executed-via-traceability-and-gate-map",
  "VD-002": "executed-via-architecture-boundaries",
  "VD-003": "executed-via-pipeline",
  "VD-004": "executed-via-immutability-and-partial",
  "VD-005": "executed-via-partial-unknown-and-adr",
  "VD-006": "executed-via-optional-lanes-and-partial",
  "VD-007": "executed-via-partial-unknown-and-presentation",
  "VD-008": "executed-via-pipeline-and-integration",
  "VD-009": "executed-via-optional-lanes-and-gate-map",
} as const;

export const E012_T_STATUS = {
  T0: "workspace-bootstrap-reconfirmed",
  T1: "domain-contracts-reconfirmed",
  T2: "package-engines-reconfirmed",
  T3: "detection-honesty-reconfirmed",
  T4: "reporting-presentation-reconfirmed",
  T5: "integration-pipeline-reconfirmed",
  T6: "e2e-acceptance-path-executed",
} as const;
