// src/lib/gcal.js
// Google Calendar OAuth PKCE + API sync for NEXUS.
// No backend required — all tokens stored in localStorage.

import { INTERNSHIP_SCHEDULE } from './medi.data.js';
import { W, PH } from './kinetix.data.js';

const AUTH_URL  = 'https://accounts.google.com/o/oauth2/v2/auth';
const TOKEN_URL = 'https://oauth2.googleapis.com/token';
const API       = 'https://www.googleapis.com/calendar/v3';
const SCOPE     = 'https://www.googleapis.com/auth/calendar.events';
const PFX       = 'nexus_gcal_';

// ── PKCE ─────────────────────────────────────────────────────────────────────
function randomB64url(n = 32) {
  const buf = new Uint8Array(n);
  crypto.getRandomValues(buf);
  return btoa(String.fromCharCode(...buf)).replace(/\+/g,'-').replace(/\//g,'_').replace(/=/g,'');
}
async function pkceChallenge(verifier) {
  const hash = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(verifier));
  return btoa(String.fromCharCode(...new Uint8Array(hash)))
    .replace(/\+/g,'-').replace(/\//g,'_').replace(/=/g,'');
}

// ── Storage ───────────────────────────────────────────────────────────────────
export const getClientId  = ()    => localStorage.getItem(PFX+'client_id') || '';
export const setClientId  = (id)  => localStorage.setItem(PFX+'client_id', id);
export const clearTokens  = ()    => ['access','refresh','expiry'].forEach(k => localStorage.removeItem(PFX+k));
export const isConnected  = ()    => !!localStorage.getItem(PFX+'refresh');
export const lastSyncedAt = ()    => localStorage.getItem(PFX+'last_sync') || null;

function loadTokens() {
  return {
    access:  localStorage.getItem(PFX+'access')  || '',
    refresh: localStorage.getItem(PFX+'refresh') || '',
    expiry:  Number(localStorage.getItem(PFX+'expiry') || 0),
  };
}
function storeTokens({ access_token, refresh_token, expires_in }) {
  localStorage.setItem(PFX+'access',  access_token);
  if (refresh_token) localStorage.setItem(PFX+'refresh', refresh_token);
  localStorage.setItem(PFX+'expiry',  String(Date.now() + (expires_in - 120) * 1000));
}

// ── Redirect URI ──────────────────────────────────────────────────────────────
// Always origin + '/' — SPA lives at root, no path manipulation needed.
export function redirectUri() {
  return window.location.origin + '/';
}

// ── OAuth: start (redirect to Google) ────────────────────────────────────────
export async function startOAuth(clientId) {
  const verifier   = randomB64url(32);
  const challenge  = await pkceChallenge(verifier);
  sessionStorage.setItem(PFX+'verifier', verifier);

  const params = new URLSearchParams({
    client_id:             clientId,
    redirect_uri:          redirectUri(),
    response_type:         'code',
    scope:                 SCOPE,
    code_challenge:        challenge,
    code_challenge_method: 'S256',
    access_type:           'offline',
    prompt:                'consent',
    state:                 'nexus_gcal',
  });
  window.location.href = AUTH_URL + '?' + params;
}

// ── OAuth: handle redirect-back (call once on app startup) ───────────────────
export async function handleOAuthCallback() {
  const p = new URLSearchParams(window.location.search);
  if (!p.has('code') || p.get('state') !== 'nexus_gcal') return false;

  const code     = p.get('code');
  const verifier = sessionStorage.getItem(PFX+'verifier');
  const cid      = getClientId();
  if (!verifier || !cid) return false;

  try {
    const res = await fetch(TOKEN_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code, client_id: cid,
        redirect_uri:  redirectUri(),
        grant_type:    'authorization_code',
        code_verifier: verifier,
      }),
    });
    if (!res.ok) throw new Error(await res.text());
    storeTokens(await res.json());
    sessionStorage.removeItem(PFX+'verifier');
    window.history.replaceState({}, '', window.location.pathname);
    return true;
  } catch (e) {
    console.error('[GCal] token exchange failed:', e);
    return false;
  }
}

