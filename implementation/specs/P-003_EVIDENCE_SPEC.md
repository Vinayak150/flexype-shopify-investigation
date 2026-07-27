# P-003 — Evidence Package Specification

**Status:** Active — Implementation Phase  
**Document type:** Package implementation specification (what P-003 must realize—not how)  
**Package:** P-003 Evidence  
**Repository home:** `src/evidence/`  
**Milestone home:** M3 Evidence  
**Depends on:** Frozen `architecture/00`–`13`; ADR-001–ADR-006; implementation `00`–`06`; [`P-001_INVESTIGATION_SPEC.md`](P-001_INVESTIGATION_SPEC.md); [`P-002_OBSERVATION_SPEC.md`](P-002_OBSERVATION_SPEC.md)

This specification translates approved architecture for Package P-003 into implementation obligations. It does not redesign architecture, define browser APIs, DOM selectors, extraction heuristics, normalization algorithms, parsing rules, detection logic, confidence models, reporting logic, UI, or code.

**Ownership reminder:** Observation discovers (affordance). Evidence owns acquisition, collection, consolidation, and normalization. Detection evaluates the immutable snapshot. Reporting reports. Presentation presents.

---

## 1. Purpose

The Evidence Package **collects and normalizes Evidence** for one Investigation and produces **immutable Normalized Evidence** for all downstream evaluation, assembly, and presentation.

Per Package Architecture P-003, Pipeline S-003/S-004, ADR-002, and ADR-005:

- Evidence owns acquisition/collection and consolidation/normalization.  
- Normalized Evidence is the single evaluation-ready snapshot for the Investigation.  
- Downstream packages consume that snapshot; they do not modify it or replace it via live Storefront re-query.  
- Evidence does not detect, explain, report, or present.

**Non-goals:** Not multi-signal fusion conclusions; not selectors-as-architecture; not Detection Results; not UI state.

---

## 2. Architectural Ownership

| Dimension | Ownership |
|---|---|
| **Logical package** | P-003 Evidence Package |
| **System responsibilities** | R-003 Evidence Collection; R-004 Evidence Normalization |
| **Runtime host** | RR-003 Evidence Runtime |
| **Information objects owned** | IO-004 Evidence; IO-005 Normalized Evidence; Evidence Signal Class usage as collection categories |
| **Domain concepts** | Evidence as observable public storefront facts scoped to one Investigation |
| **Pipeline stages owned (meaning)** | S-003 Evidence Acquisition; S-004 Evidence Consolidation |
| **Invariants** | DF-INV-001; DET-INV-002; FR-015; ADR-002; ADR-005; EXT-INV-003 |

Repository placement: primary production ownership under `src/evidence/`. Runtime hosting may be wired from `extension/` without moving ownership meaning out of P-003.

---

## 3. Responsibilities

P-003 is responsible for:

1. **Consume Investigation Context** — Scope all Evidence work to one Investigation / one Storefront target (P-001; ADR-001).  
2. **Consume Observation Affordance (IO-002)** — Acquire only after Observation establishes public Storefront availability (P-002; S-002 → S-003).  
3. **Evidence Acquisition / Collection (S-003 / R-003)** — Collect observable public storefront facts under applicable Evidence Signal Classes and other public signals needed for later Store Information / disabled-integration forms—without fabricating Evidence.  
4. **Record unobtainable classes honestly** — When signal classes are not obtainable, record incompleteness rather than inventing facts (S-003 completion condition; EP-018; ADR-006 honesty upstream).  
5. **Evidence Consolidation / Normalization (S-004 / R-004)** — Normalize collected Evidence into an evaluation-ready set consistent for this Investigation (ADR-002 intent).  
6. **Produce immutable Normalized Evidence (IO-005)** — After normalization, the snapshot is read-only for the remainder of the Investigation’s evaluation/assembly/presentation path.  
7. **Uphold single acquisition posture (ADR-005)** — Browser acquisition for the Investigation occurs once in the Observation + Collection + Normalization phase; do not initiate a second acquisition pass to replace the established snapshot.  
8. **Handoff to Detection** — Provide Normalized Evidence for Detection consumption; do not rewrite it after handoff.  
9. **Remain Configuration-independent** — Configuration must not contaminate or source core Evidence (EP-011; DF-RISK-003).  
10. **Remain non-invasive** — Do not own Storefront mutation (EP-012).

---

## 4. Must Never Own

P-003 must never own:

| Forbidden ownership | Correct owner |
|---|---|
| Detection Results / product Detected/Not Detected decisions | P-004 Detection |
| Evaluation Agenda outcomes | P-004 Detection |
| Multi-signal fusion conclusions | P-004 Detection |
| Diagnostic Report assembly | P-005 Reporting |
| Presentation-ready View / UI | P-006 Presentation |
| Investigation Context / Completion Disposition | P-001 Investigation |
| Observation Affordance meaning | P-002 Observation |
| Product Configuration as Evidence source | Forbidden for core (P-007 must not feed Evidence) |
| Admin/backend as core Evidence authority | Forbidden (EP-006; C-003) |

