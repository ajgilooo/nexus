#!/bin/bash
export PATH="/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin:$PATH"

SF="$HOME/.nexus/status.json"
[ ! -f "$SF" ] && sketchybar --set "$NAME" drawing=off && exit 0

FIELDS="$(/usr/bin/python3 - "$SF" <<'PY'
import json, sys
try:
    with open(sys.argv[1]) as f:
        d = json.load(f)
    kx = d.get("kinetix", {}) or {}
    # Shorten phase: strip trailing partial word, max 11 chars
    phase = kx.get("phaseShort", "—") or "—"
    # If phase has a space and is being cut off, cut cleanly at last full word ≤11 chars
    words = phase.split()
    short = ""
    for w in words:
        cand = (short + " " + w).strip()
        if len(cand) <= 11:
            short = cand
        else:
            break
    if not short:
        short = words[0][:11] if words else "—"
    print(f"{kx.get('weekNum',0)}|{short}|{kx.get('kmMin',0)}|{kx.get('kmMax',0)}")
except:
    print("0|—|0|0")
PY
)"

IFS='|' read -r WEEK PHASE KM_MIN KM_MAX <<< "$FIELDS"

[ "$WEEK" = "0" ] && sketchybar --set "$NAME" drawing=off && exit 0

sketchybar --set "$NAME" \
  drawing=on \
  icon="▸" \
  label="W${WEEK}  ${PHASE}  ${KM_MIN}–${KM_MAX}" \
  icon.color=0xFF2DD4A7 \
  label.color=0xFF2DD4A7 \
  background.color=0x1A2DD4A7
