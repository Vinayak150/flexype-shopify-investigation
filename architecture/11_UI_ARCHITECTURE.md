# 11 — UI Architecture

**Status:** Draft — depends on approved `10_EXTENSION_ARCHITECTURE` and upstream architecture `04`–`09`  
**Document type:** Conceptual Operator-facing presentation architecture (not HTML, CSS, components, frameworks, styling, or handlers)  
**Authoritative inputs:** Architecture Master Plan; `00_PROJECT_VISION`–`10_EXTENSION_ARCHITECTURE`; Product Support Engineer Assignment (FlexyPe)

Domain entities, Information Objects (`IO-*`), Presentation Runtime (RR-006), and Reporting ownership are reused and not redefined.

**The UI is a presentation of the Diagnostic Report.** It is not an evaluation engine and not a data source.

---

## 1. Purpose

This document defines how the **Presentation-ready View** organizes Diagnostic Report information for human consumption in the extension popup (FR-020; Vision §8.2).

**Relationship to Extension Architecture:** Realizes Presentation Runtime (RR-006) / Presentation Package (P-006) only. Does not host Detection Runtime or Evidence Runtime concerns.

**Relationship to Reporting:** Consumes Diagnostic Report (IO-009) produced by Reporting Runtime. Must not assemble or re-evaluate conclusions.

**Relationship to Data Flow:** Obeys DF-INV-002 (Presentation must not change Detection Result meanings) and Unknown Qualification preservation (DF-INV-003).

**Relationship to Testing Strategy:** Tests may verify that obligated findings and Unknowns are present in the Operator-facing organization without requiring a specific visual system.

This document defines **presentation architecture only**—information hierarchy and boundaries, not pixels or frameworks.

---

## 2. UI Scope

### 2.1 Included presentation concerns

- Organizing Diagnostic Report content into conceptual presentation sections  
- Defining Operator reading order / information hierarchy  
- Making Not Detected, Disabled, Available/Unavailable, and Unknown outcomes visible  
- Keeping optional Product Configuration from displacing core findings  
- Preserving Investigation Status / Completion Disposition visibility  

### 2.2 Excluded concerns

| Excluded | Why |
|---|---|
| HTML/CSS, component libraries, design tokens | Implementation / visual design |
| Click handlers, form controls, animations | Implementation |
| Evidence collection or detection evaluation | Detection / Evidence ownership |
| Chrome API usage / popup chrome mechanics | Extension implementation |
| Inventing feature catalogs or app-detection methods | U-001 / U-002 Open |
| Non-Shopify empty-state product design beyond reserved disposition | U-008 Open |
| Accessibility implementation details | Variation point only; not a visual system here |

### 2.3 Presentation responsibilities

| Responsibility | Owner |
|---|---|
| Prepare Presentation-ready View from Diagnostic Report | Presentation Runtime / this architecture |
| Produce Diagnostic Report truths | Reporting Runtime (upstream) |
| Produce Detection Results / Store Information | Detection Runtime (upstream) |
| Initiate Investigation | Extension Coordinator (upstream) |

### 2.4 Presentation boundaries

| Boundary | Rule |
|---|---|
| **Input boundary** | Presentation consumes Diagnostic Report (+ embedded optional configuration if present)—not raw Evidence |
| **Truth boundary** | Presentation may organize and surface; it may not alter Detection Result or Store Information meanings |
| **Core-vs-optional boundary** | Optional Product Configuration is adjunct and never replaces core sections |
| **Unknown boundary** | Unknown Qualifications remain Operator-visible; not suppressed for “clean UI” |

---

## 3. Presentation Model

Conceptual sections of the Operator-facing view. Names are architectural, not widgets.

### PS-001 — Investigation Summary

