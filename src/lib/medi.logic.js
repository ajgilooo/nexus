// src/lib/medi.logic.js
// All compute and mutation functions for the MEDI world.
// Pure functions take state as argument. Mutation fns mutate in place and return the updated state.
// All formulas are verbatim from spec §4.

import {
  CATALOG, SYSTEMS, PHASES, TARGET_EXAM,
  PLE_WEIGHTS, SUBJ_MODULE_IDS, SUBJECT_ORDER, CAT_TO_SUBJECT
} from './medi.data.js';

// ── Date helpers ──────────────────────────────────────────────────────────────
export function todayKey() {
  const d = new Date();
  return d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate(); // NOT zero-padded
}

export function daysToExam() {
  return Math.max(0, Math.ceil((TARGET_EXAM - new Date()) / 86400000));
}

export function activePhase() {
  const now = new Date();
  for (const p of PHASES) {
    if (now >= new Date(p.start) && now < new Date(p.end)) return p;
  }
  return PHASES[0];
}

export function recommendedDailyTarget() {
  const p = activePhase();
  if (p.num === "PHASE 1") return 40;
  if (p.num === "PHASE 2") return 70;
  if (p.num === "PHASE 3") return 80;
  return 20;
}

// ── Fresh state ───────────────────────────────────────────────────────────────
export function freshState() {
  const modules = {};
  CATALOG.forEach(m => {
    modules[m.id] = {
      completedQuestions: 0,
      status: "Unstarted",
      userPerformanceScore: null,
      scoreHistory: [],
      lastUpdated: null
    };
  });
  const pipeline = {};
  SYSTEMS.forEach(s => { pipeline[s] = [false, false, false, false, false]; });
  return {
    userProfile: {
      role: "Medical Intern",
      targetExam: "Physician Licensure Examination (PLE) Philippines",
      startDate: "2026-06-10",
      targetExamDate: "2027-10-15",
      activeSystem: "Cardiovascular"
    },
    dailyTargetMetrics: {
      questionsPerDayTarget: 40,
      currentDayCompletedCount: 0,
      dayKey: todayKey()
    },
    dailyHistory: {},
    questionLogs: [],
    examLog: [],
    modules,
    pipeline
  };
}

// ── Coercion/validation ───────────────────────────────────────────────────────
export function coerceModuleData(s) {
  if (!s) return;
  for (const m of CATALOG) {
    const mod = s.modules[m.id];
    if (!mod) {
      s.modules[m.id] = { completedQuestions: 0, status: "Unstarted", userPerformanceScore: null, scoreHistory: [], lastUpdated: null };
      continue;
    }
    mod.completedQuestions = Math.max(0, Math.min(m.totalQuestions, mod.completedQuestions || 0));
    if (typeof mod.userPerformanceScore === 'number') {
      mod.userPerformanceScore = Math.max(0, Math.min(100, mod.userPerformanceScore));
    } else {
      mod.userPerformanceScore = null;
    }
    if (!Array.isArray(mod.scoreHistory)) mod.scoreHistory = [];
  }
  for (const sys of SYSTEMS) {
    if (!Array.isArray(s.pipeline[sys]) || s.pipeline[sys].length < 5) {
      s.pipeline[sys] = [false, false, false, false, false];
    }
  }
  // Reset daily counter if stale
  if (s.dailyTargetMetrics && s.dailyTargetMetrics.dayKey !== todayKey()) {
    s.dailyTargetMetrics.currentDayCompletedCount = 0;
    s.dailyTargetMetrics.dayKey = todayKey();
  }
}

// ── Global stats ──────────────────────────────────────────────────────────────
export function globalStats(state) {
  let total = 0, done = 0, scoreWeightSum = 0, scoreWeightTotal = 0;
  for (const m of CATALOG) {
    total += m.totalQuestions;
    const s = state.modules[m.id];
    const completedCapped = Math.min(Math.max(0, s.completedQuestions || 0), m.totalQuestions);
    done += completedCapped;
    if (typeof s.userPerformanceScore === 'number') {
      const w = completedCapped || m.totalQuestions;
      scoreWeightSum += s.userPerformanceScore * w;
      scoreWeightTotal += w;
    }
  }
  // Blend rotation exam scores into overall mastery, item-weighted like questions.
  for (const e of (state.examLog || [])) {
    if (typeof e.score === 'number') {
      const w = (typeof e.total === 'number' && e.total > 0) ? e.total : 100;
      scoreWeightSum += e.score * w;
      scoreWeightTotal += w;
    }
  }
  return {
    total,
    done,
    pct: total ? (done / total * 100) : 0,
    mastery: scoreWeightTotal ? (scoreWeightSum / scoreWeightTotal) : null
  };
}

