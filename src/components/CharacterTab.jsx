// src/components/CharacterTab.jsx
// Shared RPG tab — 2-column laptop layout: stats/radar on left, badges/shop on right.

import { useState } from 'react';
import Hexagon from './Hexagon.jsx';
import ShopManager from './ShopManager.jsx';
import {
  computeLifetimeXP, levelFromXP, levelProgress,
  computeAxes, AXIS_ORDER, BADGES, clampPct, computeXPBreakdown
} from '../lib/rpg.logic.js';
import { todayKey } from '../lib/medi.logic.js';

function randUid() { return Math.random().toString(36).slice(2, 10); }

function ConfirmRedeem({ item, coins, onConfirm, onCancel }) {
  return (
    <div className="modal-backdrop" onClick={e => e.target === e.currentTarget && onCancel()}>
      <div className="modal-box" style={{ maxWidth: 400 }}>
        <div className="modal-header">
          <span className="modal-title">Redeem Reward</span>
          <button className="modal-close" onClick={onCancel}>✕</button>
        </div>
        <div className="modal-body">
          <p style={{ fontSize: '0.88rem', color: 'var(--text)', lineHeight: 1.6 }}>
            Redeem <strong>"{item.name}"</strong> for{' '}
            <strong style={{ color: 'var(--accent)' }}>◈ {item.cost.toLocaleString()}</strong> coins?
          </p>
          <p style={{ fontSize: '0.78rem', color: 'var(--muted)', lineHeight: 1.5 }}>
            You'll have <strong style={{ color: 'var(--text)' }}>◈ {(coins - item.cost).toLocaleString()}</strong> remaining.
            {item.desc && <><br />{item.desc}</>}
          </p>
        </div>
        <div className="modal-footer">
          <button className="pop-btn" onClick={onCancel}>Cancel</button>
          <button className="btn-accent" onClick={onConfirm}>Redeem</button>
        </div>
      </div>
    </div>
  );
}

