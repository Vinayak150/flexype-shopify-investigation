# 03 — Traceability Matrix

**Status:** Draft — depends on approved `00_PROJECT_VISION`, `01_REQUIREMENTS_ANALYSIS`, `02_ENGINEERING_PRINCIPLES`  
**Document type:** Architecture governance / traceability (not architecture design, not requirements restatement, not implementation)  
**Authoritative inputs:** Architecture Master Plan; `00_PROJECT_VISION.md`; `01_REQUIREMENTS_ANALYSIS.md`; `02_ENGINEERING_PRINCIPLES.md`; Product Support Engineer Assignment (FlexyPe)

### Status Vocabulary

| Status | Meaning |
|---|---|
| **Documented (Planning)** | Covered by an approved planning document (`00`–`03`) |
| **Planned** | Assigned to a future architecture document not yet written/accepted |
| **Open** | Unknown not resolved; must remain visible |
| **Accepted** | Reserved for future use when an owning architecture document or ADR is accepted |
| **Deferred** | Reserved for future use when Architecture Review explicitly defers an item |

At the time of this matrix, architecture documents `04`–`13` and ADRs are **Planned**; all `U-*` items are **Open**.

---

## 1. Purpose

Traceability guarantees that every architectural claim and implementation-relevant decision remains connected to the assignment through normalized requirement IDs, constraints, Unknowns, and engineering principles.

**Relationship to Vision:** Vision freezes mission, scope, non-goals, and success framing. This matrix does not redefine Vision; it ensures later architecture cannot drift outside Vision-bounded obligations.

**Relationship to Requirements:** `01_REQUIREMENTS_ANALYSIS` owns obligation text (`FR-*`, `NFR-*`, `C-*`, `U-*`). This matrix owns the *coverage path*: which future document is responsible for addressing each ID and where verification is expected.

**Relationship to Engineering Principles:** `02_ENGINEERING_PRINCIPLES` owns constitutional rules (`EP-*`). This matrix maps which architecture documents must apply each principle (EP-015 Traceability; EP-001 Assignment Fidelity; EP-003 Unknown Preservation).

**Relationship to future architecture:** Downstream documents (`04_DOMAIN_MODEL` through `13_ARCHITECTURE_REVIEW`) must cite IDs from this matrix’s sources, update coverage status when accepted, and must not invent requirements. This document coordinates ownership; it does not design solutions.

---

## 2. Traceability Rules

These rules are immutable for the life of this matrix unless Vision, Requirements, or Principles are formally amended.

| Rule ID | Rule |
|---|---|
| TR-001 | Every `FR-*` from Requirements Analysis appears in §3 exactly once. |
| TR-002 | Every `NFR-*` from Requirements Analysis appears in §4 exactly once. |
| TR-003 | Every `C-*` from Requirements Analysis appears in §5 exactly once. |
| TR-004 | Every `U-*` from Requirements Analysis appears in §6 exactly once. |
| TR-005 | Unknowns never disappear; status may move from Open only by recorded Resolution Authority action that does not invent assignment text (EP-003). |
| TR-006 | Every `EP-*` appears in §7 exactly once. |
| TR-007 | Every Master Plan ADR identifier (ADR-001–ADR-006) appears in §8 exactly once. |
| TR-008 | Architecture documents must cite requirement / constraint / Unknown / principle IDs when making normative claims (EP-015). |
| TR-009 | Architecture cannot invent requirements; new obligations require Requirements/Vision update first (EP-001, EP-002, AP-001). |
| TR-010 | Primary ownership may list multiple documents; exactly one document is marked **Primary Owner**; others are **Supporting**. |
| TR-011 | Verification ownership defaults to `12_TESTING_STRATEGY` for runtime-observable obligations unless noted otherwise. |
| TR-012 | Optional items (FR-025, related) remain optional; coverage may be Planned without making them mandatory (EP-011). |
| TR-013 | Status values must stay internally consistent with § Status Vocabulary. |
| TR-014 | `13_ARCHITECTURE_REVIEW` validates this matrix before Implementation Authorization. |

---

## 3. Functional Requirement Matrix

