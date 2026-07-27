# 01 — Repository Structure

**Status:** Active — Implementation Phase  
**Document type:** Repository organization design (not architecture; not APIs; not code)  
**Depends on:** [`implementation/00_IMPLEMENTATION_PLAN.md`](00_IMPLEMENTATION_PLAN.md); frozen `architecture/00`–`13`; ADR-001–ADR-006

This document defines the **physical repository organization** that hosts the approved architecture. It does not redesign packages, invent responsibilities, or prescribe implementation logic.

---

## 1. Purpose

Establish a single, version-controlled repository layout so that:

- Frozen architecture and ADRs remain clearly separated from mutable source  
- Logical packages (`P-001`–`P-008`) map to ownership-aligned source regions  
- Runtime hosting concerns remain distinguishable from logical package ownership  
- Tests, tooling, assets, submission docs, and generated outputs do not blur architectural boundaries  

Source code reflects architecture; architecture does not chase repository convenience.

---

## 2. Scope

### In scope

- Top-level directory set and the purpose of each  
- Separation of architecture, ADRs, implementation planning, production source, tests, operator/submission documentation, assets, tooling, and generated outputs  
- Repository-level mapping of logical package ownership and dependency direction  
- Naming conventions for directories and package regions  
- Repository governance aligned with the Architectural Freeze Policy  

### Out of scope

- Code, interfaces, classes, functions, algorithms, or implementation logic  
- Manifest schemas, messaging protocols, or browser API inventories  
- Detailed nested source trees beyond package-ownership regions  
- Redesign of Package, Extension, UI, Detection, or Testing architecture  
- Closing Open Unknowns by inventing assignment answers  

---

## 3. Repository Philosophy

Derived from approved architecture and [`00_IMPLEMENTATION_PLAN`](00_IMPLEMENTATION_PLAN.md)—not new architectural decisions:

| Principle | Meaning |
|---|---|
| **Architecture documentation remains immutable** | `architecture/` and approved `adr/` contents are frozen; implementation does not rewrite them for coding convenience |
| **Source reflects—not defines—architecture** | `src/` realizes `P-*` / `R-*` ownership; it does not invent new packages or reverse dependencies |
| **Dependencies follow architectural direction only** | Repository import/layout discipline mirrors Investigation → Observation → Evidence → Detection → Reporting → Presentation |
| **Tests are separated from production code** | Verification lives under `tests/`, not inside package production trees |
| **Generated files are never manually maintained** | Build outputs are disposable and regenerable |
| **Build tooling is isolated** | Tooling configuration and scripts do not become domain packages |
| **Documentation is version-controlled** | Architecture, ADRs, implementation plans, and submission docs live in-repo under clear roots |
| **Optional stays optional** | Configuration package region must not become required for core layout or core build success |
| **One ownership home** | Each logical package has one primary source region; Presentation does not own Detection, etc. |

---

## 4. Top-Level Repository Organization

```
flexype-shopify-investigator/
├── architecture/          # Frozen architecture baseline (00–13)
├── adr/                   # Architecture Decision Records (approved + future)
├── implementation/        # Implementation planning documents
├── src/                   # Production source by logical package ownership
├── extension/             # Chrome Extension delivery shell (runtime hosting)
├── tests/                 # Verification artifacts (separated from production)
├── docs/                  # Operator / submission documentation (FR-024)
├── assets/                # Static non-code assets
├── tooling/               # Build, lint, and workspace tooling (isolated)
├── dist/                  # Generated build outputs (not manually maintained)
└── <root config>          # Minimal root-level project/tool manifests only
```

Existing roots `architecture/`, `adr/`, and `implementation/` are authoritative and retained. Remaining roots are introduced to host implementation without altering package meaning.

---

## 5. Directory Responsibilities

| Directory | Responsibility | Must not become |
|---|---|---|
| **`architecture/`** | Authoritative frozen architecture documents (`00`–`13`) | Working notes; code dump; mutable design scratchpad |
| **`adr/`** | Accepted architectural decisions (ADR-001–ADR-006) and future ADRs | Edited rewrite of approved ADRs; implementation diaries |
| **`implementation/`** | How architecture will be / is being implemented (plans, repo structure, subsequent planning docs) | Redesign of Domain/System/Package architecture |
| **`src/`** | Production realization of logical packages `P-001`–`P-008` | Architecture SoT; test suites; generated bundles |
| **`extension/`** | Delivery shell that hosts runtime roles (`RR-*`) without changing package ownership | Second Detection/Reporting implementation; UI evaluation logic |
| **`tests/`** | Verification aligned to Testing Strategy domains (`VD-*`) and milestone checkpoints | Production package ownership; architecture rewrite |
| **`docs/`** | Human-facing submission / usage documentation obligations (FR-024; NFR-003) | Architecture SoT (that remains in `architecture/`) |
| **`assets/`** | Icons, images, and other static non-code materials | Source of Detection definitions; Evidence authority |
| **`tooling/`** | Build/lint/workspace helpers isolated from domain packages | Domain logic; Evidence/Detection ownership |
| **`dist/`** | Generated loadable/packaged outputs | Manually edited source of truth |

