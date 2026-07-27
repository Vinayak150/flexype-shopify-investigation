# 01 — Requirements Analysis

**Status:** Draft — depends on approved `00_PROJECT_VISION`  
**Document type:** Requirements specification (not architecture, not design, not implementation)  
**Authoritative inputs:** Architecture Master Plan; `00_PROJECT_VISION.md`; Product Support Engineer Assignment (FlexyPe)

### Classification Legend

| Label | Meaning |
|---|---|
| **Assignment Requirement** | Explicitly stated by the assignment PDF |
| **Engineering Inference** | Justified conclusion not literally stated as a requirement |
| **Unknown** | Topic on which the assignment is silent; must not be silently filled |

---

## 1. Executive Summary

This document normalizes the Product Support Engineer Assignment into a structured engineering requirements specification that downstream architecture can consume without repeatedly consulting the assignment PDF.

It preserves assignment ambiguity where the assignment is silent (as `[Unknown]`), and labels non-literal conclusions as `[Engineering Inference]`. It does not resolve Unknowns, design the system, or authorize implementation.

**Relationship to Project Vision:** `00_PROJECT_VISION` freezes mission, scope, non-goals, users, success criteria, and vision-level boundaries. This document decomposes that approved scope into uniquely identified functional requirements, non-functional requirements, constraints, evaluation criteria, risks, assumptions, and Unknowns.

**Relationship to downstream architecture:** Later documents (`02_ENGINEERING_PRINCIPLES` onward, including `03_TRACEABILITY_MATRIX`) consume these IDs. Architecture may design against them; it may not invent requirements or silently close Unknowns.

---

## 2. Requirement Sources

### 2.1 Authoritative sources (precedence)

| Priority | Source | Role |
|---|---|---|
| 1 | Approved Architecture Master Plan | Governance, sequencing, classification rules |
| 2 | Approved `architecture/00_PROJECT_VISION.md` | Frozen scope, non-goals, users, success framing |
| 3 | Product Support Engineer Assignment PDF | Original functional and evaluation obligations |

No other source is authoritative for requirements.

### 2.2 Conflict resolution policy

1. If sources conflict on a factual assignment obligation, the Assignment PDF wins for the obligation text; Vision and Master Plan win for governance framing that does not invent obligations.
2. Vision non-goals and Master Plan classification rules constrain how requirements are interpreted; they do not add product features.
3. Silence in the Assignment is recorded as `[Unknown]` or, only when justified by Vision/Master Plan, as `[Engineering Inference]`—never as an implicit Assignment Requirement.
4. Optional assignment content remains optional; it is never promoted to mandatory core without an explicit later decision recorded outside this document’s inventing authority.

---

## 3. Functional Requirements

### 3.1 Store Information

#### FR-001 — Collect and display Store URL
- **Requirement:** Collect and display the storefront Store URL (assignment example form: `nike-demo.myshopify.com`).
- **Classification:** Assignment Requirement
- **Source:** Assignment Part 1; Vision §3.1
- **Dependencies:** FR-020 (popup presentation); C-002 (current open storefront)
- **Acceptance intent:** Operator can read Store URL for the analyzed storefront in the popup.

#### FR-002 — Collect and display Shop Name
- **Requirement:** Collect and display Shop Name (assignment example: Nike Demo).
- **Classification:** Assignment Requirement
- **Source:** Assignment Part 1; Vision §3.1
- **Dependencies:** FR-020; C-002
- **Acceptance intent:** Operator can read Shop Name in the popup.

#### FR-003 — Collect and display Base Currency
- **Requirement:** Collect and display Base Currency (assignment example: INR).
- **Classification:** Assignment Requirement
- **Source:** Assignment Part 1; Vision §3.1
- **Dependencies:** FR-020; C-002
- **Acceptance intent:** Operator can read Base Currency in the popup.

#### FR-004 — Collect and display Country
- **Requirement:** Collect and display Country (assignment example: India).
- **Classification:** Assignment Requirement
- **Source:** Assignment Part 1; Vision §3.1
- **Dependencies:** FR-020; C-002
- **Acceptance intent:** Operator can read Country in the popup.

