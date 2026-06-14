// src/components/medi/MediWorld.jsx
import { useState, useEffect } from 'react';
import TrackerView from './TrackerView.jsx';
import AnalyticsView from './AnalyticsView.jsx';
import PleView from './PleView.jsx';

const TABS = [
  { id: 'tracker',   label: 'Tracker'         },
  { id: 'analytics', label: 'Analytics'        },
  { id: 'ple',       label: 'PLE Intelligence' },
];

export default function MediWorld({ doc, commit }) {
  const [tab, setTab] = useState('tracker');
  const [tick, setTick] = useState(0);

  // 60s tick for countdown + phase updates (§4.12)
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
            onClick={() => setTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </nav>

      {tab === 'tracker'   && <TrackerView   doc={doc} commit={commit} tick={tick} />}
      {tab === 'analytics' && <AnalyticsView  doc={doc} commit={commit} tick={tick} />}
      {tab === 'ple'       && <PleView        doc={doc} commit={commit} />}
    </div>
  );
}
