# P-006 — Presentation Package Specification

**Status:** Active — Implementation Phase  
**Document type:** Package implementation specification (what P-006 must realize—not how)  
**Package:** P-006 Presentation  
**Repository home:** `src/presentation/`  
**Milestone home:** M6 Presentation  
**Depends on:** Frozen `architecture/00`–`13`; ADR-001–ADR-006; implementation `00`–`06`; [`P-001_INVESTIGATION_SPEC.md`](P-001_INVESTIGATION_SPEC.md)–[`P-005_REPORTING_SPEC.md`](P-005_REPORTING_SPEC.md)

This specification translates approved architecture for Package P-006 into implementation obligations. It does not redesign architecture, define UI implementation, component hierarchy, CSS, rendering frameworks, browser APIs, formatting algorithms, Detection algorithms, report assembly, or code.

**Ownership reminder:** Observation discovers. Evidence captures immutable facts. Detection evaluates. Reporting assembles. Presentation renders.

---

## 1. Purpose

The Presentation Package **prepares the Presentation-ready View** that projects the Diagnostic Report for Operator consumption on the extension popup surface (conceptually).

Per Package Architecture P-006, UI Architecture, and Pipeline S-008:

- Presentation organizes and surfaces Report content without changing its meaning.  
- Presentation preserves Report structure and Detection explainability already present in the Report.  
- Presentation never evaluates Evidence, performs Detection, assembles Reports, generates explanations, or mutates Detection Results.  
- Partial Reports remain renderable under approved progressive completeness.

**Non-goals:** Not a visual design system; not Chrome APIs; not detection policy; not merchant marketing surfaces.

---

## 2. Architectural Ownership

| Dimension | Ownership |
|---|---|
| **Logical package** | P-006 Presentation Package |
| **System responsibility** | R-009 Presentation Preparation |
| **Runtime host** | RR-006 Presentation Runtime |
| **Information objects owned** | IO-011 Presentation-ready View |
| **Domain concepts** | Operator-facing projection of one Diagnostic Report for one Investigation |
| **Pipeline stage owned (meaning)** | S-008 Presentation Preparation |
| **Presentation sections (organization)** | PS-001–PS-009 per UI Architecture |
| **Invariants** | UI-INV-001–UI-INV-006; DF-INV-002; DF-INV-003; P-INV-003; FR-020; EP-017 |

Repository placement: primary production ownership under `src/presentation/`. Operator-surface shell may be wired from `extension/` without moving ownership meaning out of P-006.

---

## 3. Responsibilities

P-006 is responsible for:

1. **Consume Diagnostic Report only** — Input boundary is IO-009 (including embedded optional configuration if present in the Report)—not raw Evidence (UI Architecture input boundary).  
2. **Produce Presentation-ready View (IO-011)** — Operator-facing preparation of the Report for the extension popup surface (conceptually).  
3. **Project Report structure** — Organize addressable concerns PS-001–PS-009 without altering meanings.  
4. **Preserve core-before-optional ordering** — Core findings precede optional Product Configuration (PS-007 after core; UI-INV-003).  
5. **Preserve Detection Result meanings** — Do not change Detected / Not Detected / Disabled / Unknown / Available / Unavailable outcomes (UI-INV-001; DF-INV-002).  
6. **Preserve Store Information meanings** — Organize/surface; do not rewrite field conclusions.  
7. **Preserve explainability** — Communicate attribution/explanation already present in the Report; never invent explanations or Part 3 reasons (ADR-004).  
8. **Preserve Unknown Qualifications visibility** — When present in the Report, Unknowns remain visible (UI-INV-002; DF-INV-003).  
9. **Display Not Detected as Not Detected** — When emitted for FlexyPe Products (UI-INV-005; FR-013).  
10. **Support partial Reports** — Partial completeness remains renderable (ADR-006; EP-018).  
11. **Remain Configuration-independent for core display** — Do not require Configuration Runtime content to show Parts 1–3 / core Objective answers (UI-INV-006; FR-026).  
12. **Inform Completion readiness** — Presentation readiness may be observed by P-001 for disposition—without Presentation owning Investigation lifecycle.

---

## 4. Must Never Own

P-006 must never own:

