# 04 — Domain Model

**Status:** Draft — depends on approved `00_PROJECT_VISION`, `01_REQUIREMENTS_ANALYSIS`, `02_ENGINEERING_PRINCIPLES`, `03_TRACEABILITY_MATRIX`  
**Document type:** Canonical domain vocabulary (not design, not runtime, not implementation)  
**Authoritative inputs:** Architecture Master Plan; `00`–`03` planning/architecture governance docs; Product Support Engineer Assignment (FlexyPe)

### Classification Legend

| Label | Meaning |
|---|---|
| **Assignment Requirement** | Explicitly stated by the assignment PDF |
| **Engineering Inference** | Justified conclusion not literally stated as a requirement |
| **Unknown** | Topic on which the assignment is silent; must not be silently filled |

Later architecture documents must reuse the terms defined here and must not redefine them.

---

## 1. Purpose

The Domain Model defines **what concepts exist** in the problem space of Shopify storefront diagnostics for FlexyPe Sales and Support. It is the shared vocabulary for Investigation Pipeline, Detection Strategy, Data Flow, System/Extension/UI architecture, Testing, and ADRs.

**Relationship to Requirements:** Requirements (`FR-*`, `NFR-*`, `C-*`, `U-*`) state obligations. This document names the entities those obligations talk about. It does not duplicate acceptance tests or invent new obligations.

**Relationship to Principles:** Principles (especially EP-001, EP-003, EP-006, EP-007, EP-009, EP-011, EP-012, EP-018) constrain how domain concepts may be used (Unknown preservation, evidence-based claims, bonus isolation). The Domain Model encodes those constraints as entities, relationships, and invariants—not as algorithms.

**Relationship to future architecture:** Downstream documents apply this vocabulary. They may specialize presentation or acquisition mechanics, but they may not rename or silently alter the meaning of entities defined here. Traceability Matrix §3 assigns this document primary ownership for store-information and product-set concepts.

This document does not define packages, APIs, manifests, UI layout, detection algorithms, or runtime topology.

---

## 2. Domain Boundaries

### 2.1 Inside the Domain

Concepts that describe the **investigation of a Shopify storefront for FlexyPe pre-onboarding diagnostics**:

- Who investigates (Operator)
- What is investigated (Storefront; Store Information; Theme; Current Page)
- What FlexyPe products and integrations are assessed (FlexyPe Product; Integration; Disabled Integration)
- What other storefront presence questions are asked (Third-party App; Storefront Feature)—including where definition/method remain Unknown
- How conclusions are spoken about (Evidence; Evidence Signal Class; Detection Result; Diagnostic Report)
- What optional configuration viewing means as a concept (Product Configuration)—optional only
- Explicit uncertainty (Domain Unknown)
- The unit of work (Investigation)

### 2.2 Outside the Domain

The following exist in the wider world but are **not** modeled as core domain entities here:

| Outside concept | Why outside |
|---|---|
| Merchant business operations / order management | Not an investigation concept |
| FlexyPe or merchant **backend systems** (except as optional configuration *source* for bonus) | Core path is browser-local (C-006/C-007); backend is not a core entity |
| Shopify Admin / authenticated admin APIs | Not required for core (C-003; EP-006) |
| Deployment, CI, hosting | Delivery mechanics |
| Source code, repositories, packages, modules | Implementation structure |
| Chrome Extension manifest / permission manifests | Runtime packaging (Extension Architecture) |
| UI layout, components, styling | UI Architecture |
| Detection algorithms, scorers, selectors | Detection Strategy |
| Network stacks, storage engines | Infrastructure |
| Evaluation rubrics as entities | Governance (Requirements §6), not storefront domain |
| Assignment PDF as a runtime object | Governance artifact; see Assignment Obligation Reference only as traceability aid |

### 2.3 Explicit Non-Domain Concepts

Do not treat these as domain entities in later docs:

- Folders, packages, classes, interfaces  
- Message buses, event infrastructures  
- Databases or schemas  
- Pixel-level popup design  
- Concrete script URL patterns or DOM selectors as “entities”

---

## 3. Core Domain Entities

### D-001 — Operator

