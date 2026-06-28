// src/components/GCalSync.jsx
// Google Calendar sync panel — lives inside SettingsPopover.
import { useState, useEffect } from 'react';
import {
  getClientId, setClientId,
  startOAuth, isConnected, clearTokens,
  syncAll, lastSyncedAt, redirectUri,
} from '../lib/gcal.js';

export default function GCalSync({ doc }) {
  const [clientId, setClientIdLocal] = useState(getClientId);
  const [connected, setConnected]    = useState(isConnected);
  const [status, setStatus]          = useState('idle'); // idle | connecting | syncing | done | error
  const [message, setMessage]        = useState('');
  const [lastSync, setLastSync]      = useState(lastSyncedAt);
  const [showSetup, setShowSetup]    = useState(!isConnected());

  useEffect(() => {
    setConnected(isConnected());
    setLastSync(lastSyncedAt());
  }, []);

  function saveClientId() {
    setClientId(clientId.trim());
    setShowSetup(false);
  }

  async function handleConnect() {
    const cid = clientId.trim();
    if (!cid) { setMessage('Paste your Google OAuth Client ID first.'); return; }
    setClientId(cid);
    setStatus('connecting');
    setMessage('Redirecting to Google…');
    await startOAuth(cid);
  }

  function handleDisconnect() {
    clearTokens();
    setConnected(false);
    setLastSync(null);
    setStatus('idle');
    setMessage('');
    setShowSetup(true);
  }

  async function handleSync() {
    setStatus('syncing');
    setMessage('Starting sync…');
    try {
      const roster = doc?.medi?.state?.dutyRoster || {};
      const { deleted, pushed } = await syncAll(roster, msg => setMessage(msg));
      setStatus('done');
      setLastSync(lastSyncedAt());
      setMessage(`Done — ${pushed} events pushed, ${deleted} removed.`);
    } catch (e) {
      setStatus('error');
      setMessage(e.message);
    }
  }

  const fmtDate = iso => iso
    ? new Date(iso).toLocaleString('en-US', { month:'short', day:'numeric', hour:'numeric', minute:'2-digit' })
    : null;

  return (
    <div className="gcal-panel">
      <div className="gcal-header">
        <svg className="gcal-icon" viewBox="0 0 24 24" fill="none">
          <rect x="3" y="4" width="18" height="17" rx="2" stroke="currentColor" strokeWidth="1.5"/>
          <path d="M3 9h18" stroke="currentColor" strokeWidth="1.5"/>
          <path d="M8 2v4M16 2v4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          <circle cx="12" cy="14" r="1.5" fill="currentColor"/>
        </svg>
        <span className="gcal-title">Google Calendar</span>
        {connected && <span className="gcal-badge-connected">Connected</span>}
      </div>

      {/* What gets synced */}
      <div className="gcal-what">
        Pushes <strong>Medi rotation blocks</strong>, <strong>duty roster days</strong> with Q targets,
        and <strong>Kinetix weekly training sessions</strong> as all-day events.
        Previous NEXUS events are cleared before each sync.
      </div>

      {/* Setup: client ID */}
      {showSetup && (
        <div className="gcal-setup">
          <div className="gcal-setup-title">Step 1 — Google Cloud setup</div>
          <ol className="gcal-steps">
            <li>Go to <strong>console.cloud.google.com</strong> → New project</li>
            <li>Enable the <strong>Google Calendar API</strong></li>
            <li>OAuth consent screen → External, add your email as test user</li>
            <li>Credentials → <strong>OAuth 2.0 Client ID</strong> → Web application</li>
            <li>Authorised redirect URI — add exactly:
              <code className="gcal-uri">{redirectUri()}</code>
            </li>
            <li>Copy the <strong>Client ID</strong> below</li>
          </ol>
          <div className="gcal-row">
            <input
              className="gcal-input"
              placeholder="123456789-abc….apps.googleusercontent.com"
              value={clientId}
              onChange={e => setClientIdLocal(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && saveClientId()}
              spellCheck={false}
            />
            <button className="gcal-btn-save" onClick={saveClientId} disabled={!clientId.trim()}>
              Save
            </button>
          </div>
          {clientId.trim() && (
            <button className="gcal-btn-connect" onClick={handleConnect} disabled={status === 'connecting'}>
              {status === 'connecting' ? 'Redirecting…' : 'Connect Google Calendar →'}
            </button>
          )}
        </div>
      )}

      {/* Connected state */}
      {connected && !showSetup && (
        <div className="gcal-connected-body">
          {lastSync && (
            <div className="gcal-last-sync">Last synced {fmtDate(lastSync)}</div>
          )}
          <div className="gcal-actions">
            <button
              className="gcal-btn-sync"
              onClick={handleSync}
              disabled={status === 'syncing'}
            >
              {status === 'syncing' ? 'Syncing…' : '↑ Sync to Google Calendar'}
            </button>
            <button className="gcal-btn-disconnect" onClick={handleDisconnect}>
              Disconnect
            </button>
          </div>
          <button className="gcal-setup-link" onClick={() => setShowSetup(true)}>
            Change Client ID
          </button>
        </div>
      )}

      {/* Not connected, setup hidden (client ID saved but not yet authed) */}
      {!connected && !showSetup && clientId && (
        <button className="gcal-btn-connect" onClick={handleConnect} disabled={status === 'connecting'}>
          {status === 'connecting' ? 'Redirecting…' : 'Connect Google Calendar →'}
        </button>
      )}

      {/* Status message */}
      {message && (
        <div className={`gcal-msg gcal-msg-${status}`}>{message}</div>
      )}
    </div>
  );
}
