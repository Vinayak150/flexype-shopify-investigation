# E-007 — Reporting Engine

**Status:** Active — Execution Phase  
**Document type:** Execution specification for Package P-005 (Reporting)  
**Milestone alignment:** M5 Reporting / IC-4 / T4 (report side) / RG-M5  
**Depends on:** Frozen architecture `00`–`13`; ADR-001–ADR-006; implementation `00`–`06`; [`P-005_REPORTING_SPEC.md`](../specs/P-005_REPORTING_SPEC.md); [`E-001_REPOSITORY_BOOTSTRAP.md`](E-001_REPOSITORY_BOOTSTRAP.md)–[`E-006_DETECTION_ENGINE.md`](E-006_DETECTION_ENGINE.md)

This execution package implements **only** P-005 Reporting ownership: assembly of one Diagnostic Report from Detection outputs for one Investigation.

**Normative slogan:** Reporting owns assembly of the Diagnostic Report from Detection Results. Reporting does **NOT** evaluate Evidence, perform Detection, or render UI.

It does **not** implement browser interaction, Observation, Evidence acquisition/normalization, Detection evaluation, Presentation rendering, Configuration retrieval, or Traceability execution.

---

## 1. Purpose

Realize the Reporting Engine so that:

- One Diagnostic Report (IO-009) is assembled per Investigation (ADR-001; FR-020)  
- Assembly consumes Detection outputs only—not raw Evidence  
- Explanation provenance from Detection is preserved (ADR-004)  
- Partial completeness remains representable (ADR-006; EP-018)  
- Core Report forms without Product Configuration (FR-026)  

---

## 2. Scope

### In scope

- `src/reporting/` implementation of P-005  
- Report assembly lifecycle (S-007 Diagnostic Assembly)  
- DiagnosticReport, ReportSection, explanation aggregation, completeness annotation  
- Public interfaces, internal modules, error boundaries  
- Tests for deterministic assembly, immutability of consumed Detection Results, Unknown preservation  

### Out of scope

- Evidence recollection or Normalized Evidence mutation  
- Definition-driven Detection / product evaluation  
- Presentation-ready View / UI rendering  
- Configuration fetching (optional IO-010 may be **accepted as adjunct input** if already supplied—Reporting does not retrieve it)  
- Closing Open Unknowns by stripping qualifications  

---

## 3. Reporting Responsibilities

Implement only P-005 responsibilities:

| Responsibility | E-007 realization |
|---|---|
| Assemble one Diagnostic Report per Investigation | Bind Report to InvestigationId; forbid multi-root aggregation |
| Consume Detection outputs | Store Information, Detection Result Set, Unknown Qualifications, ExplanationReferences |
| Organize report structure | Compose sections from Detection outputs without changing meanings |
| Preserve explainability | Aggregate ExplanationReferences; do not invent Evidence or Part 3 reasons |
| Preserve Unknown Qualifications | Do not strip IO-008 markers |
| Preserve Detection Result meanings | Read-only consumption; no outcome rewriting |
| Support partial completeness | Annotate Completed/partial honesty without fabricating certainty |
| Optional Configuration adjunct | Attach IO-010 only if supplied; never require it for core assembly |
| Provide Report for Presentation/Completion | Emit IO-009 readiness for P-006 / P-001 disposition |
| Never recollect Evidence | No Observation/Evidence ports for assembly |

---

## 4. Public Interfaces

### 4.1 ReportAssembler / ReportBuilder

| Concern | Specification |
|---|---|
| **Purpose** | Assemble IO-009 from Detection outputs (+ optional Configuration adjunct) |
| **Operations** | `assemble(context, detectionOutputs, optionalConfiguration?) → DiagnosticReport` |
| **Must not** | Call Evidence/Observation/Detection evaluation; mutate Detection Results |

### 4.2 DiagnosticReport

| Concern | Specification |
|---|---|
| **Purpose** | Realize IO-009: Store Information + Detection Results (+ optional Product Configuration) |
| **Guarantees** | One Report per Investigation; core content without Configuration |
| **Non-goals** | Not Evidence warehouse; not submission zip; not UI tree |

### 4.3 ReportSection

| Concern | Specification |
|---|---|
| **Purpose** | Structural grouping of Report content for later Presentation projection |
| **May mirror** | Organizational concerns aligned with UI PS-* **as data sections**—not rendering |
| **Must not** | Change DetectionOutcome meanings or invent missing results |

### 4.4 ExplanationAggregator

