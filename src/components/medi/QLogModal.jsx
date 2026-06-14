// src/components/medi/QLogModal.jsx
import { useState, useEffect, useRef } from 'react';
import { CATALOG } from '../../lib/medi.data.js';

export default function QLogModal({ doc, commit, onClose }) {
  const [moduleId, setModuleId] = useState('U-10');
  const [total, setTotal] = useState('');
  const [accuracy, setAccuracy] = useState('');
  const [error, setError] = useState('');
  const totalRef = useRef();

  const state = doc.medi.state;
  const m = CATALOG.find(x => x.id === moduleId);
  const s = m ? state.modules[moduleId] : null;
  const remaining = m && s ? Math.max(0, m.totalQuestions - s.completedQuestions) : 0;

  // Close on Escape
  useEffect(() => {
    const handler = e => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  function handleSubmit() {
    if (!m) { setError('Select a module.'); return; }
    const t = parseInt(total);
    const a = parseFloat(accuracy);
    if (!t || t < 1 || isNaN(t)) { setError('Enter a valid total (integer > 0).'); return; }
    if (isNaN(a) || a < 0 || a > 100) { setError('Enter accuracy between 0 and 100.'); return; }

    const next = { ...doc, medi: { ...doc.medi, state: { ...doc.medi.state, modules: { ...doc.medi.state.modules } } } };
    const st = next.medi.state;
    const mod = { ...st.modules[moduleId] };
    st.modules = { ...st.modules, [moduleId]: mod };

    const before = mod.completedQuestions;
    mod.completedQuestions = Math.max(0, Math.min(m.totalQuestions, before + t));
    const loggedIntoModule = mod.completedQuestions - before;

    mod.userPerformanceScore = Math.round(a * 10) / 10;
    if (!Array.isArray(mod.scoreHistory)) mod.scoreHistory = [];
    const today = (() => { const d = new Date(); return d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate(); })();
    mod.scoreHistory.push({ score: mod.userPerformanceScore, date: today, questions: t });
    if (mod.scoreHistory.length > 20) mod.scoreHistory = mod.scoreHistory.slice(-20);
    mod.lastUpdated = new Date().toISOString();

    // recalcStatus
    if (mod.completedQuestions >= m.totalQuestions) { mod.completedQuestions = m.totalQuestions; mod.status = 'Completed'; }
    else if (mod.status === 'Paused') { /* keep */ }
    else if (mod.completedQuestions > 0) { mod.status = 'In Progress'; }
    else { mod.status = 'Unstarted'; }

    // Daily metrics
    if (st.dailyTargetMetrics.dayKey !== today) {
      st.dailyTargetMetrics = { ...st.dailyTargetMetrics, currentDayCompletedCount: 0, dayKey: today };
    }
    if (loggedIntoModule > 0) {
      st.dailyTargetMetrics = { ...st.dailyTargetMetrics, currentDayCompletedCount: st.dailyTargetMetrics.currentDayCompletedCount + loggedIntoModule };
      st.dailyHistory = { ...st.dailyHistory, [today]: (st.dailyHistory[today] || 0) + loggedIntoModule };
    }

    // Question log
    if (!Array.isArray(st.questionLogs)) st.questionLogs = [];
    st.questionLogs = [...st.questionLogs, { date: today, moduleId, total: t, accuracy: a, loggedIntoModule }];

    commit(next);
    onClose();
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter') handleSubmit();
  }

  return (
    <div className="modal-backdrop" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-box">
        <div className="modal-header">
          <span className="modal-title">Log Module Questions</span>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">
          <div className="modal-field">
            <label>Module</label>
            <select value={moduleId} onChange={e => setModuleId(e.target.value)}>
              {CATALOG.map(m => (
                <option key={m.id} value={m.id}>{m.id} — {m.name}</option>
              ))}
            </select>
          </div>

          {m && s && (
            <div className="modal-meta">
              {s.completedQuestions} / {m.totalQuestions} logged · {remaining} remaining
            </div>
          )}

          <div className="modal-field">
            <label>Questions Completed</label>
            <input
              ref={totalRef} type="number" min="1" inputMode="numeric"
              value={total} onChange={e => setTotal(e.target.value)}
              onKeyDown={handleKeyDown} placeholder="e.g. 40"
            />
          </div>

          <div className="modal-field">
            <label>Accuracy %</label>
            <input
              type="number" min="0" max="100" step="0.1" inputMode="numeric"
              value={accuracy} onChange={e => setAccuracy(e.target.value)}
              onKeyDown={handleKeyDown} placeholder="e.g. 72.5"
            />
          </div>

          {error && <div style={{ color: '#EF4444', fontSize: '0.78rem' }}>{error}</div>}
        </div>
        <div className="modal-footer">
          <button className="btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn-accent" onClick={handleSubmit}>Log Questions</button>
        </div>
      </div>
    </div>
  );
}
