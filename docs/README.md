# Documentation

Operator and submission documentation for FlexyPe Shopify Investigator (FR-024 / NFR-003).

Architecture remains the design source of truth under `architecture/` and `adr/`.  
Implementation planning remains under `implementation/`.

| Document | Purpose |
|---|---|
| [`DOMAIN_VOCABULARY.md`](./DOMAIN_VOCABULARY.md) | Domain vocabulary for code contracts |
| [`RELEASE_SIGN_OFF.md`](./RELEASE_SIGN_OFF.md) | E-013 / RG-M9 sign-off, Configuration election, Open Unknowns |
| `architecture/04_DOMAIN_MODEL.md` | Canonical entity meanings (frozen) |

## Setup and development workflow

```bash
npm install
npm run typecheck
npm run lint
npm run format:check
npm test
npm run build
```

Full local release gate:

```bash
npm run release:check
```

CI (`.github/workflows/ci.yml`) runs the same verification commands on push/PR.

## Detection approach (submission summary)

- Observation discovers public Storefront affordance only.
- Evidence captures immutable Normalized Evidence (ADR-002).
- Detection evaluates definition-driven outcomes against Evidence only (ADR-003); NotDetected / Unknown remain honest (ADR-006).
- Reporting assembles one Diagnostic Report; Presentation projects the Report without re-evaluating.
- Optional Product Configuration may enrich Reporting but never gates the core path (FR-026).

## Residual Open Unknowns

`U-001`–`U-010` remain Open unless legitimately resolved outside invention. See [`RELEASE_SIGN_OFF.md`](./RELEASE_SIGN_OFF.md).
