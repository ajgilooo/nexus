// src/lib/rpg.logic.js
// RPG layer: XP, levels, hexagon axes, badges, shop, coins, rpgTick.
// Pure functions only — no React, no side-effects except rpgTick which mutates doc in place.

import { calcStreak, calcReadiness, globalStats, todayKey } from './medi.logic.js';
import { W } from './kinetix.data.js';

// ── XP constants (tune here only) ─────────────────────────────────────────────
export const XP = {
  QUESTION:        1,
  KINETIX_MODULE:  25,
  MODULE_COMPLETE: 200,
  SCORE_70:        50,
  SCORE_85:        100,
  SCORE_95:        150,
  STREAK_PER_DAY:  10,
  READINESS_60:    150,
  READINESS_80:    250,
};

// ── Helpers ───────────────────────────────────────────────────────────────────
export function clampPct(score, maxScore) {
  const m = Number(maxScore), s = Number(score);
  if (!isFinite(m) || m <= 0 || !isFinite(s)) return 0;
  return Math.max(0, Math.min(100, (s / m) * 100));
}

function clamp01_100(x) { return Math.max(0, Math.min(100, x)); }

// ── Lifetime XP ───────────────────────────────────────────────────────────────
export function computeLifetimeXP(doc) {
  const S = doc.medi.state;
  let xp = 0;

  // SOURCE A: MEDI questions logged
  for (const k in S.dailyHistory) {
    const v = S.dailyHistory[k];
    if (typeof v === 'number' && v > 0) xp += v * XP.QUESTION;
  }

  // SOURCE A2: KINETIX modules ticked
  const checks = doc.kinetix.checks || {};
  let ticked = 0;
  for (const k in checks) { if (checks[k] === true) ticked++; }
  xp += ticked * XP.KINETIX_MODULE;

  // SOURCE B: MEDI module completed + score milestones
  for (const m_id in S.modules) {
    const s = S.modules[m_id];
    if (s.status === 'Completed') xp += XP.MODULE_COMPLETE;
    const sc = (typeof s.userPerformanceScore === 'number') ? s.userPerformanceScore : null;
    if (sc !== null) {
      if (sc >= 70) xp += XP.SCORE_70;
      if (sc >= 85) xp += XP.SCORE_85;
      if (sc >= 95) xp += XP.SCORE_95;
    }
  }

  // SOURCE C: Streak + readiness
  xp += calcStreak(S) * XP.STREAK_PER_DAY;
  const rd = calcReadiness(S, doc.medi.rotationExams || []);
  if (rd.total >= 60) xp += XP.READINESS_60;
  if (rd.total >= 80) xp += XP.READINESS_80;

  // SOURCE D: Rotation exam scores
  for (const ex of (doc.medi.rotationExams || [])) {
    xp += Math.round(clampPct(ex.score, ex.maxScore) * 3);
  }

  return Math.max(0, Math.round(xp));
}

// XP subtotals for the breakdown panel
export function computeXPBreakdown(doc) {
  const S = doc.medi.state;
  let A = 0, A2 = 0, B = 0, C = 0, D = 0;
  for (const k in S.dailyHistory) {
    const v = S.dailyHistory[k];
    if (typeof v === 'number' && v > 0) A += v;
  }
  const checks = doc.kinetix.checks || {};
  let ticked = 0;
  for (const k in checks) { if (checks[k] === true) ticked++; }
  A2 = ticked * XP.KINETIX_MODULE;
  for (const m_id in S.modules) {
    const s = S.modules[m_id];
    if (s.status === 'Completed') B += XP.MODULE_COMPLETE;
    const sc = (typeof s.userPerformanceScore === 'number') ? s.userPerformanceScore : null;
    if (sc !== null) {
      if (sc >= 70) B += XP.SCORE_70;
      if (sc >= 85) B += XP.SCORE_85;
      if (sc >= 95) B += XP.SCORE_95;
    }
  }
  C += calcStreak(S) * XP.STREAK_PER_DAY;
  const rd = calcReadiness(S, doc.medi.rotationExams || []);
  if (rd.total >= 60) C += XP.READINESS_60;
  if (rd.total >= 80) C += XP.READINESS_80;
  for (const ex of (doc.medi.rotationExams || [])) {
    D += Math.round(clampPct(ex.score, ex.maxScore) * 3);
  }
  return { A, A2, B, C, D };
}

