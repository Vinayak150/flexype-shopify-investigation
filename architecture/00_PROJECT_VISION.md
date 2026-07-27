# 00 — Project Vision

**Status:** Draft for Gate 1 — Vision Freeze  
**Authoritative inputs:** Architecture Master Plan; Product Support Engineer Assignment (FlexyPe)

### Classification Legend

| Label | Meaning |
|---|---|
| **Assignment Requirement** | Explicitly stated by the assignment PDF |
| **Engineering Inference** | Justified conclusion not literally stated as a requirement |
| **Unknown** | Topic on which the assignment is silent; must not be silently filled |

This document freezes the problem boundary for the Shopify Store Diagnostics Chrome Extension. It does not design the system, prescribe runtime structure, or authorize implementation.

---

## 1. Mission

**[Assignment Requirement]** Enable FlexyPe Sales and Support engineers to instantly understand a Shopify store’s current setup before merchant onboarding, replacing largely manual inspection that today depends on browser developer tools.

**[Assignment Requirement]** The assignment requires delivery as a Chrome Extension that analyzes the currently opened Shopify storefront and presents all relevant diagnostics in the extension popup, functioning as an internal FlexyPe tool—not a merchant-facing product or a full-stack application.

**[Engineering Inference]** Success is measured by the quality of investigation outcomes (correct, evidence-backed answers to the assignment’s diagnostic questions), not by platform breadth or backend capability.

---

## 2. Problem Statement

**[Assignment Requirement]** FlexyPe Sales and Support teams regularly inspect Shopify stores before onboarding merchants. That work includes identifying existing FlexyPe products, checking for previous integrations, understanding the merchant’s theme, detecting third-party applications, and identifying issues that may affect integration.

**[Assignment Requirement]** Today this process is largely manual and depends on browser developer tools. Manual inspection is slow to repeat, operator-dependent, and difficult to standardize across engineers and storefronts.

**[Engineering Inference]** Without a dedicated investigation surface, conclusions about product presence, disabled integrations, and store configuration remain brittle and hard to explain, which undermines pre-onboarding confidence.

---

## 3. Project Scope

Scope is limited to what the assignment explicitly requires. Items that appear only in Objectives (without a numbered Part) remain in scope but may carry `[Unknown]` detection semantics until later documents resolve them without inventing requirements.

### 3.1 Core Scope

**[Assignment Requirement]** A Chrome Extension that analyzes the **currently opened** Shopify storefront and displays diagnostics in the **extension popup**.

**[Assignment Requirement]** Answer the following objective questions:

1. Which FlexyPe products are installed?
2. Were any FlexyPe integrations disabled or commented out?
3. Which third-party Shopify apps are present?
4. What Shopify theme is the merchant using?
5. What storefront features are available?

**[Assignment Requirement] Part 1 — Store Information**  
Collect and display:

| Field | Notes |
|---|---|
| Store URL | Example form given in assignment |
| Shop Name | |
| Base Currency | |
| Country | |
| Locale | |
| Shopify Domain | |
| Theme Name | If available |
| Current Page | Home / Product / Collection / Cart |

**[Assignment Requirement]** Part 1 may use public storefront signals such as `window.Shopify`.

**[Assignment Requirement] Part 2 — Detect FlexyPe Products**  
Detect presence of:

- FlexyPe Checkout  
- FlexyPass  
- FlexyCart  

**[Assignment Requirement]** Detection must use multiple publicly available signals, including (as listed by the assignment): loaded JavaScript assets, script URLs, DOM elements, HTML structure, global browser objects, network requests, and Shopify theme assets.

**[Assignment Requirement]** Detection must not rely on a single hardcoded selector.

**[Assignment Requirement]** If the extension cannot confidently determine whether a product is installed, display **Not Detected**.

**[Assignment Requirement]** Assignment reference storefronts for product-detection expectations:

- `https://www.aseemshakti.com/` — FlexyPe Checkout only  
- `https://zouraofficial.com/` — all three products  

**[Assignment Requirement] Part 3 — Detect Disabled or Commented FlexyPe Integrations**  
Detect FlexyPe integrations that appear to exist but are currently disabled, including examples listed by the assignment: HTML comments, commented JavaScript, disabled snippets, and hidden FlexyPe containers.

