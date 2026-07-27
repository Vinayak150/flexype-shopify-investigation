# 12 — Testing Strategy

**Status:** Draft — depends on approved `11_UI_ARCHITECTURE` and upstream architecture `00`–`10`  
**Document type:** Architecture verification strategy (not test code, frameworks, automation tools, or CI/CD)  
**Authoritative inputs:** Architecture Master Plan; `00_PROJECT_VISION`–`11_UI_ARCHITECTURE`; Product Support Engineer Assignment (FlexyPe)

Requirements IDs, Traceability Matrix ownership, package/runtime/presentation invariants, and Domain terminology are reused and not redefined.

**This document verifies architectural intent.** It is not a testing framework and does not prescribe unit/integration harnesses.

---

## 1. Purpose

This document defines **how the architecture is verified** so implementation can derive concrete tests and manual checks without redefining ownership, detection philosophy, or presentation boundaries.

**Relationship to Requirements Analysis:** Verification is requirements-first. Every `FR`/`NFR`/`C` obligation in scope must remain verifiable; optional items remain optional (FR-025/FR-026).

**Relationship to Traceability Matrix:** Verification confirms Primary Owner / Verification Document coverage paths and that Unknowns (`U-*`) remain Open until legitimately addressed (TR-005).

**Relationship to System Architecture / Packages / Runtime / UI:** Verification confirms responsibility, package, runtime, and presentation ownership are not inverted by implementation choices.

**Relationship to Detection Strategy & Pipeline & Data Flow:** Verification confirms Evidence→Evaluation→Assembly→Presentation semantics, including Not Detected, multi-signal philosophy, immutability, and Unknown preservation.

This strategy verifies **architecture conformance and obligation satisfaction**. Tool choice is out of scope.

---

## 2. Testing Scope

### 2.1 Included verification concerns

- Requirements coverage completeness against `01_REQUIREMENTS_ANALYSIS`  
- Ownership integrity across responsibilities, packages, runtime roles, and presentation sections  
- Pipeline stage assumptions and Data Flow handoff rules  
- Detection outcome semantics (Detected / Not Detected / Disabled / Unknown / Available / Unavailable)  
- Reporting assembly and Presentation neutrality  
- Browser-local core path independence from optional configuration  
- Traceability of conclusions to obligation IDs  
- Empirical product-presence expectations on assignment reference storefronts (FR-014)  
- Documentation obligations (FR-024; NFR-003) as delivery verification  

### 2.2 Excluded concerns

| Excluded | Why |
|---|---|
| Named test frameworks, runners, assertion libraries | Implementation tooling |
| CI/CD pipelines, coverage thresholds as policy engines | Delivery engineering |
| Pixel/regression screenshot tooling | Visual implementation |
| Performance SLAs | U-010 / NFR-008 Open—no invented budgets |
| Resolving U-001–U-010 inside “tests” by inventing catalogs | EP-003 |
| Security penetration programs beyond architecture scope | Out of assignment architecture series |

### 2.3 Verification responsibilities

| Concern | Architectural verifier focus |
|---|---|
| Obligation presence | Requirements + Traceability |
| Ownership non-inversion | System / Package / Extension / UI docs |
| Outcome semantics | Detection Strategy + Pipeline + Data Flow |
| Operator-visible organization | UI Architecture |
| Sign-off readiness | Feeds `13_ARCHITECTURE_REVIEW` |

### 2.4 Verification boundaries

- Verification may observe Diagnostic Report / Presentation-ready View outcomes; it must not redefine Detection ownership.  
- Verification may use Storefront observation substitutes; it must not authorize Admin/backend as core Evidence.  
- Verification of optional bonus is separable and non-blocking for core acceptance.  
- Verification must not treat Open Unknowns as failures merely because they are Open.

---

## 3. Verification Model

Conceptual verification domains—not test suites.

### VD-001 — Requirements Verification

- **Purpose:** Confirm assignment obligations remain represented and not silently dropped.  
- **Verifies:** FR-001–FR-026 applicability; NFR-001–NFR-007; C-001–C-013; optional marking of FR-025; evaluation criteria awareness (EV-*) as emphasis, not features.  
- **Consumes:** Requirements Analysis; Traceability Matrix §3–§5.  
- **Must never verify:** Invented requirements not in the registry.  
- **Non-goals:** Not rewriting requirement text.  
- **Authority:** EP-001; EP-002; TR-001–TR-003.

