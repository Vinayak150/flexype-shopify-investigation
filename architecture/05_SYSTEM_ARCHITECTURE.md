# 05 — System Architecture

**Status:** Draft — depends on approved `04_DOMAIN_MODEL` and planning docs `00`–`03`  
**Document type:** System-level responsibility architecture (not packages, not UI, not detection algorithms, not extension runtime)  
**Authoritative inputs:** Architecture Master Plan; `00_PROJECT_VISION`–`04_DOMAIN_MODEL`; Product Support Engineer Assignment (FlexyPe)

Domain terminology from `04_DOMAIN_MODEL` is reused and not redefined.

---

## 1. Purpose

This document organizes the Domain Model into **collaborating architectural responsibilities** and **boundaries**. It answers how Investigation, Evidence, Detection Results, and Diagnostic Report concepts are allocated across the system—without prescribing packages, Chrome runtime roles, UI structure, or detection algorithms.

**Relationship to Domain Model:** Domain Model defines *what exists*. System Architecture assigns *who is responsible* for those concepts at the architectural level.

**Relationship to Investigation Pipeline:** Pipeline will order stages of one Investigation. This document defines the responsibilities those stages invoke; it does not sequence them.

**Relationship to Detection Strategy:** Detection Strategy will define *how* multi-signal evaluation produces Detection Results. This document only places **Detection Coordination** and **Domain Evaluation** as responsibilities and forbids UI/runtime ownership leakage into them.

**Relationship to Extension Architecture:** Extension Architecture will map responsibilities onto Chrome Extension runtime roles. This document remains runtime-agnostic and only requires that the core path stay browser-local (EP-005).

**Relationship to UI Architecture:** UI Architecture will structure the popup. This document defines **Presentation Preparation** as the sole responsibility that shapes operator-facing Diagnostic Report consumption—without layout design.

No implementation, APIs, manifests, or algorithms appear here.

---

## 2. Architectural Scope

### 2.1 Inside the System

The system is the **internal FlexyPe storefront diagnostics capability** delivered as a Chrome Extension, encompassing:

- Coordinating one Investigation against the current Storefront  
- Observing the Storefront and collecting Evidence  
- Evaluating Detection Results for obligated diagnostic questions  
- Assembling a Diagnostic Report for the Operator  
- Optionally integrating Product Configuration without coupling to core  
- Preserving Domain Unknowns and assignment traceability  

### 2.2 Outside the System

| Outside | Reason |
|---|---|
| Merchant storefront mutation / remediation | EP-012; Vision non-goals |
| Shopify Admin as a required subsystem | C-003; EP-006 |
| FlexyPe production backends for core diagnostics | C-006; C-007 |
| Deployment / CI / hosting platforms | Delivery mechanics |
| Package managers, build toolchains | Implementation |
| General-purpose analytics platforms | Out of scope |

### 2.3 External Actors

| Actor | Role |
|---|---|
| **Operator** | Sales/Support user who initiates Investigation and consumes Diagnostic Report (D-001; FR-023) |

### 2.4 External Systems

| External system | Relationship to this architecture |
|---|---|
| **Shopify Storefront (open tab)** | Sole public evidence authority for core path (D-003; EP-006) |
| **Optional configuration APIs** | External only if bonus pursued; not required for core (FR-025; C-008; U-006 Open) |

### 2.5 Unknown External Dependencies

| Unknown | Effect on scope |
|---|---|
| **U-006** | Whether optional configuration APIs are real, mocked, or omitted is Open; Configuration Integration remains optional |
| **U-007** | Permission/CSP limits may restrict observation reach; Observation responsibility must tolerate incomplete Evidence without inventing Admin fallbacks |
| **U-008** | Non-Shopify contexts unspecified; system does not invent a mandatory external “error service” |
| **U-009** | SPA navigation behavior unspecified; system does not assume an external navigation bus |

---

## 3. Architectural Responsibilities

These are **responsibility centers**, not packages.

### R-001 — Investigation Coordination