| Forbidden ownership | Correct owner |
|---|---|
| Evidence / Normalized Evidence | P-003 Evidence |
| Evidence evaluation or recollection | Forbidden / P-003–P-004 path |
| Detection evaluation / Detection Results generation | P-004 Detection |
| Explainability generation (new observational claims) | P-004 Detection (preserved via P-005) |
| Diagnostic Report assembly | P-005 Reporting |
| Investigation Context / Completion Disposition | P-001 Investigation |
| Observation Affordance | P-002 Observation |
| Configuration fetching | P-007 Configuration (optional) |
| Live Storefront access for presentation conclusions | Forbidden (ADR-005) |

Presentation renders; it does not discover, capture, evaluate, or assemble.

---

## 5. Inputs

| Input | Nature | Source |
|---|---|---|
| **Diagnostic Report (IO-009)** | Assembled Store Information + Detection Results (+ optional Product Configuration if attached) | P-005 Reporting |

Inputs do not include: raw Evidence, Normalized Evidence for evaluation, Observation Affordance, Evaluation Agenda as a Detection channel, or mandatory Product Configuration fetch.

---

## 6. Outputs

| Output | Nature |
|---|---|
| **Presentation-ready View (IO-011)** | Conceptual Operator-facing preparation of the Diagnostic Report for the extension popup |

**Output rules:**

- Must not alter Detection Result meanings or invent Evidence (IO-011 mutability expectations).  
- Not a UI component tree specification and not Chrome APIs.  
- One Investigation → one Report → one Presentation-ready View projection (ADR-001).  
- Partial Reports remain projectable without fabricated completeness (ADR-006).

**Section organization (architectural meaning—not UI widgets):**

| Section | Concern |
|---|---|
| PS-001 | Investigation Summary |
| PS-002 | Store Information |
| PS-003 | FlexyPe Products |
| PS-004 | Disabled Integrations |
| PS-005 | Third-party Apps |
| PS-006 | Storefront Features |
| PS-008 | Unknown Qualifications (visible; may also appear inline with PS-005/PS-006) |
| PS-007 | Optional Product Configuration (after core findings) |
| PS-009 | Investigation Status |

---

## 7. Lifecycle

P-006 owns Pipeline **S-008 Presentation Preparation**, after Diagnostic Assembly and before Completion Disposition:

```
S-007 Diagnostic Assembly (P-005)
  → S-008 Presentation Preparation (P-006)   ← this package
  → S-009 Completion Disposition (P-001)
```

**Lifecycle rules for P-006:**

1. Presentation requires Assembly—Presentation does not bypass Reporting to invent Report content.  
2. Presentation consumes Report only—never raw Evidence for evaluation.  
3. Presentation does not re-enter Detection or Evidence ownership.  
4. No browser re-query to revise presented conclusions (ADR-005).  
5. Partial Report content remains surfaceable; incomplete sections must not be filled by invented certainty (ADR-006).  
6. Completion may observe Presentation readiness; Presentation does not own disposition semantics.

---

## 8. Collaborating Packages

| Package | Collaboration with P-006 |
|---|---|
| **P-001 Investigation** | May observe Presentation readiness for Completion Disposition |
| **P-002 Observation** | No collaboration for evaluation or collection |
| **P-003 Evidence** | No consumption of Evidence for evaluation |
| **P-004 Detection** | No Detection ownership; explainability already in Report |
| **P-005 Reporting** | Sole diagnostic-content dependency (IO-009) |
| **P-007 Configuration** | Not fetched by Presentation; optional content only if already in Report |
| **P-008 Traceability** | May reference Presentation participation; non-blocking |

Canonical chain:

```
Diagnostic Report
  → Presentation-ready View
  → Operator consumption
  → Completion Disposition (P-001)
```

---

## 9. Dependency Rules

| Rule | Requirement |
|---|---|
| **Depends on** | P-005 Reporting only (for diagnostic content) |
| **Build order** | Implemented after P-005 (Package Build Order step 6) |
| **Must not depend on** | Evidence, Detection, Observation, Configuration fetching |
| **Import direction** | `… → reporting → presentation` |
| **Forbidden reverse edges** | Presentation ↛ Detection; Presentation ↛ Evidence |
| **Runtime hosting** | RR-006 hosts P-006; must never host Detection or Evidence ownership |
| **Extension shell** | `extension/` may host popup surface wiring without absorbing Detection/Evidence |

