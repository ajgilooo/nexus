// src/components/medi/schedule/DutyRosterView.jsx
// Duty-cycle aware study calendar — fully manual, no cycle assumption.
// User paints any day PRE / DUTY / POST / OFF; today's Q target updates live.
import { useState, useRef, useEffect } from 'react';
import { monthsBetween, padDate, blockForDate } from './scheduleHelpers.js';

const RANGE_START = '2026-07-01';
const RANGE_END   = '2027-10-15';
const MONTHS      = monthsBetween(RANGE_START, RANGE_END);
const WEEKDAYS    = ['S','M','T','W','T','F','S'];

// Duty modes with Q-target breakdowns (from The 93 Study Protocol)
const MODES = [
  { id:'pre',  label:'Pre-Duty',  abbr:'PRE',  sub:'7a–7p · study hard',       qs:{ fresh:45, resurf:0,  local:0, short:0  } },
  { id:'duty', label:'On Duty',   abbr:'DUTY', sub:'7p–7a · short sets only',  qs:{ fresh:0,  resurf:0,  local:0, short:25 } },
  { id:'post', label:'Post-Duty', abbr:'POST', sub:'free 24h · recover+study', qs:{ fresh:50, resurf:30, local:0, short:0  } },
  { id:'off',  label:'Off',       abbr:'OFF',  sub:'rest / light Qs',          qs:{ fresh:20, resurf:10, local:0, short:0  } },
];

// Map block labels → pre-assessment / qbank / post-assessment protocol strings
const BLOCK_PROTOCOL = {
  'MED 260':           { pre:'Amboss 200 Concepts S1 (cardio/pulm/renal)',          bank:'UWorld S2 IM + Mehlman HY Internal Medicine',              post:'Medicine SA Forms 5–10' },
  'PEDIA 260':         { pre:'PassMedicine S1 (peds/genetics)',                     bank:'UWorld S2 Peds + Mehlman HY Pediatrics',                   post:'Pediatrics SA Forms 5–9' },
  'SURG 260':          { pre:'USMLERx S1 (trauma/GI anatomy)',                      bank:'UWorld S2 Surgery + Mehlman HY Surgery + HY Emergency Med', post:'Surgery SA Forms 5–8' },
  'FCH 260.1':         { pre:'Amboss HY Biostatistics & Epidemiology',              bank:'UWorld S1 biostat + Mehlman HY Family Med + PH-LOCAL',     post:'Family Medicine SA Forms 2–4' },
  'FCH 260':           { pre:'Amboss S3 (ethics/QI/patient safety)',                bank:'Amboss S3 + Legal Med Local + leftover UWorld S1/S2',       post:'Emergency Med SA Forms 1–3' },
  'OB-GYN 260':        { pre:'USMLERx S1 (repro/endo)',                             bank:'UWorld S2 OB-Gyn + Mehlman HY ObGyn',                      post:'Clinical OB-Gyn SA Forms 5–10' },
  '[E] MED 292':       { pre:'Amboss 200 Concepts S2 (GI/cardio)',                  bank:'UWorld S2 IM + Mehlman HY IM (GI/cardio focus)',            post:'Medicine SA Forms 7–9' },
  '[E] MED 291':       { pre:'Amboss 200 Concepts S2 (GI)',                         bank:'UWorld S2 GI + Mehlman HY IM (GI focus)',                   post:'Medicine SA Form 7' },
  '[E] Neurosc 291.1': { pre:'All 6 basic sciences (full sprint)',                  bank:'UWorld S1 reset + Amboss S1 basic science',                 post:'NBME Comp Basic Science Forms 25–33' },
  'Core Consolidation Blitz':  { pre:'Amboss 200 Concepts (mixed — all subjects)',  bank:'UWorld S2 + Amboss S3 (mixed — bridge to PLE)',             post:'NBME Comp + Clinical Mastery forms' },
  'Dedicated PLE Sprint I':    { pre:'NBME Comp Forms 25–29 (timed simulation)',    bank:'UWorld S2 incorrects reset + Amboss S3',                   post:'NBME Comp Forms 30–33 + Subject Exams' },
  'Dedicated PLE Sprint II':   { pre:'Weak zone targeted review (Analytics → Radar)', bank:'Local Q-banks + Mehlman HY (all subjects)',              post:'Clinical Mastery forms + Subject Exams' },
  'Final Pre-Exam Sprint':     { pre:'Mehlman HY (all subjects) — review only',    bank:'Timed mocks — no new material, pure recall',               post:'uWorld + NBME Self-Assessments' },
};

function totalQs(qs) {
  return qs ? (qs.fresh + qs.resurf + qs.local + qs.short) : 0;
}

