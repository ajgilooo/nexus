// src/components/today/DutyBanner.jsx
// Duty status switcher — sits at top of TodayWorld.
// Modes: pre-duty (7am–7pm study day before shift), duty (7pm–7am active shift),
// post-duty (7am–7am full rest after night shift).

const MODES = {
  'pre-duty': {
    icon: '☀',
    label: 'PRE-DUTY',
    color: 'var(--qual)',
    bg: 'rgba(245,165,36,0.09)',
    border: 'rgba(245,165,36,0.22)',
    hint: 'Shift tonight at 7 pm · Study + prep window now',
    focus: ['Heavy PLE study', 'Log any morning runs', 'Pack overnight bag', 'Plan meals'],
  },
  'duty': {
    icon: '⏺',
    label: 'ON DUTY',
    color: 'var(--race)',
    bg: 'rgba(255,107,74,0.09)',
    border: 'rgba(255,107,74,0.22)',
    hint: 'Active shift 7 pm → 7 am · Conserve cognitive load',
    focus: ['Log ward cases', 'Quick card review if quiet', 'Stay hydrated', 'Rest when possible'],
  },
  'post-duty': {
    icon: '◎',
    label: 'POST-DUTY',
    color: 'var(--swim)',
    bg: 'rgba(56,189,248,0.09)',
    border: 'rgba(56,189,248,0.22)',
    hint: 'Recovery until 7 am tomorrow · Sleep > everything',
    focus: ['Sleep priority', 'Light walk OK', 'No heavy study', 'No intense training'],
  },
};

const ORDER = ['pre-duty', 'duty', 'post-duty'];

export default function DutyBanner({ doc, commit }) {
  const duty = doc.duty || { mode: null, setAt: null };
  const cfg = MODES[duty.mode];

  function setMode(mode) {
    const next = {
      ...doc,
      duty: mode === duty.mode
        ? { mode: null, setAt: null }
        : { mode, setAt: new Date().toISOString() }
    };
    commit(next);
  }

  return (
    <div
      className="duty-banner"
      style={cfg ? { background: cfg.bg, borderColor: cfg.border } : {}}
    >
      {/* Status pill + switcher row */}
      <div className="duty-top-row">
        {cfg ? (
          <div className="duty-active-pill" style={{ color: cfg.color, borderColor: cfg.border }}>
            <span className="duty-icon">{cfg.icon}</span>
            <span className="duty-mode-label">{cfg.label}</span>
            {duty.setAt && (
              <span className="duty-set-time">
                set {new Date(duty.setAt).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}
              </span>
            )}
          </div>
        ) : (
          <div className="duty-inactive-label">Set duty status</div>
        )}

        <div className="duty-btn-group">
          {ORDER.map(m => (
            <button
              key={m}
              className={`duty-btn ${duty.mode === m ? 'duty-btn-active' : ''}`}
              style={duty.mode === m ? {
                color: MODES[m].color,
                borderColor: MODES[m].border,
                background: MODES[m].bg,
              } : {}}
              onClick={() => setMode(m)}
            >
              {MODES[m].icon} {MODES[m].label}
            </button>
          ))}
          {duty.mode && (
            <button className="duty-btn duty-btn-clear" onClick={() => setMode(duty.mode)}>
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Context strip */}
      {cfg && (
        <div className="duty-context-row" style={{ borderColor: cfg.border }}>
          <span className="duty-hint" style={{ color: cfg.color }}>{cfg.hint}</span>
          <div className="duty-focus-chips">
            {cfg.focus.map(f => (
              <span key={f} className="duty-chip" style={{ color: cfg.color, borderColor: cfg.border }}>{f}</span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
