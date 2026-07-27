# E-001 — Repository Bootstrap

**Status:** Active — Execution Phase  
**Document type:** Execution specification (how the repository is bootstrapped—not business logic)  
**Milestone alignment:** M1 Foundation / IC-0 / T0  
**Depends on:** Frozen architecture `00`–`13`; ADR-001–ADR-006; implementation `00`–`06`; package specs `P-001`–`P-008`

This execution package establishes the initial repository workspace that every later implementation package depends upon. It does **not** implement Observation, Evidence, Detection, Reporting, Presentation, Configuration, Traceability business rules, detection logic, or runtime diagnostic behavior.

---

## 1. Purpose

Bootstrap a version-controlled workspace that:

- Realizes the approved top-level repository layout  
- Provides empty package ownership skeletons for `P-001`–`P-008`  
- Installs development tooling sufficient to enforce Coding Standards  
- Establishes typing, linting, formatting, testing, and CI foundations  
- Passes M1 Foundation / RG-M1 readiness without thawing architecture  

---

## 2. Scope

### In scope

- Repository initialization and directory creation  
- Package skeletons (placeholders only)  
- Development dependency installation  
- Tooling for TypeScript typing, formatting, linting, testing  
- Root/tooling configuration files  
- Environment file templates (no secrets)  
- CI foundation scripts/workflows  
- Documentation bootstrap stubs under `docs/`  
- Validation steps and completion checklist  

### Out of scope

- Any `P-001`–`P-008` business implementation  
- Browser APIs, selectors, detection algorithms, report/UI logic  
- Manifest/messaging design beyond an empty hosting shell placeholder  
- Architectural redesign or new package invention  
- Closing Open Unknowns  

---

## 3. Repository Initialization

| Step | Action |
|---|---|
| 1 | Confirm git repository root is the project workspace |
| 2 | Retain frozen `architecture/`, `adr/`, and `implementation/` contents unchanged for convenience |
| 3 | Create missing top-level roots from Repository Structure |
| 4 | Initialize Node.js/TypeScript workspace manifests at repository root |
| 5 | Add ignore rules for `dist/`, dependency caches, local env secrets, and editor noise |
| 6 | Verify freeze gate **T0**: implementing against frozen docs/ADRs |

No business packages are implemented during initialization.

---

## 4. Directory Structure

Derived only from [`01_REPOSITORY_STRUCTURE`](../01_REPOSITORY_STRUCTURE.md). Create if missing; do not invent runtime module trees beyond ownership skeletons.

```
flexype-shopify-investigator/
├── architecture/                 # frozen (retain)
├── adr/                          # frozen (retain)
├── implementation/               # planning + specs + execution (retain/extend)
│   ├── 00–06 …                   # planning docs (retain)
│   ├── specs/                    # P-001–P-008 specs (retain)
│   └── execution/                # E-* execution specs (this document lives here)
├── src/
│   ├── investigation/            # P-001 skeleton
│   ├── observation/              # P-002 skeleton
│   ├── evidence/                 # P-003 skeleton
│   ├── detection/                # P-004 skeleton
│   ├── reporting/                # P-005 skeleton
│   ├── presentation/             # P-006 skeleton
│   ├── configuration/            # P-007 skeleton (optional; may be empty placeholder)
│   └── traceability/             # P-008 skeleton
├── extension/                    # RR-* hosting shell placeholder only
├── tests/
│   ├── investigation/
│   ├── observation/
│   ├── evidence/
│   ├── detection/
│   ├── reporting/
│   ├── presentation/
│   ├── configuration/
│   └── traceability/
├── docs/                         # FR-024 / NFR-003 bootstrap stubs
├── assets/                       # static non-code placeholder
├── tooling/                      # lint/format/build helper isolation
├── dist/                         # generated outputs (gitignored content)
└── <root config>                 # package/ts/lint/format/test/ci manifests
```

**Rules:**

- Do not create alternate top-level domain packages.  
- `extension/` remains a hosting shell—no Detection/Reporting ownership.  
- `dist/` is never manually maintained as source of truth.  
- `architecture/` and approved `adr/` files are not edited for bootstrap convenience.

---

## 5. Package Skeleton

Create **skeletons only**. No implementations.

Each `src/<package>/` region corresponds to package ownership:

