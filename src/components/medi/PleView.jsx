// src/components/medi/PleView.jsx
import { useState } from 'react';
import { PLE_WEIGHTS, SUBJ_MODULE_IDS } from '../../lib/medi.data.js';
import {
  getSubjectCoverage, gapScore, calcReadiness, parseSyllabus
} from '../../lib/medi.logic.js';
import { ReadinessRing } from './AnalyticsView.jsx';

const PLE_SUBJECTS = PLE_WEIGHTS.map(p => p.subject);
const CASE_SUBJECTS = [
  "Internal Medicine","Surgery","Obstetrics & Gynecology","Pediatrics & Nutrition",
  "Preventive Med & Public Health","Pathology","Microbiology & Parasitology",
  "Pharmacology & Therapeutics","Ophthalmology","ENT","Legal Medicine","Other"
];
const SETTINGS_BY_SYSTEM = ['Ward', 'ER', 'OPD', 'ICU', 'OR', 'Clinic'];
const DAY_LABEL = { 1: 'Day 1 · Basic Sciences', 2: 'Day 2 · Basic Sciences', 3: 'Day 3 · Clinical Sciences', 4: 'Day 4 · Clinical Sciences' };

// ── GAP ANALYSIS ──────────────────────────────────────────────────────────────
function GapAnalysis({ state }) {
  const rows = PLE_WEIGHTS.map(p => {
    const cov = getSubjectCoverage(state, p.subject);
    const coverage = cov ? cov.coverage : 0;
    const avgScore = cov ? cov.avgScore : null;
    const gap = gapScore(p.weight, coverage, avgScore);
    const status = gap > 60 ? 'critical' : gap > 30 ? 'watch' : 'ok';
    return { ...p, coverage, avgScore, gap, status };
  });

  // Group by exam day (1–4), preserving the official subject order within each day
  const byDay = {};
  rows.forEach(r => { (byDay[r.day] = byDay[r.day] || []).push(r); });

  return (
    <div>
      <div style={{ marginBottom: 14, fontSize: '0.78rem', color: 'var(--muted)', lineHeight: 1.5 }}>
        All 12 PLE subjects are equally weighted (each ≈ 8.3% of the exam). Gap score = shortfall after coverage × score quality. Red = critical, fix first.
      </div>

      {[1, 2, 3, 4].map(day => (
        <div key={day} style={{ marginBottom: 18 }}>
          <div className="syl-group-header" style={{ marginBottom: 8 }}>
            <span>{DAY_LABEL[day]}</span>
          </div>
          {/* Header */}
          <div className="gap-row" style={{ fontWeight: 700, fontSize: '0.66rem', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.07em', paddingBottom: 6 }}>
            <span>Subject</span>
            <span>Coverage %</span>
            <span>Avg Score %</span>
            <span>Gap</span>
          </div>
          {(byDay[day] || []).map(r => (
            <div key={r.subject} className="gap-row">
              <span className={`gap-subj ${r.status}`}>{r.subject}</span>
              <div className="gap-bar-cell">
                <div className="gap-bar-outer">
                  <div className="gap-bar-inner" style={{ width: r.coverage + '%', background: r.coverage >= 70 ? '#10B981' : r.coverage >= 40 ? '#F59E0B' : '#EF4444' }} />
                </div>
                <span className="gap-bar-label">{r.coverage.toFixed(0)}%</span>
              </div>
              <div className="gap-bar-cell">
                {r.avgScore !== null ? (
                  <>
                    <div className="gap-bar-outer">
                      <div className="gap-bar-inner" style={{ width: r.avgScore + '%', background: r.avgScore >= 75 ? '#10B981' : r.avgScore >= 60 ? '#F59E0B' : '#EF4444' }} />
                    </div>
                    <span className="gap-bar-label">{r.avgScore.toFixed(0)}%</span>
                  </>
                ) : <span style={{ fontSize: '0.72rem', color: 'var(--muted)' }}>—</span>}
              </div>
              <div className="gap-score-cell" style={{ color: r.gap > 60 ? '#EF4444' : r.gap > 30 ? '#F59E0B' : '#10B981' }}>
                {r.gap.toFixed(0)}
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

// ── PLE READINESS ─────────────────────────────────────────────────────────────
function Top5Readiness({ state }) {
  const r = calcReadiness(state);

  const legend = [
    { range: '90–100', text: 'Peak — maintain weekly touch for each subject, shift time to weak gaps' },
    { range: '75–89',  text: 'Ready — exam is within reach; address the 1–2 remaining weak subjects' },
    { range: '60–74',  text: 'Building — 3–4 months of consistent work needed; prioritize by gap score' },
    { range: '40–59',  text: 'Early — coverage is the constraint; focus on completing high-weight modules' },
    { range: '0–39',   text: 'Foundation — start with Step 1 USMLE + uWorld core; volume before quality' },
  ];

  return (
    <div>
      <div className="readiness-cards" style={{ marginBottom: 20 }}>
        <div className="an-panel">
          <div className="an-panel-title">Overall Readiness Score</div>
          <ReadinessRing state={state} size={140} />
        </div>
        <div className="an-panel">
          <div className="an-panel-title">Component Breakdown</div>
          {[
            { label: 'Coverage (35 pts)', val: r.coverage.toFixed(1), max: 35 },
            { label: 'Avg Score (30 pts)', val: r.scoreComponent.toFixed(1), max: 30 },
            { label: 'Retention (20 pts)', val: r.retention.toFixed(1), max: 20 },
            { label: 'Simulation (15 pts)', val: r.simulation.toFixed(1), max: 15 },
          ].map(c => (
            <div key={c.label} style={{ marginBottom: 10 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                <span style={{ fontSize: '0.72rem', color: 'var(--muted)' }}>{c.label}</span>
                <span style={{ fontSize: '0.72rem', fontFamily: 'monospace', color: 'var(--text)' }}>{c.val} / {c.max}</span>
              </div>
              <div className="progress-bar-wrap">
                <div className="progress-bar-fill" style={{ width: (Number(c.val) / c.max * 100) + '%' }} />
              </div>
            </div>
          ))}
          <div style={{ fontSize: '0.7rem', color: 'var(--muted)', marginTop: 8 }}>
            Decay penalty: {r.decayCount} module(s) stale &gt;30 days
          </div>
        </div>
      </div>

      <div className="an-panel">
        <div className="an-panel-title">Score Interpretation</div>
        <div className="readiness-legend">
          {legend.map(l => (
            <div key={l.range} className="rl-row">
              <span className="rl-range">{l.range}</span>
              <span className="rl-text">{l.text}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── SYLLABUS TRACKER ──────────────────────────────────────────────────────────
function SyllabusTracker({ doc, commit }) {
  const sylState = doc.medi.sylState || { topics: [], checked: {} };
  const [rawText, setRawText] = useState('');
  const [showInput, setShowInput] = useState(sylState.topics.length === 0);
  const [filterGroup, setFilterGroup] = useState('All');

  const { topics, checked } = sylState;
  const totalChecked = Object.values(checked).filter(Boolean).length;
  const pct = topics.length ? Math.round(totalChecked / topics.length * 100) : 0;

  function handleParse() {
    if (!rawText.trim()) return;
    const { topics: newTopics, checked: newChecked } = parseSyllabus(rawText, checked);
    const next = { ...doc, medi: { ...doc.medi, sylState: { topics: newTopics, checked: newChecked } } };
    commit(next);
    setShowInput(false);
  }

  function toggleTopic(id) {
    const newChecked = { ...checked, [id]: !checked[id] };
    const next = { ...doc, medi: { ...doc.medi, sylState: { topics, checked: newChecked } } };
    commit(next);
  }

  function clearAll() {
    if (!window.confirm('Clear all syllabus topics?')) return;
    const next = { ...doc, medi: { ...doc.medi, sylState: { topics: [], checked: {} } } };
    commit(next);
    setShowInput(true);
  }

  const groups = topics.length ? ['All', ...Array.from(new Set(topics.map(t => t.group)))] : [];
  const displayTopics = filterGroup === 'All' ? topics : topics.filter(t => t.group === filterGroup);

  // Group topics for display
  const grouped = {};
  displayTopics.forEach(t => {
    if (!grouped[t.group]) grouped[t.group] = [];
    grouped[t.group].push(t);
  });

  return (
    <div>
      {topics.length > 0 && (
        <div className="syl-stats">
          <strong style={{ color: 'var(--accent)' }}>{totalChecked} / {topics.length}</strong> topics reviewed ({pct}%)
          <span style={{ marginLeft: 12, cursor: 'pointer', color: 'var(--muted)' }} onClick={() => setShowInput(s => !s)}>
            {showInput ? '▲ Hide input' : '▼ Edit syllabus'}
          </span>
          <span style={{ marginLeft: 12, cursor: 'pointer', color: '#EF4444' }} onClick={clearAll}>Clear all</span>
        </div>
      )}

      <div className="syl-layout">
        {/* Left: input panel */}
        <div>
          {(showInput || topics.length === 0) && (
            <>
              <div style={{ fontSize: '0.75rem', color: 'var(--muted)', marginBottom: 8, lineHeight: 1.5 }}>
                Paste your PLE syllabus below. Use # Section, ## Group, - Topic.
                Topics nest under headings. Re-parse anytime — checked items are preserved.
              </div>
              <textarea
                className="syl-textarea"
                placeholder="# Internal Medicine&#10;## Cardiology&#10;- Heart failure&#10;- ACS&#10;- Arrhythmias&#10;&#10;## Nephrology&#10;- CKD&#10;- AKI"
                value={rawText}
                onChange={e => setRawText(e.target.value)}
              />
              <button className="btn-accent syl-parse-btn" onClick={handleParse}>
                Parse Syllabus
              </button>
            </>
          )}

          {topics.length > 0 && (
            <div style={{ marginTop: 12 }}>
              <div className="progress-bar-wrap" style={{ marginBottom: 8 }}>
                <div className="progress-bar-fill" style={{ width: pct + '%' }} />
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--muted)' }}>
                Filter by group:
              </div>
              <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginTop: 4 }}>
                {groups.map(g => (
                  <button
                    key={g}
                    className={`ftab ${filterGroup === g ? 'active' : ''}`}
                    onClick={() => setFilterGroup(g)}
                    style={{ fontSize: '0.68rem', padding: '4px 8px' }}
                  >
                    {g.length > 20 ? g.slice(0, 18) + '…' : g}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right: topic list */}
        <div style={{ overflowY: 'auto' }}>
          {topics.length === 0 && (
            <div className="empty-state">
              Paste a syllabus on the left and click Parse Syllabus.
            </div>
          )}
          {Object.entries(grouped).map(([group, grpTopics]) => {
            const groupChecked = grpTopics.filter(t => checked[t.id]).length;
            return (
              <div key={group}>
                <div className="syl-group-header">
                  <span>{group}</span>
                  <span>{groupChecked}/{grpTopics.length}</span>
                </div>
                {grpTopics.map(t => (
                  <div
                    key={t.id}
                    className={`syl-topic-row ${checked[t.id] ? 'checked' : ''}`}
                    onClick={() => toggleTopic(t.id)}
                  >
                    <input type="checkbox" readOnly checked={!!checked[t.id]} />
                    <span>{t.text}</span>
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ── WARD CASE LOG ─────────────────────────────────────────────────────────────
function WardCaseLog({ doc, commit }) {
  const caseLog = doc.medi.caseLog || [];
  const [dx, setDx] = useState('');
  const [subject, setSubject] = useState('Internal Medicine');
  const [setting, setSetting] = useState('Ward');
  const [tags, setTags] = useState('');
  const [notes, setNotes] = useState('');
  const [filterSubj, setFilterSubj] = useState('All');

  function handleAdd() {
    if (!dx.trim()) return;
    const today = (() => { const d = new Date(); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); })();
    const entry = {
      id: Date.now(),
      date: today,
      dx: dx.trim(),
      subject,
      setting,
      tags: tags.split(',').map(t => t.trim()).filter(Boolean),
      notes: notes.trim()
    };
    const next = { ...doc, medi: { ...doc.medi, caseLog: [...caseLog, entry] } };
    commit(next);
    setDx(''); setTags(''); setNotes('');
  }

  function handleDelete(id) {
    const next = { ...doc, medi: { ...doc.medi, caseLog: caseLog.filter(e => e.id !== id) } };
    commit(next);
  }

  const subjs = ["All", ...CASE_SUBJECTS];
  const filtered = filterSubj === 'All' ? caseLog : caseLog.filter(e => e.subject === filterSubj);
  const sorted = [...filtered].reverse();

  return (
    <div>
      <div className="cases-layout">
        {/* Form */}
        <div className="case-form">
          <div className="section-title">Add Ward Case</div>
          <input type="text" placeholder="Diagnosis (e.g. Dengue with Warning Signs)" value={dx} onChange={e => setDx(e.target.value)} />
          <select value={subject} onChange={e => setSubject(e.target.value)}>
            {CASE_SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <select value={setting} onChange={e => setSetting(e.target.value)}>
            {SETTINGS_BY_SYSTEM.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <input type="text" placeholder="Tags (comma-separated): dengue, hemorrhagic, fluid" value={tags} onChange={e => setTags(e.target.value)} />
          <textarea placeholder="Key teaching points, management pearls, mistakes made…" value={notes} onChange={e => setNotes(e.target.value)} />
          <button className="btn-accent" onClick={handleAdd}>Add Case</button>
        </div>

        {/* Feed */}
        <div>
          <div className="case-feed-header">
            <span className="section-title" style={{ marginBottom: 0 }}>
              {caseLog.length} case{caseLog.length !== 1 ? 's' : ''} logged
            </span>
          </div>
          <div className="case-filter-chips">
            {subjs.map(s => (
              <button
                key={s}
                className={`case-chip ${filterSubj === s ? 'active' : ''}`}
                onClick={() => setFilterSubj(s)}
              >
                {s}
              </button>
            ))}
          </div>

          {sorted.length === 0 && (
            <div className="empty-state">
              No cases yet. Log your first ward case on the left.
            </div>
          )}

          {sorted.map(e => (
            <div key={e.id} className="case-entry">
              <div className="case-entry-header">
                <span className="case-dx">{e.dx}</span>
                <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                  <span className="case-date">{e.date}</span>
                  <button className="case-del" onClick={() => handleDelete(e.id)}>✕</button>
                </div>
              </div>
              <div className="case-tags">
                <span className="case-tag-subj">{e.subject}</span>
                <span className="case-tag-set">{e.setting}</span>
                {e.tags.map(t => <span key={t} className="case-tag-misc">{t}</span>)}
              </div>
              {e.notes && <div className="case-notes">{e.notes}</div>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── PLE VIEW ──────────────────────────────────────────────────────────────────
const SUBTABS = [
  { id: 'gap',       label: 'Gap Analysis'     },
  { id: 'readiness', label: 'PLE Readiness'    },
  { id: 'syllabus',  label: 'Syllabus Tracker' },
  { id: 'cases',     label: 'Ward Case Log'    },
];

export default function PleView({ doc, commit }) {
  const [tab, setTab] = useState('gap');

  return (
    <div className="ple-view">
      <div className="ple-section-tabs">
        {SUBTABS.map(t => (
          <button
            key={t.id}
            className={`ple-stab ${tab === t.id ? 'active' : ''}`}
            onClick={() => setTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>
      <div className="ple-panel">
        {tab === 'gap'       && <GapAnalysis state={doc.medi.state} />}
        {tab === 'readiness' && <Top5Readiness state={doc.medi.state} />}
        {tab === 'syllabus'  && <SyllabusTracker doc={doc} commit={commit} />}
        {tab === 'cases'     && <WardCaseLog doc={doc} commit={commit} />}
      </div>
    </div>
  );
}
