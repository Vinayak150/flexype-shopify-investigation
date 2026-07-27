# 02 — Engineering Principles

**Status:** Draft — depends on approved `00_PROJECT_VISION` and `01_REQUIREMENTS_ANALYSIS`  
**Document type:** Architectural constitution (immutable principles; not requirements, not design, not implementation)  
**Authoritative inputs:** Architecture Master Plan; `00_PROJECT_VISION.md`; `01_REQUIREMENTS_ANALYSIS.md`; Product Support Engineer Assignment (FlexyPe)

### Classification Legend

| Label | Meaning |
|---|---|
| **Assignment Requirement** | Explicitly stated by the assignment PDF |
| **Engineering Inference** | Justified conclusion not literally stated as a requirement |
| **Unknown** | Topic on which the assignment is silent; must not be silently filled |

---

## 1. Purpose

Engineering principles exist to convert assignment constraints, Vision boundaries, and Requirements Analysis into durable rules that bind every later architecture document, ADR, and implementation decision.

They prevent re-litigation of foundational judgments (browser-local core, multi-signal detection, Unknown preservation, optional-bonus isolation) each time a new document is written.

**Relationship to Project Vision:** Vision freezes mission, scope, non-goals, users, and vision-level boundaries. Principles operationalize Vision values (assignment fidelity, evidence before conclusion, browser-local authority, detachable bonus, explainability where demanded) as normative pass/fail rules.

**Relationship to Requirements Analysis:** Requirements define *what* must be satisfied (`FR-*`, `NFR-*`, `C-*`, `U-*`). Principles define *how decisions must be made* when satisfying those IDs. Principles do not duplicate requirement text.

**Relationship to future architecture:** Domain Model, System Architecture, Detection Strategy, Extension/UI architecture, Testing Strategy, and ADRs must cite principles rather than redefine engineering philosophy. Where a design choice conflicts with a principle, the principle wins unless this constitution is formally amended (§8).

**Relationship to implementation:** Implementation may choose technologies and structures only within principle bounds. Principles are technology-independent and remain valid if implementation changes.

This document does not specify packages, APIs, manifests, detection algorithms, UI layouts, or runtime topology.

---

## 2. Principle Hierarchy

### 2.1 Precedence

```
Assignment Requirements (FR / NFR / C as recorded in Requirements Analysis)
    ↓
Engineering Principles (this document)
    ↓
Architecture Decision Records (ADRs)
    ↓
Architecture Documents (Domain → System → … → Architecture Review)
    ↓
Implementation
    ↓
Testing
```

### 2.2 Conflict resolution

1. **Assignment obligations win on substance.** An engineering principle may not waive an Assignment Requirement recorded in `01_REQUIREMENTS_ANALYSIS`.
2. **Principles win over ADRs and architecture docs on method.** ADRs and architecture documents refine *how* to obey principles; they may not contradict them without amendment of this constitution.
3. **ADRs win over ordinary architecture prose for the decision they record**, provided the ADR itself complies with principles and assignment obligations.
4. **Implementation and tests lose to all of the above.** Convenience, library defaults, or test expedience cannot override principles or requirements.
5. **Engineering Inferences never outrank Assignment Requirements.** Inferences justify principles and designs; they do not create silent requirements.
6. **Unknowns are not resolved by hierarchy.** Precedence does not authorize inventing answers to `U-*` items.

---

## 3. Engineering Principles

### EP-001 — Assignment Fidelity

- **Title:** Assignment Fidelity  
- **Statement:** Every in-scope capability must trace to an Assignment Requirement (or explicitly optional assignment item). Gaps remain labeled Unknown or Engineering Inference; they are never silently promoted to requirements.  
- **Rationale:** Vision requires assignment fidelity; Requirements Analysis exists to normalize—not expand—the assignment.  
- **Authority:** Vision §7 value 1; Requirements §2 conflict policy; Master Plan classification rules.  
- **Implications:** Downstream documents must cite `FR`/`NFR`/`C` IDs; new capabilities require assignment or Vision amendment, not local invention.  
- **Non-Goals:** Does not list requirements (see Requirements Analysis).

