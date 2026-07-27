# P-001 — Investigation Package Specification

**Status:** Active — Implementation Phase  
**Document type:** Package implementation specification (what P-001 must realize—not how)  
**Package:** P-001 Investigation  
**Repository home:** `src/investigation/`  
**Milestone home:** M2 Core Domain  
**Depends on:** Frozen `architecture/00`–`13`; ADR-001–ADR-006; implementation `00`–`06`

This specification translates approved architecture for Package P-001 into implementation obligations. It does not redesign architecture, define algorithms, browser APIs, selectors, UI, detection logic, or code.

---

## 1. Purpose

The Investigation Package owns the **Investigation** as the architectural unit of diagnostic work and the **Completion Disposition** for one diagnostic episode.

Per Domain D-002 and ADR-001:

- An Investigation is the consistency boundary for one inspection of exactly one Storefront.  
- Everything in that episode—Evidence, Detection, Report, Presentation, and disposition—belongs to exactly one Investigation.  
- The package coordinates collaborators; it does not absorb their ownership.

**Non-goals:** Not a workflow engine; not Chrome lifecycle management; not a multi-store batch job; not historical case management.

---

## 2. Architectural Ownership

| Dimension | Ownership |
|---|---|
| **Logical package** | P-001 Investigation Package |
| **System responsibility** | R-001 Investigation Coordination |
| **Runtime host** | RR-001 Extension Coordinator |
| **Information objects owned** | IO-001 Investigation Context; IO-012 Completion Disposition |
| **Domain entity** | D-002 Investigation |
| **Pipeline stages owned (meaning)** | S-001 Investigation Initiation; S-009 Completion Disposition |
| **Invariants** | P-INV-001; Domain INV-001; DF-INV-008 (Investigation-scoped consistency); ADR-001 |

Repository placement: primary production ownership under `src/investigation/`. Runtime wiring may be hosted from `extension/` without moving ownership meaning out of P-001.

---

## 3. Responsibilities

P-001 is responsible for:

1. **Establish Investigation Context (IO-001)** — Bind one Investigation identity for one diagnostic episode.  
2. **Bind one Storefront target** — Exactly one Storefront context per Investigation (C-002; INV-001; ADR-001).  
3. **Initiate the episode** — Correspond to Pipeline S-001: Investigation is In Progress; core path is not waiting on Configuration.  
4. **Orchestrate collaborators** — Coordinate Observation → Evidence → Detection → Reporting → Presentation as orchestrated collaborators without redefining their owns/must-never-own sets.  
5. **Consume completion readiness** — Observe conceptual readiness that Diagnostic Report and/or Presentation-ready View exist, solely to inform disposition.  
6. **Declare Completion Disposition (IO-012)** — Correspond to Pipeline S-009: Completed, Completed Partial, or Unknown-qualified outcomes as justified; Not Applicable reserved under U-008 (Open—no mandatory behavior invented).  
7. **Preserve the consistency boundary** — Forbid shared/merged/cross-store Investigations and multiple Diagnostic Reports for one Investigation (ADR-001).  
8. **Remain Configuration-independent for core success** — Must not depend on Configuration Package for core Investigation success (EP-011; FR-026).

---

## 4. Must Never Own

P-001 must never own:

| Forbidden ownership | Correct owner |
|---|---|
| Evidence contents / Normalized Evidence | P-003 Evidence |
| Detection Results / Evaluation Agenda outcomes | P-004 Detection |
| Diagnostic Report assembly semantics | P-005 Reporting |
| Presentation-ready View / UI presentation semantics | P-006 Presentation |
| Product Configuration fetch | P-007 Configuration (optional) |
| Storefront observation affordance meaning | P-002 Observation |
| Chrome lifecycle / manifest / messaging design | Extension delivery concerns (not package meaning) |
| Detection logic, selectors, scoring | Detection Strategy realization under P-004 |

Absorbing these concerns into Investigation is an ownership inversion and fails package completion.

---

## 5. Inputs

