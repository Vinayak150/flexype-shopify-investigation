# FlexyPe Shopify Investigator

![Tests](https://img.shields.io/badge/tests-242%20passing-success)
![TypeScript](https://img.shields.io/badge/TypeScript-strict-blue)
![Release](https://img.shields.io/badge/release-v1.0.0-blue)
![Architecture](https://img.shields.io/badge/architecture-frozen-purple)

A Chrome Manifest V3 extension for Shopify storefront diagnostics. The system observes public Storefront signals, normalizes immutable Evidence, evaluates approved Detection definitions, and produces explainable Diagnostic Reports for Product Support and Sales engineers.

The design prioritizes honest outcomes — **Detected, Not Detected, Disabled, Unknown, and partial completion are first-class states** rather than fabricated certainty.

---

# Status

| Item | State |
|---|---|
| Release | **Release candidate** (E-013 / RG-M9) |
| Package version | `0.1.0` |
| Execution milestones | **E-001 → E-013 complete** |
| Architecture | **Frozen** (`architecture/`, `adr/`) |
| Core verification | **242/242 tests passing; build validated** |

Implementation follows frozen architecture documents. Architecture and ADR files are not edited for coding convenience.

---

# Overview

## Problem

FlexyPe deployments on Shopify require consistent, explainable storefront diagnostics:

- Which FlexyPe products are installed?
- Are integrations active or disabled?
- What Shopify storefront information is publicly available?

The extension performs diagnostics without Shopify Admin API access and without relying on merchant-specific assumptions.

---

## Target Users

- Product Support engineers investigating merchant storefronts
- Sales engineers validating FlexyPe installation posture
- Engineering reviewers auditing diagnostic methodology

---

# Investigation Workflow

An operator starts an Investigation bound to one storefront URL.

The pipeline executes:


Investigation
|
v
Observation
|
v
Evidence
|
v
Detection
|
v
Reporting
|
v
Presentation


The system returns:

- Diagnostic Report
- Detection explanations
- Store information
- Completion disposition

Supported completion states:

- `Completed`
- `CompletedPartial`
- `UnknownQualified`

One Investigation, one Storefront, one Report, one View (ADR-001).

---

# Chrome Extension Capabilities

## Store Information Collection

The extension collects publicly available Shopify storefront information.

Collected fields:

- Store URL
- Shopify domain
- Shop name
- Base currency
- Country
- Locale
- Theme name (when available)
- Current page type

Sources include:

- Shopify storefront globals
- Page metadata
- Public HTML structure
- URL-derived information

No Shopify Admin API access is required.

Values unavailable from public storefront context are displayed as Unknown rather than inferred.

---

## FlexyPe Product Detection

The extension detects:

- FlexyPe Checkout
- FlexyPass
- FlexyCart

Detection is definition-driven and uses multiple public storefront signals.

Supported evidence classes:

- Loaded JavaScript assets
- Script URLs
- DOM elements
- HTML structure
- Global browser objects
- Network-related signals (supported where available)
- Shopify theme assets

The extension does not rely on:

- Merchant domain lists
- Single selectors
- Hardcoded store rules

If confidence requirements are not satisfied, the result remains:


Not Detected


---

## Disabled Integration Detection

The extension identifies FlexyPe integrations that appear present but disabled.

Supported signals:

- HTML comments
- Commented scripts
- Hidden FlexyPe containers
- Disabled DOM elements

Disabled integrations are reported separately from active product detection.

Example:


FlexyPe Checkout

Disabled

Reason:
FlexyPe integration found in commented script


---

# Architecture Overview

Core diagnostic pipeline:


Investigation
|
v
Observation
|
v
Evidence
|
v
Detection
|
v
Reporting
|
v
Presentation


Supporting packages:


P-007 Configuration -----> Reporting
P-008 Traceability -----> Lineage records


---

# Package Ownership

| Package | ID | Path |
|---|---|---|
| Investigation | P-001 | `src/investigation/` |
| Observation | P-002 | `src/observation/` |
| Evidence | P-003 | `src/evidence/` |
| Detection | P-004 | `src/detection/` |
| Reporting | P-005 | `src/reporting/` |
| Presentation | P-006 | `src/presentation/` |
| Configuration | P-007 | `src/configuration/` |
| Traceability | P-008 | `src/traceability/` |

Each package owns one responsibility.

- Presentation does not evaluate Evidence.
- Reporting does not recollect Evidence.
- Detection does not directly observe the browser.

---

# Extension Data Flow


Shopify Storefront
|
v
Chrome Content Script Observation
|
v
Storefront Snapshot
|
v
Evidence Normalization
|
v
Detection Engine
|
v
Diagnostic Report
|
v
Popup Presentation


---

# Engineering Highlights

| Principle | Implementation |
|---|---|
| Immutable Evidence | Normalized Evidence snapshots are read-only after acquisition (ADR-002). |
| Definition-driven Detection | Detection evaluates approved definitions against Evidence snapshots (ADR-003). |
| Explainable Results | Detection results contain supporting Evidence references (ADR-004). |
| Single acquisition boundary | Observation and Evidence are collected once per Investigation (ADR-005). |
| Honest Unknown states | Unknown and Not Detected outcomes remain explicit (ADR-006). |
| Tab isolation | Investigation state is scoped per browser tab to prevent cross-store result leakage. |
| Runtime readiness | Content script availability and storefront readiness are verified before execution. |
| Browser context bridge | Shopify page globals are collected through a page-context bridge because Chrome content scripts run in isolated worlds. |
| Package boundaries | Domain ownership remains under `src/<package>/`; extension code only composes systems. |

Closed FlexyPe catalog:

- Checkout
- FlexyPass
- FlexyCart

---

# Repository Structure


src/
├── investigation/
├── observation/
├── evidence/
├── detection/
├── reporting/
├── presentation/
├── configuration/
└── traceability/

extension/
├── runtime/
├── adapters/
├── content/
└── popup/

architecture/
adr/
implementation/
docs/
tests/
tooling/
dist/


---

# Technology Stack

- TypeScript
- Node.js 22+
- Vitest
- ESLint
- Prettier
- Chrome Manifest V3
- Chrome Tabs API
- Chrome Scripting API

---

# Setup

Requirements:


Node.js 22+


Install:

```bash
npm install
Development Commands
npm run typecheck
npm run lint
npm run format:check
npm test
npm run build
npm run release:check
Command	Purpose
npm run typecheck	Strict TypeScript validation
npm run lint	ESLint checks
npm run format:check	Prettier validation
npm test	Vitest suite
npm run build	Extension build pipeline
npm run release:check	Full release verification
Validation

Current verification:

Check	Result
TypeScript strict	✅ Passing
ESLint	✅ Passing
Tests	✅ 242 passing
Build	✅ Passing
Test coverage includes:

Package unit tests
Extension runtime tests
Chrome adapter tests
Storefront observation tests
Detection verification
Disabled integration detection
Release readiness checks
Validation Scenarios

The extension has been verified against multiple Shopify storefront scenarios:

| Scenario | Expected Result |
|---|---|
| Store with FlexyPe Checkout signals | Checkout detected |
| Merchant with all FlexyPe products publicly detectable | Checkout, FlexyPass, FlexyCart detected |
| Non-FlexyPe Shopify merchant | Products remain Not Detected |

Detection decisions are derived from observed storefront signals.

# Demo Validation

Example storefront validation scenarios:

| Store Scenario | Result |
|---|---|
| Store with FlexyPe Checkout signals | Checkout Detected |
| Store with all FlexyPe product signals | Checkout, FlexyPass, and FlexyCart Detected |
| Shopify store without FlexyPe signals | Products remain Not Detected |
| Store with disabled FlexyPe integration markers | Disabled status reported |

Detection decisions are derived from observed storefront signals and evidence requirements.

# Design Constraints

- Architecture and ADR documents are frozen.
- P-007 Configuration remains optional.
- FR-026 Product Configuration is an optional enhancement and is not required for core investigation success.
- P-008 Traceability is non-blocking.
- Unknown states remain explicit.
- `dist/` is generated output only.
- Core diagnostics rely on public storefront observation.
- No Admin API dependency exists for Parts 1–3 requirements.
Known Limitations
Theme information depends on public storefront availability.
Shopify storefronts may expose different levels of metadata.
Configuration API integration remains optional scope.
Chrome Web Store publishing is outside current scope.
Future Work

Possible future improvements:

Optional FlexyPe configuration retrieval
Additional storefront signal adapters
Chrome Web Store deployment
Expanded operator workflows

These do not change the frozen architecture.

# License

MIT