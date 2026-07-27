# E-003 — Investigation Engine

**Status:** Active — Execution Phase  
**Document type:** Execution specification for Package P-001 (Investigation)  
**Milestone alignment:** M2 Core Domain / IC-1 / T1 / RG-M2  
**Depends on:** Frozen architecture `00`–`13`; ADR-001–ADR-006; implementation `00`–`06`; [`P-001_INVESTIGATION_SPEC.md`](../specs/P-001_INVESTIGATION_SPEC.md); [`E-001_REPOSITORY_BOOTSTRAP.md`](E-001_REPOSITORY_BOOTSTRAP.md); [`E-002_DOMAIN_MODELS.md`](E-002_DOMAIN_MODELS.md)

This execution package implements **only** P-001 Investigation ownership: Investigation Context, lifecycle, orchestration coordination, and Completion Disposition. It does **not** implement Observation, Evidence acquisition, Detection, Reporting, Presentation, Configuration, Traceability behavior, browser APIs, DOM inspection, selectors, or detection rules.

---

## 1. Purpose

Realize the Investigation Engine so that:

- One Investigation is the consistency boundary for one diagnostic episode (ADR-001)  
- One Storefront target is bound per Investigation  
- Lifecycle transitions from initiation to completion disposition are explicit  
- Collaborators are orchestrated without absorbing their ownership  
- Core success remains independent of Configuration  

---

## 2. Scope

### In scope

- `src/investigation/` implementation of P-001  
- Investigation creation, context, state management, completion  
- Orchestration interfaces (ports) for later collaborator wiring  
- Public interfaces and internal modules for P-001  
- Error boundaries and package init/shutdown  
- Tests for Investigation ownership and lifecycle  

### Out of scope

- P-002–P-008 business behavior  
- Browser/Chrome APIs, messaging, manifest logic  
- Evidence/Detection/Reporting/Presentation algorithms  
- Inventing U-008/U-009 mandatory behaviors  

---

## 3. Investigation Responsibilities

Implement only the responsibilities from P-001:

| Responsibility | E-003 realization |
|---|---|
| Establish Investigation Context (IO-001) | Create immutable InvestigationId + Storefront target binding |
| Bind one Storefront target | Reject multi-target / merge attempts |
| Initiate episode (S-001) | Transition NotStarted → InProgress; Configuration not required |
| Orchestrate collaborators | Invoke collaborator ports in pipeline order without owning their results’ meanings |
| Consume completion readiness | Accept Report/View readiness signals solely for disposition |
| Declare Completion Disposition (IO-012) | Set Completed / CompletedPartial / UnknownQualified; NotApplicable reserved (U-008) |
| Preserve consistency boundary | One Investigation → one Storefront → one Report association expectation |
| Configuration independence | No import/runtime requirement on P-007 for success |

---

## 4. Public Interfaces

Interfaces are P-001 package surfaces only—not browser APIs and not collaborator implementations.

### 4.1 InvestigationContext

| Concern | Specification |
|---|---|
| **Purpose** | Carry IO-001: Investigation identity + one Storefront target |
| **Fields (from E-002)** | `investigationId`, `storefrontTarget`, `state`, creation metadata as needed |
| **Mutability** | Identity and Storefront target immutable after creation |
| **Guarantees** | Exactly one Storefront target; no cross-store merge |

### 4.2 InvestigationCoordinator

| Concern | Specification |
|---|---|
| **Purpose** | Orchestrate one Investigation traversal via collaborator ports |
| **Operations** | `start(intent, storefrontTarget)`, `run(context)` / equivalent stage progression, `complete(context, readiness)` |
| **Must not** | Acquire Evidence, evaluate Detection, assemble Report, render Presentation, fetch Configuration |
| **Orchestration** | Calls ports in order: Observation → Evidence → Detection → Reporting → Presentation → Disposition |

### 4.3 InvestigationLifecycle

| Concern | Specification |
|---|---|
| **Purpose** | Own legal state transitions for one Investigation |
| **Operations** | `initiate`, `markInProgress`, `dispose(disposition)` |
| **Illegal** | Rebinding Storefront target on same InvestigationId; completing without disposition; skipping initiation |

### 4.4 CompletionDisposition API

