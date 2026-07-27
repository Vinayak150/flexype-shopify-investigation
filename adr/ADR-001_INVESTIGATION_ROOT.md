# ADR-001 — Investigation Root

## 1. Status

| Field | Value |
|---|---|
| **Status** | Accepted |
| **Date** | Architecture baseline approval |
| **Decision Owner** | Architecture |

---

## 2. Context

The system performs storefront diagnostics for FlexyPe Sales and Support against the currently opened Shopify storefront (Assignment Objective; C-002; Vision §3.1).

Without a single architectural root for each diagnostic episode:

- **Evidence fragments** — observables could accumulate without a shared consistency boundary (contradicts ADR-002 intent / Data Flow Normalized Evidence immutability).  
- **Reporting ambiguity** — it would be unclear which Evidence and Detection Results belong in one Diagnostic Report (FR-020; Reporting Package ownership).  
- **Presentation ambiguity** — the Operator-facing view could mix conclusions from multiple storefront contexts (UI Architecture consumes one Diagnostic Report).  
- **Lifecycle ambiguity** — Initiation, Completion, and Completed Partial dispositions would lack a single unit of work (Pipeline S-001 / S-009; Domain Investigation).

Approved architecture already defines **Investigation** as the unit of diagnostic work targeting exactly one Storefront (Domain D-002; Domain INV-001; System R-001; Pipeline P-INV-001). This ADR records that decision; it does not invent it.

---

## 3. Decision

**An Investigation is the architectural root of the entire system for one diagnostic episode.**

Everything in that episode belongs to exactly one Investigation. The Investigation is the single consistency boundary.

Canonical chain:

```
One Investigation
    ↓
One Storefront Target
    ↓
One Evidence Collection
    ↓
One Detection Evaluation
    ↓
One Diagnostic Report
    ↓
One Presentation
    ↓
One Completion Disposition
```

**Forbidden under this decision:**

- Shared Investigations across storefronts  
- Merged Investigations  
- Cross-store Investigation  
- Multiple Diagnostic Reports from one Investigation  
- Presentation or Reporting that aggregates multiple Investigation roots as if they were one  

A new Storefront target requires a new Investigation (Domain INV-001; Extension Coordinator ownership of Investigation Context).

---

## 4. Decision Drivers

| Driver | Approved reasoning |
|---|---|
| **Consistency** | Multi-signal Evidence and Detection Results must be interpretable as one inspection episode (Detection Strategy; ADR-002 immutability of Normalized Evidence within the Investigation). |
| **Traceability** | Conclusions map cleanly to one Investigation Context and obligation IDs (EP-015; Traceability Package; IO-001). |
| **Ownership** | Investigation Coordination / Investigation Package / Extension Coordinator own the root; downstream packages consume that context (System R-001; Package P-001; Runtime RR-001). |
| **Reporting** | Diagnostic Assembly composes exactly one Diagnostic Report per Investigation (R-007; IO-009). |
| **Presentation** | Presentation-ready View projects one Report for the Operator popup (FR-020; PS-001/PS-009). |
| **Testing** | Pipeline and empirical checks (including FR-014) assume one Investigation traversal (Testing VD-003/VD-005). |
| **Evidence integrity** | Evidence Collection/Normalization are scoped to one Investigation (IO-004/IO-005; DF-INV-008). |
| **Pipeline integrity** | Stages S-001–S-009 describe one Investigation’s lifecycle (Pipeline §2–§3). |

---

## 5. Alternatives Considered

### 5.1 Multiple Investigations per Report

**Rejected.** Would break “one Diagnostic Report per Investigation” and make Completed Partial / Unknown-qualified dispositions ambiguous across roots. Contradicts Reporting and Pipeline completion semantics.

### 5.2 Shared Evidence pools across Investigations

**Rejected.** Would violate Investigation-scoped Evidence and Normalized Evidence immutability for a single consistency boundary (Data Flow DF-INV-001; Domain Evidence lifecycle). Risks cross-storefront contamination.

### 5.3 Independent reporting without Investigation root

**Rejected.** Reporting would lack a defined producer context and ownership handoff from Detection (System dependency direction; Package collaboration). Presentation could not guarantee FR-020 coherence.

### 5.4 Stateless architecture (no Investigation unit)

**Rejected.** Assignment and Vision require analysis of the *currently opened* storefront as an inspection episode (C-002). Stateless aggregation cannot uphold Pipeline outcomes (Completed / Completed Partial) or Coordinator disposition ownership.

No alternative above is introduced as new architecture; each is rejected because it conflicts with the already-approved baseline.

---

## 6. Consequences

### Positive

- Clear consistency boundary for Evidence, Detection Results, Report, and Presentation  
- Simple ownership: one Coordinator Context per episode  
- Testable lifecycle and disposition semantics  
- Prevents cross-storefront result mixing  

### Negative

- Operator must start a new Investigation to analyze a different Storefront target  
- SPA navigation without reload remains Unspecified (U-009); this ADR does not invent auto-merge or auto-refresh behavior  

### Trade-offs

- Favor episode integrity over multi-store batching (aligned with EP-013 investigation focus and C-010 anti–full-stack expansion)  
- Partial results stay inside one Investigation rather than spanning multiple roots (EP-018; ADR-006)

No implementation mechanics are prescribed.

---

## 7. Interaction with Architecture

| Document | Reliance on this decision |
|---|---|
| **Domain Model** | Investigation (D-002) targets one Storefront; INV-001 |
| **System Architecture** | R-001 owns Investigation; S-INV-009 |
| **Investigation Pipeline** | Entire S-001–S-009 traversal is one Investigation; P-INV-001 |
| **Detection Strategy** | Evaluation agenda and results are Investigation-scoped |
| **Data Flow** | IO-001 binds all downstream IO-* objects; DF-INV-008 |
| **Package Architecture** | P-001 owns Context and Completion Disposition |
| **Extension Architecture** | RR-001 hosts Investigation root; core collaboration chain hangs from it |
| **UI Architecture** | PS-001/PS-009 present one Investigation’s summary and status |
| **Testing Strategy** | VD-003 verifies one-Investigation lifecycle assumptions |

---

## 8. Verification

Implementation reviewers verify compliance architecturally by confirming:

1. Each diagnostic episode has exactly one Investigation Context.  
2. Evidence, Detection Results, Diagnostic Report, Presentation-ready View, and Completion Disposition for that episode share that same Investigation identity.  
3. No Report or Presentation aggregates multiple Storefront targets under one Investigation.  
4. Changing Storefront target implies a new Investigation, not an in-place merge.  
5. Package/Runtime ownership of Investigation remains with Investigation Package / Extension Coordinator—not Presentation or Detection.

Verification is architectural review against this ADR and the baseline docs. This section does not prescribe tooling, unit tests, or frameworks.

---

## 9. Notes

This ADR records an existing architectural decision already embodied in the approved baseline (Domain INV-001, Pipeline P-INV-001, System S-INV-009, Data Flow DF-INV-008, Package P-001, Runtime RR-001).

**It introduces no new architecture.**

---

**End of ADR-001.**