| Input | Nature | Source |
|---|---|---|
| **Operator intent to investigate** | Conceptual initiation signal | Operator (Domain) |
| **Currently relevant Storefront context** | Target binding constraint (C-002) | Storefront under inspection |
| **Readiness that Report exists** | Conceptual completion input | P-005 Reporting (IO-009) |
| **Readiness that Presentation-ready View exists** | Conceptual completion input | P-006 Presentation (IO-011) |

Inputs do not include: Detection Result meanings, Evidence payloads as Investigation-owned data, or mandatory Product Configuration.

---

## 6. Outputs

| Output | Nature |
|---|---|
| **Bound Investigation / Investigation Context (IO-001)** | Episode identity + one Storefront target binding |
| **Completion Disposition (IO-012)** | End disposition for the episode |

**Allowed disposition meanings** (Domain §6.1 / Pipeline / ADR-006):

| Disposition | Meaning for P-001 |
|---|---|
| **Completed** | Report prepared with obligated questions addressed to the extent possible |
| **Completed Partial** | Report prepared with allowed incompleteness (EP-018; ADR-006) |
| **Unknown-qualified** | Disposition reflects Open Unknown impact where applicable |
| **Not Applicable** | Reserved if context is not a suitable Shopify Storefront—**behavior Unspecified** (U-008 Open); not mandated here |

**Forbidden outputs under ADR-001:** Multiple Reports for one Investigation; merged multi-storefront episode results presented as one Investigation.

---

## 7. Lifecycle

Conceptual lifecycle for one Investigation (Domain §6.1; Pipeline S-001–S-009). P-001 owns initiation and disposition meaning; middle stages are collaborated, not absorbed.

```
Not Started
    → S-001 Initiation (P-001) → In Progress
        → S-002 Observation (P-002)
        → S-003–S-004 Evidence (P-003)
        → S-005–S-006 Detection (P-004)
        → S-007 Reporting (P-005)
        → S-008 Presentation (P-006)
    → S-009 Completion Disposition (P-001)
        → Completed | Completed Partial | Unknown-qualified
        → (Not Applicable reserved under U-008)
```

**Lifecycle rules for P-001:**

1. One pipeline traversal = one Investigation targeting one Storefront (P-INV-001).  
2. A new Storefront target requires a new Investigation (ADR-001).  
3. Investigation may observe completion outputs **only** to set disposition—not to re-enter Observation/Evidence/Detection ownership for the same stage inversion.  
4. Core stages remain free of mandatory Configuration before initiation success (Pipeline optional-configuration rule).  
5. SPA navigation requiring a new Investigation remains Unspecified (U-009 Open)—do not invent mandatory behavior in this package.

---

## 8. Collaborating Packages

| Package | Collaboration with P-001 |
|---|---|
| **P-002 Observation** | Consumes Investigation Context; provides Observation Affordance |
| **P-003 Evidence** | Collects/normalizes Evidence scoped to this Investigation |
| **P-004 Detection** | Evaluates Normalized Evidence for this Investigation |
| **P-005 Reporting** | Assembles one Diagnostic Report for this Investigation |
| **P-006 Presentation** | Prepares one Presentation-ready View from that Report |
| **P-007 Configuration** | Optional adjunct to Reporting only; never required by P-001 for core success |
| **P-008 Traceability** | May reference Investigation outputs; non-blocking |

Canonical chain (ADR-001):

```
One Investigation
  → One Storefront Target
  → One Evidence Collection
  → One Detection Evaluation
  → One Diagnostic Report
  → One Presentation
  → One Completion Disposition
```

---

## 9. Dependency Rules

| Rule | Requirement |
|---|---|
| **Build order** | P-001 is implemented first among logical packages (Package Build Order step 1) |
| **Orchestration vs ownership** | P-001 depends on collaborators as orchestrated participants; it does not own their outputs’ meanings |
| **No Configuration dependency for core** | P-001 must not require P-007 |
| **Import direction** | Downstream packages may consume Investigation Context; Presentation/Detection/Evidence must not invert ownership into P-001 |
| **No cycles** | Investigation completion feedback is disposition-only—not a re-entry cycle into Evidence/Detection |
| **Runtime hosting** | RR-001 hosts P-001; hosting must not move Detection/Evidence/Presentation ownership into the Coordinator |

---

## 10. ADR Compliance