#### FR-005 — Collect and display Locale
- **Requirement:** Collect and display Locale (assignment example: en-IN).
- **Classification:** Assignment Requirement
- **Source:** Assignment Part 1; Vision §3.1
- **Dependencies:** FR-020; C-002
- **Acceptance intent:** Operator can read Locale in the popup.

#### FR-006 — Collect and display Shopify Domain
- **Requirement:** Collect and display Shopify Domain (assignment example: `nike-demo.myshopify.com`).
- **Classification:** Assignment Requirement
- **Source:** Assignment Part 1; Vision §3.1
- **Dependencies:** FR-020; C-002
- **Acceptance intent:** Operator can read Shopify Domain in the popup.

#### FR-007 — Collect and display Theme Name when available
- **Requirement:** Collect and display Theme Name if available (assignment example: Dawn).
- **Classification:** Assignment Requirement
- **Source:** Assignment Part 1; Vision §3.1
- **Dependencies:** FR-020; C-002; FR-021
- **Acceptance intent:** When theme name is available from public storefront signals, it is shown; unavailability is allowed by assignment wording “if available”.

#### FR-008 — Collect and display Current Page
- **Requirement:** Collect and display Current Page as Home / Product / Collection / Cart (per assignment Part 1).
- **Classification:** Assignment Requirement
- **Source:** Assignment Part 1; Vision §3.1
- **Dependencies:** FR-020; C-002; U-004 (exhaustiveness Unknown)
- **Acceptance intent:** Operator can see which of the listed page categories applies to the open page, subject to U-004.

#### FR-009 — Use public storefront signals for store information
- **Requirement:** Store information may be obtained from public storefront signals such as `window.Shopify`.
- **Classification:** Assignment Requirement
- **Source:** Assignment Part 1; Vision §3.1
- **Dependencies:** C-003 (public storefront evidence); C-001
- **Acceptance intent:** Part 1 fields are populated from public storefront-accessible information; no Admin API is required for Part 1.

---

### 3.2 FlexyPe Product Detection

#### FR-010 — Detect FlexyPe Checkout
- **Requirement:** Determine whether FlexyPe Checkout is installed on the storefront.
- **Classification:** Assignment Requirement
- **Source:** Assignment Part 2; Objective Q1; Vision §3.1
- **Dependencies:** C-004; C-005; FR-013; FR-020; FR-014
- **Acceptance intent:** Popup reports Checkout status consistently with multi-signal rules and FR-013; reference expectation FR-014.

#### FR-011 — Detect FlexyPass
- **Requirement:** Determine whether FlexyPass is installed on the storefront.
- **Classification:** Assignment Requirement
- **Source:** Assignment Part 2; Objective Q1; Vision §3.1
- **Dependencies:** C-004; C-005; FR-013; FR-020; FR-014
- **Acceptance intent:** Popup reports FlexyPass status under the same rules as FR-010.

#### FR-012 — Detect FlexyCart
- **Requirement:** Determine whether FlexyCart is installed on the storefront.
- **Classification:** Assignment Requirement
- **Source:** Assignment Part 2; Objective Q1; Vision §3.1
- **Dependencies:** C-004; C-005; FR-013; FR-020; FR-014
- **Acceptance intent:** Popup reports FlexyCart status under the same rules as FR-010.

#### FR-013 — Display Not Detected when product presence is not confident
- **Requirement:** If the extension cannot confidently determine whether a FlexyPe product is installed, display **Not Detected**.
- **Classification:** Assignment Requirement
- **Source:** Assignment Part 2; Vision §3.1
- **Dependencies:** FR-010; FR-011; FR-012; FR-020; U-003 (scope of Not Detected beyond products)
- **Acceptance intent:** Insufficient-confidence product outcomes are shown as Not Detected rather than a forced installed/not-installed claim.

#### FR-014 — Honor assignment reference storefront expectations
- **Requirement:** Product-detection outcomes should be consistent with assignment examples: `https://www.aseemshakti.com/` has only FlexyPe Checkout live; `https://zouraofficial.com/` has all three products live.
- **Classification:** Assignment Requirement
- **Source:** Assignment Part 2 examples; Vision §3.1; Vision §6.1
- **Dependencies:** FR-010; FR-011; FR-012
- **Acceptance intent:** Empirical checks against the cited storefronts match the assignment’s stated product presence.

