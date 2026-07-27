# E-004 — Observation Engine

**Status:** Active — Execution Phase  
**Document type:** Execution specification for Package P-002 (Observation)  
**Milestone alignment:** M3 Evidence (Observation slice) / contributes to IC-2 / T1  
**Depends on:** Frozen architecture `00`–`13`; ADR-001–ADR-006; implementation `00`–`06`; [`P-002_OBSERVATION_SPEC.md`](../specs/P-002_OBSERVATION_SPEC.md); [`E-001_REPOSITORY_BOOTSTRAP.md`](E-001_REPOSITORY_BOOTSTRAP.md); [`E-002_DOMAIN_MODELS.md`](E-002_DOMAIN_MODELS.md); [`E-003_INVESTIGATION_ENGINE.md`](E-003_INVESTIGATION_ENGINE.md)

This execution package implements **only** P-002 Observation ownership: establish what can be observed and produce Observation Affordance for one Investigation.  

**Normative slogan:** Observation discovers **WHAT CAN BE OBSERVED**. Observation does **NOT** determine **WHAT IT MEANS**.

It does **not** implement Evidence acquisition/normalization, Detection evaluation, Reporting, Presentation, Configuration, Traceability, product detection, scoring, or business interpretation.

---

## 1. Purpose

Realize the Observation Engine so that:

- One Investigation’s Storefront target has a public Observation Affordance (IO-002)  
- Browser/document access needed to discover observability is owned here—not meaning  
- Evidence can later collect facts from the affordance without Observation classifying products  
- Incomplete reach (e.g., U-007) is recognized without Admin/backend substitution  

---

## 2. Scope

### In scope

- `src/observation/` implementation of P-002  
- Observation lifecycle and Affordance creation  
- Browser / DOM / page-metadata **abstraction interfaces** and traversal for discovery only  
- Public interfaces and internal modules  
- Error boundaries, init/shutdown  
- Tests for affordance creation and non-evaluation boundaries  

### Out of scope

- Evidence (IO-004/IO-005) collection or normalization (P-003)  
- Detection Results, Evaluation Agenda, scoring, product presence conclusions (P-004)  
- Report assembly, Presentation, Configuration fetch  
- Inventing U-001/U-002 catalogs or closing U-007/U-009 by policy invention  

---

## 3. Observation Responsibilities

Implement only P-002 responsibilities:

| Responsibility | E-004 realization |
|---|---|
| Consume Investigation Context | Accept IO-001; operate only for bound Investigation + Storefront target |
| Establish observation scope | Confirm public Storefront is the observation authority (EP-006; C-003) |
| Produce Observation Affordance (IO-002) | Emit affordance describing what can be observed for this Investigation |
| Enable Evidence acquisition | Affordance is consumable by EvidencePort/P-003—Observation does not become Evidence owner |
| Inspect / enumerate / locate / traverse | Allowed solely to discover observability |
| Honesty under limited reach | Record incompleteness; no Admin/backend fallback (U-007 Open) |
| Remain Detection-independent | Never classify, infer, evaluate, score, or detect products |
| Non-invasive | No Storefront mutation ownership (EP-012) |
| Configuration-independent | No P-007 dependency |

---

## 4. Public Interfaces

### 4.1 ObservationContext

| Concern | Specification |
|---|---|
| **Purpose** | Bind observation work to one Investigation Context / Storefront target |
| **Inputs** | Investigation Context (from P-001 / E-003) |
| **Guarantees** | No cross-Investigation or multi-Storefront observation root (ADR-001) |

### 4.2 ObservationAffordance

| Concern | Specification |
|---|---|
| **Purpose** | Realize IO-002: conceptual access handle that the Storefront is available for public observation |
| **Contents (discovery-only)** | Observability descriptors (e.g., document reachable, metadata reachable, traversal capability flags, incompleteness markers)—**not** Detection Results, **not** Normalized Evidence |
| **Mutability** | Affordance does not store Detection Results (IO-002) |
| **Non-goals** | Not a conclusion; not an Admin session |

### 4.3 ObservationCoordinator

| Concern | Specification |
|---|---|
| **Purpose** | Run observation lifecycle for one Investigation and emit Affordance |
| **Operations** | `observe(context) → ObservationAffordance` (or equivalent) |
| **Must not** | Normalize Evidence, evaluate products, assemble reports, fetch Configuration |

### 4.4 ObservationSession

