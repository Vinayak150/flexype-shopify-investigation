# P-004 — Detection Package Specification

**Status:** Active — Implementation Phase  
**Document type:** Package implementation specification (what P-004 must realize—not how)  
**Package:** P-004 Detection  
**Repository home:** `src/detection/`  
**Milestone home:** M4 Detection  
**Depends on:** Frozen `architecture/00`–`13`; ADR-001–ADR-006; implementation `00`–`06`; [`P-001_INVESTIGATION_SPEC.md`](P-001_INVESTIGATION_SPEC.md); [`P-002_OBSERVATION_SPEC.md`](P-002_OBSERVATION_SPEC.md); [`P-003_EVIDENCE_SPEC.md`](P-003_EVIDENCE_SPEC.md)

This specification translates approved architecture for Package P-004 into implementation obligations. It does not redesign architecture, define detection algorithms, scoring formulas, confidence calculations, browser APIs, DOM selectors, Evidence acquisition, reporting logic, UI, or code.

**Ownership reminder:** Observation discovers. Evidence captures immutable facts. Detection evaluates. Reporting assembles. Presentation renders.

---

## 1. Purpose

The Detection Package **prepares the Evaluation Agenda** and **produces Store Information and Detection Results** by evaluating approved architectural definitions against **immutable Normalized Evidence**.

Per Package Architecture P-004, Detection Strategy, ADR-003, and ADR-004:

- Detection consumes the Evidence snapshot; it never recollects or rewrites Evidence.  
- Detection is definition-driven—not selector-driven as architectural truth.  
- Detection produces explainable Detection Results attributable to Evidence.  
- Detection does not assemble Reports, render UI, own Investigation lifecycle, or require Configuration.

**Non-goals:** Not report composition; not popup design; not inventing U-001/U-002 catalogs; not multi-signal algorithm prescription.

---

## 2. Architectural Ownership

| Dimension | Ownership |
|---|---|
| **Logical package** | P-004 Detection Package |
| **System responsibilities** | R-005 Detection Coordination; R-006 Domain Evaluation |
| **Runtime host** | RR-004 Detection Runtime |
| **Information objects owned** | IO-006 Evaluation Agenda; IO-003 Store Information; IO-007 Detection Result Set; emission of IO-008 Unknown Qualifications |
| **Domain concepts** | Detection Result outcomes; FlexyPe Product presence questions; Disabled Integration forms; Unknown-qualified agenda items |
| **Pipeline stages owned (meaning)** | S-005 Evaluation Preparation; S-006 Domain Evaluation |
| **Invariants** | DET-INV-004; DET-INV-005; EP-008; EP-009; FR-010–FR-022; ADR-003; ADR-004 |

Repository placement: primary production ownership under `src/detection/`. Runtime hosting may be wired from `extension/` without moving ownership meaning out of P-004.

---

## 3. Responsibilities

P-004 is responsible for:

1. **Consume Investigation Context** — Evaluate only within one Investigation / one Storefront target (P-001; ADR-001).  
2. **Consume immutable Normalized Evidence (IO-005)** — Evaluate the snapshot produced by P-003; never evaluate the live Storefront directly (ADR-002; ADR-005).  
3. **Evaluation Preparation (S-005 / R-005)** — Produce Evaluation Agenda (IO-006) covering obligated investigatory questions (FlexyPe Products, Disabled Integrations, Store Information/Theme, Third-party Apps, Storefront Features), retaining Unknown-qualified questions rather than dropping them silently (EP-003; FR-019; FR-022).  
4. **Definition-driven Domain Evaluation (S-006 / R-006)** — Evaluate architectural definitions against Normalized Evidence (ADR-003).  
5. **Produce Store Information (IO-003)** — Part 1 field conclusions from public Evidence, including Available/Unavailable honesty where applicable.  
6. **Produce Detection Result Set (IO-007)** — Including Detected, Not Detected, Disabled, Unknown, Available/Unavailable as justified by Detection Strategy and assignment outcomes.  
7. **Emit Unknown Qualifications (IO-008)** — Mark agenda items/results influenced by Open Domain Unknowns (`U-*`).  
8. **Preserve Not Detected honesty** — Insufficient-confidence FlexyPe product presence yields Not Detected (FR-013)—not fabricated Detected/Absent certainty (ADR-006).  
9. **Preserve explainability** — Every Detection Result must be attributable to Evidence, or explicitly Unknown / Not Detected / Unavailable under approved semantics (ADR-004). Explanation belongs with Detection Results, not Presentation invention.  
10. **Uphold multi-signal posture** — No single hardcoded selector as sole basis for FlexyPe Product presence (C-004; C-005; EP-008; ADR-003).  
11. **Closed product set** — FlexyPe products remain Checkout, FlexyPass, FlexyCart (C-011).  
12. **Remain Configuration-independent for core evaluation** — Must not depend on Configuration for core Detection success (EP-011).

---

## 4. Must Never Own

P-004 must never own:

