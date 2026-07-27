# 07 — Detection Strategy

**Status:** Draft — depends on approved `06_INVESTIGATION_PIPELINE`, `05_SYSTEM_ARCHITECTURE`, `04_DOMAIN_MODEL`  
**Document type:** Architectural philosophy of evidence-based detection (not algorithms, selectors, heuristics, confidence formulas, or Chrome APIs)  
**Authoritative inputs:** Architecture Master Plan; `00_PROJECT_VISION`–`06_INVESTIGATION_PIPELINE`; Product Support Engineer Assignment (FlexyPe)

Domain entities, System responsibilities (`R-*`), and Pipeline stages (`S-*`) are reused and not redefined.

---

## 1. Purpose

This document defines **how the architecture reasons about Evidence** when producing Detection Results and Store Information conclusions. It is the philosophical contract for Domain Evaluation (R-006) and Detection Coordination (R-005) during Pipeline stages S-005 and S-006.

**Relationship to Domain Model:** Uses Evidence, Evidence Signal Class, Detection Result, FlexyPe Product, Disabled Integration, Third-party App, Storefront Feature, Theme, Domain Unknown, and related entities without redefinition.

**Relationship to System Architecture:** Specializes R-005/R-006 behavior at the reasoning level; does not alter responsibility boundaries or allow Presentation (R-009) to evaluate Evidence.

**Relationship to Investigation Pipeline:** Applies during Evaluation Preparation and Domain Evaluation; respects Evidence Acquisition → Consolidation preceding evaluation (S-003 → S-004 → S-005 → S-006).

**Relationship to Testing Strategy:** Tests must validate outcomes against this philosophy (multi-signal, Not Detected under insufficient confidence, Unknown preservation, reference storefront expectations FR-014)—not against ad-hoc selector lists invented outside architecture.

**Relationship to ADRs:** Aligns with ADR-003 (definition-driven detection intent), ADR-004 (explainable results intent), ADR-006 (partial/uncertain outcomes intent), ADR-002 (investigation-consistent Evidence intent). This document does not replace those ADRs.

No implementation, selectors, scoring formulas, or Chrome APIs appear here.

---

## 2. Detection Scope

### 2.1 What detection includes

Architectural production of **Detection Results** and **Store Information** conclusions from **public Storefront Evidence** for one Investigation, covering:

| Obligation area | Requirement anchors |
|---|---|
| Store Information fields | FR-001–FR-009 |
| FlexyPe Product presence (Checkout, FlexyPass, FlexyCart) | FR-010–FR-015; FR-013; C-004; C-005 |
| Disabled / commented FlexyPe integrations | FR-016–FR-018 |
| Theme (via Theme Name when available) | FR-007; FR-021 |
| Third-party Shopify apps present | FR-019 (method Unknown — U-002) |
| Storefront features available | FR-022 (definition Unknown — U-001) |

### 2.2 What detection excludes

| Excluded | Why |
|---|---|
| Concrete selectors, URL patterns, DOM queries | Implementation / ephemeral hardcoding risk (AP-004) |
| Numeric confidence scores or thresholds | Not stated by assignment; would invent machinery |
| Heuristic cookbooks | Would become pseudo-implementation |
| Shopify Admin / privileged APIs as core evidence | C-003; EP-006 |
| Backend Product Configuration as core detection input | FR-026; EP-011; C-008 |
| UI copy and popup layout | UI Architecture |
| Chrome API usage | Extension Architecture |
| Storefront mutation | EP-012 |

### 2.3 Core detection obligations

Multi-signal, public-evidence evaluation of FlexyPe Products with **Not Detected** under insufficient confidence; disabled-integration recognition per assignment example forms; Store Information / Theme availability rules; Objective questions for third-party apps and storefront features **kept in scope** even where method/definition remain Open.

### 2.4 Optional detection-adjacent work

Part 3 explanation/snippet intent (FR-018) when possible (depth U-005 Open). Product Configuration (FR-025) is **not** detection; it must not feed core presence conclusions.

### 2.5 Unknown detection areas

| Unknown | Scope effect |
|---|---|
| **U-001** | Storefront Feature enumeration/definition Open |
| **U-002** | Third-party App evidence method/signals Open |
| **U-003** | Whether Not Detected applies beyond FlexyPe Products Open |
| **U-004** | Current Page kind exhaustiveness Open |
| **U-005** | Explanation depth for disabled integrations Open |
| **U-007** | Permission/CSP may limit obtainable Evidence |
| **U-009** | SPA navigation refresh semantics Open |

---

## 3. Detection Principles