### EP-002 — Single Source of Truth for Obligations

- **Title:** Single Source of Truth for Obligations  
- **Statement:** Normalized requirement IDs in `01_REQUIREMENTS_ANALYSIS` are the working source of truth for *what* must be built; the Assignment PDF remains the origin of those obligations; Vision remains the source of truth for scope boundaries and non-goals.  
- **Rationale:** Prevents architecture documents from re-deriving conflicting obligation sets from the PDF.  
- **Authority:** Master Plan source precedence; Requirements §1–§2; Vision scope freeze.  
- **Implications:** Architecture cites requirement IDs; conflicts trigger Requirements/Vision update, not ad-hoc doc edits.  
- **Non-Goals:** Does not make this principles document a requirements registry.

### EP-003 — Explicit Unknown Preservation

- **Title:** Explicit Unknown Preservation  
- **Statement:** Topics marked `[Unknown]` / `U-*` must remain explicitly Unknown until resolved by legitimate authority without inventing assignment text. Architecture may describe seams and options; it may not fabricate assignment answers.  
- **Rationale:** Assignment is silent on storefront-feature enumeration, third-party detection method, Not Detected breadth, and related items (Requirements §9).  
- **Authority:** Master Plan Unknowns policy; Vision §3.4; Requirements §9.  
- **Implications:** Detection Strategy, Domain Model, and UI docs must carry Unknown labels forward; Traceability Matrix flags residual gaps.  
- **Non-Goals:** Does not resolve any Unknown.

### EP-004 — No Silent Assumptions

- **Title:** No Silent Assumptions  
- **Statement:** Assumptions must be written, justified by Assignment or Vision, and classified. Unstated assumptions are prohibited.  
- **Rationale:** Classification discipline in Vision and Requirements; Assumptions section exists specifically to prevent hidden premises.  
- **Authority:** Vision Classification Legend; Requirements §8; Master Plan inference rules.  
- **Implications:** New assumptions require an explicit record; ADRs must surface premises.  
- **Non-Goals:** Does not enumerate all assumptions (see Requirements §8).

### EP-005 — Browser-First Core

- **Title:** Browser-First Core  
- **Statement:** Core diagnostics must operate entirely in the browser and must not require backend services.  
- **Rationale:** Assignment runtime constraint; Vision runtime boundary; NFR-001/NFR-002; C-006/C-007.  
- **Authority:** Assignment; Vision §3.2, §8.1; Requirements NFR-001, NFR-002, C-006, C-007.  
- **Implications:** System and Extension architecture must keep core investigation browser-local; backend-first designs for core are unconstitutional.  
- **Non-Goals:** Does not forbid the assignment’s optional bonus backend exception (see EP-011).

### EP-006 — Public Storefront Authority

- **Title:** Public Storefront Authority  
- **Statement:** For the core path, the currently opened Shopify storefront’s publicly available signals are the authority for evidence. Authenticated Admin APIs are not required for core diagnostics.  
- **Rationale:** Part 1–2 public signals; Vision evidence boundary; C-002, C-003.  
- **Authority:** Assignment Part 1–2; Vision §8.3; Requirements C-002, C-003, FR-009, FR-015.  
- **Implications:** Designs that mandate privileged merchant-admin access for core violate this principle.  
- **Non-Goals:** Does not define which concrete signals win in conflicts (Detection Strategy later); does not close U-007/U-009.

### EP-007 — Evidence-Based Detection