#### FR-015 — Consider listed public signal classes for product detection
- **Requirement:** Product detection shall consider multiple publicly available signal classes as listed by the assignment: loaded JavaScript assets, script URLs, DOM elements, HTML structure, global browser objects, network requests, and Shopify theme assets.
- **Classification:** Assignment Requirement
- **Source:** Assignment Part 2; Vision §3.1
- **Dependencies:** C-004; C-005; C-003
- **Acceptance intent:** Detection approach accounts for the listed signal classes rather than inventing privileged data sources.

---

### 3.3 Disabled Integration Detection

#### FR-016 — Detect disabled or commented FlexyPe integrations
- **Requirement:** Detect FlexyPe integrations that appear to exist but are currently disabled.
- **Classification:** Assignment Requirement
- **Source:** Assignment Part 3; Objective Q2; Vision §3.1
- **Dependencies:** FR-020; C-002; C-003
- **Acceptance intent:** Operator can see that disabled/commented FlexyPe integrations were found when such evidence exists on the storefront.

#### FR-017 — Recognize assignment example disabled-state forms
- **Requirement:** Detection shall account for assignment-listed examples: HTML comments, commented JavaScript, disabled snippets, and hidden FlexyPe containers.
- **Classification:** Assignment Requirement
- **Source:** Assignment Part 3; Vision §3.1
- **Dependencies:** FR-016
- **Acceptance intent:** The listed disabled-state forms are in scope for recognition; absence of other forms is not required to be invented.

#### FR-018 — Part 3 bonus: snippet or explanation when disabled
- **Requirement:** Where possible, display the detected snippet or explain why the integration is considered disabled.
- **Classification:** Assignment Requirement (assignment-labeled bonus within Part 3)
- **Source:** Assignment Part 3 Bonus; Vision §3.1
- **Dependencies:** FR-016; FR-020; U-005 (required depth)
- **Acceptance intent:** When feasible, operator sees supporting snippet or reason; exact depth remains U-005.

---

### 3.4 Third-party App Detection

#### FR-019 — Report which third-party Shopify apps are present
- **Requirement:** Answer which third-party Shopify apps are present on the storefront.
- **Classification:** Assignment Requirement
- **Source:** Assignment Objective Q3; Vision §3.1
- **Dependencies:** FR-020; C-002; C-003; U-002 (method/signals Unknown)
- **Acceptance intent:** Popup addresses third-party app presence as an objective diagnostic; method remains Unknown (U-002).

---

### 3.5 Theme Detection

#### FR-021 — Answer what Shopify theme the merchant is using
- **Requirement:** Answer what Shopify theme the merchant is using by presenting Theme Name when available (FR-007), treating Part 1 Theme Name and Objective Q4 as one diagnostic concern.
- **Classification:** Assignment Requirement (objective) / Engineering Inference (single concern with Part 1 Theme Name per Vision)
- **Source:** Assignment Objective Q4; Assignment Part 1 Theme Name; Vision §3.1
- **Dependencies:** FR-007; FR-020; C-002
- **Acceptance intent:** Operator can determine the theme via Theme Name when available; unavailability follows FR-007 “if available”.

---

### 3.6 Storefront Features

#### FR-022 — Report what storefront features are available
- **Requirement:** Answer what storefront features are available.
- **Classification:** Assignment Requirement
- **Source:** Assignment Objective Q5; Vision §3.1
- **Dependencies:** FR-020; C-002; U-001 (definition/enumeration Unknown)
- **Acceptance intent:** Popup addresses storefront features as an objective diagnostic; definition remains Unknown (U-001).

---

### 3.7 Popup Presentation