- **Purpose:** The FlexyPe Sales or Support person who uses the diagnostics tool.  
- **Responsibilities:** Initiate investigation intent; consume diagnostic outcomes.  
- **Relationships:** Initiates Investigation; views Diagnostic Report.  
- **Lifecycle:** Exists independently of any single Investigation.  
- **Non-Goals:** Not a merchant customer; no merchant account model (FR-023; C-013).  
- **Authority:** FR-023; Vision §5.

### D-002 — Investigation

- **Purpose:** The unit of diagnostic work against exactly one currently relevant Storefront context.  
- **Responsibilities:** Bound the set of observations and conclusions for one inspection episode.  
- **Relationships:** Targets one Storefront; produces one Diagnostic Report; collects Evidence; yields Detection Results.  
- **Lifecycle:** Conceptual states in §6 (e.g., initiated → concluded with complete/partial outcomes).  
- **Non-Goals:** Not a multi-store batch job; not a historical case-management system.  
- **Authority:** C-002; ADR-001 intent; EP-005/EP-006; Master Plan investigation root.

### D-003 — Storefront

- **Purpose:** The Shopify storefront under inspection (the page/context currently open for analysis).  
- **Responsibilities:** Serve as the public evidence authority for the core path.  
- **Relationships:** Described by Store Information; hosts Themes, Integrations, FlexyPe Products (as presence questions), Third-party Apps, Storefront Features; observed by Investigation.  
- **Lifecycle:** Treated as the Investigation’s target for the duration of that Investigation.  
- **Non-Goals:** Not a Shopify Admin shop resource; not a backend tenant record.  
- **Authority:** Assignment Objective; C-002; EP-006.

### D-004 — Store Information

- **Purpose:** The Part 1 identity/context bundle for a Storefront.  
- **Responsibilities:** Represent Store URL, Shop Name, Base Currency, Country, Locale, Shopify Domain, Theme Name (when available), Current Page.  
- **Relationships:** Describes Storefront; Theme Name relates to Theme; Current Page is a facet of Store Information; included in Diagnostic Report.  
- **Lifecycle:** Populated for an Investigation from public storefront signals when available; may be partially populated (EP-018; FR-007).  
- **Non-Goals:** Not a free-form merchant profile; fields limited to assignment Part 1.  
- **Authority:** FR-001–FR-009; FR-021.

### D-005 — Current Page

- **Purpose:** Classification of which storefront page kind is open (assignment lists Home / Product / Collection / Cart).  
- **Responsibilities:** Appear as part of Store Information.  
- **Relationships:** Facet of Store Information; observed on Storefront.  
- **Lifecycle:** Determined per Investigation.  
- **Non-Goals:** Does not assert exhaustiveness of the page-kind set (U-004 Open).  
- **Authority:** FR-008; U-004.

### D-006 — Theme

- **Purpose:** The Shopify theme in use on the Storefront.  
- **Responsibilities:** Be answerable as “what theme is the merchant using?” when Theme Name is available.  
- **Relationships:** Identified via Store Information Theme Name; associated with Storefront.  
- **Lifecycle:** May be known or unavailable (“if available”).  
- **Non-Goals:** Not a full theme asset inventory; not theme editor state.  
- **Authority:** FR-007; FR-021; Objective Q4.

### D-007 — FlexyPe Product

- **Purpose:** One of the FlexyPe products whose storefront presence must be assessed.  
- **Responsibilities:** Exist as a closed set member: Checkout, FlexyPass, FlexyCart.  
- **Relationships:** Evaluated by Detection Result; may relate to Integration instances; may have optional Product Configuration.  
- **Lifecycle:** Catalog identity is stable; presence conclusion varies per Investigation.  
- **Non-Goals:** No additional FlexyPe products in domain (C-011; EP-014).  
- **Authority:** FR-010–FR-012; C-011.

### D-008 — Integration

- **Purpose:** A FlexyPe integration presence on a Storefront that may be live or disabled/commented.  
- **Responsibilities:** Represent “integration exists in some form” as distinct from product-presence conclusion when needed for Part 3.  
- **Relationships:** Associated with Storefront and FlexyPe Product; may be classified as Disabled Integration; supported by Evidence.  
- **Lifecycle:** Observed within an Investigation.  
- **Non-Goals:** Not a merchant billing entitlement; not Admin app install record.  
- **Authority:** FR-016–FR-017; Objective Q2.

