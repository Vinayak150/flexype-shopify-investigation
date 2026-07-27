# 00 — Implementation Plan

**Status:** Active — Implementation Phase  
**Document type:** Master implementation planning (not architecture; not code)  
**Architecture status:** COMPLETE and FROZEN (`architecture/00`–`13`; ADR-001–ADR-006 approved)

This document explains **how** the approved architecture will be implemented. It does not redesign architecture, invent packages, define APIs, or prescribe detailed source trees.

---

## 1. Purpose

Provide a single master plan for implementing the FlexyPe Shopify Store Diagnostics Chrome Extension under the approved, frozen architecture baseline.

This plan establishes:

- Implementation philosophy and sequencing  
- Milestone order derived from package/runtime dependency direction  
- Testing checkpoints aligned with `12_TESTING_STRATEGY`  
- Freeze and change-control rules that protect ADRs and architecture documents  

---

## 2. Scope

### In scope

- Planning the implementation of core path obligations (Parts 1–3, Objective diagnostics, popup presentation, browser-local operation)  
- Sequencing work by architectural dependency (Investigation → Observation → Evidence → Detection → Reporting → Presentation)  
- Preserving optional Configuration as non-blocking  
- Continuous verification against architecture invariants and Unknown preservation  

### Out of scope

- Redesigning Domain, System, Pipeline, Detection, Data Flow, Package, Extension, UI, or Testing architecture  
- Editing approved ADRs or architecture documents as part of normal implementation  
- Detailed folder layout (belongs in a subsequent implementation document)  
- Code, APIs, interfaces, frameworks, CI tooling choices as architectural decisions  
- Closing Open Unknowns U-001–U-010 by invention  

---

## 3. Relationship to Architecture

| Architecture artifact | Role during implementation |
|---|---|
| Vision / Requirements / Principles | Bound scope, obligations, and constitutional rules |
| Traceability Matrix | Ownership and verification targets for each FR/NFR/C/U |
| Domain Model | Canonical vocabulary—implementation must not rename meaning |
| System / Pipeline / Data Flow | Responsibility order and information handoffs |
| Detection Strategy + ADR-003/004/006 | Outcome semantics and evidence philosophy |
| Package Architecture | Logical implementation units and dependency direction |
| Extension Architecture | Runtime role hosting map for Chrome Extension delivery |
| UI Architecture | Presentation section order and neutrality rules |
| Testing Strategy | Verification domains (VD-001–VD-009) |
| Architecture Review | Implementation authorization already granted |
| ADR-001–ADR-006 | Frozen decisions; implementation must comply |

Implementation realizes architecture. Architecture does not chase implementation.

---

## 4. Architectural Freeze Policy

1. **Architecture is frozen.** Documents `architecture/00`–`13` and ADR-001–ADR-006 are not casually edited during implementation.  
2. **Implementation issues are fixed in code** (and in implementation planning docs), not by quietly rewriting architecture to match convenience.  
3. **Architectural changes require a new ADR** (and any necessary Requirements/Vision amendment under EP-001/EP-002).  
4. **Do not edit approved ADRs** to absorb implementation discoveries; supersede via a new ADR if a true architectural change is required.  
5. **Open Unknowns remain Open** until resolved by legitimate authority—not by code inventing assignment answers.  
6. **Optional bonus** remains optional; core milestones must complete without it (FR-026; EP-011; ADR suite isolation rules).

---

## 5. Implementation Principles

Derived from approved architecture—not new architectural invention:

| Principle | Meaning | Authority |
|---|---|---|
| **Architecture First** | Code follows frozen docs; boundaries are not optional | EP-016; Architecture Review authorization |
| **Bottom-up in dependency order** | Build along Investigation → Observation → Evidence → Detection → Reporting → Presentation | Package §5; Extension collaboration; Data Flow |
| **One Investigation root** | All episode work stays inside ADR-001 consistency boundary | ADR-001 |
| **Single scan, immutable snapshot** | Acquire once; normalize; never rewrite Evidence downstream | ADR-005; ADR-002 |
| **Definition-driven detection** | Mechanisms may evolve; definitions and multi-signal rules do not collapse to one selector | ADR-003; C-004; C-005 |
| **Explainable results** | Conclusions attributable to Evidence; Presentation does not invent explanations | ADR-004 |
| **Partial completion honesty** | Completed Partial / Unknown / Unavailable / Not Detected remain valid | ADR-006; EP-018 |
| **Never bypass boundaries** | Presentation does not detect; Reporting does not recollect; Configuration does not block core | PKG/EXT/UI invariants |
| **Preserve ADR decisions** | Compliance is continuous, not optional at the end | Architecture Review |
| **Test continuously** | Verification domains guide checkpoints throughout milestones | `12_TESTING_STRATEGY` |
| **One milestone at a time** | Finish and review each milestone before expanding scope | EP-014; EP-020 |
| **Small reviewable commits** | Changes stay attributable to package/runtime ownership and FR IDs | EP-015; Traceability |

