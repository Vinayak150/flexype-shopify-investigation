# E-002 — Domain Models

**Status:** Active — Execution Phase  
**Document type:** Execution specification (shared domain data contracts only—no runtime behavior)  
**Depends on:** Frozen architecture `00`–`13`; ADR-001–ADR-006; implementation `00`–`06`; package specs `P-001`–`P-008`; [`E-001_REPOSITORY_BOOTSTRAP.md`](E-001_REPOSITORY_BOOTSTRAP.md)  
**Especially derives from:** `04_DOMAIN_MODEL`; `08_DATA_FLOW`; `09_PACKAGE_ARCHITECTURE`; Coding Standards; Repository Structure

This execution package establishes every shared domain model (type-only contracts) used throughout the system while preserving frozen ownership. It does **not** implement Investigation workflow, Observation, Evidence acquisition, Detection algorithms, Reporting, Presentation, Configuration retrieval, Traceability logic, browser APIs, or runtime execution.

---

## 1. Purpose

Provide immutable, type-only Domain and Information Object contracts so later packages share one vocabulary and stable shapes—without embedding behavior, evaluation, or orchestration.

---

## 2. Scope

### In scope

- Shared TypeScript domain contracts derived from Domain entities `D-*` and Data Flow objects `IO-*`  
- Identifiers, enumerations, and value-object shapes  
- Serialization and validation **boundaries** (structural only)  
- Package ownership of each contract  
- Dependency and testing obligations for contracts  

### Out of scope

- Workflow, acquisition, evaluation, assembly, presentation, or configuration behavior  
- Algorithms, scoring, selectors, browser APIs  
- Mutable business state stores or orchestration services  
- Inventing catalogs for Open Unknowns (U-001, U-002, etc.)  
- New top-level `src/` packages beyond Repository Structure  

---

## 3. Domain Model Principles

Derived from Domain Model, ADRs, and Coding Standards—not new architecture:

| Principle | Meaning |
|---|---|
| **Architecture vocabulary first** | Names and meanings match Domain Model; do not rename Detected / Not Detected / Unknown |
| **Data contracts only** | Types carry shape and meaning; no methods that evaluate, acquire, or orchestrate |
| **Ownership preserved** | Each contract lives in the owning package region for its `IO-*` / primary `D-*` |
| **Immutability by default** | Prefer readonly value-object semantics; Normalized Evidence contracts are immutable (ADR-002) |
| **Deterministic serialization** | Stable field names/enums for cross-package handoff |
| **Unknown honesty** | Open Unknowns remain representable; do not invent closed catalogs |
| **Optional isolation** | Product Configuration contracts are optional; core contracts must not require them |
| **No false certainty enums** | Prefer Not Detected where FR-013 applies; do not elevate Absent as mandated product outcome |
| **Import direction** | Downstream may import upstream contract types only along approved dependency direction |

---

## 4. Shared Types

Shared types are TypeScript type-only modules (interfaces/types/readonly structures). They correspond to approved Domain entities and Information Objects.

### 4.1 Domain entities → contract families

| Domain entity | Contract family (type-only) | Notes |
|---|---|---|
| D-001 Operator | Operator identity reference (minimal) | Not merchant customer (INV-012) |
| D-002 Investigation | Investigation; Investigation state | One Storefront target (INV-001) |
| D-003 Storefront | Storefront target reference | Public evidence authority concept |
| D-004 Store Information | Store Information fields | Part 1 bundle; may be partial |
| D-005 Current Page | Current Page kind | Assignment-listed kinds; exhaustiveness Open (U-004) |
| D-006 Theme | Theme name availability | Available / Unavailable |
| D-007 FlexyPe Product | Closed product catalog | Checkout, FlexyPass, FlexyCart only (INV-007) |
| D-008 / D-009 Integration / Disabled Integration | Integration / disabled-form kinds | Part 3; no invented catalogs |
| D-010 Third-party App | Third-party App placeholder concept | Method Unknown (U-002)—no signal catalog invented |
| D-011 Storefront Feature | Storefront Feature placeholder concept | Definition Unknown (U-001)—no feature catalog invented |
| D-012 Evidence | Evidence | Observable facts; not conclusions |
| D-013 Evidence Signal Class | Signal class categories | Collection categories—not Detection fusion |
| D-014 Detection Result | Detection Result | Outcome + subject reference |
| D-015 Diagnostic Report | Diagnostic Report | One per Investigation |
| D-016 Product Configuration | Product Configuration | Optional (INV-008) |
| D-017 Domain Unknown | Domain Unknown / Unknown Qualification linkage | Explicit Open `U-*` |
| D-018 Assignment Obligation Reference | Obligation reference | Traceability vocabulary |

