# P-002 — Observation Package Specification

**Status:** Active — Implementation Phase  
**Document type:** Package implementation specification (what P-002 must realize—not how)  
**Package:** P-002 Observation  
**Repository home:** `src/observation/`  
**Milestone home:** M3 Evidence (with P-003)  
**Depends on:** Frozen `architecture/00`–`13`; ADR-001–ADR-006; implementation `00`–`06`; [`P-001_INVESTIGATION_SPEC.md`](P-001_INVESTIGATION_SPEC.md)

This specification translates approved architecture for Package P-002 into implementation obligations. It does not redesign architecture, define browser APIs, DOM selectors, scraping logic, normalization algorithms, detection logic, confidence models, reporting logic, UI, or code.

**Ownership reminder:** Observation discovers (affordance). Evidence owns collection and normalization. Detection evaluates. Reporting reports. Presentation presents.

---

## 1. Purpose

The Observation Package provides **public Storefront observation affordance** for one Investigation.

Per Package Architecture P-002 and Pipeline S-002:

- Observation establishes that the Investigation’s target Storefront is available for public observation.  
- Observation enables Evidence acquisition; it does not collect Normalized Evidence, evaluate products, assemble reports, or present UI.  
- Observation operates inside the one-Investigation / one-Storefront boundary owned by P-001 (ADR-001).

**Non-goals:** Not evaluating products; not normalizing Evidence; not Admin/backend observation authority; not Presentation.

---

## 2. Architectural Ownership

| Dimension | Ownership |
|---|---|
| **Logical package** | P-002 Observation Package |
| **System responsibility** | R-002 Storefront Observation |
| **Runtime host** | RR-002 Storefront Runtime |
| **Information objects owned** | IO-002 Observation Affordance |
| **Domain concepts** | Storefront as public evidence authority (D-003); observation of Storefront by Investigation |
| **Pipeline stage owned (meaning)** | S-002 Storefront Observation |
| **Invariants** | EP-006; C-003; Pipeline “Observation not skipped”; EXT RP-002 (observation before evaluation) |

Repository placement: primary production ownership under `src/observation/`. Storefront-adjacent hosting may be wired from `extension/` without moving ownership meaning out of P-002.

---

## 3. Responsibilities

P-002 is responsible for:

1. **Consume Investigation Context** — Operate only for the bound Investigation and its one Storefront target (from P-001 / IO-001).  
2. **Establish observation scope** — Make the Storefront available as the public observation authority for this Investigation (EP-006; C-003).  
3. **Produce Observation Affordance (IO-002)** — Provide the conceptual access handle indicating the Storefront is available for public observation (Data Flow IO-002).  
4. **Enable Evidence acquisition** — Affordance is consumed by Evidence Collection (R-003 / P-003); Observation does not replace Evidence ownership.  
5. **Respect incompleteness honesty** — If observation reach is limited (e.g., U-007 Open), recognize incompleteness without inventing Admin/backend substitutes (Pipeline S-002 completion condition).  
6. **Remain Detection-independent** — Do not conclude FlexyPe Products, Disabled Integrations, or other Detection Results.  
7. **Remain Configuration-independent** — Do not require or own Product Configuration.  
8. **Remain non-invasive** — Do not own Storefront mutation (EP-012).

---

## 4. Must Never Own

P-002 must never own:

| Forbidden ownership | Correct owner |
|---|---|
| Evidence contents / collection completion meaning | P-003 Evidence |
| Normalized Evidence / immutability snapshot | P-003 Evidence (ADR-002) |
| Detection Results / Evaluation Agenda | P-004 Detection |
| Store Information conclusions as Detection outcomes | P-004 Detection |
| Diagnostic Report assembly | P-005 Reporting |
| Presentation-ready View / UI semantics | P-006 Presentation |
| Product Configuration fetch | P-007 Configuration (optional) |
| Investigation Context / Completion Disposition | P-001 Investigation |
| Admin/backend as core observation authority | Forbidden on core path (EP-006; C-003; C-006/C-007) |

