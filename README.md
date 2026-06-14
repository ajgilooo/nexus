# NEXUS

Personal hub: **MEDI** (PLE study tracker) + **KINETIX** (endurance + bouldering plan).

Built with React + Vite → deployed to Vercel. State stored in Supabase (Postgres) via a Vercel serverless function, with localStorage as offline cache.

---

## Setup (one-time, ~10 minutes)

### 1. Supabase

1. Create a project at [supabase.com](https://supabase.com)
2. Go to **Database → SQL Editor → New Query**
3. Paste the contents of `supabase/setup.sql` and click **Run**
4. Confirm you see the `joseph` row in the output

### 2. Environment variables

Copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

Fill in the three values:

| Variable | Where to find it |
|---|---|
| `APP_TOKEN` | Pre-filled — keep the value or generate your own secret string |
| `SUPABASE_URL` | Supabase Dashboard → Settings → API → Project URL |
| `SUPABASE_SERVICE_KEY` | Supabase Dashboard → Settings → API → **service_role** key (not anon) |

### 3. Local development

```bash
npm install
npm run dev
```

Visit `http://localhost:5173`. The app will prompt for the token on first open (Settings chip → top right).

Enter the `APP_TOKEN` value from `.env.local` into the token field and save.

### 4. Deploy to Vercel

Push this repo to GitHub, then:

1. Go to [vercel.com](https://vercel.com) → **Add New Project** → import your GitHub repo
2. Framework preset: **Vite**
3. Add the three environment variables in **Settings → Environment Variables**
4. Deploy

Every `git push main` auto-deploys.

---

## Auth

Single-user, token-gated. The `APP_TOKEN` is stored in your browser's `localStorage` and sent as `Authorization: Bearer <token>` on every cloud sync. No accounts, no passwords.

Token: `nexus_joseph_k9mX2pL8vQnR4tYw` (change in `.env.local` + Vercel env vars to anything else you want)

---

## Data model

```
doc {
  schemaVersion: 3,
  ui: { activeWorld: 'medi' | 'kinetix' },
  medi: {
    state: { modules, pipeline, dailyHistory, ... },
    sylState: { topics, checked },
    caseLog: []
  },
  kinetix: {
    checks: {},        // week-module completion booleans
    bm: { d, t, label }, // benchmark race result
    heat: false        // heat-correction toggle
  }
}
```

Cloud is canonical. localStorage is written first (instant UI), cloud is written with 800 ms debounce.

---

## File structure

```
nexus/
├── api/state.js          ← Vercel serverless: GET/PUT with Bearer auth
├── src/
│   ├── lib/
│   │   ├── storage.js    ← Store abstraction (cloud + cache)
│   │   ├── medi.data.js  ← 84 CATALOG entries, all constants
│   │   ├── medi.logic.js ← All MEDI compute functions
│   │   ├── kinetix.data.js ← 52-week plan, PH phases
│   │   └── kinetix.logic.js ← Pace engine, Riegel, readiness gate
│   ├── state/appStore.js ← React context + reducer
│   ├── components/
│   │   ├── medi/         ← TrackerView, AnalyticsView, PleView, QLogModal
│   │   └── kinetix/      ← KinetixWorld, SeasonStrip, PlanTab, PacesTab, ...
│   ├── App.jsx           ← Shell, topbar, world toggle, sync chip, settings
│   ├── main.jsx
│   └── index.css
├── supabase/setup.sql
├── .env.example
├── vercel.json
└── package.json
```
