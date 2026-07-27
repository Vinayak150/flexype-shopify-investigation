# ADR-004 — Explainable Results

## 1. Status

| Field | Value |
|---|---|
| **Status** | Accepted |
| **Date** | Architecture baseline approval |
| **Decision Owner** | Architecture |

---

## 2. Context

Under ADR-001, conclusions belong to one Investigation. Under ADR-002, they are formed from an immutable Normalized Evidence snapshot. Under ADR-003, Detection evaluates architectural definitions against that Evidence—not opaque single-selector “architecture.”

The assignment and Vision require support-usable diagnostics: Part 3 asks for snippet or reason when an integration is considered disabled when possible (FR-018; Vision §7 explainability value). Detection Strategy already requires attributability for Detected/Disabled claims, explicit Unknowns, and no hidden assumptions (EP-010; Detection §7; Domain INV-004).

Without **explainable results** as an architectural property:

- **Operators cannot understand conclusions** — Sales/Support would see labels without Evidence grounding (FR-023; UI presentation of findings).  
- **Traceability to requirements weakens** — outcomes would detach from Evidence and obligation IDs (EP-015; Traceability Package).  
- **Verification becomes difficult** — Testing could not confirm Evidence-before-conclusion or catch false certainty (VD-005; VP-005/VP-006).  
- **Evidence integrity loses value** — immutable snapshot (ADR-002) would not matter if conclusions ignore it.  
- **Reporting becomes opaque** — Diagnostic Report would carry claims without preservable attribution through Assembly to Presentation (R-007; DF-INV-005).

This ADR records the already-embodied decision that explainability is architectural—not merely a UI flourish. It does not invent confidence scores, UI copy, or close U-005 (explanation depth).

---

## 3. Decision

**Every Detection Result and every conclusion presented to the Operator must be explainable from the immutable Evidence collected during the Investigation.**

Architecture does not permit opaque or unexplained conclusions.

**Explainability is an architectural property—not merely a UI feature.**

Canonical chain:

```
Investigation
    ↓
Immutable Normalized Evidence
    ↓
Definition-driven Detection
    ↓
Detection Results
    ↓
Explainable Diagnostic Report
    ↓
Presentation
```

**Rules:**

- Every reported conclusion must be **attributable to Evidence** (or explicitly Unknown / Not Detected / Unavailable under approved outcome semantics when Evidence is insufficient or definitions/methods are Open).  
- **Evidence supports conclusions.**  
- **Conclusions never invent Evidence.**  
- **Reporting preserves explainability** produced upstream; it does not invent new observational facts.  
- **Presentation communicates explainability but does not create it** (surfaces Report attribution/explanation intent; does not fabricate Part 3 reasons).  
- **Unknown outcomes remain explainable** as explicitly Unknown-qualified—not relabeled into false Detected/Absent certainty.  
- **Not Detected** remains a legitimate, explainable restraint outcome for insufficient-confidence FlexyPe Product presence (FR-013)—explainable as insufficient Evidence under multi-signal rules, not as silence.  

Part 3 bonus explanation/snippet intent (FR-018) is included when present in the Report; depth remains U-005 Open. Absence of a snippet does not authorize inventing one in Presentation (UI-P-009; UI-RISK-008).

---

## 4. Decision Drivers

| Driver | Approved reasoning |
|---|---|
| **Operator trust** | Internal tool for Sales/Support pre-onboarding inspection requires understandable diagnostics (Vision mission; FR-023; EP-013). |
| **Assignment fidelity** | Part 3 bonus explanation; multi-signal Evidence-backed product claims; Not Detected when not confident (FR-016–FR-018; FR-013; FR-015). |
| **Traceability** | Conclusions link to Evidence and obligation IDs (EP-001; EP-015; Assignment Obligation Reference). |
| **Evidence integrity** | Immutable snapshot is valuable only if conclusions remain grounded in it (ADR-002; EP-007; Domain INV-004). |
| **Testing** | Verification domains check attributability and reject invented information (VD-005; TV-INV-003). |
| **Reporting** | Diagnostic Report must carry Detection Results without stripping Unknown Qualifications or inventing facts (DF-INV-003; PKG-INV-008). |
| **Maintainability** | Definition-driven detection (ADR-003) plus explainability keeps meaning reviewable as mechanisms evolve (EP-019). |