### VD-002 — Responsibility Verification

- **Purpose:** Confirm System Architecture responsibilities retain correct ownership.  
- **Verifies:** R-001–R-010 owns/must-never-own sets; Presentation does not evaluate; Evidence does not conclude Detected; Configuration does not block core.  
- **Consumes:** `05_SYSTEM_ARCHITECTURE`; Package mapping.  
- **Must never verify:** Folder layout compliance as a substitute for ownership.  
- **Non-goals:** Not class-diagram audits.  
- **Authority:** System §4–§6; EP-017; EP-011.

### VD-003 — Pipeline Verification

- **Purpose:** Confirm Investigation lifecycle assumptions remain intact.  
- **Verifies:** Stages S-001–S-009 order principles; Completion may be Partial; Observation/Acquisition not skipped; Presentation requires Assembly.  
- **Consumes:** `06_INVESTIGATION_PIPELINE`.  
- **Must never verify:** Async/runtime schedulers.  
- **Non-goals:** Not workflow-engine certification.  
- **Authority:** Pipeline §4–§6; P-INV-*; ADR-001/ADR-005/ADR-006 intents.

### VD-004 — Evidence Verification

- **Purpose:** Confirm Evidence handling respects public authority and immutability.  
- **Verifies:** Evidence originates from public Storefront authority for core; Normalized Evidence not rewritten downstream; no configuration contamination of Evidence.  
- **Consumes:** Data Flow IO-004/IO-005 rules; Detection Evidence Model categories (conceptual).  
- **Must never verify:** Specific selectors or network capture tools as architectural truth.  
- **Non-goals:** Not proving every signal class is always populated (U-007).  
- **Authority:** EP-006; EP-007; DF-INV-001; DET-INV-002; C-003.

### VD-005 — Detection Verification

- **Purpose:** Confirm Detection Strategy outcome philosophy is honored.  
- **Verifies:** Multi-signal / no-single-selector sole-basis posture for FlexyPe Products; Not Detected under insufficient confidence; Disabled semantics for Part 3; Unknown-qualified handling for FR-019/FR-022; closed product set; FR-014 reference storefront expectations as empirical checks.  
- **Consumes:** `07_DETECTION_STRATEGY`; FR-010–FR-022; FR-014.  
- **Must never verify:** Confidence formulas or heuristic cookbooks as mandated architecture.  
- **Non-goals:** Not resolving U-001/U-002/U-003 by invention.  
- **Authority:** C-004; C-005; FR-013; EP-008; EP-009; ADR-003; ADR-004; ADR-006.

### VD-006 — Reporting Verification

- **Purpose:** Confirm Diagnostic Report assembly preserves upstream truths.  
- **Verifies:** Report contains Store Information + Detection Results; core Report forms without Product Configuration; Unknown Qualifications preserved; no Evidence recollection inside Reporting.  
- **Consumes:** Data Flow IO-009 rules; Reporting Package invariants.  
- **Must never verify:** UI layout completeness as Reporting’s job.  
- **Non-goals:** Not PDF export requirements.  
- **Authority:** FR-020; FR-026; PKG-INV-003; DF-INV-004; DF-INV-003.

### VD-007 — Presentation Verification

- **Purpose:** Confirm Operator-facing organization matches UI Architecture without mutating truths.  
- **Verifies:** Sections PS-001–PS-009 concerns are addressable; core-before-optional ordering; Not Detected visible; Unknowns visible; no evaluation leakage; read-only presentation.  
- **Consumes:** `11_UI_ARCHITECTURE`; Presentation-ready View expectations.  
- **Must never verify:** CSS/component aesthetics as architectural acceptance.  
- **Non-goals:** Not inventing U-008 empty states.  
- **Authority:** UI-INV-*; FR-020; EP-003; EP-011.

### VD-008 — Runtime Verification