| ADR | P-001 obligation |
|---|---|
| **ADR-001** | Investigation is the architectural root and single consistency boundary for the episode; enforce one Storefront, one Report, one disposition; forbid shared/merged/cross-store Investigations |
| **ADR-002** | Do not own or rewrite Normalized Evidence; preserve Investigation-scoped snapshot boundary by not absorbing Evidence ownership |
| **ADR-003** | Do not perform definition-driven Detection inside Investigation |
| **ADR-004** | Do not invent explanations or conclusions; disposition reflects Report/View readiness and upstream honesty |
| **ADR-005** | Do not initiate a second acquisition pass as Investigation “help”; single-scan ownership remains with Evidence path |
| **ADR-006** | Allow Completed Partial / Unknown-qualified dispositions; do not fabricate Completed certainty |

---

## 11. Engineering Principle Compliance

| Principle | P-001 obligation |
|---|---|
| **EP-001 / EP-002** | Do not invent requirements; obligations remain assignment-traceable |
| **EP-003 / EP-004** | Keep U-008/U-009 explicitly Open; no silent assumptions as mandated behavior |
| **EP-005 / EP-006** | Core Investigation remains browser-local against public Storefront authority |
| **EP-011** | Optional bonus isolation—Configuration never required for Investigation success |
| **EP-012** | Investigation coordination does not own Storefront mutation |
| **EP-015** | Investigation Context supports traceability of the episode |
| **EP-016** | Implementation follows this frozen ownership—no architecture-by-code |
| **EP-017** | Keep Investigation coordination separate from Evidence, Detection, and Presentation concerns |
| **EP-018** | Progressive completeness—Completed Partial is a valid disposition |
| **EP-020** | Keep Investigation a simple unit of work—not a workflow platform |

---

## 12. Testing Obligations

Derived from approved Testing Strategy and Test Execution Plan—no new test architecture:

| Obligation | Mapping |
|---|---|
| Ownership / responsibility checks for Investigation root | **VD-002**; **T1** |
| Pipeline initiation and one-Investigation traversal assumptions | **VD-003** |
| Milestone gate | **M2** / **RG-M2**; integration checkpoint **IC-1** |
| ADR-001 compliance | Acceptance Checklist §6; milestone review |
| Configuration not required | **VD-008**/core path checks when integrated; FR-026 |
| Unknown integrity (U-008 reserved, not invented) | **VD-009** / EP-003 |

Verification must fail if Investigation absorbs Detection/Evidence/Presentation ownership or produces multiple Reports per Investigation.

---

## 13. Package Completion Criteria

From Package Build Order (P-001) and Development Milestones (M2):

□ Owns Investigation Context (IO-001) and Completion Disposition (IO-012).  
□ One Storefront target per Investigation episode model is enforced.  
□ Disposition hooks exist without Detection/Evidence/Presentation leakage.  
□ Must-never-own set is respected.  
□ Core success does not require Configuration.  
□ ADR-001 compliance holds.  
□ Repository ownership lives under `src/investigation/`.  
□ T1 ownership checks applicable to Investigation root pass.  
□ IC-1 / RG-M2 criteria are met before M3 begins.

---

## 14. Definition of Done

Package P-001 is done for implementation sequencing when:

1. Architectural ownership in §2 is realized without redesign.  
2. Responsibilities in §3 are met and must-never-own rules in §4 hold.  
3. Inputs/outputs match §§5–6 (including disposition honesty).  
4. Lifecycle rules in §7 hold for S-001 and S-009 ownership.  
5. Collaborator and dependency rules in §§8–9 hold.  
6. ADR and EP compliance in §§10–11 hold.  
7. Testing obligations in §12 are satisfied at M2 (and remain true through later milestones).  
8. Package completion criteria in §13 are checked.  
9. No algorithms, browser APIs, selectors, UI, or detection logic were introduced as Investigation ownership.

---

## 15. Conclusion

P-001 Investigation is the root package: it binds one episode to one Storefront, orchestrates approved collaborators without absorbing their meanings, and declares an honest Completion Disposition. All subsequent packages operate inside that consistency boundary per ADR-001.

This specification is ownership and obligation only. Implementation mechanisms remain outside its scope.

---

**End of P-001 Investigation Package Specification.**
