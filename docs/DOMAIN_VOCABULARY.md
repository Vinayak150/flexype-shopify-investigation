# Domain Vocabulary Note

The canonical domain vocabulary remains:

- `architecture/04_DOMAIN_MODEL.md`
- Supporting meanings in `architecture/08_DATA_FLOW.md` and `architecture/09_PACKAGE_ARCHITECTURE.md`
- Accepted ADRs under `adr/`

Type-only contracts under `src/<package>/` (E-002) **reuse** that vocabulary. They do not redefine entity meanings, close Open Unknowns (`U-001`–`U-010`), or invent catalogs.
