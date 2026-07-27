#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
SRC="$ROOT/extension/popup"
DEST="$ROOT/dist/extension/popup"

mkdir -p "$DEST"
cp "$ROOT/extension/manifest.json" "$ROOT/dist/extension/manifest.json"
cp "$SRC/popup.html" "$DEST/popup.html"
cp "$SRC/popup.css" "$DEST/popup.css"