// ── Level curve ───────────────────────────────────────────────────────────────
export function xpToReachLevel(L) { return 50 * L * (L - 1); }

export function levelFromXP(xp) {
  let L = 1;
  while (xpToReachLevel(L + 1) <= xp) L++;
  return L;
}

export function levelProgress(xp) {
  const L = levelFromXP(xp);
  const cur = xpToReachLevel(L);
  const next = xpToReachLevel(L + 1);
  const into = xp - cur;
  const span = next - cur;
  return { level: L, into, span, pct: span ? (into / span * 100) : 0, toNext: span - into };
}

// ── 6-Axis hexagon ────────────────────────────────────────────────────────────
export function computeAxes(doc) {
  const S = doc.medi.state;
  const g = globalStats(S);
  const rd = calcReadiness(S, doc.medi.rotationExams || []);

  // 1) Knowledge
  const knowledge = (g.mastery == null) ? 0 : clamp01_100(g.mastery);

  // 2) Endurance
  const totalMods = W.reduce((a, w) => a + w.mods.length, 0);
  const checks = doc.kinetix.checks || {};
  let tickedMods = 0;
  for (const k in checks) { if (checks[k] === true) tickedMods++; }
  const endurance = totalMods ? clamp01_100(tickedMods / totalMods * 100) : 0;

  // 3) Strength
  let gTotal = 0, gDone = 0;
  W.forEach((w, i) => w.mods.forEach((m, j) => {
    if (m.t === 'g') {
      gTotal++;
      if (checks[i + '-' + j] === true) gDone++;
    }
  }));
  const strength = gTotal ? clamp01_100(gDone / gTotal * 100) : 0;

  // 4) Discipline
  const streakComp = Math.min(100, calcStreak(S) * 4);
  const start = new Date(S.userProfile.startDate || '2026-06-10');
  const daysSinceStart = Math.max(1, Math.floor((Date.now() - start.getTime()) / 86400000));
  const activeDays = Object.keys(S.dailyHistory).length;
  const densityComp = Math.min(100, (activeDays / daysSinceStart) * 100 * 1.4);
  const discipline = clamp01_100(streakComp * 0.6 + densityComp * 0.4);

  // 5) Resilience — retention health
  const resilience = clamp01_100(rd.retention / 20 * 100);

  // 6) Clinical — readiness coverage + rotation exams
  const covBase = clamp01_100(rd.coverage / 35 * 100);
  const exs = doc.medi.rotationExams || [];
  let rotAvg = null;
  if (exs.length) {
    rotAvg = exs.reduce((a, e) => a + clampPct(e.score, e.maxScore), 0) / exs.length;
  }
  const clinical = (rotAvg == null) ? covBase : clamp01_100(covBase * 0.7 + rotAvg * 0.3);

  return { Knowledge: knowledge, Endurance: endurance, Strength: strength, Discipline: discipline, Resilience: resilience, Clinical: clinical };
}

// Axis order for hexagon (clockwise from top)
export const AXIS_ORDER = ['Knowledge', 'Clinical', 'Endurance', 'Strength', 'Resilience', 'Discipline'];

// ── Badge helpers ─────────────────────────────────────────────────────────────
function totalQuestionsLogged(doc) {
  let sum = 0;
  const h = doc.medi.state.dailyHistory;
  for (const k in h) { if (typeof h[k] === 'number' && h[k] > 0) sum += h[k]; }
  return sum;
}
function tickedCount(doc) {
  const c = doc.kinetix.checks || {};
  let t = 0;
  for (const k in c) { if (c[k] === true) t++; }
  return t;
}
function anyModuleCompleted(doc) {
  for (const id in doc.medi.state.modules) {
    if (doc.medi.state.modules[id].status === 'Completed') return true;
  }
  return false;
}
function anyModuleScoreAtLeast(doc, thr) {
  for (const id in doc.medi.state.modules) {
    const sc = doc.medi.state.modules[id].userPerformanceScore;
    if (typeof sc === 'number' && sc >= thr) return true;
  }
  return false;
}

