// src/components/medi/ScheduleView.jsx
import { useState } from 'react';
import OverviewView from './schedule/OverviewView.jsx';
import CalendarView from './schedule/CalendarView.jsx';
import GanttView    from './schedule/GanttView.jsx';

const MODES = [
  { id: 'overview',  label: 'Overview' },
  { id: 'calendar',  label: 'Calendar' },
  { id: 'gantt',     label: 'Timeline' },
];

export default function ScheduleView({ doc }) {
  const [mode, setMode] = useState('overview');
  const state = doc.medi.state;

  return (
    <div className="schedule-view">
      <div className="sched-modebar">
        {MODES.map(m => (
          <button
            key={m.id}
            className={`sched-mode-btn${mode === m.id ? ' active' : ''}`}
            onClick={() => setMode(m.id)}
          >
            {m.label}
          </button>
        ))}
      </div>

      <div className="schedule-view-content">
        {mode === 'overview' && <OverviewView state={state} />}
        {mode === 'calendar' && <CalendarView state={state} />}
        {mode === 'gantt'    && <GanttView    state={state} />}
      </div>
    </div>
  );
}
