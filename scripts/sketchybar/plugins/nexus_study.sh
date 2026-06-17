#!/bin/bash
export PATH="/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin:$PATH"

SF="$HOME/.nexus/status.json"
[ ! -f "$SF" ] && sketchybar --set "$NAME" drawing=off && exit 0

read -r ICON Q_DONE Q_TARGET Q_PCT Q_BAR <<< "$(/usr/bin/python3 - "$SF" <<'PY'
import json, sys

def bar(pct, n=7):
    f = round(max(0, min(100, pct)) / 100 * n)
    return "█" * f + "░" * (n - f)

try:
    with open(sys.argv[1]) as f:
        d = json.load(f)
    m = d.get("medi", {}) or {}
    done   = m.get("qbankDone", 0)
    target = m.get("qbankTarget", 40)
    pct    = m.get("qbankPct", 0)
    print(chr(0xF02D), done, target, pct, bar(pct))
except:
    print(chr(0xF02D), 0, 40, 0, "░░░░░░░")
PY
)"

if   [ "$Q_DONE" -ge "$Q_TARGET" ] 2>/dev/null; then
  COLOR=0xFF10B981; BG=0x1A10B981
elif [ "$Q_DONE" -gt 0 ]           2>/dev/null; then
  COLOR=0xFFd97706; BG=0x1Ad97706
else
  COLOR=0xFF94A3B8; BG=0x10283648
fi

sketchybar --set "$NAME" \
  drawing=on \
  icon="$ICON" \
  label="${Q_DONE} / ${Q_TARGET}  ${Q_BAR}" \
  icon.color="$COLOR" \
  label.color="$COLOR" \
  background.color="$BG"
