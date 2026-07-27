# P-005 — Reporting Package Specification

**Status:** Active — Implementation Phase  
**Document type:** Package implementation specification (what P-005 must realize—not how)  
**Package:** P-005 Reporting  
**Repository home:** `src/reporting/`  
**Milestone home:** M5 Reporting  
**Depends on:** Frozen `architecture/00`–`13`; ADR-001–ADR-006; implementation `00`–`06`; [`P-001_INVESTIGATION_SPEC.md`](P-001_INVESTIGATION_SPEC.md)–[`P-004_DETECTION_SPEC.md`](P-004_DETECTION_SPEC.md)

This specification translates approved architecture for Package P-005 into implementation obligations. It does not redesign architecture, define report rendering, UI behavior, browser APIs, Evidence acquisition, Detection algorithms, confidence calculations, formatting implementation, or code.

**Ownership reminder:** Observation discovers. Evidence captures immutable facts. Detection evaluates. Reporting assembles. Presentation renders.

---

## 1. Purpose

The Reporting Package **assembles the Diagnostic Report** for one Investigation from Detection outputs (and optionally attaches Product Configuration as a non-blocking adjunct).

Per Package Architecture P-005, Pipeline S-007, and Data Flow IO-009:

- Reporting organizes Store Information, Detection Results, and Unknown Qualifications into one Diagnostic Report.  
- Reporting preserves explainability produced by Detection; it does not generate new observational explanations.  
- Reporting never evaluates Evidence, recollects Evidence, rewrites Detection Results, or renders UI.  
- Core Report content must form without Product Configuration (FR-026).

**Non-goals:** Not UI layout; not re-detection; not Evidence warehouse; not submission packaging (FR-024).

---

## 2. Architectural Ownership

| Dimension | Ownership |
|---|---|
| **Logical package** | P-005 Reporting Package |
| **System responsibility** | R-007 Diagnostic Assembly |
| **Runtime host** | RR-005 Reporting Runtime |
| **Information objects owned** | IO-009 Diagnostic Report |
| **Domain concepts** | Diagnostic Report as the complete set of Store Information and Detection Results for one Investigation |
| **Pipeline stage owned (meaning)** | S-007 Diagnostic Assembly |
| **Invariants** | FR-020; FR-026; PKG-INV-003; DF-INV-004; DF-INV-003; S-INV-005 |

Repository placement: primary production ownership under `src/reporting/`. Runtime hosting may be wired from `extension/` without moving ownership meaning out of P-005.

---

## 3. Responsibilities

P-005 is responsible for:

1. **Assemble one Diagnostic Report per Investigation** — Exactly one Report for the bound Investigation (ADR-001; FR-020).  
2. **Consume Detection outputs** — Store Information (IO-003), Detection Result Set (IO-007), and Unknown Qualifications (IO-008).  
3. **Organize report structure** — Compose obligated Store Information and Detection Results into the Diagnostic Report artifact.  
4. **Preserve explainability** — Keep Detection-produced attribution/explanation intent intact; do not invent new observational facts or Part 3 reasons (ADR-004).  
5. **Preserve Unknown Qualifications** — Do not strip Unknown markers to “simplify” outputs (EP-003; DF-INV-003).  
6. **Preserve Detection Result meanings** — Do not mutate Detected / Not Detected / Disabled / Unknown / Available / Unavailable outcomes.  
7. **Support partial completeness** — Partial Reports remain valid under progressive completeness (EP-018; ADR-006).  
8. **Optional Configuration adjunct only** — May attach Product Configuration (IO-010) if supplied; absence must not block core assembly (FR-026; EP-011).  
9. **Provide Report for Presentation and Completion** — IO-009 is consumed by Presentation Preparation and informs Completion Disposition readiness.  
10. **Never recollect Evidence** — Assembly must not depend on Observation/Evidence for recollection or re-evaluation (PKG-INV-003; S-007 non-goals).

---

## 4. Must Never Own

P-005 must never own:

| Forbidden ownership | Correct owner |
|---|---|
| Evidence acquisition / collection | P-003 Evidence |
| Evidence normalization / Normalized Evidence mutation | P-003 Evidence; mutation forbidden (ADR-002) |
| Domain Evaluation / Detection Result generation | P-004 Detection |
| Explanation generation (as new observational claims) | P-004 Detection (ADR-004) |
| Presentation-ready View / UI rendering | P-006 Presentation |
| Investigation Context / Completion Disposition | P-001 Investigation |
| Observation Affordance | P-002 Observation |
| Product Configuration fetching | P-007 Configuration (optional adjunct producer) |
| Live Storefront access for assembly | Forbidden (ADR-005) |

Reporting assembles; it does not evaluate, detect, or present.

---

## 5. Inputs

| Input | Nature | Source |
|---|---|---|
| **Store Information (IO-003)** | Part 1 conclusions | P-004 Detection |
| **Detection Result Set (IO-007)** | Agenda outcomes | P-004 Detection |
| **Unknown Qualifications (IO-008)** | Open Unknown markers | P-004 Detection |
| **Product Configuration (IO-010)** | Optional adjunct only | P-007 Configuration (if pursued) |

Inputs do not include: raw Evidence / Normalized Evidence for recollection or re-evaluation, Observation Affordance, or live Storefront state.

---

## 6. Outputs

| Output | Nature |
|---|---|
| **Diagnostic Report (IO-009)** | Assembled Store Information + Detection Result Set (+ optional Product Configuration) for Operator-facing consumption |

**Output rules:**

- Core content must form without Product Configuration (IO-009; DF-INV-004).  
- Presentation prepares a view without changing Detection Results.  
- Report is not an Evidence warehouse and not a submission zip.  
- One Investigation → one Diagnostic Report (ADR-001).  
- Partial Reports remain architecturally valid (ADR-006; EP-018).

---

## 7. Lifecycle

P-005 owns Pipeline **S-007 Diagnostic Assembly**, after Domain Evaluation and before Presentation Preparation:

```
S-006 Domain Evaluation (P-004)
  → S-007 Diagnostic Assembly (P-005)   ← this package
  → S-008 Presentation Preparation (P-006)
  → S-009 Completion Disposition (P-001)
```

**Lifecycle rules for P-005:**

1. Assembly consumes Detection outputs only—not raw Evidence.  
2. Assembly does not re-evaluate Evidence or re-detect.  
3. Absence of Product Configuration does not block core content assembly.  
4. Completed or Completed Partial Report readiness informs Investigation disposition downstream (P-001).  
5. Unknown Qualifications travel with Results/Report and must not be stripped.  
6. No second browser acquisition or Evidence recollection during assembly (ADR-005; ADR-002 boundary).

---

## 8. Collaborating Packages

| Package | Collaboration with P-005 |
|---|---|
| **P-001 Investigation** | Consumes Report readiness for Completion Disposition; Reporting does not own disposition |
| **P-002 Observation** | No recollection collaboration |
| **P-003 Evidence** | No recollection or mutation collaboration |
| **P-004 Detection** | Sole source of Store Information, Detection Results, Unknown Qualifications for assembly |
| **P-006 Presentation** | Consumes Diagnostic Report only |
| **P-007 Configuration** | Optional adjunct supplier of IO-010; never required for core Report |
| **P-008 Traceability** | May reference Report outputs; non-blocking |

Canonical chain:

```
Detection Results + Store Information (+ optional Configuration)
  → Diagnostic Report (P-005)
  → Presentation-ready View (P-006)
  → Completion Disposition (P-001)
```

---

## 9. Dependency Rules

| Rule | Requirement |
|---|---|
| **Depends on** | P-004 Detection |
| **Optionally depends on** | P-007 Configuration (adjunct only) |
| **Build order** | Implemented after P-004 and before P-006 (Package Build Order step 5) |
| **Downstream consumer** | P-006 Presentation consumes IO-009 |
| **Must not depend on** | Observation or Evidence for recollection |
| **Must not depend on** | Presentation |
| **Import direction** | `… → detection → reporting → presentation` |
| **Forbidden reverse edges** | Reporting ↛ Evidence recollection; Reporting ↛ Detection re-evaluation |
| **Runtime hosting** | RR-005 hosts P-005; must never own Evidence recollection or Detection re-evaluation |

