#!/usr/bin/env node
/**
 * Test Supabase connection and budget_items table.
 * Run from project root: node scripts/test-supabase.mjs
 */
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');

function loadEnv() {
  try {
    const raw = readFileSync(join(root, '.env'), 'utf8');
    const env = {};
    for (const line of raw.split('\n')) {
      const m = line.match(/^([^#=]+)=(.*)$/);
      if (m) env[m[1].trim()] = m[2].trim().replace(/^["']|["']$/g, '');
    }
    return env;
  } catch (e) {
    console.error('Could not read .env:', e.message);
    process.exit(1);
  }
}

const { VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY } = loadEnv();
if (!VITE_SUPABASE_URL || !VITE_SUPABASE_ANON_KEY) {
  console.error('Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY in .env');
  process.exit(1);
}

const headers = {
  apikey: VITE_SUPABASE_ANON_KEY,
  Authorization: `Bearer ${VITE_SUPABASE_ANON_KEY}`,
  'Content-Type': 'application/json',
};

async function test() {
  console.log('Testing Supabase connection...');
  console.log('URL:', VITE_SUPABASE_URL);

  // 1) Optional: ping REST
  const restUrl = `${VITE_SUPABASE_URL}/rest/v1/`;
  try {
    const r = await fetch(restUrl, { method: 'HEAD', headers });
    console.log('REST endpoint:', r.status);
  } catch (e) {
    console.error('REST request failed:', e.message);
  }

  // 2) Fetch budget_items
  const budgetUrl = `${VITE_SUPABASE_URL}/rest/v1/budget_items?select=*&order=sort_order.asc`;
  try {
    const res = await fetch(budgetUrl, { headers });
    const text = await res.text();
    if (!res.ok) {
      console.error('\nBudget items request failed:', res.status, res.statusText);
      try {
        const err = JSON.parse(text);
        console.error('Error:', err.message || err);
      } catch {
        console.error('Response:', text.slice(0, 500));
      }
      process.exit(1);
    }
    let data;
    try {
      data = JSON.parse(text);
    } catch {
      data = [];
    }
    console.log('\nBudget items:', Array.isArray(data) ? data.length : 0, 'rows');
    if (Array.isArray(data) && data.length > 0) {
      console.log('Sample:', JSON.stringify(data[0], null, 2).slice(0, 300) + '...');
    }
    console.log('\nSupabase connection and budget_items table OK.');
  } catch (e) {
    console.error('\nBudget items fetch error:', e.message);
    process.exit(1);
  }
}

test();
