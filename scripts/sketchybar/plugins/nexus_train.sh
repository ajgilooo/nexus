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
    phase = kx.get("phaseShort", "—") or "—"
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
    icon = chr(0xF70C)  # fa-person-running (Nerd Font FA6)
    print(f"{icon}|{kx.get('weekNum',0)}|{short}|{kx.get('kmMin',0)}|{kx.get('kmMax',0)}")
except:
    print(f"{chr(0xF70C)}|0|—|0|0")
PY
)"

IFS='|' read -r ICON WEEK PHASE KM_MIN KM_MAX <<< "$FIELDS"

[ "$WEEK" = "0" ] && sketchybar --set "$NAME" drawing=off && exit 0

sketchybar --set "$NAME" \
  drawing=on \
  icon="$ICON" \
  label="W${WEEK}  ${PHASE}  ${KM_MIN}–${KM_MAX}" \
  icon.color=0xFF2DD4A7 \
  label.color=0xFF2DD4A7 \
  background.color=0x1A2DD4A7
