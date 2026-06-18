// src/components/kinetix/KinetixWorld.jsx
import SeasonStrip from './SeasonStrip.jsx';
import PlanTab from './PlanTab.jsx';
import PacesTab from './PacesTab.jsx';
import StrengthTab from './StrengthTab.jsx';
import RulesTab from './RulesTab.jsx';
import StatusTab from './StatusTab.jsx';
import CharacterTab from '../CharacterTab.jsx';

export default function KinetixWorld({ doc, commit, tab }) {
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

        {tab === 'plan'      && <PlanTab     doc={doc} commit={commit} />}
        {tab === 'paces'     && <PacesTab    doc={doc} commit={commit} />}
        {tab === 'strength'  && <StrengthTab />}
        {tab === 'rules'     && <RulesTab    doc={doc} />}
        {tab === 'status'    && <StatusTab   doc={doc} />}
        {tab === 'character' && <CharacterTab doc={doc} commit={commit} />}
      </div>
    </div>
  );
}
