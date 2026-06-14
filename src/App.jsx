// src/App.jsx
import { useState, useEffect, useRef } from 'react';
import { useApp } from './state/appStore.jsx';
import { Store, setToken } from './lib/storage.js';
import MediWorld from './components/medi/MediWorld.jsx';
import KinetixWorld from './components/kinetix/KinetixWorld.jsx';

function SyncChip({ status, onOpen }) {
  const labels = {
    synced:  { dot: '●', text: 'synced',        cls: 'chip-ok'      },
    saving:  { dot: '↑', text: 'saving…',       cls: 'chip-saving'  },
    offline: { dot: '⚠', text: 'offline · cached', cls: 'chip-warn' },
    auth:    { dot: '⚠', text: 'tap to sign in',   cls: 'chip-warn' },
    idle:    { dot: '○', text: 'not synced',     cls: 'chip-idle'    },
  };
  const l = labels[status] || labels.idle;
  return (
    <button className={`sync-chip ${l.cls}`} onClick={onOpen} title="Sync settings">
      <span className="chip-dot">{l.dot}</span>
      <span className="chip-text">{l.text}</span>
    </button>
  );
}

function SettingsPopover({ onClose, doc, commit }) {
  const [tokenInput, setTokenInput] = useState(localStorage.getItem('nexus_token') || '');
  const [importErr, setImportErr] = useState('');
  const fileRef = useRef();

  function saveToken() {
    setToken(tokenInput.trim());
    Store.forceSync();
    onClose();
  }

  function handleExport() {
    const str = Store.exportJSON(doc);
    const d = new Date().toISOString().slice(0, 10);
    const a = document.createElement('a');
    a.href = 'data:application/json;charset=utf-8,' + encodeURIComponent(str);
    a.download = `nexus_backup_${d}.json`;
    a.click();
  }

  function handleImport(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      const result = Store.importJSON(ev.target.result);
      if (!result) { setImportErr('Import failed — not a valid NEXUS backup.'); return; }
      commit(result);
      setImportErr('');
      onClose();
    };
    reader.readAsText(file);
  }

  return (
    <div className="popover-backdrop" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="settings-popover">
        <div className="pop-header">
          <span>Settings</span>
          <button className="pop-close" onClick={onClose}>✕</button>
        </div>

        <div className="pop-section">
          <label className="pop-label">App Token</label>
          <div className="pop-row">
            <input
              type="password"
              className="pop-input"
              value={tokenInput}
              onChange={e => setTokenInput(e.target.value)}
              placeholder="nexus_joseph_…"
              onKeyDown={e => e.key === 'Enter' && saveToken()}
            />
            <button className="pop-btn" onClick={saveToken}>Save</button>
          </div>
        </div>

        <div className="pop-section">
          <button className="pop-btn full" onClick={() => Store.forceSync()}>↑ Force sync to cloud</button>
          <button className="pop-btn full" onClick={() => Store.forcePull().then(raw => raw && commit(raw))}>↓ Pull from cloud</button>
        </div>

        <div className="pop-section">
          <button className="pop-btn full" onClick={handleExport}>Export JSON backup</button>
          <button className="pop-btn full" onClick={() => fileRef.current.click()}>Import JSON backup</button>
          <input ref={fileRef} type="file" accept=".json" style={{ display: 'none' }} onChange={handleImport} />
          {importErr && <p className="pop-err">{importErr}</p>}
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const { doc, commit, setWorld, syncStatus, loading } = useApp();
  const [showSettings, setShowSettings] = useState(false);

  if (loading) {
    return (
      <div className="app-loading">
        <div className="loading-brand">NEXUS</div>
        <div className="loading-sub">Loading…</div>
      </div>
    );
  }

  const world = doc.ui?.activeWorld || 'medi';

  return (
    <div className="app-root" data-world={world}>
      {/* ── Top bar ─────────────────────────────────────────────────────── */}
      <header className="topbar">
        <div className="topbar-brand">NEXUS</div>

        <div className="world-toggle">
          <button
            className={`wt-btn ${world === 'medi' ? 'wt-active' : ''}`}
            onClick={() => setWorld('medi')}
          >
            MEDI
          </button>
          <button
            className={`wt-btn ${world === 'kinetix' ? 'wt-active' : ''}`}
            onClick={() => setWorld('kinetix')}
          >
            KINETIX
          </button>
        </div>

        <SyncChip status={syncStatus} onOpen={() => setShowSettings(true)} />
      </header>

      {/* ── World body ───────────────────────────────────────────────────── */}
      <main className="world-body">
        {world === 'medi'
          ? <MediWorld doc={doc} commit={commit} />
          : <KinetixWorld doc={doc} commit={commit} />
        }
      </main>

      {showSettings && (
        <SettingsPopover
          onClose={() => setShowSettings(false)}
          doc={doc}
          commit={commit}
        />
      )}
    </div>
  );
}
