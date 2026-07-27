# E-009 — Configuration Engine (Optional)

**Status:** Active — Execution Phase  
**Document type:** Execution specification for Package P-007 (Configuration, Optional)  
**Milestone alignment:** Optional bonus lane / IC-7 (never blocks M2–M7)  
**Depends on:** Frozen architecture `00`–`13`; ADR-001–ADR-006; implementation `00`–`06`; [`P-007_CONFIGURATION_SPEC.md`](../specs/P-007_CONFIGURATION_SPEC.md); [`E-001_REPOSITORY_BOOTSTRAP.md`](E-001_REPOSITORY_BOOTSTRAP.md)–[`E-008_PRESENTATION_ENGINE.md`](E-008_PRESENTATION_ENGINE.md)

This execution package implements **only** optional P-007 Configuration ownership: retrieve and normalize Product Configuration (IO-010) as an adjunct for Reporting.

**Normative slogan:** Configuration is **OPTIONAL**. Configuration enriches the Diagnostic Report. Configuration never enables or disables core Investigation.

It does **not** implement Observation, Evidence, Detection, Reporting assembly, Presentation, Traceability execution, or core Investigation logic. It does **not** invent API/backend architecture (U-006 remains Open).

---

## 1. Purpose

Realize the optional Configuration Engine so that:

- Product Configuration (IO-010) may be retrieved when bonus is pursued  
- IO-010 is normalized into an immutable configuration snapshot for adjunct attach  
- Reporting may attach Configuration without requiring it for core Report correctness (DF-INV-004; FR-026)  
- Absence or failure of Configuration never gates Investigation, Evidence, Detection, core Reporting, Presentation of core findings, or Completion  
- External source nature stays Unspecified (U-006 Open)  

---

## 2. Scope

### In scope (only if bonus elected)

- `src/configuration/` implementation of P-007  
- Configuration acquisition lifecycle and normalization  
- ProductConfiguration / ConfigurationSnapshot exposure as optional IO-010  
- Public interfaces, internal modules, error boundaries  
- Tests proving optionality, non-blocking behavior, and isolation from Evidence/Detection  

### Out of scope

- Mandatory Configuration for core path  
- Observation/Evidence/Detection/Reporting/Presentation ownership  
- Inventing concrete API endpoints, auth schemes, or backend designs as architecture  
- Mutating Diagnostic Report core fields or Detection Results  

### If bonus deferred

- No mandatory implementation beyond ensuring core packages do not require P-007  
- Explicit deferral record remains valid (P-007 / Acceptance Checklist)

---

## 3. Configuration Responsibilities

Implement only P-007 responsibilities (when pursued):

| Responsibility | E-009 realization |
|---|---|
| Own Product Configuration (IO-010) | Produce optional configuration representation for detected FlexyPe Products |
| Optional retrieval | Retrieve via ConfigurationRetriever when pursued; source nature U-006 Open |
| Consume Detection hints only | Read which products were Detected—do not own or alter Detection Results |
| Normalize configuration | Deterministic normalization into ConfigurationSnapshot |
| Supply adjunct to Reporting only | Expose IO-010 for Reporting attach; do not assemble Diagnostic Report |
| Preserve provenance | Keep source/provenance metadata without claiming Evidence authority |
| Remain non-blocking | Absence/failure → graceful empty/unavailable; core path continues |
| Remain Evidence-isolated | Never source or contaminate Evidence |
| Remain Detection-isolated | Never influence evaluation outcomes |
| Remain Presentation-isolated | Do not fetch for Presentation; Presentation displays only if already in Report |

---

## 4. Public Interfaces

### 4.1 ConfigurationEngine

| Concern | Specification |
|---|---|
| **Purpose** | Optional entry point for configuration session |
| **Operations** | `tryLoad(context, detectedProductHints) → ConfigurationSnapshot \| Unavailable \| NotInScope` |
| **Must not** | Gate Investigation; call Evidence/Detection evaluation; assemble Report; render UI |

### 4.2 ConfigurationRetriever

| Concern | Specification |
|---|---|
| **Purpose** | Retrieve raw configuration material from optional external source |
| **Contract** | Port/adapter boundary; concrete transport Unspecified (U-006) |
| **Failure mode** | Errors map to Unavailable—never to core Investigation failure |

