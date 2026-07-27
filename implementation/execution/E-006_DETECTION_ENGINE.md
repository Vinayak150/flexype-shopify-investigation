# E-006 — Detection Engine

**Status:** Active — Execution Phase  
**Document type:** Execution specification for Package P-004 (Detection)  
**Milestone alignment:** M4 Detection / IC-3 / T3 / RG-M4  
**Depends on:** Frozen architecture `00`–`13`; ADR-001–ADR-006; implementation `00`–`06`; [`P-004_DETECTION_SPEC.md`](../specs/P-004_DETECTION_SPEC.md); [`E-001_REPOSITORY_BOOTSTRAP.md`](E-001_REPOSITORY_BOOTSTRAP.md)–[`E-005_EVIDENCE_ENGINE.md`](E-005_EVIDENCE_ENGINE.md)

This execution package implements **only** P-004 Detection ownership: semantic evaluation of immutable Normalized Evidence into Evaluation Agenda, Store Information, Detection Results, and Unknown Qualifications.

**Normative slogan:** Detection owns semantic evaluation of immutable Normalized Evidence. Detection does **NOT** collect Evidence, generate Reports, or render Presentation.

It does **not** implement Evidence acquisition, browser interaction, DOM traversal, report generation, presentation rendering, configuration retrieval, or Traceability execution.

---

## 1. Purpose

Realize the Detection Engine so that:

- Immutable Normalized Evidence (IO-005) is evaluated—never mutated or recollected  
- Evaluation is definition-driven (ADR-003), not selector-as-architecture  
- Detection Results are explainable from Evidence (ADR-004)  
- Not Detected / Unknown / Unavailable remain honest outcomes (ADR-006; FR-013)  
- Live Storefront is never re-queried for evaluation (ADR-005)  

---

## 2. Scope

### In scope

- `src/detection/` implementation of P-004  
- Evaluation lifecycle (S-005 Evaluation Preparation; S-006 Domain Evaluation)  
- Evaluation Agenda, DefinitionEvaluator, DetectionResult(s), UnknownQualifier  
- Explanation provenance linkage (attribution references—not UI invention)  
- Public interfaces, internal modules, error boundaries  
- Tests for immutability consumption, definition-driven posture, Not Detected/Unknown honesty  

### Out of scope

- Evidence acquisition/normalization (P-003 / E-005)  
- Observation/browser/DOM (P-002 / E-004)  
- Reporting assembly (P-005), Presentation (P-006), Configuration fetch (P-007)  
- Inventing U-001/U-002 catalogs; closing Open Unknowns by invention  
- Confidence-formula architecture mandates beyond Detection Strategy outcome semantics  

---

## 3. Detection Responsibilities

Implement only P-004 responsibilities:

| Responsibility | E-006 realization |
|---|---|
| Consume Investigation Context | Evaluate only within one Investigation / Storefront (ADR-001) |
| Consume immutable Normalized Evidence | Read-only IO-005; never mutate; never live re-query (ADR-002; ADR-005) |
| Evaluation Preparation (S-005) | Build Evaluation Agenda covering obligated questions; retain Unknown-qualified items |
| Definition-driven Domain Evaluation (S-006) | Apply approved architectural detection definitions to Evidence |
| Produce Store Information (IO-003) | Part 1 field conclusions; Available/Unavailable honesty where applicable |
| Produce Detection Result Set (IO-007) | Detected / NotDetected / Disabled / Unknown / Available / Unavailable as justified |
| Emit Unknown Qualifications (IO-008) | Mark Open `U-*` influence explicitly |
| Preserve Not Detected honesty | Insufficient-confidence FlexyPe presence → NotDetected (FR-013) |
| Preserve explainability | Link results to Evidence provenance; do not invent Evidence (ADR-004) |
| Multi-signal posture | No single hardcoded selector as sole basis for FlexyPe Products (C-004; C-005) |
| Closed product set | Checkout, FlexyPass, FlexyCart only (C-011) |
| Configuration independence | Core evaluation must not require P-007 |

