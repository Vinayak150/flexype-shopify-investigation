# 09 — Package Architecture

**Status:** Draft — depends on approved `08_DATA_FLOW` and upstream architecture `04`–`07`  
**Document type:** Logical package decomposition (not folders, files, modules, languages, frameworks, or Chrome runtime)  
**Authoritative inputs:** Architecture Master Plan; `00_PROJECT_VISION`–`08_DATA_FLOW`; Product Support Engineer Assignment (FlexyPe)

System responsibilities (`R-*`), Pipeline stages (`S-*`), Information Objects (`IO-*`), and Domain entities are reused and not redefined.

**Packages are logical architectural partitions.** They are not directories, not source trees, and not deployable Chrome components.

---

## 1. Purpose

This document maps approved architectural responsibilities into **logical packages** so Extension Architecture, UI Architecture, Testing Strategy, and eventual implementation can derive concrete structure **without redefining ownership**.

**Relationship to System Architecture:** Each logical package aggregates one or more responsibilities (`R-*`) while preserving boundaries in `05_SYSTEM_ARCHITECTURE`.

**Relationship to Data Flow:** Packages produce/consume Information Objects (`IO-*`) along the approved flow; packaging must not invert ownership or mutability rules (especially Normalized Evidence immutability).

**Relationship to Extension Architecture:** Extension Architecture will place logical packages into Chrome runtime roles. This document remains runtime-agnostic.

**Relationship to UI Architecture:** UI Architecture specializes only the Presentation Package’s operator-facing concern; it must not pull Detection or Evidence ownership.

**Relationship to Testing Strategy:** Tests should target package-owned obligations and invariants (e.g., Detection never owned by Presentation), not an invented folder map.

---

## 2. Package Scope

### 2.1 Included packages

| Logical Package | Primary responsibilities |
|---|---|
| **Investigation Package** | R-001 |
| **Observation Package** | R-002 |
| **Evidence Package** | R-003, R-004 |
| **Detection Package** | R-005, R-006 |
| **Reporting Package** | R-007 |
| **Presentation Package** | R-009 |
| **Configuration Package** (optional) | R-008 |
| **Traceability Package** | R-010 |

### 2.2 Excluded concerns

| Excluded | Owner elsewhere |
|---|---|
| Folder/file layout, build tooling | Implementation |
| Chrome MV3 roles, messaging, permissions | Extension Architecture |
| Popup layout/widgets | UI Architecture |
| Selectors, scoring algorithms | Implementation under Detection Strategy philosophy |
| Persistence engines | Not required for core; out of package model |
| Merchant backends as core packages | Forbidden for core (EP-005; EP-011) |

### 2.3 Relationship to responsibilities

Every `R-*` maps to exactly one primary logical package. No responsibility is left unowned. No package invents a new responsibility that expands assignment scope (EP-001).

### 2.4 Relationship to information objects

| Information Object | Producing package |
|---|---|
| IO-001 Investigation Context | Investigation |
| IO-002 Observation Affordance | Observation |
| IO-004 Evidence / IO-005 Normalized Evidence | Evidence |
| IO-006 Evaluation Agenda | Detection |
| IO-003 Store Information / IO-007 Detection Result Set / IO-008 Unknown Qualification | Detection (qualification may originate in Detection; preserved by Reporting/Presentation) |
| IO-009 Diagnostic Report | Reporting |
| IO-010 Product Configuration | Configuration (optional) |
| IO-011 Presentation-ready View | Presentation |
| IO-012 Completion Disposition | Investigation |

---

## 3. Logical Packages

### P-001 — Investigation Package

- **Purpose:** Own the Investigation as the unit of work and completion disposition.  
- **Owns:** Investigation Context (IO-001); Completion Disposition (IO-012); coordination of one Storefront target.  
- **Consumes:** Operator intent; readiness signals that Report/View exist (conceptual).  
- **Produces:** Bound Investigation; end disposition (Completed / Completed Partial / Unknown-qualified; Not Applicable reserved under U-008).  
- **Depends on:** Observation, Evidence, Detection, Reporting, Presentation (as orchestrated collaborators—not as subordinates that redefine Investigation). Must not depend on Configuration for core success.  
- **Must never own:** Evidence contents; Detection Results; UI presentation semantics; configuration fetch.  
- **Non-goals:** Not a workflow engine; not Chrome lifecycle management.  
- **Authority:** R-001; C-002; P-INV-001; DF-INV-008.