| Concern | Specification |
|---|---|
| **Purpose** | Produce IO-012 from readiness + honesty rules |
| **Inputs** | Report readiness; Presentation readiness; partial/unknown signals supplied by upstream packages (as opaque readiness, not Detection ownership) |
| **Outputs** | `Completed` \| `CompletedPartial` \| `UnknownQualified` \| reserved `NotApplicable` |
| **Rules** | Do not fabricate `Completed` when incompleteness is signaled (ADR-006); do not invent U-008 behavior |

### 4.5 Collaborator ports (orchestration interfaces)

Ports are contracts Investigation depends on; implementations belong to later packages/execution specs.

| Port | Direction | Investigation may | Investigation must not |
|---|---|---|---|
| **ObservationPort** | Context → Affordance | Request affordance for this Investigation | Implement observation/DOM |
| **EvidencePort** | Affordance + Context → Normalized Evidence readiness | Request acquisition/normalization for this Investigation | Own Evidence contents/mutation |
| **DetectionPort** | Normalized Evidence + Context → Detection outputs readiness | Request evaluation for this Investigation | Implement definitions/selectors |
| **ReportingPort** | Detection outputs → Report readiness | Request assembly for this Investigation | Assemble/recollect Evidence |
| **PresentationPort** | Report → View readiness | Request presentation preparation | Render UI / evaluate Evidence |

At E-003, ports may be stubbed/faked in tests; real collaborators are out of scope.

### 4.6 Package initialization / shutdown

| Operation | Specification |
|---|---|
| **initialize** | Register/construct coordinator + lifecycle services; no Configuration required |
| **shutdown** | Release in-memory Investigation episode resources; do not mutate Storefront; do not persist invented architecture |

---

## 5. Internal Modules

Suggested module layout under `src/investigation/` (ownership only—not a new package model):

| Module | Responsibility |
|---|---|
| `context` | InvestigationContext creation/validation (one Storefront) |
| `lifecycle` | State machine transitions (Domain §6.1) |
| `coordinator` | Orchestration over ports |
| `disposition` | CompletionDisposition resolution |
| `errors` | Investigation-owned error types / boundaries |
| `index` / public barrel | Minimal public exports |

**Forbidden inside these modules:** Evidence parsing, Detection fusion, Report composition, UI, browser DOM, Configuration clients.

Domain contracts from E-002 (InvestigationId, InvestigationState, CompletionDisposition, Storefront Target) are imported/owned per E-002 ownership rules.

---

## 6. Investigation Lifecycle

Preserve Domain / Pipeline semantics—no redesign.

```
NotStarted
  --start/initiate--> InProgress          (S-001)
        |  orchestrate ports:
        |  Observation → Evidence → Detection → Reporting → Presentation
  --complete/dispose--> Completed
                     | CompletedPartial
                     | UnknownQualified
                     | NotApplicable (reserved; U-008 Open—no mandated path)
```

### Lifecycle rules

1. **One Investigation per execution episode** for a given coordinator run (ADR-001).  
2. **Single Storefront target** bound at initiation; immutable thereafter.  
3. **Immutable Investigation identity** for the episode.  
4. **New Storefront target ⇒ new Investigation** (do not rebind).  
5. **Completion follows readiness** of Report/View signals without re-entering Evidence/Detection ownership.  
6. **Partial honesty** — prefer CompletedPartial / UnknownQualified over fabricated Completed (ADR-006).  
7. **Configuration never gates** initiation or completion success.  
8. **U-009** remains Open—no mandatory SPA auto-restart policy invented here.

---

## 7. Dependency Rules

| Rule | Requirement |
|---|---|
| **Location** | `src/investigation/` only for P-001 meaning |
| **May depend on** | E-002 Investigation-owned domain contracts; collaborator **ports** (interfaces) |
| **Must not depend on** | Configuration package for core success; Presentation/Detection/Evidence **implementations** |
| **Must not import** | Browser APIs, DOM libraries, selector engines for Investigation logic |
| **Tests** | Under `tests/investigation/`; production must not depend on tests |
| **Extension hosting** | RR-001 wiring in `extension/` may call public Investigation APIs later; E-003 must not put Detection/Evidence logic in `extension/` |

Import direction remains Investigation as orchestrator of ports—not owner of collaborator meanings.

