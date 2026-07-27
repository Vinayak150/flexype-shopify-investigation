# ADR-006 — Partial Failure

## 1. Status

| Field | Value |
|---|---|
| **Status** | Accepted |
| **Date** | Architecture baseline approval |
| **Decision Owner** | Architecture |

---

## 2. Context

Under ADR-001–ADR-005, one Investigation performs one browser acquisition, freezes immutable Normalized Evidence, evaluates definition-driven detection, and produces explainable results for a single Diagnostic Report and Presentation.

The assignment and approved baseline already allow incompleteness without total failure:

- Theme Name is collected **if available** (FR-007).  
- FlexyPe Product presence yields **Not Detected** when confidence is insufficient (FR-013)—not a forced binary.  
- Part 3 explanation is provided **if possible** (FR-018; U-005 Open).  
- Objectives for third-party apps and storefront features remain in scope even when methods/definitions are Unknown (FR-019/FR-022; U-001/U-002).  
- Pipeline outcomes include **Completed Partial** and **Unknown-qualified** dispositions (Pipeline §6; EP-018 Progressive Completeness).  
- Data Flow and UI require Unknown Qualifications to remain visible; optional configuration absence must not block core reporting (DF-INV-003/004; UI-INV-002/003).

Without **explicit partial-completion semantics**:

- **One missing obligation could invalidate the whole Investigation** — contradicting EP-018 and Pipeline failure semantics that forbid treating every partial as total abortion.  
- **Uncertainty would be hidden** — violating EP-003/EP-009 and ADR-004 explainability.  
- **Operators would lose usable findings** — e.g., Store Information and product Not Detected outcomes discarded because Theme or Features are Unknown.  
- **Reporting would overstate certainty** — inventing Detected/Absent to “finish” the Report (conflicts with EP-007; DET-INV-001).  
- **Testing could not distinguish incomplete from incorrect** — VD domains require Unknown/Not Detected/Unavailable to remain explicit (TV-INV-004/006).

This ADR records that already-embodied decision. It does not invent recovery/retry, and it does not close Open Unknowns.

---

## 3. Decision

**An Investigation preserves all valid findings even when some obligations cannot be completed.**

The architecture explicitly represents uncertainty rather than failing the entire Investigation.

**Completed Partial**, **Unknown**, and **Unavailable** are valid architectural outcomes.

The system never fabricates certainty to achieve completion.

Canonical chain:

```
Investigation
    ↓
Evidence Acquisition
    ↓
Detection
    ↓
Reporting
    ↓
Completion Assessment
    ↓
Completed
or
Completed Partial
```

**Rules:**

- **Completed Partial is a successful architectural outcome** (not treated as Investigation failure by default).  
- **Unknown is an explicit architectural result** (including Unknown-qualified agenda items under Open U-*).  
- **Unavailable is an explicit architectural result** (e.g., Theme Name when not available).  
- **Not Detected** remains the required restraint outcome for insufficient-confidence FlexyPe Product presence (FR-013); it is not “failure,” and it must not be silently rewritten as Absent/Detected.  
- **Missing evidence never becomes invented evidence.**  
- **Incomplete evaluation never becomes false certainty.**  
- **Valid findings remain reportable** in the Diagnostic Report and Presentation.  
- **Only affected obligations remain Unknown/Unavailable** — incompleteness is localized, not broadcast as total invalidation.  

Optional Product Configuration missing/unavailable does not by itself force Investigation failure or block core Completed/Completed Partial (FR-026; EP-011).

---

## 4. Decision Drivers

| Driver | Approved reasoning |
|---|---|
| **Truthfulness** | Prefer honest Incomplete/Unknown/Not Detected over fabricated completion (EP-007; EP-004). |
| **Evidence-first reasoning** | Sparse Evidence and Open Unknowns constrain conclusions; they do not authorize invention (Detection DP-002/DP-007/DP-008). |
| **Operator usefulness** | Sales/Support still receive usable Part 1/Part 2/Part 3 findings when other items are incomplete (Vision mission; FR-023). |
| **Assignment fidelity** | “If available,” “Not Detected,” “if possible,” and Unknown-method Objectives are assignment-real (FR-007; FR-013; FR-018; FR-019; FR-022). |
| **Representable uncertainty** | EP-009; Domain Detection Result states; Pipeline Unknown-qualified outcomes. |
| **Testing** | Distinguish incomplete from incorrect (TV-INV-004; VD-005/VD-007). |
| **Explainability** | Uncertainty itself must be explainable/explicit (ADR-004; EP-003). |
| **Architectural resilience** | Progressive completeness under signal variance and permission limits without Admin fallback (EP-018; U-007; Pipeline §7). |

