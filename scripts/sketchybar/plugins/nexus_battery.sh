#!/bin/bash
export PATH="/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin:$PATH"
_NAME="${NAME:-nexus_battery}"
/usr/bin/python3 - "$_NAME" <<'PY'
import sys, subprocess, re

name = sys.argv[1]

try:
    info = subprocess.check_output("pmset -g batt", shell=True, text=True,
                                   stderr=subprocess.DEVNULL)
    m = re.search(r'(\d+)%', info)
    pct = int(m.group(1)) if m else 0
    charging = "AC Power" in info
except Exception:
    pct, charging = 0, False

if charging:
    icon  = chr(0xF0086)   # nf-md-battery_charging_100
    color = "0xFF10B981"
    bg    = "0x1A10B981"
else:
    if   pct >= 95: icon = chr(0xF0079)  # 100%
    elif pct >= 85: icon = chr(0xF0082)  # 90%
    elif pct >= 75: icon = chr(0xF0081)  # 80%
    elif pct >= 65: icon = chr(0xF0080)  # 70%
    elif pct >= 55: icon = chr(0xF007F)  # 60%
    elif pct >= 45: icon = chr(0xF007E)  # 50%
    elif pct >= 35: icon = chr(0xF007D)  # 40%
    elif pct >= 25: icon = chr(0xF007C)  # 30%
    elif pct >= 12: icon = chr(0xF007B)  # 20%
    elif pct >=  5: icon = chr(0xF007A)  # 10%
    else:           icon = chr(0xF0083)  # empty

    if   pct <= 20: color, bg = "0xFFEF4444", "0x1AEF4444"
    elif pct <= 40: color, bg = "0xFFd97706", "0x1Ad97706"
    else:           color, bg = "0xFF94A3B8", "0x10283648"

subprocess.run([
    "sketchybar", "--set", name,
    "drawing=on",
    f"icon={icon}",
    f"label={pct}%",
    f"icon.color={color}",
    f"label.color={color}",
    f"background.color={bg}",
], check=False)
PY
