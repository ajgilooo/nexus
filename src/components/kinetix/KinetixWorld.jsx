// src/components/kinetix/KinetixWorld.jsx
import { useState } from 'react';
import SeasonStrip from './SeasonStrip.jsx';
import PlanTab from './PlanTab.jsx';
import PacesTab from './PacesTab.jsx';
import StrengthTab from './StrengthTab.jsx';
import RulesTab from './RulesTab.jsx';
import StatusTab from './StatusTab.jsx';

const TABS = [
  { id: 'plan',     label: 'Plan'     },
  { id: 'paces',    label: 'Paces'    },
  { id: 'strength', label: 'Strength' },
  { id: 'rules',    label: 'Rules'    },
  { id: 'status',   label: 'Status'   },
];

export default function KinetixWorld({ doc, commit }) {
  const [tab, setTab] = useState('plan');

  return (
    <div style={{ overflowY: 'auto', flex: 1 }}>
      <div className="kx-world">
        <div className="kx-header">
          <div className="kx-brand">
            KINETIX
            <span>endurance + climbing · 2026–2027</span>
          </div>
          <div className="kx-sub">
            joseph · nov 8 marathon → sub-4 → sub-3:45 jun 2027 · bouldering V4 → comp
          </div>
        </div>

        <SeasonStrip doc={doc} />

        <div className="kx-tabbar">
          {TABS.map(t => (
            <button
              key={t.id}
              className={`kx-tab ${tab === t.id ? 'active' : ''}`}
              onClick={() => setTab(t.id)}
            >
              {t.label}
            </button>
          ))}
        </div>

        {tab === 'plan'     && <PlanTab     doc={doc} commit={commit} />}
        {tab === 'paces'    && <PacesTab    doc={doc} commit={commit} />}
        {tab === 'strength' && <StrengthTab />}
        {tab === 'rules'    && <RulesTab    doc={doc} />}
        {tab === 'status'   && <StatusTab   doc={doc} />}
      </div>
    </div>
  );
}
