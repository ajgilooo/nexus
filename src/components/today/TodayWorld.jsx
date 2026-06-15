// src/components/today/TodayWorld.jsx
import { buildActionMatrix, buildYearCalendar, PH_COLOR_VARS } from '../../lib/today.logic.js';

const TONE_META = {
  critical: { dot: 'var(--race)',  label: 'tone-critical' },
  warn:     { dot: 'var(--qual)',  label: 'tone-warn' },
  go:       { dot: 'var(--accent)',label: 'tone-go' },
  info:     { dot: 'var(--swim)',  label: 'tone-info' },
};

const WORLD_BADGE = {
  medi:    { label: 'STUDY',    cls: 'wb-medi' },
  kinetix: { label: 'TRAINING', cls: 'wb-kx' },
};

// ── Hero stat ───────────────────────────────────────────────────────────────
function HeroStats({ meta }) {
  const greeting = (() => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 18) return 'Good afternoon';
    return 'Good evening';
  })();
  const dateStr = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

  return (
    <div className="today-hero">
      <div className="today-hero-greeting">
        <div className="today-greeting-text">{greeting}, Joseph</div>
        <div className="today-date">{dateStr}</div>
      </div>
      <div className="today-hero-stats">
        <div className="hero-stat">
          <div className="hero-stat-value">{meta.days}</div>
          <div className="hero-stat-label">days to PLE</div>
        </div>
        <div className="hero-stat-divider" />
        <div className="hero-stat">
          <div className="hero-stat-value" style={{ color: meta.readiness >= 80 ? 'var(--accent)' : meta.readiness >= 60 ? 'var(--qual)' : 'var(--race)' }}>
            {meta.readiness.toFixed(0)}
          </div>
          <div className="hero-stat-label">readiness</div>
        </div>
        <div className="hero-stat-divider" />
        <div className="hero-stat">
          <div className="hero-stat-value">{meta.streak}<span className="hero-stat-unit">d</span></div>
          <div className="hero-stat-label">streak</div>
        </div>
        <div className="hero-stat-divider" />
        <div className="hero-stat">
          <div className="hero-stat-value">{meta.pct.toFixed(0)}<span className="hero-stat-unit">%</span></div>
          <div className="hero-stat-label">QBank</div>
        </div>
      </div>
    </div>
  );
}

// ── Action card ──────────────────────────────────────────────────────────────
function ActionCard({ action, onNavigate, rank }) {
  const tone = TONE_META[action.tone] || TONE_META.info;
  const badge = WORLD_BADGE[action.world];

  return (
    <button
      className={`action-card ${tone.label}`}
      onClick={() => onNavigate(action.ctaWorld, action.ctaTab)}
    >
      <div className="action-rail" style={{ background: tone.dot }} />
      <div className="action-main">
        <div className="action-top">
          <span className={`action-world-badge ${badge.cls}`}>{badge.label}</span>
          <span className="action-urgency" style={{ color: tone.dot }}>{action.urgency}</span>
        </div>
        <div className="action-title">{action.title}</div>
        <div className="action-detail">{action.detail}</div>
        {typeof action.progress === 'number' && (
          <div className="action-progress-wrap">
            <div className="action-progress-fill" style={{ width: Math.min(100, action.progress * 100) + '%', background: tone.dot }} />
          </div>
        )}
      </div>
      <div className="action-cta">
        <span>{action.cta}</span>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
      </div>
    </button>
  );
}

// ── Year calendar ─────────────────────────────────────────────────────────────
function YearCalendar({ cal, onNavigate }) {
  const studyColors = ['transparent', 'rgba(16,185,129,0.25)', 'rgba(16,185,129,0.5)', 'rgba(16,185,129,0.75)', 'var(--accent)'];

  // Build month label positions
  const monthMarkers = [];
  let lastMonth = '';
  cal.weeks.forEach((w, i) => {
    if (w.monthLabel !== lastMonth) {
      monthMarkers.push({ idx: i, label: w.monthLabel });
      lastMonth = w.monthLabel;
    }
  });

  return (
    <div className="year-cal">
      <div className="year-cal-head">
        <div className="year-cal-title">Season Calendar</div>
        <div className="year-cal-legend">
          <span className="ycl-item"><span className="ycl-sq" style={{ background: 'var(--accent)' }} /> study</span>
          <span className="ycl-item"><span className="ycl-bar" style={{ background: 'var(--qual)' }} /> training load</span>
          <span className="ycl-item"><span className="ycl-tri">▲</span> race</span>
        </div>
      </div>

      <div className="year-cal-scroll">
        <div className="year-cal-grid">
          {/* Month labels */}
          <div className="ycal-months">
            {cal.weeks.map((w, i) => {
              const marker = monthMarkers.find(m => m.idx === i);
              return <div key={i} className="ycal-month-cell">{marker ? marker.label : ''}</div>;
            })}
          </div>

          {/* Training load bars (top) */}
          <div className="ycal-load-row">
            {cal.weeks.map((w, i) => {
              const h = Math.max(3, Math.round(w.kmRange[1] / cal.maxKm * 26));
              const color = PH_COLOR_VARS[w.phaseIdx] || 'var(--ez)';
              return (
                <div
                  key={i}
                  className={`ycal-load-bar ${w.isCurrent ? 'current' : ''}`}
                  title={`W${w.wIdx + 1} · ${w.kmRange[0]}–${w.kmRange[1]} km · ${w.phaseName}`}
                  onClick={() => onNavigate('kinetix', 'plan')}
                  style={{ height: '28px', display: 'flex', alignItems: 'flex-end' }}
                >
                  <div style={{ width: '100%', height: h + 'px', background: color, borderRadius: '2px 2px 0 0', opacity: w.isCurrent ? 1 : 0.55 }} />
                  {w.isRace && <span className="ycal-race">▲</span>}
                </div>
              );
            })}
          </div>

          {/* Study heatmap (7 rows = days) */}
          <div className="ycal-study">
            {[0, 1, 2, 3, 4, 5, 6].map(dow => (
              <div key={dow} className="ycal-study-row">
                {cal.weeks.map((w, i) => {
                  const cell = w.cells[dow];
                  const bg = cell.isFuture ? 'rgba(255,255,255,0.02)' : studyColors[cell.studyLvl];
                  return (
                    <div
                      key={i}
                      className={`ycal-day ${cell.isToday ? 'today' : ''}`}
                      title={`${cell.date.toLocaleDateString()} · ${cell.studyQ} Qs`}
                      style={{ background: bg }}
                    />
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="year-cal-foot">
        {cal.totalStudyDays} active study days · {cal.weeks.length} training weeks
      </div>
    </div>
  );
}

// ── Today World ───────────────────────────────────────────────────────────────
export default function TodayWorld({ doc, onNavigate }) {
  const { actions, meta } = buildActionMatrix(doc);
  const cal = buildYearCalendar(doc);

  const topActions = actions.slice(0, 6);

  return (
    <div className="today-world">
      <div className="today-inner">
        <HeroStats meta={meta} />

        <div className="today-section-label">
          <span>Do this next</span>
          <span className="today-section-sub">ranked across study + training</span>
        </div>

        <div className="action-list">
          {topActions.length === 0 && (
            <div className="empty-state">Nothing pressing right now. Open a world to dig in.</div>
          )}
          {topActions.map((a, i) => (
            <ActionCard key={a.id} action={a} onNavigate={onNavigate} rank={i} />
          ))}
        </div>

        <YearCalendar cal={cal} onNavigate={onNavigate} />
      </div>
    </div>
  );
}
