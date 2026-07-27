# 02 — Coding Standards

**Status:** Active — Implementation Phase  
**Document type:** Project-wide coding standards (how code is written—not what the system does)  
**Depends on:** [`00_IMPLEMENTATION_PLAN.md`](00_IMPLEMENTATION_PLAN.md); [`01_REPOSITORY_STRUCTURE.md`](01_REPOSITORY_STRUCTURE.md); frozen `architecture/00`–`13`; ADR-001–ADR-006

This document defines **how** production and test code are written under the frozen architecture. It does not define APIs, interfaces, algorithms, package internals, or Chrome Extension logic.

---

## 1. Purpose

Establish consistent, reviewable coding standards so implementation:

- Follows frozen architecture and ADR decisions without redesign  
- Preserves package ownership and dependency direction at the module level  
- Remains maintainable, explicit, and honest about uncertainty  
- Supports continuous verification per `12_TESTING_STRATEGY` and implementation milestones  

Standards are implementation discipline. They are not new architecture.

---

## 2. Scope

### In scope

- Code and file organization within approved repository roots  
- Module boundaries and import direction  
- Naming, documentation, comments, formatting, and linting philosophy  
- TypeScript usage philosophy  
- Error handling, logging, dependency management philosophies  
- Immutability and asynchronous programming practices  
- Code review expectations and maintainability guidelines  

### Out of scope

- Architectural redesign or package invention  
- API, interface, or algorithm specifications  
- Browser API inventories or Chrome Extension messaging design  
- Detection selectors, scoring formulas, or product-definition catalogs  
- Closing Open Unknowns (`U-001`–`U-010`) by invention  

---

## 3. Relationship to Architecture

| Authority | How coding standards use it |
|---|---|
| Engineering Principles (EP-*) | Constitutional constraints on fidelity, Unknowns, evidence, bonus isolation, simplicity |
| Domain Model | Canonical vocabulary for names and meanings |
| Package / Extension / UI Architecture | Ownership homes and forbidden conflations |
| Data Flow + ADR-002 / ADR-005 | Immutability and single-acquisition posture in code habits |
| Detection Strategy + ADR-003 / ADR-004 / ADR-006 | Honesty, explainability, Not Detected / Unknown / partial completion |
| ADR-001 | One Investigation root; no parallel episode semantics in code structure |
| Repository Structure | Physical homes for packages, tests, tooling, generated outputs |
| Implementation Plan | Milestone order, freeze policy, change control |

If a coding convenience conflicts with architecture or an ADR, architecture and ADR win. Fix code—not frozen documents. True architectural change requires a **new ADR**.

---

## 4. General Coding Principles

Derived from frozen architecture—not invented as new design:

| Principle | Meaning |
|---|---|
| **Code follows architecture** | Modules realize `P-*` / `R-*` ownership; they do not redefine it (EP-016) |
| **Imports follow dependency direction** | Investigation → Observation → Evidence → Detection → Reporting → Presentation |
| **Preserve package boundaries** | Presentation does not detect; Reporting does not recollect; Evidence does not conclude products |
| **Explicit ownership** | Every module has one primary package home under `src/<package>/` |
| **Favor immutability** | Especially Normalized Evidence after acquisition (ADR-002) |
| **Avoid hidden side effects** | No silent Storefront re-query, mutation, or certainty fabrication (ADR-005; EP-012; ADR-006) |
| **Small focused modules** | One clear responsibility per module; prefer simplicity (EP-020) |
| **No circular dependencies** | Cycles among core package direction are forbidden |
| **Clear error propagation** | Failures surface as honest dispositions/qualifications—not invented Detected/Absent |
| **Predictable async flow** | Async work is ordered and attributable to one Investigation episode (ADR-001) |
| **Self-documenting code** | Names carry meaningful Domain vocabulary |
| **Minimal intent comments** | Comments explain why/intent at non-obvious seams—not mechanics |
| **Consistent formatting** | Automated formatting preferred over debate |
| **Optional stays optional** | Core packages must not require Configuration (EP-011; FR-026) |
| **Unknowns stay explicit** | Do not close `U-*` in code comments or control flow by inventing assignment answers (EP-003) |

