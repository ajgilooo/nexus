// src/components/medi/schedule/scheduleHelpers.js
// Pure date/layout math — no React, no state. Imported by all 3 schedule views.
import { INTERNSHIP_SCHEDULE, PHASES } from '../../../lib/medi.data.js';

export const SCHEDULE_START = INTERNSHIP_SCHEDULE[0].start;          // '2026-07-01'
export const SCHEDULE_END   = INTERNSHIP_SCHEDULE.at(-1).end;        // '2027-10-14'

export function parseDay(str) {
  return new Date(str + 'T00:00:00');
}

// Integer days from date-string a to date-string/Date b
export function dayDiff(a, b) {
  const da = typeof a === 'string' ? parseDay(a) : a;
  const db = typeof b === 'string' ? parseDay(b) : b;
  return Math.round((db - da) / 86400000);
}

export const TOTAL_DAYS = dayDiff(SCHEDULE_START, SCHEDULE_END);     // ~470

export function blockColor(type) {
  switch (type) {
    case 'clinical': return 'var(--blk-clinical)';
    case 'elective': return 'var(--blk-elective)';
    case 'sprint':   return 'var(--blk-sprint)';
    case 'blitz':    return 'var(--blk-blitz)';
    default:         return 'var(--muted)';
  }
}

export function blockColorHex(type) {
  switch (type) {
    case 'clinical': return '#10B981';
    case 'elective': return '#F59E0B';
    case 'sprint':   return '#A78BFA';
    case 'blitz':    return '#F97316';
    default:         return '#94A3B8';
  }
}

// Find which block contains a given Date (or null for gap days)
export function blockForDate(date) {
  const d = date instanceof Date ? date : parseDay(date);
  d.setHours(12, 0, 0, 0); // noon avoids DST edge cases
  return INTERNSHIP_SCHEDULE.find(b => {
    const s = parseDay(b.start); s.setHours(0, 0, 0, 0);
    const e = parseDay(b.end);   e.setHours(23, 59, 59, 0);
    return d >= s && d <= e;
  }) || null;
}

// Array of month descriptors from start to end (inclusive month of each)
export function monthsBetween(startStr, endStr) {
  const result = [];
  const s = parseDay(startStr);
  const e = parseDay(endStr);
  let y = s.getFullYear(), m = s.getMonth();
  const ey = e.getFullYear(), em = e.getMonth();
  while (y < ey || (y === ey && m <= em)) {
    const firstOfMonth = new Date(y, m, 1);
    const daysInMonth  = new Date(y, m + 1, 0).getDate();
    result.push({
      year: y,
      month: m,           // 0-indexed
      label: firstOfMonth.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
      shortLabel: firstOfMonth.toLocaleDateString('en-US', { month: 'short' }),
      daysInMonth,
      firstWeekday: firstOfMonth.getDay(),  // 0=Sun
    });
    m++;
    if (m > 11) { m = 0; y++; }
  }
  return result;
}

// Phase zones clipped to schedule bounds (for Gantt background bands)
export function phaseZones() {
  const schedStart = parseDay(SCHEDULE_START);
  const schedEnd   = parseDay(SCHEDULE_END);
  return PHASES
    .map(p => ({
      num:   p.num,
      name:  p.name,
      start: new Date(Math.max(parseDay(p.start), schedStart)),
      end:   new Date(Math.min(parseDay(p.end),   schedEnd)),
    }))
    .filter(z => z.start < z.end);
}

// Zero-padded date string from year/month/day
export function padDate(y, m, d) {
  return `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
}

// Today as zero-padded ISO string (for calendar cell comparison)
export function todayISO() {
  const d = new Date();
  return padDate(d.getFullYear(), d.getMonth() + 1, d.getDate());
}
