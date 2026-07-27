# 10 — Extension Architecture

**Status:** Draft — depends on approved `09_PACKAGE_ARCHITECTURE` and upstream architecture `04`–`08`  
**Document type:** Conceptual Chrome Extension runtime realization of logical packages (not APIs, not manifest, not messaging, not files)  
**Authoritative inputs:** Architecture Master Plan; `00_PROJECT_VISION`–`09_PACKAGE_ARCHITECTURE`; Product Support Engineer Assignment (FlexyPe)

Logical packages (`P-*`), responsibilities (`R-*`), Information Objects (`IO-*`), and Domain entities are reused and not redefined.

**Runtime roles are conceptual.** They describe where ownership lives inside an extension delivery, not how browser primitives are invoked.

---

## 1. Purpose

This document maps the approved logical Package Architecture into **Chrome Extension runtime roles**—the runtime realization of logical packages for a browser-local diagnostics tool whose Operator surface is the extension popup (FR-020; C-001).

**Relationship to Package Architecture:** Each runtime role hosts one or more logical packages without changing package ownership or dependency direction.

**Relationship to System Architecture:** Runtime roles must preserve responsibility boundaries (R-001–R-010) and browser-local core constraints (EP-005).

**Relationship to UI Architecture:** UI Architecture specializes Presentation Runtime’s Operator-facing view; it must not redefine Detection or Evidence ownership.

**Relationship to Testing Strategy:** Tests may substitute runtime roles at boundaries; they must not invent ownership that contradicts this map.

This document does not define browser API calls, manifest contents, permission lists, messaging protocols, event handlers, or source layout.

---

## 2. Runtime Scope

### 2.1 Included runtime concerns

- Hosting logical packages inside extension runtime roles  
- Preserving Investigation → Observation → Evidence → Detection → Reporting → Presentation ownership in runtime form  
- Keeping core path browser-local against the open Storefront  
- Isolating optional Configuration Runtime  
- Preserving Unknown Qualifications and Not Detected semantics across runtime handoffs  

### 2.2 Excluded concerns

| Excluded | Why |
|---|---|
| Manifest schema, permission declarations, host patterns | Implementation / tooling; U-007 remains Open at architecture level |
| Message-passing protocols, ports, serialization formats | Implementation |
| Specific browser API identifiers | Implementation |
| Popup layout, styling, widgets | UI Architecture |
| Detection selectors/algorithms | Implementation under Detection Strategy |
| Backend service design for bonus | Optional; U-006 Open |
| Multi-browser runtimes beyond Chrome Extension delivery | C-001; Vision non-goals |

### 2.3 Runtime responsibilities

Runtime roles exist to **host** package ownership close to the Storefront (for observation/evidence) and close to the Operator (for presentation), while keeping evaluation and reporting free of presentation leakage.

### 2.4 Runtime boundaries

| Boundary | Meaning |
|---|---|
| **Storefront boundary** | Public page context is the authority for core Evidence (EP-006) |
| **Operator surface boundary** | Presentation Runtime prepares Diagnostic Report for popup consumption only |
| **Core vs optional boundary** | Configuration Runtime never gates core Investigation completion |
| **Ownership boundary** | A role may host a package’s owns/produces set; it may not absorb another package’s must-never-own set |

---

## 3. Runtime Roles

### RR-001 — Extension Coordinator

- **Purpose:** Runtime host for Investigation ownership and completion disposition across one Investigation.  
- **Hosts:** Investigation Package (P-001).  
- **Consumes:** Operator intent to investigate; completion inputs from Reporting/Presentation readiness (conceptual).  
- **Produces:** Investigation Context (IO-001); Completion Disposition (IO-012).  
- **Collaborates with:** Storefront Runtime, Evidence Runtime, Detection Runtime, Reporting Runtime, Presentation Runtime; must not require Optional Configuration Runtime for core success.  
- **Must never own:** Detection Result meanings; Evidence contents; Presentation-ready View semantics; Product Configuration.  
- **Non-goals:** Not defining browser lifecycle hooks; not UI composition.  
- **Authority:** P-001; R-001; C-002; PKG-INV-009.

### RR-002 — Storefront Runtime

- **Purpose:** Runtime host for public Storefront observation against the currently open storefront context.  
- **Hosts:** Observation Package (P-002).  
- **Consumes:** Investigation Context.  
- **Produces:** Observation Affordance (IO-002).  
- **Collaborates with:** Extension Coordinator (context); Evidence Runtime (downstream).  
- **Must never own:** Detection Results; Diagnostic Report; Presentation; Configuration.  
- **Non-goals:** Not privileged admin-context ownership; not evaluation.  
- **Authority:** P-002; EP-006; C-002; C-003; U-007 may limit reach without inventing fallbacks.