### D-009 — Disabled Integration

- **Purpose:** An Integration that appears to exist but is currently disabled or commented out.  
- **Responsibilities:** Capture disabled-state findings; optionally carry explanation/snippet intent (FR-018).  
- **Relationships:** Specialization/classification of Integration; supported by Evidence; appears in Diagnostic Report.  
- **Lifecycle:** Concluded per Investigation; may be uncertain.  
- **Non-Goals:** Not a remediation ticket; does not modify the storefront (EP-012).  
- **Authority:** FR-016–FR-018; U-005 (explanation depth Open).

### D-010 — Third-party App

- **Purpose:** A non-FlexyPe Shopify application present on the Storefront (as asked by Objective Q3).  
- **Responsibilities:** Be reportable as present when concluded; method of recognition remains Unknown.  
- **Relationships:** Associated with Storefront; concluded via Detection Result; may lack defined Evidence Signal Class set (U-002).  
- **Lifecycle:** Per Investigation.  
- **Non-Goals:** Does not invent a detection method here (U-002 Open).  
- **Authority:** FR-019; U-002.

### D-011 — Storefront Feature

- **Purpose:** A storefront capability/feature whose availability is asked by Objective Q5.  
- **Responsibilities:** Be reportable when the domain can name it; enumeration remains Unknown.  
- **Relationships:** Associated with Storefront; concluded via Detection Result; definition Unknown (U-001).  
- **Lifecycle:** Per Investigation.  
- **Non-Goals:** Does not invent a feature catalog (U-001 Open).  
- **Authority:** FR-022; U-001.

### D-012 — Evidence

- **Purpose:** An observable fact gathered from the Storefront that may support or undermine a Detection Result.  
- **Responsibilities:** Ground conclusions; never invent storefront facts (EP-007).  
- **Relationships:** Drawn from Storefront via Evidence Signal Class; supports Detection Result; belongs to an Investigation.  
- **Lifecycle:** Discovered during Investigation; interpreted for conclusions; conceptually stable for one Investigation’s consistency intent (ADR-002).  
- **Non-Goals:** Not a log sink; not a permanent forensic archive product.  
- **Authority:** FR-015; FR-009; EP-007; EP-006.

### D-013 — Evidence Signal Class

- **Purpose:** A category of publicly available signal the assignment lists as legitimate for product detection.  
- **Responsibilities:** Constrain what kinds of Evidence are in-scope for multi-signal validation.  
- **Relationships:** Classifies Evidence; informs Detection Result evaluation.  
- **Lifecycle:** Catalog is assignment-fixed for product detection; usage per Investigation.  
- **Assignment-listed classes:** loaded JavaScript assets; script URLs; DOM elements; HTML structure; global browser objects; network requests; Shopify theme assets.  
- **Non-Goals:** Not a ranked scoring model; not an algorithm.  
- **Authority:** FR-015; C-004; C-005; EP-008.

### D-014 — Detection Result

- **Purpose:** A concluded assessment for a specific investigatory question (e.g., product presence, disabled integration, third-party app, feature, theme availability).  
- **Responsibilities:** Express outcome states (§6); reference supporting Evidence when claims are positive/disabled; express Not Detected / Unknown appropriately.  
- **Relationships:** Evaluates FlexyPe Product / Integration / Third-party App / Storefront Feature / Theme aspects; supported by Evidence; included in Diagnostic Report.  
- **Lifecycle:** Produced during Investigation; may be partial relative to full objective set (EP-018).  
- **Non-Goals:** Not a machine-learning prediction product; not Admin truth.  
- **Authority:** FR-010–FR-013; FR-016–FR-019; FR-021–FR-022; EP-009.

### D-015 — Diagnostic Report

- **Purpose:** The complete set of Store Information and Detection Results intended for operator consumption for one Investigation.  
- **Responsibilities:** Assemble answers to assignment diagnostic questions for the popup surface (presentation mechanics elsewhere).  
- **Relationships:** Produced by Investigation; consumed by Operator; contains Store Information and Detection Results; may optionally include Product Configuration views.  
- **Lifecycle:** Prepared when Investigation concludes (including partial conclusion).  
- **Non-Goals:** Not a PDF export product; not a ticket system.  
- **Authority:** FR-020; Vision §8.2; EP-018.

