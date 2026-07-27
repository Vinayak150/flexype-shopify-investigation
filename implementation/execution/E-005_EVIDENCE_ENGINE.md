# E-005 — Evidence Engine

**Status:** Active — Execution Phase  
**Document type:** Execution specification for Package P-003 (Evidence)  
**Milestone alignment:** M3 Evidence / IC-2 / T2 / RG-M3  
**Depends on:** Frozen architecture `00`–`13`; ADR-001–ADR-006; implementation `00`–`06`; [`P-003_EVIDENCE_SPEC.md`](../specs/P-003_EVIDENCE_SPEC.md); [`E-001_REPOSITORY_BOOTSTRAP.md`](E-001_REPOSITORY_BOOTSTRAP.md)–[`E-004_OBSERVATION_ENGINE.md`](E-004_OBSERVATION_ENGINE.md)

This execution package implements **only** P-003 Evidence ownership: acquisition, collection, consolidation/normalization, and immutable Normalized Evidence for one Investigation.

**Normative slogan:** Evidence owns acquisition, normalization, and immutable representation of observable facts. Evidence does **NOT** determine **WHAT THOSE FACTS MEAN**.

It does **not** implement Detection evaluation, product inference, scoring, Reporting, Presentation, Configuration, Traceability, or business conclusions.

---

## 1. Purpose

Realize the Evidence Engine so that:

- Observation Affordance is consumed to collect public Storefront facts (IO-004)  
- Collected Evidence is normalized into evaluation-ready Normalized Evidence (IO-005)  
- Normalized Evidence is immutable for the remainder of the Investigation (ADR-002)  
- A single acquisition snapshot supports downstream Detection without live re-query (ADR-005)  
- Signal classes categorize collection—not Detection fusion conclusions  

---

## 2. Scope

### In scope

- `src/evidence/` implementation of P-003  
- Evidence acquisition lifecycle (S-003) and consolidation/normalization (S-004)  
- EvidenceItem / EvidenceSet / NormalizedEvidence contracts realization  
- Signal classification into approved Evidence Signal Classes  
- Provenance preservation and immutability enforcement  
- Public interfaces, internal modules, error boundaries  
- Tests for acquisition honesty, normalization determinism, and immutability  

### Out of scope

- Definition-driven Detection, product presence, confidence scoring (P-004)  
- Diagnostic Report assembly, Presentation, Configuration fetch  
- Inventing U-001/U-002 signal catalogs that close Open Unknowns  
- Second acquisition passes that replace the established snapshot for the same Investigation  

---

## 3. Evidence Responsibilities

Implement only P-003 responsibilities:

| Responsibility | E-005 realization |
|---|---|
| Consume Investigation Context | Scope all Evidence to one Investigation / one Storefront (ADR-001) |
| Consume Observation Affordance | Acquire only after IO-002 exists (E-004) |
| Evidence Acquisition / Collection (S-003) | Collect observable public facts without fabricating Evidence |
| Record unobtainable classes honestly | Mark missing signal classes; do not invent facts (ADR-006 honesty) |
| Signal classification | Assign collected items to approved Evidence Signal Classes (collection categories only) |
| Evidence Consolidation / Normalization (S-004) | Produce evaluation-ready Normalized Evidence without meaning alteration |
| Emit immutable Normalized Evidence | Freeze snapshot for Detection consumption (ADR-002) |
| Single acquisition posture | One acquisition phase per Investigation; no re-scan replacement (ADR-005) |
| Configuration isolation | Never accept Configuration as Evidence source |
| Non-invasive | No Storefront mutation ownership |

---

## 4. Public Interfaces

### 4.1 EvidenceCollector

| Concern | Specification |
|---|---|
| **Purpose** | Collect EvidenceItems from Observation Affordance for one Investigation |
| **Operations** | `collect(context, affordance) → EvidenceSet` (or equivalent) |
| **Must not** | Evaluate definitions, score confidence, emit Detection Results |

### 4.2 EvidenceAcquisition

| Concern | Specification |
|---|---|
| **Purpose** | Own S-003 acquisition session for one Investigation |
| **Lifecycle** | open → collect → seal collected set → hand to normalizer |
| **Honesty** | Partial collection allowed; fabrication forbidden |

### 4.3 EvidenceItem

| Concern | Specification |
|---|---|
| **Purpose** | One observable public fact (+ signal class + provenance) |
| **Contract** | Align with E-002 Evidence value object |
| **Must not** | Carry DetectionOutcome as its meaning |

### 4.4 EvidenceSet

| Concern | Specification |
|---|---|
| **Purpose** | Collected Evidence (IO-004 family) for one Investigation prior to/at normalization boundary |
| **Mutability** | Mutable only during acquisition session; not the downstream immutable snapshot |