**[Assignment Requirement]** Part 3 bonus (assignment-labeled bonus): where possible, display the detected snippet or explain why the integration is considered disabled.

### 3.2 Runtime Constraints

**[Assignment Requirement]** The extension must work entirely in the browser.

**[Assignment Requirement]** Core diagnostics must not require backend services.

### 3.3 Optional Bonus

**[Assignment Requirement]** Optional enhancement: fetch and display backend-stored configuration for detected FlexyPe products (Checkout, FlexyPass, FlexyCart), assuming APIs exist; present configuration in the popup in a readable format.

**[Engineering Inference]** The optional bonus is a detachable concern. It must not become a dependency of Parts 1–3. Inclusion in a given delivery increment is an explicit later decision, not implied by core scope.

### 3.4 Unknown Scope Items

These remain **in scope as assignment objectives** but are underspecified:

| Topic | Classification |
|---|---|
| Exact definition / enumeration of “storefront features” | `[Unknown]` |
| Method and signals for detecting “third-party Shopify apps” | `[Unknown]` |
| Whether “Not Detected” applies beyond FlexyPe product presence | `[Unknown]` |
| Whether Current Page values are exhaustive or examples | `[Unknown]` |
| Required depth of Part 3 explanation vs. detection alone | `[Unknown]` |
| Nature of optional bonus APIs (real / mock / omitted) | `[Unknown]` |

Later architecture documents must preserve these as Unknown until resolved without inventing assignment text.

### 3.5 Delivery Artifacts

**[Assignment Requirement]** Submission includes a GitHub repository, a README with setup instructions, and a brief explanation of the detection approach. Screenshots or a short demo video are optional. Delivery is directed to `hello@flexype.io` with subject “PSE Assignment”.

---

## 4. Explicit Non-Goals

The following are out of scope for this project’s vision boundary.

**[Assignment Requirement]** Not a full-stack application.

**[Assignment Requirement]** No backend services for core diagnostics (Parts 1–3 and Objective questions answered from the open storefront).

**[Engineering Inference]** Merchant-facing product experiences (install flows, merchant dashboards, self-serve remediation).

**[Engineering Inference]** Automated remediation or modification of merchant storefronts (the tool diagnoses; it does not change the store).

**[Engineering Inference]** Expanding the FlexyPe product set beyond Checkout, FlexyPass, and FlexyCart.

**[Engineering Inference]** Multi-browser productization beyond the assigned Chrome Extension deliverable.

**[Engineering Inference]** Treating authenticated Shopify Admin APIs as required for the core path.

**[Engineering Inference]** Inventing diagnostics not demanded by Parts 1–3 or the Objective questions.

---

## 5. Primary Users

**[Assignment Requirement]** FlexyPe **Sales** engineers / team members who inspect storefronts before onboarding.

**[Assignment Requirement]** FlexyPe **Support** engineers / team members who inspect storefronts as part of pre-onboarding and related diagnostic work.

**[Assignment Requirement]** The operator uses the tool on a Shopify storefront that is currently open in the browser.

**[Engineering Inference]** The operator is a FlexyPe internal user, not the merchant end customer.

**[Unknown]** Whether non-Shopify pages require a dedicated empty or error state is not stated by the assignment.

---

## 6. Success Criteria

Success means the delivered extension satisfies the assignment’s diagnostic obligations under its stated constraints.

### 6.1 Functional success

**[Assignment Requirement]** On a Shopify storefront, the popup presents Part 1 store information fields listed in §3.1.

**[Assignment Requirement]** The extension reports FlexyPe Checkout, FlexyPass, and FlexyCart using multi-signal detection, and shows **Not Detected** when confidence is insufficient.

**[Assignment Requirement]** Product detection behavior is consistent with the assignment’s reference storefront examples (aseemshakti.com; zouraofficial.com) as empirical checks.

**[Assignment Requirement]** The extension detects disabled or commented FlexyPe integrations per Part 3 examples.

**[Assignment Requirement]** Objective diagnostics for third-party Shopify apps, theme, and storefront features are addressed within scope, subject to `[Unknown]` detection semantics where the assignment is silent.

**[Assignment Requirement]** Core path operates entirely in the browser without required backend services.

### 6.2 Architectural quality success

