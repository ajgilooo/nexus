#!/bin/bash
# nexus.sh — NEXUS duty status + todos + level for SketchyBar
# Reads from ~/.nexus/status.json (written by nexus-bridge.js)
# Triggers: update_freq=60 AND event=nexus_update (real-time push from bridge)

STATUS_FILE="$HOME/.nexus/status.json"

if [ ! -f "$STATUS_FILE" ]; then
  sketchybar --set "$NAME" label="NEXUS" icon="⬡" \
    label.color=0xFF5C6B79 icon.color=0xFF5C6B79 \
    background.color=0x115C6B79
  exit 0
fi

# Parse status.json
eval "$(python3 - <<'PYEOF'
import json, sys
try:
    with open("$STATUS_FILE") as f:
        d = json.load(f)
    mode    = d.get("duty", {}).get("mode", "") or "off"
    level   = d.get("rpg", {}).get("level", 1)
    coins   = d.get("rpg", {}).get("coins", 0)
    todos   = d.get("todos", {})
    active  = todos.get("active", 0)
    high    = todos.get("high", 0)
    nxt     = (todos.get("next") or "")[:28]
    print(f'MODE={mode}')
    print(f'LEVEL={level}')
    print(f'COINS={coins}')
    print(f'TODOS_ACTIVE={active}')
    print(f'TODOS_HIGH={high}')
    print(f'NEXT_TODO={nxt}')
except Exception as e:
    print('MODE=off\nLEVEL=1\nCOINS=0\nTODOS_ACTIVE=0\nTODOS_HIGH=0\nNEXT_TODO=')
PYEOF
)"

# Duty mode appearance
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

# Append: level · todo summary
LEVEL_TAG="Lv${LEVEL}"

TODO_TAG=""
if [ "$TODOS_ACTIVE" -gt 0 ] 2>/dev/null; then
  if [ "$TODOS_HIGH" -gt 0 ] 2>/dev/null; then
    TODO_TAG="  ●${TODOS_HIGH}↑ ${TODOS_ACTIVE}t"
  else
    TODO_TAG="  ○${TODOS_ACTIVE}t"
  fi
fi

sketchybar --set "$NAME" \
  icon="$ICON" \
  label="${LABEL}  ${LEVEL_TAG}${TODO_TAG}" \
  icon.color="$ICON_COLOR" \
  label.color="$ICON_COLOR" \
  background.color="$BG_COLOR"