Root-level config files may exist only to bind the workspace to tooling. They do not constitute logical packages.

---

## 6. Package Ownership

Logical packages remain as defined in `09_PACKAGE_ARCHITECTURE`. The repository gives each package **one primary ownership region** under `src/`.

| Logical package | ID | Primary `src/` region | Notes |
|---|---|---|---|
| Investigation Package | P-001 | `src/investigation/` | Owns Investigation Context and Completion Disposition coordination |
| Observation Package | P-002 | `src/observation/` | Owns Storefront observation affordance |
| Evidence Package | P-003 | `src/evidence/` | Owns collection and Normalized Evidence production |
| Detection Package | P-004 | `src/detection/` | Owns Evaluation Agenda, Store Information, Detection Results, Unknown Qualification emission |
| Reporting Package | P-005 | `src/reporting/` | Owns Diagnostic Report assembly |
| Presentation Package | P-006 | `src/presentation/` | Owns Presentation-ready View preparation only |
| Configuration Package (optional) | P-007 | `src/configuration/` | Optional adjunct; never required for core path layout or success |
| Traceability Package | P-008 | `src/traceability/` | Cross-cutting compliance/reference discipline; non-blocking |

### Runtime hosting vs package ownership

| Runtime role | Hosts package(s) | Repository placement |
|---|---|---|
| RR-001 Extension Coordinator | P-001 | Logic in `src/investigation/`; coordination entrypoints may be wired from `extension/` |
| RR-002 Storefront Runtime | P-002 | Logic in `src/observation/`; storefront-adjacent hosting in `extension/` |
| RR-003 Evidence Runtime | P-003 | Logic in `src/evidence/`; hosting wire-up in `extension/` |
| RR-004 Detection Runtime | P-004 | Logic in `src/detection/` |
| RR-005 Reporting Runtime | P-005 | Logic in `src/reporting/` |
| RR-006 Presentation Runtime | P-006 | Logic in `src/presentation/`; operator surface shell in `extension/` |
| Optional Configuration Runtime | P-007 | Logic in `src/configuration/` only if bonus elected |

**Rule:** `extension/` hosts and wires; `src/<package>/` owns meaning. Hosting must not absorb another package’s must-never-own set (Extension Architecture ownership boundary).

---

## 7. Dependency Direction

Repository dependency direction **must** match Package Architecture collaboration:

```
src/investigation
  → src/observation
      → src/evidence
          → src/detection
              → src/reporting
                  → src/presentation

src/configuration (optional) → src/reporting   [adjunct only]

src/traceability ⟷ references outputs; non-blocking
```

**Repository-level rules:**

- `src/presentation/` must not depend on `src/evidence/` or `src/detection/`  
- `src/reporting/` must not depend on `src/observation/` or `src/evidence/` for recollection  
- `src/detection/` must not depend on `src/configuration/` for core evaluation  
- `src/evidence/` must not depend on `src/presentation/` or `src/configuration/`  
- `extension/` may wire roles in pipeline order; it must not invent reverse ownership  
- `tests/` may depend on production packages for verification; production must not depend on `tests/`  
- `tooling/` and `dist/` are outside the domain dependency chain  

Cycles among Investigation → Observation → Evidence → Detection → Reporting → Presentation are forbidden. Investigation may observe completion readiness only for disposition—not to invert stage ownership.

---

## 8. Naming Conventions

| Concern | Convention |
|---|---|
| **Architecture docs** | Numbered prefix + descriptive name: `NN_TITLE.md` under `architecture/` |
| **ADRs** | `ADR-NNN_SHORT_TITLE.md` under `adr/`; new decisions get a new number |
| **Implementation docs** | Numbered prefix under `implementation/`: `00_…`, `01_…`, … |
| **Logical package directories** | Lowercase singular domain name matching package: `investigation`, `observation`, `evidence`, `detection`, `reporting`, `presentation`, `configuration`, `traceability` |
| **Top-level roots** | Lowercase, hyphen-free single tokens (`src`, `tests`, `docs`, `assets`, `tooling`, `dist`, `extension`) |
| **Tests** | Mirror package ownership by path under `tests/` (e.g., tests for Detection live under a detection-aligned path)—without embedding tests inside `src/` |
| **Generated outputs** | Only under `dist/` (or tooling-designated generated subpaths that are ignored as maintained source) |
| **No architecture rename** | Directory names must not rename Domain entities’ meanings (Domain Model remains vocabulary SoT) |

