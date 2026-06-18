// src/components/medi/schedule/OverviewView.jsx
import { useState } from 'react';
import { INTERNSHIP_SCHEDULE, PLE_WEIGHTS, SUBJ_MODULE_IDS, CATALOG } from '../../../lib/medi.data.js';
import { getSubjectCoverage, currentBlock, daysRemainingInBlock, daysUntilBlock } from '../../../lib/medi.logic.js';
import BlockCountdownRing from './BlockCountdownRing.jsx';

const ALL_BASIC    = PLE_WEIGHTS.filter(p => p.group === 'Basic').map(p => p.subject);
const ALL_CLINICAL = PLE_WEIGHTS.filter(p => p.group === 'Clinical').map(p => p.subject);

// ── Shared SubjectBar ─────────────────────────────────────────────────────────
function SubjectBar({ subject, state }) {
  const cov = getSubjectCoverage(state, subject);
  const coverage = cov ? cov.coverage : 0;
  const avgScore = cov ? cov.avgScore : null;
  const col = coverage >= 70 ? '#10B981' : coverage >= 40 ? '#F59E0B' : '#EF4444';
  return (
    <div className="sched-subject-bar">
      <div className="sched-subj-name">{subject}</div>
      <div className="sched-bar-row">
        <div className="gap-bar-outer" style={{ flex: 1 }}>
          <div className="gap-bar-inner" style={{ width: coverage + '%', background: col }} />
        </div>
        <span className="sched-subj-pct">{coverage.toFixed(0)}%</span>
        {avgScore !== null && (
          <span className="sched-subj-score" style={{ color: col }}>{avgScore.toFixed(0)}%</span>
        )}
      </div>
    </div>
  );
}

