// src/components/medi/SelfAssessModal.jsx
// Recommends + logs NBME Self-Assessment forms based on the current rotation block.
import { useState } from 'react';
import { CATALOG } from '../../lib/medi.data.js';
import { blockForDate, dayDiff, padDate } from './schedule/scheduleHelpers.js';

// Ordered SA form IDs for each rotation block — the sequence to work through.
// Order = recommended progression (easiest / earliest form first).
const BLOCK_SA_IDS = {
  'MED 260':           ['NBME-CMS-20','NBME-CMS-21','NBME-CMS-22','NBME-CMS-23','NBME-CMS-24','NBME-CMS-19'],
  'PEDIA 260':         ['NBME-CMS-25','NBME-CMS-26','NBME-CMS-27','NBME-CMS-28','NBME-CMS-29'],
  'SURG 260':          ['NBME-CMS-34','NBME-CMS-35','NBME-CMS-36','NBME-CMS-37'],
  'FCH 260.1':         ['NBME-CMS-15','NBME-CMS-16','NBME-CMS-17','NBME-CMS-18'],
  'FCH 260':           ['NBME-CMS-12','NBME-CMS-13','NBME-CMS-14'],
  'OB-GYN 260':        ['NBME-CMS-06','NBME-CMS-07','NBME-CMS-08','NBME-CMS-09','NBME-CMS-10','NBME-CMS-11'],
  '[E] MED 292':       ['NBME-CMS-22','NBME-CMS-23','NBME-CMS-24'],
  '[E] MED 291':       ['NBME-CMS-22','NBME-CMS-23'],
  '[E] Neurosc 291.1': ['NBME-COMP-01','NBME-COMP-02','NBME-COMP-03','NBME-COMP-04','NBME-COMP-05','NBME-COMP-06','NBME-COMP-07','NBME-COMP-08','NBME-COMP-09'],
  'Core Consolidation Blitz': ['NBME-COMP-06','NBME-COMP-07','NBME-COMP-08','NBME-COMP-09','NBME-COMP-10','NBME-COMP-11','NBME-COMP-12','NBME-COMP-13'],
  'Dedicated PLE Sprint I':   ['NBME-COMP-06','NBME-COMP-07','NBME-COMP-08','NBME-COMP-09','NBME-SUB-01','NBME-SUB-02','NBME-SUB-03','NBME-SUB-04','NBME-SUB-05','NBME-SUB-06'],
  'Dedicated PLE Sprint II':  ['NBME-CMS-20','NBME-CMS-25','NBME-CMS-34','NBME-CMS-06','NBME-CMS-15','NBME-SUB-01','NBME-SUB-02','NBME-SUB-03','NBME-SUB-04','NBME-SUB-05','NBME-SUB-06'],
  'Final Pre-Exam Sprint':    ['HY-11','HY-12','HY-13','HY-14','HY-15','HY-16','HY-17','HY-18'],
};

const CATALOG_MAP = Object.fromEntries(CATALOG.map(m => [m.id, m]));

function todayStr() {
  const d = new Date();
  return padDate(d.getFullYear(), d.getMonth() + 1, d.getDate());
}

// Check if an exam entry refers to this catalog form
function isTaken(examLog, formId, formName) {
  return (examLog || []).some(e => e.catalogId === formId || e.name === formName);
}

function takenEntry(examLog, formId, formName) {
  return (examLog || []).find(e => e.catalogId === formId || e.name === formName) || null;
}