### 4.5 EvidenceNormalizer

| Concern | Specification |
|---|---|
| **Purpose** | Transform EvidenceSet into NormalizedEvidence (S-004) |
| **Guarantees** | Deterministic normalization for the same input set; no invented facts; no conclusion-driven edits |

### 4.6 NormalizedEvidence

| Concern | Specification |
|---|---|
| **Purpose** | Realize IO-005: evaluation-ready immutable snapshot |
| **Mutability** | **Readonly after emission**; consumers must not mutate |
| **Consumers** | Detection (and only as read-only input); never Presentation/Reporting for recollection |

### 4.7 SignalClassifier

| Concern | Specification |
|---|---|
| **Purpose** | Classify collected items into approved Evidence Signal Classes |
| **May** | Assign collection categories needed for later evaluation readiness |
| **Must not** | Perform multi-signal fusion conclusions or product Detected/Not Detected decisions |

### 4.8 Initialization / shutdown

| Operation | Specification |
|---|---|
| **initialize** | Wire collector/normalizer; no Configuration required |
| **shutdown** | End acquisition session; retain emitted immutable snapshot semantics for the Investigation; do not mutate Storefront |

---

## 5. Internal Modules

Suggested layout under `src/evidence/`:

| Module | Responsibility |
|---|---|
| `acquisition` | EvidenceAcquisition session (S-003) |
| `collector` | EvidenceCollector |
| `items` | EvidenceItem / EvidenceSet builders |
| `signals` | SignalClassifier (approved classes only) |
| `normalizer` | EvidenceNormalizer (S-004) |
| `normalized` | NormalizedEvidence freeze/export |
| `provenance` | Provenance metadata preservation |
| `errors` | Acquisition/normalization incompleteness boundaries |
| `index` | Minimal public exports |

**Forbidden:** Detection evaluation, scoring, Report/UI, Configuration-as-source adapters, product inference.

Satisfies E-003 `EvidencePort` with real acquisition+normalization behavior.

---

## 6. Evidence Acquisition Lifecycle

Align with Pipeline **S-003 → S-004** after Observation:

```
ObservationAffordance (P-002 / E-004)
  → open EvidenceAcquisition session
  → collect EvidenceItems (public facts only)
  → classify into approved signal classes
  → seal EvidenceSet (IO-004)
  → normalize → NormalizedEvidence (IO-005)
  → freeze immutable snapshot
  → Detection may consume read-only snapshot (P-004; out of E-005 scope)
```

### Lifecycle rules

1. Acquisition follows Observation; do not collect from unobserved invention.  
2. One acquisition phase per Investigation (ADR-005).  
3. Normalization follows collection; produces evaluation-ready form without meaning alteration.  
4. After IO-005 emission, no re-normalization that rewrites the snapshot for the same Investigation.  
5. No downstream browser re-query owned by Evidence to revise the snapshot during Detection/Reporting/Presentation.  
6. Partial/unobtainable classes → incompleteness markers, not fabricated Evidence.  
7. U-007 may limit reach; no Admin/backend Evidence source.  
8. U-009 remains Open—no auto-rescan architecture invented here.  
9. New Investigation ⇒ new acquisition → new immutable snapshot (ADR-001 + ADR-002).

---

## 7. Normalization Rules

| Rule | Requirement |
|---|---|
| **Determinism** | Same sealed EvidenceSet ⇒ same NormalizedEvidence content |
| **No invention** | Normalization must not add storefront facts not present in collection |
| **No conclusion edits** | Must not rewrite facts to force Detected/Disabled/Absent outcomes |
| **Evaluation readiness** | Output is suitable for Domain Evaluation consumption without meaning change |
| **Signal classes retained** | Approved class associations preserved for downstream definition evaluation |
| **Provenance preserved** | Origin/provenance metadata needed for explainability attribution remains available to Detection (ADR-004 upstream basis)—without Evidence performing explanation generation |
| **Partial allowed** | Missing classes remain explicit incompleteness |
| **Not Detection** | Normalization is structural/consistency shaping—not definition-driven product evaluation (ADR-003 stays in Detection) |

---

## 8. Immutability Rules

Preserve **ADR-002** completely:

| Rule | Requirement |
|---|---|
| **Immutable Normalized Evidence** | After normalization/handoff, snapshot is read-only for the Investigation |
| **One acquisition snapshot** | Single NormalizedEvidence basis per Investigation episode |
| **No mutation after normalization** | Detection/Reporting/Presentation/Investigation must not mutate IO-005 |
| **No re-normalization after Detection handoff** | Forbidden for the same Investigation |
| **No evidence rewriting** | Forbidden to force outcomes |
| **Consumer contract** | Export readonly types / freeze structures; reject mutating APIs on NormalizedEvidence |
| **Repeatable downstream consumption** | Multiple reads yield the same snapshot content |
| **Provenance stability** | Provenance retained; not stripped to “simplify” |