- **Title:** Evidence-Based Detection  
- **Statement:** Claims about FlexyPe product presence and disabled integrations must be supportable by observable public storefront evidence. Forced binary claims without adequate evidence are prohibited.  
- **Rationale:** Multi-signal obligations and Not Detected; Vision “evidence before conclusion.”  
- **Authority:** Assignment Part 2–3; Vision §7 value 3; Requirements FR-013, FR-015, FR-016.  
- **Implications:** Architecture must allow evidence-backed conclusions and insufficient-evidence outcomes.  
- **Non-Goals:** Does not specify fusion algorithms or selectors.

### EP-008 — Multi-Signal Validation

- **Title:** Multi-Signal Validation  
- **Statement:** FlexyPe product detection must use multiple publicly available signals and must not rely on a single hardcoded selector.  
- **Rationale:** Explicit Part 2 rules; Constraints C-004, C-005.  
- **Authority:** Assignment Part 2; Vision §3.1; Requirements C-004, C-005, FR-015.  
- **Implications:** Detection Strategy and implementation are invalid if they reduce to one brittle selector.  
- **Non-Goals:** Does not rank signal classes or define confidence thresholds.

### EP-009 — Representable Uncertainty

- **Title:** Representable Uncertainty  
- **Statement:** Insufficient confidence for FlexyPe product installation must surface as **Not Detected** (or an equivalent operator-visible uncertain outcome that preserves that assignment meaning). Uncertainty is a first-class result, not an error to hide.  
- **Rationale:** Assignment Part 2 Not Detected; Vision success criteria; progressive degradation of partial availability (theme “if available”).  
- **Authority:** Assignment Part 2; Vision §6.1–§6.2; Requirements FR-013; U-003 remains open for breadth beyond products.  
- **Implications:** Domain and UI models must represent uncertain product outcomes; architecture must not coerce unknowns into false certainty.  
- **Non-Goals:** Does not decide U-003 (whether Not Detected applies beyond products).

### EP-010 — Explainability Where Demanded

- **Title:** Explainability Where Demanded  
- **Statement:** Where the assignment asks for snippet or reason that a FlexyPe integration is considered disabled, findings should be attributable to observable evidence when possible.  
- **Rationale:** Part 3 bonus; Vision explainability value.  
- **Authority:** Assignment Part 3 Bonus; Vision §7 value 5; Requirements FR-018; U-005 (depth Unknown).  
- **Implications:** Downstream docs must allow evidence attribution for disabled-state findings without prescribing UI chrome.  
- **Non-Goals:** Does not fix explanation depth (U-005); does not require explainability for every diagnostic field beyond assignment demand.

### EP-011 — Optional Bonus Isolation

- **Title:** Optional Bonus Isolation  
- **Statement:** Backend product-configuration viewing is optional and must not become a dependency of core diagnostics (Parts 1–3 and Objective questions on the core path).  
- **Rationale:** Assignment marks bonus optional and allows backend only for that exception; Vision detachable bonus.  
- **Authority:** Assignment Bonus + runtime exception; Vision §3.3, §7 value 6, §8.1; Requirements FR-025, FR-026, C-008.  
- **Implications:** System Architecture must keep bonus as a non-blocking seam; core acceptance cannot require bonus APIs.  
- **Non-Goals:** Does not decide whether bonus is included in a delivery increment (U-006).

### EP-012 — Non-Invasive Diagnostics

- **Title:** Non-Invasive Diagnostics  
- **Statement:** The tool diagnoses storefront setup; it does not remediate or modify the merchant storefront as part of its purpose.  
- **Rationale:** Vision explicit non-goal: diagnose, do not change the store; assignment is an investigation instrument.  
- **Authority:** Vision §4; Master Plan rejected strategies (automated remediation); Requirements risk R-S02 framing.  
- **Implications:** Architecture and implementation must not include store-mutating remediation flows as in-scope behavior.  
- **Non-Goals:** Does not restrict ordinary browser/extension read-only observation needed for diagnostics.

### EP-013 — Investigation Over Productization

