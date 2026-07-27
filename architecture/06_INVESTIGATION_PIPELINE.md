# 06 — Investigation Pipeline

**Status:** Draft — depends on approved `05_SYSTEM_ARCHITECTURE` and `04_DOMAIN_MODEL`  
**Document type:** Conceptual Investigation lifecycle (not runtime, not Chrome APIs, not algorithms, not packages)  
**Authoritative inputs:** Architecture Master Plan; `00_PROJECT_VISION`–`05_SYSTEM_ARCHITECTURE`; Product Support Engineer Assignment (FlexyPe)

Domain entities and System Architecture responsibilities (`R-*`) are reused and not redefined.

---

## 1. Purpose

The Investigation Pipeline defines the **conceptual progression of a single Investigation** through the architectural responsibilities in System Architecture—from initiation to a Diagnostic Report prepared for the Operator.

**Relationship to System Architecture:** System Architecture defines *who owns what* (`R-001`–`R-010`). This document defines *in what conceptual order those responsibilities participate* in one Investigation, and what each stage consumes/produces.

**Relationship to Detection Strategy:** Detection Strategy will specialize Domain Evaluation and multi-signal policy. This pipeline only places Evaluation Preparation and Domain Evaluation as stages; it does not define detection algorithms.

**Relationship to Data Flow:** Data Flow will describe how Evidence and conclusions move. This pipeline defines stage boundaries and ownership transfer points that Data Flow must respect.

**Relationship to Testing:** Testing Strategy will verify outcomes against assignment expectations (including reference storefronts). Tests should assume this pipeline’s stages and completion semantics (Completed / Completed Partial), not invent alternate lifecycles.

No runtime scheduling, asynchronous models, or Chrome APIs are specified.

---

## 2. Pipeline Scope

### 2.1 What “pipeline” means

A **pipeline** here is a conceptual ordered set of stages that one Investigation traverses. It is not a runtime executor, queue, or workflow engine.

### 2.2 Start boundary

Pipeline starts when an **Operator** initiates an Investigation against the **currently relevant Storefront** context (C-002; Domain INV-001).

### 2.3 End boundary

Pipeline ends when a **Diagnostic Report** has been assembled and **Presentation Preparation** has prepared it for Operator consumption—or when the Investigation is dispositioned as **Not Applicable** if later architecture addresses non-Shopify context (U-008 remains Open; no mandatory behavior invented here).

Optional Configuration Integration may contribute adjunct content before or at Assembly, but must not gate end-boundary reachability for core diagnostics (EP-011; FR-026).

### 2.4 Included stages

Stages in §3: Initiation → Observation → Evidence Acquisition → Evidence Consolidation → Evaluation Preparation → Domain Evaluation → Diagnostic Assembly → Presentation Preparation → Completion.

### 2.5 Excluded concerns

| Excluded | Why |
|---|---|
| Chrome message ports, content-script injection, popup APIs | Extension Architecture |
| Package modules and dependency graphs | Package Architecture |
| Signal scoring / selector catalogs | Detection Strategy |
| Popup layout and widgets | UI Architecture |
| Retry, backoff, timeouts, async orchestration | Implementation / runtime |
| Backend configuration API protocols | Optional bonus implementation; U-006 Open |
| Remediation of merchant stores | EP-012 |

---

## 3. Pipeline Stages

### S-001 — Investigation Initiation

- **Purpose:** Establish one Investigation bound to one Storefront context.  
- **Responsible Architectural Responsibility:** R-001 Investigation Coordination  
- **Consumes:** Operator intent; current Storefront context.  
- **Produces:** Investigation in conceptual **In Progress** state; scope for subsequent stages.  
- **Completion Condition:** Investigation identity and Storefront target are established; core path is not waiting on Configuration Integration.  
- **Non-Goals:** Not Evidence gathering; not detection; not UI.  
- **Authority:** C-002; Domain D-002; S-INV-009.

### S-002 — Storefront Observation

- **Purpose:** Make the Storefront available as the public observation authority for this Investigation.  
- **Responsible Architectural Responsibility:** R-002 Storefront Observation  
- **Consumes:** Investigation context from S-001.  
- **Produces:** Observation affordances for Evidence Acquisition and Store Information capture.  
- **Completion Condition:** Observation against the target Storefront is available to collection, or incompleteness is recognized without inventing Admin/backend substitutes (EP-006; U-007 may limit reach).  
- **Non-Goals:** Not concluding Detection Results; not assembling the Diagnostic Report.  
- **Authority:** EP-006; C-003; System R-002.

### S-003 — Evidence Acquisition