ADR-005 complement: browser acquisition occurs once in Observation + Collection + Normalization; Evidence Engine must not initiate a second acquisition pass to replace the established snapshot.

---

## 9. Dependency Rules

| Rule | Requirement |
|---|---|
| **Depends on** | Investigation Context; Observation Affordance; E-002 Evidence contracts |
| **Location** | `src/evidence/` |
| **Satisfies** | E-003 `EvidencePort` |
| **Must not depend on** | Detection, Reporting, Presentation, Configuration |
| **Forbidden** | Configuration → Evidence as source; Presentation → Evidence recollection APIs |
| **Runtime hosting** | RR-003 adapters may live in `extension/`; ownership remains in `src/evidence/` |
| **Tests** | `tests/evidence/`; production must not depend on tests |

Import direction: `… → observation → evidence → detection → …`

---

## 10. Package Boundaries

| Boundary | Enforcement |
|---|---|
| Evidence vs Observation | Consumes Affordance; does not redefine affordance meaning as Detection |
| Evidence vs Detection | Supplies immutable snapshot only; no product conclusions |
| Evidence vs Reporting | Reporting must not call Evidence to recollect |
| Evidence vs Presentation | Presentation must not consume Evidence for evaluation |
| Evidence vs Configuration | Configuration never sources/contaminates Evidence |
| Meaning boundary | Signal class ≠ DetectionOutcome |
| Error boundary | Collection failures → incompleteness—not invented Detected/Absent |

Crossing into Detection ownership fails E-005 / RG-M3.

---

## 11. Testing Obligations

| Obligation | Expectation |
|---|---|
| **Requires Affordance** | Collection refuses/handles missing Observation Affordance without inventing facts |
| **Partial honesty** | Unobtainable signal classes recorded; no fabricated EvidenceItems |
| **Normalization determinism** | Same input EvidenceSet ⇒ same NormalizedEvidence |
| **Immutability** | Post-freeze mutation attempts fail or are type-forbidden; consumers receive readonly snapshot |
| **Single acquisition** | No API that replaces snapshot via second acquisition for same InvestigationId |
| **Non-Detection** | Modules do not export DetectionResult / product presence conclusions |
| **No Configuration source** | Evidence pipeline succeeds without Configuration; rejects Configuration-as-Evidence wiring |
| **Port integration** | EvidencePort returns immutable NormalizedEvidence readiness to Investigation stubs |
| **VD/T mapping** | **VD-004**; **T2**; **IC-2**; **RG-M3** |

Do not claim FR-014 Detection empirics from Evidence alone.

---

## 12. Deliverables

□ `src/evidence/` modules: acquisition, collector, items/set, signals, normalizer, normalized, provenance, errors  
□ EvidenceItem / EvidenceSet / NormalizedEvidence aligned with E-002  
□ SignalClassifier limited to approved collection classes  
□ Immutable freeze/export of NormalizedEvidence  
□ EvidencePort fulfillment for E-003  
□ `tests/evidence/` covering §11  
□ No Detection/Reporting/Presentation/Configuration business conclusions  

---

## 13. Completion Criteria

□ P-003 completion criteria satisfied  
□ IO-004 collected and IO-005 emitted immutable for the Investigation  
□ ADR-002 immutability holds  
□ ADR-005 single acquisition posture holds  
□ ADR-006 partial/unobtainable honesty holds  
□ No Detection Results produced  
□ Configuration does not contaminate Evidence  
□ Must-never-own set respected  
□ T2 / IC-2 / RG-M3 ready  

---

## 14. Definition of Done

E-005 is done when:

1. Deliverables in §12 exist.  
2. Completion criteria in §13 are checked.  
3. Evidence Engine can collect from ObservationAffordance, normalize deterministically, and emit immutable NormalizedEvidence.  
4. No product inference, definition evaluation, scoring, Detection Results, or reporting was implemented.  
5. Ownership matches P-003 / Pipeline S-003–S-004 / ADR-002 / ADR-005 without redesign.

---

## 15. Conclusion

E-005 implements the Evidence Engine as P-003: it collects and normalizes observable public facts into one immutable Normalized Evidence snapshot per Investigation. It preserves provenance and signal-class categorization for collection readiness—and never decides what those facts mean.

---

**End of E-005 Evidence Engine.**
