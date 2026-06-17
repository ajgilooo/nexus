#!/bin/bash
export PATH="/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin:$PATH"

SF="$HOME/.nexus/status.json"

if [ ! -f "$SF" ]; then
  ICON=$(/usr/bin/python3 -c "import sys; sys.stdout.write(chr(0xF312))")
  sketchybar --set "$NAME" icon="$ICON" label="NEXUS" icon.color=0xFF283648 label.color=0xFF5C6B79 background.color=0x08FFFFFF drawing=on
  exit 0
fi

FIELDS="$(/usr/bin/python3 - "$SF" <<'PY'
import json, sys
try:
    with open(sys.argv[1]) as f:
        d = json.load(f)
    duty  = d.get("duty", {}) or {}
    todos = d.get("todos", {}) or {}
    mode  = duty.get("mode") or "off"
    high  = todos.get("high", 0)
    icons = {
        "pre-duty":  chr(0xF185),  # fa-sun
        "duty":      chr(0xF186),  # fa-moon
        "post-duty": chr(0xF236),  # fa-bed
    }
    off_icon  = chr(0xF312)        # nf-oct-hexagon (NEXUS off)
    bell_icon = chr(0xF0A2)        # fa-bell (high-pri alert)
    print(f"{mode}|{high}|{icons.get(mode, off_icon)}|{bell_icon}")
except:
    print(f"off|0|{chr(0xF312)}|{chr(0xF0A2)}")
PY
)"

IFS='|' read -r DUTY_MODE TODOS_HIGH DUTY_ICON BELL_ICON <<< "$FIELDS"
OFF_ICON=$(/usr/bin/python3 -c "import sys; sys.stdout.write(chr(0xF312))")

if [ "$DUTY_MODE" = "off" ] || [ "$DUTY_MODE" = "None" ] || [ -z "$DUTY_MODE" ]; then
  if [ "$TODOS_HIGH" -gt 0 ] 2>/dev/null; then
    sketchybar --set "$NAME" icon="$BELL_ICON" label="${TODOS_HIGH} P1" icon.color=0xFFFF6B4A label.color=0xFFFF6B4A background.color=0x1AFF6B4A drawing=on
  else
    sketchybar --set "$NAME" icon="$OFF_ICON" label="NEXUS" icon.color=0xFF283648 label.color=0xFF5C6B79 background.color=0x08FFFFFF drawing=on
  fi
  exit 0
fi

case "$DUTY_MODE" in
  pre-duty)  LABEL="PRE-DUTY";  IC=0xFFd97706; BG=0x22d97706 ;;
  duty)      LABEL="ON DUTY";   IC=0xFFFF6B4A; BG=0x22FF6B4A ;;
  post-duty) LABEL="POST-DUTY"; IC=0xFF38BDF8; BG=0x2238BDF8 ;;
  *)         DUTY_ICON="$OFF_ICON"; LABEL="NEXUS"; IC=0xFF5C6B79; BG=0x10FFFFFF  ;;
esac

SUFFIX=""
[ "$TODOS_HIGH" -gt 0 ] 2>/dev/null && SUFFIX="  $BELL_ICON ${TODOS_HIGH}"

sketchybar --set "$NAME" \
  drawing=on \
  icon="$DUTY_ICON" \
  label="${LABEL}${SUFFIX}" \
  icon.color="$IC" \
  label.color="$IC" \
  background.color="$BG"