- **Purpose:** Collect Evidence under applicable Evidence Signal Classes and other public signals needed for Store Information / disabled-integration forms.  
- **Responsible Architectural Responsibility:** R-003 Evidence Collection  
- **Consumes:** Observation affordances from S-002.  
- **Produces:** Collected Evidence set (possibly partial).  
- **Completion Condition:** Acquisition for this Investigation has obtained available Evidence, or recorded that certain signal classes were not obtainable—without fabricating Evidence.  
- **Non-Goals:** Not normalization policy details beyond collection; not evaluation conclusions; not presentation.  
- **Authority:** FR-009; FR-015; FR-017; EP-007; INV-003.

### S-004 — Evidence Consolidation

- **Purpose:** Normalize collected Evidence into an evaluation-ready set consistent for this Investigation.  
- **Responsible Architectural Responsibility:** R-004 Evidence Normalization  
- **Consumes:** Collected Evidence from S-003.  
- **Produces:** Evaluation-ready Evidence set (ADR-002 consistency intent).  
- **Completion Condition:** Evidence is in a form suitable for Domain Evaluation without meaning alteration or invented facts.  
- **Non-Goals:** Not detection fusion; not UI.  
- **Authority:** R-004; ADR-002 intent; S-INV-002.

### S-005 — Evaluation Preparation

- **Purpose:** Determine which investigatory questions must be evaluated for this Investigation (FlexyPe Products, Disabled Integrations, Store Information/Theme, Third-party Apps, Storefront Features), including questions whose methods/definitions remain Unknown.  
- **Responsible Architectural Responsibility:** R-005 Detection Coordination  
- **Consumes:** Evaluation-ready Evidence; FlexyPe Product catalog; Domain Unknowns (U-001, U-002, …).  
- **Produces:** Evaluation agenda (conceptual set of questions to conclude).  
- **Completion Condition:** Agenda covers obligated questions for the Investigation; Unknown-qualified questions remain on the agenda rather than being dropped silently (EP-003; FR-019; FR-022).  
- **Non-Goals:** Not computing Detection Results; not multi-signal algorithms.  
- **Authority:** FR-010–FR-022 as applicable; EP-003; R-005.

### S-006 — Domain Evaluation

- **Purpose:** Form Store Information values and Detection Results from evaluation-ready Evidence, including Not Detected, Disabled, Available/Unavailable, and Unknown outcomes as justified.  
- **Responsible Architectural Responsibility:** R-006 Domain Evaluation  
- **Consumes:** Evaluation agenda from S-005; evaluation-ready Evidence from S-004.  
- **Produces:** Store Information conclusions; Detection Results (including Not Detected where FR-013 applies).  
- **Completion Condition:** Every agenda item has a conceptual outcome state (including Unknown or Not Detected where appropriate); no false certainty for insufficient-confidence FlexyPe product presence.  
- **Non-Goals:** Not Diagnostic Report composition; not popup preparation; not bonus API calls.  
- **Authority:** FR-001–FR-013; FR-016–FR-019; FR-021–FR-022; EP-008; EP-009; EP-018; INV-005; INV-006.

### S-007 — Diagnostic Assembly

- **Purpose:** Compose the Diagnostic Report from Store Information and Detection Results; optionally attach Product Configuration if supplied.  
- **Responsible Architectural Responsibility:** R-007 Diagnostic Assembly (optional input from R-008 Configuration Integration)  
- **Consumes:** Outputs of S-006; optional Product Configuration from Configuration Integration if bonus pursued.  
- **Produces:** Diagnostic Report (complete or partial).  
- **Completion Condition:** Diagnostic Report contains the Investigation’s Store Information and Detection Results; absence of Product Configuration does not block assembly of core content.  
- **Non-Goals:** Not re-evaluating Evidence; not UI layout.  
- **Authority:** FR-020; FR-026; EP-011; EP-018; S-INV-005.

### S-008 — Presentation Preparation

- **Purpose:** Prepare the Diagnostic Report for Operator consumption via the extension popup surface (structure deferred to UI Architecture).  
- **Responsible Architectural Responsibility:** R-009 Presentation Preparation  
- **Consumes:** Diagnostic Report from S-007.  
- **Produces:** Presentation-ready diagnostic view (conceptual).  
- **Completion Condition:** Operator-facing preparation reflects Assembly outputs without altering Detection Results or inventing Evidence.  
- **Non-Goals:** Not detection; not Evidence access bypassing Assembly.  
- **Authority:** FR-020; Vision §8.2; S-INV-003; System boundary rules.

### S-009 — Completion

