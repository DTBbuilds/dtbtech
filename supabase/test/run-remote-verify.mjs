#!/usr/bin/env node
// DTB Technologies — runs supabase/test/verify-migrations.sql against a REAL
// Supabase project through the Management API SQL endpoint, using a personal
// access token. The token is read from SUPABASE_ACCESS_TOKEN or
// ~/.supabase/access-token and is NEVER printed. Run only against the TEST
// project; pass the exact project ref explicitly.
//
// Usage:
//   node supabase/test/run-remote-verify.mjs <project-ref> [--file <sql-path>]
//
// psql meta-commands (\echo etc.) are stripped; the trailing raise-exception
// summary block is replaced by a plain result query so the API returns rows.

import { readFileSync, existsSync } from 'node:fs';
import { homedir } from 'node:os';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const argv = process.argv.slice(2);
const ref = argv.find((a) => !a.startsWith('--'));
const fileIdx = argv.indexOf('--file');
const sqlPath = fileIdx > -1 ? argv[fileIdx + 1] : resolve(dirname(fileURLToPath(import.meta.url)), 'verify-migrations.sql');

if (!ref || !/^[a-z0-9]{20}$/.test(ref)) {
    console.error('Usage: node supabase/test/run-remote-verify.mjs <project-ref> [--file <sql-path>]');
    process.exit(2);
}

let token = process.env.SUPABASE_ACCESS_TOKEN || '';
if (!token) {
    const p = resolve(homedir(), '.supabase', 'access-token');
    if (existsSync(p)) token = readFileSync(p, 'utf8').trim();
}
if (!token) {
    console.error('No access token: set SUPABASE_ACCESS_TOKEN or run `supabase login`.');
    process.exit(2);
}

let sql = readFileSync(sqlPath, 'utf8');
sql = sql.split(/\r?\n/).filter((l) => !l.trim().startsWith('\\')).join('\n');
const marker = sql.indexOf("-- 8. Input constraints") // keep everything through the checks
const cut = sql.indexOf('do $$\ndeclare\n    failures int;');
if (cut > -1) sql = sql.slice(0, cut);
sql += "\nselect name, pass, coalesce(detail, '') as detail from verify_log order by pass, name;\n";

const res = await fetch(`https://api.supabase.com/v1/projects/${ref}/database/query`, {
    method: 'POST',
    headers: { Authorization: 'Bearer ' + token, 'Content-Type': 'application/json' },
    body: JSON.stringify({ query: sql })
});
const body = await res.json().catch(() => null);
if (!res.ok || !Array.isArray(body)) {
    console.log('QUERY FAILED (HTTP ' + res.status + '): ' + JSON.stringify(body).slice(0, 400));
    process.exit(1);
}

let pass = 0, fail = 0;
for (const r of body) {
    if (r.pass) { pass++; console.log('PASS  ' + r.name); }
    else { fail++; console.log('FAIL  ' + r.name + (r.detail ? '  [' + r.detail + ']' : '')); }
}
console.log('----------------------------------------');
console.log('STRUCTURAL VERIFICATION: ' + pass + ' passed, ' + fail + ' failed');
process.exitCode = fail ? 1 : 0;