- **Title:** Investigation Over Productization  
- **Statement:** Design and delivery prioritize investigation quality, Shopify storefront literacy, and useful internal tooling over platform breadth, merchant product surfaces, or full-stack expansion.  
- **Rationale:** Assignment focus and evaluation weights; Vision mission and evaluation alignment.  
- **Authority:** Assignment “What We Are Looking For”; Vision §1, §6.4, §7 value 2; Requirements EV-001–EV-002, C-010, C-013.  
- **Implications:** Prefer architectures that improve diagnostic correctness and clarity; reject merchant-facing productization and full-stack scope.  
- **Non-Goals:** Does not set numeric performance budgets (NFR-008 / U-010).

### EP-014 — Scope Restraint

- **Title:** Scope Restraint  
- **Statement:** Prefer decisions that reduce rework and scope creep over expansive design; do not expand the FlexyPe product set or invent diagnostics beyond Parts 1–3 and Objectives.  
- **Rationale:** Duration guidance 6–8 hours; Vision project constraints and non-goals; closed product set.  
- **Authority:** Vision §7.1; Vision §4; Requirements C-009, C-011; Master Plan evaluation-aligned depth.  
- **Implications:** Architecture Review should reject gold-plating and product-set expansion.  
- **Non-Goals:** Does not impose a schedule management process.

### EP-015 — Traceability

- **Title:** Traceability  
- **Statement:** Architectural commitments and implementation-relevant decisions must remain traceable to requirement IDs and, through them, to the assignment.  
- **Rationale:** Traceability Matrix and Requirements §10 exist to prevent untraceable features.  
- **Authority:** Master Plan roadmap (`03_TRACEABILITY_MATRIX`); Vision §9; Requirements §10.  
- **Implications:** Architecture docs and ADRs should name affected `FR`/`NFR`/`C`/`U` IDs where claims are made.  
- **Non-Goals:** Does not replace the Traceability Matrix document.

### EP-016 — Architecture Before Code

- **Title:** Architecture Before Code  
- **Statement:** Implementation is not authorized until governing architecture documents and review gates required by the Architecture Master Plan are satisfied.  
- **Rationale:** Vision governance boundary; Master Plan Gates 0–7 and readiness checklist.  
- **Authority:** Vision §8.5; Architecture Master Plan §§6–7.  
- **Implications:** Code work before Gate authorization is out of constitutional process.  
- **Non-Goals:** Does not define code standards or CI.

### EP-017 — Separation of Concerns (Conceptual)

- **Title:** Separation of Concerns (Conceptual)  
- **Statement:** Evidence gathering, detection reasoning, and operator presentation are distinct concerns and must not be conflated in architectural reasoning—even though concrete packaging is deferred.  
- **Rationale:** Master Plan architecture strategy calls for conceptual separation without premature packaging; Vision defers internal organization details downstream.  
- **Authority:** Master Plan §3 Architecture Strategy item 4; Vision §8.4 (organization deferred, not denied).  
- **Implications:** Later Package/Extension/UI documents should respect concern boundaries; this principle does not prescribe folders or modules.  
- **Non-Goals:** Does not define package architecture, APIs, or manifests.

### EP-018 — Progressive Completeness

- **Title:** Progressive Completeness  
- **Statement:** Partial results are valid when the assignment allows incompleteness (e.g., Theme Name “if available”; product Not Detected; optional Part 3 explanation “if possible”). Architecture must not treat every partial outcome as total failure.  
- **Rationale:** Assignment wording on availability and confidence; Vision architectural quality success; Requirements FR-007, FR-013, FR-018.  
- **Authority:** Assignment Part 1–3; Vision §6.2; Requirements cited FRs; related risk language in Requirements §7.  
- **Implications:** Pipeline and UI architectures must allow partial diagnostic sets without inventing failure policy beyond assignment.  
- **Non-Goals:** Does not define retry, caching, or SPA refresh behavior (U-009 remains Unknown).

### EP-019 — Maintainability of Detection Reasoning

