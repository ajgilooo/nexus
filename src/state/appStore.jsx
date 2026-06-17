// src/state/appStore.jsx
// Central state management. Single in-memory unified doc + React context.

import React, { createContext, useContext, useReducer, useEffect, useCallback, useState } from 'react';
import { Store } from '../lib/storage.js';
import { freshState, coerceModuleData } from '../lib/medi.logic.js';
import { DEFAULT_BM } from '../lib/kinetix.data.js';
import { SHOP_SEED, rpgTick } from '../lib/rpg.logic.js';

const USER_ID = 'joseph';

// ── Default doc ───────────────────────────────────────────────────────────────
function defaultDoc() {
  return {
    schemaVersion: 4,
    ui: { activeWorld: 'today' },
    medi: {
      state: freshState(),
      sylState: { topics: [], checked: {} },
      caseLog: [],
      rotationExams: []
    },
    kinetix: {
      checks: {},
      bm: { ...DEFAULT_BM },
      heat: false
    },
    rpg: {
      coins: 0,
      redemptions: [],
      shop: [...SHOP_SEED],
      badgeState: {},
      xpLedgerCache: { lifetimeXP: 0, computedAt: 0 }
    },
    duty: { mode: null, setAt: null },
    todos: []
  };
}

// ── Migration / coercion ──────────────────────────────────────────────────────
// ── SketchyBar bridge sync (fire-and-forget) ──────────────────────────────────
function buildBridgePayload(doc) {
  const todos = doc.todos || [];
  const active = todos.filter(t => !t.done);
  const high = active.filter(t => t.priority === 'high');
  const next = [...active].sort((a, b) => {
    const w = { high: 0, normal: 1, low: 2 };
    return (w[a.priority] || 1) - (w[b.priority] || 1);
  })[0];
  return {
    updatedAt: new Date().toISOString(),
    duty: doc.duty || { mode: null },
    todos: { total: todos.length, done: todos.filter(t => t.done).length, active: active.length, high: high.length, next: next?.text || null },
    medi:   { streak: doc.medi?.state?.streak || 0 },
    rpg:    { coins: doc.rpg?.coins || 0 },
  };
}
async function bridgeSync(doc) {
  try {
    await fetch('http://localhost:47893/push', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(buildBridgePayload(doc)),
      signal: AbortSignal.timeout(1500),
    });
  } catch { /* bridge not running — silent */ }
}

function migrate(raw) {
  if (!raw) return defaultDoc();
  const def = defaultDoc();
  const doc = { ...def, ...raw };
  doc.schemaVersion = 5;

  doc.ui = { activeWorld: 'today', ...(raw.ui || {}) };

  doc.medi = { ...def.medi, ...(raw.medi || {}) };
  if (!doc.medi.state) {
    doc.medi.state = freshState();
  } else {
    const fs = freshState();
    doc.medi.state = { ...fs, ...doc.medi.state };
    if (!doc.medi.state.modules) doc.medi.state.modules = fs.modules;
    if (!doc.medi.state.pipeline) doc.medi.state.pipeline = fs.pipeline;
    if (!doc.medi.state.dailyHistory) doc.medi.state.dailyHistory = {};
    if (!doc.medi.state.questionLogs) doc.medi.state.questionLogs = [];
    coerceModuleData(doc.medi.state);
  }
  if (!doc.medi.sylState) doc.medi.sylState = { topics: [], checked: {} };
  if (!doc.medi.caseLog) doc.medi.caseLog = [];
  if (!Array.isArray(doc.medi.rotationExams)) doc.medi.rotationExams = [];
  // examLog lives inside state; carry over any legacy medi.examLog placement.
  if (!Array.isArray(doc.medi.state.examLog)) {
    doc.medi.state.examLog = Array.isArray(doc.medi.examLog) ? doc.medi.examLog : [];
  }
  delete doc.medi.examLog;

  doc.kinetix = { ...def.kinetix, ...(raw.kinetix || {}) };
  if (!doc.kinetix.checks) doc.kinetix.checks = {};
  if (!doc.kinetix.bm || typeof doc.kinetix.bm.d !== 'number') {
    doc.kinetix.bm = { ...DEFAULT_BM };
  }
  if (typeof doc.kinetix.heat !== 'boolean') doc.kinetix.heat = false;

  // RPG — seed on first migration or if missing
  const rawRpg = raw.rpg || {};
  doc.rpg = {
    coins: Math.max(0, Number(rawRpg.coins) || 0),
    redemptions: Array.isArray(rawRpg.redemptions) ? rawRpg.redemptions : [],
    shop: Array.isArray(rawRpg.shop) && rawRpg.shop.length > 0 ? rawRpg.shop : [...SHOP_SEED],
    badgeState: (rawRpg.badgeState && typeof rawRpg.badgeState === 'object') ? rawRpg.badgeState : {},
    xpLedgerCache: (rawRpg.xpLedgerCache && typeof rawRpg.xpLedgerCache === 'object')
      ? rawRpg.xpLedgerCache
      : { lifetimeXP: 0, computedAt: 0 }
  };
  if (typeof doc.rpg.xpLedgerCache.lifetimeXP !== 'number') doc.rpg.xpLedgerCache.lifetimeXP = 0;

  // Duty + todos (v5)
  doc.duty = { mode: null, setAt: null, ...(raw.duty || {}) };
  if (!Array.isArray(doc.todos)) doc.todos = [];

  return doc;
}

// ── Reducer ───────────────────────────────────────────────────────────────────
function reducer(doc, action) {
  switch (action.type) {
    case 'LOAD':
      return migrate(action.payload);
    case 'COMMIT':
      return { ...action.payload };
    default:
      return doc;
  }
}

// ── Context ───────────────────────────────────────────────────────────────────
const AppCtx = createContext(null);

export function AppProvider({ children }) {
  const [doc, dispatch] = useReducer(reducer, null, () => migrate(null));
  const [syncStatus, setSyncStatus] = useState('idle');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = Store.subscribe(setSyncStatus);
    Store.load(USER_ID).then(raw => {
      if (raw) dispatch({ type: 'LOAD', payload: raw });
      setLoading(false);
    });
    return unsub;
  }, []);

  const commit = useCallback((nextDoc) => {
    rpgTick(nextDoc);
    dispatch({ type: 'COMMIT', payload: nextDoc });
    Store.save(USER_ID, nextDoc);
    bridgeSync(nextDoc);
  }, []);

  const setWorld = useCallback((world) => {
    const next = { ...doc, ui: { ...doc.ui, activeWorld: world } };
    commit(next);
  }, [doc, commit]);

  return (
    <AppCtx.Provider value={{ doc, commit, setWorld, syncStatus, loading }}>
      {children}
    </AppCtx.Provider>
  );
}

export function useApp() { return useContext(AppCtx); }