Evidence must not explain results, build Reports, or produce UI.

---

## 5. Inputs

| Input | Nature | Source |
|---|---|---|
| **Investigation Context (IO-001)** | Episode + one Storefront binding | P-001 Investigation |
| **Observation Affordance (IO-002)** | Public Storefront available for observation | P-002 Observation |

Inputs do not include: Detection Results, Diagnostic Report, Presentation-ready View, or Product Configuration as an Evidence source.

---

## 6. Outputs

| Output | Nature |
|---|---|
| **Evidence (IO-004)** | Observable public storefront facts collected for the Investigation (possibly partial); not Detection Results; not UI state |
| **Normalized Evidence (IO-005)** | Evaluation-ready Evidence set with consistent form for one Investigation; **immutable after normalization** for downstream path |

**Output rules (approved immutability—no invented extras):**

- Must not invent facts; content not rewritten to force conclusions (IO-004/IO-005).  
- Normalized Evidence becomes read-only for the remainder of the Investigation.  
- Detection consumes Normalized Evidence; it does not rewrite it.  
- Reporting consumes Detection outputs—not raw acquisition—and does not rewrite Normalized Evidence.  
- Presentation consumes the Diagnostic Report only—not Evidence.  
- No re-normalization after handoff to Detection for the same Investigation.  
- A new Investigation implies a new observation → collection → normalization cycle and a new immutable snapshot (ADR-001 + ADR-002).

---

## 7. Lifecycle

P-003 owns Pipeline **S-003** and **S-004**, between Observation and Detection:

```
S-001 Initiation (P-001)
  → S-002 Observation (P-002)
  → S-003 Evidence Acquisition (P-003)      ← collection
  → S-004 Evidence Consolidation (P-003)    ← normalization → immutable snapshot
  → S-005–S-006 Detection (P-004)           ← consumes snapshot only
  → S-007 Reporting (P-005)
  → S-008 Presentation (P-006)
  → S-009 Completion (P-001)
```

**Lifecycle rules for P-003:**

1. Acquisition follows Observation; evaluation must not consume unobserved invention.  
2. Consolidation follows Acquisition; produces evaluation-ready Evidence without meaning alteration or invented facts.  
3. After IO-005 exists for the Investigation, downstream stages operate exclusively on that snapshot (ADR-005).  
4. The browser is not repeatedly queried during Detection, Reporting, Presentation, or Completion to revise Evidence.  
5. Partial Evidence is allowed; fabricating Evidence to avoid incompleteness is forbidden (ADR-006 upstream honesty).  
6. U-007 may limit obtainable signal classes; incompleteness is recorded—no Admin fallback.  
7. U-009 remains Open; do not invent auto-rescan architecture inside Evidence.

---

## 8. Collaborating Packages

| Package | Collaboration with P-003 |
|---|---|
| **P-001 Investigation** | Provides Investigation Context; Evidence does not own disposition |
| **P-002 Observation** | Provides Observation Affordance; Evidence owns acquisition after affordance |
| **P-004 Detection** | Consumes immutable Normalized Evidence; must not mutate it |
| **P-005 Reporting** | Must not recollect Evidence from P-003 |
| **P-006 Presentation** | Must not consume or mutate Evidence |
| **P-007 Configuration** | Must not feed Evidence as a source |
| **P-008 Traceability** | May reference Evidence participation; non-blocking |

Canonical chain (ADR-002 / ADR-005):

```
Browser Observation
  → Evidence Collection
  → Evidence Normalization
  → Immutable Normalized Evidence
  → Detection
  → Reporting
  → Presentation
```

---

## 9. Dependency Rules

| Rule | Requirement |
|---|---|
| **Depends on** | P-002 Observation (and Investigation Context) |
| **Build order** | Implemented after P-002 and before P-004 (Package Build Order step 3) |
| **Downstream consumer** | P-004 Detection consumes IO-005 |
| **Must not depend on** | Presentation, Reporting conclusions, Configuration |
| **Import direction** | `… → observation → evidence → detection → …` |
| **Forbidden reverse edges** | Evidence must not import Detection/Reporting/Presentation to reshape the snapshot |
| **Runtime hosting** | RR-003 hosts P-003; never mutates Normalized Evidence after handoff (EXT-INV-003) |
| **No Configuration contamination** | Evidence Runtime ← Configuration Runtime as Evidence source is forbidden |

---

## 10. ADR Compliance