- **Title:** Maintainability of Detection Reasoning  
- **Statement:** Detection reasoning must remain maintainable as storefronts and signals vary; ephemeral hardcoding that cannot evolve without rewrite violates constitution.  
- **Rationale:** NFR-005; Code Quality evaluation; multi-signal constraint implies evolvable reasoning.  
- **Authority:** Requirements NFR-004, NFR-005; EV-005; Vision §6.4.  
- **Implications:** Architecture should enable change of detection definitions without abandoning multi-signal and fidelity principles.  
- **Non-Goals:** Does not specify definition formats or package layout (not Detection Strategy).

### EP-020 — Simplicity Under Assignment Focus

- **Title:** Simplicity Under Assignment Focus  
- **Statement:** Among designs that satisfy assignment obligations and these principles, prefer the simpler investigation instrument over generalized platforms.  
- **Rationale:** Assignment rejects full-stack focus; Vision investigation-over-productization; timebox restraint.  
- **Authority:** Assignment focus statement; Vision §7 value 2; Requirements C-010; EP-013; EP-014.  
- **Implications:** When multiple valid designs exist, choose the one with less incidental complexity that still meets FR/C/NFR.  
- **Non-Goals:** Does not forbid necessary structure for multi-signal evidence and popup diagnostics.

---

## 4. Principle Interactions

### 4.1 Supporting clusters

| Cluster | Principles | Mutual support |
|---|---|---|
| Fidelity & governance | EP-001, EP-002, EP-003, EP-004, EP-015, EP-016 | Keep obligations honest, traceable, and pre-code. |
| Core runtime & evidence | EP-005, EP-006, EP-007, EP-008, EP-009 | Browser-local public evidence with multi-signal, uncertain outcomes. |
| Operator trust | EP-009, EP-010, EP-012, EP-018 | Uncertainty, explanation where demanded, non-mutation, partial results. |
| Scope control | EP-011, EP-013, EP-014, EP-020 | Bonus isolation, investigation focus, restraint, simplicity. |
| Evolution | EP-017, EP-019 | Conceptual concern separation and maintainable detection reasoning. |

### 4.2 Potential tensions

| Tension | Principles | Handling |
|---|---|---|
| Explainability vs simplicity | EP-010 vs EP-020 | Provide attribution where Part 3 bonus demands; do not build a general explanation platform. |
| Maintainability vs timebox restraint | EP-019 vs EP-014 | Maintainability must serve assignment detection obligations; not justify frameworks beyond need. |
| Progressive completeness vs assignment completeness | EP-018 vs EP-001 | Partial outcomes allowed only where assignment language allows; Objectives still in scope even if Unknown. |
| Conceptual separation vs simplicity | EP-017 vs EP-020 | Separate concerns in reasoning; do not invent heavyweight package taxonomies prematurely. |
| Bonus richness vs core isolation | EP-011 vs delivery ambition | Bonus may be rich only if core remains independently satisfiable. |

### 4.3 Conflict handling

Apply §2.2. If two principles appear to conflict, choose the interpretation that preserves Assignment Requirements first, then Unknown preservation, then core browser-local integrity, then optional-bonus isolation.

---

## 5. Decision Rules

Governance heuristics for downstream authors and reviewers:

### DR-001 — Assignment vs inference
If an Engineering Inference conflicts with an Assignment Requirement, follow the Assignment Requirement. Demote or revise the inference.

### DR-002 — When Unknowns exist
Do not invent an assignment answer. Record the Unknown, design only non-assertive seams if needed, and leave resolution to legitimate later authority—or accept residual risk in Architecture Review.

### DR-003 — Optional features vs core
If an optional feature (FR-025) would make core diagnostics depend on backend or non-public authority, reject that coupling (EP-005, EP-011).

### DR-004 — Multiple valid designs
If multiple designs satisfy FR/NFR/C and principles, prefer the simpler investigation instrument (EP-020) that preserves multi-signal evidence rules (EP-008) and maintainable reasoning (EP-019).

