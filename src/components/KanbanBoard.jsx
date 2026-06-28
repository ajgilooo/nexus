// src/components/KanbanBoard.jsx
// Week planner kanban: drag Kinetix sessions + Medi study blocks onto day columns,
// then push the whole week to Google Calendar as timed events.

import { useState, useEffect } from 'react';
import { W } from '../lib/kinetix.data.js';
import { isConnected, syncKanbanWeek } from '../lib/gcal.js';

// ─── Date helpers ─────────────────────────────────────────────────────────────
function addDays(ds, n) {
  const d = new Date(ds + 'T00:00:00');
  d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
}
function getMondayStr(ds) {
  const d = new Date(ds + 'T00:00:00');
  const day = d.getDay();
  d.setDate(d.getDate() + (day === 0 ? -6 : 1 - day));
  return d.toISOString().slice(0, 10);
}
function weekDays(mon) {
  return Array.from({ length: 7 }, (_, i) => addDays(mon, i));
}
function todayStr() {
  return new Date().toISOString().slice(0, 10);
}
function fmtWeekLabel(mon) {
  const end = addDays(mon, 6);
  const fmt = ds => new Date(ds + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  const yr  = new Date(end + 'T00:00:00').getFullYear();
  return `${fmt(mon)} – ${fmt(end)}, ${yr}`;
}
function fmtDayHeader(ds) {
  const d = new Date(ds + 'T00:00:00');
  return ['SUN','MON','TUE','WED','THU','FRI','SAT'][d.getDay()] + ' ' + d.getDate();
}

// ─── Card config ──────────────────────────────────────────────────────────────
const KX_CFG = {
  q: { title:'Quality session', dur:90,  hr:5,  cid:'7',  col:'#38BDF8' },
  l: { title:'Long run',        dur:120, hr:5,  cid:'7',  col:'#60A5FA' },
  e: { title:'Easy vol',        dur:60,  hr:6,  cid:'2',  col:'#6EE7B7' },
  s: { title:'Strides',         dur:35,  hr:6,  cid:'2',  col:'#86EFAC' },
  g: { title:'Strength',        dur:60,  hr:7,  cid:'3',  col:'#C084FC' },
  w: { title:'Swim',            dur:60,  hr:5,  cid:'1',  col:'#A78BFA' },
  b: { title:'Boulder',         dur:90,  hr:16, cid:'3',  col:'#E879F9' },
  p: { title:'Steps / hike',   dur:45,  hr:6,  cid:'2',  col:'#86EFAC' },
  t: { title:'Key session',     dur:90,  hr:5,  cid:'10', col:'#F87171' },
  r: { title:'Recovery',        dur:30,  hr:7,  cid:'11', col:'#94A3B8' },
};
const MEDI_CFG = {
  pre:  { title:'Study · PRE',  desc:'45 fresh Qs (7am–7pm)',     dur:120, hr:8,  cid:'7',  col:'#60A5FA' },
  duty: { title:'Study · DUTY', desc:'25 short-set Qs (overnight)', dur:60, hr:20, cid:'10', col:'#F87171' },
  post: { title:'Study · POST', desc:'50 fresh + 30 resurface Qs', dur:180, hr:14, cid:'9',  col:'#34D399' },
  off:  { title:'Study · OFF',  desc:'20 fresh + 10 resurface Qs', dur:90,  hr:8,  cid:'11', col:'#94A3B8' },
};

function uid() { return Math.random().toString(36).slice(2, 8); }

function generateBoard(weekStr, dutyRoster) {
  const days = weekDays(weekStr);

  // Kinetix cards from W[] for this Monday
  const kxIdx = W.findIndex(w => w.d === weekStr);
  const kxCards = kxIdx >= 0
    ? (W[kxIdx].mods || []).map((mod, i) => {
        const cfg = KX_CFG[mod.t] || { title: mod.t, dur: 60, hr: 6, cid: '11', col: '#94A3B8' };
        return {
          id: `kx_${weekStr}_${i}_${uid()}`,
          source: 'kinetix', tag: mod.t,
          title: cfg.title,
          desc: mod.tx.slice(0, 100),
          dur: cfg.dur, hr: cfg.hr, cid: cfg.cid, col: cfg.col,
        };
      })
    : [];

  // Medi duty cards for each day of this week
  const mediCards = days.flatMap(ds => {
    const mode = dutyRoster[ds];
    if (!mode || !MEDI_CFG[mode]) return [];
    const cfg = MEDI_CFG[mode];
    const dn  = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][new Date(ds + 'T00:00:00').getDay()];
    return [{
      id: `medi_${ds}_${uid()}`,
      source: 'medi', tag: mode,
      title: cfg.title,
      desc: `${dn} · ${cfg.desc}`,
      dur: cfg.dur, hr: cfg.hr, cid: cfg.cid, col: cfg.col,
    }];
  });

  return {
    palette: [...kxCards, ...mediCards],
    days: Object.fromEntries(days.map(d => [d, []])),
  };
}