#### FR-020 — Present all required diagnostics in the extension popup
- **Requirement:** Display all relevant diagnostics for the current investigation directly inside the extension popup.
- **Classification:** Assignment Requirement
- **Source:** Assignment Overview/Objective; Vision §3.1; Vision §8.2
- **Dependencies:** C-001; C-002; FR-001–FR-019; FR-021; FR-022; FR-016–FR-018; optional FR-025
- **Acceptance intent:** Operator obtains required diagnostics from the popup without leaving the extension surface for core results.

#### FR-023 — Serve Sales and Support internal operators
- **Requirement:** The tool is an internal FlexyPe tool for Sales or Support engineers inspecting storefronts.
- **Classification:** Assignment Requirement
- **Source:** Assignment Overview; Vision §5
- **Dependencies:** None
- **Acceptance intent:** Intended users are FlexyPe Sales/Support, not merchants.

---

### 3.8 Submission Deliverables

#### FR-024 — Provide required submission artifacts
- **Requirement:** Submit a GitHub repository; README with setup instructions; brief explanation of detection approach; send to `hello@flexype.io` with subject “PSE Assignment”. Screenshots or a short demo video are optional.
- **Classification:** Assignment Requirement
- **Source:** Assignment Submission Requirements; Vision §3.5
- **Dependencies:** None (delivery obligation)
- **Acceptance intent:** Submission package matches assignment submission checklist.

---

### 3.9 Optional Bonus

#### FR-025 — Optional: view FlexyPe product configuration
- **Requirement:** As an optional enhancement, fetch and display backend-stored configuration for detected FlexyPe products (Checkout, FlexyPass, FlexyCart) in a readable format in the popup, assuming APIs exist.
- **Classification:** Assignment Requirement (optional)
- **Source:** Assignment Bonus Task; Vision §3.3
- **Dependencies:** FR-010–FR-012; FR-020; C-006 (bonus may use backend); U-006 (API nature)
- **Acceptance intent:** If pursued, operator can inspect readable configuration for detected products; if not pursued, core FR-001–FR-024 remain satisfiable.

#### FR-026 — Optional bonus must not block core diagnostics
- **Requirement:** Optional bonus configuration viewing must not become a dependency of Parts 1–3 / core diagnostics.
- **Classification:** Engineering Inference
- **Source:** Vision §3.3; Vision §7 value 6; Vision §8.1
- **Dependencies:** FR-025; C-006
- **Acceptance intent:** Core diagnostics complete without bonus APIs.

---

### 3.10 Functional requirement index (completeness)

| ID | Group |
|---|---|
| FR-001–FR-009 | Store Information |
| FR-010–FR-015 | FlexyPe Product Detection |
| FR-016–FR-018 | Disabled Integration Detection |
| FR-019 | Third-party App Detection |
| FR-021 | Theme Detection (objective) |
| FR-022 | Storefront Features |
| FR-020, FR-023 | Popup Presentation / Users |
| FR-024 | Submission Deliverables |
| FR-025–FR-026 | Optional Bonus |

---

## 4. Non-Functional Requirements

#### NFR-001 — Browser-local operation for core diagnostics
- **Statement:** Core diagnostics operate entirely in the browser.
- **Classification:** Assignment Requirement
- **Source:** Assignment runtime constraint; Vision §3.2; Vision §8.1
- **Notes:** Binding form also recorded as C-006/C-007 family in §5; NFR states the quality expectation for the core path.

#### NFR-002 — No backend dependency for core diagnostics
- **Statement:** Core diagnostics must not require backend services.
- **Classification:** Assignment Requirement
- **Source:** Assignment runtime constraint; Vision §3.2
- **Notes:** Optional bonus is the only assignment-allowed backend exception (C-008 / FR-025).

#### NFR-003 — Documentation quality
- **Statement:** Delivery includes README setup instructions and a brief explanation of the detection approach.
- **Classification:** Assignment Requirement
- **Source:** Assignment Submission; Vision §6.2; Evaluation Documentation 5%
- **Notes:** Overlaps FR-024 artifacts; NFR emphasizes documentation quality expectation.

#### NFR-004 — Engineering / code quality
- **Statement:** Solution is expected to demonstrate clean, maintainable, well-documented engineering suitable for evaluation under Code Quality (10%).
- **Classification:** Assignment Requirement (evaluation criterion) / Engineering Inference (quality bar)
- **Source:** Assignment Evaluation Criteria; Assignment “What We Are Looking For”
- **Notes:** Does not prescribe structure.