// ── Status recalc ─────────────────────────────────────────────────────────────
export function recalcStatus(state, id) {
  const m = CATALOG.find(x => x.id === id);
  const s = state.modules[id];
  if (s.completedQuestions >= m.totalQuestions) {
    s.completedQuestions = m.totalQuestions;
    s.status = "Completed";
  } else if (s.status === "Paused") {
    // keep
  } else if (s.completedQuestions > 0) {
    s.status = "In Progress";
  } else {
    s.status = "Unstarted";
  }
}

// ── Increment ─────────────────────────────────────────────────────────────────
export function increment(state, id, amount) {
  const m = CATALOG.find(x => x.id === id);
  const s = state.modules[id];
  const before = s.completedQuestions;
  s.completedQuestions = Math.max(0, Math.min(m.totalQuestions, s.completedQuestions + amount));
  const delta = s.completedQuestions - before;
  if (delta > 0) {
    if (state.dailyTargetMetrics.dayKey !== todayKey()) {
      state.dailyTargetMetrics.currentDayCompletedCount = 0;
      state.dailyTargetMetrics.dayKey = todayKey();
    }
    state.dailyTargetMetrics.currentDayCompletedCount += delta;
    const dk = todayKey();
    state.dailyHistory[dk] = (state.dailyHistory[dk] || 0) + delta;
  }
  s.lastUpdated = new Date().toISOString();
  recalcStatus(state, id);
  return state;
}

// ── Set score ─────────────────────────────────────────────────────────────────
export function setScore(state, id, val) {
  const s = state.modules[id];
  if (val === "" || val === null) {
    s.userPerformanceScore = null;
  } else {
    let n = Math.max(0, Math.min(100, Number(val)));
    if (!isNaN(n)) {
      const prev = s.userPerformanceScore;
      s.userPerformanceScore = n;
      if (prev !== n) {
        if (!Array.isArray(s.scoreHistory)) s.scoreHistory = [];
        s.scoreHistory.push({ score: n, date: todayKey() });
        if (s.scoreHistory.length > 20) s.scoreHistory = s.scoreHistory.slice(-20);
      }
    } else {
      s.userPerformanceScore = null;
    }
  }
  s.lastUpdated = new Date().toISOString();
  return state;
}

// ── Toggle pause ──────────────────────────────────────────────────────────────
export function togglePause(state, id) {
  const s = state.modules[id];
  if (s.status === "Completed") return state;
  s.status = s.status === "Paused"
    ? (s.completedQuestions > 0 ? "In Progress" : "Unstarted")
    : "Paused";
  s.lastUpdated = new Date().toISOString();
  return state;
}

// ── Toggle pipeline ───────────────────────────────────────────────────────────
export function togglePipeline(state, stepIdx) {
  const sys = state.userProfile.activeSystem;
  state.pipeline[sys][stepIdx] = !state.pipeline[sys][stepIdx];
  return state;
}