---

## 5. File Organization Standards

Aligned with [`01_REPOSITORY_STRUCTURE`](01_REPOSITORY_STRUCTURE.md):

1. **Package home** — Production code for a logical package lives under its `src/<package>/` region only.  
2. **Hosting vs ownership** — `extension/` may wire runtime roles; it must not become a second home for Detection, Evidence, or Reporting meaning.  
3. **Tests separated** — Tests live under `tests/`, organized to mirror package ownership; do not embed test suites inside production package trees.  
4. **No generated edits** — Never hand-edit `dist/` or other generated outputs.  
5. **Tooling isolation** — Build/lint helpers stay in `tooling/` (and root manifests); they are not domain packages.  
6. **One concern per file** — Prefer focused files over “god modules” that span Evidence + Detection + Presentation.  
7. **Colocate by ownership, not by technical layer alone** — A presentation formatting helper belongs with Presentation; a snapshot normalization helper belongs with Evidence.  
8. **Optional Configuration** — If present, `src/configuration/` remains adjunct; core files must compile and operate without it.  
9. **Do not invent package directories** — New top-level `src/` regions require architectural authority (new ADR / package model change)—not local convenience.  
10. **Architecture docs are not source** — Do not place executable code under `architecture/`, `adr/`, or `implementation/`.

---

## 6. Naming Standards

1. **Domain vocabulary first** — Prefer names from the Domain Model (`Investigation`, `Evidence`, `Normalized Evidence`, `Detection Result`, `Not Detected`, `Unknown Qualification`, `Diagnostic Report`, etc.). Do not rename meanings for brevity.  
2. **Package-aligned identifiers** — Names should make ownership obvious (e.g., evidence-oriented names in Evidence; presentation-oriented names in Presentation).  
3. **Outcome honesty in names** — Do not name uncertain outcomes as if certain (`detected` when the model is `Not Detected` / `Unknown`).  
4. **Files and directories** — Lowercase, readable tokens consistent with repository naming; package directories remain the approved set.  
5. **Booleans and flags** — Prefer explicit state names over overloaded flags that collapse Detected / Not Detected / Unknown / Unavailable.  
6. **Avoid architecture IDs in user-facing strings** — `FR-*`, `P-*`, `ADR-*` may appear in code comments or traceability aids; operator-facing copy follows UI Architecture neutrality and report content, not internal IDs.  
7. **No joke or opaque abbreviations** at ownership boundaries. Clarity beats cleverness (EP-020).  
8. **Configuration naming** — Optional configuration symbols must not read as mandatory for core Investigation success.

---

## 7. Module and Dependency Rules

### 7.1 Allowed direction

```
investigation → observation → evidence → detection → reporting → presentation

configuration (optional) → reporting   [adjunct only]

traceability ⟷ references; non-blocking
```

### 7.2 Forbidden edges (code-level)

| Forbidden import / coupling | Why |
|---|---|
| Presentation → Detection or Evidence | Evaluates or collects in the wrong package |
| Reporting → Observation or Evidence (recollection) | Assembly must not re-acquire |
| Detection → Configuration (required) | Bonus isolation |
| Evidence → Presentation or Configuration | Contaminates core Evidence path |
| Any core package → `tests/` | Production must not depend on tests |
| Domain packages → `dist/` as source | Generated outputs are not authority |

### 7.3 Module rules

1. **Acyclic core chain** — No circular imports among Investigation → … → Presentation.  
2. **Investigation completion only** — Investigation may observe completion readiness; it must not re-enter Observation/Evidence/Detection ownership for the same stage inversion.  
3. **Public module surface minimal** — Expose only what downstream packages need; keep package internals private to the package region.  
4. **No “utility” dumping ground** that reintroduces forbidden coupling under a neutral name. Shared helpers must have a clear owning package or remain truly cross-cutting without owning Detection/Evidence meaning.  
5. **Runtime wiring** in `extension/` follows the same direction as package imports.  
6. **Dependency additions** (third-party libraries) must not force architectural bypasses (e.g., Presentation reading live page state to “help” Detection).