| Concern | Specification |
|---|---|
| **Purpose** | Preserve and aggregate Detection ExplanationReferences into the Report |
| **Must** | Keep provenance attributable to Evidence support already produced upstream |
| **Must not** | Generate new observational explanations or fabricate snippets (ADR-004) |

### 4.5 CompletenessAnnotator

| Concern | Specification |
|---|---|
| **Purpose** | Represent report completeness / partiality honestly for disposition readiness |
| **May signal** | Full-as-obtainable vs partial incompleteness / Unknown influence |
| **Must not** | Coerce partial content into fabricated Completed certainty (ADR-006) |

### 4.6 ReportMetadata

| Concern | Specification |
|---|---|
| **Purpose** | Investigation metadata needed for Report identity (InvestigationId, Storefront target reference, assembly timestamp as needed) |
| **Must not** | Carry live browser handles or mutable Evidence snapshots |

### 4.7 Assembly session / init / shutdown

| Operation | Specification |
|---|---|
| **open session** | Bind InvestigationId + readonly Detection outputs |
| **assemble** | Build sections → aggregate explanations → annotate completeness → seal DiagnosticReport |
| **initialize / shutdown** | No browser/Evidence/Detection-eval dependencies; Configuration fetch not performed |

---

## 5. Internal Modules

Suggested layout under `src/reporting/`:

| Module | Responsibility |
|---|---|
| `assembler` / `builder` | ReportAssembler / ReportBuilder |
| `report` | DiagnosticReport model |
| `sections` | ReportSection organization |
| `explanations` | ExplanationAggregator |
| `completeness` | CompletenessAnnotator |
| `metadata` | ReportMetadata |
| `session` | Assembly session lifecycle |
| `errors` | Assembly incompleteness / input validation boundaries |
| `index` | Minimal public exports |

**Forbidden:** Evidence collectors, Detection evaluators, browser/DOM ports, Presentation renderers, Configuration clients (accept adjunct only).

Satisfies E-003 `ReportingPort`.

---

## 6. Report Assembly Lifecycle

Align with Pipeline **S-007** after Domain Evaluation:

```
Detection outputs (P-004 / E-006)
  (+ optional Product Configuration if supplied)
  → open assembly session
  → validate readonly inputs
  → build ReportSections from Store Information + Detection Results
  → aggregate ExplanationReferences
  → preserve Unknown Qualifications
  → annotate completeness
  → seal DiagnosticReport (IO-009)
  → Presentation may consume Report (P-006; out of E-007 scope)
```

### Lifecycle rules

1. Assembly consumes Detection outputs only—not raw Evidence.  
2. No re-evaluation or re-detection during assembly.  
3. Absence of Product Configuration does not block core content.  
4. One Investigation → one Diagnostic Report.  
5. Unknown Qualifications travel with the Report.  
6. No second browser acquisition or Evidence recollection (ADR-005; ADR-002 boundary).  
7. Sealed Report is the artifact Presentation projects without meaning change.

---

## 7. Report Assembly Rules

| Rule | Requirement |
|---|---|
| **Deterministic assembly** | Same Detection outputs (+ same optional Configuration adjunct) ⇒ same DiagnosticReport content |
| **Immutable DetectionResult consumption** | Treat Detection Result Set / Store Information as read-only inputs |
| **No additional inference** | No product presence, confidence, or Evidence interpretation during reporting |
| **No outcome mutation** | Detected / NotDetected / Disabled / Unknown / Available / Unavailable unchanged |
| **Core without Configuration** | Store Information + Detection Results assemble when IO-010 absent (DF-INV-004) |
| **Optional adjunct only** | If IO-010 present, attach without gating core fields |
| **Obligated results retained** | Do not drop obligated Detection Results to “simplify” the Report |
| **Investigation metadata only** | Metadata limited to episode identity/context—not live Storefront rebinding |

---

## 8. Explanation Aggregation Rules

Preserve **ADR-004**:

| Rule | Requirement |
|---|---|
| **Preserve upstream explainability** | Copy/aggregate ExplanationReferences from Detection into Report |
| **No invention** | Do not create Evidence facts or Part 3 reasons absent from Detection outputs |
| **Attribution stability** | Aggregated explanations remain attributable to Evidence identifiers/classes provided upstream |
| **Unknown/NotDetected preserved** | Restraint outcomes remain explainable as such—not relabeled to false certainty |
| **Presentation handoff** | Report carries explainability for Presentation to communicate—not for Presentation to create |

---

## 9. Completeness Representation Rules

