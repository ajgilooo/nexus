// src/components/medi/MediWorld.jsx
import { useState, useEffect } from 'react';
import TrackerView from './TrackerView.jsx';
import AnalyticsView from './AnalyticsView.jsx';
import PleView from './PleView.jsx';
import CharacterTab from '../CharacterTab.jsx';

const TABS = [
  { id: 'tracker',   label: 'Tracker'         },
  { id: 'analytics', label: 'Analytics'        },
  { id: 'ple',       label: 'PLE Intelligence' },
  { id: 'character', label: 'Character'        },
];

export default function MediWorld({ doc, commit, navTarget, characterOpen, onTabChange }) {
  const [tab, setTab] = useState('tracker');
  const [tick, setTick] = useState(0);

  // Respond to deep-link from the Today command center
  useEffect(() => {
    if (navTarget?.tab && TABS.some(t => t.id === navTarget.tab)) {
      setTab(navTarget.tab);
    }
  }, [navTarget?.ts]);

  // Sync shared Character tab open state
  useEffect(() => {
    if (characterOpen) setTab('character');
  }, [characterOpen]);

  function handleTabChange(id) {
    setTab(id);
    if (onTabChange) onTabChange(id);
  }

  // 60s tick for countdown + phase updates
  useEffect(() => {
    const id = setInterval(() => setTick(t => t + 1), 60000);
    return () => clearInterval(id);
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
      <nav className="medi-tabbar">
        {TABS.map(t => (
          <button
            key={t.id}
            className={`medi-tab ${tab === t.id ? 'active' : ''}`}
            onClick={() => handleTabChange(t.id)}
          >
            {t.label}
          </button>
        ))}
      </nav>

      {tab === 'tracker'   && <TrackerView   doc={doc} commit={commit} tick={tick} />}
      {tab === 'analytics' && <AnalyticsView  doc={doc} commit={commit} tick={tick} />}
      {tab === 'ple'       && <PleView        doc={doc} commit={commit} />}
      {tab === 'character' && <div style={{ flex: 1, overflowY: 'auto' }}><CharacterTab doc={doc} commit={commit} /></div>}
    </div>
  );
}