| Requirement ID | Requirement Summary | Owning Architecture Document | Verification Document | Current Status | Coverage Notes |
|---|---|---|---|---|---|
| FR-001 | Collect/display Store URL | **Primary:** `04_DOMAIN_MODEL`; **Supporting:** `06_INVESTIGATION_PIPELINE`, `08_DATA_FLOW`, `11_UI_ARCHITECTURE` | `12_TESTING_STRATEGY` | Planned | Part 1 field |
| FR-002 | Collect/display Shop Name | **Primary:** `04_DOMAIN_MODEL`; **Supporting:** `06_INVESTIGATION_PIPELINE`, `08_DATA_FLOW`, `11_UI_ARCHITECTURE` | `12_TESTING_STRATEGY` | Planned | Part 1 field |
| FR-003 | Collect/display Base Currency | **Primary:** `04_DOMAIN_MODEL`; **Supporting:** `06_INVESTIGATION_PIPELINE`, `08_DATA_FLOW`, `11_UI_ARCHITECTURE` | `12_TESTING_STRATEGY` | Planned | Part 1 field |
| FR-004 | Collect/display Country | **Primary:** `04_DOMAIN_MODEL`; **Supporting:** `06_INVESTIGATION_PIPELINE`, `08_DATA_FLOW`, `11_UI_ARCHITECTURE` | `12_TESTING_STRATEGY` | Planned | Part 1 field |
| FR-005 | Collect/display Locale | **Primary:** `04_DOMAIN_MODEL`; **Supporting:** `06_INVESTIGATION_PIPELINE`, `08_DATA_FLOW`, `11_UI_ARCHITECTURE` | `12_TESTING_STRATEGY` | Planned | Part 1 field |
| FR-006 | Collect/display Shopify Domain | **Primary:** `04_DOMAIN_MODEL`; **Supporting:** `06_INVESTIGATION_PIPELINE`, `08_DATA_FLOW`, `11_UI_ARCHITECTURE` | `12_TESTING_STRATEGY` | Planned | Part 1 field |
| FR-007 | Collect/display Theme Name if available | **Primary:** `04_DOMAIN_MODEL`; **Supporting:** `06_INVESTIGATION_PIPELINE`, `11_UI_ARCHITECTURE` | `12_TESTING_STRATEGY` | Planned | Links FR-021; EP-018 |
| FR-008 | Collect/display Current Page | **Primary:** `04_DOMAIN_MODEL`; **Supporting:** `06_INVESTIGATION_PIPELINE`, `11_UI_ARCHITECTURE` | `12_TESTING_STRATEGY` | Planned | Preserve U-004 |
| FR-009 | Use public storefront signals for store info | **Primary:** `07_DETECTION_STRATEGY`; **Supporting:** `05_SYSTEM_ARCHITECTURE`, `10_EXTENSION_ARCHITECTURE` | `12_TESTING_STRATEGY` | Planned | With C-003; EP-006 |
| FR-010 | Detect FlexyPe Checkout | **Primary:** `07_DETECTION_STRATEGY`; **Supporting:** `04_DOMAIN_MODEL`, `06_INVESTIGATION_PIPELINE` | `12_TESTING_STRATEGY` | Planned | FR-014 reference store |
| FR-011 | Detect FlexyPass | **Primary:** `07_DETECTION_STRATEGY`; **Supporting:** `04_DOMAIN_MODEL`, `06_INVESTIGATION_PIPELINE` | `12_TESTING_STRATEGY` | Planned | FR-014 reference store |
| FR-012 | Detect FlexyCart | **Primary:** `07_DETECTION_STRATEGY`; **Supporting:** `04_DOMAIN_MODEL`, `06_INVESTIGATION_PIPELINE` | `12_TESTING_STRATEGY` | Planned | FR-014 reference store |
| FR-013 | Display Not Detected when not confident | **Primary:** `07_DETECTION_STRATEGY`; **Supporting:** `04_DOMAIN_MODEL`, `11_UI_ARCHITECTURE` | `12_TESTING_STRATEGY` | Planned | EP-009; preserve U-003 |
| FR-014 | Honor reference storefront expectations | **Primary:** `12_TESTING_STRATEGY`; **Supporting:** `07_DETECTION_STRATEGY` | `12_TESTING_STRATEGY` | Planned | aseemshakti; zouraofficial |
| FR-015 | Consider listed public signal classes | **Primary:** `07_DETECTION_STRATEGY`; **Supporting:** `08_DATA_FLOW`, `10_EXTENSION_ARCHITECTURE` | `12_TESTING_STRATEGY` | Planned | With C-004/C-005; EP-008 |
| FR-016 | Detect disabled/commented FlexyPe integrations | **Primary:** `07_DETECTION_STRATEGY`; **Supporting:** `04_DOMAIN_MODEL`, `11_UI_ARCHITECTURE` | `12_TESTING_STRATEGY` | Planned | Part 3 |
| FR-017 | Recognize disabled-state example forms | **Primary:** `07_DETECTION_STRATEGY`; **Supporting:** `04_DOMAIN_MODEL` | `12_TESTING_STRATEGY` | Planned | Comments, snippets, hidden containers |
| FR-018 | Part 3 bonus: snippet or explanation | **Primary:** `07_DETECTION_STRATEGY`; **Supporting:** `11_UI_ARCHITECTURE` | `12_TESTING_STRATEGY` | Planned | EP-010; preserve U-005 |
| FR-019 | Report third-party Shopify apps present | **Primary:** `07_DETECTION_STRATEGY`; **Supporting:** `04_DOMAIN_MODEL`, `11_UI_ARCHITECTURE` | `12_TESTING_STRATEGY` | Planned | Obligation in scope; method U-002 Open |
| FR-020 | Present all diagnostics in extension popup | **Primary:** `11_UI_ARCHITECTURE`; **Supporting:** `10_EXTENSION_ARCHITECTURE`, `05_SYSTEM_ARCHITECTURE` | `12_TESTING_STRATEGY` | Planned | Operator surface |
| FR-021 | Answer Shopify theme objective | **Primary:** `04_DOMAIN_MODEL`; **Supporting:** `11_UI_ARCHITECTURE` | `12_TESTING_STRATEGY` | Planned | Via FR-007 |
| FR-022 | Report storefront features available | **Primary:** `07_DETECTION_STRATEGY`; **Supporting:** `04_DOMAIN_MODEL`, `11_UI_ARCHITECTURE` | `12_TESTING_STRATEGY` | Planned | Obligation in scope; definition U-001 Open |
| FR-023 | Serve Sales/Support internal operators | **Primary:** `00_PROJECT_VISION` (users); **Supporting:** `11_UI_ARCHITECTURE` | `13_ARCHITECTURE_REVIEW` | Documented (Planning) / Planned UI | User boundary; not merchant-facing |
| FR-024 | Submission artifacts (repo, README, detection explanation, email) | **Primary:** Delivery documentation (README); **Supporting:** `12_TESTING_STRATEGY` (doc expectations) | `13_ARCHITECTURE_REVIEW` | Planned | Outside runtime architecture |
| FR-025 | Optional: view FlexyPe product configuration | **Primary:** `05_SYSTEM_ARCHITECTURE` (seam); **Supporting:** `11_UI_ARCHITECTURE` | `12_TESTING_STRATEGY` | Planned | Optional; U-006 Open; EP-011 |
| FR-026 | Optional bonus must not block core | **Primary:** `05_SYSTEM_ARCHITECTURE`; **Supporting:** `02_ENGINEERING_PRINCIPLES` (EP-011), `13_ARCHITECTURE_REVIEW` | `13_ARCHITECTURE_REVIEW` | Documented (Planning) principle / Planned system | Core independence |

