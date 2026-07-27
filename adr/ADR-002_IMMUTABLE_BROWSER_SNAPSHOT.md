# ADR-002 — Immutable Browser Snapshot

## 1. Status

| Field | Value |
|---|---|
| **Status** | Accepted |
| **Date** | Architecture baseline approval |
| **Decision Owner** | Architecture |

---

## 2. Context

Under ADR-001, one Investigation is the consistency boundary for one Storefront diagnostic episode. Within that Investigation, public Storefront observations are collected as Evidence and consolidated into **Normalized Evidence** (Pipeline S-003 → S-004; Data Flow IO-004 → IO-005; Evidence Package P-003).

Without treating Normalized Evidence as an **immutable architectural snapshot** for that Investigation:

- **Detection could reinterpret observations** by rewriting Evidence to fit preferred Detected/Disabled outcomes (violates Detection Strategy DP-002 / DET-INV-002; Evidence Package must-never conclude Detected).  
- **Reporting could rewrite history** by altering upstream Evidence while assembling the Diagnostic Report (violates Reporting Package PKG-INV-003 and Data Flow DF-INV-005).  
- **Presentation could mutate conclusions** by reaching past the Report into mutable observations (violates UI-INV-001; Presentation consumes Report only).  
- **Verification would become non-repeatable** — the same Investigation could not be reasoned about as a stable evidence basis (Testing VD-004; VP-005).

Approved architecture already states that Normalized Evidence is immutable for downstream Evaluation, Assembly, and Presentation within the Investigation (Data Flow DF-INV-001; Package PKG-INV-007; Extension EXT-INV-003; Domain Evidence lifecycle / ADR-002 intent references). This ADR records that decision; it does not invent it.

This decision sits inside ADR-001’s Investigation root: the immutable snapshot is per Investigation, not a global shared pool.

---

## 3. Decision

**Once browser observations have been collected and transformed into Normalized Evidence, they become the immutable architectural snapshot for that Investigation.**

Everything downstream consumes this immutable Evidence. Nothing downstream modifies it.

Canonical chain:

```
Browser Observation
    ↓
Evidence Collection
    ↓
Evidence Normalization
    ↓
Immutable Normalized Evidence
    ↓
Detection
    ↓
Reporting
    ↓
Presentation
```

**Rules:**

- Normalized Evidence becomes **read-only** for the remainder of the Investigation.  
- **Detection** consumes Normalized Evidence; it does not rewrite it.  
- **Reporting** consumes Detection Results (and Store Information); it does not rewrite Normalized Evidence.  
- **Presentation** consumes the Diagnostic Report only; it does not consume or mutate Evidence.  
- **No downstream mutation** of Normalized Evidence.  
- **No re-normalization** after handoff to Detection for the same Investigation.  
- **No evidence rewriting** to force Detected, Disabled, or other outcomes.  

A new Investigation (ADR-001) implies a new observation → collection → normalization cycle and a new immutable snapshot.

---

## 4. Decision Drivers

| Driver | Approved reasoning |
|---|---|
| **Evidence integrity** | Evidence must not invent or alter storefront facts (EP-007; Domain INV-003; DET-INV-002). |
| **Repeatability** | One Investigation’s evaluation basis stays stable so outcomes can be reasoned about and verified (Testing VD-004; VP-005). |
| **Explainability** | Detected/Disabled conclusions remain attributable to a fixed Evidence set (EP-010; ADR-004 intent; Detection explainability). |
| **Traceability** | Obligation-linked conclusions refer to a stable Evidence snapshot within Investigation Context (EP-015; IO-001 + IO-005). |
| **Testing** | Architecture verification can assume Evidence is normalized once and not rewritten (TV-INV related Evidence immutability; DF-INV-001). |
| **Ownership** | Evidence Package owns normalization; Detection/Reporting/Presentation must never own Evidence mutation (P-003; PKG-INV-001; PKG-INV-007). |
| **Pipeline consistency** | Consolidation (S-004) precedes Evaluation (S-005/S-006); later stages do not reopen normalization (Pipeline §4). |

---

## 5. Alternatives Considered

### 5.1 Mutable Evidence throughout the Investigation