### DR-005 — Ambiguous requirements
Ambiguity that is assignment silence → Unknown (EP-003). Ambiguity that is underspecified but obligated → keep the obligation, mark method/definition Unknown, do not drop the FR.

### DR-006 — Evaluation pressure vs scope
Evaluation weights (EV-*) guide emphasis; they do not authorize new features. Use them to prioritize investigation and Shopify literacy inside existing scope (EP-013).

### DR-007 — ADR necessity
Create an ADR when a cross-cutting choice is irreversible or contentious; the ADR must cite principles and requirement IDs and must not contradict this constitution (EP-015, EP-016).

### DR-008 — Non-Shopify and edge behavior
Where assignment is silent (e.g., U-008, U-009), do not invent mandatory product behavior in principles; defer to later documents without closing the Unknown here.

---

## 6. Architectural Anti-Patterns

### AP-001 — Inventing requirements
- **Description:** Adding capabilities not traceable to Assignment Requirements / Vision scope.  
- **Why prohibited:** Violates EP-001, EP-015.  
- **Authority:** Vision §4; Requirements §2.

### AP-002 — Closing Unknowns by invention
- **Description:** Treating U-001–U-010 (or Vision Unknowns) as settled without assignment basis.  
- **Why prohibited:** Violates EP-003, EP-004.  
- **Authority:** Requirements §9; Master Plan Unknown policy.

### AP-003 — Backend-first core
- **Description:** Requiring servers for Parts 1–3 or Objective core diagnostics.  
- **Why prohibited:** Violates EP-005, EP-011; fails C-006/C-007.  
- **Authority:** Assignment runtime constraint; Vision §3.2.

### AP-004 — Single-selector detection
- **Description:** Relying on one hardcoded selector (or equivalent single brittle signal) for FlexyPe product detection.  
- **Why prohibited:** Violates EP-008; fails C-005.  
- **Authority:** Assignment Part 2.

### AP-005 — False certainty
- **Description:** Emitting installed/not-installed product claims when confidence is insufficient instead of Not Detected.  
- **Why prohibited:** Violates EP-007, EP-009; fails FR-013.  
- **Authority:** Assignment Part 2.

### AP-006 — Scope expansion / productization
- **Description:** Merchant-facing product surfaces, automated remediation, full-stack platforming, or extra FlexyPe products.  
- **Why prohibited:** Violates EP-012, EP-013, EP-014; conflicts C-010, C-011, C-013.  
- **Authority:** Vision §4; Assignment focus statement.

### AP-007 — Treating optional bonus as mandatory
- **Description:** Making core success depend on configuration APIs or bonus UI.  
- **Why prohibited:** Violates EP-011; conflicts FR-026, C-008.  
- **Authority:** Assignment Bonus optionality; Vision §3.3.

### AP-008 — Architecture drift
- **Description:** Implementation or late docs contradicting frozen Vision/Requirements/Principles without amendment.  
- **Why prohibited:** Violates EP-002, EP-016, hierarchy §2.  
- **Authority:** Master Plan gates; Vision §8.5.

### AP-009 — Over-engineering
- **Description:** Generalized platforms or incidental complexity not required to satisfy assignment obligations.  
- **Why prohibited:** Violates EP-014, EP-020, EP-013.  
- **Authority:** Assignment 6–8h guidance; Vision §7.1; C-010.

### AP-010 — Mixing concerns without acknowledgment
- **Description:** Entangling evidence, reasoning, and presentation so obligations become untestable or untraceable.  
- **Why prohibited:** Violates EP-017, EP-015, EP-019.  
- **Authority:** Master Plan strategy; Requirements maintainability NFR-005.

### AP-011 — Silent assumptions
- **Description:** Relying on unstated premises about APIs, page types, feature lists, or permissions.  
- **Why prohibited:** Violates EP-004, EP-003.  
- **Authority:** Requirements §8–§9.