---

## 6. High-Level Implementation Phases

Phases follow architectural dependency—not arbitrary feature wishlists.

### Phase A — Foundation

Establish implementation workspace and delivery shell sufficient to host runtime roles later, without implementing detection logic. Confirm freeze/change-control understanding.

### Phase B — Core Domain & Investigation

Realize Investigation root concepts (context, one Storefront target, completion disposition hooks) per ADR-001 and Investigation Package ownership.

### Phase C — Observation & Evidence

Realize Storefront observation affordance, Evidence collection, and normalization producing the immutable snapshot (ADR-005; ADR-002).

### Phase D — Detection

Realize definition-driven evaluation over the snapshot: Store Information, FlexyPe Products (including Not Detected), Disabled Integrations, agenda retention for Third-party Apps / Storefront Features with Unknown-qualified honesty (ADR-003; ADR-004; ADR-006).

### Phase E — Reporting

Assemble Diagnostic Report from Detection outputs; preserve Unknown Qualifications; ensure core report forms without optional configuration.

### Phase F — Presentation

Realize Presentation-ready View section organization (PS-001–PS-009 order; core before optional; presentation neutrality).

### Phase G — Extension Integration

Host logical packages in approved runtime roles; wire one Investigation traversal end-to-end on the core path without boundary inversion.

### Phase H — Verification & Hardening

Execute architecture verification domains, including FR-014 reference storefront expectations and documentation obligations (FR-024; NFR-003).

### Phase I — Final Acceptance

Confirm Definition of Done, Traceability compliance, ADR compliance, and Architecture Review constraints; decide optional bonus lane separately if pursued.

---

## 7. Package Dependency Strategy

Implement and integrate packages only in allowed dependency direction:

```
Investigation
  → Observation
      → Evidence
          → Detection
              → Reporting
                  → Presentation

Configuration (optional) → Reporting   [adjunct only; never required for core]

Traceability ⟷ cross-cutting compliance checks (non-blocking)
```

**Rules:**

- Do not implement Presentation against live Evidence.  
- Do not implement Detection that mutates Normalized Evidence.  
- Do not make Investigation/Evidence/Detection depend on Configuration.  
- Do not invent reverse dependencies “for convenience.”  
- Runtime hosting (Extension roles) must preserve this same direction (RR map).

Detailed source layout is deferred to the next implementation document; logical ownership remains as in `09_PACKAGE_ARCHITECTURE`.

---

## 8. Milestone Roadmap

High-level milestones (no implementation detail):

| Milestone | Intent | Primary architectural anchors |
|---|---|---|
| **M1 Foundation** | Delivery shell + freeze compliance readiness | C-001; Architecture Review |
| **M2 Core Domain** | Investigation root operable as unit of work | ADR-001; P-001; R-001 |
| **M3 Evidence** | Single acquisition → immutable Normalized Evidence | ADR-005; ADR-002; P-002; P-003 |
| **M4 Detection** | Definition-driven results + Not Detected + partial honesty | ADR-003; ADR-004; ADR-006; P-004 |
| **M5 Reporting** | One Diagnostic Report per Investigation | P-005; IO-009; FR-020 |
| **M6 Presentation** | Operator popup organization without evaluation leakage | P-006; PS-*; UI invariants |
| **M7 Integration** | Full core runtime collaboration path | RR-001–RR-006; Pipeline S-001–S-009 |
| **M8 Verification** | VD domains + FR-014 empirics + docs | `12_TESTING_STRATEGY`; FR-014; FR-024 |
| **M9 Final Acceptance** | DoD met; optional bonus decision recorded separately | Architecture Review; FR-026 |