| Forbidden ownership | Correct owner |
|---|---|
| Evidence acquisition / collection | P-003 Evidence |
| Evidence normalization | P-003 Evidence |
| Evidence mutation / rewriting | Forbidden (ADR-002) |
| Observation Affordance | P-002 Observation |
| Investigation Context / Completion Disposition | P-001 Investigation |
| Diagnostic Report construction | P-005 Reporting |
| Presentation-ready View / Chrome UI | P-006 Presentation |
| Mandatory backend / Product Configuration | P-007 optional; never required for core Detection |
| Live Storefront re-query during evaluation | Forbidden (ADR-005) |

Detection interprets Evidence against definitions; it does not capture Evidence, assemble Reports, or render UI.

---

## 5. Inputs

| Input | Nature | Source |
|---|---|---|
| **Investigation Context (IO-001)** | Episode binding | P-001 Investigation |
| **Normalized Evidence (IO-005)** | Immutable evaluation-ready snapshot | P-003 Evidence |
| **Domain catalogs (conceptual)** | FlexyPe Products; disabled-form kinds; obligated agenda categories | Domain Model / Detection Strategy / Requirements |

Inputs do not include: live Storefront as evaluation source, Observation Affordance as Detection input, Diagnostic Report, Presentation-ready View, or mandatory Product Configuration.

---

## 6. Outputs

| Output | Nature |
|---|---|
| **Evaluation Agenda (IO-006)** | Conceptual list of investigatory questions; retains Unknown-qualified items |
| **Store Information (IO-003)** | Part 1 field conclusions (may be partial) |
| **Detection Result Set (IO-007)** | Outcomes per agenda items (Detected / Not Detected / Disabled / Unknown / Available / Unavailable as justified) |
| **Unknown Qualifications (IO-008)** | Explicit markers for Open Unknown influence |

**Output rules:**

- Reporting consumes Detection outputs (and Store Information / Unknown Qualifications)—not raw Evidence acquisition.  
- Presentation consumes Reports—not Detection Results directly as an evaluation channel.  
- Explanation/attribution intent is produced with Detection Results (and preserved by Reporting); Presentation communicates but does not create explainability (ADR-004).  
- Conclusions never invent Evidence (ADR-004).  
- Selectors/heuristics remain implementation mechanisms—not architectural outputs (ADR-003).

---

## 7. Lifecycle

P-004 owns Pipeline **S-005** and **S-006**, after Evidence Consolidation and before Diagnostic Assembly:

```
S-003–S-004 Evidence (P-003) → Immutable Normalized Evidence
  → S-005 Evaluation Preparation (P-004)   ← agenda
  → S-006 Domain Evaluation (P-004)        ← results
  → S-007 Diagnostic Assembly (P-005)
  → S-008 Presentation (P-006)
  → S-009 Completion (P-001)
```

**Lifecycle rules for P-004:**

1. Detection begins only after Normalized Evidence exists for the Investigation.  
2. Detection evaluates the snapshot exclusively—never the live Storefront (ADR-005).  
3. Detection never mutates Normalized Evidence (ADR-002).  
4. Every agenda item receives a conceptual outcome state, including Unknown or Not Detected where appropriate (S-006).  
5. Unknown-qualified agenda items are retained, not silently dropped (S-005).  
6. No false certainty for insufficient-confidence FlexyPe product presence (FR-013; ADR-006).  
7. Do not invent U-001/U-002 catalogs to force green outcomes (EP-003).

---

## 8. Collaborating Packages

| Package | Collaboration with P-004 |
|---|---|
| **P-001 Investigation** | Provides Investigation Context; Detection does not own disposition |
| **P-002 Observation** | No direct Detection ownership; Observation must not evaluate |
| **P-003 Evidence** | Provides immutable Normalized Evidence; Detection must not rewrite it |
| **P-005 Reporting** | Consumes Store Information, Detection Results, Unknown Qualifications |
| **P-006 Presentation** | Must not evaluate; communicates Report explainability only |
| **P-007 Configuration** | Not required for core Detection; may later adjunct Reporting only |
| **P-008 Traceability** | May reference Detection outputs; non-blocking |

Canonical chain (ADR-003 / ADR-004):

```
Investigation
  → Immutable Normalized Evidence
  → Architectural Detection Definitions
  → Detection Evaluation
  → Detection Results (explainable)
  → Diagnostic Report
  → Presentation
```

---

## 9. Dependency Rules

| Rule | Requirement |
|---|---|
| **Depends on** | P-003 Evidence (Normalized Evidence); Investigation Context |
| **Build order** | Implemented after P-003 and before P-005 (Package Build Order step 4) |
| **Downstream consumer** | P-005 Reporting consumes Detection outputs |
| **Must not depend on** | Presentation; Configuration for core evaluation |
| **Must not depend on** | Observation/Evidence for recollection or live re-query |
| **Import direction** | `… → evidence → detection → reporting → …` |
| **Forbidden reverse edges** | Detection must not import Presentation; must not mutate Evidence |
| **Runtime hosting** | RR-004 hosts P-004; must never own Evidence mutation or mandatory Configuration |

