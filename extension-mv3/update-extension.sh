#!/usr/bin/env bash
# HintaTutka MV3 — 1-Click Unpacked Extension Updater (macOS / Linux)
set -euo pipefail

TARGET_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ZIP_URL="https://github.com/FIMARx/hintatutka/releases/latest/download/HintaTutka-MV3-Extension.zip"
TMP_DIR="$(mktemp -d)"

cleanup() { rm -rf "$TMP_DIR"; }
trap cleanup EXIT

echo "Downloading latest HintaTutka MV3 release from GitHub..."
curl -fsSL "$ZIP_URL" -o "$TMP_DIR/update.zip"
unzip -qo "$TMP_DIR/update.zip" -d "$TARGET_DIR"

echo "✅ Updated HintaTutka MV3 Extension in: $TARGET_DIR"
echo "👉 Open chrome://extensions and click the Reload (↻) icon on HintaTutka."
