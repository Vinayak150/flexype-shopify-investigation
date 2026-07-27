# E-008 — Presentation Engine

**Status:** Active — Execution Phase  
**Document type:** Execution specification for Package P-006 (Presentation)  
**Milestone alignment:** M6 Presentation / IC-5 / T4 (UI side) / RG-M6  
**Depends on:** Frozen architecture `00`–`13`; ADR-001–ADR-006; implementation `00`–`06`; [`P-006_PRESENTATION_SPEC.md`](../specs/P-006_PRESENTATION_SPEC.md); [`E-001_REPOSITORY_BOOTSTRAP.md`](E-001_REPOSITORY_BOOTSTRAP.md)–[`E-007_REPORTING_ENGINE.md`](E-007_REPORTING_ENGINE.md)

This execution package implements **only** P-006 Presentation ownership: projection of the Diagnostic Report into a Presentation-ready View (IO-011).

**Normative slogan:** Presentation owns projection of the Diagnostic Report into a presentation-ready view. Presentation does **NOT** perform Detection, assemble Reports, or acquire data.

It does **not** implement browser interaction, Observation, Evidence acquisition, Detection, Report assembly, Configuration retrieval, Traceability execution, or UI-framework rendering.

---

## 1. Purpose

Realize the Presentation Engine so that:

- One Presentation-ready View is projected from one Diagnostic Report per Investigation (ADR-001; FR-020)  
- Report meanings, Unknowns, Not Detected outcomes, and explanation provenance are preserved (ADR-004; ADR-006)  
- Section organization follows UI Architecture PS-001–PS-009 with core-before-optional discipline  
- Projection remains UI-framework independent (ViewModel/structures only)  
- Core display does not require Configuration (FR-026)  

---

## 2. Scope

### In scope

- `src/presentation/` implementation of P-006  
- Presentation lifecycle (S-008 Presentation Preparation)  
- ViewProjector, PresentationView / ViewModel, ViewSection, formatting boundaries  
- Public interfaces, internal modules, error boundaries  
- Tests for deterministic projection, neutrality, Unknown/NotDetected visibility, core-before-optional order  

### Out of scope

- React/Vue/HTML/CSS component trees or Chrome popup DOM rendering  
- Evidence/Detection/Observation/browser ports  
- Diagnostic Report assembly (P-005 / E-007)  
- Configuration fetching (display optional config only if already in Report)  
- Inventing explanations or Detection outcomes  

---

## 3. Presentation Responsibilities

Implement only P-006 responsibilities:

| Responsibility | E-008 realization |
|---|---|
| Consume Diagnostic Report only | Accept IO-009; reject Evidence/Detection inputs for evaluation |
| Produce Presentation-ready View (IO-011) | Emit framework-independent ViewModel/structures |
| Project Report structure | Map content into PS-001–PS-009 section projections |
| Preserve core-before-optional order | PS-007 Optional Configuration after core findings |
| Preserve Detection Result meanings | No outcome rewriting (UI-INV-001) |
| Preserve Store Information meanings | Organize/surface only |
| Preserve explainability | Surface ExplanationReferences already in Report; never invent (ADR-004) |
| Preserve Unknown visibility | Unknown Qualifications remain visible (UI-INV-002) |
| Display Not Detected as Not Detected | When present for FlexyPe Products (UI-INV-005) |
| Support partial Reports | Partial content remain projectable (ADR-006) |
| Configuration independence | Core sections project without Configuration (UI-INV-006) |
| Inform Completion readiness | Emit View readiness for P-001 disposition observation |

---

## 4. Public Interfaces

### 4.1 PresentationEngine

| Concern | Specification |
|---|---|
| **Purpose** | Entry point for presentation session over a sealed Diagnostic Report |
| **Operations** | `present(context, diagnosticReport) → PresentationView` (or equivalent) |
| **Must not** | Assemble reports, evaluate Evidence/Detection, fetch Configuration, render framework UI |

### 4.2 ViewProjector

| Concern | Specification |
|---|---|
| **Purpose** | Project Report content into ViewSections / ViewModel |
| **Inputs** | Readonly DiagnosticReport (+ Report metadata already on Report) |
| **Outputs** | Structured PresentationView |

### 4.3 PresentationView / ViewModel

| Concern | Specification |
|---|---|
| **Purpose** | Realize IO-011 as UI-framework-independent projection |
| **Contents** | Ordered ViewSections, preserved outcomes, explanation refs, completeness/status cues from Report |
| **Non-goals** | Not Chrome APIs; not component instances; not CSS |

