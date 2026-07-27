#!/usr/bin/env bash
# Lightweight freeze guard (E-001): fail if architecture/ or adr/ changed vs base.
set -euo pipefail

BASE_REF="${1:-origin/main}"

if ! git rev-parse --verify "${BASE_REF}" >/dev/null 2>&1; then
  echo "Freeze guard skipped: base ref '${BASE_REF}' not available."
  exit 0
fi

changed="$(git diff --name-only "${BASE_REF}...HEAD" -- architecture/ adr/ || true)"

if [[ -n "${changed}" ]]; then
  echo "Frozen architecture/ADR paths were modified without explicit thaw intent:"
  echo "${changed}"
  exit 1
fi

echo "Architecture freeze guard passed (no architecture/ or adr/ changes vs ${BASE_REF})."
