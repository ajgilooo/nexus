#!/bin/bash
# nexus.sh — NEXUS duty status + readiness for SketchyBar
# Reads from ~/.nexus/status.json (written by nexus-bridge.js)
# Item triggers: update_freq=30 OR event=nexus_update

STATUS_FILE="$HOME/.nexus/status.json"

if [ ! -f "$STATUS_FILE" ]; then
  sketchybar --set "$NAME" label="NEXUS" icon="⬡" \
    label.color=0xFF5C6B79 icon.color=0xFF5C6B79 \
    background.color=0x115C6B79
  exit 0
fi

# Parse with python3 (available on macOS by default)
read -r MODE STREAK COINS TODOS_ACTIVE TODOS_HIGH NEXT_TODO <<< "$(python3 - <<'PYEOF'
import json, sys
try:
    with open("$STATUS_FILE") as f:
        d = json.load(f)
    mode         = d.get("duty", {}).get("mode", "") or "off"
    streak       = d.get("medi", {}).get("streak", 0)
    coins        = d.get("rpg", {}).get("coins", 0)
    todos        = d.get("todos", {})
    active       = todos.get("active", 0)
    high         = todos.get("high", 0)
    nxt          = todos.get("next", "") or ""
    print(mode, streak, coins, active, high, nxt[:30] if nxt else "")
except:
    print("off 0 0 0 0 ")
PYEOF
)"

case "$MODE" in
  pre-duty)
    ICON="☀"
    LABEL="PRE-DUTY"
    ICON_COLOR=0xFFd97706
    BG_COLOR=0x18d97706
    ;;
  duty)
    ICON="⏺"
    LABEL="ON DUTY"
    ICON_COLOR=0xFFFF6B4A
    BG_COLOR=0x18FF6B4A
    ;;
  post-duty)
    ICON="◎"
    LABEL="POST-DUTY"
    ICON_COLOR=0xFF38BDF8
    BG_COLOR=0x1838BDF8
    ;;
  *)
    ICON="⬡"
    LABEL="NEXUS"
    ICON_COLOR=0xFF5C6B79
    BG_COLOR=0x115C6B79
    ;;
esac

# Append todo count if any active
EXTRA=""
if [ "$TODOS_ACTIVE" -gt 0 ] 2>/dev/null; then
  if [ "$TODOS_HIGH" -gt 0 ] 2>/dev/null; then
    EXTRA="  ● ${TODOS_HIGH}↑"
  else
    EXTRA="  ○ ${TODOS_ACTIVE}"
  fi
fi

sketchybar --set "$NAME" \
  icon="$ICON" \
  label="${LABEL}${EXTRA}" \
  icon.color="$ICON_COLOR" \
  label.color="$ICON_COLOR" \
  background.color="$BG_COLOR"
