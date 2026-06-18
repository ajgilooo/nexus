// src/components/AppSidebar.jsx
import XpStrip from './XpStrip.jsx';

const MEDI_TABS = [
  { id: 'tracker',   label: 'Tracker'         },
  { id: 'analytics', label: 'Analytics'        },
  { id: 'schedule',  label: 'Schedule'         },
  { id: 'ple',       label: 'PLE Intelligence' },
  { id: 'character', label: 'Character'        },
];

const KINETIX_TABS = [
  { id: 'plan',      label: 'Plan'      },
  { id: 'paces',     label: 'Paces'     },
  { id: 'strength',  label: 'Strength'  },
  { id: 'rules',     label: 'Rules'     },
  { id: 'status',    label: 'Status'    },
  { id: 'character', label: 'Character' },
];

const WORLDS = [
  { id: 'today',   label: 'TODAY'   },
  { id: 'medi',    label: 'MEDI'    },
  { id: 'kinetix', label: 'KINETIX' },
];

function SyncChip({ status, onOpen }) {
  const labels = {
    synced:  { dot: '●', text: 'synced',          cls: 'chip-ok'   },
    saving:  { dot: '↑', text: 'saving…',         cls: 'chip-saving'},
    offline: { dot: '⚠', text: 'offline · cached', cls: 'chip-warn' },
    auth:    { dot: '⚠', text: 'tap to sign in',   cls: 'chip-warn' },
    idle:    { dot: '○', text: 'not synced',       cls: 'chip-idle' },
  };
  const l = labels[status] || labels.idle;
  return (
    <button className={`sync-chip ${l.cls}`} onClick={onOpen} title="Sync settings">
      <span className="chip-dot">{l.dot}</span>
      <span className="chip-text">{l.text}</span>
    </button>
  );
}

export default function AppSidebar({
  world, setWorld,
  mediTab, setMediTab,
  kinetixTab, setKinetixTab,
  syncStatus, onOpenSettings,
  doc,
}) {
  const tabs = world === 'medi'    ? MEDI_TABS
             : world === 'kinetix' ? KINETIX_TABS
             : [];
  const activeTab = world === 'medi'    ? mediTab
                  : world === 'kinetix' ? kinetixTab
                  : null;

  function handleTabClick(id) {
    if (world === 'medi')    setMediTab(id);
    if (world === 'kinetix') setKinetixTab(id);
  }

  return (
    <aside className="app-sidebar">
      <div className="sidebar-brand">NEXUS</div>

      <nav className="sidebar-worlds">
        {WORLDS.map(w => (
          <button
            key={w.id}
            className={`sw-btn${world === w.id ? ' sw-active' : ''}`}
            onClick={() => setWorld(w.id)}
          >
            <span className="sw-indicator" />
            {w.label}
          </button>
        ))}
      </nav>

      {tabs.length > 0 && (
        <>
          <div className="sidebar-divider" />
          <nav className="sidebar-tabs">
            {tabs.map(t => (
              <button
                key={t.id}
                className={`st-btn${activeTab === t.id ? ' st-active' : ''}`}
                onClick={() => handleTabClick(t.id)}
              >
                {t.label}
              </button>
            ))}
          </nav>
        </>
      )}

      <div className="sidebar-footer">
        {doc.rpg && <XpStrip doc={doc} onOpenCharacter={() => handleTabClick('character')} />}
        <SyncChip status={syncStatus} onOpen={onOpenSettings} />
        <button className="sidebar-settings-btn" onClick={onOpenSettings} title="Settings">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <circle cx="12" cy="12" r="3"/>
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
          </svg>
          Settings
        </button>
      </div>
    </aside>
  );
}
