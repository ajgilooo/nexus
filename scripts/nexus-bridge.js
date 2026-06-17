#!/usr/bin/env node
// nexus-bridge.js — Local companion server for NEXUS → SketchyBar sync.
//
// Run:  node scripts/nexus-bridge.js
// Or add to package.json: "bridge": "node scripts/nexus-bridge.js"
//
// Listens on http://localhost:47893
//   POST /push   — receives status JSON from the NEXUS webapp, writes to disk
//   GET  /status — serves the last-known status JSON (for scripts/curl)
//
// Status file: ~/.nexus/status.json
// After any commit in the webapp, it POSTs here. SketchyBar plugins read the file.

const http = require('http');
const fs   = require('fs');
const path = require('path');
const os   = require('os');

const PORT        = 47893;
const NEXUS_DIR   = path.join(os.homedir(), '.nexus');
const STATUS_FILE = path.join(NEXUS_DIR, 'status.json');

// Ensure ~/.nexus/ exists
fs.mkdirSync(NEXUS_DIR, { recursive: true });

let lastStatus = null;

// Try to load existing status on startup
try {
  const raw = fs.readFileSync(STATUS_FILE, 'utf8');
  lastStatus = JSON.parse(raw);
  console.log('[nexus-bridge] Loaded existing status from', STATUS_FILE);
} catch {}

const server = http.createServer((req, res) => {
  // CORS for the local webapp
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  if (req.method === 'POST' && req.url === '/push') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      try {
        const payload = JSON.parse(body);
        lastStatus = payload;
        fs.writeFileSync(STATUS_FILE, JSON.stringify(payload, null, 2));

        // Trigger SketchyBar refresh if available
        const { execSync } = require('child_process');
        try {
          execSync('sketchybar --trigger nexus_update', { stdio: 'ignore', timeout: 500 });
        } catch {}

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
    if (!lastStatus) {
      res.writeHead(404, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'No status yet' }));
      return;
    }
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(lastStatus, null, 2));
    return;
  }

  res.writeHead(404);
  res.end('Not found');
});

server.listen(PORT, '127.0.0.1', () => {
  console.log(`[nexus-bridge] Listening on http://localhost:${PORT}`);
  console.log(`[nexus-bridge] Status file: ${STATUS_FILE}`);
  console.log('[nexus-bridge] Waiting for NEXUS webapp commits...');
});

server.on('error', (e) => {
  if (e.code === 'EADDRINUSE') {
    console.error(`[nexus-bridge] Port ${PORT} already in use — bridge already running?`);
    process.exit(1);
  }
  throw e;
});
