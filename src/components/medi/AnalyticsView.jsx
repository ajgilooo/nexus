// src/components/medi/AnalyticsView.jsx
import { useState } from 'react';
import {
  globalStats, velocityStats, projectionStats, calcStreak,
  weakZones, weakThreshold, subjectStats, calcReadiness,
  daysToExam
} from '../../lib/medi.logic.js';
import { CATALOG, SUBJECT_ORDER, CAT_TO_SUBJECT } from '../../lib/medi.data.js';
import VelocityChart from './VelocityChart.jsx';

function colorScore(v) {
  return v >= 75 ? 'text-ok' : v >= 60 ? 'text-warn' : 'text-danger';
}
function colorBar(v) {
  return v >= 75 ? '#10B981' : v >= 60 ? '#F59E0B' : '#EF4444';
}

// ── KPI Cards ────────────────────────────────────────────────────────────────
function KPIs({ state, rotationExams }) {
  const g = globalStats(state);
  const { avg7, avg30 } = velocityStats(state);
  const { needed } = projectionStats(state);
  const streak = calcStreak(state);
  const wz = weakZones(state);
  const thr = weakThreshold();
  const readiness = calcReadiness(state, rotationExams);
  const days = daysToExam();
  const activeDays = Object.keys(state.dailyHistory).length;

  const kpis = [
    {
      label: 'Overall Progress', value: g.pct.toFixed(1) + '%',
      sub: `${g.done.toLocaleString()} / ${g.total.toLocaleString()} Qs`,
      cls: g.pct >= 50 ? 'kpi-ok' : g.pct >= 25 ? 'kpi-warn' : 'kpi-danger'
    },
    {
      label: 'PLE Readiness', value: readiness.total.toFixed(0) + ' / 100',
      sub: 'All-12-subject composite',
      cls: readiness.total >= 80 ? 'kpi-ok' : readiness.total >= 60 ? 'kpi-warn' : 'kpi-danger'
    },
    {
      label: '7-Day Pace', value: avg7.toFixed(1) + ' Q/d',
      sub: `Need ${needed === Infinity ? '∞' : needed.toFixed(1)} Q/d`,
      cls: avg7 >= needed * 0.8 ? 'kpi-ok' : avg7 >= needed * 0.5 ? 'kpi-warn' : 'kpi-danger'
    },
    {
      label: 'Weak Zones', value: wz.length,
      sub: `<${thr}%${thr === 85 ? ' (Phase 3)' : ''}`,
      cls: wz.length === 0 ? 'kpi-ok' : wz.length <= 5 ? 'kpi-warn' : 'kpi-danger'
    },
    {
      label: 'Study Streak', value: streak + 'd',
      sub: streak >= 7 ? '🔥 Keep it going' : streak > 0 ? 'Building…' : 'Start today',
      cls: streak >= 7 ? 'kpi-ok' : streak >= 3 ? 'kpi-warn' : 'kpi-danger'
    },
    {
      label: 'Active Days', value: activeDays,
      sub: 'Days with questions logged',
      cls: 'kpi-ok'
    },
    {
      label: 'Needed Pace', value: needed === Infinity ? '∞' : needed.toFixed(1) + ' Q/d',
      sub: 'To finish by exam',
      cls: avg7 >= needed ? 'kpi-ok' : avg7 >= needed * 0.8 ? 'kpi-warn' : 'kpi-danger'
    },
    {
      label: 'Days to Exam', value: days,
      sub: 'Oct 15, 2027',
      cls: days < 90 ? 'kpi-warn' : 'kpi-ok'
    },
  ];

  return (
    <div className="an-grid">
      {kpis.map(k => (
        <div key={k.label} className={`kpi-card ${k.cls}`}>
          <div className="kpi-label">{k.label}</div>
          <div className="kpi-value">{k.value}</div>
          <div className="kpi-sub">{k.sub}</div>
        </div>
      ))}
    </div>
  );
}

