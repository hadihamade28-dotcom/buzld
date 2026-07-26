#!/usr/bin/env node
/**
 * Deploy Vicino edge functions via Supabase Management API.
 *
 *   SUPABASE_ACCESS_TOKEN=sbp_xxx node scripts/deploy-functions.mjs
 */
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const PROJECT_REF = 'drakbevheyvxalyqqhtr';
const FUNCTIONS = ['find-candidates', 'confirm-proximity'];
const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');

async function deployFunction(token, slug) {
  const source = readFileSync(join(root, 'supabase/functions', slug, 'index.ts'), 'utf8');
  const metadata = {
    entrypoint_path: 'index.ts',
    name: slug,
    verify_jwt: true,
  };

  const form = new FormData();
  form.append('metadata', JSON.stringify(metadata));
  form.append('file', new Blob([source], { type: 'text/plain' }), 'index.ts');

  const url = `https://api.supabase.com/v1/projects/${PROJECT_REF}/functions/deploy?slug=${encodeURIComponent(slug)}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: form,
  });

  const body = await res.text();
  if (!res.ok) throw new Error(`${slug}: ${res.status} ${body}`);

  const json = JSON.parse(body);
  console.log(`Deployed ${slug} (version ${json.version}, status ${json.status})`);
}

const token = process.env.SUPABASE_ACCESS_TOKEN;
if (!token) {
  console.error('Set SUPABASE_ACCESS_TOKEN (sbp_...) from https://supabase.com/dashboard/account/tokens');
  process.exit(1);
}

for (const slug of FUNCTIONS) {
  await deployFunction(token, slug);
}

console.log('All edge functions deployed.');
