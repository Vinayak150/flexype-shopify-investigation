# Documentation

Operator and submission documentation (FR-024 / NFR-003) will live here.

Architecture remains the design source of truth under `architecture/` and `adr/`.
Implementation planning remains under `implementation/`.

Domain vocabulary for code contracts: see [`DOMAIN_VOCABULARY.md`](./DOMAIN_VOCABULARY.md).
Canonical entity meanings remain in `architecture/04_DOMAIN_MODEL.md`.


## Local development (E-001)

```bash
npm install
npm run typecheck
npm run lint
npm run format:check
npm test
npm run build
```
