# FlexyPe Shopify Investigator

Chrome Extension for FlexyPe Product Support / Sales engineers: Shopify storefront diagnostics against the public Storefront.

## Status

**Release candidate (E-013)** — E-001–E-012 complete; core Investigation path integrated and verified.

Architecture (`architecture/`, `adr/`) is **frozen**. Implementation planning lives under `implementation/`. Operator/submission docs live under `docs/`.

## Package ownership

| Package | Path |
|---|---|
| P-001 Investigation | `src/investigation/` |
| P-002 Observation | `src/observation/` |
| P-003 Evidence | `src/evidence/` |
| P-004 Detection | `src/detection/` |
| P-005 Reporting | `src/reporting/` |
| P-006 Presentation | `src/presentation/` |
| P-007 Configuration (optional) | `src/configuration/` |
| P-008 Traceability | `src/traceability/` |

Runtime hosting shell: `extension/` (wires packages; does not own Detection/Evidence/Reporting meaning).

Pipeline: Investigation → Observation → Evidence → Detection → Reporting → Presentation.  
Configuration and Traceability remain optional / non-blocking.

## Setup

```bash
npm install
```

Requires Node.js 22+ (CI uses Node 22).

## Development workflow

```bash
npm run typecheck
npm run lint
npm run format:check
npm test
npm run build
```

Or the full release gate locally:

```bash
npm run release:check
```

| Script | Purpose |
|---|---|
| `npm run typecheck` | Strict TypeScript check |
| `npm run lint` | ESLint |
| `npm run format` | Prettier write |
| `npm run format:check` | Prettier check |
| `npm test` | Vitest (unit / integration / e2e / release) |
| `npm run build` | Emit regenerable outputs to `dist/` |
| `npm run release:check` | Structure + typecheck + lint + format + test + build |
| `npm run architecture:freeze` | Guard against accidental architecture/ADR edits vs a git base |

## Documentation

| Location | Role |
|---|---|
| `architecture/` | Frozen architecture baseline (`00`–`13`) |
| `adr/` | Approved ADR-001–ADR-006 |
| `implementation/` | Plans, package specs, execution specs |
| `docs/` | Operator / submission documentation (FR-024 / NFR-003) |
| `docs/RELEASE_SIGN_OFF.md` | RG-M9 sign-off, Configuration election, Open Unknowns |

## Notes

- `dist/` is generated and not the design authority.
- Core path must not require Configuration (FR-026).
- Do not edit frozen architecture/ADR documents for coding convenience.
- Open Unknowns `U-001`–`U-010` remain explicitly Open where not legitimately resolved.