| Concern | Specification |
|---|---|
| **Purpose** | Scoped session for one Investigation observation pass |
| **Lifecycle** | open → discover/traverse → emit affordance → close |
| **Alignment** | Supports single-acquisition posture: observation enables one Evidence acquisition phase (ADR-005)—does not itself own re-scan replacement of Normalized Evidence |

### 4.5 Browser abstraction interfaces

| Interface | Observation may | Observation must not |
|---|---|---|
| **BrowserAccessPort** | Read navigation/page context needed for public observation | Own Chrome lifecycle/manifest architecture redesign |
| **DocumentAccessPort** | Access document for discovery of observability | Mutate Storefront; invent Admin document authority |
| **PageMetadataPort** | Read public page metadata relevant to observability | Interpret metadata as FlexyPe Detected/Not Detected |

Concrete browser API identifiers are implementation details of these ports—not Detection architecture.

### 4.6 DOM abstraction interfaces

| Interface | Observation may | Observation must not |
|---|---|---|
| **DomTraversalPort** | Traverse/locate/enumerate nodes for **observability discovery** | Encode product definitions as architectural selectors |
| **DomQueryPort** | Locate structures to determine what *can* be observed | Score, classify, or conclude product presence |

Selectors/queries used here are **discovery mechanisms**, not architectural Detection definitions (ADR-003 remains Detection’s concern; Observation must not become definition-driven Detection).

### 4.7 Initialization / shutdown

| Operation | Specification |
|---|---|
| **initialize** | Wire browser/DOM ports for observation; no Configuration required |
| **shutdown** | End ObservationSession; release handles; do not mutate Storefront |

---

## 5. Internal Modules

Suggested layout under `src/observation/`:

| Module | Responsibility |
|---|---|
| `context` | ObservationContext binding to Investigation |
| `session` | ObservationSession lifecycle |
| `affordance` | Build IO-002 ObservationAffordance |
| `coordinator` | ObservationCoordinator orchestration |
| `browser` | BrowserAccessPort adapters (implementation detail) |
| `dom` | DomTraversalPort / DomQueryPort adapters (discovery only) |
| `errors` | Observation-owned error / incompleteness boundaries |
| `index` | Minimal public exports |

**Forbidden in these modules:** Evidence normalization, Detection evaluation, Report/UI, Configuration clients, product scoring.

E-002 Observation Affordance contracts are used; do not redefine conflicting meanings.

---

## 6. Observation Lifecycle

Align with Pipeline **S-002** after Investigation Initiation:

```
Investigation InProgress (P-001)
  → open ObservationSession
  → discover observability (browser/DOM/metadata ports)
  → emit ObservationAffordance (IO-002)
  → close ObservationSession
  → Evidence acquisition may begin (P-003; out of E-004 scope)
```

### Lifecycle rules

1. Observation is **not skipped** on the core path after Initiation (Pipeline).  
2. Scoped to one Investigation / one Storefront (ADR-001).  
3. Emits Affordance; does not emit Detection Results or Normalized Evidence.  
4. Incomplete reach → incompleteness markers on Affordance; no Admin substitute.  
5. Must not open a second Investigation-root or merge storefronts.  
6. U-009 remains Open—no mandatory SPA re-observation policy invented beyond ADR-001 new-target⇒new-Investigation.  
7. Observation must not replace Evidence’s single-acquisition snapshot ownership (ADR-005/ADR-002).

---

## 7. Browser Interaction Rules

| Rule | Requirement |
|---|---|
| **Public authority** | Only public Storefront context for core observation (EP-006; C-003) |
| **Read-oriented** | Inspect/access for discovery; do not own Storefront mutation (EP-012) |
| **No Admin fallback** | Limited permissions/CSP (U-007) ⇒ incomplete affordance, not Admin/backend |
| **No meaning** | Browser reads do not become product Detected/Not Detected conclusions |
| **No Evidence ownership** | Browser interaction here produces Affordance, not IO-004/IO-005 |
| **Episode scope** | Browser access is for the bound Investigation only |
| **Configuration** | Browser observation must not require Configuration Runtime |

---

## 8. DOM Traversal Rules