| Package | Directory | Skeleton contents (placeholders only) |
|---|---|---|
| P-001 Investigation | `src/investigation/` | Ownership placeholder module(s); no Investigation business logic |
| P-002 Observation | `src/observation/` | Ownership placeholder; no Storefront observation logic |
| P-003 Evidence | `src/evidence/` | Ownership placeholder; no acquisition/normalization logic |
| P-004 Detection | `src/detection/` | Ownership placeholder; no evaluation logic |
| P-005 Reporting | `src/reporting/` | Ownership placeholder; no report assembly logic |
| P-006 Presentation | `src/presentation/` | Ownership placeholder; no UI/view logic |
| P-007 Configuration | `src/configuration/` | Optional placeholder; must not be required by core packages |
| P-008 Traceability | `src/traceability/` | Governance placeholder; non-blocking |

**Skeleton rules (Coding Standards):**

1. Placeholders may export empty/no-op markers or package identity comments only.  
2. No algorithms, selectors, browser APIs, or Detection/Evidence behavior.  
3. Public surfaces stay minimal; no cross-package business imports yet except what is required to prove the workspace typechecks with allowed dependency direction (prefer zero business imports at bootstrap).  
4. Mirror empty test placeholder directories under `tests/<package>/`.  
5. `extension/` may contain only non-behavioral hosting placeholders (no runtime diagnostic wiring).

---

## 6. Development Dependencies

Bootstrap installs **tooling/dependencies only**—not business libraries for detection/scraping/UI frameworks beyond what TypeScript workspace needs.

| Category | Purpose | Authority |
|---|---|---|
| **TypeScript toolchain** | Default production language / typing | Coding Standards §8 |
| **Package manager lockfile** | Reproducible installs | Repository governance |
| **Formatter** | Consistent formatting automation | Coding Standards §11.2 |
| **Linter** | Boundary/consistency enforcement aid | Coding Standards §11.2 |
| **Test runner** | Host `tests/` verification later | Repository Structure; Testing Strategy execution home |
| **Type definitions for Node/tooling** | Support scripts/tooling types | Tooling isolation |

**Forbidden at E-001:**

- Detection/scraping/UI business frameworks  
- Backend SDKs required for core path  
- Dependencies that force Configuration into core packages  
- Dependencies that invert package ownership  

Third-party packages are liabilities (Coding Standards): add only what bootstrap tooling requires.

### Bootstrap toolchain selection (delivery choice—not architecture)

E-001 selects the following concrete toolchain to implement Coding Standards obligations. These are **bootstrap delivery choices**, not architectural decisions and not Testing Strategy architecture:

| Role | Selection |
|---|---|
| Language / types | TypeScript (strict) |
| Package manager | npm (lockfile committed) |
| Formatter | Prettier |
| Linter | ESLint (TypeScript-aware) |
| Test runner | Vitest |
| CI | GitHub Actions workflow running typecheck, lint, format-check, and tests |

Do not treat these vendor names as Domain/Package Architecture.

---

## 7. Tooling

| Tooling concern | Bootstrap obligation |
|---|---|
| **Typecheck** | `tsc` (or project references) validates `src/`, `extension/` placeholders, and `tests/` typings without emit-as-source |
| **Format** | Formatter config is the formatting authority; format-check fails drift |
| **Lint** | Lint config enforces consistency; suppressions exceptional and justified |
| **Test** | Test runner configured against `tests/`; production must not depend on `tests/` |
| **Build placeholder** | Script may emit to `dist/`; `dist/` gitignored / non-authoritative |
| **Tooling isolation** | Helper scripts live under `tooling/` or root scripts—not inside domain packages |

No business build pipeline features (bundled Detection, storefront scrapers, etc.) in E-001.

---

## 8. Configuration Files

Create root/tooling configuration files required for the bootstrap toolchain. Exact filenames follow the selected tools; contents enforce Coding Standards and Repository Structure.

| Config kind | Obligation |
|---|---|
| **Package manifest** | Scripts: `typecheck`, `lint`, `format`, `format:check`, `test`, `build` (build may be stub) |
| **TypeScript config** | Strict typing; include `src/`, `tests/`, `extension/`; exclude `dist/` as source |
| **Formatter config** | Project-wide formatting authority |
| **Linter config** | TypeScript-aware; no suppressions that hide forbidden coupling |
| **Test runner config** | Roots under `tests/`; no production→tests dependency |
| **Ignore files** | Ignore `dist/`, `node_modules/`, local `.env*`, coverage caches |
| **Editor defaults (optional)** | Format-on-save alignment with formatter—non-architectural |

Do not place executable business code in config files.

---

## 9. Environment Configuration

| Item | Obligation |
|---|---|
| **`.env.example` (or equivalent template)** | Documents any future local variables without secrets |
| **Secrets** | Never commit credentials/tokens |
| **Core path** | No environment variable may be required for core Investigation success at bootstrap |
| **Optional Configuration** | No env template may imply P-007 is mandatory for core builds |

U-006 and bonus backends remain Open/optional—E-001 does not invent API endpoints.