---

## 4. Non-Functional Requirement Matrix

| Requirement ID | Requirement Summary | Owning Architecture Document | Verification Document | Current Status | Coverage Notes |
|---|---|---|---|---|---|
| NFR-001 | Browser-local operation for core | **Primary:** `05_SYSTEM_ARCHITECTURE`; **Supporting:** `10_EXTENSION_ARCHITECTURE`, EP-005 | `12_TESTING_STRATEGY`; `13_ARCHITECTURE_REVIEW` | Planned | Pairs C-006 |
| NFR-002 | No backend dependency for core | **Primary:** `05_SYSTEM_ARCHITECTURE`; **Supporting:** `10_EXTENSION_ARCHITECTURE`, EP-005, EP-011 | `12_TESTING_STRATEGY`; `13_ARCHITECTURE_REVIEW` | Planned | Pairs C-007/C-008 |
| NFR-003 | Documentation quality | **Primary:** Delivery README; **Supporting:** `12_TESTING_STRATEGY` | `13_ARCHITECTURE_REVIEW` | Planned | With FR-024; EV-006 |
| NFR-004 | Engineering / code quality | **Primary:** `09_PACKAGE_ARCHITECTURE`; **Supporting:** `02_ENGINEERING_PRINCIPLES`, `12_TESTING_STRATEGY` | `13_ARCHITECTURE_REVIEW` | Planned | EV-005 |
| NFR-005 | Maintainability of detection reasoning | **Primary:** `07_DETECTION_STRATEGY`; **Supporting:** `09_PACKAGE_ARCHITECTURE`, EP-019 | `12_TESTING_STRATEGY` | Planned | |
| NFR-006 | Investigation-oriented outcome quality | **Primary:** `02_ENGINEERING_PRINCIPLES` (EP-013); **Supporting:** `07_DETECTION_STRATEGY`, `12_TESTING_STRATEGY` | `13_ARCHITECTURE_REVIEW` | Documented (Planning) / Planned apply | EV-001 emphasis |
| NFR-007 | Timebox awareness (6–8h) | **Primary:** `02_ENGINEERING_PRINCIPLES` (EP-014); **Supporting:** `13_ARCHITECTURE_REVIEW` | `13_ARCHITECTURE_REVIEW` | Documented (Planning) | Pairs C-009 |
| NFR-008 | Performance budgets | **Primary:** None (Unknown); **Supporting:** matrix gap flag | `13_ARCHITECTURE_REVIEW` | Open | Equals U-010; do not invent budgets |