- **Purpose:** Orient the Operator to what is being investigated.  
- **Displays:** That an Investigation targets the current Storefront context; high-level identity cues already present in Store Information (e.g., shop/domain cues) without re-detecting.  
- **Consumes:** Investigation Context aspects carried via Diagnostic Report / presentation preparation inputs.  
- **Must never display:** Fabricated storefront facts; evaluation reasoning invented outside the Report.  
- **Non-goals:** Not a dashboard of unrelated metrics.  
- **Authority:** FR-020; FR-023; C-002.

### PS-002 — Store Information

- **Purpose:** Present Part 1 fields.  
- **Displays:** Store URL, Shop Name, Base Currency, Country, Locale, Shopify Domain, Theme Name (Available/Unavailable), Current Page (per assignment listing; U-004 Open on exhaustiveness).  
- **Consumes:** Store Information (IO-003) from Diagnostic Report.  
- **Must never display:** Admin-only fields; invented theme when Unavailable.  
- **Non-goals:** Not theme asset browsers.  
- **Authority:** FR-001–FR-009; FR-021; FR-007.

### PS-003 — FlexyPe Products

- **Purpose:** Present presence outcomes for Checkout, FlexyPass, and FlexyCart.  
- **Displays:** Per-product Detection Result outcomes including **Detected** and **Not Detected** as emitted.  
- **Consumes:** Detection Result Set entries for FlexyPe Products.  
- **Must never display:** Additional FlexyPe products beyond C-011; coerced binaries replacing Not Detected.  
- **Non-goals:** Not confidence scores; not selector dumps as primary UI.  
- **Authority:** FR-010–FR-013; C-011; EP-009; DET-INV-005.

### PS-004 — Disabled Integrations

- **Purpose:** Present Part 3 disabled/commented integration findings.  
- **Displays:** Disabled Integration outcomes; optional explanation/snippet intent when present in the Report (FR-018; depth U-005 Open).  
- **Consumes:** Detection Result Set / Disabled Integration conclusions from Diagnostic Report.  
- **Must never display:** Remediation actions that mutate the storefront.  
- **Non-goals:** Not a code editor.  
- **Authority:** FR-016–FR-018; EP-010; EP-012.

### PS-005 — Third-party Apps

- **Purpose:** Present Objective Q3 findings.  
- **Displays:** Third-party app presence conclusions as provided; **Unknown** when method/definition gaps apply (U-002).  
- **Consumes:** Detection Result Set entries for Third-party Apps + Unknown Qualifications.  
- **Must never display:** Invented app catalogs presented as assignment fact.  
- **Non-goals:** Not resolving U-002 in the UI layer.  
- **Authority:** FR-019; EP-003; DP-012.

### PS-006 — Storefront Features

- **Purpose:** Present Objective Q5 findings.  
- **Displays:** Feature availability conclusions as provided; **Unknown** when enumeration/definition gaps apply (U-001).  
- **Consumes:** Detection Result Set entries for Storefront Features + Unknown Qualifications.  
- **Must never display:** Invented feature taxonomies as settled truth.  
- **Non-goals:** Not resolving U-001 in the UI layer.  
- **Authority:** FR-022; EP-003; DP-012.

### PS-007 — Optional Product Configuration

- **Purpose:** Present optional bonus configuration when attached to the Diagnostic Report.  
- **Displays:** Readable Product Configuration for detected products when Available; absence/unavailability when bonus omitted or unavailable (U-006).  
- **Consumes:** Product Configuration (IO-010) adjunct inside/alongside Diagnostic Report.  
- **Must never display:** Configuration as a substitute for product Detected/Not Detected outcomes; must not appear as a prerequisite to reading core sections.  
- **Non-goals:** Not configuration editing; not backend administration.  
- **Authority:** FR-025; FR-026; EP-011; C-008.

### PS-008 — Unknown Qualifications

- **Purpose:** Make Open Unknown influence visible to the Operator when it materializes in the Report.  
- **Displays:** Explicit Unknown-qualified findings / gaps affecting agenda items (without resolving them).  
- **Consumes:** Unknown Qualifications (IO-008) preserved through Reporting.  
- **Must never display:** Silent omission of Unknowns to imply certainty.  
- **Non-goals:** Not an architecture-review checklist UI for all U-001–U-010 unless present in the Report.  
- **Authority:** EP-003; DF-INV-003; PKG-INV-008; EXT-INV-009.

