// src/components/medi/TrackerView.jsx
import { useState, useRef } from 'react';
import { daysToExam, activePhase, recommendedDailyTarget, globalStats, freshState } from '../../lib/medi.logic.js';
import { CATALOG, SYSTEMS, PIPELINE, CATEGORIES, BLOCK_PROTOCOL } from '../../lib/medi.data.js';
import { blockForDate, dayDiff, padDate } from './schedule/scheduleHelpers.js';
import { Store } from '../../lib/storage.js';
import QLogModal from './QLogModal.jsx';
import SelfAssessModal from './SelfAssessModal.jsx';

// todayKey inline (avoids import just for this)
const todayKey = () => { const d = new Date(); return d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate(); };

// ── TODAY'S STUDY BRIEF ───────────────────────────────────────────────────────
const DUTY_CFG = {
  pre:  { label:'Pre-Duty',  fresh:45, resurf:0,  short:0,  col:'#60A5FA' },
  duty: { label:'On Duty',   fresh:0,  resurf:0,  short:25, col:'#F87171' },
  post: { label:'Post-Duty', fresh:50, resurf:30, short:0,  col:'#34D399' },
  off:  { label:'Off',       fresh:20, resurf:10, short:0,  col:'#94A3B8' },
};
const PHASE_LABEL = { pre:'Pre-Assessment', bank:'QBank Daily', post:'Post-Assessment' };

function blockPhase(block, todayStr) {
  const dayIn  = dayDiff(block.start, todayStr);
  const len    = dayDiff(block.start, block.end) + 1;
  if (dayIn <= 1)        return 'pre';
  if (dayIn >= len - 2)  return 'post';
  return 'bank';
}

function TodayStudyBrief({ state, onSA }) {
  const now      = new Date();
  const todayStr = padDate(now.getFullYear(), now.getMonth() + 1, now.getDate());
  const block    = blockForDate(now);
  const mode     = state.dutyRoster?.[todayStr] || null;
  const duty     = mode ? DUTY_CFG[mode] : null;

  let phase = null, resource = null;
  if (block) {
    const proto = BLOCK_PROTOCOL[block.label];
    phase    = blockPhase(block, todayStr);
    resource = proto?.[phase] ?? proto?.bank ?? null;
  }

  const total = duty ? duty.fresh + duty.resurf + duty.short : null;
  const dayIn = block ? dayDiff(block.start, todayStr) + 1 : null;
  const len   = block ? dayDiff(block.start, block.end) + 1 : null;

  return (
    <div className="tsb-card">
      <div className="tsb-header">
        <span className="tsb-title">Today's Brief</span>
        <span className="tsb-date">{now.toLocaleDateString('en-US', { weekday:'short', month:'short', day:'numeric' })}</span>
      </div>

      {block ? (
        <>
          <div className="tsb-block-row">
            <span className="tsb-block-label">{block.label}</span>
            <span className="tsb-block-sub">Day {dayIn}/{len} · {PHASE_LABEL[phase]}</span>
          </div>

          {resource && (
            <div className="tsb-resource">
              <div className="tsb-res-phase">{PHASE_LABEL[phase]}</div>
              <div className="tsb-res-text">{resource}</div>
            </div>
          )}

          {duty ? (
            <div className="tsb-duty" style={{ '--dc': duty.col }}>
              <span className="tsb-duty-badge">{duty.label}</span>
              <div className="tsb-q-chips">
                {duty.fresh  > 0 && <span className="tsb-chip">{duty.fresh} fresh</span>}
                {duty.resurf > 0 && <span className="tsb-chip">{duty.resurf} resurface</span>}
                {duty.short  > 0 && <span className="tsb-chip">{duty.short} short sets</span>}
                <span className="tsb-chip tsb-chip-total">{total} Qs</span>
              </div>
            </div>
          ) : (
            <div className="tsb-no-duty">
              Duty mode not set — go to Schedule → Duty Roster and paint today.
            </div>
          )}

          {block.basicSubject && (
            <div className="tsb-basic-sci">Basic sci: {block.basicSubject}</div>
          )}
        </>
      ) : (
        <div className="tsb-no-block">No active rotation today.</div>
      )}

      <button className="tsb-sa-btn" onClick={onSA}>
        → Self-Assessment Picker
      </button>
    </div>
  );
}