### D-016 — Product Configuration

- **Purpose:** Backend-stored configuration values for a detected FlexyPe Product, viewable only under the optional bonus.  
- **Responsibilities:** Represent optional readable configuration content.  
- **Relationships:** Optional adjunct to FlexyPe Product / Diagnostic Report; never required for core Detection Results.  
- **Lifecycle:** Absent for core path; optionally attached if bonus pursued.  
- **Non-Goals:** Not part of core Investigation success (FR-026; EP-011); API nature Unknown (U-006).  
- **Authority:** FR-025; FR-026; C-008; U-006.

### D-017 — Domain Unknown

- **Purpose:** An explicit placeholder for assignment silence that affects modeling or conclusions.  
- **Responsibilities:** Remain visible; prevent false certainty.  
- **Relationships:** May qualify Detection Result, Storefront Feature, Third-party App, Current Page, explanation depth, etc.  
- **Lifecycle:** Open until Resolution Authority acts without inventing assignment text (EP-003).  
- **Non-Goals:** Not a user-visible error string by itself; not an automatic “Not Detected.”  
- **Authority:** U-001–U-010; EP-003; Traceability §6.

### D-018 — Assignment Obligation Reference

- **Purpose:** Traceability handle from a domain conclusion back to `FR`/`NFR`/`C`/`U` identifiers.  
- **Responsibilities:** Keep domain claims assignment-faithful (EP-001, EP-015).  
- **Relationships:** Annotates entities/results in architectural reasoning; not a storefront object.  
- **Lifecycle:** Stable IDs from Requirements Analysis.  
- **Non-Goals:** Not runtime metadata mandate; conceptual governance link.  
- **Authority:** EP-001; EP-015; Traceability Matrix.

---

## 4. Domain Relationships

Conceptual relationships only (no sequences, no runtime):

| Relationship | Meaning |
|---|---|
| Operator **initiates** Investigation | Human starts diagnostic work |
| Investigation **targets** Storefront | Exactly one storefront context per Investigation (invariant) |
| Investigation **observes** Storefront | Public evidence authority |
| Store Information **describes** Storefront | Part 1 bundle |
| Current Page **facets** Store Information | Page kind |
| Theme **is identified for** Storefront | Via Theme Name when available |
| Investigation **collects** Evidence | Observable facts |
| Evidence **belongs to** Evidence Signal Class | Category constraint for product detection |
| Evidence **supports** Detection Result | Grounding (EP-007) |
| Detection Result **evaluates** FlexyPe Product | Presence assessment |
| Detection Result **evaluates** Disabled Integration | Part 3 assessment |
| Detection Result **evaluates** Third-party App | Objective Q3 (method Unknown) |
| Detection Result **evaluates** Storefront Feature | Objective Q5 (definition Unknown) |
| Integration **concerns** FlexyPe Product | Product-linked integration |
| Disabled Integration **is a** disabled form of Integration | Part 3 |
| Investigation **produces** Diagnostic Report | Operator-facing outcome set |
| Diagnostic Report **includes** Store Information | Part 1 |
| Diagnostic Report **includes** Detection Results | Objectives / Parts 2–3 |
| Product Configuration **optionally augments** Diagnostic Report | Bonus only |
| Domain Unknown **qualifies** Detection Result / Feature / App / Page model | Explicit silence |
| Assignment Obligation Reference **traces** domain claims | Governance |

---

## 5. Domain Invariants

