// src/components/kinetix/PlanTab.jsx
import { useState } from 'react';
import { W, PH, RACE_INDICES } from '../../lib/kinetix.data.js';
import { token, currentWeekIdx, fmtD, ringData } from '../../lib/kinetix.logic.js';

const PH_COLORS = [
  'var(--ez)', 'var(--ez)', 'var(--qual)', 'var(--race)', 'var(--ez)',
  'var(--race)', 'var(--swim)', 'var(--ez)', 'var(--bld)', 'var(--bld)',
  'var(--qual)', 'var(--race)', 'var(--swim)'
];

function CompRing({ pct, size = 28 }) {
  const r = size / 2 - 3;
  const circ = 2 * Math.PI * r;
  const dash = circ * pct / 100;
  const color = pct === 100 ? 'var(--ez)' : pct > 0 ? 'var(--qual)' : 'var(--line2)';
  return (
    <svg className="ring-svg" width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="var(--line2)" strokeWidth="2.5" />
      {pct > 0 && (
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth="2.5"
          strokeDasharray={`${dash} ${circ}`} strokeDashoffset="0" strokeLinecap="round"
          style={{ transform: `rotate(-90deg)`, transformOrigin: `${size/2}px ${size/2}px` }}
        />
      )}
      <text x={size/2} y={size/2} textAnchor="middle" dy="3" fill={color}
        fontSize={pct === 100 ? "8" : "7"} fontWeight="700">
        {pct === 100 ? '✓' : pct > 0 ? pct + '%' : ''}
      </text>
    </svg>
  );
}

export default function PlanTab({ doc, commit }) {
  const checks = doc.kinetix.checks || {};
  const bm = doc.kinetix.bm;
  const heat = doc.kinetix.heat;
  const nowIdx = currentWeekIdx();
  const [openWeeks, setOpenWeeks] = useState(new Set([nowIdx]));

  function toggleWeek(i) {
    setOpenWeeks(prev => {
      const n = new Set(prev);
      n.has(i) ? n.delete(i) : n.add(i);
      return n;
    });
  }

  function toggleCheck(wi, j) {
    const key = `${wi}-${j}`;
    const next = { ...doc, kinetix: { ...doc.kinetix, checks: { ...checks, [key]: !checks[key] } } };
    commit(next);
  }

  // Group weeks by phase
  const phases = [];
  let curPh = -1;
  W.forEach((w, i) => {
    if (w.ph !== curPh) {
      phases.push({ ph: w.ph, weeks: [], startIdx: i });
      curPh = w.ph;
    }
    phases[phases.length - 1].weeks.push({ w, i });
  });

  return (
    <div>
      {phases.map(({ ph, weeks, startIdx }) => (
        <div key={`${ph}-${startIdx}`}>
          <div className="plan-phase-header">
            <div className="ph-dot" style={{ background: PH_COLORS[ph] }} />
            <div className="ph-name">{PH[ph].n}</div>
            <div className="ph-meta">{PH[ph].d}</div>
          </div>

          {weeks.map(({ w, i }) => {
            const isNow = i === nowIdx;
            const isRace = RACE_INDICES.includes(i);
            const ring = ringData(checks, i, w.mods);
            const isOpen = openWeeks.has(i);

            return (
              <div
                key={i}
                className={`week-card ${isNow ? 'current' : ''} ${isOpen ? 'open' : ''}`}
              >
                <div className="week-card-header" onClick={() => toggleWeek(i)}>
                  <span className="wk-num">W{String(i + 1).padStart(2, '0')}</span>
                  <span className="wk-date">
                    {fmtD(w.d)}
                    {isNow && <span className="wk-this">← this week</span>}
                    {isRace && <span style={{ color: 'var(--race)', marginLeft: 6, fontSize: '0.7rem' }}>🏁 Race</span>}
                  </span>
                  <span className="wk-km">{w.km[0]}–{w.km[1]} km</span>
                  <span className="wk-ring">
                    <CompRing pct={ring.pct} />
                  </span>
                </div>

                <div className="week-card-body">
                  {w.mods.map((mod, j) => {
                    const key = `${i}-${j}`;
                    const done = !!checks[key];
                    const [tagCls, tagLabel] = (typeof mod.t === 'string' && ['q','l','e','s','g','w','b','p','t','r'].includes(mod.t))
                      ? [`t-${mod.t}`, { q:'Quality', l:'Long', e:'Easy', s:'Strides', g:'Strength', w:'Swim', b:'Boulder', p:'Steps', t:'Key', r:'Recover' }[mod.t]]
                      : ['t-e', ''];

                    return (
                      <div key={j} className={`mod-row ${done ? 'done' : ''}`}>
                        <input
                          type="checkbox" checked={done}
                          onChange={() => toggleCheck(i, j)}
                        />
                        {tagLabel && <span className={`mod-tag ${tagCls}`}>{tagLabel}</span>}
                        <div className="mod-text-wrap">
                          <div className="mod-text">
                            {token(mod.tx, bm, heat)}
                          </div>
                          {mod.sub && (
                            <div className="mod-sub">
                              {token(mod.sub, bm, heat)}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}

                  {w.note && (
                    <div className="wk-note">{w.note}</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}
