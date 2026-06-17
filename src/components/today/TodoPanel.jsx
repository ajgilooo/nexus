// src/components/today/TodoPanel.jsx
// Todoist-style to-do list. Items stored in doc.todos.
// Priority: high (P1 red), normal (P2 amber), low (P3 blue).

import { useState, useRef, useEffect } from 'react';

const PRIORITY_META = {
  high:   { label: 'P1', color: 'var(--race)', dot: '●' },
  normal: { label: 'P2', color: 'var(--qual)', dot: '●' },
  low:    { label: 'P3', color: 'var(--swim)', dot: '●' },
};
const PRI_ORDER = { high: 0, normal: 1, low: 2 };

function randUid() { return Math.random().toString(36).slice(2, 10); }
function todayISO() { return new Date().toISOString().slice(0, 10); }

function sortTodos(todos) {
  return [...todos].sort((a, b) => {
    const pd = (PRI_ORDER[a.priority] || 1) - (PRI_ORDER[b.priority] || 1);
    if (pd !== 0) return pd;
    return (a.createdAt || '').localeCompare(b.createdAt || '');
  });
}

function TodoItem({ item, onToggle, onDelete, onEdit }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(item.text);
  const inputRef = useRef();
  const pm = PRIORITY_META[item.priority] || PRIORITY_META.normal;

  useEffect(() => { if (editing) inputRef.current?.focus(); }, [editing]);

  function finishEdit() {
    const trimmed = draft.trim();
    if (trimmed && trimmed !== item.text) onEdit(item.uid, { text: trimmed });
    else setDraft(item.text);
    setEditing(false);
  }

  return (
    <div className={`todo-item ${item.done ? 'todo-item-done' : ''}`}>
      {/* Priority dot */}
      <span className="todo-pri-dot" style={{ color: pm.color }} title={`Priority ${pm.label}`}>
        {pm.dot}
      </span>

      {/* Checkbox */}
      <button
        className={`todo-check ${item.done ? 'todo-check-done' : ''}`}
        onClick={() => onToggle(item.uid)}
        aria-label="Toggle complete"
      >
        {item.done ? '✓' : ''}
      </button>

      {/* Text */}
      {editing ? (
        <input
          ref={inputRef}
          className="todo-edit-input"
          value={draft}
          onChange={e => setDraft(e.target.value)}
          onBlur={finishEdit}
          onKeyDown={e => {
            if (e.key === 'Enter') finishEdit();
            if (e.key === 'Escape') { setDraft(item.text); setEditing(false); }
          }}
        />
      ) : (
        <span
          className="todo-text"
          onDoubleClick={() => !item.done && setEditing(true)}
          title="Double-click to edit"
        >
          {item.text}
        </span>
      )}

      {/* Priority toggle (cycle on click) */}
      <button
        className="todo-pri-badge"
        style={{ color: pm.color, borderColor: pm.color + '44' }}
        onClick={() => {
          const cycle = { high: 'normal', normal: 'low', low: 'high' };
          onEdit(item.uid, { priority: cycle[item.priority] || 'normal' });
        }}
        title="Click to cycle priority"
      >
        {pm.label}
      </button>

      {/* Delete */}
      <button className="todo-del" onClick={() => onDelete(item.uid)} title="Delete">✕</button>
    </div>
  );
}

export default function TodoPanel({ doc, commit }) {
  const todos = doc.todos || [];
  const [filter, setFilter] = useState('active'); // 'all' | 'active' | 'done'
  const [addText, setAddText] = useState('');
  const [addPri, setAddPri] = useState('normal');
  const addRef = useRef();

  function saveTodos(next) {
    commit({ ...doc, todos: next });
  }

  function handleAdd() {
    const text = addText.trim();
    if (!text) return;
    const item = {
      uid: randUid(),
      text,
      done: false,
      priority: addPri,
      tags: [],
      dueDate: null,
      createdAt: todayISO(),
      completedAt: null,
    };
    saveTodos([item, ...todos]);
    setAddText('');
    addRef.current?.focus();
  }

  function handleToggle(uid) {
    saveTodos(todos.map(t =>
      t.uid === uid
        ? { ...t, done: !t.done, completedAt: !t.done ? todayISO() : null }
        : t
    ));
  }

  function handleDelete(uid) {
    saveTodos(todos.filter(t => t.uid !== uid));
  }

  function handleEdit(uid, patch) {
    saveTodos(todos.map(t => t.uid === uid ? { ...t, ...patch } : t));
  }

  const activeTodos = sortTodos(todos.filter(t => !t.done));
  const doneTodos   = sortTodos(todos.filter(t => t.done));

  const visible =
    filter === 'active' ? activeTodos :
    filter === 'done'   ? doneTodos   :
    [...activeTodos, ...doneTodos];

  const highCount = activeTodos.filter(t => t.priority === 'high').length;

  return (
    <div className="todo-panel">
      {/* Header */}
      <div className="todo-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span className="todo-title">To-Do</span>
          {highCount > 0 && (
            <span className="todo-high-badge">{highCount} P1</span>
          )}
        </div>
        <div className="todo-filters">
          {['active', 'all', 'done'].map(f => (
            <button
              key={f}
              className={`todo-filter-btn ${filter === f ? 'active' : ''}`}
              onClick={() => setFilter(f)}
            >
              {f === 'active' ? `Active${activeTodos.length ? ` (${activeTodos.length})` : ''}` : f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Add row */}
      <div className="todo-add-row">
        {/* Priority picker */}
        <button
          className="todo-add-pri"
          style={{ color: PRIORITY_META[addPri].color }}
          onClick={() => {
            const cycle = { high: 'normal', normal: 'low', low: 'high' };
            setAddPri(p => cycle[p] || 'normal');
          }}
          title={`Priority: ${addPri} — click to cycle`}
        >
          {PRIORITY_META[addPri].dot} {PRIORITY_META[addPri].label}
        </button>

        <input
          ref={addRef}
          className="todo-add-input"
          placeholder="Add a task… (Enter to add)"
          value={addText}
          onChange={e => setAddText(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleAdd()}
        />

        <button
          className="todo-add-submit"
          onClick={handleAdd}
          disabled={!addText.trim()}
        >
          +
        </button>
      </div>

      {/* List */}
      <div className="todo-list">
        {visible.length === 0 ? (
          <div className="todo-empty">
            {filter === 'done' ? 'No completed tasks yet.' :
             filter === 'active' ? 'All clear — add something above.' :
             'No tasks yet.'}
          </div>
        ) : (
          visible.map(item => (
            <TodoItem
              key={item.uid}
              item={item}
              onToggle={handleToggle}
              onDelete={handleDelete}
              onEdit={handleEdit}
            />
          ))
        )}
      </div>
    </div>
  );
}