- **Purpose:** Own the Investigation as the unit of work; bind one Investigation to one Storefront context; ensure core Investigation can complete without optional bonus.  
- **Owned Domain Concepts:** Investigation (D-002).  
- **Consumes:** Operator intent to investigate; Storefront identity as current context.  
- **Produces:** An active Investigation boundary; completion/partial-completion disposition for Diagnostic Assembly.  
- **Dependencies:** May invoke Storefront Observation, Evidence Collection, Detection Coordination, Diagnostic Assembly; must not require Configuration Integration (EP-011).  
- **Non-Goals:** Not UI; not detection rules; not evidence parsing details.  
- **Authority:** C-002; INV-001; ADR-001 intent; FR-026.

### R-002 — Storefront Observation

- **Purpose:** Access the Storefront as public authority for observation opportunities (presence of pages, globals, structure) without evaluating product conclusions.  
- **Owned Domain Concepts:** Storefront (D-003) as observational target.  
- **Consumes:** Investigation context.  
- **Produces:** Observation affordances for Evidence Collection and Store Information capture.  
- **Dependencies:** Depends on Investigation Coordination for context; must not depend on Presentation Preparation or Domain Evaluation outcomes.  
- **Non-Goals:** Not Detection Result ownership; not popup assembly.  
- **Authority:** EP-006; C-002; C-003.

### R-003 — Evidence Collection

- **Purpose:** Gather Evidence instances classified under Evidence Signal Classes listed for product detection and other public signals needed for Store Information / Part 3 forms—without concluding Detection Results.  
- **Owned Domain Concepts:** Evidence (D-012); Evidence Signal Class (D-013) as collection categories.  
- **Consumes:** Storefront Observation affordances; Investigation context.  
- **Produces:** Evidence set for an Investigation (may be partial; U-007/U-009 may limit completeness).  
- **Dependencies:** Storefront Observation; must not depend on Presentation Preparation.  
- **Non-Goals:** Not multi-signal fusion logic (Detection Strategy); not UI.  
- **Authority:** FR-009; FR-015; FR-017 (as observable forms); EP-007.

### R-004 — Evidence Normalization

- **Purpose:** Bring collected Evidence into a consistent conceptual form suitable for evaluation—without changing meaning or inventing facts.  
- **Owned Domain Concepts:** Normalized view of Evidence for one Investigation (supports ADR-002 consistency intent).  
- **Consumes:** Raw collected Evidence.  
- **Produces:** Evaluation-ready Evidence set.  
- **Dependencies:** Evidence Collection; must not depend on Presentation Preparation or Configuration Integration.  
- **Non-Goals:** Not persistence design; not scoring algorithms.  
- **Authority:** EP-007; ADR-002 intent; INV-003.

### R-005 — Detection Coordination

- **Purpose:** Orchestrate which investigatory questions are evaluated for the Investigation (FlexyPe Products, Disabled Integrations, Theme/Store Information questions, Third-party Apps, Storefront Features)—without owning UI or extension runtime.  
- **Owned Domain Concepts:** Coordination over Detection Result production (D-014).  
- **Consumes:** Normalized Evidence; domain catalog of FlexyPe Products (D-007); open Domain Unknowns affecting questions (U-001, U-002, etc.).  
- **Produces:** Requests for Domain Evaluation; aggregated Detection Results for Diagnostic Assembly.  
- **Dependencies:** Evidence Normalization; Domain Evaluation; must not depend on Presentation Preparation or Configuration Integration for core questions.  
- **Non-Goals:** Not the detailed multi-signal policy (Detection Strategy document); not popup layout.  
- **Authority:** FR-010–FR-022 (as applicable); C-004; C-005; EP-008; EP-003.

### R-006 — Domain Evaluation

- **Purpose:** Apply domain meaning to Evidence to form Detection Results and Store Information field values, including Not Detected and explicit Unknown outcomes.  
- **Owned Domain Concepts:** Detection Result (D-014); Store Information (D-004); Current Page (D-005); Theme (D-006); Disabled Integration (D-009); Third-party App (D-010); Storefront Feature (D-011)—as evaluated conclusions, not as UI.  
- **Consumes:** Normalized Evidence; FlexyPe Product set; Domain Unknown qualifiers.  
- **Produces:** Detection Results and Store Information conclusions for the Investigation.  
- **Dependencies:** Evidence Normalization; Detection Coordination; must not own Presentation Preparation.  
- **Non-Goals:** Not selector catalogs; not confidence-number algorithms (reserved for Detection Strategy); not backend calls.  
- **Authority:** FR-001–FR-013; FR-016–FR-019; FR-021–FR-022; EP-009; EP-018; INV-005; INV-006.

