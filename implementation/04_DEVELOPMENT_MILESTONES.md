# 04 — Development Milestones

**Status:** Active — Implementation Phase  
**Document type:** Milestone execution plan (when milestones begin/end—not how code is written)  
**Depends on:** [`00_IMPLEMENTATION_PLAN.md`](00_IMPLEMENTATION_PLAN.md); [`01_REPOSITORY_STRUCTURE.md`](01_REPOSITORY_STRUCTURE.md); [`02_CODING_STANDARDS.md`](02_CODING_STANDARDS.md); [`03_PACKAGE_BUILD_ORDER.md`](03_PACKAGE_BUILD_ORDER.md); frozen `architecture/00`–`13`; ADR-001–ADR-006

This document defines **execution milestones** for implementation: objectives, entry/exit criteria, dependencies, review gates, deliverables, freeze points, and rollback expectations. It does not define APIs, interfaces, algorithms, package internals, or implementation logic.

Milestone names are those already established in [`00_IMPLEMENTATION_PLAN`](00_IMPLEMENTATION_PLAN.md). They are not redefined here.

---

## 1. Purpose

Provide a reviewable, sequential execution plan so that:

- Each milestone produces testable progress before the next begins  
- Package build order (`P-001`→`P-006`, optional `P-007`, non-blocking `P-008`) stays aligned  
- Testing checkpoints (`T0`–`T6`) and integration checkpoints (`IC-0`–`IC-8`) have clear milestone homes  
- Architecture and ADRs remain frozen throughout delivery  

---

## 2. Scope

### In scope

- Milestone philosophy and sequence M1–M9  
- Per-milestone objectives, inputs, deliverables, entry/exit criteria, review gates, dependencies  
- Cross-milestone rules, freeze policy, risk management, rollback expectations  

### Out of scope

- Code, APIs, interfaces, algorithms, browser APIs, package internals  
- Architectural redesign or renaming of established milestones  
- Closing Open Unknowns (`U-001`–`U-010`) by invention  
- Mandatory delivery of optional Configuration (`P-007` / FR-025)

---

## 3. Relationship to Architecture

| Authority | Role during milestones |
|---|---|
| Implementation Plan | Establishes M1–M9 intents and testing checkpoints T0–T6 |
| Package Build Order | Maps milestones to packages and IC-* checkpoints |
| Repository Structure / Coding Standards | Physical homes and import direction discipline |
| Package / Extension / UI / Pipeline / Detection | Ownership and stage meaning that milestones realize |
| Testing Strategy (`VD-*`) | Verification domains exercised at M8 and continuously |
| ADR-001–ADR-006 | Non-negotiable gates at relevant milestones |
| Architecture Review | Final acceptance authority context for M9 |

Architecture remains frozen for the entire M1–M9 sequence.

---

## 4. Milestone Philosophy

| Principle | Meaning |
|---|---|
| **Sequential progress** | M(n+1) does not start until M(n) exit criteria and review gate pass |
| **Reviewable slices** | Each milestone yields inspectable ownership-aligned deliverables |
| **Testable progress** | Exit implies relevant T*/IC* checks, not “works on my machine” anecdotes |
| **One ownership focus** | Later milestones do not redefine earlier package ownership |
| **Architecture frozen** | Implementation issues are fixed in code/planning—not by thawing ADRs |
| **Optional isolation** | Configuration bonus never blocks M2–M7 core path |
| **Unknown honesty** | Milestones must not close `U-*` by invention |
| **Small reviewable commits** | Within a milestone, changes stay attributable to package ownership |
| **Rollback to last green gate** | If a milestone fails its gate, return to last passed milestone state and fix forward |

---

## 5. Milestone Overview