| ID | Principle | Statement | Authority |
|---|---|---|---|
| DP-001 | Evidence before conclusion | Claims about presence/disabledness require supporting Evidence; conclusions do not precede Evidence. | EP-007; FR-015; Pipeline P-INV-002 |
| DP-002 | No invented facts | Evidence must not be fabricated to force a Detected/Disabled outcome. | EP-007; Domain INV-003; EP-004 |
| DP-003 | Public storefront authority | Core detection Evidence comes from the open Storefront’s publicly available signals. | EP-006; C-003; FR-009 |
| DP-004 | Multi-signal validation | FlexyPe Product detection must use multiple publicly available signals and must not rely on a single hardcoded selector. | EP-008; C-004; C-005; ADR-003; FR-015 |
| DP-005 | Definition-driven targets | What is detected (products, integration disabled forms, Part 1 fields) is defined by assignment/domain catalogs—not ad-hoc expansion. | C-011; ADR-003; EP-001 |
| DP-006 | Explainable conclusions | Where a conclusion asserts Detected/Disabled, it should be attributable to Evidence; Part 3 bonus asks for snippet/reason when possible. | EP-010; ADR-004; FR-018 |
| DP-007 | Unknown preservation | Open Unknowns qualify or withhold catalog/method certainty; they are not silently closed by detection. | EP-003; U-001–U-003; Domain INV-006 |
| DP-008 | Confidence restraint | Insufficient confidence for FlexyPe Product installation yields **Not Detected**, not a forced binary. | EP-009; FR-013; ADR-006 |
| DP-009 | Progressive completeness | Partial Evidence or unavailable Theme does not invalidate the entire detection posture. | EP-018; FR-007; ADR-006 |
| DP-010 | Bonus isolation | Optional Product Configuration never participates as required Evidence for core Detection Results. | EP-011; FR-026; C-008 |
| DP-011 | Non-invasiveness | Detection observes; it does not change the Storefront. | EP-012 |
| DP-012 | Agenda fidelity | Evaluation agenda retains obligated questions (including FR-019/FR-022) even when methods/definitions are Unknown. | Pipeline S-005; EP-001; EP-003 |

---

## 4. Evidence Model

Reuse Domain Model **Evidence** (D-012) and **Evidence Signal Class** (D-013). Categories below are the assignment-listed classes for FlexyPe Product detection, described architecturally—not as selectors.

### 4.1 Evidence Signal Classes (product detection)

| Class | Purpose | Characteristics | Appropriate usage | Limitations |
|---|---|---|---|---|
| **Loaded JavaScript assets** | Indicate scripts present in the Storefront context | Observable as loaded asset identity/presence conceptually | Corroborate product/integration presence questions | May be incomplete; names alone are not sole authority (DP-004) |
| **Script URLs** | Indicate script origins/paths observable publicly | URL-shaped public references | Multi-signal corroboration | Brittle if used alone; must not become single hardcoded selector basis |
| **DOM elements** | Indicate structural presence in the page | Elemental structure observables | Support presence/disabled-container questions | Single-element dependence forbidden as sole basis for product detection |
| **HTML structure** | Indicate markup organization including comment regions | Structural/markup observables | Support Part 3 comment/disabled forms | Comments may be ambiguous (detection risk, not resolved here) |
| **Global browser objects** | Indicate publicly exposed globals (assignment cites examples such as `window.Shopify` for store info) | Runtime-global observables as public signals | Store Information and corroboration | Shape/availability may vary; not Admin truth |
| **Network requests** | Indicate publicly observable request activity related to storefront behavior | Request-shaped observables | Corroboration when available | Timing/completeness Unspecified (U-007 related; R-T02); may be absent |
| **Shopify theme assets** | Indicate theme-associated public assets | Theme-linked observables | Theme-related and corroborative use | Theme Name still “if available” (FR-007) |

### 4.2 Evidence for Store Information

Store Information may use public storefront signals such as those illustrated by `window.Shopify` (FR-009). Architecturally this is **public-global / storefront-context Evidence**, not a privileged API channel.

### 4.3 Evidence for Disabled Integrations

Assignment example forms (FR-017)—HTML comments, commented JavaScript, disabled snippets, hidden FlexyPe containers—are **observable disabled-state Evidence kinds**. They support Disabled outcomes; they do not authorize storefront mutation to “confirm” disablement.

### 4.4 Evidence for Unknown-method obligations

For **Third-party App** (U-002) and **Storefront Feature** (U-001), no Evidence Signal Class catalog is defined here. Detection Strategy requires the obligations remain on the agenda; it does not invent classes.