### R-007 — Diagnostic Assembly

- **Purpose:** Compose the Diagnostic Report from Store Information and Detection Results for one Investigation.  
- **Owned Domain Concepts:** Diagnostic Report (D-015).  
- **Consumes:** Outputs of Domain Evaluation; Investigation completion disposition; optional Product Configuration only if supplied by Configuration Integration.  
- **Produces:** Diagnostic Report (complete or Completed Partial).  
- **Dependencies:** Domain Evaluation; optionally Configuration Integration; must not re-evaluate Evidence.  
- **Non-Goals:** Not visual layout; not Chrome popup APIs.  
- **Authority:** FR-020; EP-018; INV-010.

### R-008 — Configuration Integration (Optional)

- **Purpose:** Optionally obtain Product Configuration for detected FlexyPe Products and contribute readable configuration to Diagnostic Assembly **without blocking core**.  
- **Owned Domain Concepts:** Product Configuration (D-016).  
- **Consumes:** Detection Results indicating detected products (when bonus pursued); external optional APIs (U-006).  
- **Produces:** Optional Product Configuration attachments.  
- **Dependencies:** May depend on Domain Evaluation outcomes for “which products”; must not be required by Investigation Coordination or Domain Evaluation for core success.  
- **Non-Goals:** Not core Evidence Collection; not Admin API mandate for Parts 1–3.  
- **Authority:** FR-025; FR-026; C-008; EP-011; U-006 Open.

### R-009 — Presentation Preparation

- **Purpose:** Prepare the Diagnostic Report for Operator consumption in the extension popup surface—without performing detection.  
- **Owned Domain Concepts:** Operator-facing projection of Diagnostic Report (D-015); does not redefine domain entities.  
- **Consumes:** Diagnostic Report (including optional configuration if present).  
- **Produces:** Presentation-ready diagnostic view model (conceptual)—layout deferred to UI Architecture.  
- **Dependencies:** Diagnostic Assembly only; must not depend on Evidence Collection internals; must not call Domain Evaluation.  
- **Non-Goals:** Not UI components, styling, or interaction widgets; not Evidence ownership.  
- **Authority:** FR-020; Vision §8.2; EP-017.

### R-010 — Assignment Traceability

- **Purpose:** Ensure architectural conclusions and responsibility outputs remain linkable to Assignment Obligation References (`FR`/`NFR`/`C`/`U`).  
- **Owned Domain Concepts:** Assignment Obligation Reference (D-018); Domain Unknown visibility (D-017) as governance concern.  
- **Consumes:** Claims produced across responsibilities.  
- **Produces:** Traceability discipline for downstream docs and review.  
- **Dependencies:** Cross-cutting; must not become a runtime subsystem requirement here.  
- **Non-Goals:** Not the Traceability Matrix itself; not testing procedures.  
- **Authority:** EP-001; EP-015; Traceability Matrix.

---

## 4. Architectural Boundaries

| Responsibility | Owns | Must never own |
|---|---|---|
| **R-001 Investigation Coordination** | Investigation lifecycle binding | Detection rules; UI; Evidence contents; bonus APIs |
| **R-002 Storefront Observation** | Access to Storefront as observation target | Detection Results; Diagnostic Report; configuration fetch |
| **R-003 Evidence Collection** | Gathering Evidence | Concluding Detected/Not Detected; presentation |
| **R-004 Evidence Normalization** | Consistency of Evidence form | Changing Evidence meaning; inventing facts; UI |
| **R-005 Detection Coordination** | Which questions are evaluated | Popup structure; extension manifest; bonus backend |
| **R-006 Domain Evaluation** | Store Information + Detection Result conclusions | UI layout; Chrome roles; optional API clients as core |
| **R-007 Diagnostic Assembly** | Diagnostic Report composition | Re-interpreting Evidence; detection policy |
| **R-008 Configuration Integration** | Optional Product Configuration | Core Investigation success criteria; Evidence fabrication |
| **R-009 Presentation Preparation** | Operator-facing preparation of report | Evidence evaluation; multi-signal policy |
| **R-010 Assignment Traceability** | Traceability discipline | Product detection logic; UI |