Preserve **ADR-006** / EP-018:

| Rule | Requirement |
|---|---|
| **Partial Reports valid** | Missing/unavailable fields and NotDetected/Unknown items do not require fabricated fill |
| **Completeness annotations** | Annotator records obtainable-vs-partial state for Completion Disposition readiness |
| **Unknown influence visible** | Unknown Qualifications remain in Report content |
| **No cosmetic completion** | Do not upgrade partial assemblies to imply full certainty |
| **Configuration absence** | Missing IO-010 is not a core incompleteness failure |

---

## 10. Dependency Rules

| Rule | Requirement |
|---|---|
| **Depends on** | Detection outputs (P-004 / E-006); Investigation Context metadata; E-002 Report contracts |
| **Optionally accepts** | Product Configuration (IO-010) if supplied by P-007—never fetched here |
| **Location** | `src/reporting/` |
| **Satisfies** | E-003 `ReportingPort` |
| **Must not depend on** | Observation, Evidence recollection, Detection evaluation modules, Presentation, Configuration clients |
| **Runtime hosting** | RR-005 wiring may live in `extension/`; ownership remains in `src/reporting/` |
| **Tests** | `tests/reporting/`; production must not depend on tests |

Import direction: `… → detection → reporting → presentation`

---

## 11. Package Boundaries

| Boundary | Enforcement |
|---|---|
| Reporting vs Detection | Assemble only; do not re-evaluate definitions |
| Reporting vs Evidence | No recollection; no Normalized Evidence mutation |
| Reporting vs Observation | No browser/DOM assembly path |
| Reporting vs Presentation | Emit DiagnosticReport only; do not render UI |
| Reporting vs Configuration | Adjunct attach only; never required for core |
| Error boundary | Missing optional Configuration ≠ assembly failure; missing Detection inputs are assembly errors—not invented Detected results |

Crossing into Detection/Evidence/Presentation ownership fails E-007 / RG-M5.

---

## 12. Testing Obligations

| Obligation | Expectation |
|---|---|
| **One Report per Investigation** | Assembly binds to InvestigationId; rejects multi-root merge |
| **Core without Configuration** | Report assembles with IO-010 absent |
| **Readonly Detection consumption** | Outcomes unchanged after assembly |
| **Explanation preservation** | Upstream ExplanationReferences present in Report; no invented snippets |
| **Unknown preservation** | IO-008 markers not stripped |
| **Partial honesty** | Partial Detection fixtures yield annotated partial Report—not fabricated Completed certainty |
| **No Evidence/Detection ports** | Assembler API does not require Evidence/Observation/browser |
| **Determinism** | Same inputs ⇒ same Report |
| **VD/T mapping** | **VD-006**; **T4** (report); **IC-4**; **RG-M5** |

---

## 13. Deliverables

□ `src/reporting/` modules: assembler/builder, report, sections, explanations, completeness, metadata, session, errors  
□ DiagnosticReport / ReportSection / ReportMetadata aligned with E-002  
□ ExplanationAggregator and CompletenessAnnotator  
□ ReportingPort fulfillment for E-003  
□ `tests/reporting/` covering §12  
□ No Evidence/Detection/Presentation/Configuration-retrieval business logic  

---

## 14. Completion Criteria

□ P-005 completion criteria satisfied  
□ IO-009 assembled from Detection outputs only  
□ ADR-004 explainability preserved; ADR-006 partial honesty preserved  
□ ADR-002/ADR-005 boundaries respected (no Evidence recollection / live re-query)  
□ Core Report independent of Configuration  
□ Must-never-own set respected  
□ T4 report-side checks / IC-4 / RG-M5 ready  

---

## 15. Definition of Done

E-007 is done when:

1. Deliverables in §13 exist.  
2. Completion criteria in §14 are checked.  
3. Reporting Engine can deterministically assemble one Diagnostic Report from Detection outputs, preserving explanations and Unknowns, with honest completeness annotation.  
4. No Evidence evaluation, Detection, Evidence recollection, or Presentation rendering was implemented.  
5. Ownership matches P-005 / Pipeline S-007 / Data Flow IO-009 without redesign.

---

## 16. Conclusion

E-007 implements the Reporting Engine as P-005: it assembles one Diagnostic Report per Investigation from Detection Results and related outputs, aggregates explanation provenance, and represents incompleteness honestly—without evaluating Evidence, performing Detection, mutating outcomes, or rendering UI.

---

**End of E-007 Reporting Engine.**