#### NFR-005 — Maintainability of detection reasoning
- **Statement:** Detection reasoning should remain maintainable as storefronts and signals vary.
- **Classification:** Engineering Inference
- **Source:** Vision §6.4 evaluation alignment; Assignment focus on useful internal tooling and clean code
- **Notes:** No package design herein.

#### NFR-006 — Investigation-oriented outcome quality
- **Statement:** Outcomes prioritize correct, evidence-aware investigation answers over platform breadth.
- **Classification:** Engineering Inference
- **Source:** Vision §1; Vision §6.2; Assignment focus statement
- **Notes:** Aligns with evaluation weight on Problem Solving & Investigation.

#### NFR-007 — Timebox awareness
- **Statement:** Assignment duration guidance is 6–8 hours; delivery effort should remain coherent with that guidance.
- **Classification:** Assignment Requirement (duration) / Engineering Inference (effort coherence)
- **Source:** Assignment Duration; Vision §7.1
- **Notes:** Binding schedule constraint also C-009.

#### NFR-008 — Performance
- **Statement:** No explicit performance latency, throughput, or resource budgets are stated by the assignment.
- **Classification:** Unknown
- **Source:** Assignment silence
- **Notes:** No performance NFR is invented.

---

## 5. Constraints

#### C-001 — Chrome Extension delivery
- **Constraint:** The deliverable is a Chrome Extension.
- **Classification:** Assignment Requirement
- **Source:** Assignment title/overview; Vision §1; Vision §3.1

#### C-002 — Currently opened Shopify storefront
- **Constraint:** Analysis targets the Shopify storefront currently open in the browser.
- **Classification:** Assignment Requirement
- **Source:** Assignment Objective; Vision §3.1; Vision §8.1

#### C-003 — Public storefront evidence for core path
- **Constraint:** Core diagnostics use publicly available storefront signals; authenticated Shopify Admin APIs are not required for the core path.
- **Classification:** Assignment Requirement (public signals) / Engineering Inference (Admin API not required)
- **Source:** Assignment Part 1–2 signal guidance; Vision §4; Vision §8.3

#### C-004 — Multi-signal detection required
- **Constraint:** FlexyPe product detection must use multiple publicly available signals.
- **Classification:** Assignment Requirement
- **Source:** Assignment Part 2; Vision §3.1

#### C-005 — No single hardcoded selector
- **Constraint:** Detection must not rely on a single hardcoded selector.
- **Classification:** Assignment Requirement
- **Source:** Assignment Part 2; Vision §3.1

#### C-006 — Entirely in-browser for core
- **Constraint:** The extension must work entirely in the browser for core operation.
- **Classification:** Assignment Requirement
- **Source:** Assignment runtime constraint; Vision §3.2

#### C-007 — No backend services for core
- **Constraint:** Core path must not require any backend services.
- **Classification:** Assignment Requirement
- **Source:** Assignment runtime constraint; Vision §3.2

#### C-008 — Backend allowed only for optional bonus
- **Constraint:** Backend services are permitted only for the optional bonus configuration task.
- **Classification:** Assignment Requirement
- **Source:** Assignment runtime exception; Vision §3.3

#### C-009 — Duration guidance 6–8 hours
- **Constraint:** Assignment duration guidance is 6–8 hours.
- **Classification:** Assignment Requirement
- **Source:** Assignment Duration; Vision §7.1

#### C-010 — Not a full-stack application
- **Constraint:** The assignment focus is investigation and internal tooling, not developing a full-stack application.
- **Classification:** Assignment Requirement
- **Source:** Assignment “What We Are Looking For”; Vision §4

#### C-011 — FlexyPe product set closed
- **Constraint:** FlexyPe products in scope are Checkout, FlexyPass, and FlexyCart only.
- **Classification:** Assignment Requirement (listed set) / Engineering Inference (no expansion)
- **Source:** Assignment Part 2; Vision §4; Vision §8.4