// ── Log row (inline score entry) ──────────────────────────────────────────────
function LogRow({ form, onSave, onCancel }) {
  const [score,   setScore]   = useState('');
  const [items,   setItems]   = useState(String(form.totalQuestions || ''));
  const [correct, setCorrect] = useState('');
  const [date,    setDate]    = useState(todayStr());

  function handleSave() {
    const s = parseFloat(score);
    if (isNaN(s) || s < 0 || s > 100) return;
    onSave({ score: s, total: items ? Number(items) : null, correct: correct ? Number(correct) : null, date });
  }

  return (
    <div className="sam-log-row">
      <div className="sam-log-title">Log result · <em>{form.name}</em></div>
      <div className="sam-log-fields">
        <label className="sam-log-label">
          Score %
          <input className="sam-log-input sam-score" type="number" min="0" max="100" placeholder="e.g. 72"
            value={score} onChange={e => setScore(e.target.value)} autoFocus />
        </label>
        <label className="sam-log-label">
          Items
          <input className="sam-log-input sam-items" type="number" min="1" placeholder="50"
            value={items} onChange={e => setItems(e.target.value)} />
        </label>
        <label className="sam-log-label">
          Correct
          <input className="sam-log-input sam-items" type="number" min="0"
            placeholder="auto" value={correct} onChange={e => setCorrect(e.target.value)} />
        </label>
        <label className="sam-log-label">
          Date
          <input className="sam-log-input sam-date" type="date" value={date} onChange={e => setDate(e.target.value)} />
        </label>
      </div>
      <div className="sam-log-btns">
        <button className="sam-save-btn" onClick={handleSave} disabled={!score}>Save</button>
        <button className="sam-cancel-btn" onClick={onCancel}>Cancel</button>
      </div>
    </div>
  );
}

// ── Form row ──────────────────────────────────────────────────────────────────
function FormRow({ form, isRec, taken, entry, loggingId, onLog, onSave, onCancelLog }) {
  const scoreColor = entry?.score >= 75 ? '#34d399' : entry?.score >= 60 ? '#fbbf24' : '#f87171';
  return (
    <div className={`sam-form-row${isRec ? ' sam-rec' : ''}${taken ? ' sam-taken' : ''}`}>
      <div className="sam-form-main">
        <div className="sam-form-left">
          {taken
            ? <span className="sam-check">✓</span>
            : isRec ? <span className="sam-star">★</span> : <span className="sam-dot" />}
          <div>
            <div className="sam-form-name">{form.name}</div>
            <div className="sam-form-meta">{form.category} · {form.totalQuestions} items · {form.estimatedDuration}</div>
          </div>
        </div>
        <div className="sam-form-right">
          {taken && entry
            ? <div className="sam-score-badge" style={{ color: scoreColor }}>
                {entry.score.toFixed(0)}% · {entry.date}
              </div>
            : null}
          {!taken && (
            <button className="sam-log-btn" onClick={() => onLog(form.id)}>
              {loggingId === form.id ? 'Cancel' : 'Log result →'}
            </button>
          )}
          {taken && (
            <button className="sam-log-btn sam-relog" onClick={() => onLog(form.id)}>
              {loggingId === form.id ? 'Cancel' : 'Re-log'}
            </button>
          )}
        </div>
      </div>
      {loggingId === form.id && (
        <LogRow form={form} onSave={d => onSave(form, d)} onCancel={onCancelLog} />
      )}
      {isRec && !taken && (
        <div className="sam-rec-reason">Recommended next — first untaken form in sequence for {form.category.replace('NBME - ', '')}</div>
      )}
    </div>
  );
}