---

## 5. Alternatives Considered

### 5.1 Opaque detection (“trust the boolean”)

**Rejected.** Conflicts with EP-007/EP-010, Domain INV-004, and operator-facing investigation purpose. Prevents verification of Evidence-before-conclusion.

### 5.2 Score-only reporting

**Rejected.** Detection Strategy explicitly forbids confidence-number explainability as architecture (Detection §7: no confidence numbers). Scores would invent non-assignment machinery (NFR-008/U-010 posture against invented metrics).

### 5.3 UI-generated explanations

**Rejected.** Presentation communicates but does not create explainability (UI-P-009; UI-INV-004; EXT-INV-001). UI-invented Part 3 reasons are explicitly a presentation risk (UI-RISK-008).

### 5.4 Heuristic-only conclusions as architectural truth

**Rejected.** Conflicts with ADR-003 (definition-driven detection) and multi-signal rules. Heuristics may exist in implementation mechanisms; they are not a license for unexplained architectural conclusions.

No alternative is introduced as new architecture; each conflicts with the approved baseline.

---

## 6. Consequences

### Positive

- Operators can relate findings to Evidence-backed meaning  
- Reporting/Presentation chain preserves attribution rather than inventing it  
- Verification can challenge opaque Detected/Disabled claims  
- Aligns Part 3 explanation intent with broader Evidence-before-conclusion philosophy  

### Negative

- Requires Detection/Reporting to retain enough attribution structure for explainability (not specified as UI widgets here)  
- Does not mandate a minimum prose depth for Part 3 (U-005 remains Open)  

### Trade-offs

- Favor attributable outcomes over opaque “smart” booleans  
- Prefer explicit Unknown / Not Detected over unexplained forced certainty (EP-009; EP-003)  

Architecture only—no implementation formats.

---

## 7. Interaction with Architecture

| Document / ADR | Reliance on this decision |
|---|---|
| **Engineering Principles** | EP-007 Evidence before conclusion; EP-010 Explainability Where Demanded; EP-009 Representable Uncertainty; EP-004 No Silent Assumptions |
| **Detection Strategy** | §7 Explainability; DP-006; DET-INV-001; attributability of Detected/Disabled |
| **Data Flow** | Evidence → Results → Report → View without inventing facts; Unknown Qualifications preserved |
| **Reporting Package** | Assembles explainable Report; must not strip Unknowns or recollect/invent Evidence (P-005; PKG-INV-003/008) |
| **UI Architecture** | PS-003/PS-004/PS-008 surface outcomes and Unknowns; communicates explanation intent when present; never creates it |
| **Testing Strategy** | VD-005/VD-006/VD-007 verify attributability, Unknown visibility, presentation neutrality |
| **ADR-001** | Explainability scoped to one Investigation’s Evidence and Report |
| **ADR-002** | Explanations refer to the immutable Evidence snapshot |
| **ADR-003** | Explanations attach to definition-driven evaluation over Evidence classes—not to a lone selector-as-architecture |

---

## 8. Verification

Reviewers confirm architectural compliance by checking:

1. **Every reported Detected/Disabled conclusion traces to Evidence** (attributability).  
2. **Not Detected / Unknown / Unavailable** remain explicit and are not replaced by unexplained substitutes.  
3. **Reporting preserves reasoning/attribution** produced by Detection; it does not invent observational facts.  
4. **Presentation does not invent explanations** (especially Part 3 snippets/reasons not present in the Report).  
5. **Unknown remains explainable** as Unknown-qualified, not silently coerced.  
6. **Evidence remains authoritative** — conclusions do not outrun the immutable snapshot (ADR-002).  

Architecture verification only. No tooling or frameworks are prescribed.

---

## 9. Notes

This ADR records an existing architectural decision already embodied in EP-007/EP-010, Detection Strategy explainability rules, Domain INV-004, Reporting/UI “communicate don’t create,” and Testing attributability checks.

**It introduces no new architecture.**

It does not prescribe UI copy, confidence scores, explanation templates, or close U-005.

---

**End of ADR-004.**