// ── Heatmap ──────────────────────────────────────────────────────────────────
function Heatmap({ state }) {
  const [tooltip, setTooltip] = useState(null);
  const target = state.dailyTargetMetrics.questionsPerDayTarget || 40;
  const today = new Date(); today.setHours(0, 0, 0, 0);

  const WEEKS = 52;
  const startDay = new Date(today);
  startDay.setDate(startDay.getDate() - (WEEKS - 1) * 7 - today.getDay());

  const weeks = [];
  for (let w = 0; w < WEEKS; w++) {
    const days = [];
    for (let d = 0; d < 7; d++) {
      const dt = new Date(startDay);
      dt.setDate(dt.getDate() + w * 7 + d);
      const key = dt.getFullYear() + '-' + (dt.getMonth() + 1) + '-' + dt.getDate();
      const isFuture = dt > today;
      const v = state.dailyHistory[key] || 0;
      let level = 0;
      if (!isFuture && v > 0) {
        if (v >= target) level = 4;
        else if (v >= target * 0.75) level = 3;
        else if (v >= target * 0.4) level = 2;
        else level = 1;
      }
      days.push({ key, v, level, isFuture, dt });
    }
    weeks.push(days);
  }

  // Build month label row: show month label at the first column whose Sunday is a new month
  const MONTH_SHORT = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const monthLabels = weeks.map(days => {
    const sun = days[0].dt;
    if (sun.getDate() <= 7) return MONTH_SHORT[sun.getMonth()];
    return '';
  });

  return (
    <div className="heatmap-wrap" style={{ position: 'relative' }}>
      <div className="hm-month-row">
        {monthLabels.map((lbl, i) => (
          <div key={i} className="hm-month-label">{lbl}</div>
        ))}
      </div>
      <div className="heatmap-grid">
        {weeks.map((days, wi) => (
          <div key={wi} className="hm-col" style={{ animationDelay: `${wi * 0.009}s` }}>
            {days.map((day, di) => (
              <div
                key={di}
                className={`hm-cell ${day.isFuture ? 'hm-future' : `hm-${day.level}`}`}
                onMouseEnter={e => setTooltip({
                  x: e.currentTarget.getBoundingClientRect().left,
                  y: e.currentTarget.getBoundingClientRect().top,
                  text: day.dt.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                        + (day.isFuture ? '' : ` · ${day.v} Qs`)
                })}
                onMouseLeave={() => setTooltip(null)}
              />
            ))}
          </div>
        ))}
      </div>
      {tooltip && (
        <div className="hm-tooltip" style={{ top: -36, left: 0, pointerEvents: 'none' }}>
          {tooltip.text}
        </div>
      )}
    </div>
  );
}

// ── Radar ────────────────────────────────────────────────────────────────────
function Radar({ state }) {
  const ss = subjectStats(state);
  const W = 280; const H = 280; const cx = 140; const cy = 140; const R = 90;
  const n = SUBJECT_ORDER.length;

  const vals = SUBJECT_ORDER.map(subj => {
    const s = ss[subj] || { scoreCount: 0, scoreSum: 0, done: 0, total: 1 };
    const avgScore = s.scoreCount ? s.scoreSum / s.scoreCount : 0;
    const completion = s.total ? s.done / s.total * 100 : 0;
    const val = s.scoreCount ? avgScore / 100 : (completion / 1.5) / 100;
    return Math.min(1, val);
  });

  function pt(i, v) {
    const angle = (2 * Math.PI / n) * i - Math.PI / 2;
    return [cx + R * v * Math.cos(angle), cy + R * v * Math.sin(angle)];
  }

  const polyPoints = vals.map((v, i) => pt(i, v).join(',')).join(' ');

  return (
    <div className="radar-wrap">
      <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H}>
        {/* Grid rings */}
        {[0.25, 0.5, 0.75, 1].map(r => {
          const ringPts = SUBJECT_ORDER.map((_, i) => pt(i, r).join(',')).join(' ');
          return <polygon key={r} points={ringPts} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="1" />;
        })}
        {/* Axes */}
        {SUBJECT_ORDER.map((_, i) => {
          const [x, y] = pt(i, 1);
          return <line key={i} x1={cx} y1={cy} x2={x} y2={y} stroke="rgba(255,255,255,0.08)" strokeWidth="1" />;
        })}
        {/* Data polygon */}
        <polygon points={polyPoints} fill="rgba(16,185,129,0.18)" stroke="#10B981" strokeWidth="1.5" />
        {/* Dots */}
        {vals.map((v, i) => {
          const [x, y] = pt(i, v);
          return <circle key={i} cx={x} cy={y} r="3" fill="#10B981" />;
        })}
        {/* Labels */}
        {SUBJECT_ORDER.map((subj, i) => {
          const [x, y] = pt(i, 1.25);
          const s = ss[subj] || { done: 0, total: 1 };
          const pct = s.total ? Math.round(s.done / s.total * 100) : 0;
          const shortLabel = subj.split(' ')[0];
          return (
            <text key={i} x={x} y={y} textAnchor="middle" fill="rgba(255,255,255,0.5)" fontSize="9" dy="4">
              {shortLabel} {pct}%
            </text>
          );
        })}
      </svg>
    </div>
  );
}

