# 08 — Data Flow

**Status:** Draft — depends on approved `07_DETECTION_STRATEGY`, `06_INVESTIGATION_PIPELINE`, `05_SYSTEM_ARCHITECTURE`, `04_DOMAIN_MODEL`  
**Document type:** Conceptual information movement (not transport, protocols, APIs, storage, or Chrome messaging)  
**Authoritative inputs:** Architecture Master Plan; `00_PROJECT_VISION`–`07_DETECTION_STRATEGY`; Product Support Engineer Assignment (FlexyPe)

Domain entities, System responsibilities (`R-*`), Pipeline stages (`S-*`), and Detection Strategy semantics are reused and not redefined.

---

## 1. Purpose

This document defines **how domain information conceptually moves** through architectural responsibilities and Investigation Pipeline stages—sources, transformations, ownership transfer, boundaries, and consumers—without describing runtime mechanisms.

**Relationship to Domain Model:** Information objects are projections/carriers of Domain concepts (Investigation, Evidence, Detection Result, Diagnostic Report, etc.). Entity meanings remain as in `04_DOMAIN_MODEL`.

**Relationship to System Architecture:** Flows respect responsibility ownership (R-001–R-010) and dependency direction (Observation → Collection → Normalization → Evaluation → Assembly → Presentation; Configuration adjunct only).

**Relationship to Investigation Pipeline:** Flows align to stages S-001–S-009; Data Flow does not invent alternate stage orders.

**Relationship to Detection Strategy:** Transformations that produce Detection Results obey evidence-before-conclusion, multi-signal philosophy, Not Detected restraint, and Unknown preservation—without embedding algorithms.

**Relationship to Package Architecture:** Later packaging must preserve these ownership and immutability expectations; this document does not define modules.

**Relationship to Testing Strategy:** Tests should verify that observable outcomes respect flow invariants (e.g., Presentation does not alter Detection Results; core report forms without Product Configuration).

No transport, messaging, persistence, or APIs are specified.

---

## 2. Data Flow Scope

### 2.1 Information sources

| Source | Nature |
|---|---|
| **Operator intent** | Initiates Investigation Context |
| **Open Shopify Storefront** | Sole public authority for core Evidence and Store Information (EP-006; C-003) |
| **Domain catalogs** | FlexyPe Product set; assignment-listed Evidence Signal Classes; Part 3 disabled-form kinds |
| **Domain Unknowns (U-*)** | Qualify agenda items and outcomes; not fabricated storefront facts |
| **Optional configuration source** | External, only if bonus pursued (U-006 Open); never required for core |

### 2.2 Information destinations

| Destination | Nature |
|---|---|
| **Diagnostic Report** | Assembled conclusions for one Investigation |
| **Presentation-ready View** | Conceptual preparation for Operator consumption in the extension popup (layout deferred) |
| **Assignment Traceability references** | Governance linkage of claims to `FR`/`NFR`/`C`/`U` (R-010)—not a storefront payload |

### 2.3 Included flows

Core path: Investigation Context → Observation affordances → Evidence → Normalized Evidence → Evaluation Agenda → Store Information & Detection Results → Diagnostic Report → Presentation-ready View → Completion disposition.

Optional adjunct: Product Configuration → Diagnostic Report (non-blocking).

### 2.4 Excluded flows

| Excluded | Why |
|---|---|
| Chrome message ports / script injection mechanics | Extension Architecture |
| HTTP client designs / API schemas | Implementation; bonus contracts U-006 |
| Disk/database persistence | Not required by assignment for core |
| Analytics telemetry pipelines | Out of scope |
| Storefront write-back / remediation flows | EP-012 |
| Admin API as core evidence channel | C-003; EP-006 |

### 2.5 External information sources

- Public Storefront observables (core)  
- Optional configuration APIs (bonus only; U-006)

### 2.6 Unknown information sources

| Unknown | Flow impact |
|---|---|
| **U-001 / U-002** | No defined feature/app evidence catalogs; outcomes may carry Unknown Qualification |
| **U-006** | Configuration source may be absent |
| **U-007** | Some Evidence Signal Classes may yield no Evidence |
| **U-008** | Non-Shopify context disposition Unspecified |
| **U-009** | Whether navigation implies new Investigation Context Unspecified |

---

## 3. Information Objects

### IO-001 — Investigation Context

- **Purpose:** Identifies the active Investigation and its target Storefront.  
- **Produced by:** R-001 / S-001  
- **Consumed by:** R-002, R-003, R-005 (and downstream as binding context)  
- **Ownership:** Investigation Coordination until Completion disposition  
- **Mutability expectations:** Target Storefront binding stable for the Investigation (P-INV-001); not rewritten by Presentation  
- **Non-goals:** Not Evidence; not Detection Results  