---

## 4. Public Interfaces

### 4.1 DetectionEngine

| Concern | Specification |
|---|---|
| **Purpose** | Entry point for evaluation session over immutable Normalized Evidence |
| **Operations** | `evaluate(context, normalizedEvidence) → { agenda, storeInformation, results, unknownQualifications }` (or equivalent) |
| **Must not** | Accept live Document/Browser ports for evaluation; mutate Evidence; assemble Report |

### 4.2 EvaluationAgenda

| Concern | Specification |
|---|---|
| **Purpose** | Realize IO-006: investigatory questions for the Investigation |
| **Must include** | FlexyPe Products; Disabled Integrations; Store Information/Theme; Third-party Apps; Storefront Features (Unknown-qualified where Open) |
| **Must not** | Silently drop Unknown-qualified obligated questions (EP-003; FR-019; FR-022) |

### 4.3 DefinitionEvaluator

| Concern | Specification |
|---|---|
| **Purpose** | Evaluate approved detection definitions against Normalized Evidence |
| **Inputs** | Agenda item + readonly Normalized Evidence + definition registry |
| **Outputs** | DetectionResult (+ optional ExplanationReference) |
| **Must not** | Treat implementation selectors/heuristics as architectural truth (ADR-003) |

### 4.4 DetectionResult / DetectionResultSet

| Concern | Specification |
|---|---|
| **Purpose** | Realize Detection Result / IO-007 outcomes |
| **Outcome enum** | From E-002 DetectionOutcome (prefer NotDetected for insufficient FlexyPe confidence) |
| **Must not** | Be rewritten by Presentation later; Evidence must not be invented to justify results |

### 4.5 UnknownQualifier

| Concern | Specification |
|---|---|
| **Purpose** | Emit IO-008 Unknown Qualifications for Open Domain Unknowns |
| **Rules** | Only approved `U-*` IDs; do not invent closed catalogs to force Detected |

### 4.6 ExplanationReference

| Concern | Specification |
|---|---|
| **Purpose** | Provenance linkage from DetectionResult to supporting Evidence identifiers/classes (ADR-004) |
| **May** | Point to EvidenceItemIds / signal classes / definition ids |
| **Must not** | Fabricate Evidence snippets; invent Part 3 explanations absent Evidence (U-005 depth Open—do not invent depth) |
| **Ownership** | Explainability produced here; Reporting preserves; Presentation communicates only |

### 4.7 Evaluation session / init / shutdown

| Operation | Specification |
|---|---|
| **open session** | Bind InvestigationId + readonly NormalizedEvidence reference |
| **run** | Agenda preparation → definition evaluation → qualify Unknowns → seal result set |
| **initialize / shutdown** | No Configuration required; no browser ports for evaluation |

---

## 5. Internal Modules

Suggested layout under `src/detection/`:

| Module | Responsibility |
|---|---|
| `engine` | DetectionEngine entry |
| `agenda` | EvaluationAgenda builder (S-005) |
| `definitions` | Approved definition registry (architectural meanings—not selector SoT) |
| `evaluator` | DefinitionEvaluator (S-006) |
| `storeInformation` | Store Information projection from Evidence |
| `results` | DetectionResult / DetectionResultSet |
| `unknowns` | UnknownQualifier |
| `explanation` | ExplanationReference linkage |
| `session` | Evaluation session lifecycle |
| `errors` | Evaluation incompleteness / honesty boundaries |
| `index` | Minimal public exports |

**Forbidden:** Evidence collectors, browser/DOM ports, Report assemblers, UI renderers, Configuration clients as evaluation dependency.

Satisfies E-003 `DetectionPort`.

---

## 6. Evaluation Lifecycle

Align with Pipeline **S-005 → S-006** after Evidence Consolidation:

```
NormalizedEvidence (immutable; P-003 / E-005)
  → open evaluation session
  → build EvaluationAgenda (S-005)
  → evaluate each agenda item via definitions (S-006)
  → emit Store Information + DetectionResultSet + UnknownQualifications
  → seal outputs for Reporting (P-005; out of E-006 scope)
```

### Lifecycle rules

1. Evaluation begins only with immutable Normalized Evidence for the Investigation.  
2. Detection evaluates the snapshot exclusively—never Observation/live Storefront (ADR-005).  
3. Detection never mutates Normalized Evidence (ADR-002).  
4. Every agenda item receives an outcome state, including Unknown or NotDetected where appropriate.  
5. Unknown-qualified agenda items are retained, not dropped.  
6. No false certainty for insufficient-confidence FlexyPe product presence.  
7. Session is scoped to one InvestigationId (ADR-001).

---

## 7. Evaluation Rules

| Rule | Requirement |
|---|---|
| **Immutable input only** | Evaluate readonly NormalizedEvidence; reject mutable/live inputs for evaluation |
| **Definition-driven** | Outcomes derive from approved detection definitions + Evidence (ADR-003) |
| **Deterministic evaluation** | Same Evidence snapshot + same definitions ⇒ same DetectionResultSet |
| **No single-selector sole basis** | FlexyPe product presence must not rest on one hardcoded selector as sole basis |
| **Closed product set** | Only Checkout, FlexyPass, FlexyCart |
| **NotDetected honesty** | Insufficient confidence for FlexyPe installation → NotDetected (FR-013) |
| **No Evidence invention** | Conclusions never invent Evidence (ADR-004) |
| **No runtime heuristics as architecture** | Mechanisms may evolve; they must not redefine architectural definitions/outcomes |
| **No Configuration influence** | Core evaluation independent of Product Configuration |
| **Disabled semantics** | Part 3 Disabled outcomes only when justified by Evidence under approved definitions |
| **Apps/Features Unknown** | Where U-001/U-002 apply, qualify Unknown rather than invent catalogs |

---

## 8. Unknown Qualification Rules

| Rule | Requirement |
|---|---|
| **Explicit markers** | Emit IO-008 when Open `U-*` influences agenda item or result |
| **Approved IDs only** | U-001–U-010 (as applicable); do not invent new Unknown meanings here |
| **Retention** | Unknown-qualified questions remain on agenda (S-005) |
| **Not a Detected substitute** | Unknown ≠ Detected; Unknown ≠ fabricated Absent |
| **NotDetected vs Unknown** | Product insufficient confidence uses NotDetected per FR-013; Domain Unknowns use Unknown qualification |
| **No silent closure** | Do not remove Unknowns to force green evaluation (EP-003) |

---

## 9. Explanation Provenance Rules

Preserve **ADR-004**:

| Rule | Requirement |
|---|---|
| **Attributable results** | Every DetectionResult links to Evidence support or explicit Unknown/NotDetected/Unavailable restraint |
| **ExplanationReference** | Carry provenance pointers (Evidence ids/classes/definition ids)—not Presentation copywriting |
| **No invented snippets** | Absence of explanation material does not authorize fabrication |
| **Reporting preserves** | Outputs must be preservable by Reporting without re-evaluation |
| **Presentation does not create** | Detection owns explainability generation; UI only surfaces later |
| **Unknown explainable** | Unknown/NotDetected remain legitimate explainable restraint outcomes |

---

## 10. Dependency Rules

| Rule | Requirement |
|---|---|
| **Depends on** | Investigation Context; immutable Normalized Evidence; E-002 Detection contracts |
| **Location** | `src/detection/` |
| **Satisfies** | E-003 `DetectionPort` |
| **Must not depend on** | Observation/browser ports, Evidence collectors, Reporting, Presentation, Configuration (for core) |
| **Must not mutate** | NormalizedEvidence |
| **Runtime hosting** | RR-004 may host in runtime wiring; ownership remains in `src/detection/` |
| **Tests** | `tests/detection/`; production must not depend on tests |

