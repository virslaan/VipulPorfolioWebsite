#!/usr/bin/env bash
# Rebuilds Vipul_Harihar_CV_2026.pdf from cv/cv.html. Requires Google Chrome and `pip install pypdf`.
set -euo pipefail
cd "$(dirname "$0")/.."

CHROME="${CHROME:-$(command -v google-chrome-stable || command -v google-chrome || command -v chromium)}"
OUT="Vipul_Harihar_CV_2026.pdf"
PROFILE="$(mktemp -d)"
trap 'rm -rf "$PROFILE"' EXIT

"$CHROME" --headless=new --no-sandbox --disable-gpu --user-data-dir="$PROFILE" \
    --no-pdf-header-footer --print-to-pdf="$PWD/$OUT" "file://$PWD/cv/cv.html"

python3 - "$OUT" <<'PY'
import sys
from pypdf import PdfReader, PdfWriter

path = sys.argv[1]
reader = PdfReader(path)
writer = PdfWriter(clone_from=reader)
writer.add_metadata({
    "/Title": "Vipul H. Harihar | CV 2026",
    "/Author": "Vipul H. Harihar",
    "/Subject": "Computer, AI and Technology Scientist and Engineer",
    "/Keywords": "Vipul H. Harihar, Vipul Harihar, AI, AIRIA, AURA, GenTrust, Columbia University, Data Science",
    "/Creator": "Vipul H. Harihar",
})
with open(path, "wb") as f:
    writer.write(f)
print(f"{path}: {len(reader.pages)} pages")
PY