| Milestone | Intent (from Implementation Plan) | Primary package / focus | Key checkpoints |
|---|---|---|---|
| **M1 Foundation** | Delivery shell + freeze compliance readiness | Repo roots; freeze | IC-0; T0 |
| **M2 Core Domain** | Investigation root operable as unit of work | P-001 | IC-1; T1 (start) |
| **M3 Evidence** | Single acquisition → immutable Normalized Evidence | P-002, P-003 | IC-2; T1/T2 |
| **M4 Detection** | Definition-driven results + Not Detected + partial honesty | P-004 | IC-3; T3 |
| **M5 Reporting** | One Diagnostic Report per Investigation | P-005 | IC-4; T4 (start) |
| **M6 Presentation** | Operator popup organization without evaluation leakage | P-006 | IC-5; T4 |
| **M7 Integration** | Full core runtime collaboration path | Extension hosting of RR-* | IC-6; T5 |
| **M8 Verification** | VD domains + FR-014 empirics + docs | Cross-package verification | IC-8; T6 (start) |
| **M9 Final Acceptance** | DoD met; optional bonus decision recorded separately | Acceptance | T6; M9 gate |

Optional **P-007 Configuration** and non-blocking **P-008 Traceability** may proceed in parallel lanes per Package Build Order; they do not insert new milestone numbers or rename M1–M9.

---

## 6. Milestone Details (M1–M9)

### M1 — Foundation

- **Objective:** Establish delivery shell and freeze-compliance readiness so later packages have correct repository homes and governance without implementing detection logic.  
- **Inputs:** Frozen `architecture/00`–`13`; ADR-001–ADR-006; Implementation docs `00`–`03`.  
- **Expected Deliverables:** Repository top-level organization per Repository Structure; freeze/change-control understanding; Foundation readiness for P-001 work; no ownership inversion introduced.  
- **Entry Criteria:** Architecture Review authorizes implementation; implementation planning baseline `00`–`03` available; T0 freeze gate understood.  
- **Exit Criteria:** IC-0 satisfied; `architecture/` and approved ADRs unedited for convenience; `src/`, `extension/`, `tests/`, and related roots designated; coding import-direction rules acknowledged; ready for M2 without skipping ownership.  
- **Review Gate:** **RG-M1** — Confirm freeze integrity and repository ownership map; reject any architecture thaw or premature Detection/Presentation implementation.  
- **Dependencies:** None upstream among M1–M9; blocked only by missing frozen architecture/ADR baseline.

---

### M2 — Core Domain

- **Objective:** Make the Investigation root operable as the unit of work (ADR-001; P-001; R-001).  
- **Inputs:** M1 exit; Domain vocabulary for Investigation and Completion Disposition; Package completion criteria for P-001.  
- **Expected Deliverables:** P-001 Investigation ownership realized under `src/investigation/`; Investigation Context and disposition hooks without Evidence/Detection/Presentation leakage; IC-1 readiness.  
- **Entry Criteria:** M1 review gate passed; P-001 prerequisites met (Package Build Order).  
- **Exit Criteria:** P-001 completion criteria met; one Storefront target per episode model; no forbidden imports; T1 ownership checks applicable to Investigation root pass.  
- **Review Gate:** **RG-M2** — Verify ADR-001 compliance and Investigation must-never-own set.  
- **Dependencies:** M1 Foundation.

---

### M3 — Evidence

- **Objective:** Realize Observation then Evidence so a single acquisition produces immutable Normalized Evidence (ADR-005; ADR-002; P-002; P-003).  
- **Inputs:** M2 exit; Observation/Evidence package prerequisites; single-scan and immutability rules.  
- **Expected Deliverables:** P-002 then P-003 in build order; Observation Affordance; Normalized Evidence immutable for downstream; IC-2 satisfied.  
- **Entry Criteria:** M2 review gate passed; P-002/P-003 prerequisites met.  
- **Exit Criteria:** P-002 and P-003 completion criteria met; T2 snapshot checks pass; T1 ownership checks still hold; no product conclusions inside Evidence.  
- **Review Gate:** **RG-M3** — Verify single acquisition and Evidence immutability; reject live re-query patterns for downstream use.  
- **Dependencies:** M2 Core Domain.

---

### M4 — Detection

- **Objective:** Produce definition-driven Detection results with Not Detected and partial/Unknown honesty (ADR-003; ADR-004; ADR-006; P-004).  
- **Inputs:** M3 exit; immutable Normalized Evidence; Detection Strategy constraints.  
- **Expected Deliverables:** P-004 Detection ownership; Store Information and Detection Result Set (including Not Detected / Unknown / Unavailable as justified); Unknown Qualification emission where required; IC-3 satisfied.  
- **Entry Criteria:** M3 review gate passed; P-004 prerequisites met; Configuration not required.  
- **Exit Criteria:** P-004 completion criteria met; T3 detection checks pass; no Evidence rewrite; no single-selector-as-sole-architecture posture; Open Unknowns not closed by invention.  
- **Review Gate:** **RG-M4** — Verify multi-signal posture, explainability attribution readiness, and partial-failure honesty.  
- **Dependencies:** M3 Evidence.

