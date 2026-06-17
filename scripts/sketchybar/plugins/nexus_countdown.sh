#!/bin/bash
export PATH="/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin:$PATH"
_NAME="${NAME:-nexus_countdown}"
/usr/bin/python3 - "$_NAME" <<'PY'
import sys, subprocess
from datetime import date

name = sys.argv[1]

today      = date.today()
intern_end = date(2027, 7, 1)   # internship ends July 1, 2027
ple_date   = date(2027, 10, 16) # PLE October 2027 (3rd Saturday)

if today < intern_end:
    days  = (intern_end - today).days
    label = f"{days}d  INTERN"
    color, bg = "0xFFd97706", "0x22d97706"
elif today < ple_date:
    days  = (ple_date - today).days
    label = f"{days}d  PLE '27"
    color, bg = "0xFF2DD4A7", "0x1A2DD4A7"
else:
    label = "PLE DONE!"
    color, bg = "0xFF10B981", "0x1A10B981"

icon = chr(0xF073)  # fa-calendar

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
