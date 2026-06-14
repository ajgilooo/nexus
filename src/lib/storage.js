// src/lib/storage.js
// Single storage abstraction — UI code calls ONLY these methods.
// Cloud (Supabase via /api/state) is canonical. localStorage is offline cache.

const CACHE_KEY = 'nexus_doc';
const TOKEN_KEY = 'nexus_token';
const USER_ID   = 'joseph';
const DEBOUNCE_MS = 800;

let _listeners = [];
let _status = 'idle'; // 'idle' | 'synced' | 'saving' | 'offline' | 'auth'
let _debounceTimer = null;
let _token = null;

function getToken() {
  if (_token) return _token;
  _token = localStorage.getItem(TOKEN_KEY) || '';
  return _token;
}

export function setToken(t) {
  _token = t;
  localStorage.setItem(TOKEN_KEY, t);
}

function setStatus(s) {
  _status = s;
  _listeners.forEach(fn => fn(s));
}

function readCache() {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

function writeCache(doc) {
  try { localStorage.setItem(CACHE_KEY, JSON.stringify(doc)); } catch {}
}

async function cloudGet(userId) {
  const tok = getToken();
  const res = await fetch(`/api/state?user=${userId}`, {
    headers: { Authorization: `Bearer ${tok}` }
  });
  if (res.status === 401) { setStatus('auth'); return null; }
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const { doc } = await res.json();
  return doc;
}

async function cloudPut(userId, doc) {
  const tok = getToken();
  const res = await fetch(`/api/state?user=${userId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${tok}` },
    body: JSON.stringify(doc)
  });
  if (res.status === 401) { setStatus('auth'); return false; }
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return true;
}

export const Store = {
  // ── Load ──────────────────────────────────────────────────────────────────
  async load(userId = USER_ID) {
    // 1. Paint immediately from cache
    const cached = readCache();

    // 2. Fetch from cloud in parallel
    try {
      const cloud = await cloudGet(userId);
      if (cloud === null && _status !== 'auth') {
        // No cloud doc yet — use cache or empty
        if (cached) { setStatus('synced'); return cached; }
        setStatus('synced');
        return null;
      }
      if (cloud) {
        const cloudNewer = !cached || (cloud.updatedAt || 0) >= (cached.updatedAt || 0);
        if (cloudNewer) {
          writeCache(cloud);
          setStatus('synced');
          return cloud;
        }
        setStatus('synced');
        return cached;
      }
    } catch (err) {
      console.warn('Cloud load failed, using cache:', err.message);
      setStatus('offline');
      return cached;
    }

    return cached;
  },

  // ── Save ──────────────────────────────────────────────────────────────────
  async save(userId = USER_ID, doc) {
    // Stamp updatedAt
    doc.updatedAt = Date.now();

    // 1. Write cache immediately
    writeCache(doc);

    // 2. Debounce cloud write
    clearTimeout(_debounceTimer);
    setStatus('saving');
    _debounceTimer = setTimeout(async () => {
      try {
        const ok = await cloudPut(userId, doc);
        if (ok) setStatus('synced');
      } catch (err) {
        console.warn('Cloud save failed, queued locally:', err.message);
        setStatus('offline');
      }
    }, DEBOUNCE_MS);
  },

  // ── Force sync ────────────────────────────────────────────────────────────
  async forceSync(userId = USER_ID) {
    const cached = readCache();
    if (!cached) return;
    setStatus('saving');
    try {
      cached.updatedAt = Date.now();
      const ok = await cloudPut(userId, cached);
      if (ok) { writeCache(cached); setStatus('synced'); }
    } catch { setStatus('offline'); }
  },

  // ── Pull from cloud ───────────────────────────────────────────────────────
  async forcePull(userId = USER_ID) {
    setStatus('saving');
    try {
      const cloud = await cloudGet(userId);
      if (cloud) { writeCache(cloud); setStatus('synced'); return cloud; }
    } catch { setStatus('offline'); }
    return null;
  },

  // ── Subscribe to sync status ──────────────────────────────────────────────
  subscribe(fn) {
    _listeners.push(fn);
    return () => { _listeners = _listeners.filter(l => l !== fn); };
  },

  getSyncStatus() { return _status; },

  // ── Export ────────────────────────────────────────────────────────────────
  exportJSON(doc) {
    return JSON.stringify(doc, null, 2);
  },

  // ── Import ────────────────────────────────────────────────────────────────
  importJSON(str) {
    try {
      const parsed = JSON.parse(str);

      // Unified NEXUS doc
      if (parsed.schemaVersion === 3) return parsed;

      // Legacy mediRUN v2 export
      if (parsed._medirun_version === 2) {
        return {
          schemaVersion: 3,
          ui: { activeWorld: 'medi' },
          medi: {
            state: parsed.state || null,
            sylState: parsed.sylState || { topics: [], checked: {} },
            caseLog: parsed.caseLog || []
          },
          kinetix: {
            checks: {},
            bm: { d: 21.0975, t: 8602, label: 'Jun 14 HM (2:23:22 · 29 °C / 80 % RH)' },
            heat: false
          }
        };
      }

      // Bare legacy mediRUN state
      if (parsed.userProfile && parsed.modules) {
        return {
          schemaVersion: 3,
          ui: { activeWorld: 'medi' },
          medi: {
            state: parsed,
            sylState: { topics: [], checked: {} },
            caseLog: []
          },
          kinetix: {
            checks: {},
            bm: { d: 21.0975, t: 8602, label: 'Jun 14 HM (2:23:22 · 29 °C / 80 % RH)' },
            heat: false
          }
        };
      }

      return null; // unrecognized
    } catch { return null; }
  }
};
