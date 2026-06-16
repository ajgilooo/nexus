// src/lib/today.logic.js
// Cross-world logic for the "Today" command center.
// Blends MEDI (study) + KINETIX (training) into one ranked action list and a
// unified year calendar heatmap.

import {
  daysToExam, activePhase, recommendedDailyTarget, globalStats,
  weakZones, weakThreshold, isDecayed, calcReadiness, calcStreak,
  todayKey, getSubjectCoverage
} from './medi.logic.js';
import { CATALOG, PLE_WEIGHTS } from './medi.data.js';
import { W, PH, RACE_INDICES } from './kinetix.data.js';
import { currentWeekIdx, token, ringData } from './kinetix.logic.js';

// ── Date helpers ──────────────────────────────────────────────────────────────
function dayKeyFromDate(d) {
  return d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate();
}
function startOfWeekMonday(d) {
  const x = new Date(d); x.setHours(0, 0, 0, 0);
  const day = (x.getDay() + 6) % 7; // Mon=0
  x.setDate(x.getDate() - day);
  return x;
}

// ── Decision matrix ───────────────────────────────────────────────────────────
// Each action: { id, world, priority (0-100), urgency, title, detail, cta, tone }
// tone: 'critical' | 'warn' | 'go' | 'info'
export function buildActionMatrix(doc) {
  const state = doc.medi.state;
  const actions = [];

  // ---- MEDI signals ----
  const days = daysToExam();
  const phase = activePhase();
  const target = recommendedDailyTarget();
  const daily = state.dailyTargetMetrics;
  const dailyDone = daily.dayKey === todayKey() ? daily.currentDayCompletedCount : 0;
  const remainingToday = Math.max(0, target - dailyDone);
  const g = globalStats(state);
  const readiness = calcReadiness(state, doc.medi.rotationExams || []);
  const wz = weakZones(state);
  const thr = weakThreshold();
  const decayed = CATALOG.filter(m => isDecayed(state, m.id));

  // 1. Daily question target
  if (remainingToday > 0) {
    const pctDone = target ? dailyDone / target : 0;
    actions.push({
      id: 'medi-daily',
      world: 'medi',
      priority: 70 + (1 - pctDone) * 15,
      urgency: 'Today',
      title: `${remainingToday} questions left today`,
      detail: `${dailyDone} / ${target} done · ${phase.num} pace`,
      cta: 'Open Tracker',
      ctaWorld: 'medi', ctaTab: 'tracker',
      tone: pctDone >= 0.5 ? 'go' : 'warn',
      progress: pctDone
    });
  } else if (target > 0) {
    actions.push({
      id: 'medi-daily-done',
      world: 'medi',
      priority: 20,
      urgency: 'Today',
      title: `Daily target hit — ${dailyDone}/${target}`,
      detail: 'Nice. Bank extra reps or rest the brain.',
      cta: 'Open Tracker',
      ctaWorld: 'medi', ctaTab: 'tracker',
      tone: 'go',
      progress: 1
    });
  }

  // 2. Decayed modules (spaced-repetition due)
  if (decayed.length > 0) {
    actions.push({
      id: 'medi-decay',
      world: 'medi',
      priority: 60 + Math.min(20, decayed.length * 2),
      urgency: 'Due',
      title: `${decayed.length} module${decayed.length > 1 ? 's' : ''} due for review`,
      detail: `Stale >30 days & under 85%. ${decayed.slice(0, 2).map(m => m.id).join(', ')}${decayed.length > 2 ? '…' : ''}`,
      cta: 'Review now',
      ctaWorld: 'medi', ctaTab: 'tracker',
      tone: 'warn'
    });
  }

  // 3. Weak zones
  if (wz.length > 0) {
    const worst = wz[0];
    const worstScore = state.modules[worst.id].userPerformanceScore;
    actions.push({
      id: 'medi-weak',
      world: 'medi',
      priority: 55 + Math.min(20, wz.length * 2),
      urgency: 'Focus',
      title: `${wz.length} weak zone${wz.length > 1 ? 's' : ''} below ${thr}%`,
      detail: `Weakest: ${worst.name} (${worstScore}%)`,
      cta: 'See weak zones',
      ctaWorld: 'medi', ctaTab: 'analytics',
      tone: 'critical'
    });
  }

  // 4. Subject coverage gaps (least-covered tracked PLE subject)
  let lowestSubj = null, lowestCov = Infinity;
  for (const p of PLE_WEIGHTS) {
    const cov = getSubjectCoverage(state, p.subject);
    const c = cov ? cov.coverage : 0;
    if (c < lowestCov) { lowestCov = c; lowestSubj = p.subject; }
  }
  if (lowestSubj && lowestCov < 25) {
    actions.push({
      id: 'medi-gap',
      world: 'medi',
      priority: 45,
      urgency: 'Plan',
      title: `${lowestSubj} barely started`,
      detail: `${lowestCov.toFixed(0)}% coverage — schedule a block this week`,
      cta: 'Gap analysis',
      ctaWorld: 'medi', ctaTab: 'ple',
      tone: 'info'
    });
  }

  // ---- KINETIX signals ----
  const wi = currentWeekIdx();
  if (wi >= 0 && wi < W.length) {
    const wk = W[wi];
    const checks = doc.kinetix.checks || {};
    const ring = ringData(checks, wi, wk.mods);
    const isRaceWeek = RACE_INDICES.includes(wi);

    // 5. This week's key session(s) not yet done
    const undone = wk.mods
      .map((m, j) => ({ m, j, done: !!checks[`${wi}-${j}`] }))
      .filter(x => !x.done);
    const keySession = undone.find(x => x.m.t === 't' || x.m.t === 'q' || x.m.t === 'l');

    if (isRaceWeek) {
      const raceMod = wk.mods.find(m => m.t === 't');
      actions.push({
        id: 'kx-race',
        world: 'kinetix',
        priority: 95,
        urgency: 'RACE WEEK',
        title: raceMod ? raceMod.tx.split('.')[0] : `Race week — W${wi + 1}`,
        detail: `${PH[wk.ph].n} · ${wk.km[0]}–${wk.km[1]} km`,
        cta: 'Open plan',
        ctaWorld: 'kinetix', ctaTab: 'plan',
        tone: 'critical'
      });
    } else if (keySession) {
      actions.push({
        id: 'kx-key',
        world: 'kinetix',
        priority: 65,
        urgency: 'This week',
        title: token(keySession.m.tx, doc.kinetix.bm, doc.kinetix.heat).split('.')[0],
        detail: `W${wi + 1} anchor · ${ring.done}/${ring.total} modules done`,
        cta: 'Open plan',
        ctaWorld: 'kinetix', ctaTab: 'plan',
        tone: 'go',
        progress: ring.total ? ring.done / ring.total : 0
      });
    } else if (ring.total > 0 && ring.done < ring.total) {
      actions.push({
        id: 'kx-finish',
        world: 'kinetix',
        priority: 40,
        urgency: 'This week',
        title: `Finish the week — ${ring.total - ring.done} left`,
        detail: `W${wi + 1} · ${PH[wk.ph].n}`,
        cta: 'Open plan',
        ctaWorld: 'kinetix', ctaTab: 'plan',
        tone: 'info',
        progress: ring.done / ring.total
      });
    } else if (ring.total > 0 && ring.done === ring.total) {
      actions.push({
        id: 'kx-done',
        world: 'kinetix',
        priority: 18,
        urgency: 'This week',
        title: `Week ${wi + 1} complete ✓`,
        detail: 'All modules ticked. Recover well.',
        cta: 'Open plan',
        ctaWorld: 'kinetix', ctaTab: 'plan',
        tone: 'go',
        progress: 1
      });
    }

    // 6. Readiness gate reminder (daily, transient — just a nudge)
    actions.push({
      id: 'kx-gate',
      world: 'kinetix',
      priority: 30,
      urgency: 'Daily',
      title: 'Log morning readiness',
      detail: 'HRV + resting HR → today\'s green/amber/red call',
      cta: 'Readiness gate',
      ctaWorld: 'kinetix', ctaTab: 'paces',
      tone: 'info'
    });
  }

  // Sort by priority desc
  actions.sort((a, b) => b.priority - a.priority);
  return { actions, meta: { days, readiness: readiness.total, streak: calcStreak(state), pct: g.pct } };
}