// ── Log module questions (modal) ──────────────────────────────────────────────
export function logModuleQuestions(state, { moduleId, total, accuracy }) {
  const m = CATALOG.find(x => x.id === moduleId);
  if (!m) return null;
  const s = state.modules[moduleId];
  const before = s.completedQuestions;
  s.completedQuestions = Math.max(0, Math.min(m.totalQuestions, before + total));
  const loggedIntoModule = s.completedQuestions - before;

  s.userPerformanceScore = Math.round(accuracy * 10) / 10;
  if (!Array.isArray(s.scoreHistory)) s.scoreHistory = [];
  s.scoreHistory.push({ score: s.userPerformanceScore, date: todayKey(), questions: total });
  if (s.scoreHistory.length > 20) s.scoreHistory = s.scoreHistory.slice(-20);
  s.lastUpdated = new Date().toISOString();
  recalcStatus(state, moduleId);

  if (state.dailyTargetMetrics.dayKey !== todayKey()) {
    state.dailyTargetMetrics.currentDayCompletedCount = 0;
    state.dailyTargetMetrics.dayKey = todayKey();
  }
  if (loggedIntoModule > 0) {
    state.dailyTargetMetrics.currentDayCompletedCount += loggedIntoModule;
    const dk = todayKey();
    state.dailyHistory[dk] = (state.dailyHistory[dk] || 0) + loggedIntoModule;
  }

  if (!Array.isArray(state.questionLogs)) state.questionLogs = [];
  state.questionLogs.push({ date: todayKey(), moduleId, total, accuracy, loggedIntoModule });

  return state;
}

// ── Decay & weak zones ────────────────────────────────────────────────────────
export function weakThreshold() {
  return activePhase().num === "PHASE 3" ? 85 : 70;
}

export function weakZones(state) {
  const thr = weakThreshold();
  return CATALOG.filter(m => {
    const s = state.modules[m.id];
    return typeof s.userPerformanceScore === 'number' && s.userPerformanceScore < thr && s.status !== "Unstarted";
  }).sort((a, b) => state.modules[a.id].userPerformanceScore - state.modules[b.id].userPerformanceScore);
}

export function isDecayed(state, id) {
  const s = state.modules[id];
  if (!s.lastUpdated || typeof s.userPerformanceScore !== 'number') return false;
  const daysSince = (Date.now() - new Date(s.lastUpdated).getTime()) / 86400000;
  return daysSince > 30 && s.userPerformanceScore < 85;
}

// ── Analytics ─────────────────────────────────────────────────────────────────
export function subjectStats(state) {
  const result = {};
  for (const subj of SUBJECT_ORDER) result[subj] = { scoreSum: 0, scoreCount: 0, done: 0, total: 0 };
  for (const m of CATALOG) {
    const subj = CAT_TO_SUBJECT[m.category];
    if (!subj || !result[subj]) continue;
    const s = state.modules[m.id];
    const cap = Math.min(Math.max(0, s.completedQuestions || 0), m.totalQuestions);
    result[subj].total += m.totalQuestions;
    result[subj].done += cap;
    if (typeof s.userPerformanceScore === 'number') {
      result[subj].scoreSum += s.userPerformanceScore;
      result[subj].scoreCount++;
    }
  }
  return result;
}

export function velocityStats(state) {
  const startDate = state.userProfile.startDate || "2026-06-10";
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const start = new Date(startDate); start.setHours(0, 0, 0, 0);
  const daysSinceStart = Math.max(1, Math.floor((today - start) / 86400000));

  let sum7 = 0, days7 = 0, sum30 = 0, days30 = 0;
  for (const [key, val] of Object.entries(state.dailyHistory)) {
    const parts = key.split('-');
    const d = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
    d.setHours(0, 0, 0, 0);
    const diff = Math.floor((today - d) / 86400000);
    if (diff < 0) continue;
    if (diff < 7) { sum7 += val; days7++; }
    if (diff < 30) { sum30 += val; days30++; }
  }
  const avg7  = days7  ? sum7  / Math.min(daysSinceStart, 7)  : 0;
  const avg30 = days30 ? sum30 / Math.min(daysSinceStart, 30) : 0;
  return { avg7, avg30, daysSinceStart };
}

export function projectionStats(state) {
  const g = globalStats(state);
  const { avg7 } = velocityStats(state);
  const remaining = g.total - g.done;
  const daysLeft = daysToExam();
  const needed = daysLeft > 0 ? remaining / daysLeft : Infinity;
  const projDays = avg7 > 0 ? Math.ceil(remaining / avg7) : Infinity;
  const projDate = avg7 > 0 ? new Date(Date.now() + projDays * 86400000) : null;
  return { remaining, needed, projDays, projDate, avg7 };
}

