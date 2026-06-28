// src/App.jsx
import { useState, useRef, useEffect } from 'react';
import { useApp } from './state/appStore.jsx';
import { Store, setToken } from './lib/storage.js';
import { handleOAuthCallback } from './lib/gcal.js';
import MediWorld from './components/medi/MediWorld.jsx';
import KinetixWorld from './components/kinetix/KinetixWorld.jsx';
import TodayWorld from './components/today/TodayWorld.jsx';
import AppSidebar from './components/AppSidebar.jsx';
import GCalSync from './components/GCalSync.jsx';
import KanbanBoard from './components/KanbanBoard.jsx';

function SettingsPopover({ onClose, doc, commit }) {
  const [tokenInput, setTokenInput] = useState(localStorage.getItem('nexus_token') || '');
  const [importErr, setImportErr]   = useState('');
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

        <div className="pop-divider" />
        <GCalSync doc={doc} />
      </div>
    </div>
  );
}

export default function App() {
  const { doc, commit, setWorld, syncStatus, loading } = useApp();
  const [showSettings, setShowSettings] = useState(false);
  const [mediTab, setMediTab]       = useState('tracker');
  const [kinetixTab, setKinetixTab] = useState('plan');
  const [gcalJustConnected, setGcalJustConnected] = useState(false);

  // Handle Google OAuth redirect-back on app startup
  useEffect(() => {
    handleOAuthCallback().then(ok => {
      if (ok) { setGcalJustConnected(true); setShowSettings(true); }
    });
  }, []);

  function navigateTo(targetWorld, tab) {
    setWorld(targetWorld);
    if (targetWorld === 'medi')    setMediTab(tab);
    if (targetWorld === 'kinetix') setKinetixTab(tab);
  }

  if (loading) {
    return (
      <div className="app-loading">
        <div className="loading-brand">NEXUS</div>
        <div className="loading-sub">Loading…</div>
      </div>
    );
  }

  const world = doc.ui?.activeWorld || 'today';

  return (
    <div className="app-root" data-world={world}>
      <AppSidebar
        world={world}
        setWorld={setWorld}
        mediTab={mediTab}
        setMediTab={setMediTab}
        kinetixTab={kinetixTab}
        setKinetixTab={setKinetixTab}
        syncStatus={syncStatus}
        onOpenSettings={() => setShowSettings(true)}
        doc={doc}
      />

      <main className="app-content">
        {world === 'today' && (
          <TodayWorld doc={doc} commit={commit} onNavigate={navigateTo} />
        )}
        {world === 'medi' && (
          <MediWorld doc={doc} commit={commit} tab={mediTab} setTab={setMediTab} />
        )}
        {world === 'kinetix' && (
          <KinetixWorld doc={doc} commit={commit} tab={kinetixTab} />
        )}
        {world === 'plan' && (
          <KanbanBoard doc={doc} commit={commit} />
        )}
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
