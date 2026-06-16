// src/components/XpStrip.jsx
// Top-bar XP strip: Lv badge + progress bar + coin count (§10.7.1).
// Tap opens a popover with inline hexagon, recent badges, and link to Character tab.

import { useState } from 'react';
import Hexagon from './Hexagon.jsx';
import { computeLifetimeXP, levelProgress, BADGES } from '../lib/rpg.logic.js';

export default function XpStrip({ doc, onOpenCharacter }) {
  const [open, setOpen] = useState(false);

  const xp = computeLifetimeXP(doc);
  const prog = levelProgress(xp);
  const coins = doc.rpg.coins;
  const badgeState = doc.rpg.badgeState || {};

  const recentBadges = BADGES
    .filter(b => badgeState[b.id])
    .sort((a, b) => (badgeState[b.id] > badgeState[a.id] ? 1 : -1))
    .slice(0, 3);

  return (
    <>
      <button
        className="xp-strip"
        onClick={() => setOpen(s => !s)}
        title={`${xp.toLocaleString()} XP · Level ${prog.level} · ${prog.toNext.toLocaleString()} to next`}
      >
        <span className="xp-lv">Lv {prog.level}</span>
        <span className="xp-bar-wrap" aria-hidden="true">
          <span className="xp-bar-fill" style={{ width: prog.pct + '%' }} />
        </span>
        <span className="xp-coins">◈ {coins.toLocaleString()}</span>
      </button>

      {open && (
        <div className="xp-popover-backdrop" onClick={e => e.target === e.currentTarget && setOpen(false)}>
          <div className="xp-popover">
            <div className="xp-pop-header">
              <div>
                <div style={{ fontSize: '1.3rem', fontWeight: 900, fontFamily: 'var(--font-mono)', color: 'var(--accent)' }}>Lv {prog.level}</div>
                <div style={{ fontSize: '0.68rem', color: 'var(--muted)', marginTop: 2 }}>
                  {prog.into.toLocaleString()} / {prog.span.toLocaleString()} XP · {prog.toNext.toLocaleString()} to next
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '1.1rem', fontWeight: 900, fontFamily: 'var(--font-mono)', color: 'var(--accent)' }}>◈ {coins.toLocaleString()}</div>
                <div style={{ fontSize: '0.66rem', color: 'var(--muted)', marginTop: 2 }}>coins</div>
              </div>
            </div>

            <div style={{ height: 6, background: 'var(--line)', borderRadius: 3, overflow: 'hidden', margin: '12px 0' }}>
              <div style={{ height: '100%', width: prog.pct + '%', background: 'linear-gradient(90deg, var(--accent-dim), var(--accent))', borderRadius: 3, transition: 'width 0.5s ease' }} />
            </div>

            <Hexagon doc={doc} size={160} />

            {recentBadges.length > 0 && (
              <div style={{ marginTop: 12 }}>
                <div style={{ fontSize: '0.62rem', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 700, marginBottom: 7 }}>Recent Badges</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                  {recentBadges.map(b => (
                    <div key={b.id} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ color: 'var(--accent)', fontSize: '0.78rem' }}>✦</span>
                      <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text)' }}>{b.name}</span>
                      <span style={{ fontSize: '0.64rem', color: 'var(--muted)', marginLeft: 'auto', fontFamily: 'var(--font-mono)' }}>{badgeState[b.id]}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <button
              className="btn-accent"
              style={{ marginTop: 14, width: '100%', fontSize: '0.78rem' }}
              onClick={() => { setOpen(false); onOpenCharacter(); }}
            >
              Open Character
            </button>
          </div>
        </div>
      )}
    </>
  );
}