### AP-012 — Invasive diagnostics
- **Description:** Architecting to modify merchant storefronts as a product goal.  
- **Why prohibited:** Violates EP-012.  
- **Authority:** Vision §4 non-goals.

---

## 7. Compliance Requirements

Future architecture documents demonstrate compliance by:

1. **Citation:** Referencing relevant `EP-*` IDs when stating normative design rules.  
2. **Requirement linkage:** Naming affected `FR`/`NFR`/`C`/`U` IDs (EP-015).  
3. **Unknown hygiene:** Leaving `U-*` items explicitly open where still Unknown (EP-003).  
4. **Non-contradiction statement:** Avoiding designs that match anti-patterns AP-001–AP-012.  
5. **ADR discipline:** Recording irreversible choices as ADRs that cite principles (DR-007).  
6. **Review evidence:** `13_ARCHITECTURE_REVIEW` verifies principle compliance across documents and ADRs.  
7. **No philosophy redefinition:** Downstream docs must not restate a competing constitution; they refine application of this one.

This section does not define test cases, CI gates, or code linters.

---

## 8. Amendment Policy

### 8.1 When this document may change
Only when:
- The Assignment’s authoritative obligations change, or  
- Approved Vision or Requirements Analysis changes in a way that alters constitutional premises, or  
- Architecture Review identifies a genuine contradiction among principles that cannot be resolved via §2.2 / §4.3 interpretation.

Editorial clarifications that do not change normative meaning are allowed with review note.

### 8.2 Authority
Amendments require the same class of architectural authority as Master Plan Gate acceptance: explicit Architecture Review / Vision–Requirements steward approval. Unilateral implementation-driven edits are invalid (EP-016).

### 8.3 Expected process
1. Propose amendment with affected `EP-*`, conflicting sources, and impact on ADRs/docs.  
2. Update Requirements/Vision first if the change is actually an obligation/scope change.  
3. Revise this document.  
4. Re-check ADRs and dependent architecture docs for drift (AP-008).  
5. Record acceptance in Architecture Review.

### 8.4 Relationship to ADRs
ADRs specialize decisions under principles; they do not amend principles. If an ADR needs to violate an `EP-*`, the ADR is rejected or the principle must be amended first via §8.3.

### 8.5 Architecture review requirements
`13_ARCHITECTURE_REVIEW` must confirm that the principle set remains consistent with Vision and Requirements and that downstream artifacts comply (§7).

---

## 9. Glossary

| Term | Meaning |
|---|---|
| **Engineering Principle (`EP-*`)** | Normative, technology-independent rule binding architecture and implementation decisions |
| **Constitution** | This document as the enduring engineering rule set for the project |
| **Authority** | Authoritative source justifying a principle or anti-pattern |
| **Implication** | Mandatory consequence for downstream architecture/implementation reasoning |
| **Non-Goal (of a principle)** | What that principle deliberately does not specify |
| **Decision Rule (`DR-*`)** | Governance heuristic for resolving recurring judgment calls |
| **Anti-Pattern (`AP-*`)** | Prohibited class of architectural or delivery behavior |
| **Compliance** | Demonstrable adherence of documents/ADRs to principles without redefining them |
| **Amendment** | Controlled change to this constitution under §8 |
| **Precedence / Hierarchy** | Ordering used for conflict resolution (§2) |
| **Core path** | Browser-local diagnostics obligated without backend (as used by EP-005/EP-011) |
| **Engineering Inference** | Justified non-literal conclusion; never silently treated as Assignment Requirement |
| **Unknown** | Assignment silence that must not be inventively closed |
| **Traceability** | Ability to follow a design claim back to requirement IDs and assignment origin |
| **ADR** | Architecture Decision Record specializing a cross-cutting choice under these principles |

---

**End of Engineering Principles.**  
Next planning document per Architecture Master Plan: `03_TRACEABILITY_MATRIX` (depends on Engineering Principles).