// ── Recommended modules (collapsed) ──────────────────────────────────────────
function RecommendedModules({ subjects }) {
  const [show, setShow] = useState(false);
  const seen = new Set();
  const entries = subjects.flatMap(subj =>
    (SUBJ_MODULE_IDS[subj] || []).map(id => {
      if (seen.has(id)) return null;
      seen.add(id);
      const mod = CATALOG.find(m => m.id === id);
      return mod ? { subj, mod } : null;
    }).filter(Boolean)
  );
  if (entries.length === 0) return null;
  return (
    <div className="sched-modules">
      <button className="sched-mod-toggle" onClick={() => setShow(s => !s)}>
        {show ? 'Hide modules ▲' : `Show ${entries.length} mapped modules ▼`}
      </button>
      {show && (
        <div className="sched-mod-list">
          {entries.map(({ subj, mod }) => (
            <div key={mod.id} className="sched-mod-row">
              <span className="sched-mod-id">{mod.id}</span>
              <span className="sched-mod-name">{mod.name}</span>
              <span className="sched-mod-subj">{subj.split(' ')[0]}</span>
              <span className="sched-mod-qs">{mod.totalQuestions}Q</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Study Playbook ────────────────────────────────────────────────────────────
// Tells the user exactly what to do each day in this block.
function StudyPlaybook({ block }) {
  const { type, primarySubjects = [], basicSubject, dailyTarget, studyHours, note } = block;
  const p = primarySubjects.slice(0, 3).join(', ');
  const b = basicSubject || null;

  let mode, dailyQ, accentCls, steps;

  if (type === 'blitz') {
    mode    = 'Full-Intensity Blitz';
    dailyQ  = `${dailyTarget}–${dailyTarget + 50} Q/day`;
    accentCls = 'bp--blitz';
    steps = [
      `${dailyTarget}+ questions per day across all 12 PLE subjects — no skipping`,
      `${studyHours} hours of focused study daily; treat this like exam week`,
      'Run NBME Comp or Clinical Mastery simulations at least once a week',
      'Score each session in Tracker → use weak zones to pick next day\'s topics',
      note || null,
    ].filter(Boolean);
  } else if (type === 'sprint') {
    mode    = 'Basic Science Sprint';
    dailyQ  = '60–80 Q/day';
    accentCls = 'bp--sprint';
    steps = [
      'No clinical rotation — dedicate full study time to the 6 basic sciences',
      'Rotate through all basic subjects within the block; don\'t skip any',
      'Target 60–80 Q/day; even 30–40 on busy days keeps the streak alive',
      'Analytics → Radar will show which basic subjects need the most work',
      'Log every session in Tracker to build your streak',
    ];
  } else if (type === 'elective') {
    mode    = 'Elective Rotation';
    dailyQ  = '40–60 Q/day';
    accentCls = 'bp--elective';
    steps = [
      `Elective schedule is lighter — use the extra time for PLE review`,
      `Primary subjects: ${p} (aim for 40–50 Q/day)`,
      b ? `Basic science double-up: ${b} (~10–15 Q/day on top)` : null,
      note ? `Clinical focus for this rotation: ${note}` : null,
      'Check Analytics → Weak Zones to pick which modules to prioritize',
      'Log in Tracker daily — keep your streak going',
    ].filter(Boolean);
  } else {
    // clinical
    mode    = 'Clinical Rotation';
    dailyQ  = '20–40 Q/day';
    accentCls = 'bp--clinical';
    steps = [
      `Rotation is demanding — keep sessions short but daily (20–40 Q is enough)`,
      `Primary focus: ${p || 'your rotation subjects'}`,
      b ? `Basic science double-up: ${b} — even 10 Q/day compounds fast` : null,
      'Link your rotation cases to PLE-style questions while they\'re fresh',
      'Log in Tracker after each session; the streak is what matters here',
    ].filter(Boolean);
  }

  return (
    <div className={`block-playbook ${accentCls}`}>
      <div className="bp-header">
        <span className="bp-mode-label">{mode}</span>
        <span className="bp-qtarget">{dailyQ}</span>
      </div>
      <ul className="bp-steps">
        {steps.map((s, i) => <li key={i}>{s}</li>)}
      </ul>
    </div>
  );
}

function formatRange(start, end) {
  const s = new Date(start + 'T00:00:00');
  const e = new Date(end   + 'T00:00:00');
  const mo = { month: 'short', day: 'numeric' };
  const diffYear = s.getFullYear() !== e.getFullYear();
  return `${s.toLocaleDateString('en-US', mo)} – ${e.toLocaleDateString('en-US', {
    ...mo, ...(diffYear ? { year: 'numeric' } : {})
  })}`;
}

// ── Block Hero ────────────────────────────────────────────────────────────────
function BlockHero({ result }) {
  if (!result) return <div className="sched-complete">All study blocks complete — PLE incoming!</div>;
  const { block, upcoming } = result;
  const days = upcoming ? daysUntilBlock(block) : daysRemainingInBlock(block);
  const isSprint = block.type === 'sprint';
  const isBlitz  = block.type === 'blitz';

  // Block duration in days
  const blockStart = new Date(block.start + 'T00:00:00');
  const blockEnd   = new Date(block.end   + 'T23:59:59');
  const blockDuration = Math.ceil((blockEnd - blockStart) / 86400000);

  // Elapsed %
  const now = new Date();
  const elapsed = upcoming ? 0 : Math.max(0, Math.ceil((now - blockStart) / 86400000));
  const elapsedPct = Math.min(100, (elapsed / blockDuration) * 100);

  const primary = block.primarySubjects || [];
  const basic   = block.basicSubject ? [block.basicSubject]
                : (isSprint || isBlitz) ? ALL_BASIC : [];

  const blitzClinical = isBlitz ? primary.filter(s => ALL_CLINICAL.includes(s)) : [];
  const blitzBasic    = isBlitz ? primary.filter(s => ALL_BASIC.includes(s))    : [];

  const blockIdx = INTERNSHIP_SCHEDULE.findIndex(b => b.id === block.id);

  return (
    <div className={`ov-hero${isBlitz ? ' ov-hero--blitz' : ''}`}>
      <div className="ov-hero-ring">
        <BlockCountdownRing
          daysRemaining={days}
          blockDuration={blockDuration}
          isUpcoming={upcoming}
          size={140}
          mode="countdown"
        />
        <div className="ov-block-counter">
          Block {blockIdx + 1} / {INTERNSHIP_SCHEDULE.length}
        </div>
      </div>

      <div className="ov-hero-info">
        <div className="ov-hero-meta">
          <span className={`ov-type-badge ov-type--${block.type}`}>{block.type}</span>
          {isBlitz && (
            <>
              <span className="ov-blitz-pill">{block.dailyTarget}+ Q/day</span>
              <span className="ov-blitz-pill">{block.studyHours} hrs</span>
            </>
          )}
        </div>
        <h2 className="ov-hero-title">{block.label}</h2>
        <div className="ov-hero-dates">{formatRange(block.start, block.end)}</div>
        {block.note && <div className="ov-hero-note">{block.note}</div>}

        {/* Elapsed progress bar */}
        <div className="ov-elapsed-wrap">
          <div className="ov-elapsed-bar">
            <div className="ov-elapsed-fill" style={{ width: elapsedPct + '%' }} />
          </div>
          <span className="ov-elapsed-label">{Math.round(elapsedPct)}% of block elapsed</span>
        </div>

        {/* Subject bars */}
        {!isBlitz && primary.length > 0 && (
          <div className="ov-hero-subjects">
            <div className="ov-subjects-label">Primary Focus</div>
            {primary.map(s => <SubjectBarHero key={s} subject={s} />)}
            {basic.length > 0 && <>
              <div className="ov-subjects-label" style={{ marginTop: 8 }}>
                {isSprint ? 'Basic Science Sprint' : 'Basic Science Double-Up'}
              </div>
              {basic.map(s => <SubjectBarHero key={s} subject={s} />)}
            </>}
          </div>
        )}
        {isBlitz && (
          <div className="ov-hero-subjects">
            <div className="ov-subjects-label">All 12 PLE Subjects</div>
            <div style={{ fontSize: '0.7rem', color: 'var(--muted)' }}>
              See Coverage Grid below ↓
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Thin version of SubjectBar used in the hero (no state dependency — rendered by parent)
function SubjectBarHero({ subject }) {
  // State passed via closure from parent — use a context-free placeholder
  // Actually this needs state, so let's pass it properly
  return null; // placeholder — will be replaced in the full render below
}

// ── Coverage Grid (12 subjects) ───────────────────────────────────────────────
function CoverageGrid({ state }) {
  return (
    <div className="ov-coverage-section">
      <div className="ov-section-title">PLE Subject Coverage</div>
      <div className="ov-coverage-grid">
        {PLE_WEIGHTS.map(p => {
          const cov = getSubjectCoverage(state, p.subject);
          const pct = cov ? cov.coverage : 0;
          const avg = cov ? cov.avgScore : null;
          return (
            <div key={p.subject} className="ov-cov-card">
              <BlockCountdownRing
                pct={pct}
                avgScore={avg}
                size={64}
                mode="coverage"
              />
              <div className="ov-cov-name">{p.subject}</div>
              {avg !== null && (
                <div className="ov-cov-score"
                  style={{ color: avg >= 75 ? '#10B981' : avg >= 60 ? '#F59E0B' : '#EF4444' }}>
                  {avg.toFixed(0)}% score
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Phase-grouped block list ──────────────────────────────────────────────────
const PHASE_GROUPS = [
  { label: 'Phase 1 — Internship',      types: ['clinical', 'elective', 'sprint'] },
  { label: 'Phase 2–3 — Blitz Period',  types: ['blitz'] },
];

function BlockRow({ block, state }) {
  const [expanded, setExpanded] = useState(false);
  const today = new Date();
  const end   = new Date(block.end   + 'T23:59:59');
  const start = new Date(block.start + 'T00:00:00');
  const isPast    = end   < today;
  const isCurrent = start <= today && today <= end;
  const primary = (block.primarySubjects || []).slice(0, 3);
  const cov = primary.length > 0
    ? primary.reduce((s, subj) => {
        const c = getSubjectCoverage(state, subj);
        return s + (c ? c.coverage : 0);
      }, 0) / primary.length
    : 0;
  const barColor = cov >= 70 ? '#10B981' : cov >= 40 ? '#F59E0B' : '#EF4444';

  return (
    <div
      className={[
        'ov-block-row',
        isCurrent ? 'current' : '',
        isPast    ? 'past'    : '',
        block.type === 'blitz' ? 'blitz-row' : '',
        expanded  ? 'expanded' : '',
      ].filter(Boolean).join(' ')}
    >
      <button className="ov-block-row-btn" onClick={() => setExpanded(e => !e)}>
        <div className={`ov-block-stripe ov-stripe--${block.type}`} />
        <div className="ov-block-date">{formatRange(block.start, block.end)}</div>
        <div className="ov-block-label">{block.label}</div>
        <div className="ov-block-chips">
          {(block.primarySubjects || []).slice(0, 2).map(s => (
            <span key={s} className="sched-subj-chip">{s.split(' ')[0]}</span>
          ))}
          {block.basicSubject && (
            <span className="sched-basic-chip">{block.basicSubject.split(/[ ,&]/)[0]}</span>
          )}
          {block.type === 'blitz' && (
            <span className="sched-blitz-badge">{block.dailyTarget}Q</span>
          )}
        </div>
        <div className="ov-block-bar">
          {primary.length > 0 && (
            <div className="gap-bar-outer" style={{ width: 64 }}>
              <div className="gap-bar-inner" style={{ width: cov + '%', background: barColor }} />
            </div>
          )}
        </div>
        <span className="ov-block-expand-icon">{expanded ? '▲' : '▼'}</span>
      </button>
      {expanded && (
        <div className="ov-block-detail">
          <StudyPlaybook block={block} />
          {block.note && !['blitz'].includes(block.type) && (
            <div className="ov-block-detail-note">{block.note}</div>
          )}
        </div>
      )}
    </div>
  );
}

function PhaseSection({ group, blocks, state }) {
  const [open, setOpen] = useState(true);
  return (
    <div className="ov-phase-section">
      <button className="ov-phase-header" onClick={() => setOpen(o => !o)}>
        <span>{group.label}</span>
        <span className="ov-phase-count">{blocks.length} blocks {open ? '▲' : '▼'}</span>
      </button>
      {open && (
        <div className="ov-phase-blocks">
          {blocks.map(block => <BlockRow key={block.id} block={block} state={state} />)}
        </div>
      )}
    </div>
  );
}

// ── OverviewView (root) ───────────────────────────────────────────────────────
export default function OverviewView({ state }) {
  const result = currentBlock();

  // Hero needs state for SubjectBars — render the hero inline with state access
  const heroBlock = result?.block;
  const isUpcoming = result?.upcoming;
  const days = heroBlock
    ? (isUpcoming ? daysUntilBlock(heroBlock) : daysRemainingInBlock(heroBlock))
    : 0;
  const isSprint = heroBlock?.type === 'sprint';
  const isBlitz  = heroBlock?.type === 'blitz';

  const primary = heroBlock ? (heroBlock.primarySubjects || []) : [];
  const basic   = heroBlock
    ? (heroBlock.basicSubject ? [heroBlock.basicSubject]
        : (isSprint || isBlitz) ? ALL_BASIC : [])
    : [];

  const blockDuration = heroBlock
    ? Math.ceil((new Date(heroBlock.end + 'T23:59:59') - new Date(heroBlock.start + 'T00:00:00')) / 86400000)
    : 1;

  const now = new Date();
  const blockStart = heroBlock ? new Date(heroBlock.start + 'T00:00:00') : now;
  const elapsed = isUpcoming || !heroBlock ? 0 : Math.max(0, Math.ceil((now - blockStart) / 86400000));
  const elapsedPct = heroBlock ? Math.min(100, (elapsed / blockDuration) * 100) : 0;
  const blockIdx = heroBlock ? INTERNSHIP_SCHEDULE.findIndex(b => b.id === heroBlock.id) : 0;

  const blitzClinical = isBlitz ? primary.filter(s => ALL_CLINICAL.includes(s)) : [];
  const blitzBasic    = isBlitz ? primary.filter(s => ALL_BASIC.includes(s))    : [];

  return (
    <div className="ov-two-col">
      {/* ── Left column: Hero + block list ── */}
      <div className="ov-col-left">
        {heroBlock ? (
          <div className={`ov-hero${isBlitz ? ' ov-hero--blitz' : ''}`}>
            <div className="ov-hero-ring">
              <BlockCountdownRing
                daysRemaining={days}
                blockDuration={blockDuration}
                isUpcoming={isUpcoming}
                size={140}
                mode="countdown"
              />
              <div className="ov-block-counter">
                Block {blockIdx + 1} / {INTERNSHIP_SCHEDULE.length}
              </div>
            </div>

            <div className="ov-hero-info">
              <div className="ov-hero-meta">
                <span className={`ov-type-badge ov-type--${heroBlock.type}`}>{heroBlock.type}</span>
                {isBlitz && (
                  <>
                    <span className="ov-blitz-pill">{heroBlock.dailyTarget}+ Q/day</span>
                    <span className="ov-blitz-pill">{heroBlock.studyHours} hrs</span>
                  </>
                )}
              </div>
              <h2 className="ov-hero-title">{heroBlock.label}</h2>
              <div className="ov-hero-dates">{formatRange(heroBlock.start, heroBlock.end)}</div>
              {heroBlock.note && <div className="ov-hero-note">{heroBlock.note}</div>}

              <div className="ov-elapsed-wrap">
                <div className="ov-elapsed-bar">
                  <div className="ov-elapsed-fill" style={{ width: elapsedPct + '%' }} />
                </div>
                <span className="ov-elapsed-label">{Math.round(elapsedPct)}% elapsed</span>
              </div>

              <StudyPlaybook block={heroBlock} />

              {!isBlitz && primary.length > 0 && (
                <div className="ov-hero-subjects">
                  <div className="ov-subjects-label">Primary Focus</div>
                  {primary.map(s => <SubjectBar key={s} subject={s} state={state} />)}
                  {basic.length > 0 && (
                    <>
                      <div className="ov-subjects-label" style={{ marginTop: 10 }}>
                        {isSprint ? 'Basic Science Sprint' : 'Basic Science Double-Up'}
                      </div>
                      {basic.map(s => <SubjectBar key={s} subject={s} state={state} />)}
                    </>
                  )}
                  <RecommendedModules subjects={[...primary, ...basic]} />
                </div>
              )}

              {isBlitz && (
                <div className="ov-hero-subjects">
                  <div className="ov-subjects-label" style={{ marginBottom: 6 }}>Clinical Sciences</div>
                  {blitzClinical.map(s => <SubjectBar key={s} subject={s} state={state} />)}
                  <div className="ov-subjects-label" style={{ marginTop: 10, marginBottom: 6 }}>Basic Sciences</div>
                  {blitzBasic.map(s => <SubjectBar key={s} subject={s} state={state} />)}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="sched-complete">All study blocks complete — PLE incoming!</div>
        )}

        <div className="ov-section-title">All Blocks</div>
        {PHASE_GROUPS.map(group => {
          const blocks = INTERNSHIP_SCHEDULE.filter(b => group.types.includes(b.type));
          return <PhaseSection key={group.label} group={group} blocks={blocks} state={state} />;
        })}
      </div>

      {/* ── Right column: Coverage grid ── */}
      <div className="ov-col-right">
        <CoverageGrid state={state} />
      </div>
    </div>
  );
}