### IO-002 — Observation Affordance

- **Purpose:** Conceptual access handle indicating the Storefront is available for public observation.  
- **Produced by:** R-002 / S-002  
- **Consumed by:** R-003 Evidence Collection  
- **Ownership:** Storefront Observation  
- **Mutability expectations:** Does not itself store Detection Results  
- **Non-goals:** Not a conclusion; not Admin session  

### IO-003 — Store Information

- **Purpose:** Part 1 field bundle conclusions for the Storefront.  
- **Produced by:** R-006 / S-006 (from public signals / Evidence)  
- **Consumed by:** R-007 Diagnostic Assembly; indirectly R-009  
- **Ownership:** Domain Evaluation until handed to Assembly; thereafter Report-owned copy  
- **Mutability expectations:** May be partial (Theme Unavailable); Presentation must not alter field meanings  
- **Non-goals:** Not FlexyPe Product Detected outcomes (FR-007/FR-021 availability semantics)  

### IO-004 — Evidence

- **Purpose:** Observable public storefront facts collected for the Investigation.  
- **Produced by:** R-003 / S-003  
- **Consumed by:** R-004 Evidence Normalization  
- **Ownership:** Evidence Collection until transfer to Normalization  
- **Mutability expectations:** Must not invent facts; content not rewritten to force conclusions  
- **Non-goals:** Not Detection Results; not UI state  

### IO-005 — Normalized Evidence

- **Purpose:** Evaluation-ready Evidence set with consistent form for one Investigation (ADR-002 intent).  
- **Produced by:** R-004 / S-004  
- **Consumed by:** R-005, R-006  
- **Ownership:** Evidence Normalization until Evaluation consumes it  
- **Mutability expectations:** **Immutable after normalization** for the remainder of the Investigation’s evaluation/assembly/presentation path—meaning preserved; no conclusion-driven edits  
- **Non-goals:** Not scoring sheets; not selectors  

### IO-006 — Evaluation Agenda

- **Purpose:** Conceptual list of investigatory questions to evaluate (products, disabled integrations, store info/theme, third-party apps, features).  
- **Produced by:** R-005 / S-005  
- **Consumed by:** R-006 / S-006  
- **Ownership:** Detection Coordination  
- **Mutability expectations:** Must retain obligated questions even when Unknown-qualified (DP-012); not truncated silently for U-001/U-002  
- **Non-goals:** Not outcomes; not Evidence  

### IO-007 — Detection Result Set

- **Purpose:** Collection of Detection Results for agenda items (Detected, Not Detected, Disabled, Unknown, Available/Unavailable as appropriate).  
- **Produced by:** R-006 / S-006  
- **Consumed by:** R-007 Diagnostic Assembly  
- **Ownership:** Domain Evaluation until Assembly; then Report-owned  
- **Mutability expectations:** Presentation must not mutate outcomes; Assembly must not re-interpret Evidence  
- **Non-goals:** Not Product Configuration; not layout  

### IO-008 — Unknown Qualification

- **Purpose:** Explicit marker that an agenda item or result is influenced by an Open Domain Unknown (U-*).  
- **Produced by:** R-005 / R-006 (and preserved thereafter)  
- **Consumed by:** R-007, R-009, R-010, Completion disposition  
- **Ownership:** Travels with Agenda/Results/Report  
- **Mutability expectations:** Must not be stripped to “simplify” outputs (EP-003)  
- **Non-goals:** Not a substitute for Not Detected unless Detection Strategy semantics say so (FR-013 product case remains Not Detected)  

### IO-009 — Diagnostic Report

- **Purpose:** Assembled Store Information + Detection Result Set (+ optional Product Configuration) for Operator-facing consumption.  
- **Produced by:** R-007 / S-007  
- **Consumed by:** R-009 Presentation Preparation; Completion (S-009)  
- **Ownership:** Diagnostic Assembly  
- **Mutability expectations:** Core content must form without Product Configuration; Presentation prepares a view without changing Detection Results  
- **Non-goals:** Not Evidence warehouse; not submission zip (FR-024)  

### IO-010 — Product Configuration (Optional)

- **Purpose:** Optional readable configuration adjunct for detected FlexyPe Products.  
- **Produced by:** R-008 Configuration Integration (if pursued)  
- **Consumed by:** R-007 Diagnostic Assembly only as adjunct  
- **Ownership:** Configuration Integration  
- **Mutability expectations:** Absence must not block IO-009 core assembly (FR-026; EP-011)  
- **Non-goals:** Not core Evidence; not required for Not Detected/Detected decisions  