export function calcStreak(state) {
  const today = new Date(); today.setHours(0, 0, 0, 0);
  let streak = 0;
  for (let i = 0; i < 365; i++) {
    const d = new Date(today); d.setDate(d.getDate() - i);
    const key = d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate();
    if ((state.dailyHistory[key] || 0) > 0) streak++;
    else break;
  }
  return streak;
}

// ── PLE Intelligence ──────────────────────────────────────────────────────────
// Returns exams logged for a given PLE subject (newest first not guaranteed here).
export function examsForSubject(state, subject) {
  const log = state.examLog || [];
  return log.filter(e => e.subject === subject);
}

export function getSubjectCoverage(state, subject) {
  const ids = SUBJ_MODULE_IDS[subject];
  const exams = examsForSubject(state, subject);
  const hasModules = ids && ids.length;

  // If a subject has neither mapped modules nor any logged exams, it's untracked.
  if (!hasModules && exams.length === 0) return null;

  let done = 0, total = 0, sw = 0, swt = 0;
  if (hasModules) {
    for (const m of CATALOG) {
      if (!ids.includes(m.id)) continue;
      const s = state.modules[m.id];
      const cap = Math.min(Math.max(0, s.completedQuestions || 0), m.totalQuestions);
      total += m.totalQuestions;
      done += cap;
      if (typeof s.userPerformanceScore === 'number') {
        sw += s.userPerformanceScore * cap;
        swt += cap;
      }
    }
  }

  // Blend rotation exam scores into the subject's average. Each exam is weighted by
  // its item count (default 100 if unknown) so a 200-item finals counts more than a
  // 20-item quiz, on the same footing as QBank questions answered.
  let examItems = 0;
  for (const e of exams) {
    if (typeof e.score === 'number') {
      const w = (typeof e.total === 'number' && e.total > 0) ? e.total : 100;
      sw += e.score * w;
      swt += w;
      examItems += w;
    }
  }

  // Coverage credit from exams: a logged exam demonstrates real exposure to the
  // subject even where no QBank module is mapped. Give each exam item the same
  // weight as a catalog question, capped so exams alone can reach 100% coverage.
  const moduleCoverage = total ? done / total * 100 : 0;
  let coverage;
  if (!hasModules) {
    // Exam-only subject: coverage scales with cumulative exam items, saturating at
    // ~300 items (≈3 full exams) = 100%.
    coverage = Math.min(100, examItems / 300 * 100);
  } else {
    // Module-backed subject: exams nudge coverage upward but modules dominate.
    const examBoost = Math.min(15, examItems / 300 * 15); // up to +15 pts
    coverage = Math.min(100, moduleCoverage + (examItems > 0 ? examBoost : 0));
  }

  return {
    coverage,
    avgScore: swt ? sw / swt : null,
    done,
    total,
    examCount: exams.length
  };
}

export function gapScore(pleWeight, coverage, avgScore) {
  const scoreFactor = avgScore !== null ? Math.min(1, avgScore / 85) : 0.5;
  const effectiveCoverage = (coverage / 100) * scoreFactor * 100;
  const rawGap = Math.max(0, pleWeight - effectiveCoverage * (pleWeight / 100));
  return pleWeight > 0 ? Math.min(100, (rawGap / pleWeight) * 100) : 0;
}