---

## 5. Constraint Matrix

| Constraint ID | Constraint Summary | Owning Architecture Document | Verification Document | Current Status | Coverage Notes |
|---|---|---|---|---|---|
| C-001 | Chrome Extension delivery | **Primary:** `10_EXTENSION_ARCHITECTURE`; **Supporting:** `05_SYSTEM_ARCHITECTURE` | `12_TESTING_STRATEGY`; `13_ARCHITECTURE_REVIEW` | Planned | |
| C-002 | Currently opened Shopify storefront | **Primary:** `06_INVESTIGATION_PIPELINE`; **Supporting:** `04_DOMAIN_MODEL`, ADR-001 | `12_TESTING_STRATEGY` | Planned | |
| C-003 | Public storefront evidence for core | **Primary:** `05_SYSTEM_ARCHITECTURE`; **Supporting:** `07_DETECTION_STRATEGY`, EP-006 | `12_TESTING_STRATEGY`; `13_ARCHITECTURE_REVIEW` | Planned | |
| C-004 | Multi-signal detection required | **Primary:** `07_DETECTION_STRATEGY`; **Supporting:** EP-008, ADR-003 | `12_TESTING_STRATEGY` | Planned | |
| C-005 | No single hardcoded selector | **Primary:** `07_DETECTION_STRATEGY`; **Supporting:** EP-008, ADR-003 | `12_TESTING_STRATEGY` | Planned | AP-004 |
| C-006 | Entirely in-browser for core | **Primary:** `05_SYSTEM_ARCHITECTURE`; **Supporting:** `10_EXTENSION_ARCHITECTURE`, EP-005 | `13_ARCHITECTURE_REVIEW` | Planned | |
| C-007 | No backend services for core | **Primary:** `05_SYSTEM_ARCHITECTURE`; **Supporting:** EP-005 | `13_ARCHITECTURE_REVIEW` | Planned | |
| C-008 | Backend allowed only for optional bonus | **Primary:** `05_SYSTEM_ARCHITECTURE`; **Supporting:** EP-011 | `13_ARCHITECTURE_REVIEW` | Planned | |
| C-009 | Duration guidance 6–8 hours | **Primary:** `02_ENGINEERING_PRINCIPLES` (EP-014); **Supporting:** `13_ARCHITECTURE_REVIEW` | `13_ARCHITECTURE_REVIEW` | Documented (Planning) | |
| C-010 | Not a full-stack application | **Primary:** `00_PROJECT_VISION`; **Supporting:** EP-013, EP-020, `13_ARCHITECTURE_REVIEW` | `13_ARCHITECTURE_REVIEW` | Documented (Planning) | |
| C-011 | FlexyPe product set closed (Checkout, FlexyPass, FlexyCart) | **Primary:** `04_DOMAIN_MODEL`; **Supporting:** `07_DETECTION_STRATEGY`, EP-014 | `12_TESTING_STRATEGY`; `13_ARCHITECTURE_REVIEW` | Planned | |
| C-012 | Submission channel/subject | **Primary:** Delivery documentation | `13_ARCHITECTURE_REVIEW` | Planned | With FR-024 |
| C-013 | Internal tool only | **Primary:** `00_PROJECT_VISION`; **Supporting:** `11_UI_ARCHITECTURE`, EP-013 | `13_ARCHITECTURE_REVIEW` | Documented (Planning) | |