### 4.4 ViewSection

| Concern | Specification |
|---|---|
| **Purpose** | One PS-* organizational projection unit |
| **Members** | Section id (PS-001…PS-009), projected fields/items, visibility flags as needed |
| **Must not** | Invent Detection Results absent from Report |

### 4.5 PresentationFormatter

| Concern | Specification |
|---|---|
| **Purpose** | UI-ready value formatting boundaries (display strings/ordering helpers) |
| **May** | Format values already present in Report for operator readability |
| **Must not** | Change semantic outcomes; invent missing Theme/Product conclusions; score confidence |

### 4.6 PresentationMetadata

| Concern | Specification |
|---|---|
| **Purpose** | Episode/view metadata derived from Report/Investigation identity for the View |
| **Must not** | Rebind Storefront target or pull live browser state |

### 4.7 Presentation session / init / shutdown

| Operation | Specification |
|---|---|
| **open session** | Bind InvestigationId + readonly DiagnosticReport |
| **project** | Build ViewSections → format display values → seal PresentationView |
| **initialize / shutdown** | No browser/Evidence/Detection/Report-assembly dependencies |

---

## 5. Internal Modules

Suggested layout under `src/presentation/`:

| Module | Responsibility |
|---|---|
| `engine` | PresentationEngine entry |
| `projector` | ViewProjector |
| `view` | PresentationView / ViewModel |
| `sections` | ViewSection builders for PS-001–PS-009 |
| `formatter` | PresentationFormatter (semantic-neutral) |
| `metadata` | PresentationMetadata |
| `session` | Presentation session lifecycle |
| `errors` | Projection input/validation boundaries |
| `index` | Minimal public exports |

**Forbidden:** Report assemblers, Detection evaluators, Evidence collectors, browser/DOM observation, framework renderers, Configuration clients.

Satisfies E-003 `PresentationPort`.

---

## 6. Presentation Lifecycle

Align with Pipeline **S-008** after Diagnostic Assembly:

```
DiagnosticReport (P-005 / E-007)
  → open presentation session
  → validate readonly Report input
  → project ViewSections (PS-001–PS-009 order rules)
  → format display values (non-semantic)
  → preserve explanations / Unknowns / NotDetected
  → seal PresentationView (IO-011)
  → Completion may observe readiness (P-001; disposition owned there)
```

### Lifecycle rules

1. Presentation requires Assembly—does not bypass Reporting to invent Report content.  
2. Consumes Report only—never raw Evidence for evaluation.  
3. Does not re-enter Detection or Evidence ownership.  
4. No live Storefront re-query to revise presented conclusions (ADR-005).  
5. Partial Report content remains projectable; do not fabricate certainty (ADR-006).  
6. One Investigation → one Report → one PresentationView projection (ADR-001).

---

## 7. View Projection Rules

| Rule | Requirement |
|---|---|
| **Deterministic projection** | Same DiagnosticReport ⇒ same PresentationView content |
| **Immutable Report consumption** | Treat DiagnosticReport as read-only; do not mutate it |
| **Report-only derivation** | View derived only from DiagnosticReport, its metadata, and embedded explanation references |
| **No additional inference** | No product presence, Evidence evaluation, or Detection during presentation |
| **Section map** | Project PS-001 Summary; PS-002 Store Information; PS-003 FlexyPe Products; PS-004 Disabled Integrations; PS-005 Third-party Apps; PS-006 Storefront Features; PS-008 Unknown Qualifications (visible; may also appear inline with PS-005/PS-006); PS-007 Optional Configuration after core; PS-009 Investigation Status |
| **Core before optional** | PS-007 must not displace or gate core findings (UI-INV-003) |
| **NotDetected visibility** | Emit NotDetected labels when present in Report (UI-INV-005) |
| **Unknown visibility** | Unknown Qualifications remain visible when present (UI-INV-002) |
| **Framework independence** | ViewModel/structures only—no React/Vue/Lit/etc. in this package |

---

## 8. Formatting Rules

