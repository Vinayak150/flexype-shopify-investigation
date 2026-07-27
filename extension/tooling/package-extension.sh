#!/usr/bin/env bash
# Package dist/extension as a self-contained Chrome extension load target.
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
EXT_DIST="$ROOT/dist/extension"
NESTED_EXT="$EXT_DIST/extension"

rewrite_root_imports() {
  local file="$1"
  if [[ ! -f "$file" ]]; then
    return 0
  fi

  if sed --version 2>/dev/null | grep -q GNU; then
    sed -i 's|from "../src/|from "./src/|g' "$file"
  else
    sed -i '' 's|from "../src/|from "./src/|g' "$file"
  fi
}

rewrite_nested_imports() {
  local file="$1"
  if [[ ! -f "$file" ]]; then
    return 0
  fi

  if sed --version 2>/dev/null | grep -q GNU; then
    sed -i 's|from "../../src/|from "../src/|g' "$file"
  else
    sed -i '' 's|from "../../src/|from "../src/|g' "$file"
  fi
}

echo "Packaging Chrome extension at dist/extension/"

if [[ ! -d "$EXT_DIST" ]]; then
  echo "Packaging error: dist/extension was not produced by tsc"
  exit 1
fi

if [[ -d "$NESTED_EXT" ]]; then
  shopt -s dotglob nullglob
  mv "$NESTED_EXT"/* "$EXT_DIST/"
  rmdir "$NESTED_EXT"
  shopt -u dotglob nullglob
fi

while IFS= read -r -d '' file; do
  rewrite_root_imports "$file"
done < <(find "$EXT_DIST" -maxdepth 1 -name '*.js' -print0)

while IFS= read -r -d '' file; do
  rewrite_nested_imports "$file"
done < <(find "$EXT_DIST" -mindepth 2 -maxdepth 2 -name '*.js' ! -path "$EXT_DIST/src/*" -print0)

for file in "$EXT_DIST"/*.js; do
  [[ -e "$file" ]] || continue
  if grep -q 'from "\.\./src/' "$file"; then
    echo "Packaging error: $(basename "$file") still references ../src/ outside package root"
    exit 1
  fi
done

mkdir -p "$EXT_DIST/popup"
cp "$ROOT/extension/manifest.json" "$EXT_DIST/manifest.json"
cp "$ROOT/extension/popup/popup.html" "$EXT_DIST/popup/popup.html"
cp "$ROOT/extension/popup/popup.css" "$EXT_DIST/popup/popup.css"

require_path() {
  if [[ ! -e "$1" ]]; then
    echo "Packaging error: missing ${1#"$EXT_DIST/"}"
    exit 1
  fi
}

require_path "$EXT_DIST/manifest.json"
require_path "$EXT_DIST/runtime/service-worker.js"
require_path "$EXT_DIST/content/storefront-agent.js"
require_path "$EXT_DIST/popup/popup.html"
require_path "$EXT_DIST/composition.js"
require_path "$EXT_DIST/src/configuration/index.js"
require_path "$EXT_DIST/src/detection/index.js"
require_path "$EXT_DIST/src/evidence/index.js"
require_path "$EXT_DIST/src/investigation/index.js"
require_path "$EXT_DIST/src/observation/index.js"
require_path "$EXT_DIST/src/presentation/index.js"
require_path "$EXT_DIST/src/reporting/index.js"
require_path "$EXT_DIST/src/traceability/index.js"

CONTENT_SCRIPT="$EXT_DIST/content/storefront-agent.js"
if grep -E '(^|\s)(export|import)\s' "$CONTENT_SCRIPT" >/dev/null 2>&1; then
  echo "Packaging error: content script must be a classic browser script (no import/export)"
  exit 1
fi

if grep -R 'from "\.\./\.\./\.\./src/' "$EXT_DIST" --include='*.js' --exclude-dir=src >/dev/null 2>&1; then
  echo "Packaging error: extension bundle still contains imports outside dist/extension/"
  exit 1
fi

echo "Extension package ready at dist/extension/"