- **Purpose:** Declare the Investigation’s pipeline outcome disposition.  
- **Responsible Architectural Responsibility:** R-001 Investigation Coordination (disposition), informed by S-007/S-008  
- **Consumes:** Assembled/prepared Diagnostic Report; awareness of Unknowns and partial fields.  
- **Produces:** Pipeline outcome (§6): Completed, Completed Partial, Not Applicable (if defined later under U-008), or Unknown-qualified completion notes.  
- **Completion Condition:** Outcome disposition is assigned; Assignment Traceability (R-010) can still map conclusions to obligation IDs.  
- **Non-Goals:** Not retry; not persistence; not submission packaging (FR-024).  
- **Authority:** Domain Investigation states; EP-018; ADR-006 intent.

---

## 4. Stage Transition Principles

Allowed conceptual transitions (not a runtime sequencer):

```
S-001 Initiation
  → S-002 Observation
    → S-003 Evidence Acquisition
      → S-004 Evidence Consolidation
        → S-005 Evaluation Preparation
          → S-006 Domain Evaluation
            → S-007 Diagnostic Assembly
              → S-008 Presentation Preparation
                → S-009 Completion
```

**Transition rules:**

1. **Observation is not skipped** after Initiation for a core Investigation of a Storefront (S-001 → S-002).  
2. **Evidence Acquisition follows Observation**; evaluation must not consume unobserved invention (S-002 → S-003).  
3. **Consolidation follows Acquisition** before Evaluation (S-003 → S-004 → S-005/S-006).  
4. **Domain Evaluation requires evaluation-ready Evidence** (and an agenda); it must not run as a substitute for Acquisition.  
5. **Presentation requires Assembly** (S-007 → S-008); Presentation must not pull Evidence directly.  
6. **Completion follows Presentation Preparation** for Operator-facing Investigations (S-008 → S-009), or follows Assembly disposition when Presentation is vacuously prepared—still without bypassing Assembly.  
7. **Completion may be Partial** when assignment allows incompleteness (theme if available; Not Detected; Open Unknowns).  
8. **Optional Configuration Integration** may feed S-007 but must not insert a mandatory stage before S-001–S-006 success.  
9. **No backward transition** that allows Presentation or Assembly to rewrite Evidence meaning.

---

## 5. Pipeline Invariants

| ID | Invariant | Authority |
|---|---|---|
| P-INV-001 | One pipeline traversal corresponds to one Investigation targeting one Storefront. | C-002; Domain INV-001; ADR-001; S-INV-009 |
| P-INV-002 | Evidence does not bypass Domain Evaluation to become Operator-facing claims. | EP-007; S-INV-002; S-INV-003 |
| P-INV-003 | Presentation does not evaluate Evidence or invent Detection Results. | System §4–§5; FR-020 |
| P-INV-004 | Domain Unknowns remain explicit through Evaluation → Assembly → Presentation → Completion. | EP-003; Domain INV-006; U-001–U-010 |
| P-INV-005 | Optional bonus/configuration never blocks reaching Assembly of core Diagnostic Report content. | FR-026; EP-011; C-008; S-INV-005 |
| P-INV-006 | Insufficient-confidence FlexyPe product presence becomes Not Detected at Evaluation and remains Not Detected through Completion. | FR-013; EP-009; ADR-006 |
| P-INV-007 | Multi-signal / no-single-selector obligations apply at Evaluation for FlexyPe Products; the pipeline must not collapse to a single-selector stage. | C-004; C-005; EP-008; ADR-003 |
| P-INV-008 | Core stages S-001–S-008 remain browser-local; no backend stage is required on the core path. | NFR-001; NFR-002; EP-005; ADR-005 |
| P-INV-009 | Pipeline does not include Storefront mutation stages. | EP-012; Domain INV-011 |

---

## 6. Pipeline Outcomes

Conceptual outcomes at S-009 (not runtime enums):

| Outcome | Meaning |
|---|---|
| **Completed** | Diagnostic Report addresses obligated questions with conclusive outcomes where Evidence and definitions suffice |
| **Completed Partial** | Diagnostic Report is prepared but includes allowed incompleteness (e.g., Theme unavailable; Not Detected; Unknown-qualified answers for U-001/U-002; limited Evidence under U-007) |
| **Unknown-qualified** | A Completed or Completed Partial report whose material answers remain explicitly Unknown-influenced; Unknowns are not cleared |
| **Not Applicable** | Investigation context is not a suitable Shopify Storefront—**behavior Unspecified** (U-008 Open); listed only as a reserved disposition, not a mandated design |

Optional Product Configuration availability/unavailability does not by itself change Completed vs Completed Partial for core obligations.