function getTodayStr() {
  const d = new Date();
  return padDate(d.getFullYear(), d.getMonth() + 1, d.getDate());
}

// ── Today's Command Card ──────────────────────────────────────────────────────
function TodayCommand({ todayStr, roster, block }) {
  const todayMode = roster[todayStr] || null;
  const modeData  = MODES.find(m => m.id === todayMode);
  const qs        = modeData?.qs;
  const total     = totalQs(qs);
  const proto     = block ? BLOCK_PROTOCOL[block.label] : null;

  const d = new Date(todayStr + 'T00:00:00');
  const dateLabel = d.toLocaleDateString('en-US', { weekday:'long', month:'long', day:'numeric', year:'numeric' });

  const modeColor = { pre:'#60a5fa', duty:'#f87171', post:'#34d399', off:'#94a3b8' }[todayMode] || 'var(--muted)';

  return (
    <div className="dr-command">
      <div className="dr-command-grid">
        {/* Left: status + Q breakdown */}
        <div className="dr-cmd-left">
          <div className="dr-cmd-date">{dateLabel}</div>
          {todayMode ? (
            <>
              <div className="dr-cmd-mode" style={{ color: modeColor }}>{modeData.label}</div>
              <div className="dr-cmd-sub">{modeData.sub}</div>
              <div className="dr-cmd-chips">
                {[
                  { val: qs.fresh,  label: 'fresh Qs'  },
                  { val: qs.resurf, label: 'resurface'  },
                  { val: qs.short,  label: 'short sets' },
                ].map(c => (
                  <div key={c.label} className={`dr-chip${c.val === 0 ? ' zero' : ''}`}>
                    <div className="dr-chip-val">{c.val}</div>
                    <div className="dr-chip-label">{c.label}</div>
                  </div>
                ))}
                <div className="dr-chip dr-chip-total">
                  <div className="dr-chip-val">{total}</div>
                  <div className="dr-chip-label">total Qs</div>
                </div>
              </div>
            </>
          ) : (
            <div className="dr-cmd-unset">
              Today is not mapped yet.
              <br />Paint this day in the calendar below to set your duty status.
            </div>
          )}
        </div>

        {/* Right: pre/bank/post protocol reference */}
        <div className="dr-cmd-right">
          <div className="dr-cmd-proto-title">
            {block ? `The 93 Protocol · ${block.label}` : 'Protocol Reference'}
          </div>
          {proto ? (
            <div className="dr-proto-rows">
              <div className="dr-proto-row">
                <span className="dr-proto-tag dr-tag-pre">PRE</span>
                <span className="dr-proto-text">{proto.pre}</span>
              </div>
              <div className="dr-proto-row">
                <span className="dr-proto-tag dr-tag-bank">BANK</span>
                <span className="dr-proto-text">{proto.bank}</span>
              </div>
              <div className="dr-proto-row">
                <span className="dr-proto-tag dr-tag-post">POST</span>
                <span className="dr-proto-text">{proto.post}</span>
              </div>
            </div>
          ) : (
            <div className="dr-proto-empty">
              {block
                ? `Block "${block.label}" has no protocol entry — add one to BLOCK_PROTOCOL in DutyRosterView.jsx.`
                : 'No active rotation block today.'}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Paint Toolbar ─────────────────────────────────────────────────────────────
function PaintBar({ paint, setPaint, onClearAll }) {
  const [confirmClear, setConfirmClear] = useState(false);

  function handleClear() {
    if (confirmClear) {
      onClearAll();
      setConfirmClear(false);
    } else {
      setConfirmClear(true);
      setTimeout(() => setConfirmClear(false), 3000);
    }
  }

  return (
    <div className="dr-paintbar">
      <span className="dr-paintbar-label">Paint</span>
      <div className="dr-paint-btns">
        {MODES.map(m => (
          <button
            key={m.id}
            className={`dr-paint-btn dr-paint-${m.id}${paint === m.id ? ' sel' : ''}`}
            onClick={() => setPaint(m.id)}
            title={`${m.label} — ${totalQs(m.qs)} Qs`}
          >
            {m.abbr}
          </button>
        ))}
        <button
          className={`dr-paint-btn dr-paint-erase${paint === 'erase' ? ' sel' : ''}`}
          onClick={() => setPaint('erase')}
          title="Erase — clear a day's duty status"
        >
          Erase
        </button>
      </div>
      <button className="dr-clear-btn" onClick={handleClear}>
        {confirmClear ? 'Confirm clear all?' : 'Clear all'}
      </button>
    </div>
  );
}

// ── Legend ────────────────────────────────────────────────────────────────────
function DutyLegend() {
  return (
    <div className="dr-legend">
      {MODES.map(m => (
        <div key={m.id} className="dr-legend-item">
          <div className={`dr-legend-dot dr-dot-${m.id}`} />
          <span>{m.label}</span>
          <span className="dr-legend-qs">{totalQs(m.qs)}Q</span>
        </div>
      ))}
      <div className="dr-legend-item">
        <div className="dr-legend-dot dr-dot-unset" />
        <span>Unset</span>
      </div>
    </div>
  );
}

// ── Month Grid ────────────────────────────────────────────────────────────────
function MonthGrid({ mo, roster, paint, onPaint, todayStr, currentRef }) {
  const { year, month, daysInMonth, firstWeekday, label } = mo;
  const isCurrentMonth = new Date().getFullYear() === year && new Date().getMonth() === month;

  const cells = [
    ...Array(firstWeekday).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  // Pad to full weeks
  while (cells.length % 7 !== 0) cells.push(null);

  return (
    <div className="dr-month" ref={isCurrentMonth ? currentRef : null}>
      <div className="dr-month-header">{label}</div>
      <div className="dr-weekday-row">
        {WEEKDAYS.map((d, i) => <span key={i}>{d}</span>)}
      </div>
      <div className="dr-day-grid">
        {cells.map((day, idx) => {
          if (!day) return <div key={idx} className="dr-day dr-day-empty" />;
          const ds   = padDate(year, month + 1, day);
          const mode = roster[ds] || null;
          const isToday = ds === todayStr;

          // Short label inside the cell
          const modeAbbr = { pre:'PRE', duty:'DX', post:'PST', off:'OFF' }[mode] || null;

          return (
            <div
              key={idx}
              className={[
                'dr-day',
                mode ? `dr-m-${mode}` : 'dr-m-unset',
                isToday ? 'dr-today' : '',
              ].filter(Boolean).join(' ')}
              onClick={() => onPaint(ds)}
              title={`${ds}${mode ? ` · ${mode.toUpperCase()}` : ' · unset'}`}
            >
              <span className="dr-day-num">{day}</span>
              {modeAbbr && <span className="dr-day-mode">{modeAbbr}</span>}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Summary Stats Bar ─────────────────────────────────────────────────────────
function SummaryBar({ roster }) {
  const counts = { pre: 0, duty: 0, post: 0, off: 0 };
  Object.values(roster).forEach(m => { if (m in counts) counts[m]++; });
  const total = Object.values(counts).reduce((a, b) => a + b, 0);

  // Projected Q volume
  const projectedQs = MODES.reduce((sum, m) => sum + (counts[m.id] || 0) * totalQs(m.qs), 0);

  return (
    <div className="dr-summary-bar">
      <span className="dr-summary-label">{total} days mapped</span>
      {MODES.map(m => counts[m.id] > 0 && (
        <span key={m.id} className={`dr-summary-pill dr-pill-${m.id}`}>
          {counts[m.id]} {m.abbr}
        </span>
      ))}
      {projectedQs > 0 && (
        <span className="dr-summary-proj">
          ~{projectedQs.toLocaleString()} Qs projected
        </span>
      )}
    </div>
  );
}

// ── DutyRosterView (root) ─────────────────────────────────────────────────────
export default function DutyRosterView({ doc, commit }) {
  const state   = doc.medi.state;
  const roster  = state.dutyRoster || {};
  const [paint, setPaint] = useState('duty');
  const currentRef = useRef(null);
  const todayStr   = getTodayStr();
  const block      = blockForDate(new Date(todayStr + 'T12:00:00'));

  useEffect(() => {
    currentRef.current?.scrollIntoView({ behavior: 'auto', block: 'center' });
  }, []);

  function onPaint(ds) {
    const newRoster = { ...roster };
    if (paint === 'erase') {
      delete newRoster[ds];
    } else {
      newRoster[ds] = paint;
    }
    commit({ ...doc, medi: { ...doc.medi, state: { ...state, dutyRoster: newRoster } } });
  }

  function onClearAll() {
    commit({ ...doc, medi: { ...doc.medi, state: { ...state, dutyRoster: {} } } });
  }

  return (
    <div className="dr-view">
      <div className="dr-scroll">
        <SummaryBar roster={roster} />

        <TodayCommand todayStr={todayStr} roster={roster} block={block} />

        <PaintBar paint={paint} setPaint={setPaint} onClearAll={onClearAll} />
        <DutyLegend />

        <div className="dr-hint">
          Click any day to paint it with the selected mode. No cycle is assumed — every day is set independently.
          Today is highlighted with a green ring.
        </div>

        <div className="dr-cal-grid">
          {MONTHS.map((mo, idx) => (
            <MonthGrid
              key={idx}
              mo={mo}
              roster={roster}
              paint={paint}
              onPaint={onPaint}
              todayStr={todayStr}
              currentRef={currentRef}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
