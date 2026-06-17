#!/bin/bash
# _nexus_parse.sh — shared parser. Source this from every NEXUS plugin.
# Sets PATH so sketchybar + python3 are always found (daemon has minimal PATH).

export PATH="/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin:$PATH"

_SF="$HOME/.nexus/status.json"

if [ ! -f "$_SF" ]; then
  _NEXUS_READY=0
  return 0 2>/dev/null || true
fi

_NEXUS_READY=1

eval "$(/usr/bin/python3 - <<'PY'
import json, os, sys

try:
    with open(os.path.expanduser("~/.nexus/status.json")) as f:
        d = json.load(f)
except Exception as e:
    sys.exit(0)

def q(v): return str(v).replace("'", "\\'").replace('"', '\\"')

duty  = d.get("duty",    {}) or {}
todos = d.get("todos",   {}) or {}
medi  = d.get("medi",    {}) or {}
kx    = d.get("kinetix", {}) or {}
rpg   = d.get("rpg",     {}) or {}

def bar(pct, n=7):
    f = round(max(0, min(100, pct)) / 100 * n)
    return "█" * f + "░" * (n - f)

print(f"DUTY_MODE='{q(duty.get('mode') or '')}'")
print(f"TODOS_ACTIVE={todos.get('active', 0)}")
print(f"TODOS_HIGH={todos.get('high', 0)}")
print(f"TODOS_NEXT='{q(todos.get('next') or '')}'")
print(f"Q_DONE={medi.get('qbankDone', 0)}")
print(f"Q_TARGET={medi.get('qbankTarget', 40)}")
print(f"Q_PCT={medi.get('qbankPct', 0)}")
print(f"Q_BAR='{bar(medi.get('qbankPct', 0))}'")
print(f"STREAK={medi.get('streak', 0)}")
print(f"DAYS_TO_EXAM={medi.get('daysToExam', 0)}")
print(f"KX_WEEK={kx.get('weekNum', 0)}")
print(f"KX_PHASE='{q(kx.get('phaseShort') or '')}'")
print(f"KX_KM_MIN={kx.get('kmMin', 0)}")
print(f"KX_KM_MAX={kx.get('kmMax', 0)}")
print(f"RPG_LV={rpg.get('level', 1)}")
print(f"RPG_XP_PCT={rpg.get('xpPct', 0)}")
print(f"RPG_XP_BAR='{bar(rpg.get('xpPct', 0))}'")
print(f"RPG_COINS={rpg.get('coins', 0)}")
PY
)"