// ── Unified year calendar ─────────────────────────────────────────────────────
// Returns weeks[] each with 7 day cells, spanning the full training season
// (Jun 15 2026 → race) so study + training live on the same grid.
export function buildYearCalendar(doc) {
  const state = doc.medi.state;
  const checks = doc.kinetix.checks || {};
  const target = state.dailyTargetMetrics.questionsPerDayTarget || recommendedDailyTarget();

  // Season span: first plan week start → last plan week end
  const seasonStart = startOfWeekMonday(new Date(W[0].d + 'T00:00:00'));
  const lastWeekStart = new Date(W[W.length - 1].d + 'T00:00:00');
  const seasonEnd = new Date(lastWeekStart); seasonEnd.setDate(seasonEnd.getDate() + 6);

  // Build week-by-week
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const weeks = [];
  let cursor = new Date(seasonStart);
  let wIdx = 0;

  while (cursor <= seasonEnd) {
    const wkPlan = W[wIdx];
    const cells = [];
    for (let d = 0; d < 7; d++) {
      const date = new Date(cursor); date.setDate(date.getDate() + d);
      const key = dayKeyFromDate(date);
      const studyQ = state.dailyHistory[key] || 0;
      // study level 0-4 by target
      let studyLvl = 0;
      if (studyQ > 0) {
        if (studyQ >= target) studyLvl = 4;
        else if (studyQ >= target * 0.75) studyLvl = 3;
        else if (studyQ >= target * 0.4) studyLvl = 2;
        else studyLvl = 1;
      }
      const isFuture = date > today;
      const isToday = date.getTime() === today.getTime();
      cells.push({ date, key, studyQ, studyLvl, isFuture, isToday });
    }

    // training load for the week (from plan km midpoint + completion)
    const km = wkPlan ? (wkPlan.km[0] + wkPlan.km[1]) / 2 : 0;
    const ring = wkPlan ? ringData(checks, wIdx, wkPlan.mods) : { done: 0, total: 0, pct: 0 };
    const phase = wkPlan ? PH[wkPlan.ph] : null;
    const isRace = RACE_INDICES.includes(wIdx);
    const monthLabel = cursor.toLocaleDateString('en-US', { month: 'short' });

    weeks.push({
      wIdx,
      start: new Date(cursor),
      cells,
      km,
      kmRange: wkPlan ? wkPlan.km : [0, 0],
      ring,
      phaseIdx: wkPlan ? wkPlan.ph : 0,
      phaseName: phase ? phase.n : '',
      isRace,
      monthLabel,
      isCurrent: wIdx === currentWeekIdx()
    });

    cursor.setDate(cursor.getDate() + 7);
    wIdx++;
  }

  // study totals
  const totalStudyDays = Object.values(state.dailyHistory).filter(v => v > 0).length;
  const maxKm = Math.max(...weeks.map(w => w.kmRange[1]), 1);

  return { weeks, totalStudyDays, maxKm, seasonStart, seasonEnd };
}

export const PH_COLOR_VARS = [
  'var(--ez)', 'var(--ez)', 'var(--qual)', 'var(--race)', 'var(--ez)',
  'var(--race)', 'var(--swim)', 'var(--ez)', 'var(--bld)', 'var(--bld)',
  'var(--qual)', 'var(--race)', 'var(--swim)'
];
