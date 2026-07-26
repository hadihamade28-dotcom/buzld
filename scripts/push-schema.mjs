#!/usr/bin/env node
/**
 * Apply Vicino schema to a linked Supabase project.
 *
 * Option A — Personal access token (recommended):
 *   SUPABASE_ACCESS_TOKEN=sbp_xxx node scripts/push-schema.mjs
 *
 * Option B — Database password:
 *   SUPABASE_DB_PASSWORD=xxx node scripts/push-schema.mjs
 */
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import pg from 'pg';

const PROJECT_REF = 'drakbevheyvxalyqqhtr';
const __dirname = dirname(fileURLToPath(import.meta.url));
const sql = readFileSync(join(__dirname, '../supabase/setup-all.sql'), 'utf8');

async function viaManagementApi(token) {
  const res = await fetch(`https://api.supabase.com/v1/projects/${PROJECT_REF}/database/query`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query: sql }),
  });
  const body = await res.text();
  if (!res.ok) throw new Error(`Management API ${res.status}: ${body}`);
  console.log('Schema applied via Supabase Management API.');
}

async function viaPg(password) {
  const client = new pg.Client({
    host: `db.${PROJECT_REF}.supabase.co`,
    port: 5432,
    database: 'postgres',
    user: 'postgres',
    password,
    ssl: { rejectUnauthorized: false },
  });
  await client.connect();
  await client.query(sql);
  await client.end();
  console.log('Schema applied via direct Postgres connection.');
}

const token = process.env.SUPABASE_ACCESS_TOKEN;
const dbPassword = process.env.SUPABASE_DB_PASSWORD;

if (token) {
  viaManagementApi(token).catch((e) => {
    console.error(e.message);
    process.exit(1);
  });
} else if (dbPassword) {
  viaPg(dbPassword).catch((e) => {
    console.error(e.message);
    process.exit(1);
  });
} else {
  console.error('Set SUPABASE_ACCESS_TOKEN or SUPABASE_DB_PASSWORD');
  process.exit(1);
}