### RR-003 — Evidence Runtime

- **Purpose:** Runtime host for Evidence collection and normalization for one Investigation.  
- **Hosts:** Evidence Package (P-003).  
- **Consumes:** Observation Affordance; Investigation Context.  
- **Produces:** Evidence (IO-004); Normalized Evidence (IO-005) immutable for downstream roles.  
- **Collaborates with:** Storefront Runtime (upstream); Detection Runtime (downstream).  
- **Must never own:** Detection evaluation; Presentation; Configuration as Evidence source.  
- **Non-goals:** Not transport design; not selector catalogs.  
- **Authority:** P-003; DF-INV-001; DET-INV-002; FR-015.

### RR-004 — Detection Runtime

- **Purpose:** Runtime host for evaluation agenda and Domain Evaluation outcomes.  
- **Hosts:** Detection Package (P-004).  
- **Consumes:** Normalized Evidence; Investigation Context.  
- **Produces:** Evaluation Agenda (IO-006); Store Information (IO-003); Detection Result Set (IO-007); Unknown Qualifications (IO-008).  
- **Collaborates with:** Evidence Runtime (upstream); Reporting Runtime (downstream).  
- **Must never own:** Presentation-ready View; Evidence mutation; mandatory Configuration.  
- **Non-goals:** Not popup rendering; not inventing U-001/U-002 catalogs.  
- **Authority:** P-004; EP-008; EP-009; FR-013; DET-INV-004; DET-INV-005.

### RR-005 — Reporting Runtime

- **Purpose:** Runtime host for Diagnostic Report assembly.  
- **Hosts:** Reporting Package (P-005).  
- **Consumes:** Store Information; Detection Result Set; Unknown Qualifications; optional Product Configuration.  
- **Produces:** Diagnostic Report (IO-009).  
- **Collaborates with:** Detection Runtime; optionally Configuration Runtime; Presentation Runtime (downstream).  
- **Must never own:** Evidence recollection; Detection re-evaluation; Presentation mutation rights over results.  
- **Non-goals:** Not UI layout; not configuration fetching.  
- **Authority:** P-005; FR-020; FR-026; DF-INV-004.

### RR-006 — Presentation Runtime

- **Purpose:** Runtime host for preparing the Diagnostic Report for Operator consumption on the extension popup surface.  
- **Hosts:** Presentation Package (P-006).  
- **Consumes:** Diagnostic Report only.  
- **Produces:** Presentation-ready View (IO-011).  
- **Collaborates with:** Reporting Runtime (upstream); Extension Coordinator (completion acknowledgment).  
- **Must never own:** Evidence; Detection evaluation; Investigation targeting; Configuration fetching.  
- **Non-goals:** Not visual design; not browser API usage; not detection policy.  
- **Authority:** P-006; FR-020; Vision §8.2; PKG-INV-002; DF-INV-002.

### RR-007 — Optional Configuration Runtime

- **Purpose:** Runtime host for optional Product Configuration adjunct when bonus is pursued.  
- **Hosts:** Configuration Package (P-007).  
- **Consumes:** Detection outcomes indicating detected products (conceptual); optional external configuration source (U-006 Open).  
- **Produces:** Product Configuration (IO-010) for Reporting Runtime.  
- **Collaborates with:** Reporting Runtime only as adjunct supplier; may observe Detection outcomes; must not gate Coordinator/Evidence/Detection.  
- **Must never own:** Core Evidence; core Detection Results; Presentation.  
- **Non-goals:** Not core Investigation success; not defining external API contracts.  
- **Authority:** P-007; FR-025; FR-026; EP-011; C-008; U-006.

### RR-008 — Traceability Runtime

- **Purpose:** Runtime host for obligation-linkage discipline across role outputs.  
- **Hosts:** Traceability Package (P-008).  
- **Consumes:** Claims/outputs from other runtimes.  
- **Produces:** Traceability assurance for review/testing (not Operator storefront content).  
- **Collaborates with:** All roles as a non-blocking cross-cutting concern.  
- **Must never own:** Detection logic; Evidence collection; Presentation design.  
- **Non-goals:** Not replacing the Traceability Matrix document.  
- **Authority:** P-008; EP-001; EP-015.

---

## 4. Runtime Collaboration

### 4.1 Allowed collaboration (conceptual)