#### C-012 — Submission channel and subject
- **Constraint:** Submission is sent to `hello@flexype.io` with subject “PSE Assignment”.
- **Classification:** Assignment Requirement
- **Source:** Assignment Submission Requirements; Vision §3.5

#### C-013 — Internal tool only
- **Constraint:** The extension is an internal Sales/Support tool, not a merchant-facing product.
- **Classification:** Assignment Requirement
- **Source:** Assignment Overview; Vision §1; Vision §5

---

## 6. Assignment Evaluation Criteria

These criteria score the submission. They are not additional functional features.

| ID | Category | Weight | Classification | Source | Influence on architecture (non-design) |
|---|---|---|---|---|---|
| EV-001 | Problem Solving & Investigation | 30% | Assignment Requirement | Assignment Evaluation | Architecture must favor investigability of storefronts and clear diagnostic reasoning over unrelated capability. |
| EV-002 | Shopify Knowledge | 25% | Assignment Requirement | Assignment Evaluation | Architecture must respect Shopify storefront realities and public storefront signal literacy. |
| EV-003 | JavaScript & Browser APIs | 15% | Assignment Requirement | Assignment Evaluation | Architecture must remain feasible within browser/extension capabilities implied by a Chrome Extension. |
| EV-004 | DOM Inspection & Detection Logic | 15% | Assignment Requirement | Assignment Evaluation | Architecture must accommodate multi-signal DOM/HTML/script inspection obligations (C-004, C-005, FR-015). |
| EV-005 | Code Quality | 10% | Assignment Requirement | Assignment Evaluation | Architecture should enable maintainable structure without prescribing packages here. |
| EV-006 | Documentation | 5% | Assignment Requirement | Assignment Evaluation | Architecture and delivery must support clear setup and detection-approach documentation (FR-024, NFR-003). |

**[Engineering Inference]** Per Vision §6.4, delivery emphasis should prioritize investigation quality, Shopify storefront literacy, and maintainable detection reasoning over feature expansion.

---

## 7. Risks

Mitigations are out of scope for this document.

### 7.1 Technical risks

| ID | Risk | Classification | Source basis |
|---|---|---|---|
| R-T01 | Public signal shapes (e.g. `window.Shopify`) vary across storefronts | Engineering Inference | Assignment cites `window.Shopify` as example; Vision Unknowns/edges |
| R-T02 | Network-request signals may be incomplete depending on when observation occurs | Unknown + Engineering Inference | Assignment lists network requests; timing unspecified |
| R-T03 | Extension permission or CSP limits may block some signal classes | Unknown | Assignment silence; Vision §8.3 |
| R-T04 | Client-side navigation without reload may desynchronize diagnostics | Unknown | Assignment silence; Vision §8.3 |

### 7.2 Project risks

| ID | Risk | Classification | Source basis |
|---|---|---|---|
| R-P01 | Scope exceeds 6–8 hour guidance | Engineering Inference | C-009; Vision §7.1 |
| R-P02 | Over-building toward full-stack contradicts assignment focus | Engineering Inference | C-010; Vision §4 |

### 7.3 Requirement risks

| ID | Risk | Classification | Source basis |
|---|---|---|---|
| R-R01 | Objective requirements without numbered Parts (third-party apps, storefront features) remain underspecified | Unknown | U-001; U-002; Vision §3.4 |
| R-R02 | Optional bonus API contracts unspecified | Unknown | U-006 |

### 7.4 Detection risks

| ID | Risk | Classification | Source basis |
|---|---|---|---|
| R-D01 | False positives/negatives on FlexyPe product detection | Engineering Inference | Part 2 criticality; reference storefronts FR-014 |
| R-D02 | Disabled-state evidence is inherently ambiguous | Engineering Inference | Part 3 examples; comments/hidden containers |
| R-D03 | Brittle single-selector approaches fail assignment rules | Assignment Requirement (forbidden) / Engineering Inference (residual fragility even with multi-signal) | C-005; C-004 |

### 7.5 Scope risks