### PS-009 — Investigation Status

- **Purpose:** Present Completion Disposition for the Investigation.  
- **Displays:** Completed, Completed Partial, Unknown-qualified completion notes; reserved Not Applicable only if Report/disposition supplies it (U-008 Open—no mandatory empty-state invention).  
- **Consumes:** Completion Disposition (IO-012) / Report completeness signals.  
- **Must never display:** Treating Not Detected alone as Investigation failure by default.  
- **Non-goals:** Not retry controls architecture.  
- **Authority:** Pipeline §6; EP-018; ADR-006 intent.

---

## 4. Presentation Flow

Conceptual Operator reading order (not interaction design):

```
PS-001 Investigation Summary
    ↓
PS-002 Store Information
    ↓
PS-003 FlexyPe Products
    ↓
PS-004 Disabled Integrations
    ↓
PS-005 Third-party Apps
    ↓
PS-006 Storefront Features
    ↓
PS-008 Unknown Qualifications   (may also be inline with PS-005/PS-006; must remain visible)
    ↓
PS-007 Optional Product Configuration   (after core findings)
    ↓
PS-009 Investigation Status
```

**Rationale:**

1. **Orient then detail** — Summary/Store Information establish context before product conclusions (Part 1 before Parts 2–3).  
2. **Core FlexyPe diagnostics before broader Objectives** — Products and disabled integrations are primary assignment Parts; third-party/features follow.  
3. **Unknowns remain visible** — either grouped and/or adjacent to affected sections; never buried after optional content.  
4. **Optional configuration last among content sections** — EP-011 / FR-026: bonus must not dominate or precede core findings.  
5. **Status closes the reading** — Operator sees Investigation disposition after consuming findings.

---

## 5. Presentation Principles

| ID | Principle | Authority |
|---|---|---|
| UI-P-001 | **Evidence-derived presentation** — Everything shown as fact comes from Diagnostic Report truths produced upstream | EP-007; DF-INV-005; EXT-INV-001 |
| UI-P-002 | **No hidden conclusions** — Detected, Not Detected, Disabled, Unavailable, Unknown outcomes remain visible when present | FR-013; EP-009; EP-018 |
| UI-P-003 | **Unknown visibility** — Unknown Qualifications are Operator-visible | EP-003; DF-INV-003 |
| UI-P-004 | **Core before optional** — Parts 1–3 / core Objective sections precede Optional Product Configuration | EP-011; FR-026 |
| UI-P-005 | **Stable ordering** — Reading order in §4 is the default architectural order unless requirements change | FR-020; assignment Part ordering |
| UI-P-006 | **Presentation neutrality** — UI organizes; it does not advocate false certainty | EP-009; DET-INV-005 |
| UI-P-007 | **Read-only presentation** — Operator view does not mutate Storefront or rewrite Report truths | EP-012; DF-INV-002 |
| UI-P-008 | **No evaluation in UI** — Presentation Runtime never becomes Detection Runtime | PKG-INV-002; EXT-INV-001 |
| UI-P-009 | **Attribution welcome, not mandatory copy** — Explainability intent from Report may be surfaced for Part 3 when present; UI does not invent attribution | EP-010; FR-018; U-005 |
| UI-P-010 | **Internal-tool pragmatism** — Presentation serves Sales/Support investigation, not merchant marketing surfaces | FR-023; C-013; EP-013 |

---

## 6. Presentation Invariants