---

## 6. Unknown Tracking Matrix

| Unknown ID | Description | Current Status | Expected Owner | Resolution Authority | Notes |
|---|---|---|---|---|---|
| U-001 | Definition/enumeration of “storefront features” | Open | `04_DOMAIN_MODEL`; `07_DETECTION_STRATEGY` | Assignment clarification or Architecture Review accepting residual risk without inventing features | FR-022 remains in scope |
| U-002 | Method/signals for third-party Shopify app detection | Open | `04_DOMAIN_MODEL`; `07_DETECTION_STRATEGY` | Assignment clarification or Architecture Review residual-risk acceptance | FR-019 remains in scope |
| U-003 | Whether Not Detected applies beyond FlexyPe products | Open | `04_DOMAIN_MODEL`; `07_DETECTION_STRATEGY`; `11_UI_ARCHITECTURE` | Architecture Review after domain/UI proposals that do not invent assignment text | FR-013 fixed for products |
| U-004 | Current Page values exhaustive vs examples | Open | `04_DOMAIN_MODEL` | Architecture Review / assignment clarification | FR-008 |
| U-005 | Depth of Part 3 bonus explanation | Open | `07_DETECTION_STRATEGY`; `11_UI_ARCHITECTURE` | Architecture Review; assignment “if possible” | FR-018 |
| U-006 | Nature of optional bonus APIs (real/mock/omitted) | Open | Delivery increment decision; `05_SYSTEM_ARCHITECTURE` (seam only) | Explicit delivery decision + Architecture Review | Must not block core (FR-026) |
| U-007 | Permission/CSP limits affecting signals | Open | `10_EXTENSION_ARCHITECTURE` | Architecture Review; empirical extension constraints | Do not invent permission set here |
| U-008 | Dedicated empty/error state for non-Shopify pages | Open | `11_UI_ARCHITECTURE`; `04_DOMAIN_MODEL` | Architecture Review | Assignment silent |
| U-009 | Correctness across SPA navigations without reload | Open | `06_INVESTIGATION_PIPELINE`; `10_EXTENSION_ARCHITECTURE` | Architecture Review | Assignment silent |
| U-010 | Explicit performance budgets | Open | None until assignment amended | Assignment amendment only (or accept permanent Open) | NFR-008 |

---

## 7. Principle Coverage Matrix

| Principle ID | Title | Expected Applying Architecture Documents | Current Status |
|---|---|---|---|
| EP-001 | Assignment Fidelity | All architecture docs; **Primary validation:** `03_TRACEABILITY_MATRIX`, `13_ARCHITECTURE_REVIEW` | Documented (Planning); application Planned |
| EP-002 | Single Source of Truth for Obligations | All architecture docs; Requirements as obligation registry | Documented (Planning); application Planned |
| EP-003 | Explicit Unknown Preservation | `04_DOMAIN_MODEL`, `07_DETECTION_STRATEGY`, `11_UI_ARCHITECTURE`, this matrix §6, `13_ARCHITECTURE_REVIEW` | Documented (Planning); Open Unknowns |
| EP-004 | No Silent Assumptions | All ADRs; `04`–`12`; `13_ARCHITECTURE_REVIEW` | Documented (Planning); application Planned |
| EP-005 | Browser-First Core | `05_SYSTEM_ARCHITECTURE`, `10_EXTENSION_ARCHITECTURE`, `06_INVESTIGATION_PIPELINE` | Planned |
| EP-006 | Public Storefront Authority | `05_SYSTEM_ARCHITECTURE`, `07_DETECTION_STRATEGY`, `10_EXTENSION_ARCHITECTURE` | Planned |
| EP-007 | Evidence-Based Detection | `07_DETECTION_STRATEGY`, `08_DATA_FLOW`, `12_TESTING_STRATEGY` | Planned |
| EP-008 | Multi-Signal Validation | `07_DETECTION_STRATEGY`, ADR-003, `12_TESTING_STRATEGY` | Planned |
| EP-009 | Representable Uncertainty | `04_DOMAIN_MODEL`, `07_DETECTION_STRATEGY`, `11_UI_ARCHITECTURE`, ADR-006 | Planned |
| EP-010 | Explainability Where Demanded | `07_DETECTION_STRATEGY`, `11_UI_ARCHITECTURE`, ADR-004 | Planned |
| EP-011 | Optional Bonus Isolation | `05_SYSTEM_ARCHITECTURE`, `11_UI_ARCHITECTURE`, `13_ARCHITECTURE_REVIEW` | Planned |
| EP-012 | Non-Invasive Diagnostics | `05_SYSTEM_ARCHITECTURE`, `11_UI_ARCHITECTURE`, `13_ARCHITECTURE_REVIEW` | Planned |
| EP-013 | Investigation Over Productization | `05_SYSTEM_ARCHITECTURE`, `09_PACKAGE_ARCHITECTURE`, `13_ARCHITECTURE_REVIEW` | Planned |
| EP-014 | Scope Restraint | `13_ARCHITECTURE_REVIEW`; all design docs | Planned |
| EP-015 | Traceability | This document; all docs; `13_ARCHITECTURE_REVIEW` | Documented (Planning) |
| EP-016 | Architecture Before Code | Master Plan gates; `13_ARCHITECTURE_REVIEW` | Documented (Planning) |
| EP-017 | Separation of Concerns (Conceptual) | `05_SYSTEM_ARCHITECTURE`, `09_PACKAGE_ARCHITECTURE`, `10_EXTENSION_ARCHITECTURE`, `11_UI_ARCHITECTURE` | Planned |
| EP-018 | Progressive Completeness | `06_INVESTIGATION_PIPELINE`, `11_UI_ARCHITECTURE`, ADR-006 | Planned |
| EP-019 | Maintainability of Detection Reasoning | `07_DETECTION_STRATEGY`, `09_PACKAGE_ARCHITECTURE`, ADR-003 | Planned |
| EP-020 | Simplicity Under Assignment Focus | `05_SYSTEM_ARCHITECTURE`, `09_PACKAGE_ARCHITECTURE`, `13_ARCHITECTURE_REVIEW` | Planned |