| Rule | Requirement |
|---|---|
| **Allowed verbs** | inspect, enumerate, locate, traverse |
| **Forbidden verbs** | classify, infer, evaluate, score, detect products, normalize evidence, create reports |
| **Discovery vs Detection** | Traversal may establish that regions/nodes are observable; it must not implement definition-driven Detection (ADR-003) |
| **No selector-as-architecture** | DOM paths/selectors are mechanisms for affordance discovery—not FlexyPe product architecture |
| **No Evidence warehouse** | Do not accumulate Normalized Evidence inside Observation |
| **Honesty** | Unreachable/unreadable regions → incompleteness, not fabricated observability |
| **Non-invasive** | No DOM mutation ownership for diagnostics |

---

## 9. Dependency Rules

| Rule | Requirement |
|---|---|
| **Depends on** | Investigation Context (P-001 / E-003); E-002 Observation contracts |
| **Location** | `src/observation/` |
| **Satisfies** | E-003 `ObservationPort` (real implementation replaces stubs) |
| **Must not depend on** | Detection, Reporting, Presentation, Configuration |
| **Must not own** | Evidence package imports for normalization/evaluation |
| **Runtime hosting** | RR-002 / `extension/` may host storefront-adjacent adapters; meaning stays in `src/observation/` |
| **Tests** | `tests/observation/`; production must not depend on tests |

Import direction: `investigation → observation → (later) evidence → …`

---

## 10. Package Boundaries

| Boundary | Enforcement |
|---|---|
| Observation vs Evidence | Observation emits Affordance; Evidence collects/normalizes facts |
| Observation vs Detection | No product/integration conclusions; no Evaluation Agenda |
| Observation vs Reporting/Presentation | No report/UI ownership |
| Observation vs Configuration | No config fetch; no Evidence contamination path |
| Meaning boundary | Discovery descriptors ≠ Detection Outcomes |
| Error boundary | Failures become incompleteness/affordance errors—not invented Detected/Absent |

Crossing into Evidence/Detection ownership fails E-004.

---

## 11. Testing Obligations

| Obligation | Expectation |
|---|---|
| **Context binding** | observe requires Investigation Context; rejects unbound/multi-target misuse |
| **Affordance emission** | Produces IO-002 without Detection Result fields |
| **Incompleteness** | Simulated limited reach yields incompleteness markers—not Admin fallback |
| **Non-evaluation** | Tests assert Observation modules do not export product Detected/Not Detected conclusions |
| **Non-normalization** | No Normalized Evidence production from Observation |
| **Port integration** | Satisfies Investigation ObservationPort contract with fakes for browser/DOM where needed |
| **VD/T mapping** | Supports **VD-002/VD-003/VD-004** upstream readiness; **T1**; contributes to **IC-2** with Evidence |

Do not claim FR-014 product empirics from Observation alone.

---

## 12. Deliverables

□ `src/observation/` modules: context, session, affordance, coordinator, browser/DOM ports  
□ ObservationAffordance (IO-002) implementation aligned with E-002  
□ Browser and DOM abstraction interfaces + discovery adapters  
□ Init/shutdown and error/incompleteness boundaries  
□ `tests/observation/` covering §11  
□ ObservationPort fulfillment for E-003 orchestration  
□ No Evidence/Detection/Reporting/Presentation/Configuration business logic  

---

## 13. Completion Criteria

□ P-002 completion criteria satisfied for Observation Affordance ownership  
□ Affordance enables Evidence without Observation owning Evidence/Detection  
□ Public Storefront authority preserved; no Admin/backend core substitute  
□ ADR-001 one-Storefront scope holds  
□ ADR-003 not violated by treating Observation selectors as product architecture  
□ ADR-005/ADR-002: Observation does not rewrite/replace Normalized Evidence ownership  
□ Must-never-own set respected  
□ Ready for E-005 Evidence Engine to consume Affordance toward IC-2  

---

## 14. Definition of Done

E-004 is done when:

1. Deliverables in §12 exist.  
2. Completion criteria in §13 are checked.  
3. Observation Engine can produce ObservationAffordance for a bound Investigation via discovery-only browser/DOM ports.  
4. No classification, inference, evaluation, scoring, product detection, Evidence normalization, or reporting was implemented.  
5. Ownership matches P-002 / Package Architecture / Pipeline S-002 without redesign.

---

## 15. Conclusion

E-004 implements the Observation Engine as P-002: it discovers what can be observed on the public Storefront for one Investigation and emits Observation Affordance. It owns browser/DOM discovery interaction for that purpose—and explicitly does not own meaning, Evidence, or Detection.

---

**End of E-004 Observation Engine.**