Milestones are sequential. A later milestone must not redefine earlier ownership.

---

## 9. Testing Strategy During Implementation

Testing during implementation follows `12_TESTING_STRATEGY` verification domains—not a substitute architecture.

| Checkpoint | When | Focus |
|---|---|---|
| **T0 Freeze gate** | Before M1 coding expansion | Confirm implementing against frozen docs/ADRs |
| **T1 Ownership checks** | After M2–M3 | Investigation root; no Presentation/Detection inversion |
| **T2 Snapshot checks** | After M3 | Single acquisition; Evidence immutability (ADR-002/005) |
| **T3 Detection checks** | After M4 | Multi-signal posture; Not Detected; no single-selector sole basis; Unknown honesty |
| **T4 Report/UI checks** | After M5–M6 | Report completeness/partiality; section order; no invented explanations |
| **T5 Runtime path checks** | After M7 | End-to-end core path; Configuration not required |
| **T6 Acceptance checks** | M8–M9 | FR-014 reference storefronts; FR-024 docs; Traceability residual Unknowns still Open where required |

Continuous testing means each milestone includes the relevant VD concerns before proceeding. Tooling choices are implementation details and must not redefine architectural intent.

---

## 10. Change Control

| Situation | Required action |
|---|---|
| Bug or incomplete code vs architecture | Fix implementation |
| Ambiguity already labeled Unknown | Keep Unknown; do not invent assignment answers |
| Desire for new capability not in FR registry | Reject unless Requirements/Vision amended first |
| True need to change a frozen architectural decision | Author a **new ADR**; do not edit ADR-001–ADR-006 |
| Optional bonus inclusion | Explicit delivery decision; must not block core milestones |
| Conflict between convenience and EP/ADR | EP/ADR wins |

Architecture freeze is the default. Change control exists to keep implementation honest—not to reopen design by stealth.

---

## 11. Definition of Done

Implementation of the core product is done when all of the following hold:

1. **Architecture compliance** — Package/runtime/presentation ownership and ADR-001–ADR-006 are satisfied.  
2. **Requirements coverage** — In-scope FR/NFR/C obligations for the core path are realized (optional FR-025 only if explicitly elected).  
3. **Pipeline integrity** — One Investigation traversal produces one Report and Presentation with Completed or Completed Partial honesty.  
4. **Detection integrity** — Multi-signal posture; Not Detected under insufficient product confidence; no fabricated certainty.  
5. **Unknown integrity** — U-001–U-010 not silently closed; Unknown Qualifications remain visible where applicable.  
6. **Presentation integrity** — Core sections before optional; Presentation does not evaluate Evidence.  
7. **Verification integrity** — Testing Strategy domains for core path exercised, including FR-014 empirical expectations.  
8. **Documentation integrity** — FR-024 / NFR-003 submission documentation obligations met.  
9. **Freeze integrity** — No unapproved edits to frozen architecture/ADRs.  

---

## 12. Risks During Implementation

| Risk | Why it matters |
|---|---|
| **Architecture drift** | Code invents shortcuts that invert ownership (Presentation detects, Reporting recollects) |
| **ADR erosion** | “Just one more live browser read” during Detection violates ADR-005/ADR-002 |
| **Selector-as-architecture** | Single hardcoded selector becomes de facto product definition (violates ADR-003) |
| **False completion** | Inventing Detected/Absent to avoid Completed Partial (violates ADR-006/ADR-004) |
| **Bonus coupling** | Core path blocked on configuration APIs (violates FR-026/EP-011) |
| **Unknown suppression** | Dropping FR-019/FR-022 or hiding Unknowns for a cleaner demo |
| **Scope expansion** | Building merchant/admin/full-stack features outside Vision non-goals |
| **Big-bang integration** | Skipping milestone order, then discovering boundary violations late |

Mitigation is process discipline (freeze, milestones, continuous VD checks)—not new architecture.

---

## 13. Conclusion

Architecture is complete, approved, and frozen. Implementation proceeds by realizing logical packages and runtime roles in dependency order, preserving ADR-001–ADR-006, testing continuously against `12_TESTING_STRATEGY`, and routing any true architectural change through a new ADR.

Next implementation document should detail repository/workspace structure mapping to logical packages—without altering package ownership or architectural decisions.

---

**End of Implementation Plan.**