export function calcReadiness(state, rotationExams = []) {
  const g = globalStats(state);
  // C1 Coverage across all 12 equal-weight PLE subjects (0–35).
  let covScore = 0;
  const n = PLE_WEIGHTS.length; // 12
  PLE_WEIGHTS.forEach(p => {
    const cov = getSubjectCoverage(state, p.subject);
    const pct = cov ? cov.coverage : 0;
    covScore += (pct / 100) * (1 / n) * 35;
  });
  // C2 Avg score adjusted to 85% floor (0–30)
  const mastery = g.mastery || 0;
  const scoreComponent = Math.min(30, (mastery / 85) * 30);
  // C3 Retention health (0–20)
  const decayCount = CATALOG.filter(m => isDecayed(state, m.id)).length;
  const decayPenalty = Math.min(20, decayCount * 1.5);
  const retentionScore = Math.max(0, 20 - decayPenalty);
  // C4 Simulation completion (0–15)
  const simMods = CATALOG.filter(m => m.name.includes("Self Assessment Simulation"));
  const simDone = simMods.filter(m => state.modules[m.id].status === "Completed").length;
  const simScore = simMods.length ? (simDone / simMods.length) * 15 : 0;

  // C5 Rotation exams (§10.8.3) — only activates when ≥1 exam exists
  const exs = rotationExams || [];
  const hasExams = exs.length > 0;
  let simComponent = simScore;
  let rotComponent = 0;
  if (hasExams) {
    const clampPct = (s, m) => {
      const mv = Number(m), sv = Number(s);
      if (!isFinite(mv) || mv <= 0 || !isFinite(sv)) return 0;
      return Math.max(0, Math.min(100, (sv / mv) * 100));
    };
    const avgPct = exs.reduce((a, e) => a + clampPct(e.score, e.maxScore), 0) / exs.length;
    const c5raw = (avgPct / 100) * 15;
    simComponent = simScore * 0.6;
    rotComponent = c5raw * 0.4;
  }

  const total = Math.min(100, covScore + scoreComponent + retentionScore + simComponent + rotComponent);
  return {
    total,
    coverage: covScore,
    scoreComponent,
    retention: retentionScore,
    simulation: simComponent,
    rotation: rotComponent,
    hasExams,
    decayCount,
    mastery
  };
}

// ── Syllabus parser ───────────────────────────────────────────────────────────
export function parseSyllabus(raw, existingChecked = {}) {
  const lines = raw.split('\n');
  let currentSection = 'General';
  let currentGroup = 'General';
  const topics = [];

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    if (trimmed.startsWith('### ')) {
      currentGroup = currentSection + ' / ' + trimmed.slice(4);
    } else if (trimmed.startsWith('## ')) {
      currentGroup = currentSection + ' / ' + trimmed.slice(3);
    } else if (trimmed.startsWith('# ')) {
      currentSection = trimmed.slice(2);
      currentGroup = currentSection;
    } else {
      let text = trimmed.replace(/^[-*]\s+/, '').replace(/^\d+\.\s+/, '');
      if (text.length > 2 && text.length < 200) {
        topics.push({ id: currentGroup + '::' + text, group: currentGroup, text, section: currentSection });
      }
    }
  }

  // Preserve existing checks for matching IDs
  const checked = {};
  for (const t of topics) {
    if (existingChecked[t.id]) checked[t.id] = true;
  }
  return { topics, checked };
}

// ── Rotation Exams ─────────────────────────────────────────────────────────────
// Exams are stored in state.examLog = [{ id, name, subject, score, total, correct, date }]
// score is a 0–100 percentage. total/correct are optional raw item counts.

export function addExam(state, exam) {
  if (!Array.isArray(state.examLog)) state.examLog = [];
  const entry = {
    id: Date.now(),
    name: exam.name || 'Exam',
    subject: exam.subject,
    score: Math.max(0, Math.min(100, Number(exam.score))),
    total: (exam.total != null && exam.total !== '') ? Math.max(1, Math.round(Number(exam.total))) : null,
    correct: (exam.correct != null && exam.correct !== '') ? Math.max(0, Math.round(Number(exam.correct))) : null,
    date: exam.date || todayKey()
  };
  state.examLog.push(entry);
  return state;
}

export function deleteExam(state, id) {
  state.examLog = (state.examLog || []).filter(e => e.id !== id);
  return state;
}

// Overall exam average (item-weighted), and per-subject summary for the exams panel.
export function examStats(state) {
  const log = state.examLog || [];
  let sum = 0, wt = 0;
  const bySubject = {};
  for (const e of log) {
    if (typeof e.score !== 'number') continue;
    const w = (typeof e.total === 'number' && e.total > 0) ? e.total : 100;
    sum += e.score * w; wt += w;
    if (!bySubject[e.subject]) bySubject[e.subject] = { count: 0, sum: 0, wt: 0, latest: e };
    const b = bySubject[e.subject];
    b.count++; b.sum += e.score * w; b.wt += w;
    if (e.date >= b.latest.date) b.latest = e;
  }
  return {
    count: log.length,
    avg: wt ? sum / wt : null,
    bySubject
  };
}