export default function CharacterTab({ doc, commit }) {
  const [showShopMgr, setShowShopMgr] = useState(false);
  const [redeemItem, setRedeemItem] = useState(null);
  const [toast, setToast] = useState('');
  const [invExpanded, setInvExpanded] = useState(false);

  const xp = computeLifetimeXP(doc);
  const prog = levelProgress(xp);
  const axes = computeAxes(doc);
  const coins = doc.rpg.coins;
  const shop = doc.rpg.shop || [];
  const redemptions = doc.rpg.redemptions || [];
  const badgeState = doc.rpg.badgeState || {};
  const breakdown = computeXPBreakdown(doc);

  function showToast(msg) {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  }

  function handleRedeem(item) {
    if (coins < item.cost) return;
    setRedeemItem(item);
  }

  function confirmRedeem() {
    if (!redeemItem || coins < redeemItem.cost) return;
    const next = {
      ...doc,
      rpg: {
        ...doc.rpg,
        coins: doc.rpg.coins - redeemItem.cost,
        redemptions: [
          { id: redeemItem.id, name: redeemItem.name, cost: redeemItem.cost, desc: redeemItem.desc, date: todayKey(), uid: randUid() },
          ...doc.rpg.redemptions
        ]
      }
    };
    commit(next);
    setRedeemItem(null);
    showToast('Redeemed: ' + redeemItem.name);
  }

  function handleDeleteInventory(uid) {
    if (!window.confirm('Remove from inventory? Coins are NOT refunded.')) return;
    const next = {
      ...doc,
      rpg: { ...doc.rpg, redemptions: doc.rpg.redemptions.filter(r => r.uid !== uid) }
    };
    commit(next);
  }

  function handleSaveShop(newShop) {
    const next = { ...doc, rpg: { ...doc.rpg, shop: newShop } };
    commit(next);
  }

  const totalCoinsSpent = redemptions.reduce((a, r) => a + (r.cost || 0), 0);
  const unlockedCount = BADGES.filter(b => badgeState[b.id]).length;

  return (
    <div className="char-tab-root">

      {/* ── Left column ───────────────────────────────────────────────── */}
      <div className="char-left">

        {/* Header: level + XP + coins */}
        <div className="an-panel char-header-card">
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 }}>
            <div>
              <div style={{ fontSize: '2rem', fontWeight: 900, fontFamily: 'var(--font-mono)', color: 'var(--accent)', lineHeight: 1 }}>
                Lv {prog.level}
              </div>
              <div style={{ fontSize: '0.66rem', color: 'var(--muted)', marginTop: 3 }}>
                {xp.toLocaleString()} lifetime XP
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '1.35rem', fontWeight: 900, fontFamily: 'var(--font-mono)', color: 'var(--accent)' }}>
                ◈ {coins.toLocaleString()}
              </div>
              <div style={{ fontSize: '0.62rem', color: 'var(--muted)' }}>coins</div>
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.66rem', color: 'var(--muted)', marginBottom: 5 }}>
            <span>{prog.into.toLocaleString()} / {prog.span.toLocaleString()} XP</span>
            <span>{prog.toNext.toLocaleString()} to next</span>
          </div>
          <div style={{ height: 7, background: 'var(--line)', borderRadius: 4, overflow: 'hidden' }}>
            <div style={{ height: '100%', width: prog.pct + '%', background: 'linear-gradient(90deg, var(--accent-dim), var(--accent))', borderRadius: 4, transition: 'width 0.5s ease' }} />
          </div>
        </div>

        {/* Hexagon */}
        <div className="an-panel" style={{ padding: '14px 16px' }}>
          <div className="an-panel-title">Character Radar</div>
          <Hexagon doc={doc} size={200} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 7, marginTop: 10 }}>
            {AXIS_ORDER.map(name => (
              <div key={name}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
                  <span style={{ fontSize: '0.68rem', color: 'var(--muted)', fontWeight: 600 }}>{name}</span>
                  <span style={{ fontSize: '0.68rem', fontFamily: 'var(--font-mono)', color: 'var(--accent)' }}>{axes[name].toFixed(0)}</span>
                </div>
                <div style={{ height: 3, background: 'var(--line)', borderRadius: 2, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: axes[name] + '%', background: 'var(--accent)', borderRadius: 2, transition: 'width 0.4s ease' }} />
                </div>
              </div>
            ))}
          </div>
          <p style={{ fontSize: '0.62rem', color: 'var(--dim)', marginTop: 10, lineHeight: 1.4 }}>
            Computed live from your real data — no manual inputs.
          </p>
        </div>

        {/* XP Breakdown (compact) */}
        <div className="an-panel" style={{ padding: '12px 16px' }}>
          <div className="an-panel-title">XP Sources</div>
          {[
            { label: 'MEDI questions',          val: breakdown.A  },
            { label: 'KINETIX modules',         val: breakdown.A2 },
            { label: 'Completions & scores',    val: breakdown.B  },
            { label: 'Streak & readiness',      val: breakdown.C  },
            { label: 'Rotation exams',          val: breakdown.D  },
          ].map(row => (
            <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
              <span style={{ fontSize: '0.68rem', color: 'var(--muted)' }}>{row.label}</span>
              <span style={{ fontSize: '0.7rem', fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--text)' }}>{row.val.toLocaleString()}</span>
            </div>
          ))}
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0 0' }}>
            <span style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--text)' }}>Total</span>
            <span style={{ fontSize: '0.8rem', fontFamily: 'var(--font-mono)', fontWeight: 900, color: 'var(--accent)' }}>{xp.toLocaleString()}</span>
          </div>
        </div>

      </div>

      {/* ── Right column ──────────────────────────────────────────────── */}
      <div className="char-right">

        {/* Badges */}
        <div className="an-panel" style={{ padding: '14px 16px', marginBottom: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <span className="an-panel-title" style={{ marginBottom: 0 }}>Badges</span>
            <span style={{ fontSize: '0.68rem', color: 'var(--muted)', fontFamily: 'var(--font-mono)' }}>
              {unlockedCount} / {BADGES.length}
            </span>
          </div>
          <div className="char-badges-grid">
            {BADGES.map(b => {
              const unlocked = !!badgeState[b.id];
              return (
                <div key={b.id} className={`char-badge ${unlocked ? 'char-badge-unlocked' : ''}`}>
                  <div className="char-badge-name">
                    <span style={{ marginRight: 5, fontSize: '0.72rem' }}>{unlocked ? '✦' : '○'}</span>
                    {b.name}
                  </div>
                  <div className="char-badge-desc">{b.desc}</div>
                  {unlocked && badgeState[b.id] && (
                    <div className="char-badge-date">{badgeState[b.id]}</div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Shop */}
        <div className="an-panel" style={{ padding: '14px 16px', marginBottom: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <span className="an-panel-title" style={{ marginBottom: 0 }}>Shop</span>
            <button className="btn-secondary" style={{ fontSize: '0.7rem', padding: '4px 9px' }} onClick={() => setShowShopMgr(true)}>
              Edit shop
            </button>
          </div>
          <div className="char-shop-grid">
            {shop.map(item => {
              const canAfford = coins >= item.cost;
              return (
                <div key={item.id} className="char-shop-item">
                  <div style={{ fontWeight: 800, fontSize: '0.8rem', color: 'var(--text)', marginBottom: 3 }}>{item.name}</div>
                  {item.desc && <div style={{ fontSize: '0.67rem', color: 'var(--muted)', lineHeight: 1.4, flex: 1 }}>{item.desc}</div>}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginTop: 8 }}>
                    <span style={{ fontSize: '0.78rem', fontWeight: 800, fontFamily: 'var(--font-mono)', color: 'var(--accent)' }}>
                      ◈ {item.cost.toLocaleString()}
                    </span>
                    {canAfford ? (
                      <button className="btn-accent" style={{ fontSize: '0.68rem', padding: '4px 10px', minHeight: 28 }} onClick={() => handleRedeem(item)}>
                        Redeem
                      </button>
                    ) : (
                      <span style={{ fontSize: '0.62rem', color: 'var(--dim)', textAlign: 'right' }}>
                        Need ◈{(item.cost - coins).toLocaleString()}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Inventory — collapsible */}
        <div className="an-panel" style={{ padding: '12px 16px' }}>
          <button
            onClick={() => setInvExpanded(s => !s)}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
          >
            <span className="an-panel-title" style={{ marginBottom: 0 }}>Inventory</span>
            <span style={{ fontSize: '0.7rem', color: 'var(--muted)', display: 'flex', alignItems: 'center', gap: 8 }}>
              {redemptions.length > 0 && (
                <span style={{ fontFamily: 'var(--font-mono)' }}>
                  {redemptions.length} redeemed · ◈{totalCoinsSpent.toLocaleString()} spent
                </span>
              )}
              <span>{invExpanded ? '▲' : '▼'}</span>
            </span>
          </button>

          {!invExpanded && redemptions.length === 0 && (
            <div style={{ fontSize: '0.72rem', color: 'var(--dim)', marginTop: 8 }}>
              No rewards yet — earn coins and treat yourself.
            </div>
          )}

          {invExpanded && (
            <div style={{ marginTop: 10, display: 'flex', flexDirection: 'column', gap: 7 }}>
              {redemptions.length === 0 ? (
                <div className="empty-state" style={{ padding: '14px 0' }}>No rewards yet.</div>
              ) : (
                redemptions.map(r => (
                  <div key={r.uid} style={{
                    background: 'var(--panel-2)', border: '1px solid var(--line)',
                    borderRadius: 8, padding: '10px 12px',
                    display: 'flex', alignItems: 'center', gap: 10
                  }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 700, fontSize: '0.8rem', color: 'var(--text)' }}>{r.name}</div>
                      <div style={{ fontSize: '0.64rem', color: 'var(--muted)', marginTop: 2, fontFamily: 'var(--font-mono)' }}>
                        ◈ {r.cost.toLocaleString()} · {r.date}
                      </div>
                    </div>
                    <button className="case-del" onClick={() => handleDeleteInventory(r.uid)} title="Remove (no refund)">✕</button>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

      </div>

      {/* Modals */}
      {showShopMgr && (
        <ShopManager shop={shop} onSave={handleSaveShop} onClose={() => setShowShopMgr(false)} />
      )}
      {redeemItem && (
        <ConfirmRedeem item={redeemItem} coins={coins} onConfirm={confirmRedeem} onCancel={() => setRedeemItem(null)} />
      )}

      {/* Toast */}
      {toast && (
        <div style={{
          position: 'fixed', bottom: 28, left: '50%', transform: 'translateX(-50%)',
          background: 'var(--panel)', border: '1px solid var(--accent)',
          borderRadius: 10, padding: '10px 20px', zIndex: 500,
          fontSize: '0.82rem', color: 'var(--accent)', fontWeight: 700,
          boxShadow: '0 4px 20px rgba(0,0,0,0.4)'
        }}>
          {toast}
        </div>
      )}
    </div>
  );
}
