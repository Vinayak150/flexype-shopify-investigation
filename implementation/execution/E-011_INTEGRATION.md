# E-011 — System Integration

**Status:** Active — Execution Phase  
**Document type:** Execution specification for composing existing packages into one runtime system  
**Milestone alignment:** M7 Integration / IC-6 / T5 / RG-M7  
**Depends on:** Frozen architecture `00`–`13`; ADR-001–ADR-006; implementation `00`–`06`; package specs `P-001`–`P-008`; [`E-001_REPOSITORY_BOOTSTRAP.md`](E-001_REPOSITORY_BOOTSTRAP.md)–[`E-010_TRACEABILITY_SUPPORT.md`](E-010_TRACEABILITY_SUPPORT.md)

This execution package **wires** already-specified engines into one complete runtime collaboration path. It introduces **no** new architecture, **no** new business logic, and **no** new package ownership.

**Normative slogan:** Integration composes and connects. It does not evaluate, detect, assemble, or present.

---

## 1. Purpose

Integrate E-003–E-010 (and E-001/E-002 foundations) so that:

- One Investigation traversal runs Observation → Evidence → Detection → Reporting → Presentation → Completion  
- Runtime hosting under `extension/` preserves `src/<package>/` ownership (RR map)  
- Optional Configuration and Traceability remain non-blocking adjuncts  
- Startup/shutdown, dependency injection, and error propagation respect Data Flow and Package Architecture  
- Core path succeeds without Configuration (FR-026)  

---

## 2. Scope

### In scope

- System composition and runtime wiring in `extension/` (+ thin composition root)  
- Initialization/shutdown sequences  
- Connecting existing public ports/interfaces from E-003–E-010  
- Optional Configuration wiring and Traceability registration  
- Error propagation across package boundaries without ownership inversion  
- Integration tests for end-to-end core path  

### Out of scope

- Reimplementing Investigation/Observation/Evidence/Detection/Reporting/Presentation/Configuration/Traceability logic  
- Redefining package interfaces or inventing new packages  
- New evaluation, report generation, or presentation behavior  
- Closing Open Unknowns or inventing U-006 APIs  

---

## 3. Integration Responsibilities

| Responsibility | E-011 realization |
|---|---|
| Compose packages | Construct engines from E-003–E-010 and inject ports |
| Initialize packages | Start in approved dependency order |
| Connect interfaces | Wire ObservationPort, EvidencePort, DetectionPort, ReportingPort, PresentationPort to real engines |
| Coordinate lifecycle | InvestigationCoordinator owns episode orchestration; Integration only supplies wired collaborators |
| Optional Configuration | Wire ConfigurationEngine as adjunct supplier to Reporting only when elected |
| Traceability registration | Register TraceabilityEngine as non-blocking observer/recorder |
| Resource cleanup | Shutdown reverse order; no Storefront mutation |
| Failure propagation | Map collaborator failures to honest disposition/partial paths—not invented Detected outcomes |
| Preserve ownership | Hosting in `extension/`; meaning remains in `src/<package>/` |

Integration must **not** implement package logic, redefine interfaces, evaluate Evidence, perform Detection, assemble Reports, or generate Presentation.

---

## 4. Runtime Composition

### 4.1 Ownership vs hosting (unchanged)

| Runtime role | Hosts package | Logic home |
|---|---|---|
| RR-001 Extension Coordinator | P-001 Investigation | `src/investigation/` |
| RR-002 Storefront Runtime | P-002 Observation | `src/observation/` (+ storefront-adjacent adapters) |
| RR-003 Evidence Runtime | P-003 Evidence | `src/evidence/` |
| RR-004 Detection Runtime | P-004 Detection | `src/detection/` |
| RR-005 Reporting Runtime | P-005 Reporting | `src/reporting/` |
| RR-006 Presentation Runtime | P-006 Presentation | `src/presentation/` (+ popup shell binding of ViewModel only) |
| RR-007 Optional Configuration Runtime | P-007 (if elected) | `src/configuration/` |
| RR-008 Traceability Runtime | P-008 | `src/traceability/` (non-blocking) |

### 4.2 Dependency graph (wiring)

```
InvestigationCoordinator
  → ObservationEngine
      → EvidenceEngine
          → DetectionEngine
              → ReportingEngine
                  → PresentationEngine
                      → Investigation disposition

ConfigurationEngine (optional) → ReportingEngine   [adjunct only]

TraceabilityEngine ⟷ records artifact ids; non-blocking
```

### 4.3 Composition root

| Concern | Specification |
|---|---|
| **Location** | `extension/` composition/bootstrap modules (+ minimal root wiring) |
| **May** | Instantiate engines, inject ports/adapters, bind popup shell to PresentationView |
| **Must not** | Contain Detection definitions, Evidence normalization, Report assembly, or Observation evaluation logic |