---

## 10. Build Validation

After bootstrap, the following must succeed locally:

1. Dependency install from lockfile  
2. Typecheck passes with package skeletons  
3. Lint passes (or only pre-justified bootstrap suppressions—none preferred)  
4. Format check passes  
5. Test runner executes (may run zero/placeholder tests and exit successfully)  
6. Build/emit (if present) writes only under `dist/` and does not require hand-edited generated sources  
7. Core package regions do not import Configuration as a required dependency  
8. Frozen `architecture/` and approved `adr/` files remain unmodified by bootstrap convenience edits  

---

## 11. Testing Bootstrap

| Item | Obligation |
|---|---|
| **Location** | `tests/` mirrored by package ownership |
| **Content at E-001** | Placeholder only—or a single smoke test that asserts workspace harness runs |
| **Not at E-001** | VD domain suites, FR-014 empirics, Detection/Evidence behavior tests |
| **Alignment** | Prepares for Test Execution Plan `T0`/`T1…` later; does not invent new verification domains |
| **Separation** | Production packages must not depend on `tests/` |

Testing Strategy remains the verification architecture; E-001 only hosts the runner.

---

## 12. CI Bootstrap

Establish a minimal CI foundation that runs on pull requests / mainline pushes:

| CI job element | Obligation |
|---|---|
| Install dependencies | From lockfile |
| Typecheck | Required |
| Lint | Required |
| Format check | Required |
| Tests | Required (placeholders allowed) |
| Architecture freeze guard (lightweight) | Fail if bootstrap PR rewrites frozen architecture/ADR files without explicit intent |

CI must not require Configuration, backends, or Storefront access for E-001 green status.

---

## 13. Coding Standard Enforcement

Bootstrap must make Coding Standards enforceable mechanically where practical:

| Standard | Enforcement at E-001 |
|---|---|
| TypeScript default | `tsconfig` strictness enabled |
| Formatting consistency | Formatter + CI format-check |
| Lint philosophy | ESLint + CI lint |
| Tests separated | `tests/` layout + no production→tests imports |
| Generated non-authority | `dist/` ignored / not hand-edited |
| Package directory set | Only approved `src/*` package names |
| Dependency direction | No business imports yet; later packages must preserve Investigation→…→Presentation |
| Optional isolation | `src/configuration/` not required by core manifests/scripts |

Path/ownership import-boundary lint rules may be added later when real imports exist; E-001 must not pretend business boundaries are implemented.

---

## 14. Deliverables

□ Top-level directories per Repository Structure  
□ `src/` package skeletons for P-001–P-008  
□ Mirrored `tests/<package>/` placeholders  
□ `extension/` hosting shell placeholder (non-behavioral)  
□ `docs/` bootstrap stub(s) for future FR-024 content  
□ `assets/` and `tooling/` roots present  
□ `dist/` designated and non-authoritative  
□ Root manifests + TypeScript/lint/format/test configs  
□ Lockfile committed  
□ Env template without secrets  
□ CI workflow foundation  
□ README or `docs/` pointer describing how to install and run typecheck/lint/format/test  
□ This execution document under `implementation/execution/`  

Frozen architecture/ADR/implementation planning docs remain present and unedited for convenience.

---

## 15. Completion Criteria

E-001 is complete when:

□ M1 Foundation entry intent satisfied: delivery shell + freeze compliance readiness  
□ IC-0 / T0 freeze gate can be recorded  
□ Directory structure matches Repository Structure  
□ Package skeletons exist with **no** business logic  
□ Typecheck, lint, format-check, and test harness succeed  
□ CI foundation is present and green on bootstrap  
□ Coding Standards tooling enforcement is active  
□ Core path does not require Configuration  
□ No Observation/Evidence/Detection/Reporting/Presentation/Configuration/Traceability business behavior was implemented  
□ No architecture/ADR redesign occurred  

---

## 16. Definition of Done

Repository bootstrap is done when:

1. All deliverables in §14 exist.  
2. All completion criteria in §15 are checked.  
3. RG-M1 review gate can be requested using evidence of freeze integrity + repository ownership map.  
4. Later packages (starting with P-001 realization in M2) can land on this workspace without restructuring ownership roots.  
5. No business features were smuggled into E-001.

---

## 17. Conclusion

E-001 bootstraps the physical and tooling foundation for implementation under the frozen architecture: approved directories, empty package ownership skeletons, TypeScript/lint/format/test/CI enforcement, and M1 readiness—without implementing any diagnostic business behavior.

Subsequent execution packages implement `P-001` onward in Package Build Order on top of this bootstrap.

---

**End of E-001 Repository Bootstrap.**
