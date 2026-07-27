# FlexyPe Shopify Investigator
![Tests](https://img.shields.io/badge/tests-150%20passing-success)
![TypeScript](https://img.shields.io/badge/TypeScript-strict-blue)
![Release](https://img.shields.io/badge/release-v1.0.0-blue)
![Architecture](https://img.shields.io/badge/architecture-frozen-purple)

A Chrome Extension architecture for Shopify storefront diagnostics. The system observes public Storefront signals, normalizes immutable Evidence, evaluates approved Detection definitions, and produces explainable Diagnostic Reports for Product Support and Sales engineers.

The design prioritizes honest outcomes—Not Detected, Unknown, and partial completion are first-class states—not fabricated certainty.

---

## Status

| Item | State |
|---|---|
| Release | **Release candidate** (E-013 / RG-M9) |
| Package version | `0.1.0` |
| Execution milestones | **E-001 → E-013 complete** |
| Architecture | **Frozen** (`architecture/`, `adr/`) |
| Core verification | 150/150 tests passing; `release:check` green |

Implementation follows frozen architecture documents. Architecture and ADR files are not edited for coding convenience.

---

## Overview

### Problem

FlexyPe deployments on Shopify require consistent, explainable storefront diagnostics: which FlexyPe products are present, whether integrations are disabled, and what Store Information can be obtained from the public Storefront—without Admin access or invented conclusions.

### Target users

- Product Support engineers investigating merchant storefronts
- Sales engineers validating FlexyPe installation posture
- Engineering reviewers auditing diagnostic methodology

### Investigation workflow

1. An operator starts an **Investigation** bound to one Storefront URL.
2. The pipeline runs Observation → Evidence → Detection → Reporting → Presentation.
3. The system returns a Completion Disposition (`Completed`, `CompletedPartial`, or `UnknownQualified`) with an explainable Diagnostic Report and Presentation-ready View.

One Investigation, one Storefront, one Report, one View (ADR-001).

---

## Quick Demo

Example investigation flow:

1. Open a Shopify storefront.
2. Start an Investigation bound to the storefront URL.
3. Observe publicly available Storefront signals.
4. Normalize collected facts into immutable Evidence.
5. Evaluate approved FlexyPe product definitions against the Evidence snapshot.
6. Generate an explainable Diagnostic Report.
7. View the Presentation-ready result.

---

## Architecture Overview

Core diagnostic pipeline:

```
Investigation
      |
      v
Observation
      |
      v
Evidence
      |
      v
Detection
      |
      v
Reporting
      |
      v
Presentation
```

Optional adjuncts (non-blocking):

```
Configuration  ----->  Reporting  (optional IO-010 adjunct only)
Traceability   ----->  lineage / obligation / explainability records
```

**Hosting vs ownership**

| Layer | Role |
|---|---|
| `extension/` | Composition root (E-011). Wires package engines and ports. Does not own Detection, Evidence, or Report semantics. |
| `src/<package>/` | Package ownership regions (P-001–P-008). Domain meaning lives here. |

Dependency direction is fixed: Investigation → Observation → Evidence → Detection → Reporting → Presentation. Configuration attaches to Reporting only. Traceability records relationships; it does not execute or gate the core path.

---

## Package Ownership

| Package | ID | Path |
|---|---|---|
| Investigation | P-001 | `src/investigation/` |
| Observation | P-002 | `src/observation/` |
| Evidence | P-003 | `src/evidence/` |
| Detection | P-004 | `src/detection/` |
| Reporting | P-005 | `src/reporting/` |
| Presentation | P-006 | `src/presentation/` |
| Configuration | P-007 | `src/configuration/` |
| Traceability | P-008 | `src/traceability/` |

Each package owns a single responsibility. Presentation does not evaluate Evidence. Reporting does not recollect Evidence. Detection does not observe the browser directly for evaluation.

---

## Engineering Highlights

| Principle | Realization |
|---|---|
| Immutable Evidence | Normalized Evidence snapshots are read-only after acquisition (ADR-002). |
| Definition-driven Detection | Outcomes derive from approved definitions against Evidence—not ad hoc heuristics (ADR-003). |
| Explainable Results | Detection Results carry ExplanationReferences linking conclusions to supporting Evidence (ADR-004). |
| Single acquisition boundary | Observation and Evidence run once per Investigation; later stages consume the frozen snapshot (ADR-005). |
| Honest partial / Unknown outcomes | Not Detected and Unknown are valid; Completion Disposition reflects incompleteness (ADR-006). |
| Framework-independent Presentation | Presentation-ready Views are structural projections of the Diagnostic Report—not UI business logic. |
| Optional Configuration | Product Configuration (IO-010) may enrich Reporting; core path succeeds without it (FR-026). |
| Non-blocking Traceability | Lineage and obligation recording never gates Investigation completion. |
| Package boundaries | Strict ownership under `src/<package>/`; composition stays in `extension/`. |

Closed FlexyPe product catalog: **Checkout**, **FlexyPass**, **FlexyCart** (C-011).

---

## Pipeline Explanation

Each stage has a single owner. Responsibilities are not mixed across packages.

### Observation (P-002)

Discovers what can be observed on the public Storefront: document reachability, metadata availability, and traversal/query capability. Produces an **Observation Affordance**—not Detection Results, not Evidence.

### Evidence (P-003)

Collects and normalizes facts from the Affordance into **Normalized Evidence**. Evidence is immutable after normalization. Configuration must never source or contaminate Evidence.

### Detection (P-004)

Evaluates approved definitions against the immutable Evidence snapshot. Emits **Detection Results**, **Store Information**, **Unknown Qualifications**, and **Explanation References**. Does not recollect Evidence or observe the browser for evaluation.

### Reporting (P-005)

Assembles one **Diagnostic Report** per Investigation from Detection outputs. Core Report fields do not require Product Configuration. Unknown Qualifications are preserved, not stripped.

### Presentation (P-006)

Projects a **Presentation-ready View** from the Diagnostic Report. Displays Report content only; does not re-detect, recollect, or alter Detection meanings.

---

## Repository Structure

```
src/
├── investigation/     # P-001 — lifecycle, orchestration ports
├── observation/       # P-002 — Storefront affordance discovery
├── evidence/          # P-003 — collection and normalization
├── detection/         # P-004 — definition-driven evaluation
├── reporting/         # P-005 — Diagnostic Report assembly
├── presentation/      # P-006 — View projection
├── configuration/     # P-007 — optional Reporting adjunct
└── traceability/      # P-008 — lineage and obligation recording

extension/             # Composition root (E-011 wiring)
architecture/          # Frozen architecture baseline (00–13)
adr/                   # ADR-001–ADR-006
implementation/        # Plans, package specs, execution specs (E-001–E-013)
docs/                  # Operator and submission documentation
tests/                 # Unit, integration, e2e, and release verification
tooling/               # Architecture freeze and release structure guards
dist/                  # Generated build output (not authoritative)
```

---

## Setup

**Requirements:** Node.js 22+ (CI uses Node 22)

```bash
npm install
```

### Development commands

```bash
npm run typecheck      # Strict TypeScript
npm run lint           # ESLint
npm run format:check   # Prettier
npm test               # Vitest (150 tests)
npm run build          # Emit to dist/
npm run release:check  # Full release gate
```

| Script | Purpose |
|---|---|
| `npm run format` | Apply Prettier |
| `npm run test:watch` | Vitest watch mode |
| `npm run architecture:freeze` | Guard against accidental `architecture/` / `adr/` edits |
| `npm run release:structure` | Repository structure release guard |

---

## Validation

Current verification status:

| Check | Command |
|---|---|
| TypeScript (strict) | `npm run typecheck` |
| Lint | `npm run lint` |
| Format | `npm run format:check` |
| Tests (150) | `npm test` |
| Build | `npm run build` |
| Release gate | `npm run release:check` |

Test coverage spans package unit tests, E-011 integration, E-012 end-to-end pipeline verification, and E-013 release readiness checks. CI (`.github/workflows/ci.yml`) runs the same verification suite on push and pull request.

Architecture freeze tooling rejects unintended changes to `architecture/` and `adr/` on pull requests.

---

## Documentation

| Path | Purpose |
|---|---|
| `architecture/` | Authoritative frozen system design (`00`–`13`) |
| `adr/` | Approved architectural decisions (ADR-001–ADR-006) |
| `implementation/` | Implementation plans, package specs (`P-001`–`P-008`), execution specs (`E-001`–`E-013`) |
| `docs/` | Operator and submission documentation (FR-024 / NFR-003) |
| `docs/RELEASE_SIGN_OFF.md` | RG-M9 sign-off, Configuration election, Open Unknowns |
| `docs/DOMAIN_VOCABULARY.md` | Domain vocabulary for code contracts |

Canonical entity meanings remain in `architecture/04_DOMAIN_MODEL.md`.

---

## Design Constraints

- **Architecture and ADR documents are frozen.** Changes require a new ADR, not convenience edits.
- **Configuration is optional.** Default runtime election is `deferred` (`NotInScope`). Core Investigation never requires Configuration.
- **Traceability is non-blocking.** Recording failures do not fail the diagnostic pipeline.
- **Unknowns remain explicitly Open.** Domain Unknowns `U-001`–`U-010` are not closed by invention (EP-003).
- **`dist/` is generated output.** It is regenerable and not the design authority.
- **Browser-local core.** Parts 1–3 diagnostics do not require a backend Configuration Runtime for core success.
- **Public Storefront authority.** Core Evidence derives from public observation, not Admin APIs.

---

## Known Limitations

- **Open Unknowns:** `U-001`–`U-010` remain Open where not legitimately resolved (including U-010—no invented performance SLAs).
- **Chrome packaging:** TypeScript composition is verified under `extension/` and `dist/`; Chrome Web Store manifest and popup shell delivery remain packaging work, not re-architecture.
- **Configuration default:** P-007 is implemented; default election remains **deferred** so the core path stays independent.
- **No invented claims:** No SLA, security certification, or backend API architecture is asserted beyond frozen documentation.

---

## Future Work

Conservative delivery items outside the frozen architecture scope:

- Chrome Extension manifest and loadable bundle packaging
- Operator demo workflows against reference storefronts
- Operational deployment and distribution mechanics

These items do not change package ownership or thaw the architecture baseline.

---

## License

MIT — see [LICENSE](LICENSE).