---

## 8. ADR Coverage Matrix

ADRs are listed per Architecture Master Plan. Stub files may exist in the repository; content is not yet accepted. This matrix does not rewrite ADRs.

| ADR | Intent (Master Plan) | Affected Requirements | Affected Principles | Future Architecture Documents | Current Status |
|---|---|---|---|---|---|
| ADR-001 Investigation Root | Unit of investigation is the currently open storefront | C-002; FR-020; A-001 | EP-006; EP-005 | `04_DOMAIN_MODEL`, `06_INVESTIGATION_PIPELINE`, `10_EXTENSION_ARCHITECTURE` | Planned |
| ADR-002 Immutable Snapshot | Evidence for one investigation treated as consistent snapshot | FR-015; C-004; R-T02 (related risk) | EP-007; EP-008 | `06_INVESTIGATION_PIPELINE`, `08_DATA_FLOW` | Planned |
| ADR-003 Definition-Driven Detection | Detection via explicit definitions, not ad-hoc selectors | FR-010–FR-015; FR-016–FR-017; C-004; C-005; C-011 | EP-008; EP-019; EP-007 | `07_DETECTION_STRATEGY`, `04_DOMAIN_MODEL`, `09_PACKAGE_ARCHITECTURE` | Planned |
| ADR-004 Explainable Results | Findings attributable to observable evidence | FR-018; FR-016 | EP-010; EP-007 | `07_DETECTION_STRATEGY`, `11_UI_ARCHITECTURE` | Planned |
| ADR-005 Single Browser Scan | One browser-local scan produces popup diagnostics | NFR-001; NFR-002; C-006; C-007; FR-020 | EP-005; EP-020; EP-014 | `06_INVESTIGATION_PIPELINE`, `05_SYSTEM_ARCHITECTURE`, `10_EXTENSION_ARCHITECTURE` | Planned |
| ADR-006 Partial Failure | Partial/uncertain results are valid outcomes | FR-007; FR-013; FR-018; NFR-006 | EP-009; EP-018 | `06_INVESTIGATION_PIPELINE`, `11_UI_ARCHITECTURE`, `08_DATA_FLOW` | Planned |

---

## 9. Coverage Dashboard

### 9.1 Functional requirements

| Metric | Value |
|---|---|
| Total FR IDs | 26 (FR-001–FR-026; FR-020/021 numbering as in Requirements) |
| Represented in §3 | 26 |
| Status Planned | 24 |
| Status Documented (Planning) / mixed | 2 (FR-023, FR-026) |
| Status Accepted | 0 |

