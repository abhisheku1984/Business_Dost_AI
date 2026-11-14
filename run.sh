#!/usr/bin/env bash
# Business Dost AI — design review site launcher (macOS / Linux)
# Starts serve.py, which picks a free port, prints the URL and opens the browser.
set -euo pipefail
cd "$(dirname "$0")"

open_url() {
  if command -v open >/dev/null 2>&1; then open "$1"
  elif command -v xdg-open >/dev/null 2>&1; then xdg-open "$1" >/dev/null 2>&1 || true
  fi
}

if [ ! -f design/index.html ]; then
  echo "This folder is not the review folder."
  echo "Folder: $(pwd)"
  echo 'Open the folder that has "design" and "run.sh" side by side, then run this again.'
  exit 1
fi

if command -v python3 >/dev/null 2>&1; then
  exec python3 serve.py
elif command -v python >/dev/null 2>&1; then
  exec python serve.py
fi

echo "No Python found — opening the review site directly."
open_url "design/index.html"
