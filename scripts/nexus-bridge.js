#!/usr/bin/env node
// nexus-bridge.js — Local companion server for NEXUS → SketchyBar sync.
//
// Run:  node scripts/nexus-bridge.js   (or: npm run bridge)
//
// Two sync paths:
//   1. PUSH  — NEXUS webapp POSTs here on every commit (local or Vercel URL
//              open in the Mac's browser). Fast, <1s latency.
//   2. POLL  — Bridge polls the Vercel API every 60s to catch changes from
//              other devices (phone, iPad, another computer).
//
// Config: ~/.nexus/config.json  (never committed — kept outside the repo)
//   { "vercelUrl": "https://...", "appToken": "nexus_joseph_...",
//     "userId": "joseph", "pollIntervalSec": 60 }
//
// Status file: ~/.nexus/status.json  (read by SketchyBar plugins)

import http       from 'http';
import fs         from 'fs';
import path       from 'path';
import os         from 'os';
import { execSync } from 'child_process';

const PORT        = 47893;
const NEXUS_DIR   = path.join(os.homedir(), '.nexus');
const STATUS_FILE = path.join(NEXUS_DIR, 'status.json');
const CONFIG_FILE = path.join(NEXUS_DIR, 'config.json');

fs.mkdirSync(NEXUS_DIR, { recursive: true });

// ── Config ────────────────────────────────────────────────────────────────────
let config = {};
try {
  config = JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf8'));
  console.log(`[nexus-bridge] Config loaded — polling ${config.vercelUrl || '(no URL)'} every ${config.pollIntervalSec || 60}s`);
} catch {
  console.warn('[nexus-bridge] No config at', CONFIG_FILE, '— push-only mode');
}

// ── Status cache ──────────────────────────────────────────────────────────────
let lastStatus       = null;
let lastDocUpdatedAt = 0;

try {
  const raw = JSON.parse(fs.readFileSync(STATUS_FILE, 'utf8'));
  lastStatus       = raw;
  lastDocUpdatedAt = raw._docUpdatedAt || 0;
  console.log('[nexus-bridge] Loaded existing status from', STATUS_FILE);
} catch {}

// ── XP helpers (mirrors src/lib/rpg.logic.js) ────────────────────────────────
function xpToReachLevel(L) { return 50 * L * (L - 1); }
function levelFromXP(xp) {
  let L = 1;
  while (xpToReachLevel(L + 1) <= xp) L++;
  return L;
}

// ── Build status payload from a full NEXUS doc ────────────────────────────────
function docToPayload(doc) {
  const todos  = doc.todos || [];
  const active = todos.filter(t => !t.done);
  const high   = active.filter(t => t.priority === 'high');
  const next   = [...active].sort((a, b) => {
    const w = { high: 0, normal: 1, low: 2 };
    return (w[a.priority] || 1) - (w[b.priority] || 1);
  })[0];

  const cachedXP = doc.rpg?.xpLedgerCache?.lifetimeXP || 0;

  return {
    updatedAt:     new Date().toISOString(),
    _docUpdatedAt: doc.updatedAt || 0,
    duty:  doc.duty  || { mode: null, setAt: null },
    todos: {
      total:  todos.length,
      done:   todos.filter(t => t.done).length,
      active: active.length,
      high:   high.length,
      next:   next?.text || null,
    },
    medi: { streak: doc.medi?.state?.streak || 0 },
    rpg:  { level: levelFromXP(cachedXP), coins: doc.rpg?.coins || 0 },
  };
}

// ── Write status + trigger SketchyBar ─────────────────────────────────────────
function applyPayload(payload) {
  lastStatus       = payload;
  lastDocUpdatedAt = payload._docUpdatedAt || 0;
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
    if (!res.ok) { console.warn(`[nexus-bridge] Poll: HTTP ${res.status}`); return; }

    const { doc } = await res.json();
    if (!doc) return;

    const cloudTs = doc.updatedAt || 0;
    if (cloudTs <= lastDocUpdatedAt) return; // no change

    const payload = docToPayload(doc);
    applyPayload(payload);
    console.log(`[nexus-bridge] ↓ Cloud sync — Lv${payload.rpg.level} · ${payload.todos.active} todos · duty=${payload.duty.mode || 'off'}`);
  } catch {
    // Network blip — retry next interval
  }
}

// ── HTTP server ───────────────────────────────────────────────────────────────
const server = http.createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') { res.writeHead(204); res.end(); return; }

  if (req.method === 'POST' && req.url === '/push') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      try {
        const payload = JSON.parse(body);
        applyPayload(payload);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ ok: true }));
      } catch (e) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ ok: false, error: e.message }));
      }
    });
    return;
  }

  if (req.method === 'GET' && req.url === '/status') {
    if (!lastStatus) { res.writeHead(404); res.end('{}'); return; }
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(lastStatus, null, 2));
    return;
  }

  res.writeHead(404); res.end('Not found');
});

server.listen(PORT, '127.0.0.1', () => {
  console.log(`[nexus-bridge] Listening on http://localhost:${PORT}`);
  console.log(`[nexus-bridge] Status file: ${STATUS_FILE}`);
  pollCloud(); // immediate poll on startup
  setInterval(pollCloud, (config.pollIntervalSec || 60) * 1000);
});

server.on('error', (e) => {
  if (e.code === 'EADDRINUSE') {
    console.error(`[nexus-bridge] Port ${PORT} already in use — already running?`);
    process.exit(1);
  }
  throw e;
});