Observation Affordance is **not** a conclusion and **not** an Admin session (IO-002 non-goals).

---

## 5. Inputs

| Input | Nature | Source |
|---|---|---|
| **Investigation Context (IO-001)** | Bound episode + one Storefront target | P-001 Investigation |
| **Public Storefront context** | Observation authority for the core path | Storefront under inspection (D-003) |

Inputs do not include: Detection Result meanings, Diagnostic Report, Presentation-ready View, or mandatory Product Configuration.

---

## 6. Outputs

| Output | Nature |
|---|---|
| **Observation Affordance (IO-002)** | Conceptual access handle that the Storefront is available for public observation; consumed by Evidence Collection |

**Output rules:**

- Affordance enables acquisition; it does not store Detection Results (IO-002 mutability/non-goals).  
- Affordance must not invent facts or substitute Admin/backend sources when public reach is limited.  
- Incomplete observation availability is allowed to surface as incompleteness for downstream Evidence honesty (EP-018; U-007 Open)—without fabricating affordance completeness.

---

## 7. Lifecycle

P-002 participates at Pipeline **S-002 Storefront Observation**, after Investigation Initiation and before Evidence Acquisition:

```
S-001 Initiation (P-001)
  → S-002 Observation (P-002)     ← this package
  → S-003 Evidence Acquisition (P-003)
  → S-004 Evidence Consolidation (P-003)
  → S-005–S-006 Detection (P-004)
  → …
```

**Lifecycle rules for P-002:**

1. Observation is **not skipped** after Initiation for a core Investigation of a Storefront (Pipeline order rule).  
2. Evidence Acquisition follows Observation; evaluation must not consume unobserved invention (S-002 → S-003).  
3. Observation is scoped to one Investigation / one Storefront (ADR-001).  
4. Observation does not re-open a second Investigation-root or merge storefront targets.  
5. U-007 may limit reach; incompleteness is recognized—no Admin fallback on the core path.  
6. U-009 (SPA navigation) remains Open; do not invent mandatory re-observation policy beyond ADR-001’s new-target-requires-new-Investigation rule.

---

## 8. Collaborating Packages

| Package | Collaboration with P-002 |
|---|---|
| **P-001 Investigation** | Provides Investigation Context; Observation does not own initiation/disposition |
| **P-003 Evidence** | Consumes Observation Affordance to collect and normalize Evidence |
| **P-004 Detection** | Downstream only; must not be fed by Observation conclusions (Observation produces none) |
| **P-005 Reporting** | No direct Observation ownership handoff for recollection |
| **P-006 Presentation** | Must not observe Storefront for evaluation via P-002 leakage |
| **P-007 Configuration** | No collaboration required; forbidden as Observation dependency |
| **P-008 Traceability** | May reference observation participation; non-blocking |

Boundary slogan (normative for this package):

```
Observation discovers (affordance)
Evidence owns (collection + normalization)
Detection evaluates
Reporting reports
Presentation presents
```

---

## 9. Dependency Rules

| Rule | Requirement |
|---|---|
| **Depends on** | P-001 Investigation (context only) |
| **Build order** | Implemented after P-001 and before P-003 (Package Build Order step 2) |
| **Downstream consumer** | P-003 Evidence consumes IO-002 |
| **Must not depend on** | Detection, Reporting, Presentation, Configuration |
| **Import direction** | `investigation → observation → evidence → …` |
| **Forbidden reverse edges** | Observation must not import Detection/Reporting/Presentation to “complete” affordance |
| **Runtime hosting** | RR-002 hosts P-002; must not assume non-public authority (EXT-RISK-008) |

---

## 10. ADR Compliance