| Rule | Requirement |
|---|---|
| **Semantic neutrality** | Formatting must not change DetectionOutcome or Store Information meanings |
| **No invention** | Formatter must not invent Theme names, product Detected states, or explanations |
| **Explanation preservation** | ExplanationReferences pass through for operator communication; no new Part 3 reasons |
| **Partial display** | Unavailable/partial fields display as incomplete—not coerced to false Available/Detected |
| **Internal-tool pragmatism** | Formatting serves Sales/Support investigation readability—not merchant marketing surfaces (UI-P-010) |
| **No CSS/component ownership** | Formatting outputs remain data-level (strings/flags/order), not styled components |

---

## 9. Dependency Rules

| Rule | Requirement |
|---|---|
| **Depends on** | Diagnostic Report (P-005 / E-007); Investigation Context identity as needed; E-002 Presentation contracts |
| **Location** | `src/presentation/` |
| **Satisfies** | E-003 `PresentationPort` |
| **Must not depend on** | Evidence, Detection, Observation/browser, Reporting assembly internals, Configuration fetch |
| **Runtime hosting** | RR-006 / `extension/` may later bind ViewModel to popup UI; rendering is outside E-008 ownership |
| **Tests** | `tests/presentation/`; production must not depend on tests |

Import direction: `… → reporting → presentation`

---

## 10. Package Boundaries

| Boundary | Enforcement |
|---|---|
| Presentation vs Reporting | Project Report only; do not assemble IO-009 |
| Presentation vs Detection | No evaluation; no outcome invention |
| Presentation vs Evidence | No Evidence consumption for evaluation |
| Presentation vs Observation/Browser | No page interaction in this package |
| Presentation vs Configuration | Display only if already in Report; never fetch |
| Presentation vs UI frameworks | ViewModel only; framework rendering deferred to hosting shell outside P-006 meaning |
| Error boundary | Missing Report → presentation error; missing optional Configuration → omit PS-007 without failing core view |

Crossing into Detection/Evidence/Reporting ownership fails E-008 / RG-M6.

---

## 11. Testing Obligations

| Obligation | Expectation |
|---|---|
| **Report-only input** | present rejects/does not require Evidence/Detection ports |
| **Determinism** | Same Report ⇒ same PresentationView |
| **Readonly Report** | Report outcomes unchanged after projection |
| **Section order** | Core findings before optional Configuration |
| **NotDetected / Unknown** | Visible when present in Report fixtures |
| **No invented explanations** | ExplanationReferences match Report; no fabricated snippets |
| **Partial Reports** | Project without fabricating Detected/Available certainty |
| **Configuration independence** | Core sections project with Configuration absent |
| **Framework independence** | Package exports ViewModel/structures—not framework components |
| **VD/T mapping** | **VD-007**; **T4** (UI); **IC-5**; **RG-M6**; FR-014 visibility reconfirm at M8 |

---

## 12. Deliverables

□ `src/presentation/` modules: engine, projector, view, sections, formatter, metadata, session, errors  
□ PresentationView / ViewSection / PresentationMetadata aligned with E-002 and PS-001–PS-009  
□ PresentationFormatter with semantic-neutral formatting only  
□ PresentationPort fulfillment for E-003  
□ `tests/presentation/` covering §11  
□ No Detection/Evidence/Reporting-assembly/browser/UI-framework rendering logic  

---

## 13. Completion Criteria

□ P-006 completion criteria satisfied  
□ IO-011 produced from IO-009 only  
□ UI Architecture section organization and core-before-optional hold  
□ ADR-004 explainability preserved (not invented); ADR-006 partial honesty preserved  
□ ADR-002/ADR-005 boundaries respected (no Evidence/live re-query)  
□ Must-never-own set respected  
□ Framework-independent ViewModel delivered  
□ T4 UI-side checks / IC-5 / RG-M6 ready  

---

## 14. Definition of Done

E-008 is done when:

1. Deliverables in §12 exist.  
2. Completion criteria in §13 are checked.  
3. Presentation Engine can deterministically project a Presentation-ready View from a Diagnostic Report with correct section order and preserved meanings/Unknowns/explanations.  
4. No Detection, Evidence acquisition, Report assembly, browser interaction, or UI-framework rendering was implemented.  
5. Ownership matches P-006 / UI Architecture / Pipeline S-008 without redesign.

---

## 15. Conclusion

E-008 implements the Presentation Engine as P-006: a UI-framework-independent projection of one Diagnostic Report into a Presentation-ready View—preserving structure, meanings, Unknowns, Not Detected outcomes, and explanation provenance—without evaluating Evidence, assembling Reports, or rendering popup components.

---

**End of E-008 Presentation Engine.**