### P-002 — Observation Package

- **Purpose:** Provide public Storefront observation affordance for the Investigation.  
- **Owns:** Observation Affordance (IO-002); Storefront-as-target access conceptually.  
- **Consumes:** Investigation Context.  
- **Produces:** Observation Affordance for Evidence collection.  
- **Depends on:** Investigation Package (context only).  
- **Must never own:** Detection Results; Diagnostic Report; Presentation; Configuration.  
- **Non-goals:** Not evaluating products; not normalizing Evidence.  
- **Authority:** R-002; EP-006; C-003.

### P-003 — Evidence Package

- **Purpose:** Collect and normalize Evidence for one Investigation.  
- **Owns:** Evidence (IO-004); Normalized Evidence (IO-005); Evidence Signal Class usage as collection categories.  
- **Consumes:** Observation Affordance; Investigation Context.  
- **Produces:** Normalized Evidence (immutable for downstream packages).  
- **Depends on:** Observation Package. Must not depend on Presentation, Reporting conclusions, or Configuration.  
- **Must never own:** Detection Results; Evaluation Agenda outcomes; UI; product Detected/Not Detected decisions.  
- **Non-goals:** Not multi-signal fusion conclusions; not selectors-as-architecture.  
- **Authority:** R-003; R-004; DF-INV-001; DET-INV-002; FR-015.

### P-004 — Detection Package

- **Purpose:** Prepare the evaluation agenda and produce Store Information and Detection Results per Detection Strategy.  
- **Owns:** Evaluation Agenda (IO-006); Store Information (IO-003); Detection Result Set (IO-007); emission of Unknown Qualifications (IO-008) for Open Unknowns.  
- **Consumes:** Normalized Evidence; Investigation Context; domain catalogs (FlexyPe Products; disabled-form kinds).  
- **Produces:** Store Information; Detection Results (including Not Detected / Disabled / Unknown / Available / Unavailable as justified).  
- **Depends on:** Evidence Package. Must not depend on Presentation or Configuration for core evaluation.  
- **Must never own:** Presentation-ready View; Evidence rewriting; Chrome UI; mandatory backend configuration.  
- **Non-goals:** Not report composition; not popup design; not inventing U-001/U-002 catalogs.  
- **Authority:** R-005; R-006; EP-008; EP-009; FR-010–FR-022; DET-INV-004; DET-INV-005.

### P-005 — Reporting Package

- **Purpose:** Assemble the Diagnostic Report from Detection outputs (and optional Configuration adjunct).  
- **Owns:** Diagnostic Report (IO-009).  
- **Consumes:** Store Information; Detection Result Set; Unknown Qualifications; optional Product Configuration.  
- **Produces:** Diagnostic Report for Presentation and Completion.  
- **Depends on:** Detection Package; optionally Configuration Package. Must not depend on Observation/Evidence for recollecting Evidence.  
- **Must never own:** Evidence collection; Domain Evaluation; Presentation mutation of results.  
- **Non-goals:** Not UI layout; not re-detection.  
- **Authority:** R-007; FR-020; FR-026; DF-INV-004; DF-INV-005.

### P-006 — Presentation Package

- **Purpose:** Prepare the Diagnostic Report for Operator consumption (extension popup surface conceptually).  
- **Owns:** Presentation-ready View (IO-011).  
- **Consumes:** Diagnostic Report only.  
- **Produces:** Presentation-ready View.  
- **Depends on:** Reporting Package only (for diagnostic content).  
- **Must never own:** Evidence; Normalized Evidence; Detection evaluation; Investigation targeting; Configuration fetching.  
- **Non-goals:** Not visual design system; not Chrome APIs; not detection policy.  
- **Authority:** R-009; FR-020; P-INV-003; DF-INV-002; EP-017.

### P-007 — Configuration Package (Optional)