### 4.3 ProductConfiguration / ConfigurationSnapshot

| Concern | Specification |
|---|---|
| **Purpose** | Realize IO-010 as immutable adjunct snapshot after normalization |
| **State enum** | NotInScope / Unavailable / Available (E-002 / Domain §6.4) |
| **Consumers** | Reporting only as optional adjunct input |

### 4.4 ConfigurationNormalizer

| Concern | Specification |
|---|---|
| **Purpose** | Deterministically normalize retrieved material into ConfigurationSnapshot |
| **Must not** | Invent Detection outcomes or Evidence facts; rewrite Report core |

### 4.5 ConfigurationMetadata

| Concern | Specification |
|---|---|
| **Purpose** | Provenance/metadata for optional configuration (source kind opaque, timestamps as needed) |
| **Must not** | Encode Admin/backend as required core Evidence authority |

### 4.6 ConfigurationSession / init / shutdown

| Operation | Specification |
|---|---|
| **open session** | Optional; bind InvestigationId + detected-product hints |
| **retrieve → normalize → freeze snapshot** | Adjunct path only |
| **initialize / shutdown** | Safe no-op when deferred; never required by core engines |

---

## 5. Internal Modules

Suggested layout under `src/configuration/` (present when pursued):

| Module | Responsibility |
|---|---|
| `engine` | ConfigurationEngine |
| `retriever` | ConfigurationRetriever port + adapters (delivery detail; not architecture) |
| `normalizer` | ConfigurationNormalizer |
| `snapshot` | ProductConfiguration / ConfigurationSnapshot |
| `metadata` | ConfigurationMetadata / provenance |
| `session` | ConfigurationSession lifecycle |
| `errors` | Non-blocking Unavailable mapping |
| `index` | Minimal public exports |

**Forbidden:** Evidence collectors, Detection evaluators, Report assemblers, Presentation fetchers, Observation/browser core paths.

---

## 6. Configuration Lifecycle

Optional adjunct into Reporting only (Pipeline non-mandatory):

```
Core path (always independent):
S-001 … S-006 → S-007 core Report → S-008 → S-009

Optional adjunct (non-blocking):
Detected product hints (from Detection outputs)
  → tryLoad Configuration
  → normalize → immutable ConfigurationSnapshot (IO-010)
  → Reporting may attach adjunct (E-007)
  → Presentation may display if present in Report (E-008)
```

### Lifecycle rules

1. Never inserts a mandatory stage before S-001–S-006 success.  
2. Never participates in Observation, Evidence, Detection, Report assembly ownership, or Presentation fetching.  
3. Failure/absence never blocks Investigation completion.  
4. Core investigation succeeds with IO-010 absent.  
5. Electing P-007 must not retroactively make P-001–P-006 depend on Configuration.  
6. U-006 remains Open—no API/backend invention as frozen architecture.

---

## 7. Configuration Retrieval Rules

| Rule | Requirement |
|---|---|
| **Optional retrieval** | Invoked only when bonus pursued and engine enabled |
| **Detection hints only** | May use Detected product identities as retrieval keys/hints |
| **No Detection ownership** | Must not recompute or alter DetectionResult outcomes |
| **Graceful failure** | Transport/source errors → Unavailable (or equivalent), not thrown into core path |
| **No Evidence path** | Retrieved material is never written into Evidence/NormalizedEvidence |
| **Provenance** | Preserve opaque provenance; do not claim public Storefront Evidence authority |
| **U-006 honesty** | Do not document invented endpoint contracts as architectural requirements |

---

## 8. Optionality Rules

Preserve Configuration optionality, core independence, and **DF-INV-004**:

| Rule | Requirement |
|---|---|
| **Optional retrieval** | Core runtime completes when Configuration unavailable |
| **Graceful absence** | NotInScope (deferred) and Unavailable (pursued but missing) are valid |
| **Deterministic normalization** | Same retrieved material ⇒ same ConfigurationSnapshot |
| **Immutable snapshot** | After normalization, ConfigurationSnapshot is read-only adjunct |
| **Adjunct attachment only** | Reporting attaches IO-010 without gating core Report fields |
| **No core mutation** | Configuration must not modify Diagnostic Report core Detection/Store Information meanings |
| **No gating** | Investigation/Evidence/Detection/Presentation core success must not await Configuration |
| **FR-026 / EP-011** | Bonus isolation enforced in APIs and wiring |