### IO-011 — Presentation-ready View

- **Purpose:** Conceptual Operator-facing preparation of the Diagnostic Report for the extension popup.  
- **Produced by:** R-009 / S-008  
- **Consumed by:** Operator (external actor); Completion acknowledges readiness  
- **Ownership:** Presentation Preparation  
- **Mutability expectations:** Must not alter Detection Result meanings or invent Evidence  
- **Non-goals:** Not UI component tree; not Chrome APIs  

### IO-012 — Completion Disposition

- **Purpose:** Pipeline outcome label (Completed, Completed Partial, Unknown-qualified, reserved Not Applicable).  
- **Produced by:** R-001 / S-009 informed by Report completeness  
- **Consumed by:** Architecture review / testing expectations; Operator implicitly via report  
- **Ownership:** Investigation Coordination  
- **Mutability expectations:** Reflects allowed incompleteness; does not erase Unknown Qualifications  
- **Non-goals:** Not retry policy  

---

## 4. Information Flow

Conceptual movement and ownership transfer (not runtime):

```
Operator intent
    ↓
IO-001 Investigation Context          [R-001 / S-001]
    ↓
IO-002 Observation Affordance         [R-002 / S-002]
    ↓
IO-004 Evidence                       [R-003 / S-003]
    ↓
IO-005 Normalized Evidence            [R-004 / S-004]  ← becomes immutable for downstream use
    ↓
IO-006 Evaluation Agenda              [R-005 / S-005]
    (+ IO-008 Unknown Qualifications as needed)
    ↓
IO-003 Store Information
IO-007 Detection Result Set           [R-006 / S-006]
    (+ IO-008 preserved)
    ↓
IO-009 Diagnostic Report              [R-007 / S-007]
    ← optional IO-010 Product Configuration [R-008] (adjunct only)
    ↓
IO-011 Presentation-ready View        [R-009 / S-008]
    ↓
IO-012 Completion Disposition         [R-001 / S-009]
```

**Ownership transfer rules:**

1. Each arrow is a conceptual handoff: producer finishes its completion condition; consumer accepts without rewriting upstream meaning.  
2. **Normalized Evidence** is the last mutable Evidence form; Evaluation/Assembly/Presentation do not edit it to fit outcomes.  
3. **Detection Result Set** is finalized at Domain Evaluation for the Investigation; Assembly composes, Presentation projects.  
4. **Product Configuration** may join only at Assembly; it never flows backward into Evidence or Agenda.  
5. **Unknown Qualifications** flow forward with Agenda → Results → Report → View → Disposition.

---

## 5. Information Transformation Principles

| Transformation | Allowed meaning | Forbidden |
|---|---|---|
| Observation Affordance → Evidence | Collect observable public facts | Invent facts; use Admin/backend as core source |
| Evidence → Normalized Evidence | Consistent form without semantic change | Conclusion-driven rewriting |
| Normalized Evidence + Agenda → Store Information / Detection Results | Evidence-based evaluation per Detection Strategy | False certainty; single-selector sole basis for products; closing Unknowns |
| Detection Results + Store Information → Diagnostic Report | Composition / assembly | Re-evaluation of Evidence; dropping obligated results |
| Optional Product Configuration → Diagnostic Report | Adjunct attachment | Gating core report fields |
| Diagnostic Report → Presentation-ready View | Preparation for Operator consumption | Mutating Detection Results; fabricating Evidence |
| Report completeness → Completion Disposition | Label Completed / Completed Partial / Unknown-qualified | Treating Not Detected as total failure by default |
| Unknown preservation | Unknown Qualifications survive all transforms | Silent suppression |

---

## 6. Data Flow Invariants

| ID | Invariant | Authority |
|---|---|---|
| DF-INV-001 | Normalized Evidence is immutable for downstream Evaluation, Assembly, and Presentation within the Investigation. | ADR-002 intent; R-004; DET-INV-002 |
| DF-INV-002 | Presentation-ready View must not change Detection Result meanings. | System §4–§5; Pipeline P-INV-003; FR-020 |
| DF-INV-003 | Domain Unknown Qualifications are preserved through Assembly and Presentation. | EP-003; DET-INV-003; Pipeline P-INV-004 |
| DF-INV-004 | Core Diagnostic Report content flows without Product Configuration. | FR-026; EP-011; S-INV-005; Pipeline P-INV-005 |
| DF-INV-005 | Evidence does not bypass Domain Evaluation to become Operator-facing claims. | EP-007; Pipeline P-INV-002; S-INV-002 |
| DF-INV-006 | FlexyPe Product Not Detected outcomes flow unchanged when emitted under FR-013. | FR-013; EP-009; DET-INV-005 |
| DF-INV-007 | Information on the core path remains browser-local in authority (no required backend information object). | NFR-001; NFR-002; EP-005; C-006; C-007 |
| DF-INV-008 | One Investigation Context binds one Storefront target for the flow. | C-002; Domain INV-001; P-INV-001 |
| DF-INV-009 | No flow writes remediation or mutation instructions to the Storefront. | EP-012 |