**[Assignment Requirement]** Documentation includes setup instructions and a brief explanation of the detection approach.

**[Engineering Inference]** Architectural success means investigation outcomes are evidence-backed, uncertainty is representable where confidence is insufficient, and core diagnostics remain browser-local without backend dependency.

### 6.3 Non-success (explicit)

**[Engineering Inference]** A solution that requires a backend for core diagnostics fails the assignment runtime constraint.

**[Engineering Inference]** A solution that relies on a single hardcoded selector for FlexyPe product detection fails Part 2.

**[Engineering Inference]** A full-stack product that exceeds the investigation-tool focus fails the assignment’s stated intent.

### 6.4 Assignment Evaluation Alignment

The following weights are assignment evaluation criteria. They are not architectural success criteria; they align delivery emphasis with how the assignment is scored.

**[Assignment Requirement]** Evaluation emphasizes Problem Solving & Investigation (30%), Shopify Knowledge (25%), JavaScript & Browser APIs (15%), DOM Inspection & Detection Logic (15%), Code Quality (10%), and Documentation (5%).

**[Engineering Inference]** Architecture and delivery should prioritize investigation quality, Shopify storefront literacy, and maintainable detection reasoning over feature expansion.

---

## 7. Engineering Values

These values bind vision-level intent. Detailed normative rules belong in later principles documents.

1. **Assignment fidelity** — `[Engineering Inference]` Every in-scope capability must trace to an assignment requirement; gaps stay labeled Unknown or Inference, never silent invention.

2. **Investigation over productization** — `[Assignment Requirement]` / `[Engineering Inference]` The assignment focuses on investigation, debugging, Shopify ecosystem knowledge, and useful internal tooling; vision privileges that over platform building.

3. **Evidence before conclusion** — `[Assignment Requirement]` / `[Engineering Inference]` Multi-signal detection and “Not Detected” require that claims about product presence be supportable by public storefront evidence, with uncertainty representable.

4. **Browser-local authority for core** — `[Assignment Requirement]` The open storefront is the authority for core diagnostics; backend is optional-bonus-only.

5. **Explainability where demanded** — `[Assignment Requirement]` Part 3 bonus asks for snippet or reason when an integration is considered disabled; vision treats attributable findings as valued for support use.

6. **Detachable optional bonus** — `[Engineering Inference]` Backend configuration viewing must not couple to or block core diagnostics.

### 7.1 Project Constraints

**[Assignment Requirement]** Duration guidance is 6–8 hours.

**[Engineering Inference]** Prefer decisions that reduce rework and scope creep over expansive design.

---

## 8. Architecture Boundaries

This section states **vision-level boundaries**, not system design.

### 8.1 Trust and runtime boundary

**[Assignment Requirement]** Core diagnostics execute in the browser against the currently opened Shopify storefront.

**[Assignment Requirement]** Core path must not require backend services.

**[Engineering Inference]** Optional bonus configuration fetch, if pursued, sits outside the core boundary and must remain non-blocking to Parts 1–3.

### 8.2 Operator surface boundary

**[Assignment Requirement]** All required diagnostics are presented in the extension popup.

**[Engineering Inference]** The popup is the sole primary operator surface for assignment diagnostics; additional surfaces are non-goals unless later explicitly required (they are not).

### 8.3 Evidence boundary

**[Assignment Requirement]** Detection uses publicly available storefront signals of the classes listed in Part 2 (and Part 1’s public signals such as `window.Shopify`).

**[Engineering Inference]** Core path does not assume privileged merchant-admin access.

**[Unknown]** Extension permission limits and CSP interactions that may block certain signals are not specified by the assignment.

**[Unknown]** Whether diagnostics must remain correct across client-side navigations without reload is not specified.

### 8.4 Product boundary

**[Assignment Requirement]** FlexyPe products in scope are Checkout, FlexyPass, and FlexyCart only.

**[Engineering Inference]** Internal organization of the solution is intentionally deferred to downstream architecture documents; this vision does not define packages, APIs, or manifests.

### 8.5 Governance boundary

**[Engineering Inference]** Implementation is not authorized by this document. Downstream planning and architecture documents (per the Architecture Master Plan) must freeze design before code.

---

## 9. Assignment Traceability Summary