// ── Badge catalog (exactly 12) ─────────────────────────────────────────────────
export const BADGES = [
  { id: 'first_blood',  name: 'First Blood',   desc: 'Log your first questions.',        test: d => totalQuestionsLogged(d) >= 1 },
  { id: 'century',      name: 'Century',        desc: '1,000 lifetime questions logged.', test: d => totalQuestionsLogged(d) >= 1000 },
  { id: 'ten_k',        name: 'Five Digits',    desc: '10,000 lifetime questions logged.',test: d => totalQuestionsLogged(d) >= 10000 },
  { id: 'streak_7',     name: 'Week Warrior',   desc: '7-day study streak.',              test: d => calcStreak(d.medi.state) >= 7 },
  { id: 'streak_30',    name: 'Iron Habit',     desc: '30-day study streak.',             test: d => calcStreak(d.medi.state) >= 30 },
  { id: 'first_master', name: 'Mastery',        desc: 'Complete your first module.',      test: d => anyModuleCompleted(d) },
  { id: 'sharpshooter', name: 'Sharpshooter',   desc: 'A module scored ≥95%.',            test: d => anyModuleScoreAtLeast(d, 95) },
  { id: 'readiness_60', name: 'On Track',       desc: 'Top-5 Readiness ≥60.',            test: d => calcReadiness(d.medi.state, d.medi.rotationExams || []).total >= 60 },
  { id: 'readiness_80', name: 'Exam Ready',     desc: 'Top-5 Readiness ≥80.',            test: d => calcReadiness(d.medi.state, d.medi.rotationExams || []).total >= 80 },
  { id: 'climber',      name: 'Send It',        desc: 'Tick 25 KINETIX modules.',         test: d => tickedCount(d) >= 25 },
  { id: 'engine',       name: 'The Engine',     desc: 'Tick 100 KINETIX modules.',        test: d => tickedCount(d) >= 100 },
  { id: 'rotation_ace', name: 'Rotation Ace',   desc: 'Log a rotation exam ≥85%.',       test: d => (d.medi.rotationExams || []).some(e => clampPct(e.score, e.maxScore) >= 85) },
];

// ── Shop seed (8 starter items) ───────────────────────────────────────────────
export const SHOP_SEED = [
  { id: 'coffee',    name: 'Specialty coffee',     cost: 300,   desc: 'One guilt-free good coffee.' },
  { id: 'movie',     name: 'Movie night',           cost: 800,   desc: 'A film, no studying allowed.' },
  { id: 'restday',   name: 'Full rest day',         cost: 1500,  desc: 'A sanctioned zero-obligation day.' },
  { id: 'gear',      name: 'Climbing/running gear', cost: 3000,  desc: 'Buy that piece of kit.' },
  { id: 'meal',      name: 'Nice meal out',         cost: 2500,  desc: 'Proper dinner, earned.' },
  { id: 'gadget',    name: 'Small gadget',          cost: 5000,  desc: 'The thing in your cart.' },
  { id: 'weekend',   name: 'Weekend trip',          cost: 12000, desc: 'Two days away. You earned it.' },
  { id: 'bigreward', name: 'Big-ticket reward',     cost: 25000, desc: 'The season-long carrot.' },
];

// ── rpgTick — called inside commit() before save ──────────────────────────────
export function rpgTick(doc) {
  const xp = computeLifetimeXP(doc);
  const cache = doc.rpg.xpLedgerCache;
  if (doc.rpg.redemptions.length === 0 && doc.rpg.coins === 0 && cache.lifetimeXP === 0) {
    doc.rpg.coins = xp;
  } else {
    const gained = Math.max(0, xp - cache.lifetimeXP);
    doc.rpg.coins += gained;
  }
  doc.rpg.xpLedgerCache = { lifetimeXP: xp, computedAt: Date.now() };
  for (const b of BADGES) {
    if (!doc.rpg.badgeState[b.id] && b.test(doc)) {
      doc.rpg.badgeState[b.id] = todayKey();
    }
  }
}
