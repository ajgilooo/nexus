// /api/state.js — Vercel Serverless Function
// GET  ?user=joseph  → read doc from Supabase
// PUT  ?user=joseph  → upsert doc into Supabase
// Auth: Authorization: Bearer <APP_TOKEN>

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

function unauthorized(res) {
  res.status(401).json({ error: 'Unauthorized' });
}

function checkAuth(req, res) {
  const header = req.headers['authorization'] || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : '';
  return token === process.env.APP_TOKEN;
}

export default async function handler(req, res) {
  // CORS headers for local dev
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, PUT, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (!checkAuth(req, res)) return unauthorized(res);

  const userId = req.query.user || 'joseph';

  // ── GET ──────────────────────────────────────────────────────────────────
  if (req.method === 'GET') {
    try {
      const { data, error } = await supabase
        .from('app_state')
        .select('doc, updated_at')
        .eq('user_id', userId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // No row found — return null doc
          return res.status(200).json({ doc: null, updatedAt: 0 });
        }
        throw error;
      }

      return res.status(200).json({ doc: data.doc, updatedAt: data.updated_at });
    } catch (err) {
      console.error('GET /api/state error:', err);
      return res.status(500).json({ error: 'Failed to read state', detail: err.message });
    }
  }

  // ── PUT ──────────────────────────────────────────────────────────────────
  if (req.method === 'PUT') {
    let body = '';
    try {
      // Accumulate body
      await new Promise((resolve, reject) => {
        req.on('data', chunk => { body += chunk; });
        req.on('end', resolve);
        req.on('error', reject);
      });

      const doc = JSON.parse(body);

      if (!doc || typeof doc.schemaVersion === 'undefined') {
        return res.status(400).json({ error: 'Invalid doc — missing schemaVersion' });
      }

      const updatedAt = doc.updatedAt || Date.now();

      const { error } = await supabase
        .from('app_state')
        .upsert({ user_id: userId, doc, updated_at: updatedAt }, { onConflict: 'user_id' });

      if (error) throw error;

      return res.status(200).json({ ok: true, updatedAt });
    } catch (err) {
      console.error('PUT /api/state error:', err);
      return res.status(500).json({ error: 'Failed to write state', detail: err.message });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