---

## 8. Package Boundaries

| Boundary | Enforcement |
|---|---|
| **Must never own** | Evidence contents; Detection Results; Report assembly; Presentation semantics; Configuration fetch; Observation affordance meaning |
| **Orchestration ≠ ownership** | Coordinator calls ports; results’ semantic ownership stays with collaborator packages |
| **Disposition-only feedback** | Completion may read readiness; must not re-run Detection/Evidence to “fix” outcomes inside Investigation |
| **Error boundaries** | Collaborator failures surface as disposition/partial readiness inputs—not as Investigation inventing Detected/Absent |
| **No browser logic** | No DOM/network acquisition inside P-001 |

Crossing these boundaries fails E-003 / RG-M2.

---

## 9. State Management

| Concern | Specification |
|---|---|
| **Authoritative state** | InvestigationState on InvestigationContext |
| **Transitions** | Only via InvestigationLifecycle |
| **In Progress meaning** | Episode bound; collaborators may be orchestrated |
| **Terminal states** | Completed / CompletedPartial / UnknownQualified / reserved NotApplicable |
| **Failure boundaries** | Orchestration/port failures must not corrupt InvestigationId or Storefront binding; may yield CompletedPartial / UnknownQualified when honesty requires |
| **No global shared Investigation** | No cross-episode mutable singleton that merges storefronts |
| **No Evidence snapshot ownership** | Investigation must not hold mutable Normalized Evidence as its own rewriteable store |

---

## 10. Testing Obligations

Align with P-001 testing obligations and M2 gates—no Observation/Detection behavior tests here.

| Obligation | Expectation |
|---|---|
| **Creation** | start binds one InvestigationId + one Storefront target |
| **Immutability** | Storefront target / id cannot be rebound on same Investigation |
| **Lifecycle** | Legal transitions succeed; illegal transitions rejected |
| **Disposition** | CompletedPartial / UnknownQualified available; Completed not forced when incompleteness signaled |
| **Configuration independence** | Engine succeeds without Configuration module |
| **Boundary** | Investigation modules do not implement Evidence/Detection/Report/UI |
| **Orchestration** | With stub ports, coordinator invokes order Observation→…→Presentation→Disposition |
| **VD/T mapping** | Supports **VD-002** / **VD-003** / **T1** / **IC-1** / **RG-M2** |

---

## 11. Deliverables

□ `src/investigation/` modules realizing Context, Lifecycle, Coordinator, Disposition  
□ Public interfaces from §4 (including collaborator ports as interfaces/stubs)  
□ E-002 Investigation domain contracts used (not redefined conflicting meanings)  
□ Error boundary types for Investigation-owned failures  
□ Package initialize/shutdown entrypoints  
□ `tests/investigation/` covering §10  
□ No Observation/Evidence/Detection/Reporting/Presentation/Configuration business implementations  
□ Documentation comment/ownership headers noting P-001 must-never-own set  

---

## 12. Completion Criteria

□ P-001 completion criteria from Package Spec / Build Order satisfied for Investigation root  
□ ADR-001 compliance: one Investigation, one Storefront, one disposition boundary  
□ ADR-006 honesty in disposition paths  
□ No Configuration required for core success  
□ Must-never-own set respected (static review + tests)  
□ T1 ownership checks for Investigation root pass  
□ IC-1 / RG-M2 ready  
□ No browser/DOM/selector/detection logic present in `src/investigation/`  

---

## 13. Definition of Done

E-003 is done when:

1. Deliverables in §11 exist.  
2. Completion criteria in §12 are checked.  
3. Investigation Engine can create, run orchestration against stub ports, and dispose an Investigation honestly.  
4. Later execution packages can supply real Observation/Evidence/Detection/Reporting/Presentation ports without changing P-001 ownership.  
5. No redesign of Investigation semantics relative to P-001 / ADR-001 / Domain / Pipeline.

---

## 14. Conclusion

E-003 implements the Investigation Engine as the P-001 root: immutable episode identity, one Storefront target, lifecycle ownership, collaborator orchestration via ports, and honest Completion Disposition—without implementing Observation, Evidence, Detection, Reporting, Presentation, or browser logic.

---

**End of E-003 Investigation Engine.**