| ADR | P-003 obligation |
|---|---|
| **ADR-001** | Evidence and Normalized Evidence are scoped to one Investigation / one Storefront; no shared pools across Investigations |
| **ADR-002** | Own and preserve immutable Normalized Evidence; no downstream mutation; no conclusion-driven rewriting; no re-normalization after Detection handoff |
| **ADR-003** | Do not perform definition-driven Detection inside Evidence; selectors are not architecture here |
| **ADR-004** | Do not invent explanations; provide stable Evidence basis for attributable conclusions downstream |
| **ADR-005** | One browser acquisition pass per Investigation; do not initiate a second acquisition pass to replace the established snapshot; Detection evaluates the snapshot, not the live Storefront |
| **ADR-006** | Partial/unobtainable Evidence is honest incompleteness—not fabricated completeness |

---

## 11. Engineering Principle Compliance

| Principle | P-003 obligation |
|---|---|
| **EP-003 / EP-004** | Keep U-007/U-009 explicit; no invented Admin fallback or auto-rescan mandate |
| **EP-005 / EP-006** | Browser-local public Storefront authority for core Evidence |
| **EP-007** | Evidence-based path—no invented storefront facts |
| **EP-008** | Multi-signal posture is Detection’s concern; Evidence supplies signal-class collection categories, not fusion conclusions |
| **EP-009 / EP-018** | Representable incompleteness when Evidence is partial |
| **EP-011** | Optional Configuration must not contaminate Evidence |
| **EP-012** | Non-invasive—no Storefront mutation ownership |
| **EP-016 / EP-017** | Follow frozen ownership; keep Evidence separate from Detection/Reporting/Presentation |
| **EP-019 / EP-020** | Maintainable Evidence handling without turning selectors into architecture or overbuilding |

---

## 12. Testing Obligations

Derived from approved Testing Strategy and Test Execution Plan—no new test architecture:

| Obligation | Mapping |
|---|---|
| Evidence immutability / public authority / no Configuration contamination | **VD-004**; **T2** |
| Ownership non-inversion (Evidence does not conclude Detected) | **VD-002**; **T1** |
| Pipeline Acquisition → Consolidation before Detection | **VD-003** |
| Milestone / checkpoint | **M3** / **RG-M3**; **IC-2** |
| Single acquisition / no downstream rewrite | ADR-002/ADR-005 at acceptance; **VD-005** must consume snapshot only |
| Runtime handoff immutability | **VD-008** / EXT-INV-003 at integration |

Verification must fail if Normalized Evidence is rewritten downstream, if a second acquisition replaces the snapshot for the same Investigation, if Evidence performs Detection, or if Configuration/Admin sources core Evidence.

---

## 13. Package Completion Criteria

From Package Build Order (P-003) and Development Milestones (M3):

□ Owns Evidence (IO-004) and Normalized Evidence (IO-005).  
□ Owns Evidence Signal Class usage as collection categories (not as Detection conclusions).  
□ Consumes Observation Affordance and Investigation Context only for inputs listed in §5.  
□ Produces immutable Normalized Evidence for downstream packages.  
□ Does not own Detection Results, Evaluation Agenda outcomes, UI, or product Detected/Not Detected decisions.  
□ Does not depend on Presentation, Reporting conclusions, or Configuration.  
□ Single acquisition posture holds (ADR-005); immutability holds (ADR-002).  
□ Partial/unobtainable Evidence is recorded without fabrication.  
□ Repository ownership lives under `src/evidence/`.  
□ T2 snapshot checks and IC-2 / RG-M3 criteria are met before M4 begins.

---

## 14. Definition of Done

Package P-003 is done for implementation sequencing when:

1. Architectural ownership in §2 is realized without redesign.  
2. Responsibilities in §3 are met and must-never-own rules in §4 hold.  
3. Inputs/outputs match §§5–6, including immutability of IO-005.  
4. Lifecycle rules in §7 hold for S-003 and S-004.  
5. Collaborator and dependency rules in §§8–9 hold.  
6. ADR and EP compliance in §§10–11 hold (especially ADR-002 and ADR-005).  
7. Testing obligations in §12 are satisfied at M3.  
8. Package completion criteria in §13 are checked.  
9. No browser APIs, selectors, extraction heuristics, normalization algorithms, parsing rules, detection logic, reporting logic, UI, or code were introduced as Evidence ownership in this specification.

---

## 15. Conclusion

P-003 Evidence is the owner of acquisition, collection, consolidation, and normalization. It produces the immutable Normalized Evidence snapshot on which Detection evaluates, Reporting assembles (from Detection outputs), and Presentation projects (from Reports). Observation only enables; Detection only evaluates; neither rewrites the snapshot.

This specification is ownership and obligation only. Implementation mechanisms remain outside its scope.

---

**End of P-003 Evidence Package Specification.**
