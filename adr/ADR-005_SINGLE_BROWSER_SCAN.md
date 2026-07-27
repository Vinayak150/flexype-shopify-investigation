# ADR-005 — Single Browser Scan

## 1. Status

| Field | Value |
|---|---|
| **Status** | Accepted |
| **Date** | Architecture baseline approval |
| **Decision Owner** | Architecture |

---

## 2. Context

Under ADR-001, one Investigation targets one Storefront. Under ADR-002, Normalized Evidence becomes the immutable snapshot for that Investigation. Detection (ADR-003), explainable results (ADR-004), Reporting, and Presentation all consume that Investigation-scoped chain—not a live-updating observation stream.

The Investigation Pipeline already places Browser Observation and Evidence Acquisition/Consolidation **before** Evaluation, Assembly, Presentation, and Completion (S-002 → S-003 → S-004 before S-005–S-009). System and Package dependency direction forbids Presentation/Reporting from recollecting Evidence or depending on Observation for re-evaluation (System §5; PKG-INV-003; DF-INV-005). Core path is a browser-local investigation instrument producing popup diagnostics without backend (EP-005; ADR-005 intent in baseline; C-006/C-007).

Without a **single browser acquisition phase** per Investigation:

- **Downstream stages could observe different storefront states** — Detection mid-flight could see a different page than Collection saw, breaking snapshot consistency (ADR-002).  
- **Detection could re-query the browser** — collapsing definition-driven evaluation over immutable Evidence into live DOM fishing (conflicts with ADR-002/ADR-003 and Pipeline order).  
- **Reporting could depend on live state** — Diagnostic Report would no longer be an assembly of evaluated snapshot results (R-007).  
- **Presentation could diverge from Evidence** — Operator view could show truths not present in the Report/Evidence chain (UI-INV-001; EXT-INV-001).  
- **Repeatability would degrade** — verification could not reason about one Evidence basis (Testing VD-004; VP-005).

This ADR records the already-embodied single-acquisition decision. It does not invent timing APIs, and it does not close U-009 (SPA navigation without reload remains Open—no auto-rescan architecture is introduced).

---

## 3. Decision

**One Investigation performs one browser acquisition pass.**

All browser observations required for that Investigation are collected during that acquisition phase.

After normalization, downstream stages operate exclusively on the immutable Evidence snapshot.

The browser is not repeatedly queried during Detection, Reporting, Presentation, or Completion.

A different browser state requires a new Investigation (ADR-001).

Canonical chain:

```
Investigation
    ↓
Browser Observation
    ↓
Evidence Collection
    ↓
Evidence Normalization
    ↓
Immutable Snapshot
    ↓
Detection
    ↓
Reporting
    ↓
Presentation
    ↓
Completion
```

**Rules:**

- **Browser acquisition occurs once** per Investigation (Observation + Collection + Normalization as the acquisition phase).  
- **Everything downstream consumes the snapshot** (immutable Normalized Evidence → Detection Results → Diagnostic Report → Presentation-ready View).  
- **No downstream browser access** for forming or revising Detection Results, Report truths, or Presentation conclusions.  
- **No repeated acquisition** and **no incremental browser rescans within the Investigation.**  
- **A changed storefront requires a new Investigation**, not an in-place rescan of the same Investigation root.  

Optional Configuration Runtime (bonus) remains an adjunct to Reporting and is not a second browser acquisition of Storefront Evidence for core detection (EP-011; FR-026).

---

## 4. Decision Drivers

| Driver | Approved reasoning |
|---|---|
| **Consistency** | One Investigation / one snapshot prevents mixed-state Evidence (ADR-001; ADR-002; Domain INV-001). |
| **Repeatability** | Stable acquisition basis enables explainable, verifiable outcomes (ADR-004; Testing VD-004). |
| **Evidence integrity** | No conclusion-driven re-query of the live Storefront (EP-007; DET-INV-002). |
| **Pipeline separation** | Observation/Acquisition before Evaluation/Assembly/Presentation (Pipeline §4; S-INV-002/S-INV-003). |
| **Architecture layering** | Observation/Evidence packages own browser-facing collection; Detection/Reporting/Presentation do not (P-002/P-003 vs P-004–P-006). |
| **Testing** | Verification can assume one acquisition then snapshot consumption (VD-003/VD-004; TV-INV related ownership). |
| **Ownership** | Storefront/Evidence Runtimes perform acquisition; Detection/Reporting/Presentation Runtimes consume outputs (RR-002/RR-003 vs RR-004–RR-006). |
| **Architectural simplicity** | Single scan aligns with investigation-instrument focus and browser-local core—not a continuous monitoring platform (EP-013; EP-020; C-010). This is structural simplicity, not a performance SLA (U-010 remains Open). |