- **Purpose:** Optionally obtain Product Configuration for detected FlexyPe Products and supply it as an Assembly adjunct.  
- **Owns:** Product Configuration (IO-010).  
- **Consumes:** Detection Result hints for which products were Detected (conceptual); optional external configuration source (U-006).  
- **Produces:** Optional Product Configuration for Reporting.  
- **Depends on:** May read Detection outcomes; must not be required by Investigation, Evidence, or Detection for core success.  
- **Must never own:** Core Evidence; core Detection Results; Presentation.  
- **Non-goals:** Not Parts 1–3 fulfillment; not Admin-mandatory core path.  
- **Authority:** R-008; FR-025; FR-026; EP-011; C-008; U-006 Open.

### P-008 — Traceability Package

- **Purpose:** Preserve assignment/obligation linkage across package outputs (governance package).  
- **Owns:** Assignment Obligation Reference discipline; visibility expectations for Unknown Qualifications in review sense.  
- **Consumes:** Claims/outputs from other packages.  
- **Produces:** Traceability assurance for architecture/review (not a storefront payload).  
- **Depends on:** Cross-cutting reference to all packages’ outputs; must not sit in the core evaluation dependency chain as a blocker.  
- **Must never own:** Detection logic; Evidence collection; UI.  
- **Non-goals:** Not replacing `03_TRACEABILITY_MATRIX`; not test runners.  
- **Authority:** R-010; EP-001; EP-015.

---

## 4. Package Collaboration

### 4.1 Allowed collaboration (conceptual)

```
Investigation
  → Observation
      → Evidence
          → Detection
              → Reporting
                  → Presentation
                      → Investigation (completion disposition only)

Configuration (optional) → Reporting   [adjunct only]

Traceability ⟷ (references outputs of all packages; non-blocking)
```

### 4.2 Ownership transfer

Aligns with Data Flow handoffs:

- Observation → Evidence: Observation Affordance  
- Evidence → Detection: Normalized Evidence (then immutable downstream)  
- Detection → Reporting: Store Information + Detection Result Set + Unknown Qualifications  
- Configuration → Reporting: Product Configuration (optional)  
- Reporting → Presentation: Diagnostic Report  
- Presentation / Reporting → Investigation: inputs to Completion Disposition  

### 4.3 Forbidden collaboration

| Forbidden | Why |
|---|---|
| Presentation → Detection / Evidence | Evaluates or collects in the wrong package (AP-010; DF-RISK-007) |
| Reporting → Evidence (recollection) | Assembly must not recollect (S-INV / DF invariants) |
| Detection → Configuration (required) | Bonus isolation (EP-011) |
| Evidence → Presentation (direct) | Bypasses Detection and Reporting |
| Configuration → Evidence | Contaminates core Evidence (DF-RISK-003) |
| Any package → Storefront mutation | EP-012 |

### 4.4 Cycles

**No cycles** among Investigation → Observation → Evidence → Detection → Reporting → Presentation.  
Investigation may observe completion outputs **only** to set disposition, not to re-enter Observation/Evidence/Detection for the same logical stage ownership inversion.

---

## 5. Package Dependency Principles

1. **Presentation depends on Reporting** (only).  
2. **Reporting depends on Detection**; may optionally depend on Configuration.  
3. **Detection depends on Evidence**.  
4. **Evidence depends on Observation**.  
5. **Observation depends on Investigation Context** (Investigation Package).  
6. **Configuration is isolated** — never upstream of Evidence/Detection success; never required by Investigation core completion.  
7. **Traceability is cross-cutting** — references outputs; does not create an evaluation dependency cycle.  
8. **No reverse dependencies** that let Presentation/Reporting redefine Evidence or Detection.  
9. **No circular dependencies** among P-001–P-007 core chain.  
10. **Dependency direction matches System Architecture §5 and Data Flow §4.**

---

## 6. Package Invariants