---

## 10. ADR Compliance

| ADR | P-006 obligation |
|---|---|
| **ADR-001** | Project one Report for one Investigation; no multi-Investigation aggregation in one View |
| **ADR-002** | Respect immutable Evidence boundary—never consume or mutate Evidence for evaluation |
| **ADR-003** | Do not perform definition-driven Detection in Presentation |
| **ADR-004** | Preserve Detection explanations present in the Report; never invent explanations; Presentation communicates explainability but does not create it |
| **ADR-005** | No live Storefront re-query to form or revise presented conclusions |
| **ADR-006** | Partial Reports remain renderable; do not fabricate Detected/Absent certainty in the View |

---

## 11. Engineering Principle Compliance

| Principle | P-006 obligation |
|---|---|
| **EP-003** | Keep Unknown Qualifications visible when present |
| **EP-007 / EP-004** | Invent no storefront facts and no Detection Results |
| **EP-009** | Presentation neutrality—no false certainty advocacy |
| **EP-010** | Surface explainability; do not create it |
| **EP-011 / FR-026** | Core sections display without Configuration |
| **EP-013 / FR-023 / C-013** | Internal Sales/Support investigation tool—not merchant marketing UI |
| **EP-016 / EP-017** | Presentation separate from Evidence/Detection/Reporting ownership |
| **EP-018** | Progressive completeness—partial content remain surfaceable |
| **EP-020** | Pragmatic operator projection—not a design-system platform |

---

## 12. Testing Obligations

Derived from approved Testing Strategy and Test Execution Plan—no new test architecture:

| Obligation | Mapping |
|---|---|
| Section organization; core-before-optional; Not Detected/Unknown visibility; no evaluation leakage | **VD-007**; **T4** (UI side) |
| Presentation does not change Detection meanings | **UI-INV-001**; **VD-002** |
| Pipeline Presentation after Assembly | **VD-003** |
| FR-014 operator-visible reconfirm | **VD-007** (with VD-005 empirics at M8) |
| Milestone / checkpoint | **M6** / **RG-M6**; **IC-5** |
| Runtime Presentation ≠ Detection | **VD-008** at integration |

Verification must fail if Presentation evaluates Evidence, performs Detection, assembles Reports, invents explanations, mutates Detection Results, hides Unknowns/Not Detected, or requires Configuration for core display.

---

## 13. Package Completion Criteria

From Package Build Order (P-006) and Development Milestones (M6):

□ Owns Presentation-ready View (IO-011).  
□ Consumes Diagnostic Report only.  
□ Projects PS-001–PS-009 concerns with core-before-optional discipline.  
□ Does not evaluate Evidence, perform Detection, or assemble Reports.  
□ Does not invent explanations or mutate Detection Results.  
□ Unknown Qualifications and Not Detected remain visible when present in the Report.  
□ Partial Reports remain renderable.  
□ Core display does not require Configuration.  
□ Repository ownership lives under `src/presentation/`.  
□ T4 UI-side checks and IC-5 / RG-M6 criteria are met before M7 begins.

---

## 14. Definition of Done

Package P-006 is done for implementation sequencing when:

1. Architectural ownership in §2 is realized without redesign.  
2. Responsibilities in §3 are met and must-never-own rules in §4 hold.  
3. Inputs/outputs match §§5–6.  
4. Lifecycle rules in §7 hold for S-008.  
5. Collaborator and dependency rules in §§8–9 hold.  
6. ADR and EP compliance in §§10–11 hold (especially ADR-002, ADR-004, ADR-006).  
7. Testing obligations in §12 are satisfied at M6.  
8. Package completion criteria in §13 are checked.  
9. No UI implementation, component hierarchy, CSS, rendering framework, browser APIs, formatting algorithms, Detection algorithms, report assembly, or code were introduced as Presentation ownership in this specification.

---

## 15. Conclusion

P-006 Presentation prepares the Presentation-ready View from the Diagnostic Report only—preserving structure, meanings, Unknowns, Not Detected outcomes, and Detection explainability without inventing facts or performing evaluation. Partial Reports remain renderable; Configuration never gates core display.

This specification is ownership and obligation only. Implementation mechanisms remain outside its scope.

---

**End of P-006 Presentation Package Specification.**