---

## 8. TypeScript Philosophy

1. **TypeScript is the default implementation language** for production logic unless a narrow tooling exception is required.  
2. **Types express domain meaning** — Prefer explicit types/aliases that mirror Domain vocabulary over anonymous structural blobs at package boundaries.  
3. **Strictness over escape hatches** — Avoid `any` to bypass ownership or Unknown honesty. If a value is unknown, model uncertainty explicitly rather than casting to certainty.  
4. **Boundary explicitness** — Data crossing package boundaries should be typed clearly enough that illegal mutation or illegal coupling is hard to hide.  
5. **Immutability at types where practical** — Prefer readonly postures for Normalized Evidence and completed Detection/Report snapshots consumed downstream (ADR-002 spirit).  
6. **No type-level architecture rewrite** — Types must not invent products, catalogs, or closed Unknowns.  
7. **Narrow vs wide** — Prefer precise unions for outcome states (including Not Detected / Unknown / Unavailable) over boolean collapses.  
8. **Test types** may be looser only where they do not encourage production `any` leakage.

This section is language philosophy—not an API catalog.

---

## 9. Error Handling Standards

1. **Honesty over cosmetics** — Errors and incomplete observations become Unknown, Unavailable, Not Detected, or Completed Partial as architecture requires—not fabricated success (ADR-006; EP-009; EP-018).  
2. **Propagate with context** — Failures should remain attributable to the Investigation episode and stage ownership (ADR-001; ADR-004).  
3. **Do not swallow silently** — Empty `catch` blocks that invent “Absent” or “Detected” are forbidden.  
4. **Do not retry into architectural violation** — Recovery must not imply a second browser acquisition pass that rewrites the immutable snapshot (ADR-005; ADR-002).  
5. **Package-local handling** — Handle errors in the package that owns the failing concern; do not let Presentation invent Detection outcomes from transport noise.  
6. **Optional Configuration failures** — Must not fail the core path (EP-011).  
7. **Operator impact** — User-visible incompleteness is expressed through Report/Presentation content and disposition—not crash-only UX when progressive completeness applies.  
8. **No assignment invention in error paths** — Error handling must not close `U-*` items.

---

## 10. Logging Standards

1. **Diagnostics aid engineers** — Logs support investigation of the tool itself; they are not a substitute for Diagnostic Report content.  
2. **No secrets** — Do not log credentials, tokens, or sensitive configuration material.  
3. **Attribution** — Prefer logs that identify Investigation stage/package ownership over opaque global dumps.  
4. **Do not log as Detection** — Log lines must not become a second, ungoverned detection channel that Presentation scrapes.  
5. **Uncertainty preserved** — Logging must not “upgrade” Unknown/Not Detected into certainty.  
6. **Volume restraint** — Prefer actionable logs; avoid noisy tracing that obscures failures (EP-020).  
7. **Non-invasive** — Logging must not mutate the Storefront or Evidence snapshot (EP-012).  
8. **Production vs development** — Verbose diagnostics may be development-oriented; they must not be required for core Report correctness.

---

## 11. Documentation Standards

### 11.1 Code documentation

1. Prefer self-explanatory names and structure over narrative comments.  
2. Comments explain **intent, invariants, or ADR/EP constraints** at non-obvious seams.  
3. Do not comment the obvious (“increment i”).  
4. Do not use comments to redesign architecture or close Unknowns.  
5. When a limitation is an Open Unknown, label it as such rather than inventing behavior in prose.  
6. Public module entrypoints inside a package should briefly state ownership and non-goals when helpful to reviewers.

### 11.2 Formatting and linting philosophy

