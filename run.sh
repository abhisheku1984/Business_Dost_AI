#!/usr/bin/env bash
# Business Dost AI — design review site launcher (macOS / Linux)
set -euo pipefail
cd "$(dirname "$0")"
PORT="${PORT:-4173}"

open_url() {
  if command -v open >/dev/null 2>&1; then open "$1"
  elif command -v xdg-open >/dev/null 2>&1; then xdg-open "$1" >/dev/null 2>&1 || true
  fi
}

if command -v python3 >/dev/null 2>&1; then
  SERVE=(python3 -m http.server "$PORT" --bind 127.0.0.1 --directory design)
elif command -v python >/dev/null 2>&1; then
  SERVE=(python -m http.server "$PORT" --bind 127.0.0.1 --directory design)
elif command -v npx >/dev/null 2>&1; then
  SERVE=(npx --yes serve design -l "$PORT")
else
  echo "No Python or Node found — opening the review site directly."
  open_url "design/index.html"
  exit 0
fi

echo "Business Dost AI — design review"
echo "Serving design/ at http://localhost:$PORT  (press Ctrl+C to stop)"
( sleep 1; open_url "http://localhost:$PORT/" ) &
exec "${SERVE[@]}"