Do not introduce package directory names that imply new architectural packages.

---

## 9. Documentation Organization

| Location | Audience / role |
|---|---|
| **`architecture/`** | Architectural SoT (frozen). Implementers read; do not casually edit. |
| **`adr/`** | Decision SoT for accepted trade-offs. Append new ADRs for true architectural change; do not rewrite approved ADRs. |
| **`implementation/`** | Implementation planning SoT (how to build). Evolves during implementation phase without changing architecture meaning. |
| **`docs/`** | Submission and operator-facing documentation (FR-024 / NFR-003). Complements—not replaces—architecture. |

**Separation rule:** Product and design authority stay in `architecture/` + `adr/`. “How we are building it” stays in `implementation/`. “How to install/use/submit” stays in `docs/`.

---

## 10. Generated Artifacts

| Kind | Location | Maintenance rule |
|---|---|---|
| **Maintained source** | `src/`, `extension/` (shell), `tests/`, docs roots, `assets/`, `tooling/` | Edited by humans under governance |
| **Frozen maintained docs** | `architecture/`, approved `adr/` files | Not edited for implementation convenience; architectural change requires new ADR |
| **Generated outputs** | `dist/` (and any tooling cache/output dirs) | Never manually maintained; always regenerable from maintained source |
| **Local/tool caches** | Tooling-defined (may be gitignored) | Not architectural artifacts; not package ownership |

If a file is generated, it is not the design authority. If a file is design authority, it is not generated.

---

## 11. Repository Governance

Aligned with [`00_IMPLEMENTATION_PLAN`](00_IMPLEMENTATION_PLAN.md) Change Control and Architectural Freeze Policy:

1. **Architecture freeze** — Do not edit `architecture/00`–`13` or approved ADR-001–ADR-006 to fit coding convenience.  
2. **Fix code, not architecture** — Implementation defects are corrected under `src/`, `extension/`, `tests/`, or `implementation/` planning docs.  
3. **New ADR for architectural change** — True boundary/decision changes require a new ADR (and Requirements/Vision amendment when EP-001/EP-002 demand it).  
4. **Ownership discipline** — Pull requests should attribute changes to package regions and must not invert dependency direction.  
5. **Optional isolation** — `src/configuration/` may be absent or inert for core milestones; core must not require it (FR-026).  
6. **Unknown integrity** — Repository organization must not invent catalogs or close U-001–U-010.  
7. **Milestone order** — Repository growth follows implementation milestones (Foundation → … → Final Acceptance); later milestones do not redefine earlier ownership roots.  
8. **Review focus** — Reviews verify boundary compliance (Presentation ≠ Detection; Evidence immutability ownership; single-scan posture) at the repository level, not redesign.

---

## 12. Repository Definition of Done

The repository structure is ready to host implementation when:

1. Top-level roots exist with the responsibilities defined above.  
2. Each logical package `P-001`–`P-006` (and `P-007` if elected, `P-008` as non-blocking) has a clear primary ownership region under `src/`.  
3. `extension/` is present as hosting shell without becoming a second domain model.  
4. `tests/` is separated from `src/`.  
5. `architecture/` and approved `adr/` remain intact and unedited for convenience.  
6. `implementation/` contains the active implementation planning baseline (`00`, `01`, …).  
7. Generated output location (`dist/`) is designated and treated as non-authoritative.  
8. Dependency direction at repository level matches Package Architecture (no forbidden edges).  
9. Optional Configuration region cannot gate core package regions.  
10. Governance rules above are understood as binding for subsequent milestones.

---

## 13. Conclusion

This repository organization is the physical host for the frozen architecture: immutable design under `architecture/` and `adr/`; planning under `implementation/`; ownership-aligned production under `src/`; runtime hosting under `extension/`; verification under `tests/`; submission docs under `docs/`; isolated tooling and disposable generated outputs.

Subsequent implementation documents may refine nested layout and milestone checklists—but must not redesign packages, reverse dependencies, or thaw architecture without a new ADR.

---

**End of Repository Structure.**