---

## 5. Startup Sequence

Initialize in dependency order (foundations first; core chain; adjuncts last):

1. **Workspace foundations** — E-001 tooling/runtime host readiness  
2. **Domain contracts available** — E-002 types loaded/imported  
3. **Initialize TraceabilityEngine (optional early register)** — non-blocking; must not gate subsequent steps  
4. **Initialize InvestigationEngine** — coordinator + lifecycle  
5. **Initialize ObservationEngine** — browser/DOM discovery adapters for Affordance  
6. **Initialize EvidenceEngine** — collector/normalizer  
7. **Initialize DetectionEngine** — definition evaluator (consumes immutable Evidence only)  
8. **Initialize ReportingEngine** — assembler  
9. **Initialize PresentationEngine** — ViewModel projector  
10. **Initialize ConfigurationEngine (if elected)** — optional; failure must not fail startup of core  
11. **Wire ports** — InvestigationCoordinator ← real Observation/Evidence/Detection/Reporting/Presentation engines  
12. **Wire optional adjunct** — ReportingEngine accepts ConfigurationSnapshot provider only if elected  
13. **Wire Traceability recording hooks** — subscribe/record ids; never required for run  
14. **Mark runtime ready** — core path runnable without Configuration  

Startup must not require backend Configuration (EXT-INV-008).

---

## 6. Runtime Lifecycle

One Investigation episode (Pipeline S-001–S-009) after startup:

```
Operator intent
  → Investigation.start (S-001)
  → Observation.observe → Affordance (S-002)
  → Evidence.collect+normalize → immutable NormalizedEvidence (S-003–S-004)
  → Detection.evaluate → Store Information + Results + Unknowns (S-005–S-006)
  → [optional] Configuration.tryLoad → IO-010 Unavailable/Available/NotInScope
  → Reporting.assemble(+ optional IO-010) → DiagnosticReport (S-007)
  → Presentation.present → PresentationView (S-008)
  → Investigation.complete disposition (S-009)
  → Traceability.record/export (non-blocking, anytime-safe)
```

### Lifecycle rules

1. One Investigation / one Storefront / one Report / one View projection (ADR-001).  
2. Detection consumes immutable snapshot only (ADR-002; ADR-005).  
3. No package ownership merge during wiring.  
4. Configuration absence does not skip or fail S-007 core assembly (DF-INV-004).  
5. Presentation projects Report only; popup shell may render ViewModel without re-detecting.  
6. Traceability never alters outcomes.  
7. U-009 remains Open—no invented auto-rescan integration policy beyond new Investigation for new target.

---

## 7. Shutdown Sequence

Shutdown in reverse dependency order (adjuncts first or interleaved safely; core reverse):

1. Stop accepting new Investigations  
2. End active Investigation sessions (dispose if needed)  
3. Shutdown PresentationEngine  
4. Shutdown ReportingEngine  
5. Shutdown DetectionEngine  
6. Shutdown EvidenceEngine  
7. Shutdown ObservationEngine (release browser/DOM handles; no Storefront mutation)  
8. Shutdown ConfigurationEngine if present  
9. Shutdown InvestigationEngine  
10. Flush/export Traceability if desired; then shutdown TraceabilityEngine  
11. Release extension composition resources  

Shutdown must not invent Detection/Evidence side effects or mutate merchant Storefronts (EP-012).

---

## 8. Optional Package Integration

### 8.1 Configuration (E-009 / P-007)

| Rule | Requirement |
|---|---|
| **Election** | Wire only if bonus pursued; otherwise omit provider |
| **Join point** | ReportingEngine adjunct input only |
| **Failure** | Unavailable/NotInScope; core path still completes |
| **Forbidden** | Wiring Configuration into Evidence or Detection evaluation |
| **Presentation** | Displays Configuration only if attached inside Report |

### 8.2 Traceability (E-010 / P-008)

| Rule | Requirement |
|---|---|
| **Registration** | Hooks record artifact/obligation ids across the run |
| **Non-blocking** | Disable/fail Traceability without failing Investigation |
| **Forbidden** | Using Traceability outputs as control signals for Detection/Reporting |
| **Export** | Available for M8 verification packs |

---

## 9. Dependency Rules

| Rule | Requirement |
|---|---|
| **Composition imports engines** | `extension/` may import `src/*` public surfaces |
| **Engines must not import composition for business meaning** | Avoid cycles that pull Detection into Presentation via wiring hacks |
| **Direction preserved** | Investigation → Observation → Evidence → Detection → Reporting → Presentation |
| **Configuration adjunct only** | `configuration → reporting` |
| **Traceability references only** | Non-blocking |
| **No new packages** | Do not invent `src/integration/` domain ownership; composition stays hosting/wiring |
| **Tests** | Integration tests under `tests/` (e.g., `tests/integration/`) without becoming a ninth business package |