- **Purpose:** Confirm Extension runtime roles preserve package ownership.  
- **Verifies:** RR-001–RR-008 hosting map; core runtime path browser-local; no Presentation→Detection ownership; Configuration Runtime optional; no Storefront mutation ownership.  
- **Consumes:** `10_EXTENSION_ARCHITECTURE`.  
- **Must never verify:** Manifest keys, permission strings, or message schemas as this document’s subject.  
- **Non-goals:** Not browser conformance matrices beyond Chrome Extension delivery (C-001).  
- **Authority:** EXT-INV-*; EP-005; PKG-INV-010.

### VD-009 — Traceability Verification

- **Purpose:** Confirm obligations remain linked to owners and that Unknowns remain tracked.  
- **Verifies:** Every FR/NFR/C/U/EP/ADR row still exists; Primary Owners intact; Open Unknowns not silently removed; optional bonus decision recorded without making bonus mandatory.  
- **Consumes:** `03_TRACEABILITY_MATRIX`; ADRs status.  
- **Must never verify:** Implementation ticket systems.  
- **Non-goals:** Not replacing Architecture Review sign-off.  
- **Authority:** TR-001–TR-014; EP-015; EP-003.

---

## 4. Verification Flow

Conceptual order of verification (not a CI stage list):

```
VD-001 Requirements Verification
    ↓
VD-002 Responsibility Verification
    ↓
VD-003 Pipeline Verification
    ↓
VD-004 Evidence Verification
    ↓
VD-005 Detection Verification
    ↓
VD-006 Reporting Verification
    ↓
VD-007 Presentation Verification
    ↓
VD-008 Runtime Verification
    ↓
VD-009 Traceability Verification
```

**Rationale:**

1. **Requirements-first** — prevent building/verifying the wrong system (EP-001).  
2. **Ownership before outcomes** — ensure evaluation/presentation boundaries exist before checking Detected/Not Detected displays.  
3. **Pipeline/Evidence before Detection** — respect Evidence-before-conclusion (EP-007).  
4. **Reporting before Presentation** — Presentation is a projection of the Report (UI-P-001).  
5. **Runtime after logical verification** — runtime hosting must not redefine already-checked ownership.  
6. **Traceability last as closure** — confirms nothing was lost across the chain; feeds Architecture Review.

Empirical FR-014 storefront checks attach primarily to **VD-005** and are reconfirmed at **VD-007** for Operator-visible product outcomes.

---

## 5. Verification Principles

| ID | Principle | Authority |
|---|---|---|
| VP-001 | **Requirements-first** — verification targets obligation IDs before tooling convenience | EP-001; EP-002 |
| VP-002 | **Architecture before implementation** — ownership/invariants verified independent of frameworks | EP-016; Master Plan gates |
| VP-003 | **Traceability completeness** — no FR/NFR/C/U disappears during verification planning | TR-001–TR-005; EP-015 |
| VP-004 | **Unknown preservation** — Open Unknowns are valid; inventing answers to “make tests pass” is invalid | EP-003; AP-002 |
| VP-005 | **Evidence immutability** — verification fails architectural intent if Normalized Evidence is rewritten to fit outcomes | DF-INV-001 |
| VP-006 | **Presentation neutrality** — verification fails if UI changes Detection meanings | UI-INV-001; DF-INV-002 |
| VP-007 | **Runtime ownership** — verification fails if Presentation Runtime hosts Detection | EXT-INV-001; PKG-INV-002 |
| VP-008 | **Core independent of optional** — core acceptance must be demonstrable without Configuration Runtime | FR-026; EP-011 |
| VP-009 | **Multi-signal posture** — verification rejects single-hardcoded-selector sole-basis product detection | C-004; C-005; EP-008 |
| VP-010 | **Read-only verification of storefronts** — verification must not require mutating merchant storefronts | EP-012 |
| VP-011 | **Reference-storefront empiricism** — FR-014 expectations are first-class detection acceptance checks | FR-014; Vision §6.1 |
| VP-012 | **Documentation verifiability** — setup + detection-approach explanation remain acceptance-relevant | FR-024; NFR-003; EV-006 |

---

## 6. Verification Invariants

