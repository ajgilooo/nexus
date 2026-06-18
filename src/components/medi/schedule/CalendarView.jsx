// src/components/medi/schedule/CalendarView.jsx
import { useRef, useEffect, useState } from 'react';
import { INTERNSHIP_SCHEDULE } from '../../../lib/medi.data.js';
import { getSubjectCoverage } from '../../../lib/medi.logic.js';
import {
  monthsBetween, blockForDate, padDate, todayISO,
  SCHEDULE_START, SCHEDULE_END
} from './scheduleHelpers.js';

const MONTHS = monthsBetween(SCHEDULE_START, SCHEDULE_END);
const WEEKDAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
const TODAY = todayISO();

// ── Month grid ────────────────────────────────────────────────────────────────
function MonthGrid({ mo, onSelect, selectedBlockId }) {
  const { year, month, daysInMonth, firstWeekday, label } = mo;
  const cells = [
    ...Array(firstWeekday).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  return (
    <div className="cal-month">
      <div className="cal-month-header">{label}</div>
      <div className="cal-weekday-row">
        {WEEKDAYS.map((d, i) => <span key={i}>{d}</span>)}
      </div>
      <div className="cal-month-grid">
        {cells.map((day, idx) => {
          if (!day) return <div key={idx} className="cal-cell cal-empty" />;
          const dateStr = padDate(year, month + 1, day);
          const block   = blockForDate(new Date(dateStr + 'T12:00:00'));
          const isFirst = block?.start === dateStr;
          const isToday = dateStr === TODAY;
          const isSelected = block && block.id === selectedBlockId;
          const classes = [
            'cal-cell',
            block ? `cal-cell--${block.type}` : 'cal-cell--gap',
            isToday  ? 'today'    : '',
            isFirst  ? 'first-day': '',
            isSelected ? 'selected': '',
            block    ? 'clickable': '',
          ].filter(Boolean).join(' ');

          return (
            <div key={idx} className={classes}
              onClick={() => block && onSelect(block.id)}
              title={block ? `${block.label} · ${block.start} – ${block.end}` : dateStr}
            >
              <span className="cal-day-num">{day}</span>
              {isFirst && <span className="cal-cell-label">{block.label}</span>}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Subject bar inside detail panel ──────────────────────────────────────────
function SubjectRow({ subject, state }) {
  const cov = getSubjectCoverage(state, subject);
  const coverage = cov ? cov.coverage : 0;
  const col = coverage >= 70 ? '#10B981' : coverage >= 40 ? '#F59E0B' : '#EF4444';
  return (
    <div className="cal-subj-row">
      <span className="cal-subj-name">{subject}</span>
      <div className="gap-bar-outer" style={{ flex: 1 }}>
        <div className="gap-bar-inner" style={{ width: coverage + '%', background: col }} />
      </div>
      <span className="cal-subj-pct">{Math.round(coverage)}%</span>
    </div>
  );
}

// ── Block detail panel ────────────────────────────────────────────────────────
function BlockDetail({ block, state, onClose }) {
  if (!block) return null;
  const primary = block.primarySubjects || [];
  const basic   = block.basicSubject ? [block.basicSubject] : [];

  return (
    <div className="cal-detail-panel">
      <div className="cal-detail-header">
        <div>
          <span className={`cal-detail-type-badge cal-type--${block.type}`}>{block.type}</span>
          <h3 className="cal-detail-title">{block.label}</h3>
          <div className="cal-detail-dates">{block.start} – {block.end}</div>
          {block.note && <div className="cal-detail-note">{block.note}</div>}
        </div>
        <button className="cal-detail-close" onClick={onClose}>✕</button>
      </div>

      {(primary.length > 0 || basic.length > 0) && (
        <div className="cal-detail-subjects">
          {primary.length > 0 && (
            <div className="cal-detail-group">
              <div className="cal-detail-group-label">Primary Focus</div>
              {primary.map(s => <SubjectRow key={s} subject={s} state={state} />)}
            </div>
          )}
          {basic.length > 0 && (
            <div className="cal-detail-group">
              <div className="cal-detail-group-label">Basic Science Double-Up</div>
              {basic.map(s => <SubjectRow key={s} subject={s} state={state} />)}
            </div>
          )}
        </div>
      )}

      {block.type === 'blitz' && (
        <div className="cal-detail-blitz">
          <span className="cal-blitz-pill">{block.dailyTarget}–{block.dailyTarget + 50} Q/day</span>
          <span className="cal-blitz-pill">{block.studyHours} hrs/day</span>
        </div>
      )}
    </div>
  );
}

// ── Legend ────────────────────────────────────────────────────────────────────
function CalLegend() {
  const types = [
    { type: 'clinical', label: 'Clinical Rotation' },
    { type: 'elective', label: 'Elective' },
    { type: 'sprint',   label: 'Basic Science Sprint' },
    { type: 'blitz',    label: 'Blitz Period' },
  ];
  return (
    <div className="cal-legend">
      {types.map(t => (
        <div key={t.type} className="cal-legend-item">
          <div className={`cal-legend-dot cal-cell--${t.type}`} />
          <span>{t.label}</span>
        </div>
      ))}
    </div>
  );
}

// ── CalendarView ──────────────────────────────────────────────────────────────
export default function CalendarView({ state }) {
  const [selectedId, setSelectedId] = useState(null);
  const currentMonthRef = useRef(null);
  const today = new Date();

  useEffect(() => {
    currentMonthRef.current?.scrollIntoView({ behavior: 'auto', block: 'center' });
  }, []);

  const selectedBlock = selectedId
    ? INTERNSHIP_SCHEDULE.find(b => b.id === selectedId)
    : null;

  return (
    <div className="cal-layout">
      <div className="cal-scroll">
        <CalLegend />
        {MONTHS.map((mo, idx) => {
          const isCurrentMonth =
            mo.year === today.getFullYear() && mo.month === today.getMonth();
          return (
            <div key={idx} ref={isCurrentMonth ? currentMonthRef : null}>
              <MonthGrid mo={mo} onSelect={setSelectedId} selectedBlockId={selectedId} />
            </div>
          );
        })}
      </div>

      {selectedBlock && (
        <BlockDetail
          block={selectedBlock}
          state={state}
          onClose={() => setSelectedId(null)}
        />
      )}
    </div>
  );
}