---

### M5 — Reporting

- **Objective:** Assemble one Diagnostic Report per Investigation from Detection outputs (P-005; IO-009; FR-020).  
- **Inputs:** M4 exit; Detection outputs and Unknown Qualifications.  
- **Expected Deliverables:** P-005 Reporting ownership; Diagnostic Report for Completed or Completed Partial cases; no Evidence recollection; core report without Configuration; IC-4 satisfied.  
- **Entry Criteria:** M4 review gate passed; P-005 prerequisites met.  
- **Exit Criteria:** P-005 completion criteria met; T4 report-side checks applicable to Reporting pass; Unknown Qualifications preserved.  
- **Review Gate:** **RG-M5** — Verify one Report per Investigation and assembly-only ownership.  
- **Dependencies:** M4 Detection.

---

### M6 — Presentation

- **Objective:** Organize operator-facing Presentation-ready View without evaluation leakage (P-006; PS-*; UI invariants).  
- **Inputs:** M5 exit; Diagnostic Report; UI Architecture section-order constraints.  
- **Expected Deliverables:** P-006 Presentation ownership; Presentation-ready View from Report only; core-before-optional discipline; IC-5 satisfied.  
- **Entry Criteria:** M5 review gate passed; P-006 prerequisites met.  
- **Exit Criteria:** P-006 completion criteria met; T4 Report/UI checks pass; Presentation does not import Detection/Evidence; no invented explanations.  
- **Review Gate:** **RG-M6** — Verify presentation neutrality and section organization.  
- **Dependencies:** M5 Reporting.

---

### M7 — Integration

- **Objective:** Host and wire approved runtime roles for a full core Investigation collaboration path (RR-001–RR-006; Pipeline S-001–S-009).  
- **Inputs:** M6 exit; packages P-001–P-006 complete enough for hosting; Extension Architecture ownership map.  
- **Expected Deliverables:** `extension/` hosting/wiring for core path; end-to-end core traversal; Configuration not required; IC-6 satisfied.  
- **Entry Criteria:** M6 review gate passed; no package ownership merge required to “make it work.”  
- **Exit Criteria:** T5 runtime path checks pass; dependency direction preserved; Investigation completion disposition works with Report/View readiness; optional Configuration absent or inert without failing core.  
- **Review Gate:** **RG-M7** — Verify end-to-end core path and hosting-vs-ownership separation.  
- **Dependencies:** M6 Presentation (and thus M2–M5).

---

### M8 — Verification

- **Objective:** Execute architecture verification domains, including FR-014 reference storefront expectations and documentation obligations (Testing Strategy; FR-014; FR-024).  
- **Inputs:** M7 exit; Testing Strategy VD-001–VD-009; Traceability Matrix residual Unknowns.  
- **Expected Deliverables:** Evidence of VD-domain exercise for the core path; FR-014 empirics addressed as required; FR-024/NFR-003 documentation progress/complete per obligations; defects filed against owning packages (not architecture thaw); IC-8 verification focus.  
- **Entry Criteria:** M7 review gate passed; core path integrable.  
- **Exit Criteria:** T6 acceptance-oriented checks started and core verification obligations met or explicitly tracked with owners; no silent Unknown closure; critical boundary defects resolved or blocking for M9.  
- **Review Gate:** **RG-M8** — Verify Testing Strategy coverage for core path and documentation obligations; confirm Unknown integrity.  
- **Dependencies:** M7 Integration.

---

### M9 — Final Acceptance