Import direction: `… → evidence → detection → reporting → …`

---

## 11. Package Boundaries

| Boundary | Enforcement |
|---|---|
| Detection vs Evidence | Read-only snapshot consumption; no recollection/mutation |
| Detection vs Observation | No browser/DOM evaluation path |
| Detection vs Reporting | Emit results only; do not assemble Diagnostic Report |
| Detection vs Presentation | No UI; no invented explanations for display |
| Detection vs Configuration | Optional later adjunct to Reporting only—not evaluation input |
| Error boundary | Insufficient Evidence → NotDetected/Unknown/Unavailable—not fabricated Detected |

Crossing into Evidence acquisition or Reporting ownership fails E-006 / RG-M4.

---

## 12. Testing Obligations

| Obligation | Expectation |
|---|---|
| **Immutable consumption** | Evaluation uses readonly snapshot; mutation attempts fail |
| **No live re-query** | Engine API does not require browser/DOM ports |
| **Agenda retention** | Unknown-qualified obligated items remain present |
| **NotDetected** | Insufficient FlexyPe confidence fixtures yield NotDetected—not Detected/Absent |
| **Multi-signal posture** | Tests reject sole-basis single-selector product definition wiring as architectural acceptance |
| **Unknown qualification** | Open Unknown fixtures emit IO-008; not silently closed |
| **Explanation linkage** | Detected/Disabled results carry ExplanationReference to Evidence support |
| **Determinism** | Same Evidence + definitions ⇒ same results |
| **Configuration independence** | Evaluation succeeds without Configuration |
| **Closed catalog** | Reject/forbid additional FlexyPe product ids |
| **VD/T mapping** | **VD-005**; **T3**; **IC-3**; **RG-M4**; FR-014 empirics intensified at M8 |

---

## 13. Deliverables

□ `src/detection/` modules: engine, agenda, definitions, evaluator, storeInformation, results, unknowns, explanation, session, errors  
□ EvaluationAgenda / DetectionResultSet / UnknownQualification / ExplanationReference aligned with E-002  
□ DefinitionEvaluator operating only on immutable NormalizedEvidence  
□ DetectionPort fulfillment for E-003  
□ `tests/detection/` covering §12  
□ No Evidence acquisition, browser/DOM evaluation, Reporting, or Presentation logic  

---

## 14. Completion Criteria

□ P-004 completion criteria satisfied  
□ IO-006, IO-003, IO-007, IO-008 produced from immutable IO-005 only  
□ ADR-002 / ADR-003 / ADR-004 / ADR-005 / ADR-006 compliance holds  
□ NotDetected / Unknown honesty preserved  
□ No Evidence mutation or recollection  
□ No Report/UI/Configuration-required core evaluation  
□ Must-never-own set respected  
□ T3 / IC-3 / RG-M4 ready  

---

## 15. Definition of Done

E-006 is done when:

1. Deliverables in §13 exist.  
2. Completion criteria in §14 are checked.  
3. Detection Engine can build an agenda, evaluate definitions against immutable Normalized Evidence, and emit explainable Detection Results with Unknown Qualifications.  
4. No Evidence acquisition, browser interaction, report generation, or presentation rendering was implemented.  
5. Ownership matches P-004 / Detection Strategy / Pipeline S-005–S-006 without redesign.

---

## 16. Conclusion

E-006 implements the Detection Engine as P-004: definition-driven, explainable evaluation of one immutable Normalized Evidence snapshot per Investigation—producing Store Information, Detection Results, and Unknown Qualifications—without collecting Evidence, mutating the snapshot, querying the live Storefront, assembling Reports, or rendering UI.

---

**End of E-006 Detection Engine.**