**Rejected.** Conflicts with DF-INV-001, PKG-INV-007, EXT-INV-003, and Detection “no invented/altered facts” posture. Enables conclusion-driven rewriting.

### 5.2 Repeated normalization after Detection begins

**Rejected.** Conflicts with Pipeline transition rules (Consolidation before Evaluation) and Data Flow “Normalized Evidence is the last mutable Evidence form.” Would make Detection and Reporting operate on a moving basis.

### 5.3 Detection modifying Evidence

**Rejected.** Detection Package/Runtime must never rewrite Evidence; it produces Detection Results from Normalized Evidence (P-004; DET-INV-002; System R-006 Non-Goals).

### 5.4 Presentation consuming raw observations

**Rejected.** Presentation consumes Diagnostic Report only (UI-P-001; DF-INV-002; EXT-INV-001). Raw/mutable observation access would bypass Assembly and enable presentation-side evaluation leakage.

No alternative is offered as new architecture; each conflicts with the approved baseline.

---

## 6. Consequences

### Positive

- Stable evaluation basis within one Investigation  
- Clear ownership handoff after normalization  
- Supports explainability and repeatable verification  
- Prevents Reporting/Presentation from rewriting observational history  

### Negative

- If Storefront content changes after snapshot formation, this Investigation does not silently “update” Evidence mid-flight  
- Addressing a new Storefront state requires a new Investigation (ADR-001), not in-place Evidence mutation  

### Trade-offs

- Favor snapshot integrity over live-updating Evidence during a single Investigation (aligned with ADR-001 consistency boundary and EP-018 partial completeness rather than continuous mutation)  
- U-009 (SPA navigation without reload) remains Open; this ADR does not invent auto-resnapshot behavior  

Architecture only—no implementation mechanics.

---

## 7. Interaction with Architecture

| Document | Reliance on this decision |
|---|---|
| **Domain Model** | Evidence collected then interpreted within Investigation; facts not invented (D-012; INV-003) |
| **Investigation Pipeline** | S-003 → S-004 produce evaluation-ready Evidence; S-005/S-006 consume it without reopening collection/normalization ownership |
| **Detection Strategy** | Evaluation reasons over a fixed Evidence set; multi-signal corroboration does not rewrite Evidence (DP-001/DP-002) |
| **Data Flow** | IO-005 immutability; DF-INV-001; forbidden conclusion-driven Evidence edits |
| **Package Architecture** | P-003 produces Normalized Evidence; Detection/Reporting/Presentation must not mutate it (PKG-INV-007) |
| **Extension Architecture** | Evidence Runtime hands off immutable Normalized Evidence to Detection Runtime (EXT-INV-003) |
| **Testing Strategy** | VD-004 verifies public authority + immutability; fails intent if Evidence is rewritten to fit outcomes |
| **ADR-001** | Snapshot scope is one Investigation; no shared mutable pool across Investigations |

UI Architecture relies indirectly: it never receives Evidence to mutate—only the Report projection.

---

## 8. Verification

Reviewers confirm architectural compliance by checking:

1. **Evidence is normalized once** per Investigation before Detection evaluation begins.  
2. **Evidence is never rewritten** after normalization by Detection, Reporting, Presentation, or Configuration.  
3. **Detection consumes immutable Normalized Evidence** and emits Store Information / Detection Results without altering that Evidence.  
4. **Reporting consumes Detection Results** (and Store Information), not a reopened mutable Evidence stream.  
5. **Presentation never consumes mutable Evidence**—only the Diagnostic Report / Presentation-ready View.  

This is architecture verification only. No frameworks or tooling are prescribed.

---

## 9. Notes

This ADR records an existing architectural decision already embodied as Data Flow DF-INV-001, Package PKG-INV-007, Extension EXT-INV-003, Pipeline consolidation-before-evaluation, and Detection Strategy no-alteration rules.

**It introduces no new architecture.**

Filename note: recorded as **Immutable Browser Snapshot** to emphasize that the snapshot originates from public browser/Storefront observation within an Investigation; it is the same decision previously referenced in the baseline as “Immutable Snapshot” / ADR-002 intent.

---

**End of ADR-002.**