### 4.2 Information Objects → contract families

| IO | Contract family | Producing / owning package |
|---|---|---|
| IO-001 Investigation Context | Investigation Context | P-001 |
| IO-002 Observation Affordance | Observation Affordance | P-002 |
| IO-003 Store Information | Store Information | P-004 |
| IO-004 Evidence | Evidence | P-003 |
| IO-005 Normalized Evidence | Normalized Evidence (immutable) | P-003 |
| IO-006 Evaluation Agenda | Evaluation Agenda | P-004 |
| IO-007 Detection Result Set | Detection Result Set | P-004 |
| IO-008 Unknown Qualification | Unknown Qualification | P-004 (emission); preserved thereafter |
| IO-009 Diagnostic Report | Diagnostic Report | P-005 |
| IO-010 Product Configuration | Product Configuration | P-007 |
| IO-011 Presentation-ready View | Presentation-ready View | P-006 |
| IO-012 Completion Disposition | Completion Disposition | P-001 |

No behavior is attached to these contracts in E-002.

---

## 5. Value Objects

Implement as immutable value-object shapes (readonly fields; no mutating methods).

| Value object | Meaning | Immutability |
|---|---|---|
| **Investigation Context** | Episode binding + one Storefront target | Immutable identity fields after creation |
| **Storefront Target** | Reference to the Investigation’s single Storefront context | Immutable for the Investigation |
| **Store Information** | Part 1 field bundle (URL, shop name, currency, country, locale, Shopify domain, theme name if available, current page) | Partial fields allowed; meanings stable |
| **Evidence Item** | One observable public fact (+ signal class association) | Must not represent invented facts |
| **Normalized Evidence** | Evaluation-ready Evidence set for one Investigation | **Immutable after normalization** (ADR-002) |
| **Evaluation Agenda Item** | One investigatory question (including Unknown-qualified items) | Retain Unknown-qualified items |
| **Detection Result** | Outcome for one agenda/subject item | Outcome enum stable; no rewrite by Presentation |
| **Unknown Qualification** | Marker linking an item to Open `U-*` | Must not be stripped for convenience |
| **Diagnostic Report** | Assembled Store Information + Detection Results (+ optional Configuration) | Core content independent of Configuration |
| **Presentation-ready View** | Operator-facing projection carrier of Report | Must not alter Detection meanings |
| **Product Configuration** | Optional adjunct for detected products | Optional; absence valid |
| **Assignment Obligation Reference** | Link to FR/NFR/C/U/EP/ADR identifiers | Governance vocabulary |

Value objects must not embed acquisition, evaluation, or rendering functions.

---

## 6. Identifiers

| Identifier | Purpose | Rules |
|---|---|---|
| **InvestigationId** | Unique Investigation episode identity | Opaque stable id; one Storefront target per id (ADR-001) |
| **EvidenceItemId** | Identity of an Evidence item within an Investigation | Scoped to Investigation; not global shared pool |
| **DetectionResultId** | Identity of a Detection Result within an Investigation | Scoped to Investigation |
| **AgendaItemId** | Identity of an Evaluation Agenda item | Retained even when Unknown-qualified |
| **ObligationId** | Assignment obligation reference (e.g., FR-013) | Must match registry strings; do not invent IDs |
| **DomainUnknownId** | Open Unknown identifier (`U-001`…`U-010`) | Only approved Unknown IDs; do not close by inventing new meanings |

Identifiers are immutable once assigned for an Investigation episode.

---

## 7. Enumerations

Enumerations must match Domain states. Do not invent additional architectural outcomes.

### 7.1 Investigation / Completion