| ID | Invariant | Authority |
|---|---|---|
| INV-001 | An Investigation targets exactly one Storefront context. | C-002; ADR-001 intent; EP-006 |
| INV-002 | Core Investigation conclusions are grounded only in public Storefront Evidence, not Admin/backend authority. | C-003; C-006; C-007; EP-005; EP-006 |
| INV-003 | Evidence must not invent storefront facts. | EP-007; EP-004 |
| INV-004 | A positive or disabled-state Detection Result that asserts presence/disabledness should be supportable by Evidence. | EP-007; EP-010; FR-015–FR-017 |
| INV-005 | Insufficient confidence for FlexyPe product installation is expressed as Not Detected (product scope); it must not be coerced into false certainty. | FR-013; EP-009; U-003 Open for breadth beyond products |
| INV-006 | Domain Unknowns remain explicit; they are not silently closed inside the domain model. | EP-003; U-001–U-010 |
| INV-007 | The FlexyPe Product set contains only Checkout, FlexyPass, and FlexyCart. | C-011; EP-014 |
| INV-008 | Product Configuration is never required to complete core Store Information or core Detection Results. | FR-026; EP-011; C-008 |
| INV-009 | FlexyPe product Detection Results must be consistent with multi-signal validation and must not rely on a single hardcoded selector as their sole basis. | C-004; C-005; EP-008 |
| INV-010 | Diagnostic Report for core path is complete only relative to obtainable public evidence; partial population is valid where assignment allows (“if available”, Not Detected, “if possible”). | EP-018; FR-007; FR-013; FR-018 |
| INV-011 | The domain does not include remediation actions that modify the Storefront. | EP-012; Vision §4 |
| INV-012 | Operator is an internal Sales/Support actor, not the merchant end customer. | FR-023; C-013 |

---

## 6. Domain States

Conceptual states only—not runtime state machines.

### 6.1 Investigation

| State | Meaning |
|---|---|
| **Not Started** | No Investigation bound to the Storefront yet |
| **In Progress** | Evidence/conclusions being formed (conceptual) |
| **Completed** | Diagnostic Report prepared with all obligated questions addressed to the extent possible |
| **Completed Partial** | Diagnostic Report prepared with allowed incompleteness (unavailable theme, Not Detected, Open Unknowns affecting some answers) |
| **Not Applicable** | Reserved conceptually if context is not a Shopify storefront—behavior Unspecified (U-008 Open) |

### 6.2 Detection Result (outcome)

| State | Meaning |
|---|---|
| **Detected** | Confident affirmative conclusion for the assessed question |
| **Not Detected** | Required outcome when FlexyPe product installation cannot be determined confidently (FR-013); breadth beyond products is U-003 |
| **Absent / Not Present** | Confident negative conclusion—**only if** later architecture can justify it without inventing assignment text; assignment emphasizes Not Detected for insufficient confidence, not a general “Absent” mandate |
| **Disabled** | Integration appears present but disabled/commented (Part 3) |
| **Unknown** | Conclusion blocked or undefined because a Domain Unknown applies (e.g., feature enumeration) |
| **Not Applicable** | Question does not apply in context (use sparingly; do not invent) |
| **Available / Unavailable** | For Theme Name-like availability (“if available”) |

> Note: “Absent / Not Present” is listed to prevent later docs from inventing it silently; it is **not** an assignment-mandated product outcome. Prefer **Not Detected** where FR-013 applies.

### 6.3 Disabled Integration

| State | Meaning |
|---|---|
| **Live** | Integration appears active (contrast entity; may fold into Detected product presence) |
| **Disabled** | Appears to exist but disabled/commented/hidden per Part 3 examples |
| **Unknown** | Cannot classify disabled vs live from available Evidence |

### 6.4 Product Configuration (optional)

| State | Meaning |
|---|---|
| **Not In Scope** | Bonus not pursued |
| **Unavailable** | Bonus pursued but configuration not obtainable (U-006) |
| **Available** | Readable configuration present for operator inspection |

---

## 7. Domain Events

Conceptual moments in the domain narrative—not an event bus.

| Event | Meaning | Typical resulting concepts |
|---|---|---|
| **Investigation Initiated** | Operator begins inspection of current Storefront | Investigation In Progress |
| **Store Information Observed** | Part 1 fields recognized from public signals | Store Information (possibly partial) |
| **Evidence Discovered** | Observable fact noted under an Evidence Signal Class | Evidence |
| **Detection Evaluated** | A Detection Result outcome assigned | Detection Result state |
| **Disabled Integration Identified** | Part 3 conclusion formed | Disabled Integration |
| **Unknown Identified** | Assignment silence recognized as affecting a conclusion | Domain Unknown remains Open |
| **Diagnostic Report Prepared** | Outcomes assembled for operator consumption | Diagnostic Report |
| **Optional Configuration Attached** | Bonus configuration associated (only if pursued) | Product Configuration Available/Unavailable |

No ordering algorithm, messaging, or delivery mechanism is specified.

---

## 8. Domain Constraints