1. **Consistent formatting** is mandatory; use project formatter configuration as the authority.  
2. **Lint rules** exist to protect boundaries, correctness habits, and consistency—not to invent architecture.  
3. Formatting/lint debates lose to automation; do not hand-format against the tool.  
4. Generated files are not lint-truth targets for manual cleanup.  
5. Suppressions are exceptional and must be justified; never use suppression to hide forbidden package coupling.

### 11.3 Project documentation vs code

- Architecture/ADR/implementation docs remain the design SoT.  
- Code docs must not contradict frozen documents.  
- Submission/operator docs live under `docs/` per repository structure (FR-024).

---

## 12. Code Review Standards

Reviewers verify implementation standards and architectural compliance—not personal style preferences already covered by formatter/linter.

**Required review checks:**

1. **Ownership** — Change lives in the correct `src/<package>/` (or justified `extension/` wiring only).  
2. **Import direction** — No forbidden edges; no new cycles.  
3. **ADR compliance** — Especially ADR-001 (one root), ADR-002 (immutability), ADR-003 (definition-driven posture), ADR-004 (explainability), ADR-005 (single scan), ADR-006 (partial honesty).  
4. **Unknown integrity** — No silent closure of `U-*`.  
5. **Optional isolation** — Core path not blocked on Configuration.  
6. **Presentation neutrality** — UI/presentation code does not evaluate Evidence.  
7. **Test impact** — Behavior changes include or update appropriate tests under `tests/`.  
8. **Scope restraint** — No feature expansion beyond FR registry without Requirements/Vision amendment (EP-001; EP-014).  
9. **Small reviewable commits** — Changes should be attributable to package ownership and obligation IDs where practical (EP-015).  
10. **Freeze integrity** — Reject PRs that “fix” architecture docs instead of code, unless a new ADR is explicitly in scope.

---

## 13. Maintainability Guidelines

1. **Prefer the simpler investigation instrument** when multiple implementations satisfy architecture (EP-020; DR-004).  
2. **Keep detection reasoning maintainable** without turning selectors into architecture (EP-019; ADR-003).  
3. **Localize change** — A Detection definition change should not require Presentation redesign; a Presentation change should not require Evidence rewrite.  
4. **Avoid speculative abstraction** — Do not build frameworks for unrequested product lines or admin surfaces (Vision non-goals).  
5. **Immutable snapshots simplify reasoning** — Treat post-normalization Evidence as read-only downstream to reduce temporal bugs (ADR-002).  
6. **One Investigation mental model** — Avoid global mutable stores that blur episode boundaries (ADR-001).  
7. **Delete or avoid dead code** that encodes abandoned guesses about Unknowns.  
8. **Dependencies are liabilities** — Add third-party packages only when they clearly reduce risk without boundary erosion.  
9. **Async clarity** — Prefer straightforward async sequences per Investigation over hidden concurrent re-entry into acquisition.  
10. **Refactor toward boundaries** — If a module mixes concerns (EP-017), split toward package ownership rather than adding more flags.

---

## 14. Definition of Done

A code change meets coding-standards Done when:

1. It resides in the correct repository region and package ownership home.  
2. Imports and wiring obey dependency direction and forbid listed edges.  
3. Naming preserves Domain meaning and outcome honesty.  
4. Immutability and single-acquisition postures are not violated.  
5. Errors and incomplete states remain representable (no fabricated certainty).  
6. Optional Configuration is not required for core success.  
7. Open Unknowns are not closed by invention.  
8. Formatting/lint expectations are satisfied (or justified suppressions only).  
9. Comments/docs (if any) explain intent without contradicting architecture.  
10. Review checks in §12 are addressable and addressed.  
11. Tests are updated or added under `tests/` when behavior warrants.  
12. No frozen architecture/ADR file was edited for convenience.

---

## 15. Conclusion

Coding standards turn frozen architecture into daily implementation discipline: ownership-aligned files, directed imports, immutable Evidence habits, honest uncertainty, explicit TypeScript boundaries, and reviews that protect ADRs.

They do not define what the system detects, which APIs it calls, or how algorithms score signals. Those remain governed by architecture and later implementation documents—without thawing the architectural freeze.

---

**End of Coding Standards.**