---

## 5. Alternatives Considered

### 5.1 Fail entire Investigation on any missing obligation

**Rejected.** Conflicts with EP-018, Pipeline Completed Partial, Theme “if available,” and Operator usefulness of remaining valid findings.

### 5.2 Assume missing equals Not Detected (for all fields)

**Rejected.** Not Detected is specifically required for insufficient-confidence **FlexyPe Product** presence (FR-013). Applying it universally would invent semantics and can suppress true Unknowns (U-003 remains Open for breadth beyond products).

### 5.3 Invent default answers to force Completed

**Rejected.** Violates EP-007, DET-INV-001, ADR-004 (no opaque/false certainty), and Unknown preservation (EP-003).

### 5.4 Suppress partial findings until everything is complete

**Rejected.** Would hide usable diagnostics from Operators and contradict Reporting/UI requirements to present obligated sections with explicit incompleteness (FR-020; UI-P-002/UI-P-003).

No alternative is introduced as new architecture; each conflicts with the approved baseline.

---

## 6. Consequences

### Positive

- Investigations remain useful under incomplete Evidence or Open Unknowns  
- Uncertainty stays visible and explainable  
- Verification can separate incompleteness from incorrectness  
- Aligns with assignment language (“if available,” Not Detected, “if possible”)  

### Negative

- Operators may receive Reports that are intentionally incomplete  
- Completion Assessment must distinguish Completed vs Completed Partial rather than a single boolean “done”  

### Trade-offs

- Favor truthful partial results over false total completion  
- Localize incompleteness to affected obligations rather than failing the Investigation root (ADR-001 still holds—one Investigation, possibly Partially Completed)  

Architecture only—no retry/recovery implementation.

---

## 7. Interaction with Architecture

| Document / ADR | Reliance on this decision |
|---|---|
| **Engineering Principles** | EP-018 Progressive Completeness; EP-009 Representable Uncertainty; EP-003 Unknown Preservation |
| **Investigation Pipeline** | Outcomes Completed / Completed Partial / Unknown-qualified; §7 incompleteness handling |
| **Detection Strategy** | Not Detected, Unknown, Available/Unavailable; DP-008/DP-009; no false certainty |
| **Reporting** | Assembles whatever valid Store Information and Detection Results exist; preserves Unknown Qualifications; core Report without optional config |
| **UI Architecture** | Surfaces Not Detected/Unknown/Unavailable; Investigation Status may show Completed Partial; must not bury Unknowns |
| **Testing Strategy** | TV-INV-004/006; Unknown preservation; Not Detected not treated as suite failure by default |
| **ADR-001** | Partial completion still occurs inside one Investigation root |
| **ADR-002** | Partial results are derived from the immutable snapshot—not by inventing missing Evidence |
| **ADR-003** | Definitions still evaluate; unsatisfied/underspecified definitions yield Not Detected/Unknown—not fabricated Detected |
| **ADR-004** | Incomplete outcomes remain explainable as such |
| **ADR-005** | Single acquisition may yield sparse Evidence; incompleteness is handled by partial semantics, not by mid-Investigation rescans |

---

## 8. Verification

Reviewers confirm architectural compliance by checking:

1. **Completed Partial is preserved** as a valid successful disposition when allowed incompleteness exists.  
2. **Unknown is represented explicitly** where definitions/methods/Evidence cannot honestly conclude.  
3. **Unavailable is represented explicitly** for availability-sensitive fields (e.g., Theme Name).  
4. **No fabricated certainty** — missing Evidence is not invented; Open Unknowns are not silently closed.  
5. **Valid findings remain visible** in Report and Presentation even when other obligations are incomplete.  
6. **Only affected obligations remain unresolved** — incompleteness is not used to discard unrelated valid results.  
7. **Not Detected** for FlexyPe Products under insufficient confidence is accepted, not treated as total Investigation failure.  

Architecture verification only. No tooling or frameworks are prescribed.

---

## 9. Notes

This ADR records an existing architectural decision already embodied in EP-018/EP-009/EP-003, Pipeline Completed Partial semantics, Detection outcome restraint, Data Flow/UI Unknown visibility, and assignment “if available” / Not Detected / “if possible” language.

**It introduces no new architecture.**

Filename uses **Partial Failure** as the historical ADR title; the decision’s constructive meaning is **explicit partial completion and representable uncertainty**, not “the Investigation failed.”

It does not define retry, remediation, or close U-001–U-010.

---

**End of ADR-006.**