| ID | Invariant | Authority |
|---|---|---|
| TV-INV-001 | No requirement loss: in-scope FR/NFR/C remain represented in Traceability and verification domains. | TR-001–TR-003; EP-001 |
| TV-INV-002 | No ownership inversion across Responsibility → Package → Runtime → Presentation maps. | PKG-INV-*; EXT-INV-*; UI-INV-007 |
| TV-INV-003 | No invented information accepted as passing detection/presentation verification. | EP-007; EP-004; DET-INV-001 |
| TV-INV-004 | No hidden Unknowns: Unknown Qualifications / Open U-* are not suppressed to force green verification. | EP-003; UI-INV-002; DF-INV-003 |
| TV-INV-005 | Core verification passes without optional Product Configuration. | FR-026; EP-011; DF-INV-004 |
| TV-INV-006 | Insufficient-confidence FlexyPe Product presence verifies as **Not Detected**, not as coerced Detected/Absent. | FR-013; EP-009; UI-INV-005 |
| TV-INV-007 | Browser-local core path remains free of required backend verification dependency. | NFR-001; NFR-002; EP-005; ADR-005 |
| TV-INV-008 | Verification activities remain non-invasive to Storefronts under test. | EP-012; VP-010 |
| TV-INV-009 | Closed FlexyPe product set remains Checkout, FlexyPass, FlexyCart in verification expectations. | C-011 |
| TV-INV-010 | FR-014 reference storefront expectations remain explicit detection verification targets. | FR-014 |

---

## 7. Verification Variation Points

| Variation | Extensibility |
|---|---|
| **Future requirements** | Add verification coverage via Requirements + Traceability updates first |
| **Future FlexyPe Products** | Expand VD-005/VD-007 only after C-011/requirements change |
| **Bonus verification** | Separate optional lane; never gates core VD domains |
| **Unknown evolution** | When Unknowns close legitimately, update Traceability §6 then adjust VD-005/VD-007 expectations—without rewriting history of prior Open state |
| **Accessibility / localization** | May add presentation verification facets; must not hide Not Detected/Unknowns |
| **Architecture evolution** | New packages/roles require Responsibility/Package/Runtime verification updates before implementation tests proliferate |
| **Manual vs automated derivation** | Implementation may choose either; architectural domains above remain the intent source |

---

## 8. Verification Risks

Structural risks only—no mitigations.

| ID | Risk |
|---|---|
| TV-RISK-001 | **Requirement drift** — tests validate convenience features not in FR registry |
| TV-RISK-002 | **Architecture drift** — implementation structure diverges from ownership maps while tests still “pass” at unit level |
| TV-RISK-003 | **Ownership leakage** — tests encode Presentation-side detection as acceptable |
| TV-RISK-004 | **Unknown suppression** — forcing Detected/Absent where Unknown/Not Detected is required |
| TV-RISK-005 | **Optional dependency** — core suite cannot run without bonus configuration |
| TV-RISK-006 | **Over-testing implementation** — coupling acceptance to frameworks/files instead of architectural outcomes |
| TV-RISK-007 | **Reference-storefront neglect** — ignoring FR-014 empirical expectations |
| TV-RISK-008 | **False performance gates** — inventing NFR-008 budgets despite U-010 |

---

## 9. Verification Glossary

| Term | Meaning |
|---|---|
| **Verification Domain (VD-***)** | Conceptual area of architectural verification |
| **Architecture verification** | Checking conformance to approved architecture and obligations—not framework usage |
| **Requirements-first verification** | Starting from FR/NFR/C IDs before designing concrete tests |
| **Ownership verification** | Confirming responsibilities/packages/runtimes/presentation boundaries are not inverted |
| **Outcome verification** | Confirming Detection Result / Store Information / Report / View semantics |
| **Empirical verification** | Checking FR-014 reference storefront expectations against live public storefronts |
| **Optional verification lane** | Non-blocking checks for FR-025 Product Configuration |
| **Traceability verification** | Confirming matrix completeness and Unknown visibility |
| **Read-only verification** | Observing storefronts without mutation |
| **Verification Flow** | Conceptual order of verification domains in §4 |
| **Derived tests** | Future unit/integration/e2e/manual checks implementation may create from these domains—out of scope to specify here |

Domain entities and architectural identifiers retain meanings from prior documents.

---

**End of Testing Strategy.**  
Next architecture document per Architecture Master Plan: `13_ARCHITECTURE_REVIEW` (depends on Testing Strategy and all ADRs).