// ─── Sub-components ───────────────────────────────────────────────────────────
function KbCard({ card, colId, isDragging, isInsertBefore, onDragStart, onDragEnd, onCardDragOver }) {
  return (
    <div
      className={`kb-card${isDragging ? ' kb-dragging' : ''}${isInsertBefore ? ' kb-insert-before' : ''}`}
      style={{ '--kc': card.col }}
      draggable
      onDragStart={e => onDragStart(e, card.id, colId)}
      onDragEnd={onDragEnd}
      onDragOver={e => onCardDragOver(e, card.id, colId)}
    >
      <div className="kb-card-bar" />
      <div className="kb-card-body">
        <div className="kb-card-title">{card.title}</div>
        {card.desc && <div className="kb-card-desc">{card.desc}</div>}
        <div className="kb-card-foot">
          <span className={`kb-src kb-src-${card.source}`}>{card.source}</span>
          <span className="kb-dur">{card.dur}m</span>
        </div>
      </div>
    </div>
  );
}

function KbCol({ colId, header, isToday, isPalette, cards, isOver, dragging, insertBefore,
                  onColDragOver, onColDragLeave, onColDrop, onCardDragStart, onDragEnd, onCardDragOver }) {
  return (
    <div
      className={`kb-col${isPalette ? ' kb-palette' : ''}${isOver ? ' kb-col-over' : ''}${isToday ? ' kb-col-today' : ''}`}
      onDragOver={e => onColDragOver(e, colId)}
      onDragLeave={() => onColDragLeave(colId)}
      onDrop={e => onColDrop(e, colId)}
    >
      <div className="kb-col-header">{header}</div>
      <div className="kb-col-body">
        {cards.map(card => (
          <KbCard
            key={card.id}
            card={card}
            colId={colId}
            isDragging={dragging?.cardId === card.id}
            isInsertBefore={insertBefore === card.id}
            onDragStart={onCardDragStart}
            onDragEnd={onDragEnd}
            onCardDragOver={onCardDragOver}
          />
        ))}
        {cards.length === 0 && <div className="kb-empty-hint">drop here</div>}
      </div>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function KanbanBoard({ doc, commit }) {
  const today = todayStr();
  const [weekStr, setWeekStr] = useState(() => getMondayStr(today));
  const [dragging,     setDragging]     = useState(null);  // { cardId, fromCol }
  const [dropTarget,   setDropTarget]   = useState(null);  // colId
  const [insertBefore, setInsertBefore] = useState(null);  // cardId to insert before
  const [pushStatus,   setPushStatus]   = useState('idle');
  const [pushMsg,      setPushMsg]      = useState('');

  const boards = doc.kanban?.boards || {};
  const board  = boards[weekStr];

  useEffect(() => {
    if (!boards[weekStr]) {
      const roster = doc.medi?.state?.dutyRoster || {};
      const nb = generateBoard(weekStr, roster);
      commit({ ...doc, kanban: { boards: { ...boards, [weekStr]: nb } } });
    }
  }, [weekStr]); // eslint-disable-line

  const days = weekDays(weekStr);

  function commitBoard(nb) {
    commit({ ...doc, kanban: { boards: { ...boards, [weekStr]: nb } } });
  }

  function moveCard(cardId, fromCol, toCol, beforeId) {
    if (!board) return;
    const cols = {
      palette: [...board.palette],
      ...Object.fromEntries(days.map(d => [d, [...(board.days[d] || [])]])),
    };
    const card = cols[fromCol]?.find(c => c.id === cardId);
    if (!card) return;
    cols[fromCol] = cols[fromCol].filter(c => c.id !== cardId);
    if (fromCol !== toCol) cols[toCol] = (cols[toCol] || []).filter(c => c.id !== cardId);
    const tgt = cols[toCol] || [];
    const idx = beforeId ? tgt.findIndex(c => c.id === beforeId) : -1;
    if (idx >= 0) tgt.splice(idx, 0, card);
    else tgt.push(card);
    commitBoard({ palette: cols.palette, days: Object.fromEntries(days.map(d => [d, cols[d] || []])) });
  }

  function resetWeek() {
    if (!window.confirm('Reset this week — put all cards back to the palette?')) return;
    commitBoard(generateBoard(weekStr, doc.medi?.state?.dutyRoster || {}));
  }

  async function handlePush() {
    if (!isConnected()) {
      setPushStatus('error');
      setPushMsg('Connect Google Calendar first — open Settings.');
      return;
    }
    if (!board) return;
    setPushStatus('pushing');
    setPushMsg('Starting…');
    try {
      const { deleted, pushed } = await syncKanbanWeek(weekStr, board.days, m => setPushMsg(m));
      setPushStatus('done');
      setPushMsg(`Done — ${pushed} events pushed, ${deleted} cleared.`);
    } catch (e) {
      setPushStatus('error');
      setPushMsg(e.message);
    }
  }

  // ── Drag handlers ────────────────────────────────────────────────────────
  function onCardDragStart(e, cardId, fromCol) {
    setDragging({ cardId, fromCol });
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', cardId);
  }
  function onDragEnd() {
    setDragging(null);
    setDropTarget(null);
    setInsertBefore(null);
  }
  function onColDragOver(e, colId) {
    e.preventDefault();
    setDropTarget(colId);
    setInsertBefore(null);
  }
  function onCardDragOver(e, cardId, colId) {
    e.preventDefault();
    e.stopPropagation();
    setDropTarget(colId);
    setInsertBefore(cardId);
  }
  function onColDragLeave(colId) {
    if (dropTarget === colId) setDropTarget(null);
  }
  function onColDrop(e, colId) {
    e.preventDefault();
    if (dragging) moveCard(dragging.cardId, dragging.fromCol, colId, insertBefore);
    setDragging(null);
    setDropTarget(null);
    setInsertBefore(null);
  }

  if (!board) {
    return (
      <div className="kb-view">
        <div className="kb-loading">Generating week…</div>
      </div>
    );
  }

  const colProps = { dragging, insertBefore, onColDragOver, onColDragLeave, onColDrop, onCardDragStart, onDragEnd, onCardDragOver };

  return (
    <div className="kb-view">
      {/* Header */}
      <div className="kb-header">
        <div className="kb-nav">
          <button className="kb-nav-btn" onClick={() => setWeekStr(addDays(weekStr, -7))}>‹</button>
          <span className="kb-week-label">{fmtWeekLabel(weekStr)}</span>
          <button className="kb-nav-btn" onClick={() => setWeekStr(addDays(weekStr, 7))}>›</button>
        </div>
        <div className="kb-header-right">
          <span className="kb-palette-count">{board.palette.length} in palette</span>
          <button className="kb-reset-btn" onClick={resetWeek}>↺ Reset</button>
          <button
            className={`kb-push-btn${pushStatus === 'pushing' ? ' kb-pushing' : ''}`}
            onClick={handlePush}
            disabled={pushStatus === 'pushing'}
          >
            {pushStatus === 'pushing' ? 'Pushing…' : '↑ Push to Calendar'}
          </button>
        </div>
      </div>

      {pushMsg && (
        <div className={`kb-push-msg kb-push-${pushStatus}`}>{pushMsg}</div>
      )}

      {/* Board */}
      <div className="kb-board">
        <KbCol colId="palette" header="PALETTE" isPalette isToday={false}
          cards={board.palette} isOver={dropTarget === 'palette'} {...colProps} />

        {days.map(ds => (
          <KbCol key={ds} colId={ds} header={fmtDayHeader(ds)}
            isPalette={false} isToday={ds === today}
            cards={board.days[ds] || []} isOver={dropTarget === ds} {...colProps} />
        ))}
      </div>
    </div>
  );
}