### 4.5 Cross-cutting Evidence characteristics

- Evidence is **investigation-scoped** and should be treated as consistent for one Investigation (ADR-002 intent).  
- Evidence is **non-authoritative when absent**—absence may justify Not Detected / Unknown / Unavailable, not fabricated Detected.  
- Evidence is **never modified** to fit a preferred conclusion (normalization must not alter meaning — R-004).

---

## 5. Detection Reasoning

Conceptual reasoning rules only—no algorithms, scores, or heuristics.

1. **Evidence supports conclusions.** A Detected or Disabled claim should be grounded in one or more pieces of Evidence appropriate to the question.  
2. **Evidence may contradict.** When observables conflict, architecture must not hide conflict behind false certainty; prefer restraint (Not Detected / Unknown) over forced resolution without basis.  
3. **Evidence may be incomplete.** Partial Evidence still permits progressive completeness (DP-009); it does not license invention (DP-002).  
4. **Evidence may be absent.** Absence for a FlexyPe Product presence question leads to **Not Detected** when confidence is insufficient (DP-008)—not to silent omission of the product from the report.  
5. **Multiple Evidence categories reinforce confidence.** Multi-signal validation means corroboration across classes is the architectural standard for FlexyPe Product presence (DP-004). A single class alone is architecturally insufficient as the *sole* basis.  
6. **Unknowns qualify conclusions.** Where U-001/U-002 (and related) apply, conclusions may be Unknown-qualified even if some Evidence exists.  
7. **Store Information fields are observational conclusions**, subject to availability (Theme Name if available), not product-presence Detected semantics unless later justified without inventing assignment text (U-003 Open for Not Detected breadth).  
8. **Optional configuration is out of band.** Product Configuration must not be used as Evidence for core Detection Results (DP-010).  
9. **Reference storefront expectations (FR-014)** are empirical acceptance targets for product-presence outcomes; they do not introduce new Evidence classes.

---

## 6. Detection Outcomes

Conceptual outcome semantics for Detection Results / related fields (aligned with Domain §6; not implementation logic):

| Outcome | Architecturally appropriate when |
|---|---|
| **Detected** | Affirmative conclusion for the assessed question is supportable by Evidence under multi-signal rules where those rules apply (FlexyPe Products). |
| **Not Detected** | FlexyPe Product installation cannot be determined confidently (FR-013). Required restraint outcome—not a pipeline failure. Breadth beyond products remains U-003. |
| **Disabled** | Integration appears to exist but is disabled/commented/hidden per Part 3 Evidence kinds (FR-016–FR-017). |
| **Unknown** | Conclusion cannot be honestly formed because a Domain Unknown blocks definition/method, or Evidence cannot be interpreted without invention. |
| **Available** | A value exists for an availability-sensitive field (e.g., Theme Name present). |
| **Unavailable** | An availability-sensitive field cannot be obtained (“if available”) without treating that as total detection failure. |
| **Not Applicable** | Question does not apply to context—use only with caution; non-Shopify handling remains U-008 Open. |
| **Absent / Not Present** | Confident negative presence—**not** assignment-mandated for FlexyPe Products; do not substitute this for Not Detected where FR-013 applies. |

Part 3 explanation/snippet intent attaches to Disabled (or related) conclusions when possible (FR-018); absence of explanation does not alone invalidate Disabled if Evidence supports it (U-005).

---

## 7. Explainability

Architectural explainability (not UI wording):

1. **Attributability:** Detected/Disabled conclusions should be attributable to Evidence (and Evidence Signal Class categories where applicable).  
2. **Explicit Unknowns:** Unknown outcomes must remain labeled as Unknown, not relabeled as Not Detected or Detected to “simplify.”  
3. **No hidden assumptions:** Assumptions about APIs, feature lists, or app signals must not silently drive conclusions (EP-004; Requirements §8).  
4. **Part 3 bonus:** When possible, disabled conclusions carry snippet or reason intent (FR-018; EP-010; ADR-004)—depth Open (U-005).  
5. **No confidence numbers:** Explainability is qualitative attribution to Evidence, not a scorecard.  
6. **Presentation neutrality:** Presentation Preparation (R-009) may surface attributions later; Detection Strategy does not prescribe copy or layout.

---

## 8. Detection Invariants