---

## 9. Dependency Rules

| Rule | Requirement |
|---|---|
| **May read** | Detection outcome hints (Detected products) |
| **Produces for** | Reporting adjunct input only (`configuration → reporting`) |
| **Location** | `src/configuration/` when pursued |
| **Must not be required by** | Investigation, Observation, Evidence, Detection, Presentation (core) |
| **Forbidden edges** | Configuration → Evidence; Configuration required by Coordinator/Evidence/Detection |
| **Runtime hosting** | RR-007 Optional Configuration Runtime outside core chain (EXT-INV-005; EXT-INV-008) |
| **Tests** | `tests/configuration/`; must include core-path independence proofs |

---

## 10. Package Boundaries

| Boundary | Enforcement |
|---|---|
| Configuration vs Investigation | Never gates start/complete |
| Configuration vs Evidence | Never sources/contaminates Evidence |
| Configuration vs Detection | Never influences evaluation |
| Configuration vs Reporting | Adjunct attach only; Reporting owns assembly |
| Configuration vs Presentation | No fetch; display only if already in Report |
| Error boundary | Retrieval failures stay local as Unavailable |

Crossing into core ownership or gating fails E-009 / IC-7.

---

## 11. Testing Obligations

| Obligation | Expectation |
|---|---|
| **Core without Configuration** | Investigation→…→Presentation fixtures succeed with Configuration absent |
| **Unavailable path** | Retriever failure yields Unavailable; does not fail core engines |
| **NotInScope path** | Deferred mode exposes NotInScope; core unaffected |
| **No Evidence contamination** | No writes into Evidence/NormalizedEvidence |
| **No Detection influence** | DetectionResultSet unchanged by Configuration load |
| **Adjunct-only attach** | Reporting can attach Available snapshot without requiring it |
| **Immutability** | ConfigurationSnapshot readonly after normalize |
| **Determinism** | Same retrieved material ⇒ same snapshot |
| **VD/T mapping** | **VD-006/VD-008** optional lane; **IC-7**; must not delay M2–M7 |

---

## 12. Deliverables

**If deferred:**

□ Explicit deferral record; no core dependency on `src/configuration/`  

**If pursued:**

□ `src/configuration/` modules: engine, retriever port, normalizer, snapshot, metadata, session, errors  
□ ProductConfiguration / ConfigurationSnapshot aligned with E-002  
□ Non-blocking Unavailable/NotInScope paths  
□ Reporting adjunct supply contract (no Report assembly here)  
□ `tests/configuration/` covering §11  
□ No Observation/Evidence/Detection/Reporting/Presentation core logic  

---

## 13. Completion Criteria

□ P-007 completion criteria satisfied for elected path (pursue or defer)  
□ DF-INV-004 / FR-026 / EP-011 hold  
□ Configuration never gates Investigation or core Report  
□ Evidence and Detection remain uncontaminated and independent  
□ U-006 remains Open (no invented API architecture)  
□ IC-7 satisfiable without failing core gates  

---

## 14. Definition of Done

E-009 is done when:

1. Pursue/defer decision is explicit.  
2. If deferred: core independence is demonstrated.  
3. If pursued: deliverables in §12 exist and §13 criteria are checked.  
4. Configuration Engine can optionally produce an immutable IO-010 snapshot without affecting core Investigation success.  
5. No Observation/Evidence/Detection/Reporting/Presentation ownership was absorbed.  
6. Ownership matches P-007 / RR-007 / Data Flow IO-010 without redesign.

---

## 15. Conclusion

E-009 implements the optional Configuration Engine as P-007: non-blocking retrieval and normalization of Product Configuration for Reporting adjunct attachment only. Core diagnostics succeed when Configuration is absent, unavailable, or deferred.

---

**End of E-009 Configuration Engine.**