| ADR | P-002 obligation |
|---|---|
| **ADR-001** | Observe only the Investigation’s single Storefront target; no cross-store or merged observation roots |
| **ADR-002** | Do not own or rewrite Normalized Evidence; affordance is not the immutable snapshot |
| **ADR-003** | Do not perform definition-driven Detection inside Observation |
| **ADR-004** | Do not invent explanations or product conclusions from observation |
| **ADR-005** | Affordance enables the single acquisition path; Observation must not become a channel for repeated live re-query that replaces Evidence ownership |
| **ADR-006** | Incomplete observation reach may contribute to Completed Partial honesty downstream—do not fabricate complete observation |

---

## 11. Engineering Principle Compliance

| Principle | P-002 obligation |
|---|---|
| **EP-003 / EP-004** | Keep U-007/U-009 explicit; do not invent Admin fallbacks or navigation policy |
| **EP-005** | Core observation remains browser-local |
| **EP-006** | Public Storefront is the observation authority |
| **EP-007** | Observation enables Evidence-based detection; it does not substitute invented facts |
| **EP-011** | No Configuration dependency |
| **EP-012** | Non-invasive—no Storefront mutation ownership |
| **EP-016 / EP-017** | Follow frozen ownership; keep Observation separate from Evidence/Detection/Presentation |
| **EP-018** | Allow progressive incompleteness when observation reach is limited |
| **EP-020** | Keep Observation a focused affordance package—not a scraping platform architecture |

---

## 12. Testing Obligations

Derived from approved Testing Strategy and Test Execution Plan—no new test architecture:

| Obligation | Mapping |
|---|---|
| Observation before evaluation / ownership non-inversion | **VD-002**; **T1** |
| Pipeline S-001 → S-002 not skipped | **VD-003** |
| Public Evidence authority / no Admin substitute via Observation | **VD-004** (upstream readiness for Evidence path) |
| Milestone / checkpoint | **M3** (with P-003); contributes to **IC-2** / **RG-M3** |
| Runtime hosting without overreach | **VD-008** at integration |
| ADR-001 one-Storefront observation scope | Acceptance / milestone review |

Verification must fail if Observation evaluates products, normalizes Evidence, invents Admin-backed affordance, or skips Observation on the core path.

---

## 13. Package Completion Criteria

From Package Build Order (P-002) and Development Milestones (M3 entry for Observation):

□ Owns Observation Affordance (IO-002).  
□ Consumes Investigation Context only for the bound Storefront target.  
□ Enables Evidence acquisition without owning Evidence/Normalized Evidence.  
□ Does not own Detection Results, Diagnostic Report, Presentation, or Configuration.  
□ Does not evaluate products or normalize Evidence.  
□ Public Storefront authority preserved; no Admin/backend core substitute.  
□ Incompleteness under limited reach is recognized without fabricated completeness.  
□ Repository ownership lives under `src/observation/`.  
□ ADR-001 / EP-006 / C-003 compliance holds.  
□ Ready for P-003 Evidence to consume IO-002 toward IC-2.

---

## 14. Definition of Done

Package P-002 is done for implementation sequencing when:

1. Architectural ownership in §2 is realized without redesign.  
2. Responsibilities in §3 are met and must-never-own rules in §4 hold.  
3. Inputs/outputs match §§5–6 (IO-002 only as owned output).  
4. Lifecycle rules in §7 hold for S-002.  
5. Collaborator and dependency rules in §§8–9 hold.  
6. ADR and EP compliance in §§10–11 hold.  
7. Testing obligations in §12 are satisfiable at M3 alongside P-003.  
8. Package completion criteria in §13 are checked.  
9. No browser APIs, DOM selectors, scraping logic, normalization algorithms, detection logic, reporting logic, UI, or code were introduced as Observation ownership in this specification.

---

## 15. Conclusion

P-002 Observation establishes public Storefront observation affordance for one Investigation so Evidence can collect and normalize. It discovers availability for observation; it does not own Evidence, evaluate Detection, assemble Reports, or present to Operators.

This specification is ownership and obligation only. Implementation mechanisms remain outside its scope.

---

**End of P-002 Observation Package Specification.**
