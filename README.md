# FlexyPe Shopify Investigator

Chrome Extension for FlexyPe Product Support / Sales engineers: Shopify storefront diagnostics.

## Status

**E-001 Repository Bootstrap** — repository foundation only. No application business logic yet.

Architecture (`architecture/`, `adr/`) is frozen. Implementation planning lives under `implementation/`.

## Package ownership regions

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

Runtime hosting shell: `extension/` (wiring only; does not redefine package ownership).

## Setup

```bash
npm install
```

## Scripts

| Script | Purpose |
|---|---|
| `npm run typecheck` | Strict TypeScript check |
| `npm run build` | Emit to `dist/` |
| `npm run lint` | ESLint |
| `npm run format` | Prettier write |
| `npm run format:check` | Prettier check |
| `npm test` | Vitest |

## Notes

- `dist/` is generated and not the design authority.
- Core path must not require Configuration.
- Do not edit frozen architecture/ADR documents for coding convenience.