| Assignment item | Vision coverage | Classification |
|---|---|---|
| Internal Chrome Extension for Sales/Support | §1 Mission; §5 Primary Users | Assignment Requirement |
| Diagnostics in extension popup | §3.1; §8.2 | Assignment Requirement |
| Currently open Shopify storefront | §3.1; §8.1 | Assignment Requirement |
| Replace manual DevTools inspection | §2 Problem Statement | Assignment Requirement |
| Objective Q1 — FlexyPe products installed | §3.1 Part 2; §6.1 | Assignment Requirement |
| Objective Q2 — disabled/commented integrations | §3.1 Part 3; §6.1 | Assignment Requirement |
| Objective Q3 — third-party Shopify apps | §3.1 Objectives; §3.4 Unknown method | Assignment Requirement + Unknown |
| Objective Q4 — Shopify theme | §3.1 Part 1 Theme Name + Objectives | Assignment Requirement |
| Objective Q5 — storefront features | §3.1 Objectives; §3.4 Unknown definition | Assignment Requirement + Unknown |
| Part 1 store fields | §3.1 table | Assignment Requirement |
| Part 2 multi-signal detection; no single selector | §3.1; §6.1; §7 | Assignment Requirement |
| Part 2 “Not Detected” | §3.1; §6.1 | Assignment Requirement |
| Part 3 disabled integration examples | §3.1 | Assignment Requirement |
| Part 3 bonus snippet/explanation | §3.1; §7 | Assignment Requirement (bonus) |
| Browser-only; no backend for core | §3.2; §4; §8.1 | Assignment Requirement |
| Optional backend product configuration | §3.3; §4 Non-Goals (core) | Assignment Requirement (optional) |
| Not a full-stack application | §4; §6.3 | Assignment Requirement |
| Evaluation criteria / investigation focus | §6.4; §7 | Assignment Requirement / Inference |
| Submission artifacts | §3.5 | Assignment Requirement |
| Reference storefronts | §3.1; §6.1 | Assignment Requirement |
| Duration 6–8 hours | §7.1 Project Constraints | Assignment Requirement |

Residual Unknowns that this vision deliberately does not close are listed in §3.4 and §8.

---

## 10. Glossary

| Term | Meaning | Classification |
|---|---|---|
| **FlexyPe** | Organization for which the internal diagnostics tool is built | Assignment Requirement |
| **Shopify storefront** | Merchant storefront page open in the browser that the extension analyzes | Assignment Requirement |
| **Chrome Extension** | Required delivery form of the tool | Assignment Requirement |
| **Extension popup** | Surface where diagnostics must be displayed | Assignment Requirement |
| **Sales / Support engineer** | Primary internal operators of the tool | Assignment Requirement |
| **Store information** | Part 1 identity and context fields (URL, shop name, currency, country, locale, domain, theme, current page) | Assignment Requirement |
| **FlexyPe Checkout / FlexyPass / FlexyCart** | The only FlexyPe products the assignment requires detecting | Assignment Requirement |
| **Multi-signal detection** | Use of multiple public signal classes rather than a single hardcoded selector | Assignment Requirement |
| **Not Detected** | Required display outcome when product installation cannot be determined confidently | Assignment Requirement |
| **Disabled / commented integration** | FlexyPe integration that appears to exist but is not currently active (comments, disabled snippets, hidden containers, etc.) | Assignment Requirement |
| **Third-party Shopify app** | Non-FlexyPe application present on the storefront (detection method `[Unknown]`) | Assignment Requirement + Unknown |
| **Storefront features** | Features available on the storefront (definition/enumeration `[Unknown]`) | Assignment Requirement + Unknown |
| **Theme** | Shopify theme in use; Theme Name in Part 1 when available | Assignment Requirement |
| **Core path** | Browser-local diagnostics for Parts 1–3 and Objective questions without backend | Engineering Inference (label for assignment constraint) |
| **Optional bonus** | Optional fetch/display of backend product configuration | Assignment Requirement |
| **Internal tool** | Tool intended for FlexyPe Sales/Support, not merchants | Assignment Requirement |

---

**End of Project Vision.**  
Next planning document per Architecture Master Plan: `01_REQUIREMENTS_ANALYSIS` (depends on Vision acceptance).