| ID | Invariant | Authority |
|---|---|---|
| PKG-INV-001 | Evidence Package never emits Detection Results (no Detected/Not Detected ownership). | R-003/R-004 Non-Goals; DET-INV-001; System §4 |
| PKG-INV-002 | Presentation Package never evaluates Evidence or produces Detection Results. | R-009; P-INV-003; DF-INV-002; EP-017 |
| PKG-INV-003 | Reporting Package never recollects Evidence from the Storefront. | R-007; DF-INV-005 |
| PKG-INV-004 | Configuration Package is optional and non-blocking for core Reporting content. | FR-026; EP-011; DF-INV-004; S-INV-005 |
| PKG-INV-005 | Detection Package upholds multi-signal / no-single-selector sole-basis rules for FlexyPe Products. | C-004; C-005; EP-008; DET-INV-004; ADR-003 |
| PKG-INV-006 | Detection Package emits Not Detected for insufficient-confidence FlexyPe Product presence. | FR-013; EP-009; DET-INV-005 |
| PKG-INV-007 | Normalized Evidence is not mutated by Detection, Reporting, or Presentation packages. | DF-INV-001; ADR-002 intent |
| PKG-INV-008 | Unknown Qualifications are not stripped by Reporting or Presentation. | EP-003; DF-INV-003 |
| PKG-INV-009 | Core packages require no backend package on the critical path. | NFR-001; NFR-002; EP-005; C-006; C-007 |
| PKG-INV-010 | Logical packages remain runtime-agnostic; Chrome roles do not redefine package ownership. | Master Plan Extension-after-Package ordering; EP-017 |

---

## 7. Package Variation Points

| Variation | Adaptation |
|---|---|
| **Future packages** | Add only with requirements/Vision authority; must not break acyclic dependency direction |
| **New detection responsibilities** | Extend Detection Package ownership; do not move into Presentation |
| **Optional bonus** | Configuration Package present or absent; Reporting join point unchanged |
| **Testing support** | Test doubles may stand in for Observation/Configuration at package boundaries without changing ownership |
| **Unknowns (U-001/U-002/…)** | Remain Detection/Reporting concerns via Unknown Qualifications; do not create speculative packages that invent catalogs |
| **Maintainability of detection definitions** | Evolve inside Detection Package under EP-019 / ADR-003 without leaking into Presentation |

---

## 8. Package Risks

Structural risks only—no mitigations.

| ID | Risk |
|---|---|
| PKG-RISK-001 | **Responsibility leakage** — Detection logic lands in Presentation or Evidence |
| PKG-RISK-002 | **Circular dependency** — Presentation influencing Detection/Evidence |
| PKG-RISK-003 | **Evidence mutation** — Detection/Reporting rewriting Normalized Evidence |
| PKG-RISK-004 | **Presentation ownership** — Presentation owning Diagnostic Report assembly |
| PKG-RISK-005 | **Configuration coupling** — Investigation/Detection requiring Configuration Package |
| PKG-RISK-006 | **Folder confusion** — treating this document as a mandate for a specific directory tree |
| PKG-RISK-007 | **Runtime conflation** — equating logical packages with Chrome content-script/background splits prematurely |
| PKG-RISK-008 | **Unknown-driven package sprawl** — creating packages that invent third-party/feature taxonomies |

---

## 9. Package Glossary

| Term | Meaning |
|---|---|
| **Logical Package (P-***)** | Architectural ownership partition; not a folder, file, or language module |
| **Package ownership** | Which Information Objects and responsibilities a package controls |
| **Package dependency** | Allowed conceptual depends-on relation between logical packages |
| **Acyclic core chain** | Investigation → Observation → Evidence → Detection → Reporting → Presentation without cycles |
| **Optional package** | Configuration Package; may be absent without failing core obligations |
| **Cross-cutting package** | Traceability Package; references outputs without blocking evaluation |
| **Package boundary** | Limit of what a package may own or depend on |
| **Collaboration** | Allowed conceptual interaction among packages |
| **Runtime-agnostic packaging** | Package map independent of Chrome component topology |
| **Concrete project structure** | Future mapping of logical packages to files/runtime—out of scope here |

Domain entities and Information Objects retain meanings from `04_DOMAIN_MODEL` and `08_DATA_FLOW`.

---

**End of Package Architecture.**  
Next architecture document per Architecture Master Plan: `10_EXTENSION_ARCHITECTURE` (depends on Package Architecture).