---

## 10. ADR Compliance

| ADR | P-004 obligation |
|---|---|
| **ADR-001** | Detection Results belong to one Investigation / one Storefront episode |
| **ADR-002** | Consume immutable Normalized Evidence; never mutate or rewrite it; no conclusion-driven Evidence edits |
| **ADR-003** | Definition-driven Detection; selectors/heuristics are not architectural truth; no single-selector sole basis for FlexyPe Products |
| **ADR-004** | Explainable Results—attributable to Evidence; Presentation does not invent explanations; Unknown/Not Detected remain explainable restraint outcomes |
| **ADR-005** | Never evaluate the live Storefront directly; never initiate acquisition to revise results; evaluate the snapshot only |
| **ADR-006** | Not Detected / Unknown / Unavailable remain valid; do not fabricate Detected/Absent certainty |

---

## 11. Engineering Principle Compliance

| Principle | P-004 obligation |
|---|---|
| **EP-001 / EP-002** | Detect only assignment-traceable obligations; no invented requirements |
| **EP-003 / EP-004** | Preserve Open Unknowns; no silent catalog invention for U-001/U-002 |
| **EP-007** | Evidence-based conclusions only |
| **EP-008** | Multi-signal validation posture for FlexyPe Products |
| **EP-009** | Representable uncertainty (Not Detected / Unknown) |
| **EP-010** | Explainability where demanded—produced in Detection Results, not UI invention |
| **EP-011** | Optional Configuration isolation from core Detection |
| **EP-016 / EP-017** | Architecture-first ownership; Detection separate from Evidence/Reporting/Presentation |
| **EP-018** | Progressive completeness—partial/Unknown outcomes allowed |
| **EP-019 / EP-020** | Maintainable definition-driven reasoning without selector-as-architecture or overbuilding |

---

## 12. Testing Obligations

Derived from approved Testing Strategy and Test Execution Plan—no new test architecture:

| Obligation | Mapping |
|---|---|
| Definition-driven / multi-signal / Not Detected / Unknown honesty | **VD-005**; **T3** |
| Consume immutable Evidence only (no rewrite / no live re-query) | **VD-004** (prerequisite); ADR-002/ADR-005 checks |
| Ownership non-inversion (Detection ≠ Presentation/Evidence) | **VD-002** |
| Pipeline Evaluation Preparation → Domain Evaluation before Assembly | **VD-003** |
| FR-014 reference storefront empirics | **VD-005** (intensified at M8) |
| Milestone / checkpoint | **M4** / **RG-M4**; **IC-3** |
| Runtime hosting without Evidence mutation | **VD-008** at integration |

Verification must fail if Detection mutates Evidence, evaluates the live Storefront, uses a single selector as sole architectural basis for FlexyPe Products, fabricates certainty, invents Unknown catalogs, or depends on Configuration for core evaluation.

---

## 13. Package Completion Criteria

From Package Build Order (P-004) and Development Milestones (M4):

□ Owns Evaluation Agenda (IO-006), Store Information (IO-003), Detection Result Set (IO-007), and Unknown Qualification emission (IO-008).  
□ Consumes immutable Normalized Evidence only for evaluation.  
□ Produces Detection Results including Not Detected / Unknown / Unavailable as justified.  
□ Does not rewrite Evidence, recollect Evidence, assemble Reports, or render UI.  
□ Does not require Configuration for core evaluation.  
□ Definition-driven posture and multi-signal / no-single-selector-sole-basis rules hold (ADR-003).  
□ Explainability attribution holds with Detection Results (ADR-004).  
□ Open Unknowns are not closed by invention.  
□ Repository ownership lives under `src/detection/`.  
□ T3 detection checks and IC-3 / RG-M4 criteria are met before M5 begins.

---

## 14. Definition of Done

Package P-004 is done for implementation sequencing when:

1. Architectural ownership in §2 is realized without redesign.  
2. Responsibilities in §3 are met and must-never-own rules in §4 hold.  
3. Inputs/outputs match §§5–6.  
4. Lifecycle rules in §7 hold for S-005 and S-006.  
5. Collaborator and dependency rules in §§8–9 hold.  
6. ADR and EP compliance in §§10–11 hold (especially ADR-002, ADR-003, ADR-004, ADR-005, ADR-006).  
7. Testing obligations in §12 are satisfied at M4.  
8. Package completion criteria in §13 are checked.  
9. No detection algorithms, scoring formulas, confidence calculations, browser APIs, DOM selectors, Evidence acquisition logic, reporting logic, UI, or code were introduced as Detection ownership in this specification.

---

## 15. Conclusion

P-004 Detection evaluates immutable Normalized Evidence against architectural definitions to produce an Evaluation Agenda, Store Information, explainable Detection Results, and Unknown Qualifications. It never recollects or rewrites Evidence, never evaluates the live Storefront, never assembles Reports, and never renders UI.

This specification is ownership and obligation only. Implementation mechanisms remain outside its scope.

---

**End of P-004 Detection Package Specification.**