---

## 7. Pipeline Failure Semantics

Incompleteness is a first-class pipeline concern. This section defines **conceptual handling**, not recovery or retry.

| Condition | Pipeline behavior |
|---|---|
| **Missing Theme Name** | Store Information remains partial; Evaluation records Available/Unavailable; Assembly continues; outcome may be Completed Partial (FR-007; EP-018) |
| **Unknown Storefront Feature definition (U-001)** | Evaluation agenda retains FR-022; outcome may be Unknown; Assembly preserves Unknown; do not invent feature catalog |
| **Unknown third-party detection method (U-002)** | FR-019 remains on agenda; outcome may be Unknown-qualified; do not invent signal classes in the pipeline |
| **No / sparse Evidence** | Evaluation must not emit false Detected for FlexyPe Products; use Not Detected when confidence insufficient (FR-013); other questions may be Unknown or partial |
| **Permission / CSP limitations (U-007)** | Acquisition/Observation may be incomplete; Consolidation reflects obtainable Evidence only; no Admin fallback on core path |
| **Part 3 explanation not possible (U-005)** | Disabled Integration may still be concluded; explanation intent may be absent; Assembly still valid (FR-018 “if possible”) |
| **Optional configuration unavailable (U-006)** | Core Assembly completes without Product Configuration; bonus adjunct absent/unavailable |
| **SPA navigation ambiguity (U-009)** | Pipeline still describes one Investigation per Storefront target; whether a new Investigation is required after navigation is Unspecified |

**Prohibited responses to incompleteness:** inventing Evidence; closing Unknowns; requiring backend to “fill gaps” for core; treating every partial as total pipeline abortion when assignment allows partial results (ADR-006; EP-018).

---

## 8. Pipeline Variation Points

What may vary without changing the stage map:

| Variation | Adaptation within stable stages |
|---|---|
| **Evidence availability** | S-003/S-004 produce richer or thinner Evidence; stages remain |
| **Detection definitions** | Specialized inside S-005/S-006 via Detection Strategy; stage names unchanged |
| **Optional configuration** | R-008 may or may not feed S-007; S-001–S-006 unchanged |
| **Unknowns** | Qualify S-005/S-006 outcomes; do not remove stages |
| **Third-party apps / features** | Remain agenda items; methods/definitions Open |
| **Theme discovery** | Affects Store Information completeness inside S-006/S-007 |
| **Reference storefront expectations (FR-014)** | Affect Evaluation/Testing expectations, not stage structure |

---

## 9. Pipeline Risks

Structural risks only—no mitigations.

| ID | Risk |
|---|---|
| P-RISK-001 | Skipping Observation/Acquisition and evaluating from assumptions |
| P-RISK-002 | Presentation reading Evidence directly (Assembly bypass) |
| P-RISK-003 | Treating Not Detected as pipeline failure rather than valid Evaluation outcome |
| P-RISK-004 | Inserting mandatory Configuration stage before core Evaluation |
| P-RISK-005 | Dropping FR-019/FR-022 from Evaluation Preparation because methods are Unknown |
| P-RISK-006 | Collapsing Evaluation into a single-selector shortcut despite C-005 |
| P-RISK-007 | Redefining stages differently in Data Flow / Extension / Testing docs |

---

## 10. Pipeline Glossary

| Term | Meaning |
|---|---|
| **Pipeline** | Conceptual ordered stages of one Investigation |
| **Stage (S-***)** | Named conceptual step with responsibility ownership |
| **Transition** | Allowed conceptual succession from one stage to another |
| **Evaluation agenda** | Conceptual set of investigatory questions prepared in S-005 |
| **Completion Condition** | What must be true for a stage to be considered conceptually finished |
| **Pipeline Outcome** | Disposition at S-009 (Completed, Completed Partial, etc.) |
| **Completed Partial** | Valid end disposition with allowed incompleteness |
| **Unknown-qualified** | Outcome carrying explicit Domain Unknown influence |
| **Core path (pipeline)** | Stages S-001–S-008 without mandatory Configuration Integration |
| **Ownership transfer** | Handoff of produces→consumes across stage boundaries |
| **Incompleteness** | Missing Evidence, unavailable fields, or Open Unknowns affecting outcomes |

Domain terms (Investigation, Storefront, Evidence, Detection Result, Diagnostic Report, etc.) retain `04_DOMAIN_MODEL` definitions.

---

**End of Investigation Pipeline.**  
Next architecture document per Architecture Master Plan: `07_DETECTION_STRATEGY` (depends on Investigation Pipeline).