// ── Sparklines ───────────────────────────────────────────────────────────────
function Sparklines({ state }) {
  const candidates = CATALOG
    .filter(m => Array.isArray(state.modules[m.id]?.scoreHistory) && state.modules[m.id].scoreHistory.length > 0)
    .map(m => ({ m, s: state.modules[m.id] }))
    .sort((a, b) => (b.s.userPerformanceScore || 0) - (a.s.userPerformanceScore || 0))
    .slice(0, 15);

  if (candidates.length === 0) return <div className="empty-state">No score history yet.</div>;

  return (
    <div className="spark-list">
      {candidates.map(({ m, s }) => {
        const hist = s.scoreHistory;
        const latest = s.userPerformanceScore || 0;
        const cls = latest >= 75 ? 'spark-ok' : latest >= 60 ? 'spark-warn' : 'spark-danger';
        const color = latest >= 75 ? '#10B981' : latest >= 60 ? '#F59E0B' : '#EF4444';

        const points = hist.map((h, i) => {
          const x = 60 * i / Math.max(1, hist.length - 1);
          const y = 20 - (h.score / 100) * 18;
          return `${x},${y}`;
        }).join(' ');

        return (
          <div key={m.id} className="spark-row">
            <span className="spark-id">{m.id}</span>
            <svg className="spark-svg" viewBox="0 0 60 20" height="20" preserveAspectRatio="none">
              <polyline points={points} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span className={`spark-score ${cls}`}>{latest.toFixed(0)}%</span>
          </div>
        );
      })}
    </div>
  );
}

// ── Readiness Ring ───────────────────────────────────────────────────────────
export function ReadinessRing({ state, rotationExams = [], size = 120 }) {
  const r = calcReadiness(state, rotationExams);
  const circ = 2 * Math.PI * 54;
  const color = r.total >= 80 ? '#10B981' : r.total >= 60 ? '#F59E0B' : '#EF4444';

  const simMax = r.hasExams ? 9 : 15;
  const bars = [
    { label: 'Coverage', val: r.coverage, max: 35, color: '#3b82f6' },
    { label: 'Score',    val: r.scoreComponent, max: 30, color: '#10B981' },
    { label: 'Retention',val: r.retention, max: 20, color: '#F59E0B' },
    { label: `Sim (${simMax})`, val: r.simulation, max: simMax, color: '#a78bfa' },
    ...(r.hasExams ? [{ label: 'Rotation (6)', val: r.rotation, max: 6, color: 'var(--accent)' }] : []),
  ];

  return (
    <div className="readiness-ring-wrap">
      <svg viewBox="0 0 120 120" width={size} height={size}>
        <circle cx="60" cy="60" r="54" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="10" />
        <circle cx="60" cy="60" r="54" fill="none" stroke={color} strokeWidth="10"
          strokeDasharray={`${circ * r.total / 100} ${circ}`}
          strokeDashoffset="0" strokeLinecap="round"
          style={{ transform: 'rotate(-90deg)', transformOrigin: '60px 60px' }}
        />
        <text x="60" y="60" textAnchor="middle" dy="5" fill={color} fontSize="16" fontWeight="800" fontFamily="monospace">
          {r.total.toFixed(0)}
        </text>
        <text x="60" y="75" textAnchor="middle" fill="rgba(255,255,255,0.3)" fontSize="8">/ 100</text>
      </svg>

      <div className="ring-breakdown">
        {bars.map(rb => (
          <div key={rb.label} className="rb-row">
            <span className="rb-label">{rb.label}</span>
            <div className="rb-bar-wrap">
              <div className="rb-bar-fill" style={{ width: (rb.val / rb.max * 100) + '%', background: rb.color }} />
            </div>
            <span className="rb-val">{rb.val.toFixed(1)}</span>
          </div>
        ))}
        <div className="rb-decay">Decay penalties: {r.decayCount} module(s) &gt;30 days stale</div>
      </div>
    </div>
  );
}

