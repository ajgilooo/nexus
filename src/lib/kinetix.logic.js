// src/lib/kinetix.logic.js
// All compute functions for KINETIX — verbatim from spec §5.3/5.4/5.6

import { W } from './kinetix.data.js';

export const RIEGEL = 1.06;

export function predict(bm, dist) {
  return bm.t * Math.pow(dist / bm.d, RIEGEL);
}

export function fmtT(s) {
  s = Math.round(s);
  const h = Math.floor(s / 3600);
  const m = Math.floor(s % 3600 / 60);
  const x = s % 60;
  return (h ? h + ':' : '') + String(m).padStart(h ? 2 : 1, '0') + ':' + String(x).padStart(2, '0');
}

export function fmtP(spk, addHeat, heat) {
  if (addHeat && heat) spk += 20;
  const m = Math.floor(spk / 60);
  const s = Math.round(spk % 60);
  return m + ':' + String(s).padStart(2, '0');
}

export function paces(bm) {
  const mp  = predict(bm, 42.195) / 42.195;
  const thr = predict(bm, 15) / 15;
  const i   = predict(bm, 5) / 5;
  const rep = i - 15;
  const ezLo = mp + 55;
  const ezHi = mp + 85;
  return { mp, thr, i, rep, ezLo, ezHi };
}

export function token(txt, bm, heat) {
  if (!txt) return txt;
  const p = paces(bm);
  return txt
    .replace(/\[EZ\]/g,  fmtP(p.ezLo, true, heat) + '–' + fmtP(p.ezHi, true, heat))
    .replace(/\[MP\]/g,  fmtP(p.mp,   true, heat))
    .replace(/\[THR\]/g, fmtP(p.thr,  true, heat))
    .replace(/\[INT\]/g, fmtP(p.i,    true, heat))
    .replace(/\[REP\]/g, fmtP(p.rep,  true, heat));
}

export function currentWeekIdx() {
  const now = new Date(); now.setHours(0, 0, 0, 0);
  for (let i = 0; i < W.length; i++) {
    const s = new Date(W[i].d + 'T00:00:00');
    const e = new Date(s); e.setDate(e.getDate() + 7);
    if (now >= s && now < e) return i;
  }
  return now < new Date(W[0].d) ? -1 : W.length - 1;
}

export function fmtD(d) {
  const dt = new Date(d + 'T00:00:00');
  const e = new Date(dt); e.setDate(e.getDate() + 6);
  const o = { month: 'short', day: 'numeric' };
  return dt.toLocaleDateString('en-US', o) + ' – ' + e.toLocaleDateString('en-US', o) + ' ' + e.getFullYear();
}

// Parse time string: hh:mm:ss or mm:ss → seconds
export function parseTimeStr(str) {
  const parts = str.trim().split(':').map(Number);
  if (parts.some(isNaN)) return NaN;
  if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
  if (parts.length === 2) return parts[0] * 60 + parts[1];
  return NaN;
}

// Daily readiness gate
export function readinessGate(hrv, rhr) {
  const h = hrv ? Number(hrv) : NaN;
  const r = rhr ? Number(rhr) : NaN;
  if (isNaN(h) && isNaN(r)) {
    return { level: 'warn', msg: 'Enter at least one value.' };
  }
  if ((!isNaN(h) && h < 35) || (!isNaN(r) && r > 68)) {
    return {
      level: 'red',
      msg: 'REST / WALK / 30 min Z1 only. Push the quality session to tomorrow. If you hit two red mornings in a row, cut the week\'s volume by 30%.'
    };
  }
  if ((!isNaN(h) && h < 40) || (!isNaN(r) && r > 65)) {
    return {
      level: 'amber',
      msg: 'Easy Z2 only today. No intervals, no threshold, no long-run surges. HR cap 145.'
    };
  }
  return {
    level: 'green',
    msg: 'Cleared for the hardest remaining module of this week. Execute it.'
  };
}

// Completion ring data
export function ringData(checks, weekIdx, mods) {
  const done = mods.filter((_, j) => checks[`${weekIdx}-${j}`]).length;
  const total = mods.length;
  const pct = total ? Math.round(done / total * 100) : 0;
  return { done, total, pct };
}
