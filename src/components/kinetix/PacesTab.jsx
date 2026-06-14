// src/components/kinetix/PacesTab.jsx
import { useState } from 'react';
import { DEFAULT_BM } from '../../lib/kinetix.data.js';
import { paces, fmtP, fmtT, predict, parseTimeStr } from '../../lib/kinetix.logic.js';

const RACE_DISTS = [
  { label: '5 km',        km: 5       },
  { label: '10 km',       km: 10      },
  { label: 'Half (21k)',  km: 21.0975 },
  { label: 'Marathon',    km: 42.195  },
];

const GOAL_ANCHORS = [
  { label: 'sub-4:00 marathon', mp: 5.668, pace: '5:41/km' },
  { label: 'sub-3:45 marathon', mp: 5.317, pace: '5:19/km' },
  { label: 'sub-50 10 km',      mp: null,  dist: 10, target: 50 * 60 },
  { label: 'sub-47 10 km',      mp: null,  dist: 10, target: 47 * 60 },
];

export default function PacesTab({ doc, commit }) {
  const bm = doc.kinetix.bm || DEFAULT_BM;
  const heat = doc.kinetix.heat;

  const [distInput, setDistInput] = useState(bm.d.toString());
  const [timeInput, setTimeInput] = useState(fmtT(bm.t));
  const [labelInput, setLabelInput] = useState(bm.label);
  const [hrv, setHrv] = useState('');
  const [rhr, setRhr] = useState('');

  const p = paces(bm);

  function applyBm() {
    const d = parseFloat(distInput);
    const t = parseTimeStr(timeInput);
    if (isNaN(d) || d <= 0 || isNaN(t) || t <= 0) return;
    const next = { ...doc, kinetix: { ...doc.kinetix, bm: { d, t, label: labelInput || bm.label } } };
    commit(next);
  }

  function toggleHeat() {
    const next = { ...doc, kinetix: { ...doc.kinetix, heat: !heat } };
    commit(next);
  }

  function resetBm() {
    const next = { ...doc, kinetix: { ...doc.kinetix, bm: { ...DEFAULT_BM } } };
    commit(next);
    setDistInput(DEFAULT_BM.d.toString());
    setTimeInput(fmtT(DEFAULT_BM.t));
    setLabelInput(DEFAULT_BM.label);
  }

  const paceCards = [
    {
      cls: 'ez',   label: 'Easy / Z2',
      value: fmtP(p.ezLo, true, heat) + '–' + fmtP(p.ezHi, true, heat),
      sub: 'HR <145 · conversational · deficit running ok · every easy run lives here'
    },
    {
      cls: 'mp',   label: 'Marathon Pace (GMP)',
      value: fmtP(p.mp, true, heat),
      sub: 'Nov 8 goal: sub-4 = ' + fmtP(p.mp, false, false) + ' · Jun 2027 goal: sub-3:45 = ' + fmtP(p.mp * 0.9375, false, false)
    },
    {
      cls: 'thr',  label: 'Threshold (LT2)',
      value: fmtP(p.thr, true, heat),
      sub: 'HR 161–172 · comfortably hard · 20–30 min sustainable'
    },
    {
      cls: 'int',  label: 'Interval (VO₂)',
      value: fmtP(p.i, true, heat),
      sub: 'HR 175–184 · 3–5 min reps · sharp but controlled'
    },
    {
      cls: 'rep',  label: 'Repetition',
      value: fmtP(p.rep, true, heat),
      sub: '200–400 m · fully recovered between · neuromuscular speed'
    },
  ];

  return (
    <div>
      {/* Benchmark form */}
      <div className="bm-section">
        <div className="bm-title">Reference Benchmark</div>
        <div className="bm-label">{bm.label}</div>
        <div className="bm-inputs">
          <div className="bm-input-wrap">
            <label>Distance (km)</label>
            <input className="bm-input" value={distInput} onChange={e => setDistInput(e.target.value)} placeholder="21.0975" />
          </div>
          <div className="bm-input-wrap">
            <label>Time (h:mm:ss)</label>
            <input className="bm-input" value={timeInput} onChange={e => setTimeInput(e.target.value)} placeholder="2:23:22" />
          </div>
          <div className="bm-input-wrap" style={{ flex: 2 }}>
            <label>Label</label>
            <input className="bm-input" value={labelInput} onChange={e => setLabelInput(e.target.value)} />
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8, marginTop: 10, flexWrap: 'wrap', alignItems: 'center' }}>
          <button className="btn-accent" onClick={applyBm}>Apply Benchmark</button>
          <button className="btn-secondary" onClick={resetBm}>Reset to Jun 14</button>
          <div className="heat-toggle-wrap">
            <button className={`heat-toggle ${heat ? 'on' : ''}`} onClick={toggleHeat} />
            <span className="heat-label">Heat correction (+20 s/km when on)</span>
          </div>
        </div>
      </div>

      {/* Pace cards */}
      <div className="paces-grid">
        {paceCards.map(pc => (
          <div key={pc.cls} className={`pace-card ${pc.cls}`}>
            <div className="pace-card-label">{pc.label}</div>
            <div className="pace-card-value">{pc.value} /km</div>
            <div className="pace-card-sub">{pc.sub}</div>
          </div>
        ))}

        {/* Heat note if on */}
        {heat && (
          <div className="pace-card" style={{ borderColor: 'var(--race)', background: 'rgba(255,107,74,0.06)' }}>
            <div className="pace-card-label" style={{ color: 'var(--race)' }}>Heat Correction Active</div>
            <div className="pace-card-value" style={{ fontSize: '0.9rem', color: 'var(--race)' }}>+20 s/km</div>
            <div className="pace-card-sub">All zones shifted for hot conditions. Toggle above to restore standard paces.</div>
          </div>
        )}
      </div>

      {/* Riegel predictions */}
      <div className="predict-section" style={{ marginTop: 0 }}>
        <div className="bm-title">Riegel Predictions (from benchmark)</div>
        {RACE_DISTS.map(rd => (
          <div key={rd.label} className="predict-row">
            <span className="predict-dist">{rd.label}</span>
            <span className="predict-time">{fmtT(predict(bm, rd.km))}</span>
          </div>
        ))}
      </div>

      {/* Goal anchors */}
      <div className="goals-card">
        <div className="bm-title">Goal Anchors</div>
        {GOAL_ANCHORS.map(g => {
          const reqT = g.target || null;
          const reqBm = reqT ? (bm.t * Math.pow(bm.d / 10, 1.06)) / Math.pow(10 / bm.d, 0) : null;
          const predicted10 = predict(bm, 10);
          const canDoGoal = g.dist === 10
            ? predicted10 <= g.target
            : bm.t > 0 && predict(bm, 42.195) / 42.195 <= g.mp + 0.05;
          const statusColor = canDoGoal ? 'var(--ez)' : 'var(--warn)';

          return (
            <div key={g.label} className="goal-row">
              <span className="goal-label">{g.label}</span>
              <span style={{ color: statusColor, fontSize: '0.72rem' }}>
                {g.dist === 10
                  ? `Pred 10k: ${fmtT(predict(bm, 10))} ${canDoGoal ? '✓' : '↑ need more speed'}`
                  : g.mp
                    ? `MP ${fmtP(p.mp, false, false)} vs ${fmtP(g.mp, false, false)} req ${canDoGoal ? '✓' : '↑ still building'}`
                    : ''
                }
              </span>
              {g.pace && <span className="goal-pace">{g.pace}</span>}
            </div>
          );
        })}
      </div>

      {/* Daily readiness gate */}
      <div className="readiness-gate">
        <div className="bm-title">Daily Readiness Gate</div>
        <div style={{ fontSize: '0.75rem', color: 'var(--mut)', marginBottom: 10 }}>
          Enter your morning metrics — the gate tells you what to do today.
        </div>
        <div className="gate-inputs">
          <div className="gate-input-wrap">
            <label>HRV (ms)</label>
            <input className="gate-input" type="number" value={hrv} onChange={e => setHrv(e.target.value)} placeholder="e.g. 52" />
          </div>
          <div className="gate-input-wrap">
            <label>Resting HR (bpm)</label>
            <input className="gate-input" type="number" value={rhr} onChange={e => setRhr(e.target.value)} placeholder="e.g. 58" />
          </div>
        </div>
        {(hrv || rhr) && (() => {
          const h = Number(hrv); const r = Number(rhr);
          const valid = (!hrv || !isNaN(h)) && (!rhr || !isNaN(r));
          if (!valid) return <div className="gate-result gate-warn">Enter valid numbers.</div>;
          let level, msg;
          if ((!hrv || isNaN(h)) && (!rhr || isNaN(r))) {
            level = 'warn'; msg = 'Enter at least one value.';
          } else if ((hrv && !isNaN(h) && h < 35) || (rhr && !isNaN(r) && r > 68)) {
            level = 'red'; msg = "REST / WALK / 30 min Z1 only. Push the quality session to tomorrow. Two reds in a row → cut week volume 30%.";
          } else if ((hrv && !isNaN(h) && h < 40) || (rhr && !isNaN(r) && r > 65)) {
            level = 'amber'; msg = "Easy Z2 only today. No intervals, no threshold, no surges. HR cap 145.";
          } else {
            level = 'green'; msg = "Cleared for the hardest remaining module of this week. Execute it.";
          }
          return <div className={`gate-result gate-${level}`}>{msg}</div>;
        })()}
      </div>
    </div>
  );
}