// ── Analytics View ───────────────────────────────────────────────────────────
export default function AnalyticsView({ doc }) {
  const state = doc.medi.state;
  const rotationExams = doc.medi.rotationExams || [];
  const { avg7, avg30 } = velocityStats(state);
  const { needed, projDate } = projectionStats(state);
  const g = globalStats(state);
  const wz = weakZones(state);
  const thr = weakThreshold();

  // Category breakdown
  const cats = [...new Set(CATALOG.map(m => m.category))];
  const catData = cats.map(cat => {
    let total = 0, done = 0, sw = 0, sc = 0;
    for (const m of CATALOG) {
      if (m.category !== cat) continue;
      total += m.totalQuestions;
      const s = state.modules[m.id];
      done += Math.min(s.completedQuestions || 0, m.totalQuestions);
      if (typeof s.userPerformanceScore === 'number') { sw += s.userPerformanceScore; sc++; }
    }
    const pct = total ? done / total * 100 : 0;
    const avgScore = sc ? sw / sc : null;
    const shortLabel = cat.replace('NBME - ', '').replace('Comp. ', '');
    return { cat, shortLabel, pct, avgScore };
  }).sort((a, b) => b.pct - a.pct);

  const needColorCls = avg7 >= needed * 0.8 ? 'text-ok' : 'text-warn';

  return (
    <div className="analytics-view">
      {/* ── Left column ── */}
      <div className="an-col-left">
        <KPIs state={state} rotationExams={rotationExams} />
        <VelocityChart state={state} />
        <div className="an-panel">
          <div className="an-panel-title">52-Week Study Heatmap</div>
          <Heatmap state={state} />
        </div>
        <div className="an-panel">
          <div className="an-panel-title">Pace Analysis</div>
          <div className="pace-stat-row">
            <span className="pace-stat-label">Needed Q/day</span>
            <span className={`pace-stat-value ${needColorCls}`}>{needed === Infinity ? '∞' : needed.toFixed(1)}</span>
          </div>
          <div className="pace-stat-row">
            <span className="pace-stat-label">7-day avg</span>
            <span className="pace-stat-value">{avg7.toFixed(1)} Q/d</span>
          </div>
          <div className="mini-bar-wrap" style={{ margin: '4px 0 10px' }}>
            <div className="mini-bar-fill" style={{
              width: Math.min(100, needed > 0 ? avg7 / needed * 100 : 0) + '%',
              background: avg7 >= needed ? '#10B981' : '#F59E0B'
            }} />
          </div>
          <div className="pace-stat-row">
            <span className="pace-stat-label">30-day avg</span>
            <span className="pace-stat-value">{avg30.toFixed(1)} Q/d</span>
          </div>
          <div className="mini-bar-wrap" style={{ margin: '4px 0 10px' }}>
            <div className="mini-bar-fill" style={{
              width: Math.min(100, needed > 0 ? avg30 / needed * 100 : 0) + '%',
              background: '#0f7a5a'
            }} />
          </div>
          <div className="pace-stat-row">
            <span className="pace-stat-label">Projected finish</span>
            <span className={`pace-stat-value ${projDate && projDate < new Date('2027-10-15') ? 'text-ok' : 'text-danger'}`}>
              {projDate ? projDate.toLocaleDateString() + (projDate < new Date('2027-10-15') ? ' ✓' : ' ⚠ LATE') : '∞'}
            </span>
          </div>
          <div className="pace-stat-row">
            <span className="pace-stat-label">Remaining</span>
            <span className="pace-stat-value">{(g.total - g.done).toLocaleString()} Qs</span>
          </div>
        </div>
      </div>

      {/* ── Right column ── */}
      <div className="an-col-right">
        <div className="an-panel">
          <div className="an-panel-title">Subject Radar</div>
          <Radar state={state} />
        </div>
        <div className="an-panel">
          <div className="an-panel-title">
            Weak Zones
            <span style={{ color: '#F59E0B', marginLeft: 6, fontSize: '0.68rem' }}>
              &lt;{thr}%{thr === 85 ? ' — Phase 3' : ''}
            </span>
          </div>
          {wz.length === 0
            ? <div className="empty-state">No weak zones below {thr}%.</div>
            : wz.slice(0, 10).map(m => {
                const s = state.modules[m.id];
                const pct = m.totalQuestions ? s.completedQuestions / m.totalQuestions * 100 : 0;
                return (
                  <div key={m.id} className="wz-row">
                    <span className="wz-name">{m.name}</span>
                    <span className="wz-pct">{pct.toFixed(0)}% done</span>
                    <span className={`wz-score ${colorScore(s.userPerformanceScore || 0)}`}>
                      {(s.userPerformanceScore || 0).toFixed(0)}%
                    </span>
                  </div>
                );
              })}
        </div>
        <div className="an-panel">
          <div className="an-panel-title">Score Sparklines</div>
          <Sparklines state={state} />
        </div>
        <div className="an-panel">
          <div className="an-panel-title">Category Breakdown</div>
          {catData.map(cd => (
            <div key={cd.cat} className="cat-row">
              <span className="cat-name">{cd.shortLabel}</span>
              <div className="cat-bar-wrap">
                <div className="cat-bar-fill" style={{ width: cd.pct + '%', background: colorBar(cd.pct) }} />
              </div>
              <span className="cat-pct">{cd.pct.toFixed(0)}%</span>
              <span className={`cat-score ${cd.avgScore !== null ? colorScore(cd.avgScore) : 'text-muted'}`}>
                {cd.avgScore !== null ? cd.avgScore.toFixed(0) + '%' : '—'}
              </span>
            </div>
          ))}
        </div>
        <div className="an-panel">
          <div className="an-panel-title">PLE Readiness</div>
          <ReadinessRing state={state} rotationExams={rotationExams} />
        </div>
      </div>
    </div>
  );
}
