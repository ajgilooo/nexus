#!/bin/bash
export PATH="/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin:$PATH"
_NAME="${NAME:-nexus_wifi}"
/usr/bin/python3 - "$_NAME" <<'PY'
import sys, subprocess, re

name = sys.argv[1]

# Check if en0 has an IP (connected to something)
try:
    ifout = subprocess.check_output(["/sbin/ifconfig", "en0"], text=True,
                                    stderr=subprocess.DEVNULL)
    has_ip = bool(re.search(r'inet \d', ifout))
except Exception:
    has_ip = False

rssi = -100
if has_ip:
    try:
        sp = subprocess.check_output(
            ["system_profiler", "SPAirPortDataType"],
            text=True, stderr=subprocess.DEVNULL, timeout=4)
        # First Signal line under Current Network Information
        m = re.search(r'Signal / Noise:\s*(-\d+)\s*dBm', sp)
        if m:
            rssi = int(m.group(1))
    except Exception:
        rssi = -60  # assume decent signal if IP exists but profiler fails

if not has_ip:
    icon  = chr(0xF092D)  # wifi_strength_off
    color, bg = "0xFF5C6B79", "0x08FFFFFF"
else:
    if   rssi >= -50: icon = chr(0xF0928)  # strength_4
    elif rssi >= -65: icon = chr(0xF0925)  # strength_3
    elif rssi >= -75: icon = chr(0xF0922)  # strength_2
    else:             icon = chr(0xF091F)  # strength_1
    color, bg = "0xFF94A3B8", "0x10283648"

# Icon only — no label to keep the bar compact
subprocess.run([
    "sketchybar", "--set", name,
    "drawing=on",
    f"icon={icon}",
    "label.drawing=off",
    f"icon.color={color}",
    f"background.color={bg}",
], check=False)
PY
