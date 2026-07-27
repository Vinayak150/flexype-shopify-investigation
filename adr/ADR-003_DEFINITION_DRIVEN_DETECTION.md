# ADR-003 — Definition-Driven Detection

## 1. Status

| Field | Value |
|---|---|
| **Status** | Accepted |
| **Date** | Architecture baseline approval |
| **Decision Owner** | Architecture |

---

## 2. Context

Under ADR-001, detection occurs inside one Investigation. Under ADR-002, Detection consumes immutable Normalized Evidence for that Investigation.

The assignment requires FlexyPe product detection using **multiple publicly available signals** and forbids reliance on a **single hardcoded selector** (Part 2; C-004; C-005; FR-015). Detection Strategy already frames evaluation as definition-driven targeting of assignment/domain catalogs (products, disabled-integration forms, Part 1 fields)—not ad-hoc expansion (DP-005; DET-INV-004; DET-INV-006).

Without **definition-driven detection**:

- **Architecture becomes implementation-coupled** — CSS selectors, DOM paths, or ephemeral signatures would become the “architecture,” contradicting technology-independent Engineering Principles and Package runtime-agnostic packaging (EP-019; PKG-INV-010).  
- **Selector changes become architectural changes** — ordinary storefront/theme drift would force redesign of architectural truth rather than implementation adjustment.  
- **Maintainability degrades** — Detection Package could not evolve signal mechanisms under EP-019 without rewriting architecture.  
- **Traceability weakens** — conclusions would cite brittle implementation artifacts instead of obligation-linked definitions (FlexyPe Product set, FR-010–FR-017, Evidence Signal Classes).  
- **Evidence loses meaning** — Evidence Signal Classes would collapse into “whatever the selector scraped” rather than architectural categories (Detection Strategy §4; Domain D-013).

This ADR records the already-embodied decision; it does not invent new detection catalogs or close Open Unknowns (U-001/U-002 remain Open).

---

## 3. Decision

**Detection is definition-driven.**

Detection evaluates approved architectural definitions against immutable Normalized Evidence.

Detection is **not** driven by:

- individual CSS selectors  
- DOM paths  
- implementation heuristics as architectural truth  
- hardcoded signatures as architectural truth  
- single indicators as sole basis for FlexyPe Product presence  

Canonical chain:

```
Investigation
    ↓
Immutable Normalized Evidence
    ↓
Architectural Detection Definitions
    ↓
Detection Evaluation
    ↓
Detection Results
```

**Meaning of the decision:**

- Detection **evaluates definitions**.  
- Definitions express **architectural meaning** (e.g., FlexyPe Checkout / FlexyPass / FlexyCart presence; disabled-integration forms; Store Information fields; agenda items for Third-party Apps and Storefront Features even where method/definition remain Unknown).  
- Evidence **satisfies or fails to satisfy** those definitions under Detection Strategy outcome semantics (Detected, Not Detected, Disabled, Unknown, Available/Unavailable).  
- Selectors, heuristics, network observations, script inspection, metadata inspection, and similar techniques are **implementation mechanisms—not architecture**.  
- **No single selector** defines FlexyPe product detection (C-005; EP-008).  
- **No implementation artifact becomes architecture.**  

Implementation techniques may evolve. Architectural definitions and outcome semantics remain stable.

---

## 4. Decision Drivers

| Driver | Approved reasoning |
|---|---|
| **Architectural stability** | Definitions (product set, signal *classes*, disabled-form kinds) stay stable while mechanisms change (EP-019; Vision restraint against brittle single-selector design). |
| **Technology independence** | Principles and packages are technology-independent; detection architecture must not hardwire a browser API or selector dialect (EP constitution; Package logical-only model). |
| **Multi-signal philosophy** | FlexyPe Product presence requires corroboration across multiple Evidence Signal Classes; sole-basis single selector is forbidden (C-004; C-005; EP-008; Detection DP-004). |
| **Evidence semantics** | Evidence classes carry meaning (loaded JS assets, script URLs, DOM elements, HTML structure, globals, network requests, theme assets)—not “the selector string” (Detection Strategy §4; FR-015). |
| **Maintainability** | Detection Package owns evolvable definitions under maintainability of detection reasoning (NFR-005; EP-019; P-004). |
| **Traceability** | Results trace to FR/C obligations and domain catalogs, not ephemeral DOM paths (EP-001; EP-015). |
| **Testing** | Verification checks multi-signal posture and Not Detected semantics, not a frozen selector list as architecture (Testing VD-005; VP-009). |
| **Explainability** | Conclusions attribute to Evidence categories/definitions, not hidden one-off heuristics presented as architecture (EP-010; ADR-004 intent). |