---

## 7. Information Completeness

Architectural handling of incompleteness—no recovery, no retry:

| Condition | Flow behavior |
|---|---|
| **Partial Store Information / Unavailable Theme** | IO-003 may be partial; flows to Report; Disposition may be Completed Partial (FR-007; EP-018) |
| **Unknown Features / Apps (U-001 / U-002)** | Agenda retains items; Results may be Unknown-qualified; Report preserves IO-008 |
| **Sparse / missing Evidence** | Normalized Evidence may be thin; Evaluation applies restraint (Not Detected for insufficient product confidence); no fabricated Evidence injected mid-flow |
| **Permission/CSP limits (U-007)** | Some Evidence classes empty; downstream completeness reduced; no Admin channel substituted |
| **Missing Product Configuration (U-006 or bonus omitted)** | IO-010 absent; IO-009 core still assembles |
| **Part 3 explanation unavailable (U-005)** | Disabled results may flow without explanation adjunct |
| **SPA navigation ambiguity (U-009)** | Whether a new Investigation Context is required Unspecified; do not invent a merge flow here |

---

## 8. Data Flow Variation Points

| Variation | Flexibility without redesigning ownership |
|---|---|
| **Future Evidence** | Extends IO-004/IO-005 content under same Collection→Normalization ownership |
| **Future FlexyPe Products** | Requires requirements change; then Agenda/Results widen under same Evaluation ownership |
| **Future Store Information fields** | Requires requirements change; still produced at Evaluation, assembled into Report |
| **Future Detection Result kinds** | Must obey Detection Strategy outcome semantics; still owned by Evaluation |
| **Optional bonus** | IO-010 present or absent; join point remains Assembly only |
| **Unknowns** | Adjust Qualifications and completeness; do not remove objects from the chain |
| **Theme discovery richness** | Affects IO-003 completeness only |

---

## 9. Data Flow Risks

Structural risks only—no mitigations.

| ID | Risk |
|---|---|
| DF-RISK-001 | **Information loss** — dropping Detection Results or Unknown Qualifications before Presentation |
| DF-RISK-002 | **Premature transformation** — forming Detection Results before Normalized Evidence exists |
| DF-RISK-003 | **Evidence contamination** — injecting bonus/backend data into Evidence |
| DF-RISK-004 | **Ownership leakage** — Presentation owning or rewriting Evaluation outputs |
| DF-RISK-005 | **Presentation mutation** — UI preparation altering Not Detected/Detected meaning |
| DF-RISK-006 | **Unknown suppression** — stripping IO-008 to force a “clean” report |
| DF-RISK-007 | **Assembly bypass** — Presentation consuming Evidence directly |
| DF-RISK-008 | **Context drift** — mid-flow change of Storefront target without new Investigation Context |

---

## 10. Data Flow Glossary

| Term | Meaning |
|---|---|
| **Information Object (IO-***)** | Conceptual carrier of domain information in the flow |
| **Information flow** | Conceptual movement and ownership transfer among objects |
| **Ownership transfer** | Handoff of an information object from producer responsibility to consumer responsibility |
| **Transformation** | Allowed conceptual change in form/role (e.g., Evidence → Normalized Evidence) that preserves truth constraints |
| **Immutability (Normalized Evidence)** | Downstream stages must not rewrite Normalized Evidence to fit conclusions |
| **Adjunct flow** | Optional Product Configuration path that joins at Assembly only |
| **Presentation-ready View** | Conceptual Operator-facing preparation of the Diagnostic Report |
| **Unknown Qualification** | Explicit marker that Unknowns influence an agenda item or result |
| **Completion Disposition** | End-of-pipeline outcome label for the Investigation’s information completeness |
| **Core information path** | Flow from Investigation Context through Presentation-ready View without required Product Configuration |
| **Information boundary** | Limit preventing a consumer from owning or mutating a producer’s meaning |

Domain terms retain `04_DOMAIN_MODEL` definitions. Responsibility and stage identifiers retain System Architecture and Investigation Pipeline meanings.

---

**End of Data Flow.**  
Next architecture document per Architecture Master Plan: `09_PACKAGE_ARCHITECTURE` (depends on Data Flow).
