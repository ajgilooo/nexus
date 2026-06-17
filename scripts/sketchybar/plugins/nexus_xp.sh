#!/bin/bash
export PATH="/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin:$PATH"

SF="$HOME/.nexus/status.json"
[ ! -f "$SF" ] && sketchybar --set "$NAME" drawing=off && exit 0

read -r LV XP_BAR COINS_FMT <<< "$(/usr/bin/python3 - "$SF" <<'PY'
import json, sys

def bar(pct, n=7):
    f = round(max(0, min(100, pct)) / 100 * n)
    return "█" * f + "░" * (n - f)

try:
    with open(sys.argv[1]) as f:
        d = json.load(f)
    rpg   = d.get("rpg", {}) or {}
    lv    = rpg.get("level", 1)
    pct   = rpg.get("xpPct", 0)
    coins = rpg.get("coins", 0)
    cfmt  = f"{coins/1000:.1f}k" if coins >= 1000 else str(coins)
    print(lv, bar(pct), cfmt)
except:
    print(1, "░░░░░░░", "0")
PY
)"

sketchybar --set "$NAME" \
  drawing=on \
  icon="✦" \
  label="Lv${LV}  ${XP_BAR}  ◈ ${COINS_FMT}" \
  icon.color=0xFFd97706 \
  label.color=0xFFCBD5E1 \
  background.color=0x0DFFFFFF