```
Extension Coordinator
  → Storefront Runtime
      → Evidence Runtime
          → Detection Runtime
              → Reporting Runtime
                  → Presentation Runtime
                      → Extension Coordinator (disposition only)

Optional Configuration Runtime → Reporting Runtime   [adjunct only]

Traceability Runtime ⟷ (references outputs; non-blocking)
```

### 4.2 Ownership transfer

Mirrors Data Flow / Package handoffs in runtime form:

| From | To | Object |
|---|---|---|
| Coordinator | Storefront Runtime | Investigation Context |
| Storefront Runtime | Evidence Runtime | Observation Affordance |
| Evidence Runtime | Detection Runtime | Normalized Evidence |
| Detection Runtime | Reporting Runtime | Store Information, Detection Results, Unknown Qualifications |
| Optional Configuration Runtime | Reporting Runtime | Product Configuration (optional) |
| Reporting Runtime | Presentation Runtime | Diagnostic Report |
| Presentation / Reporting | Coordinator | Inputs to Completion Disposition |

### 4.3 Forbidden collaboration

| Forbidden | Why |
|---|---|
| Presentation Runtime → Detection/Evidence Runtime (evaluation or collection) | PKG-INV-002; P-INV-003 |
| Reporting Runtime → Storefront/Evidence Runtime (recollection) | PKG-INV-003 |
| Configuration Runtime required by Coordinator/Evidence/Detection | EP-011; FR-026 |
| Evidence Runtime ← Configuration Runtime (as Evidence source) | DF-RISK-003 |
| Any runtime → Storefront mutation ownership | EP-012 |
| Detection Runtime → Presentation Runtime (skipping Reporting) | DF-INV-005 / Assembly bypass |

### 4.4 Runtime boundaries

- **Storefront Runtime / Evidence Runtime** stay on the public Storefront authority side of core observation.  
- **Detection / Reporting** remain conclusion/assembly side—no Operator UI ownership.  
- **Presentation Runtime** remains Operator-surface side—no evaluation ownership.  
- **Optional Configuration Runtime** remains outside the core chain.

### 4.5 No runtime cycles

No cyclic ownership among Coordinator → Storefront → Evidence → Detection → Reporting → Presentation. Coordinator may only close the Investigation dispositionally.

---

## 5. Runtime Principles

| ID | Principle | Authority |
|---|---|---|
| RP-001 | **Single Investigation ownership** — Coordinator owns one Investigation Context per traversal | C-002; P-INV-001; DF-INV-008 |
| RP-002 | **Observation before evaluation** — Storefront/Evidence Runtimes precede Detection Runtime | Pipeline §4; S-INV-002 |
| RP-003 | **Evidence immutability after normalization** — Downstream runtimes do not rewrite Normalized Evidence | DF-INV-001; PKG-INV-007 |
| RP-004 | **Presentation isolation** — Presentation Runtime consumes Report only | PKG-INV-002; FR-020 |
| RP-005 | **Configuration optional** — Optional Configuration Runtime never blocks core | EP-011; FR-026; PKG-INV-004 |
| RP-006 | **Traceability cross-cutting** — Traceability Runtime does not sit on the critical evaluation path as a gate | P-008; EP-015 |
| RP-007 | **No runtime cycles** in the core role chain | Package §5; Data Flow §4 |
| RP-008 | **Browser-local core** — Core roles require no backend runtime for Parts 1–3 / Objective core answers | EP-005; NFR-001; NFR-002; ADR-005 intent |
| RP-009 | **Public storefront authority** — Core Evidence originates from Storefront Runtime/Evidence Runtime, not Admin/bonus channels | EP-006; C-003 |
| RP-010 | **Unknown preservation** — Unknown Qualifications survive runtime handoffs | EP-003; DF-INV-003 |
| RP-011 | **Package ownership preserved** — Runtime hosting must not redefine P-* ownership | PKG-INV-010 |

---

## 6. Runtime Invariants