**Boundary erosion rules:**  
- Presentation must not silently become evaluation.  
- Observation/Collection must not silently become “Detected” claims.  
- Configuration must not silently become a prerequisite for Assembly of core fields.

---

## 5. Dependency Principles

Allowed conceptual dependency direction:

```
Investigation Coordination
    → Storefront Observation
        → Evidence Collection
            → Evidence Normalization
                → Detection Coordination
                    → Domain Evaluation
                        → Diagnostic Assembly
                            → Presentation Preparation

Configuration Integration (optional)
    → Diagnostic Assembly   (adjunct only; never required upstream)

Assignment Traceability
    → (cross-cutting reference; does not sit in the core evaluation chain)
```

**Rules:**

1. **Observation does not depend on Presentation** (R-002 ↛ R-009).  
2. **Presentation never evaluates Evidence** (R-009 ↛ R-003/R-006).  
3. **Detection Coordination / Domain Evaluation never own UI** (R-005/R-006 ↛ R-009 ownership inversion).  
4. **Configuration never blocks core** (R-008 must not be upstream of R-001/R-006 success) — EP-011; FR-026.  
5. **Evidence precedes evaluation; evaluation precedes assembly; assembly precedes presentation** — EP-007; EP-017.  
6. **No reverse dependency** from Evaluation back to Presentation.  
7. **Unknowns flow forward as qualifiers**, not as invented Evidence (EP-003).

---

## 6. Architectural Invariants

| ID | Invariant | Authority |
|---|---|---|
| S-INV-001 | Core path responsibilities (R-001–R-007, R-009) remain browser-local and must not require backend services. | NFR-001; NFR-002; C-006; C-007; EP-005 |
| S-INV-002 | Evidence Collection/Normalization precede Domain Evaluation for evidence-backed claims. | EP-007; FR-015 |
| S-INV-003 | Domain Evaluation precedes Diagnostic Assembly; Assembly precedes Presentation Preparation. | EP-017; FR-020 |
| S-INV-004 | Domain Unknowns remain explicit across responsibility handoffs; none may close U-001–U-010 by invention. | EP-003; Traceability §6 |
| S-INV-005 | Configuration Integration is optional and non-blocking for core Diagnostic Report fields (Parts 1–3 / Objective core answers obtainable without it). | FR-026; EP-011; C-008; ADR-005 intent |
| S-INV-006 | FlexyPe product evaluation responsibilities must uphold multi-signal validation and forbid single-selector sole basis. | C-004; C-005; EP-008; ADR-003 intent |
| S-INV-007 | Insufficient-confidence FlexyPe product outcomes surface as Not Detected through Domain Evaluation → Assembly → Presentation chain. | FR-013; EP-009; ADR-006 intent |
| S-INV-008 | System responsibilities do not include Storefront mutation. | EP-012 |
| S-INV-009 | One Investigation Coordination instance targets one Storefront context. | C-002; Domain INV-001; ADR-001 intent |

---

## 7. Architectural Collaboration

Conceptual interactions (not timed flows):

- **Investigation Coordination** establishes the Investigation and requests observation and evaluation work needed for a Diagnostic Report.  
- **Storefront Observation** makes the Storefront available as the public authority for collection.  
- **Evidence Collection** obtains Evidence; **Evidence Normalization** makes that Evidence evaluation-ready without altering truth.  
- **Detection Coordination** selects the investigatory questions obligated by requirements (including those with Open Unknown methods/definitions) and asks **Domain Evaluation** to conclude Detection Results / Store Information.  
- **Domain Evaluation** returns conclusions including Detected, Not Detected, Disabled, Available/Unavailable, or Unknown as justified—never false certainty (EP-009).  
- **Diagnostic Assembly** composes the Diagnostic Report from those conclusions.  
- **Configuration Integration**, if active, may add Product Configuration to the report after core evaluation, never as a gate.  
- **Presentation Preparation** consumes only the Diagnostic Report for Operator-facing preparation.  
- **Assignment Traceability** ensures each responsibility’s outputs remain mappable to obligation IDs during architecture and review.