### 9.2 Non-functional requirements

| Metric | Value |
|---|---|
| Total NFR IDs | 8 |
| Represented in §4 | 8 |
| Status Planned | 6 |
| Status Documented (Planning) / mixed | 1 (NFR-006/NFR-007 cluster includes Documented principles) |
| Status Open | 1 (NFR-008 / U-010) |
| Status Accepted | 0 |

### 9.3 Constraints

| Metric | Value |
|---|---|
| Total C IDs | 13 |
| Represented in §5 | 13 |
| Status Planned | 9 |
| Status Documented (Planning) | 4 (C-009, C-010, C-013, and principle-linked items as noted) |
| Status Accepted | 0 |

### 9.4 Unknowns

| Metric | Value |
|---|---|
| Total U IDs | 10 |
| Represented in §6 | 10 |
| Status Open | 10 |
| Status Resolved | 0 |

### 9.5 Principles

| Metric | Value |
|---|---|
| Total EP IDs | 20 |
| Represented in §7 | 20 |
| Constitution Documented (Planning) | 20 |
| Downstream application | Planned |

### 9.6 ADRs

| Metric | Value |
|---|---|
| Total ADR IDs (Master Plan) | 6 |
| Represented in §8 | 6 |
| Status Planned | 6 |
| Status Accepted | 0 |

### 9.7 Architecture document readiness (ownership targets)

| Document | Role in traceability | Current Status |
|---|---|---|
| `00_PROJECT_VISION` | Scope/users/non-goals | Documented (Planning) |
| `01_REQUIREMENTS_ANALYSIS` | Obligation registry | Documented (Planning) |
| `02_ENGINEERING_PRINCIPLES` | Constitution | Documented (Planning) |
| `03_TRACEABILITY_MATRIX` | This matrix | Documented (Planning) |
| `04_DOMAIN_MODEL` | Domain ownership | Planned |
| `05_SYSTEM_ARCHITECTURE` | System/seam ownership | Planned |
| `06_INVESTIGATION_PIPELINE` | Investigation flow ownership | Planned |
| `07_DETECTION_STRATEGY` | Detection ownership | Planned |
| `08_DATA_FLOW` | Evidence/result flow ownership | Planned |
| `09_PACKAGE_ARCHITECTURE` | Maintainability boundaries | Planned |
| `10_EXTENSION_ARCHITECTURE` | Extension runtime ownership | Planned |
| `11_UI_ARCHITECTURE` | Popup ownership | Planned |
| `12_TESTING_STRATEGY` | Verification ownership | Planned |
| `13_ARCHITECTURE_REVIEW` | Sign-off / matrix validation | Planned |

---

## 10. Maintenance Rules

### 10.1 How the matrix evolves
- When a new architecture document is **accepted**, update Current Status for rows it primarily owns from Planned → Accepted (or partial notes if only supporting).
- When an ADR is **accepted**, update §8 Status and adjust related FR/C/EP application notes.
- When Requirements Analysis gains/removes/renumbers IDs, this matrix must be updated in the same change set (TR-001–TR-004).
- When an Unknown is addressed, update §6 only with Resolution Authority, date/note, and new status; never delete the row (TR-005).

### 10.2 Who updates it
- Authors of the accepting architecture document or ADR update the affected rows.
- Architecture Review steward validates completeness at Gate review (`13_ARCHITECTURE_REVIEW`).

### 10.3 When it updates
- Immediately upon acceptance of any of `04`–`12`, any ADR, or any Requirements/Vision/Principles amendment affecting IDs.
- Before Implementation Authorization (mandatory).
- When delivery decides in/out for optional bonus (U-006 / FR-025), record decision without converting bonus to mandatory core.

### 10.4 How architecture review validates it
`13_ARCHITECTURE_REVIEW` must verify:
1. Every FR/NFR/C/U/EP/ADR still appears exactly once.  
2. No Open Unknown was silently removed or silently closed.  
3. Every Accepted architecture document cites IDs consistent with this matrix.  
4. No requirement lacks a Primary Owner.  
5. Optional bonus isolation (FR-026 / EP-011) still holds if bonus is Planned or Accepted.  
6. Dashboard totals match section row counts.

Failure of any check blocks Implementation Authorization.

---

**End of Traceability Matrix.**  
Next architecture document per Architecture Master Plan: `04_DOMAIN_MODEL` (depends on Traceability Matrix).