// ── Access token (auto-refresh) ───────────────────────────────────────────────
export async function getAccessToken() {
  const { access, refresh, expiry } = loadTokens();
  if (!refresh) throw new Error('Not connected — complete Google OAuth first.');
  if (access && Date.now() < expiry) return access;

  const cid = getClientId();
  const res = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ grant_type:'refresh_token', refresh_token:refresh, client_id:cid }),
  });
  if (!res.ok) {
    clearTokens();
    throw new Error('Token refresh failed — reconnect Google Calendar.');
  }
  const data = await res.json();
  storeTokens({ ...data, refresh_token: refresh });
  return data.access_token;
}

// ── API helpers ───────────────────────────────────────────────────────────────
async function apiFetch(method, path, body, token) {
  const res = await fetch(API + path, {
    method,
    headers: { Authorization:`Bearer ${token}`, 'Content-Type':'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (res.status === 204) return null;
  if (!res.ok) throw new Error(`GCal ${method} ${path} → ${res.status}: ${await res.text()}`);
  return res.json();
}

async function throttled(fns, concurrency = 5, delayMs = 250) {
  for (let i = 0; i < fns.length; i += concurrency) {
    await Promise.all(fns.slice(i, i + concurrency).map(f => f()));
    if (i + concurrency < fns.length) await new Promise(r => setTimeout(r, delayMs));
  }
}

// ── Delete all previous NEXUS events in our date range ───────────────────────
async function clearNexusEvents(token, onProgress) {
  const ids = [];
  let pageToken = undefined;
  do {
    const qs = new URLSearchParams({
      privateExtendedProperty: 'nexusSync=true',
      timeMin: '2026-06-14T00:00:00Z',
      timeMax: '2027-10-17T00:00:00Z',
      maxResults: '250',
      singleEvents: 'true',
      ...(pageToken ? { pageToken } : {}),
    });
    const data = await apiFetch('GET', `/calendars/primary/events?${qs}`, null, token);
    (data?.items || []).forEach(e => ids.push(e.id));
    pageToken = data?.nextPageToken;
  } while (pageToken);

  onProgress?.(`Removing ${ids.length} previous NEXUS events…`);
  await throttled(ids.map(id => () =>
    apiFetch('DELETE', `/calendars/primary/events/${id}`, null, token).catch(() => {})
  ), 8, 150);
  return ids.length;
}

// ── Event factory ─────────────────────────────────────────────────────────────
function mkEvent(summary, startDate, endDate, description, colorId) {
  // endDate for all-day events must be exclusive (+1 day)
  return {
    summary,
    description,
    colorId: String(colorId),
    start: { date: startDate },
    end:   { date: endDate   },
    extendedProperties: { private: { nexusSync: 'true' } },
  };
}

function addDays(ds, n) {
  const d = new Date(ds + 'T00:00:00');
  d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
}

// ── Medi: rotation blocks ─────────────────────────────────────────────────────
const BLOCK_COLOR = { clinical:'9', elective:'5', sprint:'3', blitz:'6' };

function medi_blockEvents() {
  return INTERNSHIP_SCHEDULE.map(b => {
    const subjs   = (b.primarySubjects || []).join(', ') || '—';
    const basic   = b.basicSubject ? `Basic science: ${b.basicSubject}` : '';
    const noteTxt = b.note ? `\n📌 ${b.note}` : '';
    const desc = [`Type: ${b.type}`, `Subjects: ${subjs}`, basic, noteTxt].filter(Boolean).join('\n');
    return mkEvent(
      `NEXUS · ${b.label}`,
      b.start,
      addDays(b.end, 1),
      desc,
      BLOCK_COLOR[b.type] || '11',
    );
  });
}

// ── Medi: duty roster days ────────────────────────────────────────────────────
const DUTY_COLOR = { pre:'7', duty:'10', post:'9', off:'11' };
const DUTY_TITLE = {
  pre:  'NEXUS · Pre-Duty · 45 Qs',
  duty: 'NEXUS · On Duty · 25 Qs',
  post: 'NEXUS · Post-Duty · 80 Qs',
  off:  'NEXUS · Off · 30 Qs',
};
const DUTY_DESC = {
  pre:  '45 fresh Qs (7a–7p) · study hard before the shift',
  duty: '25 short-set Qs (7p–7a) · vignettes during downtime',
  post: '50 fresh + 30 resurface Qs · AM sleep → PM study block',
  off:  '20 fresh + 10 resurface Qs · light review, protect recovery',
};

function medi_dutyEvents(roster) {
  return Object.entries(roster || {})
    .filter(([ds]) => ds >= '2026-07-01' && ds <= '2027-10-15')
    .sort(([a],[b]) => a.localeCompare(b))
    .map(([ds, mode]) => mkEvent(
      DUTY_TITLE[mode] || `NEXUS · ${mode.toUpperCase()}`,
      ds,
      addDays(ds, 1),
      DUTY_DESC[mode] || '',
      DUTY_COLOR[mode] || '11',
    ));
}

// ── Medi: PLE exam ────────────────────────────────────────────────────────────
function medi_pleEvent() {
  return mkEvent(
    'NEXUS · 🎯 PLE – Physician Licensure Exam',
    '2027-10-15',
    '2027-10-16',
    'Physician Licensure Examination (PLE) · Philippines\nTarget: 93–95% weighted average\n\nThe 93 Study Protocol ends here.',
    '10',
  );
}

// ── Kinetix: one event per training week ──────────────────────────────────────
const TAG_LABEL = { q:'Quality', l:'Long run', e:'Easy vol', s:'Strides', g:'Strength', w:'Swim', b:'Boulder', p:'Steps', t:'Key session', r:'Recovery' };

function phaseColor(ph) {
  const n = (ph?.n || '').toLowerCase();
  if (n.includes('race') || n.includes('marathon') || n.includes('taper')) return '10'; // Tomato
  if (n.includes('boulder') || n.includes('climb'))                          return '3';  // Grape
  if (n.includes('peak') || n.includes('build') || n.includes('quality'))    return '7';  // Peacock
  return '2'; // Sage (easy/base)
}

function kinetix_weekEvents() {
  return W.map((wk, idx) => {
    const phase = PH[wk.ph] || {};
    const km    = `${wk.km[0]}–${wk.km[1]} km`;
    const sessions = (wk.mods || []).map(m => {
      const tag = TAG_LABEL[m.t] || m.t;
      return `• [${tag}] ${m.tx}`;
    }).join('\n');
    const desc = [
      `Phase: ${phase.n || ''}`,
      `Volume: ${km}/wk`,
      wk.note ? `\n📌 ${wk.note}` : '',
      '\nSessions:\n' + sessions,
    ].filter(Boolean).join('\n');

    return mkEvent(
      `NEXUS · W${idx + 1} · ${km}`,
      wk.d,
      addDays(wk.d, 7),  // week spans Mon → next Mon (exclusive end)
      desc,
      phaseColor(phase),
    );
  });
}

// ── Master sync ───────────────────────────────────────────────────────────────
export async function syncAll(dutyRoster, onProgress) {
  const token = await getAccessToken();

  onProgress('Clearing previous NEXUS events from calendar…');
  const deleted = await clearNexusEvents(token, onProgress);

  const events = [
    ...medi_blockEvents(),
    ...medi_dutyEvents(dutyRoster),
    medi_pleEvent(),
    ...kinetix_weekEvents(),
  ];

  onProgress(`Pushing ${events.length} events (${deleted} removed)…`);

  let pushed = 0;
  await throttled(
    events.map(ev => async () => {
      await apiFetch('POST', '/calendars/primary/events', ev, token);
      pushed++;
      onProgress(`Syncing… ${pushed} / ${events.length}`);
    }),
    5,
    250,
  );

  localStorage.setItem(PFX+'last_sync', new Date().toISOString());
  return { deleted, pushed };
}