---

## 10. Error Propagation

| Failure locus | Propagation rule |
|---|---|
| Observation incompleteness | Affordance incompleteness → Evidence partial honesty → Detection NotDetected/Unknown as justified → CompletedPartial/UnknownQualified disposition |
| Evidence partial/unobtainable | Immutable partial snapshot → honest Detection outcomes → partial Report/View |
| Detection Unknown/NotDetected | Preserved through Report/View; not upgraded by Integration |
| Reporting input missing | Fail assembly for that episode; do not invent Detection Results in wiring layer |
| Presentation input missing | Fail present for that episode; do not assemble Report in Presentation shell |
| Configuration failure | Local Unavailable; core continues |
| Traceability failure | Local only; core continues |
| Integration wiring misbind | Startup failure (hard)—fix wiring; do not bypass by implementing package logic in `extension/` |

Integration must not catch errors and substitute fabricated Detected/Completed certainty (ADR-006).

---

## 11. Package Boundaries

| Boundary | Enforcement at integration |
|---|---|
| Hosting vs ownership | `extension/` wires; `src/<package>/` owns meaning |
| Presentation shell | May bind ViewModel to popup UI only; no Detection/Evidence calls from UI shell |
| No recollection | Reporting/Presentation wiring must not call EvidenceCollector |
| No live re-query in Detection | DetectionEngine must not receive Document ports for evaluation |
| No Configuration gating | Core run path constructed without requiring ConfigurationEngine |
| No Traceability gating | Core run path constructed without requiring TraceabilityEngine |
| No interface redefinition | Use E-003–E-010 public contracts as specified |

---

## 12. Testing Obligations

| Obligation | Expectation |
|---|---|
| **End-to-end core path** | Investigation→…→Presentation→Disposition succeeds without Configuration |
| **Port wiring** | Real engines satisfy Investigation ports in pipeline order |
| **Immutability** | NormalizedEvidence unchanged through Detection/Reporting/Presentation |
| **Single acquisition** | No second acquisition replace during one Investigation |
| **Ownership** | `extension/` contains no Detection/Evidence business implementations |
| **Optional Configuration** | With Configuration failing/absent, core still completes |
| **Traceability isolation** | With Traceability disabled, core still completes |
| **Error honesty** | Partial fixtures yield CompletedPartial/UnknownQualified—not fabricated Completed Detected |
| **VD/T mapping** | **VD-008**; **T5**; **IC-6**; **RG-M7** |

FR-014 empirics remain primarily M8 (VD-005/VD-007), but integration must not block those later checks.

---

## 13. Deliverables

□ Composition root under `extension/` wiring E-003–E-010 public surfaces  
□ Startup sequence implementation matching §5  
□ Shutdown sequence implementation matching §7  
□ Port injection connecting InvestigationCoordinator to Observation/Evidence/Detection/Reporting/Presentation engines  
□ Optional Configuration provider wiring (pursue) or explicit omission (defer)  
□ Traceability registration hooks (non-blocking)  
□ Popup shell binding to PresentationView only (no business evaluation in shell)  
□ `tests/integration/` (or equivalent) covering §12  
□ No new business packages or redesigned ownership  

---

## 14. Completion Criteria

□ M7 / IC-6 / T5 / RG-M7 satisfiable  
□ End-to-end core Investigation path wired and runnable  
□ Package Architecture dependency direction preserved  
□ Extension Architecture RR hosting map preserved  
□ Data Flow handoffs preserved (Affordance → Evidence → Results → Report → View → Disposition)  
□ Configuration optional; Traceability non-blocking  
□ No new business logic or ownership changes  
□ Architecture/ADR freeze intact  

---

## 15. Definition of Done

E-011 is done when:

1. Deliverables in §13 exist.  
2. Completion criteria in §14 are checked.  
3. The system runs one complete core Investigation traversal using only existing package engines connected by integration wiring.  
4. Optional Configuration and Traceability are integrated without gating core success.  
5. No package redesign, interface redefinition, or new business evaluation/reporting/presentation logic was introduced in the composition layer.

---

## 16. Conclusion

E-011 integrates the frozen execution engines into one runtime system: Investigation orchestrates wired collaborators through the approved pipeline; `extension/` hosts without owning; Configuration and Traceability remain optional/non-blocking. Integration composes—it does not become a ninth domain package.

---

**End of E-011 System Integration.**
