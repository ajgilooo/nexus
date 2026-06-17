#!/bin/bash
export PATH="/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin:$PATH"
_NAME="${NAME:-nexus_wifi}"
AIRPORT="/System/Library/PrivateFrameworks/Apple80211.framework/Versions/Current/Resources/airport"
/usr/bin/python3 - "$_NAME" "$AIRPORT" <<'PY'
import sys, subprocess

name, airport = sys.argv[1], sys.argv[2]

try:
    info = subprocess.check_output([airport, "-I"], text=True, stderr=subprocess.DEVNULL)
    ssid, rssi = "", -100
    for line in info.splitlines():
        s = line.strip()
        if s.startswith("SSID:") and "BSSID" not in s:
            ssid = s.split(":", 1)[1].strip()
        elif "agrCtlRSSI" in s:
            try: rssi = int(s.split(":")[1].strip())
            except: pass
except Exception:
    ssid, rssi = "", -100

if not ssid:
    icon  = chr(0xF092D)   # nf-md-wifi_strength_off
    label = "No WiFi"
    color, bg = "0xFF5C6B79", "0x08FFFFFF"
else:
    if   rssi >= -50: icon = chr(0xF0928)  # nf-md-wifi_strength_4
    elif rssi >= -65: icon = chr(0xF0925)  # nf-md-wifi_strength_3
    elif rssi >= -75: icon = chr(0xF0922)  # nf-md-wifi_strength_2
    else:             icon = chr(0xF091F)  # nf-md-wifi_strength_1
    label = ssid[:12] + "…" if len(ssid) > 12 else ssid
    color, bg = "0xFF94A3B8", "0x10283648"

subprocess.run([
    "sketchybar", "--set", name,
    "drawing=on",
    f"icon={icon}",
    f"label={label}",
    f"icon.color={color}",
    f"label.color={color}",
    f"background.color={bg}",
], check=False)
PY