// ── LEFT PANE ────────────────────────────────────────────────────────────────
function LeftStats({ doc, commit, onOpenLog, onOpenSA }) {
  const state = doc.medi.state;
  const g = globalStats(state);
  const days = daysToExam();
  const phase = activePhase();
  const target = recommendedDailyTarget();
  const daily = state.dailyTargetMetrics;

  const masteryStr = g.mastery === null ? '— No scores yet' : g.mastery.toFixed(1) + '% Avg';
  const masteryColor = g.mastery === null ? '' : g.mastery >= 70 ? 'text-ok' : g.mastery >= 50 ? 'text-warn' : 'text-danger';

  function handleReset() {
    if (!window.confirm('Reset ALL progress, scores, pipeline milestones, syllabus topics, and ward cases? This cannot be undone.')) return;
    commit({ ...doc, medi: { state: freshState(), sylState: { topics: [], checked: {} }, caseLog: [] } });
  }

  const importRef = useRef();
  function handleImport(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      const result = Store.importJSON(ev.target.result);
      if (!result) { alert('Import failed — not a valid NEXUS backup.'); return; }
      commit(result);
    };
    reader.readAsText(file);
    e.target.value = '';
  }

  function handleExport() {
    const str = Store.exportJSON(doc);
    const d = new Date().toISOString().slice(0, 10);
    const a = document.createElement('a');
    a.href = 'data:application/json;charset=utf-8,' + encodeURIComponent(str);
    a.download = `nexus_backup_${d}.json`;
    a.click();
  }

  return (
    <div>
      <TodayStudyBrief state={doc.medi.state} onSA={onOpenSA} />

      <div className="stat-block">
        <div className="stat-label">Days to PLE</div>
        <div className="stat-value days-value">{days}</div>
        <div className="stat-sub">to PLE • Oct 15, 2027</div>
      </div>

      <div className="phase-box">
        <div className="phase-num">{phase.num}</div>
        <div className="phase-name">{phase.name}</div>
        <div className="phase-desc">{phase.desc}</div>
      </div>

      <div className="stat-block">
        <div className="stat-label">Total Questions</div>
        <div className="stat-value">{g.total.toLocaleString()}</div>
      </div>

      <div className="stat-block">
        <div className="stat-label">Completed</div>
        <div className="stat-value">
          {g.done.toLocaleString()}
          <span style={{ fontSize: '0.85rem', color: 'var(--muted)', marginLeft: 4 }}>({g.pct.toFixed(1)}%)</span>
        </div>
        <div className="progress-bar-wrap">
          <div className="progress-bar-fill" style={{ width: g.pct + '%' }} />
        </div>
      </div>

      <div className="stat-block">
        <div className="stat-label">Mastery (Avg Score)</div>
        <div className={`stat-value ${masteryColor}`}>{masteryStr}</div>
        <div className="stat-sub">Question-weighted average</div>
      </div>

      <div className="stat-block">
        <div className="stat-label">Daily Target</div>
        <div className="daily-target-display">
          <span className="daily-count">{daily.currentDayCompletedCount}</span>
          <span className="daily-sep">/</span>
          <span className="daily-total">{target} Qs today</span>
        </div>
      </div>

      <div className="stat-block">
        <div className="stat-label">Pinned Set</div>
        <div style={{ fontSize: '0.82rem', color: 'var(--text)' }}>uWorld - USMLE Step 1</div>
      </div>

      <hr className="left-divider" />

      <div className="btn-row">
        <button className="btn-secondary" onClick={handleExport}>Export</button>
        <button className="btn-secondary" onClick={() => importRef.current.click()}>Import</button>
        <input ref={importRef} type="file" accept=".json" style={{ display: 'none' }} onChange={handleImport} />
        <button className="btn-accent" onClick={onOpenLog}>Log Questions</button>
        <button className="btn-secondary btn-danger" onClick={handleReset}>Reset All</button>
      </div>
    </div>
  );
}