---

## 10. ADR Compliance

| ADR | P-005 obligation |
|---|---|
| **ADR-001** | One Diagnostic Report per Investigation; no multi-Investigation aggregation |
| **ADR-002** | Respect immutable Evidence boundary—consume Detection outputs, not raw Evidence; never rewrite Normalized Evidence |
| **ADR-003** | Do not perform definition-driven Detection inside Reporting |
| **ADR-004** | Preserve Detection explanations/attribution; do not invent Evidence or explanations; Presentation consumes Report explainability |
| **ADR-005** | No browser re-query or Evidence recollection during assembly |
| **ADR-006** | Partial Reports remain valid; do not fabricate completeness to force Completed |

---

## 11. Engineering Principle Compliance

| Principle | P-005 obligation |
|---|---|
| **EP-003** | Do not strip Unknown Qualifications |
| **EP-007** | Do not invent Evidence during assembly |
| **EP-009 / EP-018** | Allow partial report completeness |
| **EP-010** | Preserve explainability produced upstream |
| **EP-011 / FR-026** | Core Report independent of Configuration |
| **EP-015** | Report remains attributable to one Investigation episode |
| **EP-016 / EP-017** | Assembly separate from Detection and Presentation |
| **EP-020** | Keep Reporting as assembly—not a second detection engine |

---

## 12. Testing Obligations

Derived from approved Testing Strategy and Test Execution Plan—no new test architecture:

| Obligation | Mapping |
|---|---|
| Report contains Store Information + Detection Results; core without Configuration; Unknowns preserved; no Evidence recollection | **VD-006**; **T4** (report side) |
| Ownership non-inversion | **VD-002** |
| Pipeline Assembly before Presentation | **VD-003** |
| Explainability preserved (not invented) | **VD-005**/ADR-004 continuity into Report |
| Milestone / checkpoint | **M5** / **RG-M5**; **IC-4** |
| Runtime assembly without recollection | **VD-008** at integration |

Verification must fail if Reporting evaluates Evidence, recollects Evidence, mutates Detection Results, strips Unknown Qualifications, requires Configuration for core Report, or invents explanations.

---

## 13. Package Completion Criteria

From Package Build Order (P-005) and Development Milestones (M5):

□ Owns Diagnostic Report (IO-009).  
□ Assembles Report from Detection outputs (Store Information, Detection Results, Unknown Qualifications).  
□ Core Report forms without Product Configuration.  
□ Does not recollect Evidence or re-evaluate Evidence.  
□ Does not mutate Detection Results or invent explanations.  
□ Does not own Presentation, Investigation lifecycle, or Configuration fetching.  
□ Partial Reports remain representable.  
□ One Report per Investigation.  
□ Repository ownership lives under `src/reporting/`.  
□ T4 report-side checks and IC-4 / RG-M5 criteria are met before M6 begins.

---

## 14. Definition of Done

Package P-005 is done for implementation sequencing when:

1. Architectural ownership in §2 is realized without redesign.  
2. Responsibilities in §3 are met and must-never-own rules in §4 hold.  
3. Inputs/outputs match §§5–6.  
4. Lifecycle rules in §7 hold for S-007.  
5. Collaborator and dependency rules in §§8–9 hold.  
6. ADR and EP compliance in §§10–11 hold (especially ADR-002, ADR-004, ADR-006).  
7. Testing obligations in §12 are satisfied at M5.  
8. Package completion criteria in §13 are checked.  
9. No report rendering, UI behavior, browser APIs, Evidence acquisition, Detection algorithms, confidence calculations, formatting implementation, or code were introduced as Reporting ownership in this specification.

---

## 15. Conclusion

P-005 Reporting assembles one Diagnostic Report per Investigation from Detection outputs, preserves explainability and Unknown Qualifications, allows partial completeness, and never requires Configuration for core content. It does not evaluate Evidence, rewrite Detection Results, or render UI—Presentation consumes the Report.

This specification is ownership and obligation only. Implementation mechanisms remain outside its scope.

---

**End of P-005 Reporting Package Specification.**