| Enum | Members (approved) |
|---|---|
| **InvestigationState** | NotStarted; InProgress; Completed; CompletedPartial; NotApplicable (reserved; U-008 Open—no mandated behavior) |
| **CompletionDisposition** | Completed; CompletedPartial; UnknownQualified; NotApplicable (reserved under U-008) |

### 7.2 Detection / availability outcomes

| Enum | Members (approved) |
|---|---|
| **DetectionOutcome** | Detected; NotDetected; Disabled; Unknown; NotApplicable; Available; Unavailable |
| **AbsentNote** | Absent/NotPresent may exist only as a non-mandated placeholder if needed for typing honesty—**must not** be used as the FlexyPe product insufficient-confidence outcome (prefer NotDetected per FR-013 / Domain note) |
| **DisabledIntegrationState** | Live; Disabled; Unknown |
| **ProductConfigurationState** | NotInScope; Unavailable; Available |
| **ThemeAvailability** | Available; Unavailable |

### 7.3 Closed / constrained catalogs

| Enum / catalog | Members | Constraint |
|---|---|---|
| **FlexyPeProductId** | Checkout; FlexyPass; FlexyCart | Closed set (C-011; INV-007)—no additional products |
| **CurrentPageKind** | Home; Product; Collection; Cart | Assignment-listed; exhaustiveness Open (U-004)—do not claim closed world beyond listed kinds |
| **EvidenceSignalClass** | Categories as defined by Detection Strategy / Domain for collection | Do not invent app/feature signal catalogs that close U-001/U-002 |

### 7.4 Presentation section keys (organization only)

| Enum | Members |
|---|---|
| **PresentationSectionId** | PS-001 … PS-009 keys as named in UI Architecture | Organization identifiers only—not UI widgets |

---

## 8. Serialization Rules

| Rule | Requirement |
|---|---|
| **Stable names** | Serialized field/enum names remain stable across package handoffs |
| **Enum literals** | Use explicit approved member names (e.g., `NotDetected`, not booleans collapsing outcomes) |
| **Partial objects** | Missing optional/partial fields are allowed where Domain permits (“if available”, partial Evidence) |
| **No invented facts** | Serialization must not invent Evidence or Detection outcomes |
| **Normalized Evidence** | Treat as read-only after handoff; consumers must not deserialize-mutate-reserialize to rewrite meanings (ADR-002) |
| **Unknown Qualifications** | Must survive serialize/deserialize without being dropped |
| **Configuration optional** | Core Report serialization must succeed without Product Configuration |
| **No behavior payloads** | Do not serialize functions, browser handles, or live Storefront bindings as Domain contracts |

E-002 defines rules only—not a wire protocol architecture redesign.

---

## 9. Validation Rules

Validation at E-002 is **structural contract validation only**—not Detection evaluation.

| Boundary | Structural rule |
|---|---|
| Investigation | Exactly one Storefront target reference per InvestigationId |
| FlexyPe products | Only Checkout / FlexyPass / FlexyCart members allowed |
| DetectionOutcome | Must be an approved enum member; product insufficient confidence must be expressible as NotDetected |
| Normalized Evidence | Consumer-facing type is readonly; no required mutable fields |
| Unknown Qualification | If present, DomainUnknownId must be one of U-001–U-010 (or explicitly approved later IDs via Traceability—not invented here) |
| Diagnostic Report | May omit Product Configuration; must be able to carry Store Information + Detection Results |
| Presentation-ready View | Must reference Report content without alternate Detection outcome fields that disagree with Report |
| Product Configuration | Optional; must not be required by core Investigation/Evidence/Detection contracts |
| No Admin authority fields | Core Evidence/Store Information contracts must not require Admin/backend authority markers as mandatory |

Do not implement confidence scoring, multi-signal fusion, or acquisition validation in E-002.

---

## 10. Package Ownership

No new top-level package is introduced. Type-only modules are colocated with owning package directories from Repository Structure / Package Architecture:

| Owning package | Directory | Contracts owned (type-only modules) |
|---|---|---|
| P-001 Investigation | `src/investigation/` | InvestigationId; InvestigationState; Investigation Context; CompletionDisposition; Storefront Target reference |
| P-002 Observation | `src/observation/` | Observation Affordance |
| P-003 Evidence | `src/evidence/` | Evidence; EvidenceItemId; EvidenceSignalClass; Normalized Evidence (immutable) |
| P-004 Detection | `src/detection/` | Store Information; CurrentPageKind; ThemeAvailability; FlexyPeProductId; Evaluation Agenda; DetectionResult; DetectionOutcome; Detection Result Set; Unknown Qualification; DomainUnknownId; DisabledIntegrationState |
| P-005 Reporting | `src/reporting/` | Diagnostic Report |
| P-006 Presentation | `src/presentation/` | Presentation-ready View; PresentationSectionId |
| P-007 Configuration | `src/configuration/` | Product Configuration; ProductConfigurationState |
| P-008 Traceability | `src/traceability/` | Assignment Obligation Reference; ObligationId |

**Re-export discipline:** Downstream packages import types from upstream owners along allowed dependency direction. Do not duplicate conflicting enum definitions across packages.

---

## 11. Dependency Rules

| Rule | Requirement |
|---|---|
| **Type-only at E-002** | Domain modules export types/consts for enums—no runtime orchestration |
| **Direction** | `investigation → observation → evidence → detection → reporting → presentation` |
| **Configuration** | `configuration → reporting` adjunct types only; core contracts must not import Configuration as required |
| **Traceability** | May reference obligation IDs used by other contracts; runtime packages must not depend on Traceability for execution |
| **Forbidden** | Presentation importing Evidence/Detection contracts for evaluation; Reporting importing Evidence for recollection types-as-behavior |
| **Tests** | Contract tests under `tests/<owner-package>/`; production must not depend on tests |

---

## 12. Testing Obligations

| Obligation | Mapping |
|---|---|
| Enum/catalog membership matches Domain (closed FlexyPe set; outcome enums) | Structural unit tests under owning package test paths |
| Readonly / immutability posture of Normalized Evidence contract | Type-level and/or structural tests (ADR-002) |
| Partial Report / optional Configuration typings | Core Report type does not require Configuration |
| Unknown Qualification retention in serialized shapes | Structural round-trip tests (no behavior) |
| No business behavior in domain modules | Review/static check: no acquisition/evaluation/orchestration exports |
| Alignment to later VD-002 vocabulary / ownership | Prepares T1+; does not replace VD suites |

Do not claim FR-014 empirics or Detection correctness from E-002.

---

## 13. Deliverables

□ Type-only domain contract modules under owning `src/<package>/` regions  
□ Approved enumerations and identifiers from §§6–7  
□ Immutable Normalized Evidence contract shape  
□ Diagnostic Report / Presentation-ready View / Product Configuration contracts  
□ Unknown Qualification / Obligation Reference contracts  
□ Structural tests under mirrored `tests/<package>/` paths  
□ Documentation note (brief) that Domain Model remains vocabulary SoT  
□ No workflow/acquisition/detection/reporting/presentation behavior modules  

---

## 14. Completion Criteria

□ All approved Domain/IO contract families in §§4–5 exist as type-only modules  
□ Ownership matches §10 (no new package roots)  
□ Enumerations match Domain states without inventing U-001/U-002 catalogs  
□ FlexyPe product catalog closed to three products  
□ Normalized Evidence contract is immutable/read-only for consumers  
□ Core contracts do not require Product Configuration  
□ Dependency direction preserved  
□ Structural tests pass  
□ No runtime diagnostic behavior implemented  
□ Architecture/ADRs unchanged for convenience  

---

## 15. Definition of Done

E-002 is done when:

1. Deliverables in §13 exist.  
2. Completion criteria in §14 are checked.  
3. Later packages can import shared contracts without redefining Domain meanings.  
4. No Investigation/Observation/Evidence/Detection/Reporting/Presentation/Configuration/Traceability **behavior** was implemented.  
5. ADR-002 immutability and ADR-006 representable incompleteness remain expressible in types.

---

## 16. Conclusion

E-002 establishes shared, immutable, type-only Domain and Information Object contracts colocated with approved package ownership. These contracts preserve vocabulary, outcome honesty, and Evidence immutability for later execution packages—without implementing any runtime diagnostic behavior.

---

**End of E-002 Domain Models.**