- **Objective:** Confirm Definition of Done for the core product; record optional bonus decision separately (Architecture Review constraints; FR-026).  
- **Inputs:** M8 exit; Implementation Plan DoD; Package Build Order DoD; Coding Standards DoD.  
- **Expected Deliverables:** Acceptance record that core DoD holds; optional P-007 election/deferral recorded without blocking acceptance of core; freeze integrity confirmed.  
- **Entry Criteria:** M8 review gate passed; residual defects classified (blocking vs non-blocking).  
- **Exit Criteria:** Implementation Plan Definition of Done items 1–9 satisfied for core; T6 acceptance checks complete; architecture/ADRs remain unedited for convenience; no mandatory Configuration coupling.  
- **Review Gate:** **RG-M9** — Final acceptance: architecture compliance, ADR compliance, Unknown integrity, verification integrity, freeze integrity.  
- **Dependencies:** M8 Verification.

---

## 7. Cross-Milestone Rules

1. **No skipping** — Do not start M(n+1) until M(n) exit criteria and review gate pass.  
2. **No renaming** — Milestone names remain those in the Implementation Plan.  
3. **No ownership rewrite** — Later milestones fix defects in owning packages; they do not reassign P-* meaning.  
4. **Parallel lanes** — P-007 (if elected) and P-008 (non-blocking) must not delay M2–M7 exit.  
5. **Continuous testing** — T0–T6 map into milestones as in Overview; failing a mapped check fails the milestone gate.  
6. **Defect routing** — Bugs are fixed in code under correct `src/<package>/` or `extension/` wiring—not by editing frozen architecture/ADRs.  
7. **Scope restraint** — Milestones do not authorize features outside the FR registry.  
8. **Rollback** — On failed review gate: stop forward progress; restore or retain last green milestone baseline; fix forward in the failing milestone’s ownership; re-run that milestone’s exit checks before proceeding.

---

## 8. Freeze Policy

| Freeze point | What freezes | When |
|---|---|---|
| **Architecture freeze** | `architecture/00`–`13`; ADR-001–ADR-006 content | Entire M1–M9 (already in force) |
| **M1 governance freeze** | Repository ownership map intent; freeze/change-control rules | After RG-M1 |
| **Package freezes** | Completed package ownership per Package Build Order | After each of RG-M2…RG-M6 for the packages completed therein |
| **Integration freeze** | Hosting must not merge packages | After RG-M7 |
| **Acceptance freeze** | Core acceptance baseline | After RG-M9 |

Architectural change requires a **new ADR**. Approved ADRs are not rewritten mid-milestone.

---

## 9. Risk Management

| Risk | Milestone exposure | Response |
|---|---|---|
| Architecture drift / ownership inversion | M2–M7 | Fail review gate; fix in owning package; no architecture edit |
| ADR erosion (second scan, mutable Evidence) | M3–M4 | Fail RG-M3/RG-M4; restore immutability/single-scan posture |
| Selector-as-architecture | M4 | Fail T3/RG-M4; restore definition-driven posture |
| False completion / fabricated certainty | M4–M6 | Fail honesty checks; prefer Completed Partial / Unknown |
| Bonus coupling | M5–M7, M9 | Keep Configuration optional; core path must pass without it |
| Big-bang integration | M7 | Do not skip M2–M6 gates; rollback to last green gate |
| Unknown suppression | M4–M9 | Keep `U-*` Open; surface Unknown Qualifications |
| Scope expansion | Any | Reject; require Requirements/Vision amendment first |
| Verification theater | M8 | Require VD-domain and FR-014/FR-024 substance before RG-M8 |

---

## 10. Definition of Done

Development milestone execution is done when:

1. M1–M9 have each passed their exit criteria and review gates in order.  
2. Package build order alignment held (P-001→P-006 before core integration).  
3. Testing checkpoints T0–T6 were applied at their mapped milestones.  
4. Architecture and ADR-001–ADR-006 remained frozen (no convenience edits).  
5. Optional Configuration, if any, did not block M2–M7 or core M9 acceptance.  
6. Open Unknowns were not closed by invention.  
7. Rollback was used when gates failed, rather than pushing broken ownership forward.  
8. Implementation Plan Definition of Done for the core product is satisfied at M9.

---

## 11. Conclusion

Milestones M1–M9 are the execution spine of implementation: Foundation through Final Acceptance. Each milestone has explicit entry/exit criteria, deliverables, dependencies, and a review gate so progress stays reviewable, testable, and architecture-compliant.

Subsequent work executes inside these milestones—without renaming them, reordering the core chain, or thawing the architectural freeze.

---

**End of Development Milestones.**
