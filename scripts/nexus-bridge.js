#!/usr/bin/env node
// nexus-bridge.js — Local companion server for NEXUS → SketchyBar sync.
// Run:  node scripts/nexus-bridge.js   (or: npm run bridge)
//
// Auto-started on login via ~/.nexus/config.json + launchd.
// Config: ~/.nexus/config.json
//   { "vercelUrl": "https://...", "appToken": "nexus_joseph_...", "pollIntervalSec": 60 }

import http        from 'http';
import fs          from 'fs';
import path        from 'path';
import os          from 'os';
import { execSync } from 'child_process';
import { W, PH }  from '../src/lib/kinetix.data.js';

const PORT        = 47893;
const NEXUS_DIR   = path.join(os.homedir(), '.nexus');
const STATUS_FILE = path.join(NEXUS_DIR, 'status.json');
const CONFIG_FILE = path.join(NEXUS_DIR, 'config.json');

fs.mkdirSync(NEXUS_DIR, { recursive: true });

// ── Config ────────────────────────────────────────────────────────────────────
let config = {};
try {
  config = JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf8'));
  console.log(`[nexus-bridge] Polling ${config.vercelUrl} every ${config.pollIntervalSec || 60}s`);
} catch { console.warn('[nexus-bridge] No config — push-only mode'); }

// ── State ─────────────────────────────────────────────────────────────────────
let lastStatus       = null;
let lastDocUpdatedAt = 0;
try {
  const raw = JSON.parse(fs.readFileSync(STATUS_FILE, 'utf8'));
  lastStatus = raw; lastDocUpdatedAt = raw._docUpdatedAt || 0;
} catch {}

// ── XP helpers (mirrors rpg.logic.js) ────────────────────────────────────────
function xpToReachLevel(L) { return 50 * L * (L - 1); }
function levelFromXP(xp) { let L = 1; while (xpToReachLevel(L + 1) <= xp) L++; return L; }
function levelProgress(xp) {
  const L = levelFromXP(xp); const cur = xpToReachLevel(L); const next = xpToReachLevel(L + 1);
  const into = xp - cur; const span = next - cur;
  return { level: L, into, span, pct: span ? Math.round(into / span * 100) : 0 };
}

// ── Training helpers (mirrors kinetix.logic.js) ───────────────────────────────
function currentWeekIdx() {
  const now = new Date(); now.setHours(0, 0, 0, 0);
  for (let i = 0; i < W.length; i++) {
    const s = new Date(W[i].d + 'T00:00:00');
    const e = new Date(s); e.setDate(e.getDate() + 7);
    if (now >= s && now < e) return i;
  }
  return now < new Date(W[0].d + 'T00:00:00') ? -1 : W.length - 1;
}

// ── Build full status payload from doc ────────────────────────────────────────
function docToPayload(doc) {
  const todos  = doc.todos || [];
  const active = todos.filter(t => !t.done);
  const high   = active.filter(t => t.priority === 'high');
  const next   = [...active].sort((a, b) => {
    const w = { high: 0, normal: 1, low: 2 };
    return (w[a.priority] || 1) - (w[b.priority] || 1);
  })[0];

  // MEDI — daily QBank progress
  const state = doc.medi?.state || {};
  const dm    = state.dailyTargetMetrics || {};
  const today = new Date();
  const tk    = `${today.getFullYear()}-${today.getMonth()+1}-${today.getDate()}`;
  const qbankDone   = dm.dayKey === tk ? (dm.currentDayCompletedCount || 0) : 0;
  const qbankTarget = dm.questionsPerDayTarget || 40;
  const qbankPct    = qbankTarget > 0 ? Math.round(qbankDone / qbankTarget * 100) : 0;
  const streak      = state.streak || 0;
  const examDays    = Math.max(0, Math.ceil((new Date('2026-10-17') - today) / 86400000));

  // KINETIX — current training week + phase
  const wIdx = currentWeekIdx();
  const wk   = wIdx >= 0 && wIdx < W.length ? W[wIdx] : null;
  const ph   = wk ? PH[wk.ph] : null;
  const phShort = ph ? ph.n.split(/[—–·]/)[0].trim().slice(0, 14) : '—';
  const firstRun = wk?.mods?.find(m => ['e', 'l', 'q', 't'].includes(m.t));
  const nextSession = firstRun ? firstRun.tx.slice(0, 36) : '—';

  // RPG
  const cachedXP = doc.rpg?.xpLedgerCache?.lifetimeXP || 0;
  const prog = levelProgress(cachedXP);

  return {
    updatedAt:     new Date().toISOString(),
    _docUpdatedAt: doc.updatedAt || 0,
    duty:  doc.duty  || { mode: null, setAt: null },
    todos: { total: todos.length, done: todos.filter(t=>t.done).length, active: active.length, high: high.length, next: next?.text || null },
    medi:  { streak, qbankDone, qbankTarget, qbankPct, daysToExam: examDays, readiness: 0 },
    kinetix: { weekIdx: wIdx, weekNum: wIdx + 1, phaseShort: phShort, kmMin: wk?.km[0]||0, kmMax: wk?.km[1]||0, nextSession },
    rpg:   { level: prog.level, xpInto: prog.into, xpSpan: prog.span, xpPct: prog.pct, coins: doc.rpg?.coins || 0 },
  };
}