| ID | Risk | Classification | Source basis |
|---|---|---|---|
| R-S01 | Optional bonus pulled into core path | Engineering Inference | FR-026; Vision §3.3 |
| R-S02 | Invented diagnostics beyond Parts 1–3 and Objectives | Engineering Inference | Vision §4 non-goals |
| R-S03 | Treating Admin APIs as required for core | Engineering Inference | Vision §4; C-003 |

---

## 8. Assumptions

Only assumptions justified by Project Vision or Assignment.

| ID | Assumption | Justification | Classification |
|---|---|---|---|
| A-001 | The operator has a Shopify storefront page open when using the tool for its primary purpose | Assignment Objective; Vision §5 | Assignment Requirement |
| A-002 | Public storefront signals sufficient for Part 1 examples are obtainable in typical Shopify storefronts | Assignment Part 1 cites `window.Shopify`; Vision FR path | Engineering Inference |
| A-003 | Reference storefronts cited by the assignment remain valid empirical checks for product presence claims in FR-014 | Assignment Part 2 examples; Vision §6.1 | Assignment Requirement (as stated examples) |
| A-004 | Optional bonus APIs may be assumed to exist if the bonus is pursued | Assignment Bonus Task explicit assumption | Assignment Requirement (optional path) |
| A-005 | Core diagnostics can be completed without the optional bonus | Assignment marks bonus optional; Vision §3.3 | Assignment Requirement / Engineering Inference |
| A-006 | Primary operators are FlexyPe Sales and Support, not merchants | Assignment Overview; Vision §5 | Assignment Requirement |

No assumption closes an `[Unknown]`.

---

## 9. Unknowns

| ID | Unknown | Why Unknown | Expected downstream address (ownership, not resolution) |
|---|---|---|---|
| U-001 | Exact definition and enumeration of “storefront features” | Assignment Objective asks the question; no list or definition given | `04_DOMAIN_MODEL`; `07_DETECTION_STRATEGY`; `03_TRACEABILITY_MATRIX` (gap flag) |
| U-002 | Method and signals for detecting third-party Shopify apps | Objective required; no Part specifies signals | `04_DOMAIN_MODEL`; `07_DETECTION_STRATEGY` |
| U-003 | Whether “Not Detected” applies beyond FlexyPe product presence | Assignment states Not Detected for product confidence only | `04_DOMAIN_MODEL`; `07_DETECTION_STRATEGY`; `11_UI_ARCHITECTURE` |
| U-004 | Whether Current Page values are exhaustive or examples | Part 1 lists Home/Product/Collection/Cart without stating exhaustiveness | `04_DOMAIN_MODEL` |
| U-005 | Required depth of Part 3 bonus explanation vs detection alone | Assignment says “if possible” / bonus | `07_DETECTION_STRATEGY`; `11_UI_ARCHITECTURE` |
| U-006 | Nature of optional bonus APIs (real / mock / omitted) | Bonus assumes APIs; contracts unspecified | Delivery increment decision; `05_SYSTEM_ARCHITECTURE` (seam only); not core |
| U-007 | Extension permission / CSP limits affecting signals | Not stated | `10_EXTENSION_ARCHITECTURE` |
| U-008 | Dedicated empty/error state for non-Shopify pages | Not stated | `11_UI_ARCHITECTURE`; `04_DOMAIN_MODEL` |
| U-009 | Correctness across SPA navigations without reload | Not stated | `06_INVESTIGATION_PIPELINE`; `10_EXTENSION_ARCHITECTURE` |
| U-010 | Explicit performance budgets | Not stated | Remain Unknown unless assignment amended; see NFR-008 |

---

## 10. Requirement Traceability Preparation

Maps requirement IDs to intended future architecture ownership. This is not design.

