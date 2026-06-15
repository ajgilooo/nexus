// src/state/appStore.js
// Central state management. Single in-memory unified doc + React context.

import React, { createContext, useContext, useReducer, useEffect, useCallback, useState } from 'react';
import { Store } from '../lib/storage.js';
import { freshState, coerceModuleData } from '../lib/medi.logic.js';
import { DEFAULT_BM } from '../lib/kinetix.data.js';

const USER_ID = 'joseph';

// ── Default doc ───────────────────────────────────────────────────────────────
function defaultDoc() {
  return {
    schemaVersion: 3,
    ui: { activeWorld: 'today' },
    medi: {
      state: freshState(),
      sylState: { topics: [], checked: {} },
      caseLog: []
    },
    kinetix: {
      checks: {},
      bm: { ...DEFAULT_BM },
      heat: false
    }
  };
}

// ── Migration / coercion ──────────────────────────────────────────────────────
function migrate(raw) {
  if (!raw) return defaultDoc();
  const def = defaultDoc();
  const doc = { ...def, ...raw };
  doc.schemaVersion = 3;

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
    dispatch({ type: 'COMMIT', payload: nextDoc });
    Store.save(USER_ID, nextDoc);
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
