// src/components/medi/MediWorld.jsx
import { useState, useEffect } from 'react';
import TrackerView from './TrackerView.jsx';
import AnalyticsView from './AnalyticsView.jsx';
import PleView from './PleView.jsx';
import ScheduleView from './ScheduleView.jsx';
import CharacterTab from '../CharacterTab.jsx';

export default function MediWorld({ doc, commit, tab, setTab }) {
  const [tick, setTick] = useState(0);

  // 60s tick for countdown + phase updates
  useEffect(() => {
    const id = setInterval(() => setTick(t => t + 1), 60000);
    return () => clearInterval(id);
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
      {tab === 'tracker'   && <TrackerView   doc={doc} commit={commit} tick={tick} />}
      {tab === 'analytics' && <AnalyticsView  doc={doc} commit={commit} tick={tick} />}
      {tab === 'schedule'  && <ScheduleView   doc={doc} commit={commit} />}
      {tab === 'ple'       && <PleView        doc={doc} commit={commit} />}
      {tab === 'character' && <div style={{ flex: 1, overflowY: 'auto' }}><CharacterTab doc={doc} commit={commit} /></div>}
    </div>
  );
}
