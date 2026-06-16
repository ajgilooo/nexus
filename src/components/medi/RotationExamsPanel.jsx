// src/components/medi/RotationExamsPanel.jsx
// PLE Intelligence → Rotation Exams sub-panel (§10.8.5).
// Stores entries in doc.medi.rotationExams with schema: { uid, rotation, subject, date, score, maxScore }

import { useState } from 'react';
import { PLE_WEIGHTS } from '../../lib/medi.data.js';
import { clampPct } from '../../lib/rpg.logic.js';
import { calcReadiness } from '../../lib/medi.logic.js';

const PLE_SUBJECTS = PLE_WEIGHTS.map(p => p.subject);

function randUid() { return Math.random().toString(36).slice(2, 10); }
function todayIso() { return new Date().toISOString().slice(0, 10); }

function pctColor(pct) {
  if (pct >= 85) return '#10B981';
  if (pct >= 70) return '#F59E0B';
  return '#EF4444';
}

export default function RotationExamsPanel({ doc, commit }) {
  const rotationExams = doc.medi.rotationExams || [];
  const [rotation, setRotation] = useState('');
  const [subject, setSubject] = useState(PLE_SUBJECTS[0]);
  const [date, setDate] = useState(todayIso());
  const [score, setScore] = useState('');
  const [maxScore, setMaxScore] = useState('100');
  const [error, setError] = useState('');
  const [filterSubj, setFilterSubj] = useState('All');

  const readiness = calcReadiness(doc.medi.state, rotationExams);
  const avgPct = rotationExams.length
    ? rotationExams.reduce((a, e) => a + clampPct(e.score, e.maxScore), 0) / rotationExams.length
    : null;

  function handleLog() {
    setError('');
    if (!rotation.trim()) { setError('Rotation name is required.'); return; }
    const s = Number(score);
    const m = Number(maxScore);
    if (isNaN(s) || s < 0) { setError('Score must be ≥ 0.'); return; }
    if (!isFinite(m) || m <= 0) { setError('Max score must be > 0.'); return; }
    if (s > m) { setError('Score cannot exceed max score.'); return; }

    const entry = { uid: randUid(), rotation: rotation.trim(), subject, date, score: s, maxScore: m };
    const next = { ...doc, medi: { ...doc.medi, rotationExams: [...rotationExams, entry] } };
    commit(next);
    setRotation(''); setScore(''); setMaxScore('100'); setDate(todayIso());
  }

  function handleDelete(uid) {
    const next = { ...doc, medi: { ...doc.medi, rotationExams: rotationExams.filter(e => e.uid !== uid) } };
    commit(next);
  }

  const subjs = ['All', ...PLE_SUBJECTS];
  const filtered = filterSubj === 'All' ? rotationExams : rotationExams.filter(e => e.subject === filterSubj);
  const sorted = [...filtered].sort((a, b) => (b.date > a.date ? 1 : b.date < a.date ? -1 : 0));

  return (
    <div>
      <div style={{ marginBottom: 14, fontSize: '0.78rem', color: 'var(--muted)', lineHeight: 1.5 }}>
        Log your school's in-rotation exams. Each exam feeds readiness as a 5th component (C5) and awards XP. Subject and score affect the Clinical axis.
      </div>

      {/* Summary */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 18 }}>
        {[
          { label: 'Exams Logged', val: rotationExams.length },
          { label: 'Average Score', val: avgPct !== null ? avgPct.toFixed(1) + '%' : '—', color: avgPct !== null ? pctColor(avgPct) : undefined },
          { label: 'Readiness C5', val: readiness.hasExams ? readiness.rotation.toFixed(1) + ' / 6' : '—' },
        ].map(s => (
          <div key={s.label} style={{ background: 'var(--panel)', border: '1px solid var(--line)', borderRadius: 10, padding: '14px 16px' }}>
            <div style={{ fontSize: '0.62rem', textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--muted)', marginBottom: 6, fontWeight: 700 }}>{s.label}</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, fontFamily: 'var(--font-mono)', color: s.color || 'var(--text)', lineHeight: 1 }}>{s.val}</div>
          </div>
        ))}
      </div>

      <div className="cases-layout">
        {/* Form */}
        <div className="case-form">
          <div className="section-title">Log Rotation Exam</div>
          <input
            type="text"
            placeholder="Rotation name (e.g. IM Block 2 shifting exam)"
            value={rotation}
            onChange={e => setRotation(e.target.value)}
          />
          <select value={subject} onChange={e => setSubject(e.target.value)}>
            {PLE_SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <input type="date" value={date} onChange={e => setDate(e.target.value)} />
          <div style={{ display: 'flex', gap: 8 }}>
            <input
              type="number"
              min="0"
              inputMode="numeric"
              placeholder="Score (raw)"
              value={score}
              onChange={e => setScore(e.target.value)}
              style={{ flex: 1 }}
            />
            <input
              type="number"
              min="1"
              inputMode="numeric"
              placeholder="Max score"
              value={maxScore}
              onChange={e => setMaxScore(e.target.value)}
              style={{ flex: 1 }}
            />
          </div>
          {score !== '' && maxScore !== '' && Number(maxScore) > 0 && (
            <div style={{ fontSize: '0.75rem', color: 'var(--muted)', fontFamily: 'var(--font-mono)' }}>
              = {clampPct(score, maxScore).toFixed(1)}%
            </div>
          )}
          {error && <div style={{ color: '#EF4444', fontSize: '0.75rem' }}>{error}</div>}
          <button className="btn-accent" onClick={handleLog}>Log Exam</button>
        </div>

        {/* Feed */}
        <div>
          <span className="section-title" style={{ marginBottom: 8 }}>
            {rotationExams.length} exam{rotationExams.length !== 1 ? 's' : ''} logged
            {avgPct !== null && <span style={{ fontWeight: 400, color: 'var(--muted)', marginLeft: 8 }}>· avg {avgPct.toFixed(0)}%</span>}
          </span>
          <div className="case-filter-chips" style={{ marginBottom: 12 }}>
            {subjs.map(s => (
              <button
                key={s}
                className={`case-chip ${filterSubj === s ? 'active' : ''}`}
                onClick={() => setFilterSubj(s)}
              >
                {s === 'All' ? 'All' : s.split(' ')[0]}
              </button>
            ))}
          </div>

          {sorted.length === 0 && (
            <div className="empty-state">No exams yet. Log your first rotation exam on the left.</div>
          )}

          {sorted.map(e => {
            const pct = clampPct(e.score, e.maxScore);
            return (
              <div key={e.uid} className="exam-entry">
                <div className="exam-entry-main">
                  <div className="exam-entry-score" style={{ color: pctColor(pct) }}>
                    {pct.toFixed(0)}<span>%</span>
                  </div>
                  <div className="exam-entry-body">
                    <div className="exam-entry-name">{e.rotation}</div>
                    <div className="exam-entry-meta">
                      <span className="exam-tag-subj">{e.subject}</span>
                      <span className="exam-raw">{e.score}/{e.maxScore}</span>
                      <span className="exam-date">{e.date}</span>
                    </div>
                  </div>
                </div>
                <button className="case-del" onClick={() => handleDelete(e.uid)}>✕</button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
