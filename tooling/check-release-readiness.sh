#!/usr/bin/env bash
# E-013 release readiness structural checks (not a new architecture).
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "${ROOT}"

fail=0

require_path() {
  local path="$1"
  if [[ ! -e "${path}" ]]; then
    echo "MISSING: ${path}"
    fail=1
  fi
}

echo "E-013 release readiness structure check"

# Repository roots (implementation/01_REPOSITORY_STRUCTURE)
for path in \
  architecture \
  adr \
  implementation \
  src \
  extension \
  tests \
  docs \
  assets \
  tooling \
  README.md \
  LICENSE \
  package.json \
  .github/workflows/ci.yml
do
  require_path "${path}"
done

# Architecture 00–13 and ADR-001–ADR-006
for n in 00 01 02 03 04 05 06 07 08 09 10 11 12 13; do
  matches=(architecture/"${n}"_*.md)
  if [[ ! -e "${matches[0]}" ]]; then
    echo "MISSING: architecture/${n}_*.md"
    fail=1
  fi
done

for n in 001 002 003 004 005 006; do
  matches=(adr/ADR-"${n}"_*.md)
  if [[ ! -e "${matches[0]}" ]]; then
    echo "MISSING: adr/ADR-${n}_*.md"
    fail=1
  fi
done

# Package ownership regions
for pkg in \
  investigation \
  observation \
  evidence \
  detection \
  reporting \
  presentation \
  configuration \
  traceability
do
  require_path "src/${pkg}/index.ts"
done

require_path "extension/composition.ts"
require_path "docs/RELEASE_SIGN_OFF.md"
require_path "tests/e2e/gate-evidence.ts"
require_path "implementation/execution/E-013_RELEASE_READINESS.md"

if [[ "${fail}" -ne 0 ]]; then
  echo "Release readiness structure check FAILED"
  exit 1
fi

echo "Release readiness structure check PASSED"
