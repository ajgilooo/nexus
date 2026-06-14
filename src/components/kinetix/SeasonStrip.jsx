// src/components/kinetix/SeasonStrip.jsx
import { W, PH, RACE_INDICES } from '../../lib/kinetix.data.js';
import { currentWeekIdx } from '../../lib/kinetix.logic.js';

export default function SeasonStrip({ doc }) {
  const nowIdx = currentWeekIdx();

  const phColors = [
    'var(--ez)', 'var(--ez)', 'var(--qual)', 'var(--race)', 'var(--ez)',
    'var(--race)', 'var(--swim)', 'var(--ez)', 'var(--bld)', 'var(--bld)',
    'var(--qual)', 'var(--race)', 'var(--swim)'
  ];

  const checks = doc.kinetix.checks || {};

  function weekDone(wi) {
    const mods = W[wi].mods;
    return mods.every((_, j) => checks[`${wi}-${j}`]);
  }

  function weekPct(wi) {
    const mods = W[wi].mods;
    if (!mods.length) return 0;
    const done = mods.filter((_, j) => checks[`${wi}-${j}`]).length;
    return done / mods.length;
  }

  const nowPhase = W[nowIdx] ? PH[W[nowIdx].ph] : null;

  return (
    <div className="season-strip-wrap">
      <div className="season-bars">
        {W.map((w, i) => {
          const phColor = phColors[w.ph] || 'var(--ez)';
          const pct = weekPct(i);
          const isPast = i < nowIdx;
          const isNow = i === nowIdx;
          const isRace = RACE_INDICES.includes(i);
          const kmMid = (w.km[0] + w.km[1]) / 2;
          const maxKm = 72;
          const barH = Math.max(8, Math.round(kmMid / maxKm * 56));

          return (
            <div
              key={i}
              className={`s-bar ${isNow ? 'now' : ''} ${isRace ? 'race' : ''}`}
              title={`Wk ${i + 1} · ${w.km[0]}–${w.km[1]} km · ${PH[w.ph].n}`}
              style={{
                height: barH + 'px',
                background: isPast
                  ? (pct === 1 ? 'rgba(45,212,167,0.5)' : 'rgba(255,255,255,0.12)')
                  : isNow
                    ? phColor
                    : `${phColor.replace(')', ',0.35)').replace('var(', 'var(')}`,
              }}
            />
          );
        })}
      </div>

      <div className="strip-summary">
        {nowIdx >= 0 && nowIdx < W.length
          ? `Week ${nowIdx + 1} of 52 · ${nowPhase?.n || 'Loading…'}`
          : nowIdx < 0 ? 'Starting Jun 15 2026' : 'All 52 weeks complete!'
        }
      </div>

      <div className="strip-legend">
        {[
          { color: 'var(--ez)',   label: 'Easy / Recovery' },
          { color: 'var(--qual)', label: 'Quality build'   },
          { color: 'var(--race)', label: 'Race-specific'   },
          { color: 'var(--bld)',  label: 'Boulder peak'    },
          { color: 'var(--swim)', label: 'Taper'           },
        ].map(l => (
          <div key={l.label} className="leg-item">
            <div className="leg-dot" style={{ background: l.color }} />
            {l.label}
          </div>
        ))}
        <div className="leg-item">
          <span style={{ color: 'var(--race)', fontSize: '8px' }}>▲</span>
          Race day
        </div>
      </div>
    </div>
  );
}