// ── Write + trigger ───────────────────────────────────────────────────────────
function applyPayload(payload) {
  lastStatus = payload; lastDocUpdatedAt = payload._docUpdatedAt || 0;
  fs.writeFileSync(STATUS_FILE, JSON.stringify(payload, null, 2));
  try { execSync('sketchybar --trigger nexus_update', { stdio: 'ignore', timeout: 500 }); } catch {}
}

// ── Cloud poll ────────────────────────────────────────────────────────────────
async function pollCloud() {
  const { vercelUrl, appToken, userId = 'joseph' } = config;
  if (!vercelUrl || !appToken) return;
  try {
    const res = await fetch(`${vercelUrl}/api/state?user=${userId}`, {
      headers: { Authorization: `Bearer ${appToken}` },
      signal: AbortSignal.timeout(6000),
    });
    if (!res.ok) { console.warn(`[nexus-bridge] Poll HTTP ${res.status}`); return; }
    const { doc } = await res.json();
    if (!doc) return;
    // Skip only if doc is same age AND we already have a rich payload (kinetix field present)
    if ((doc.updatedAt || 0) <= lastDocUpdatedAt && lastStatus?.kinetix) return;
    const payload = docToPayload(doc);
    applyPayload(payload);
    console.log(`[nexus-bridge] ↓ Lv${payload.rpg.level}  Q${payload.medi.qbankDone}/${payload.medi.qbankTarget}  W${payload.kinetix.weekNum}  duty=${payload.duty.mode||'off'}`);
  } catch { /* network blip */ }
}

// ── HTTP server ───────────────────────────────────────────────────────────────
const server = http.createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') { res.writeHead(204); res.end(); return; }

  if (req.method === 'POST' && req.url === '/push') {
    let body = '';
    req.on('data', c => body += c);
    req.on('end', () => {
      try {
        applyPayload(JSON.parse(body));
        res.writeHead(200); res.end('{"ok":true}');
      } catch (e) { res.writeHead(400); res.end(`{"ok":false,"error":"${e.message}"}`); }
    });
    return;
  }
  if (req.method === 'GET' && req.url === '/status') {
    if (!lastStatus) { res.writeHead(404); res.end('{}'); return; }
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(lastStatus, null, 2));
    return;
  }
  res.writeHead(404); res.end('not found');
});

server.listen(PORT, '127.0.0.1', () => {
  console.log(`[nexus-bridge] :${PORT}  status→${STATUS_FILE}`);
  pollCloud();
  setInterval(pollCloud, (config.pollIntervalSec || 60) * 1000);
});
server.on('error', e => {
  if (e.code === 'EADDRINUSE') { console.error(`[nexus-bridge] port ${PORT} in use`); process.exit(1); }
  throw e;
});