---

## 5. Alternatives Considered

### 5.1 Selector-driven architecture

**Rejected.** Directly conflicts with C-005 and EP-008. Turns implementation selectors into architectural truth and couples architecture to theme/DOM churn.

### 5.2 DOM-driven architecture (DOM as sole architectural driver)

**Rejected.** DOM elements are one Evidence Signal Class among several (FR-015). Elevating DOM paths alone violates multi-signal validation (DP-004).

### 5.3 Hardcoded implementation signatures as architecture

**Rejected.** Conflicts with definition-driven targeting (DP-005), maintainability (EP-019), and “no implementation artifact becomes architecture.” Signatures may exist in implementation; they are not the architectural definition layer.

### 5.4 Single-signal detection

**Rejected.** Conflicts with C-004 / multi-signal requirement and Detection Strategy sufficiency rules (multiple categories reinforce confidence; single class insufficient as sole basis for FlexyPe Products).

No alternative is introduced as new architecture; each conflicts with the approved baseline.

---

## 6. Consequences

### Positive

- Architecture remains stable as storefront implementation details change  
- Detection Package can evolve mechanisms without redefining architectural meaning  
- Multi-signal and Not Detected semantics stay first-class  
- Traceability and testing attach to definitions and outcomes, not selector strings  

### Negative

- Requires maintaining explicit architectural definitions (product set, signal classes, disabled-form kinds, agenda obligations) separate from implementation tactics  
- Does not by itself supply missing definitions for U-001/U-002—those remain Open  

### Trade-offs

- Favor durable meaning over expedient single-selector “architecture”  
- Accept that implementation may use selectors/signatures **as mechanisms** while architecture forbids treating any one of them as the definition of product detection  

Architecture only—no implementation prescription.

---

## 7. Interaction with Architecture

| Document / ADR | Reliance on this decision |
|---|---|
| **Engineering Principles** | EP-008 Multi-Signal Validation; EP-019 Maintainability of Detection Reasoning; EP-001 Assignment Fidelity to defined products/forms |
| **Detection Strategy** | DP-004/DP-005; Evidence Signal Classes; DET-INV-004/DET-INV-006; evaluation over definitions + immutable Evidence |
| **Data Flow** | Detection consumes IO-005 and emits IO-007 without encoding selectors into information objects |
| **Package Architecture** | P-004 owns agenda and results; must not leak into Presentation; evolves definitions inside Detection Package |
| **Extension Architecture** | Detection Runtime hosts definition evaluation; Presentation Runtime must not become selector engine (EXT-INV-001/002) |
| **Testing Strategy** | VD-005 verifies multi-signal posture and rejects single-hardcoded-selector sole-basis acceptance |
| **ADR-001** | Definitions are evaluated per Investigation root |
| **ADR-002** | Definitions are evaluated against the immutable Normalized Evidence snapshot |

UI Architecture displays Detection Results produced under this decision; it does not define detection.

---

## 8. Verification

Reviewers confirm architectural compliance by checking:

1. **Detection evaluates definitions** (product/forms/agenda meanings), not a selector catalog treated as architecture.  
2. **Definitions remain implementation-independent** — changing a selector/heuristic does not require changing Domain/Detection Strategy meaning.  
3. **No single selector becomes architectural truth** for FlexyPe Product presence (C-005).  
4. **Detection consumes immutable Evidence** (ADR-002) when applying definitions.  
5. **Outcome semantics remain unchanged** (Detected / Not Detected / Disabled / Unknown / Available / Unavailable) despite implementation evolution.  
6. **FR-019/FR-022 remain on the agenda** even while U-001/U-002 stay Open—Unknown-qualified outcomes are valid; inventing catalogs is not.

Architecture verification only. No frameworks or tooling are prescribed.

---

## 9. Notes

This ADR records an existing architectural decision already embodied in C-004/C-005, EP-008/EP-019, Detection Strategy DP-004/DP-005, Package P-004 ownership, and Testing VD-005/VP-009.

**It introduces no new architecture.**

It does not close U-001 or U-002, invent feature/app taxonomies, or specify selectors.

---

**End of ADR-003.**