---

## 5. Alternatives Considered

### 5.1 Detection rescanning the browser

**Rejected.** Violates ADR-002 immutability and Pipeline consolidation-before-evaluation. Turns Detection Runtime into a second Observation/Evidence owner (PKG-INV-001 / ownership inversion).

### 5.2 Reporting querying the live storefront

**Rejected.** Reporting assembles Detection Results and Store Information; it must never recollect Evidence (PKG-INV-003; R-007 Non-Goals).

### 5.3 Presentation reading browser state

**Rejected.** Presentation consumes Diagnostic Report only (UI-P-001; DF-INV-002; EXT-INV-001). Live browser reads in Presentation create evaluation leakage and Report divergence.

### 5.4 Incremental browser refresh inside the same Investigation

**Rejected.** Conflicts with single consistency boundary (ADR-001) and immutable snapshot (ADR-002). A new browser state is a new Investigation, not an intra-Investigation rescan. U-009 remains Open regarding when navigation implies a new Investigation—this ADR does not invent auto-refresh rules.

No alternative is introduced as new architecture; each conflicts with the approved baseline.

---

## 6. Consequences

### Positive

- Stable, consistent Evidence basis for Detection, Reporting, Presentation, and Completion  
- Clear package/runtime ownership of acquisition vs evaluation vs presentation  
- Supports explainability and repeatable verification  
- Aligns with browser-local, single-episode investigation tool intent  

### Negative

- Storefront changes after acquisition are not reflected inside the same Investigation  
- Operator must start a new Investigation to capture a new browser state  

### Trade-offs

- Favor snapshot consistency over live continuous observation  
- Leave SPA navigation policy as Open (U-009) rather than inventing rescan architecture  

Architecture only—no implementation scheduling or API usage.

---

## 7. Interaction with Architecture

| Document / ADR | Reliance on this decision |
|---|---|
| **Investigation Pipeline** | S-002–S-004 are the acquisition phase; S-005–S-009 do not reopen browser acquisition |
| **Data Flow** | IO-002 → IO-004 → IO-005 then immutable downstream; no reverse flow to Observation |
| **Package Architecture** | P-002/P-003 own acquisition; P-004–P-006 consume; no Presentation→Evidence dependency |
| **Extension Architecture** | Storefront/Evidence Runtimes acquire once; Detection/Reporting/Presentation Runtimes consume snapshot outputs (RP-002; EXT-INV-003) |
| **Testing Strategy** | VD-003/VD-004 verify acquisition-before-evaluation and snapshot authority |
| **ADR-001** | One acquisition pass per Investigation root |
| **ADR-002** | Acquisition output becomes the immutable snapshot |
| **ADR-003** | Definitions evaluated against that snapshot—not against repeated live queries |
| **ADR-004** | Explanations attribute to the acquired snapshot Evidence, not a later live DOM state |

UI Architecture displays Report truths produced from the single-scan chain; it does not scan.

---

## 8. Verification

Reviewers confirm architectural compliance by checking:

1. **Browser acquisition occurs once** per Investigation (Observation → Collection → Normalization).  
2. **Evidence snapshot becomes authoritative** after normalization (ADR-002).  
3. **Downstream stages consume snapshot-derived outputs only** (Detection Results / Store Information / Report / View).  
4. **No downstream browser dependency** for revising Detection, Reporting, Presentation, or Completion truths.  
5. **New browser state starts a new Investigation** (ADR-001)—not an in-Investigation rescan.  
6. **Optional Configuration** does not substitute as a second Storefront Evidence acquisition for core detection.  

Architecture verification only. No tooling or frameworks are prescribed.

---

## 9. Notes

This ADR records an existing architectural decision already embodied in Pipeline stage order, Data Flow immutability, Package/Runtime ownership separation, EP-005 browser-local investigation posture, and prior ADR-001/ADR-002 consistency rules.

**It introduces no new architecture.**

It does not define Chrome APIs, acquisition timing mechanisms, or close U-009.

---

**End of ADR-005.**