| Requirement / Constraint / NFR / Unknown | Intended owning architecture document(s) |
|---|---|
| FR-001–FR-009 (Store Information) | `04_DOMAIN_MODEL`; `06_INVESTIGATION_PIPELINE`; `08_DATA_FLOW`; `11_UI_ARCHITECTURE` |
| FR-010–FR-015 (Product Detection) | `04_DOMAIN_MODEL`; `07_DETECTION_STRATEGY`; `06_INVESTIGATION_PIPELINE`; `12_TESTING_STRATEGY` |
| FR-016–FR-018 (Disabled Integrations) | `04_DOMAIN_MODEL`; `07_DETECTION_STRATEGY`; `11_UI_ARCHITECTURE` |
| FR-019 (Third-party Apps) | `04_DOMAIN_MODEL`; `07_DETECTION_STRATEGY` (must preserve U-002) |
| FR-021 (Theme objective) | `04_DOMAIN_MODEL`; `11_UI_ARCHITECTURE` |
| FR-022 (Storefront Features) | `04_DOMAIN_MODEL`; `07_DETECTION_STRATEGY` (must preserve U-001) |
| FR-020, FR-023 (Popup / Users) | `11_UI_ARCHITECTURE`; `10_EXTENSION_ARCHITECTURE` |
| FR-024 (Submission) | Delivery / documentation (outside runtime architecture); referenced by `12_TESTING_STRATEGY` docs expectations |
| FR-025–FR-026 (Optional Bonus) | `05_SYSTEM_ARCHITECTURE` (detachable seam); `11_UI_ARCHITECTURE` (optional view) |
| NFR-001–NFR-002, C-006–C-008 | `05_SYSTEM_ARCHITECTURE`; `10_EXTENSION_ARCHITECTURE` |
| NFR-003–NFR-006, EV-001–EV-006 | `02_ENGINEERING_PRINCIPLES`; `12_TESTING_STRATEGY`; `09_PACKAGE_ARCHITECTURE` (maintainability boundaries later) |
| NFR-007, C-009 | `02_ENGINEERING_PRINCIPLES`; `13_ARCHITECTURE_REVIEW` |
| C-001–C-005, C-010–C-013 | `02_ENGINEERING_PRINCIPLES`; `05_SYSTEM_ARCHITECTURE`; `07_DETECTION_STRATEGY` (C-004/C-005) |
| U-001–U-010 | As listed in §9; `03_TRACEABILITY_MATRIX` records residual gaps |
| Full FR/NFR/C set | `03_TRACEABILITY_MATRIX` (coverage matrix) |
| Architecture completeness sign-off | `13_ARCHITECTURE_REVIEW` |

---

## 11. Glossary

| Term | Meaning |
|---|---|
| **FlexyPe** | Organization for which the internal diagnostics tool is built |
| **Shopify storefront** | Merchant storefront page open in the browser that the extension analyzes |
| **Chrome Extension** | Required delivery form of the tool |
| **Extension popup** | Surface where diagnostics must be displayed |
| **Sales / Support engineer** | Primary internal operators of the tool |
| **Store information** | Part 1 fields: Store URL, Shop Name, Base Currency, Country, Locale, Shopify Domain, Theme Name, Current Page |
| **FlexyPe Checkout** | FlexyPe product required to be detected |
| **FlexyPass** | FlexyPe product required to be detected |
| **FlexyCart** | FlexyPe product required to be detected |
| **Multi-signal detection** | Use of multiple public signal classes rather than a single hardcoded selector |
| **Not Detected** | Required display outcome when FlexyPe product installation cannot be determined confidently |
| **Disabled / commented integration** | FlexyPe integration that appears to exist but is not currently active (e.g. comments, disabled snippets, hidden containers) |
| **Third-party Shopify app** | Non-FlexyPe application present on the storefront (detection method Unknown — U-002) |
| **Storefront features** | Features available on the storefront (definition Unknown — U-001) |
| **Theme / Theme Name** | Shopify theme in use; Part 1 field when available |
| **Core path** | Browser-local diagnostics for Parts 1–3 and Objective questions without backend |
| **Optional bonus** | Optional fetch/display of backend product configuration for detected FlexyPe products |
| **Internal tool** | Tool intended for FlexyPe Sales/Support, not merchants |
| **Reference storefronts** | Assignment examples: aseemshakti.com (Checkout only); zouraofficial.com (all three products) |
| **Public storefront signal** | Information observable from the open storefront without backend/Admin requirement for core path |

---

**End of Requirements Analysis.**  
Next planning document per Architecture Master Plan: `02_ENGINEERING_PRINCIPLES` (depends on Requirements Analysis).