// ── MIDDLE PANE — Pipeline ───────────────────────────────────────────────────
function PipelinePane({ doc, commit }) {
  const state = doc.medi.state;
  const sys = state.userProfile.activeSystem;
  const pipelineSteps = state.pipeline[sys] || [false, false, false, false, false];

  function handleToggle(idx) {
    const newPipelineSteps = [...pipelineSteps];
    newPipelineSteps[idx] = !pipelineSteps[idx];
    commit({
      ...doc,
      medi: {
        ...doc.medi,
        state: {
          ...state,
          pipeline: { ...state.pipeline, [sys]: newPipelineSteps }
        }
      }
    });
  }

  function handleSysChange(e) {
    commit({
      ...doc,
      medi: {
        ...doc.medi,
        state: { ...state, userProfile: { ...state.userProfile, activeSystem: e.target.value } }
      }
    });
  }

  return (
    <div>
      <div className="pipeline-header">
        <div className="pipeline-sys-label">Active System</div>
        <select className="sys-select" value={sys} onChange={handleSysChange}>
          {SYSTEMS.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      <div style={{ fontSize: '0.72rem', color: 'var(--muted)', marginBottom: '12px' }}>
        5-step source pipeline
      </div>

      <div className="pipeline-rail">
        {PIPELINE.map((step, idx) => {
          const done = pipelineSteps[idx];
          const hasNext = idx < PIPELINE.length - 1;
          return (
            <div key={idx} style={{ position: 'relative' }}>
              <div className="pipeline-item" onClick={() => handleToggle(idx)}>
                <div className={`pipe-n ${done ? 'done' : ''}`}>
                  {done ? '✓' : idx + 1}
                </div>
                <div className="pipe-body">
                  <div className={`pipe-name ${done ? 'done' : ''}`}>{step.n}</div>
                  <div className="pipe-text">{step.t}</div>
                  <div className="pipe-src">{step.src}</div>
                </div>
              </div>
              {hasNext && (
                <div className={`pipe-connector ${done && pipelineSteps[idx + 1] ? 'done' : ''}`} />
              )}
            </div>
          );
        })}
      </div>

      <div className="pipeline-note">
        Anchor → Contextualize → Localize → Practice → Validate. Each step locks before the next opens. The pipeline resets per system; completing all 5 = system mastered.
      </div>
    </div>
  );
}

// ── RIGHT PANE — Catalog ─────────────────────────────────────────────────────
function CatalogPane({ doc, commit }) {
  const state = doc.medi.state;
  const [search, setSearch] = useState('');
  const [cat, setCat] = useState('All Questions');
  const [filter, setFilter] = useState('all');

  const phase = activePhase();
  const thr = phase.num === 'PHASE 3' ? 85 : 70;

  const decayBadge = CATALOG.filter(m => {
    const s = state.modules[m.id];
    if (!s.lastUpdated || typeof s.userPerformanceScore !== 'number') return false;
    return ((Date.now() - new Date(s.lastUpdated).getTime()) / 86400000) > 30 && s.userPerformanceScore < 85;
  }).length;

  const weakBadge = CATALOG.filter(m => {
    const s = state.modules[m.id];
    return typeof s.userPerformanceScore === 'number' && s.userPerformanceScore < thr && s.status !== 'Unstarted';
  }).length;

  const filtered = CATALOG.filter(m => {
    const s = state.modules[m.id];
    const matchCat = cat === 'All Questions' || m.category === cat;
    const q = search.toLowerCase();
    const matchQ = !q || m.name.toLowerCase().includes(q) || m.id.toLowerCase().includes(q) || m.category.toLowerCase().includes(q);
    if (!matchCat || !matchQ) return false;
    if (filter === 'decay') {
      if (!s.lastUpdated || typeof s.userPerformanceScore !== 'number') return false;
      return ((Date.now() - new Date(s.lastUpdated).getTime()) / 86400000) > 30 && s.userPerformanceScore < 85;
    }
    if (filter === 'weak') return typeof s.userPerformanceScore === 'number' && s.userPerformanceScore < thr && s.status !== 'Unstarted';
    if (filter === 'inprogress') return s.status === 'In Progress';
    return true;
  });

  const displayed = filter === 'weak'
    ? [...filtered].sort((a, b) => state.modules[a.id].userPerformanceScore - state.modules[b.id].userPerformanceScore)
    : filtered;

  // Proper immutable module update
  function updateModule(id, fn) {
    const oldMod = state.modules[id];
    const newMod = { ...oldMod };
    fn(newMod);
    commit({
      ...doc,
      medi: {
        ...doc.medi,
        state: {
          ...state,
          modules: { ...state.modules, [id]: newMod },
          dailyTargetMetrics: { ...state.dailyTargetMetrics },
          dailyHistory: { ...state.dailyHistory }
        }
      }
    });
  }

  function handleIncrement(m, amt) {
    const s = state.modules[m.id];
    const newQ = Math.max(0, Math.min(m.totalQuestions, s.completedQuestions + amt));
    const delta = newQ - s.completedQuestions;
    const today = todayKey();
    const newDTM = { ...state.dailyTargetMetrics };
    const newDH = { ...state.dailyHistory };
    if (delta > 0) {
      if (newDTM.dayKey !== today) { newDTM.currentDayCompletedCount = 0; newDTM.dayKey = today; }
      newDTM.currentDayCompletedCount += delta;
      newDH[today] = (newDH[today] || 0) + delta;
    }
    let newStatus = s.status;
    if (newQ >= m.totalQuestions) newStatus = 'Completed';
    else if (newStatus === 'Paused') { /* keep */ }
    else if (newQ > 0) newStatus = 'In Progress';
    else newStatus = 'Unstarted';
    commit({
      ...doc,
      medi: {
        ...doc.medi,
        state: {
          ...state,
          dailyTargetMetrics: newDTM,
          dailyHistory: newDH,
          modules: {
            ...state.modules,
            [m.id]: { ...s, completedQuestions: newQ, status: newStatus, lastUpdated: new Date().toISOString() }
          }
        }
      }
    });
  }

  function handlePause(m) {
    const s = state.modules[m.id];
    if (s.status === 'Completed') return;
    const newStatus = s.status === 'Paused' ? (s.completedQuestions > 0 ? 'In Progress' : 'Unstarted') : 'Paused';
    commit({
      ...doc,
      medi: { ...doc.medi, state: { ...state, modules: { ...state.modules, [m.id]: { ...s, status: newStatus, lastUpdated: new Date().toISOString() } } } }
    });
  }

  function handleScore(m, val) {
    const s = state.modules[m.id];
    if (val === '') {
      commit({ ...doc, medi: { ...doc.medi, state: { ...state, modules: { ...state.modules, [m.id]: { ...s, userPerformanceScore: null, lastUpdated: new Date().toISOString() } } } } });
      return;
    }
    const n = Math.max(0, Math.min(100, Number(val)));
    if (isNaN(n)) return;
    const today = todayKey();
    const prev = s.userPerformanceScore;
    const newHistory = prev !== n
      ? [...(s.scoreHistory || []), { score: n, date: today }].slice(-20)
      : s.scoreHistory || [];
    commit({
      ...doc,
      medi: { ...doc.medi, state: { ...state, modules: { ...state.modules, [m.id]: { ...s, userPerformanceScore: n, scoreHistory: newHistory, lastUpdated: new Date().toISOString() } } } }
    });
  }

  return (
    <div>
      <div className="catalog-filters">
        <div className="filter-row">
          <input className="search-input" type="text" placeholder="Search modules…" value={search} onChange={e => setSearch(e.target.value)} />
          <select className="cat-select" value={cat} onChange={e => setCat(e.target.value)}>
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div className="filter-tabs">
          <button className={`ftab ${filter === 'all' ? 'active' : ''}`} onClick={() => setFilter('all')}>All</button>
          <button className={`ftab ${filter === 'decay' ? 'active' : ''}`} onClick={() => setFilter('decay')}>
            ⟲ Due {decayBadge > 0 && <span className="badge">{decayBadge}</span>}
          </button>
          <button className={`ftab ${filter === 'weak' ? 'active' : ''}`} onClick={() => setFilter('weak')}>
            Weak {weakBadge > 0 && <span className="badge">{weakBadge}</span>}
          </button>
          <button className={`ftab ${filter === 'inprogress' ? 'active' : ''}`} onClick={() => setFilter('inprogress')}>In Progress</button>
        </div>
        <div className="catalog-meta">
          {displayed.length} of {CATALOG.length} modules
          {filter === 'weak' && ` · <${thr}% (${phase.num === 'PHASE 3' ? 'Phase 3' : 'standard'})`}
        </div>
      </div>

      {displayed.map(m => {
        const s = state.modules[m.id];
        const pct = m.totalQuestions ? s.completedQuestions / m.totalQuestions * 100 : 0;
        const decayed = s.lastUpdated && typeof s.userPerformanceScore === 'number'
          && ((Date.now() - new Date(s.lastUpdated).getTime()) / 86400000) > 30
          && s.userPerformanceScore < 85;
        const statusCls = { 'Unstarted': 'st-unstarted', 'In Progress': 'st-inprogress', 'Completed': 'st-completed', 'Paused': 'st-paused' }[s.status] || 'st-unstarted';

        return (
          <div key={m.id} className="module-card">
            <div className="mc-header">
              <div className="mc-name">{m.name}</div>
              <div className="mc-tags">
                <span className={`status-tag ${statusCls}`}>{s.status}</span>
                {decayed && <span className="decay-tag">⟲ Review</span>}
              </div>
            </div>
            <div className="mc-sub">{m.id} · {m.difficulty} · {m.estimatedDuration}</div>
            <div className="mc-progress-row">
              <span className="mc-q-count">Questions: {s.completedQuestions.toLocaleString()} / {m.totalQuestions.toLocaleString()}</span>
              <span className="mc-pct">{pct.toFixed(1)}%</span>
            </div>
            <div className="progress-bar-wrap">
              <div className="progress-bar-fill" style={{ width: Math.min(100, pct) + '%' }} />
            </div>
            <div className="mc-controls">
              {[-1, -10, 1, 10, 40].map(amt => (
                <button key={amt} className="inc-btn" onClick={() => handleIncrement(m, amt)}>
                  {amt > 0 ? '+' : ''}{amt}
                </button>
              ))}
              <button className={`pause-btn ${s.status === 'Paused' ? 'paused' : ''}`} onClick={() => handlePause(m)}>
                {s.status === 'Paused' ? 'Resume' : 'Pause'}
              </button>
              <div className="score-input-wrap">
                <span className="score-label">Score</span>
                <input
                  className="score-input" type="number" min="0" max="100" inputMode="numeric"
                  value={s.userPerformanceScore ?? ''}
                  placeholder="—"
                  onChange={e => handleScore(m, e.target.value)}
                />
                <span className="score-label">%</span>
              </div>
            </div>
          </div>
        );
      })}

      {displayed.length === 0 && <div className="empty-state">No modules match these filters.</div>}
    </div>
  );
}

// ── TRACKER VIEW ─────────────────────────────────────────────────────────────
export default function TrackerView({ doc, commit }) {
  const [showLog, setShowLog] = useState(false);
  const [showSA,  setShowSA]  = useState(false);
  return (
    <div className="tracker-grid">
      <div className="tracker-pane pane-left">
        <LeftStats doc={doc} commit={commit} onOpenLog={() => setShowLog(true)} onOpenSA={() => setShowSA(true)} />
      </div>
      <div className="tracker-pane pane-middle">
        <PipelinePane doc={doc} commit={commit} />
      </div>
      <div className="tracker-pane pane-right">
        <CatalogPane doc={doc} commit={commit} />
      </div>
      {showLog && <QLogModal doc={doc} commit={commit} onClose={() => setShowLog(false)} />}
      {showSA  && <SelfAssessModal doc={doc} commit={commit} onClose={() => setShowSA(false)} />}
    </div>
  );
}
