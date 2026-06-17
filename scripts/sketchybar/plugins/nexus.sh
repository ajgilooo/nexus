#!/bin/bash
export PATH="/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin:$PATH"

SF="$HOME/.nexus/status.json"

if [ ! -f "$SF" ]; then
  sketchybar --set "$NAME" icon="⬡" label="NEXUS" icon.color=0xFF283648 label.color=0xFF5C6B79 background.color=0x08FFFFFF drawing=on
  exit 0
fi

read -r DUTY_MODE TODOS_HIGH <<< "$(/usr/bin/python3 - "$SF" <<'PY'
import json, sys
try:
    with open(sys.argv[1]) as f:
        d = json.load(f)
    duty  = d.get("duty", {}) or {}
    todos = d.get("todos", {}) or {}
    print(duty.get("mode") or "off", todos.get("high", 0))
except:
    print("off", 0)
PY
)"

# No mode: show todo alert or minimal NEXUS
if [ "$DUTY_MODE" = "off" ] || [ "$DUTY_MODE" = "None" ] || [ -z "$DUTY_MODE" ]; then
  if [ "$TODOS_HIGH" -gt 0 ] 2>/dev/null; then
    sketchybar --set "$NAME" icon="●" label="${TODOS_HIGH} P1" icon.color=0xFFFF6B4A label.color=0xFFFF6B4A background.color=0x1AFF6B4A drawing=on
  else
    sketchybar --set "$NAME" icon="⬡" label="NEXUS" icon.color=0xFF283648 label.color=0xFF5C6B79 background.color=0x08FFFFFF drawing=on
  fi
  exit 0
fi

case "$DUTY_MODE" in
  pre-duty)  ICON="☀"; LABEL="PRE-DUTY";  IC=0xFFd97706; BG=0x22d97706 ;;
  duty)      ICON="⏺"; LABEL="ON DUTY";   IC=0xFFFF6B4A; BG=0x22FF6B4A ;;
  post-duty) ICON="◎"; LABEL="POST-DUTY"; IC=0xFF38BDF8; BG=0x2238BDF8 ;;
  *)         ICON="⬡"; LABEL="NEXUS";     IC=0xFF5C6B79; BG=0x10FFFFFF  ;;
esac

SUFFIX=""
[ "$TODOS_HIGH" -gt 0 ] 2>/dev/null && SUFFIX="  ● ${TODOS_HIGH}"

sketchybar --set "$NAME" \
  drawing=on \
  icon="$ICON" \
  label="${LABEL}${SUFFIX}" \
  icon.color="$IC" \
  label.color="$IC" \
  background.color="$BG"