| ID | Invariant | Authority |
|---|---|---|
| EXT-INV-001 | Presentation Runtime never evaluates Evidence or invents Detection Results. | PKG-INV-002; DF-INV-002; EP-017 |
| EXT-INV-002 | Detection Runtime never owns Presentation-ready View. | P-004 must-never-own; System §4 |
| EXT-INV-003 | Evidence Runtime never mutates Normalized Evidence after handoff to Detection Runtime. | DF-INV-001; PKG-INV-007; ADR-002 intent |
| EXT-INV-004 | Extension Coordinator never owns Detection Result meanings. | P-001 must-never-own; R-001 |
| EXT-INV-005 | Optional Configuration Runtime never blocks core Reporting/Presentation of Parts 1–3 / core Objective answers. | FR-026; EP-011; S-INV-005; PKG-INV-004 |
| EXT-INV-006 | Detection Runtime emits Not Detected for insufficient-confidence FlexyPe Product presence; downstream runtimes preserve it. | FR-013; EP-009; DET-INV-005; DF-INV-006 |
| EXT-INV-007 | Detection Runtime upholds multi-signal / no-single-selector sole-basis rules for FlexyPe Products. | C-004; C-005; EP-008; PKG-INV-005; ADR-003 |
| EXT-INV-008 | Core runtime path remains free of required backend Configuration Runtime. | NFR-001; NFR-002; EP-005; C-006; C-007; ADR-005 |
| EXT-INV-009 | Unknown Qualifications are not stripped by Reporting or Presentation Runtimes. | EP-003; DF-INV-003; PKG-INV-008 |
| EXT-INV-010 | No runtime role owns Storefront mutation. | EP-012; DF-INV-009 |

---

## 7. Runtime Variation Points

| Variation | Adaptation |
|---|---|
| **Future runtime roles** | Add only with requirements/architecture authority; must preserve acyclic core chain |
| **Future FlexyPe Products** | Expand Detection Runtime agenda under C-011 change process; do not move into Presentation Runtime |
| **Bonus support** | Optional Configuration Runtime present or absent; join point remains Reporting Runtime |
| **Unknowns (U-001/U-002/U-007/U-008/U-009)** | Affect completeness and Qualifications; do not invent Admin runtime or mandatory non-Shopify runtime behavior here |
| **Testing runtime** | Test doubles may stand in for Storefront/Configuration Runtimes at boundaries without changing ownership |
| **Operator surface evolution** | UI Architecture may evolve Presentation Runtime view structure without absorbing Detection Runtime |

---

## 8. Runtime Risks

Structural risks only—no mitigations.

| ID | Risk |
|---|---|
| EXT-RISK-001 | **Role leakage** — Detection logic hosted inside Presentation Runtime |
| EXT-RISK-002 | **Runtime coupling** — Presentation depending directly on Evidence Runtime |
| EXT-RISK-003 | **Evidence contamination** — Configuration Runtime feeding Evidence Runtime |
| EXT-RISK-004 | **Presentation ownership** — Presentation Runtime assembling or rewriting Diagnostic Report truths |
| EXT-RISK-005 | **Configuration dependency** — Coordinator treating Optional Configuration Runtime as mandatory |
| EXT-RISK-006 | **API/manifest drift** — implementation inventing ownership via browser primitives that contradict this map |
| EXT-RISK-007 | **Unknown suppression** — runtime handoffs dropping Unknown Qualifications |
| EXT-RISK-008 | **Observation overreach** — Storefront Runtime assuming non-public authority to “complete” Evidence |

---

## 9. Runtime Glossary

| Term | Meaning |
|---|---|
| **Runtime Role (RR-***)** | Conceptual Chrome Extension hosting locus for one or more logical packages |
| **Hosts** | Which logical package(s) a runtime role realizes |
| **Runtime collaboration** | Allowed conceptual interaction among roles (not a messaging protocol) |
| **Runtime boundary** | Limit separating Storefront-side, evaluation/assembly-side, Operator-surface-side, and optional configuration-side concerns |
| **Extension Coordinator** | Runtime role owning Investigation Context and Completion Disposition |
| **Storefront Runtime** | Runtime role owning public Storefront observation affordance |
| **Evidence Runtime** | Runtime role owning Evidence collection and normalization |
| **Detection Runtime** | Runtime role owning agenda and Detection Results / Store Information conclusions |
| **Reporting Runtime** | Runtime role owning Diagnostic Report assembly |
| **Presentation Runtime** | Runtime role owning Presentation-ready View for the Operator popup surface |
| **Optional Configuration Runtime** | Runtime role owning Product Configuration adjunct |
| **Traceability Runtime** | Cross-cutting runtime role for obligation-linkage discipline |
| **Core runtime path** | Coordinator → Storefront → Evidence → Detection → Reporting → Presentation without required Configuration Runtime |
| **Runtime realization** | Mapping from logical packages to runtime roles without redefining ownership |

Domain entities, packages, and information objects retain prior document definitions.

---

**End of Extension Architecture.**  
Next architecture document per Architecture Master Plan: `11_UI_ARCHITECTURE` (depends on Extension Architecture).
