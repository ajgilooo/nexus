// src/components/ShopManager.jsx
// Modal for editing the shop list (add/edit/delete items).

import { useState } from 'react';

function randId() { return 'custom_' + Math.random().toString(36).slice(2, 9); }

export default function ShopManager({ shop, onSave, onClose }) {
  const [items, setItems] = useState(shop.map(i => ({ ...i })));

  function update(idx, field, val) {
    setItems(prev => prev.map((item, i) => i === idx ? { ...item, [field]: val } : item));
  }

  function remove(idx) {
    setItems(prev => prev.filter((_, i) => i !== idx));
  }

  function addItem() {
    setItems(prev => [...prev, { id: randId(), name: 'New reward', cost: 500, desc: '' }]);
  }

  function handleSave() {
    const valid = items.map(it => ({
      ...it,
      cost: Math.max(1, Math.round(Number(it.cost) || 1)),
      name: it.name.trim() || 'Reward',
    }));
    onSave(valid);
    onClose();
  }

  return (
    <div className="modal-backdrop" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-box" style={{ maxWidth: 560, maxHeight: '85vh', display: 'flex', flexDirection: 'column' }}>
        <div className="modal-header">
          <span className="modal-title">Edit Shop</span>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 10 }}>
          {items.map((item, idx) => (
            <div key={item.id} style={{ display: 'flex', gap: 8, alignItems: 'center', background: 'rgba(255,255,255,0.03)', borderRadius: 8, padding: '10px 12px', border: '1px solid var(--line)' }}>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 5 }}>
                <input
                  className="pop-input"
                  style={{ marginBottom: 0 }}
                  value={item.name}
                  onChange={e => update(idx, 'name', e.target.value)}
                  placeholder="Reward name"
                />
                <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                  <span style={{ fontSize: '0.7rem', color: 'var(--muted)', flexShrink: 0 }}>◈</span>
                  <input
                    className="pop-input"
                    type="number"
                    min="1"
                    style={{ width: 100, marginBottom: 0 }}
                    value={item.cost}
                    onChange={e => update(idx, 'cost', e.target.value)}
                    placeholder="Cost"
                  />
                  <input
                    className="pop-input"
                    style={{ flex: 1, marginBottom: 0 }}
                    value={item.desc}
                    onChange={e => update(idx, 'desc', e.target.value)}
                    placeholder="Description (optional)"
                  />
                </div>
              </div>
              <button
                onClick={() => remove(idx)}
                style={{ background: 'none', border: 'none', color: 'var(--muted)', cursor: 'pointer', fontSize: '0.9rem', padding: '4px 6px', borderRadius: 4, transition: 'color 0.15s' }}
                onMouseEnter={e => e.target.style.color = '#EF4444'}
                onMouseLeave={e => e.target.style.color = 'var(--muted)'}
              >✕</button>
            </div>
          ))}
          <button className="btn-secondary" onClick={addItem} style={{ alignSelf: 'flex-start' }}>+ Add reward</button>
        </div>
        <div className="modal-footer">
          <button className="pop-btn" onClick={onClose}>Cancel</button>
          <button className="btn-accent" onClick={handleSave}>Save shop</button>
        </div>
      </div>
    </div>
  );
}