| ID | Invariant | Authority |
|---|---|---|
| DET-INV-001 | No Detected/Disabled conclusion without supporting Evidence. | EP-007; Domain INV-004; DP-001 |
| DET-INV-002 | Evidence meaning is not altered to fit a preferred outcome. | R-004; Domain INV-003; DP-002 |
| DET-INV-003 | Domain Unknowns remain explicit through detection outcomes. | EP-003; Domain INV-006; DP-007 |
| DET-INV-004 | FlexyPe Product detection upholds multi-signal validation and forbids single-hardcoded-selector sole basis. | C-004; C-005; EP-008; ADR-003; DP-004 |
| DET-INV-005 | Insufficient-confidence FlexyPe Product presence yields Not Detected. | FR-013; EP-009; DET outcome semantics |
| DET-INV-006 | FlexyPe Product set remains Checkout, FlexyPass, FlexyCart only. | C-011; Domain INV-007; DP-005 |
| DET-INV-007 | Product Configuration is never required Evidence for core Detection Results. | FR-026; EP-011; DP-010 |
| DET-INV-008 | Core detection Evidence remains public-storefront-sourced. | C-003; EP-006; DP-003 |
| DET-INV-009 | FR-019 and FR-022 remain evaluation obligations despite Open methods/definitions. | DP-012; Pipeline S-005; EP-001 |
| DET-INV-010 | Detection does not mutate the Storefront. | EP-012; DP-011 |

---

## 9. Detection Variation Points

| Variation | How architecture adapts without rewriting philosophy |
|---|---|
| **Future Evidence categories** | May be added only if justified by assignment/approved requirements change; multi-signal and public-authority rules still apply |
| **New FlexyPe Products** | Require requirements/Vision amendment (C-011); not silently detected |
| **Theme evolution** | Theme remains availability-sensitive (FR-007); signal classes may observe theme assets without changing outcome semantics |
| **Third-party methods (U-002)** | Methods may be introduced later only with authority; until then outcomes may be Unknown-qualified |
| **Storefront features (U-001)** | Catalog may be introduced only with authority; until then Unknown-qualified |
| **Optional configuration** | Remains outside core Evidence model |
| **Permission/CSP limits (U-007)** | Reduce obtainable Evidence; increase Not Detected/Unknown likelihood; do not authorize privileged fallbacks |
| **Definition updates for products/integrations** | Handled as definition-driven change (ADR-003) under maintainability (EP-019), not ad-hoc selectors |

---

## 10. Detection Risks

Structural risks only—no mitigations.

| ID | Risk |
|---|---|
| DET-RISK-001 | **False certainty** — emitting Detected despite insufficient Evidence |
| DET-RISK-002 | **Weak Evidence overreach** — treating a single thin observable as decisive |
| DET-RISK-003 | **Selector dependence** — collapsing multi-signal philosophy into one hardcoded selector |
| DET-RISK-004 | **Unknown suppression** — dropping FR-019/FR-022 or relabeling Unknown as Not Detected/Detected |
| DET-RISK-005 | **Evidence coupling to UI** — Presentation inventing conclusions |
| DET-RISK-006 | **Bonus contamination** — using configuration APIs as core presence Evidence |
| DET-RISK-007 | **Comment/disabled ambiguity** — over-reading HTML comments as definitive without restraint |
| DET-RISK-008 | **Network-signal gaps** — assuming network Evidence always exists post-load |

---

## 11. Detection Glossary

| Term | Meaning |
|---|---|
| **Detection Strategy** | Architectural philosophy for reasoning from Evidence to Detection Results |
| **Detection Principle (DP-***)** | Normative reasoning rule in this document |
| **Evidence sufficiency** | Conceptual adequacy of Evidence to support a conclusion under multi-signal and restraint rules—not a numeric score |
| **Multi-signal validation** | Requirement to corroborate FlexyPe Product presence across multiple public Evidence Signal Classes |
| **Confidence restraint** | Obligation to emit Not Detected rather than forced binaries when product presence is not confidently determinable |
| **Attributability** | Ability to relate a Detected/Disabled conclusion to supporting Evidence |
| **Evaluation agenda** | Pipeline concept: questions Detection Coordination schedules for Domain Evaluation |
| **Unknown-qualified conclusion** | Detection Result influenced by an Open Domain Unknown |
| **Core detection** | Detection that must not depend on Product Configuration or backend |
| **Definition-driven detection** | Targeting products/forms from explicit assignment/domain definitions rather than ad-hoc expansion |
| **Public storefront Evidence** | Evidence obtained from the open Storefront without Admin/backend authority for core |

Domain terms (Evidence, Evidence Signal Class, Detection Result, Not Detected, Disabled Integration, etc.) retain `04_DOMAIN_MODEL` definitions.

---

**End of Detection Strategy.**  
Next architecture document per Architecture Master Plan: `08_DATA_FLOW` (depends on Detection Strategy).