| ID | Invariant | Authority |
|---|---|---|
| UI-INV-001 | Presentation never changes Detection Result or Store Information meanings. | DF-INV-002; EXT-INV-001; PKG-INV-002 |
| UI-INV-002 | Unknown Qualifications remain visible when present in the Diagnostic Report. | EP-003; DF-INV-003; EXT-INV-009 |
| UI-INV-003 | Optional Product Configuration never displaces or gates core findings sections. | FR-026; EP-011; UI-P-004 |
| UI-INV-004 | Presentation invents no storefront facts and no Detection Results. | EP-007; EP-004; UI-P-001 |
| UI-INV-005 | FlexyPe Product **Not Detected** outcomes remain displayed as Not Detected when emitted. | FR-013; EP-009; DF-INV-006 |
| UI-INV-006 | Presentation does not require Configuration Runtime content to show Parts 1–3 / core Objective answers. | FR-026; EXT-INV-005 |
| UI-INV-007 | Presentation does not own Evidence collection or multi-signal evaluation. | P-006 must-never-own; RR-006 |
| UI-INV-008 | Remediation/mutation affordances are out of presentation scope. | EP-012; UI-P-007 |
| UI-INV-009 | Closed FlexyPe product set in presentation matches Checkout, FlexyPass, FlexyCart only. | C-011; Domain INV-007 |

---

## 7. Presentation Variation Points

| Variation | Flexibility |
|---|---|
| **Future sections** | Add only with requirements authority; preserve core-before-optional ordering |
| **Future FlexyPe Products** | Extend PS-003 only after C-011/requirements change |
| **Future findings kinds** | Map into existing section families or new approved sections without moving evaluation into UI |
| **Optional bonus** | PS-007 present, empty, or omitted without affecting core sections |
| **Localization** | Wording/locale of labels may vary; meanings of outcomes must not |
| **Accessibility** | Implementation may enhance access; must not hide Unknowns or Not Detected |
| **Unknowns (U-001/U-002/U-005/U-008)** | Affect what PS-005/PS-006/PS-004/PS-009 can honestly show; UI must not resolve them |
| **Inline vs grouped Unknowns** | Unknown Qualifications may appear grouped (PS-008) and/or adjacent to affected sections, provided visibility invariant holds |

---

## 8. Presentation Risks

Structural risks only—no mitigations.

| ID | Risk |
|---|---|
| UI-RISK-001 | **Information overload** — optional/detail noise obscuring Part 1–3 answers |
| UI-RISK-002 | **Hidden Unknowns** — suppressing Unknown Qualifications for a “cleaner” popup |
| UI-RISK-003 | **Core findings buried** — placing optional configuration or secondary content above products/store info |
| UI-RISK-004 | **Presentation mutation** — UI rewriting Not Detected into Absent/Detected |
| UI-RISK-005 | **Optional dominance** — bonus configuration becoming the visual primary |
| UI-RISK-006 | **Evaluation leakage** — popup logic re-detecting from Evidence |
| UI-RISK-007 | **False empty-state invention** — mandating non-Shopify UI behavior despite U-008 |
| UI-RISK-008 | **Attribution theater** — inventing Part 3 explanations not present in the Report |

---

## 9. Presentation Glossary

| Term | Meaning |
|---|---|
| **Presentation Section (PS-***)** | Conceptual Operator-facing information grouping |
| **Presentation Model** | The set and purpose of presentation sections |
| **Presentation Flow** | Conceptual Operator reading order across sections |
| **Presentation-ready View** | IO-011 prepared by Presentation Runtime from Diagnostic Report |
| **Presentation neutrality** | Organizing outcomes without altering their meaning or inventing certainty |
| **Core presentation** | Sections required to surface Parts 1–3 and core Objective answers |
| **Optional presentation** | Product Configuration section; non-blocking |
| **Unknown visibility** | Requirement that Unknown Qualifications remain Operator-visible |
| **Read-only presentation** | Operator view that does not mutate Storefront or Report truths |
| **Information hierarchy** | Relative primacy of sections (core before optional; context before conclusions) |

Domain entities, Detection outcomes, and Diagnostic Report retain meanings from prior architecture documents.

---

**End of UI Architecture.**  
Next architecture document per Architecture Master Plan: `12_TESTING_STRATEGY` (depends on UI Architecture).