Domain-level effects of selected requirement constraints (not a full restatement of §5 Constraints matrix):

| Constraint | Domain effect |
|---|---|
| **C-001** Chrome Extension | Delivery vehicle is outside domain entities; domain assumes Operator consumes Diagnostic Report via that vehicle |
| **C-002** Current storefront | Investigation↔Storefront cardinality (INV-001) |
| **C-003** Public evidence | Evidence and Store Information draw from public Storefront only for core |
| **C-004 / C-005** Multi-signal / no single selector | Detection Result for FlexyPe Products must be multi-signal in nature (INV-009) |
| **C-006 / C-007** Browser-only / no backend core | Product Configuration cannot be required for core entities’ completion |
| **C-008** Backend only for bonus | Product Configuration is the sole domain concept allowed to imply backend |
| **C-011** Closed product set | FlexyPe Product catalog fixed (INV-007) |
| **C-013** Internal tool | Operator definition (INV-012) |

---

## 9. Domain Unknowns

Carried forward from Requirements / Traceability. **All remain Open.** This section explains modeling impact only.

| ID | Description | Domain modeling impact |
|---|---|---|
| **U-001** | Storefront features undefined/unenumerated | Storefront Feature entity exists as a concept; no feature catalog is defined; Detection Result may be Unknown |
| **U-002** | Third-party app detection method/signals unknown | Third-party App entity exists; Evidence Signal Class set for apps is not defined here |
| **U-003** | Not Detected breadth beyond products | Detection Result state Not Detected is mandatory for FlexyPe Products; applicability to other entities is Open |
| **U-004** | Current Page enum exhaustiveness | Current Page uses assignment-listed kinds without claiming closed world |
| **U-005** | Part 3 explanation depth | Disabled Integration may carry optional explanation intent; depth unspecified |
| **U-006** | Bonus API nature | Product Configuration source/shape unspecified; entity remains optional |
| **U-007** | Permission/CSP limits | May limit obtainable Evidence; does not remove Evidence Signal Classes from the catalog |
| **U-008** | Non-Shopify page empty/error state | Investigation Not Applicable behavior unspecified |
| **U-009** | SPA navigation without reload | Whether Investigation must refresh mid-navigation is unspecified; domain still one Storefront target per Investigation |
| **U-010** | Performance budgets | No performance attributes on domain entities |

---

## 10. Domain Glossary

Canonical vocabulary. Downstream documents must use these meanings.

| Term | Definition |
|---|---|
| **Operator** | FlexyPe Sales or Support user of the diagnostics tool |
| **Investigation** | Unit of diagnostic work targeting one Storefront |
| **Storefront** | Shopify storefront context under inspection |
| **Store Information** | Part 1 field bundle describing the Storefront |
| **Current Page** | Page-kind facet (Home / Product / Collection / Cart listed; exhaustiveness Unknown) |
| **Theme** | Shopify theme in use; Theme Name when available |
| **FlexyPe Product** | Checkout, FlexyPass, or FlexyCart |
| **Integration** | FlexyPe integration presence on a Storefront |
| **Disabled Integration** | Integration that appears to exist but is disabled/commented/hidden |
| **Third-party App** | Non-FlexyPe app presence question on a Storefront |
| **Storefront Feature** | Feature-availability question on a Storefront (enumeration Unknown) |
| **Evidence** | Observable public storefront fact used to support conclusions |
| **Evidence Signal Class** | Assignment-listed category of public signal for product detection |
| **Detection Result** | Concluded assessment for an investigatory question |
| **Diagnostic Report** | Operator-facing set of Store Information + Detection Results for one Investigation |
| **Product Configuration** | Optional bonus configuration content for a detected FlexyPe Product |
| **Domain Unknown** | Explicit assignment silence affecting modeling or conclusions |
| **Assignment Obligation Reference** | Traceability link to `FR`/`NFR`/`C`/`U` IDs |
| **Not Detected** | Required uncertain outcome for insufficient-confidence FlexyPe product installation |
| **Core path** | Investigation outcomes that must not depend on backend or Product Configuration |
| **Public storefront authority** | Principle that core Evidence comes from the open Storefront |

---

**End of Domain Model.**  
Next architecture document per Architecture Master Plan: `05_SYSTEM_ARCHITECTURE` (depends on Domain Model).