---

## 8. Architectural Variation Points

Points where the system must accommodate change **without** rewriting responsibility boundaries:

| Variation point | Accommodation | Must not do |
|---|---|---|
| **Detection definitions** (products/signals) | Specialize inside Detection Strategy under R-005/R-006 | Move detection into Presentation (R-009) |
| **Evidence sources / signal availability** | R-003/R-004 tolerate partial Evidence (U-007, U-009) | Invent Admin/backend Evidence for core |
| **Optional bonus** | R-008 present or absent; Assembly works either way | Make R-001/R-006 depend on R-008 |
| **Unknown handling** | R-005/R-006 propagate Domain Unknown; Assembly/Presentation preserve it | Resolve U-001/U-002 here |
| **Theme availability** | Store Information may be partial (FR-007) via R-006/R-007 | Treat missing theme as system failure by default |
| **Third-party app strategy** | R-005/R-006 keep FR-019 in scope; method Open (U-002) | Fabricate signal classes in this document |
| **Storefront feature catalog** | FR-022 in scope; definition Open (U-001) | Invent feature taxonomy as “architecture fact” |
| **Part 3 explanation depth** | R-006 may attach explanation intent; depth U-005 | Mandate UI copy here |

---

## 9. Architectural Risks

Structural risks only—no mitigations (mitigation belongs to later architecture/ADRs/review).

| ID | Risk |
|---|---|
| S-RISK-001 | **Responsibility coupling** — Presentation Preparation begins to perform Domain Evaluation |
| S-RISK-002 | **Evidence ambiguity** — Collection gathers weak signals; Evaluation pressured into false Detected claims |
| S-RISK-003 | **Boundary erosion** — Configuration Integration becomes an implicit dependency of Investigation Coordination |
| S-RISK-004 | **Unknown expansion** — Open U-001/U-002 cause unbounded responsibility growth inside Detection Coordination |
| S-RISK-005 | **Observation overreach** — Storefront Observation assumes privileged Admin capabilities, violating public-authority boundary |
| S-RISK-006 | **Assembly bypass** — Presentation reads Evidence directly, skipping Diagnostic Assembly invariants |
| S-RISK-007 | **Traceability drift** — Responsibilities produce conclusions without Assignment Obligation References |

---

## 10. Architectural Glossary

Architectural terms only. Domain entity meanings remain as in `04_DOMAIN_MODEL`.

| Term | Meaning |
|---|---|
| **Responsibility (R-***)** | Architectural center of ownership for a concern; not a package |
| **Core path** | Responsibility chain that must complete without Configuration Integration or backend |
| **Boundary** | Limit of what a responsibility may own |
| **Dependency direction** | Allowed conceptual depends-on relation between responsibilities |
| **Variation point** | Axis of change accommodated without redesigning responsibility map |
| **Diagnostic Assembly** | Responsibility that composes Diagnostic Report |
| **Presentation Preparation** | Responsibility that prepares Diagnostic Report for Operator consumption (not UI design) |
| **Detection Coordination** | Responsibility that orchestrates which questions are evaluated |
| **Domain Evaluation** | Responsibility that forms Store Information and Detection Results from Evidence |
| **Configuration Integration** | Optional responsibility for Product Configuration |
| **Browser-local system** | System property: core responsibilities require no backend |
| **Responsibility leakage** | Ownership of concerns across boundaries in violation of §4–§5 |
| **Collaboration** | Conceptual interaction among responsibilities without runtime sequencing |

---

**End of System Architecture.**  
Next architecture document per Architecture Master Plan: `06_INVESTIGATION_PIPELINE` (depends on System Architecture).