// ── Main modal ────────────────────────────────────────────────────────────────
export default function SelfAssessModal({ doc, commit, onClose }) {
  const state    = doc.medi.state;
  const examLog  = state.examLog || [];
  const [loggingId, setLoggingId] = useState(null);
  const [tab, setTab] = useState('block'); // 'block' | 'all' | 'history'

  // Current block
  const now   = new Date();
  const block = blockForDate(now);
  const dayIn = block ? dayDiff(block.start, todayStr()) + 1 : null;
  const len   = block ? dayDiff(block.start, block.end) + 1 : null;

  // Forms for current block
  const blockIds   = block ? (BLOCK_SA_IDS[block.label] || []) : [];
  const blockForms = blockIds.map(id => CATALOG_MAP[id]).filter(Boolean);

  // First untaken = recommendation
  const recForm = blockForms.find(f => !isTaken(examLog, f.id, f.name)) || null;

  // All SA forms across the catalog
  const SA_CATS = ['NBME - Clinical Mastery','NBME - Comp. Basic Science (Step 1)',
                   'NBME - Comp. Clinical Science (Step 2 CK)','NBME - Comp. Clinical Medicine (Step 3)',
                   'NBME - Subjects Exam','USMLE High Yield'];
  const allForms = CATALOG.filter(m => SA_CATS.includes(m.category));

  function handleLog(id) {
    setLoggingId(loggingId === id ? null : id);
  }

  function handleSave(form, data) {
    const entry = {
      id: Date.now(),
      name: form.name,
      subject: form.category,
      score: Math.max(0, Math.min(100, Number(data.score))),
      total: data.total || null,
      correct: data.correct || null,
      date: data.date || todayStr(),
      catalogId: form.id,
    };
    const newState = { ...state, examLog: [...examLog, entry] };
    commit({ ...doc, medi: { ...doc.medi, state: newState } });
    setLoggingId(null);
  }

  function handleCancelLog() {
    setLoggingId(null);
  }

  const rowProps = { loggingId, onLog: handleLog, onSave: handleSave, onCancelLog: handleCancelLog };

  const recentHistory = [...examLog]
    .filter(e => e.catalogId || e.subject?.includes('NBME') || e.subject?.includes('USMLE High Yield'))
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 10);

  return (
    <div className="sam-backdrop" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="sam-modal">
        {/* Header */}
        <div className="sam-header">
          <div>
            <div className="sam-title">Self-Assessment</div>
            {block && (
              <div className="sam-subtitle">{block.label} · Day {dayIn}/{len}</div>
            )}
          </div>
          <button className="sam-close" onClick={onClose}>✕</button>
        </div>

        {/* Tabs */}
        <div className="sam-tabs">
          <button className={`sam-tab${tab === 'block' ? ' sam-tab-active' : ''}`} onClick={() => setTab('block')}>
            This Block {blockForms.length > 0 ? `(${blockForms.length})` : ''}
          </button>
          <button className={`sam-tab${tab === 'all' ? ' sam-tab-active' : ''}`} onClick={() => setTab('all')}>
            All Forms
          </button>
          <button className={`sam-tab${tab === 'history' ? ' sam-tab-active' : ''}`} onClick={() => setTab('history')}>
            History {recentHistory.length > 0 ? `(${recentHistory.length})` : ''}
          </button>
        </div>

        <div className="sam-body">
          {/* Block tab */}
          {tab === 'block' && (
            <>
              {!block && (
                <div className="sam-empty">No active rotation block today.</div>
              )}
              {block && blockForms.length === 0 && (
                <div className="sam-empty">No mapped SA forms for {block.label}. Check All Forms tab.</div>
              )}
              {blockForms.length > 0 && (
                <div className="sam-form-list">
                  {blockForms.map(form => (
                    <FormRow
                      key={form.id}
                      form={form}
                      isRec={recForm?.id === form.id}
                      taken={isTaken(examLog, form.id, form.name)}
                      entry={takenEntry(examLog, form.id, form.name)}
                      {...rowProps}
                    />
                  ))}
                </div>
              )}
            </>
          )}

          {/* All forms tab — grouped by category */}
          {tab === 'all' && (
            <div className="sam-form-list">
              {SA_CATS.map(cat => {
                const forms = allForms.filter(f => f.category === cat);
                if (!forms.length) return null;
                return (
                  <div key={cat} className="sam-cat-group">
                    <div className="sam-cat-label">{cat.replace('NBME - ', '')}</div>
                    {forms.map(form => (
                      <FormRow
                        key={form.id}
                        form={form}
                        isRec={false}
                        taken={isTaken(examLog, form.id, form.name)}
                        entry={takenEntry(examLog, form.id, form.name)}
                        {...rowProps}
                      />
                    ))}
                  </div>
                );
              })}
            </div>
          )}

          {/* History tab */}
          {tab === 'history' && (
            <div className="sam-form-list">
              {recentHistory.length === 0 && <div className="sam-empty">No self-assessment history yet.</div>}
              {recentHistory.map(e => {
                const sc = e.score;
                const col = sc >= 75 ? '#34d399' : sc >= 60 ? '#fbbf24' : '#f87171';
                return (
                  <div key={e.id} className="sam-hist-row">
                    <div className="sam-hist-name">{e.name}</div>
                    <div className="sam-hist-meta">{e.subject?.replace('NBME - ', '')} · {e.date}</div>
                    <div className="sam-hist-score" style={{ color: col }}>
                      {sc.toFixed(0)}%
                      {e.correct != null && e.total != null && ` · ${e.correct}/${e.total}`}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
