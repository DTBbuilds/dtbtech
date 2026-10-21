#!/usr/bin/env node
// DTB Technologies — hosted Supabase verification (DTB-LEADS-002A, item E).
//
// Runs the authorisation and audit-integrity matrix against a REAL hosted
// Supabase project using the publishable key only (never a service key).
// Complements supabase/test/rls-test.sql, which proves the same guarantees
// against a local Postgres stub.
//
// Usage:
//   node supabase/test/hosted-verification.mjs <preview-base-url> [--env <dotenv-file>]
//   node supabase/test/hosted-verification.mjs --url <supabase-url> --env <dotenv-file>
//
// Credentials, when provided, are read from the environment or a dotenv file and
// are NEVER printed. Supported names:
//   SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY   (fallback when no preview URL given)
//   TEST_OWNER_EMAIL / TEST_OWNER_PASSWORD   (linked staff_members row, role owner)
//   TEST_STAFF_EMAIL / TEST_STAFF_PASSWORD   (linked staff_members row, role staff)
//   TEST_OUTSIDER_EMAIL / TEST_OUTSIDER_PASSWORD (auth user WITHOUT a staff row)
//
// All records created here are synthetic and cleaned up at the end.

const args = process.argv.slice(2);

function parseArgs(argv) {
    const out = { positional: [] };
    for (let i = 0; i < argv.length; i++) {
        if (argv[i] === '--env') out.envFile = argv[++i];
        else if (argv[i] === '--url') out.url = argv[++i];
        else out.positional.push(argv[i]);
    }
    return out;
}

async function loadDotenv(path) {
    const fs = await import('node:fs');
    if (!path || !fs.existsSync(path)) return;
    for (const line of fs.readFileSync(path, 'utf8').split(/\r?\n/)) {
        const m = /^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/.exec(line);
        if (!m) continue;
        let v = m[2].trim();
        if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) v = v.slice(1, -1);
        if (!(m[1] in process.env)) process.env[m[1]] = v;
    }
}

async function configFromPreview(baseUrl) {
    const res = await fetch(new URL('/js/crm/config.js', baseUrl));
    if (!res.ok) throw new Error('preview config fetch failed: HTTP ' + res.status);
    const text = await res.text();
    const u = /url:\s*"([^"]*)"/.exec(text);
    const k = /publishableKey:\s*"([^"]*)"/.exec(text);
    if (!u || !k || !u[1] || !k[1]) throw new Error('preview config has empty values — env vars not applied to this deployment');
    return { url: u[1], key: k[1] };
}

const opts = parseArgs(args);
await loadDotenv(opts.envFile);

let URL_, KEY;
if (opts.url || (opts.positional[0] && /^https?:\/\//.test(opts.positional[0]))) {
    const base = opts.url || opts.positional[0];
    ({ url: URL_, key: KEY } = await configFromPreview(base));
} else if (process.env.SUPABASE_URL && process.env.SUPABASE_PUBLISHABLE_KEY) {
    URL_ = process.env.SUPABASE_URL;
    KEY = process.env.SUPABASE_PUBLISHABLE_KEY;
} else {
    console.error('No source of Supabase config: pass a preview base URL, or set SUPABASE_URL + SUPABASE_PUBLISHABLE_KEY.');
    process.exit(2);
}

let pass = 0, fail = 0;
function check(name, ok, detail) {
    if (ok) { pass++; console.log('PASS  ' + name); }
    else { fail++; console.log('FAIL  ' + name + (detail ? '  [' + detail + ']' : '')); }
}

function rest(token) {
    const headers = { apikey: KEY, Authorization: 'Bearer ' + token, 'Content-Type': 'application/json' };
    return {
        async get(path) { const r = await fetch(URL_ + path, { headers }); return { status: r.status, body: await r.json().catch(() => null) }; },
        async post(path, payload, prefer) {
            const h = { ...headers };
            if (prefer) h.Prefer = prefer;
            const r = await fetch(URL_ + path, { method: 'POST', headers: h, body: JSON.stringify(payload) });
            return { status: r.status, body: await r.json().catch(() => null) };
        },
        async patch(path, payload, prefer) {
            const h = { ...headers };
            if (prefer) h.Prefer = prefer;
            const r = await fetch(URL_ + path, { method: 'PATCH', headers: h, body: JSON.stringify(payload) });
            return { status: r.status, body: await r.json().catch(() => null) };
        },
        async del(path, prefer) {
            const h = { ...headers };
            if (prefer) h.Prefer = prefer;
            const r = await fetch(URL_ + path, { method: 'DELETE', headers: h });
            return { status: r.status, body: await r.json().catch(() => null) };
        }
    };
}

const ANON = KEY; // supabase-js uses the publishable key as the anon bearer

async function signIn(email, password) {
    const r = await fetch(URL_ + '/auth/v1/token?grant_type=password', {
        method: 'POST',
        headers: { apikey: KEY, 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
    });
    const body = await r.json().catch(() => null);
    if (!r.ok || !body || !body.access_token) return null;
    return body.access_token;
}

const LEAD = {
    contact_name: 'Hosted Probe Contact',
    business_name: 'Synthetic Verification Co',
    email: 'hosted-probe@example.com',
    phone: '+61 400 000 000',
    country: 'Australia',
    service_required: 'Business website',
    project_description: 'Synthetic lead created by the hosted verification script; deleted at the end.',
    lead_source: 'other'
};

const anon = rest(ANON);
let owner = null, staff = null, outsider = null;
if (process.env.TEST_OWNER_EMAIL) owner = rest(await signIn(process.env.TEST_OWNER_EMAIL, process.env.TEST_OWNER_PASSWORD) || '');
if (process.env.TEST_STAFF_EMAIL) staff = rest(await signIn(process.env.TEST_STAFF_EMAIL, process.env.TEST_STAFF_PASSWORD) || '');
if (process.env.TEST_OUTSIDER_EMAIL) outsider = rest(await signIn(process.env.TEST_OUTSIDER_EMAIL, process.env.TEST_OUTSIDER_PASSWORD) || '');

// ---------- 0. migrations applied? ----------
{
    const r = await anon.get('/rest/v1/leads?select=id&limit=1');
    const missing = r.status === 404 || (r.body && r.body.code === 'PGRST205');
    if (missing) {
        console.log('FAIL  migrations applied (leads table reachable)  [table missing — apply migrations 001-006 first]');
        process.exit(1);
    }
    check('migrations applied (leads table reachable)', !missing);
}

// ---------- 1. anonymous: everything denied ----------
{
    let r = await anon.get('/rest/v1/leads?select=id&limit=1');
    check('anon: leads select denied', !(r.status >= 200 && r.status < 300), 'HTTP ' + r.status);
    r = await anon.post('/rest/v1/leads', LEAD);
    check('anon: leads insert denied', !(r.status >= 200 && r.status < 300), 'HTTP ' + r.status);
    r = await anon.get('/rest/v1/staff_members?select=id&limit=1');
    check('anon: staff select denied', !(r.status >= 200 && r.status < 300), 'HTTP ' + r.status);
    r = await anon.get('/rest/v1/lead_activities?select=id&limit=1');
    check('anon: activities select denied', !(r.status >= 200 && r.status < 300), 'HTTP ' + r.status);
    r = await anon.get('/rest/v1/enquiry_intake?select=id&limit=1');
    check('anon: intake select denied (inert table)', !(r.status >= 200 && r.status < 300), 'HTTP ' + r.status);
}

// ---------- 2. non-staff authenticated: silent empty reads, denied writes ----------
if (outsider) {
    let r = await outsider.get('/rest/v1/leads?select=id');
    check('non-staff: leads select empty', r.status === 200 && Array.isArray(r.body) && r.body.length === 0,
        r.status === 200 ? 'saw ' + (r.body || []).length + ' rows' : 'HTTP ' + r.status);
    r = await outsider.get('/rest/v1/staff_members?select=id');
    check('non-staff: staff select empty', r.status === 200 && Array.isArray(r.body) && r.body.length === 0,
        'HTTP ' + r.status + ', rows ' + (Array.isArray(r.body) ? r.body.length : 'n/a'));
    r = await outsider.post('/rest/v1/leads', LEAD);
    check('non-staff: leads insert denied', !(r.status >= 200 && r.status < 300), 'HTTP ' + r.status);
}

// ---------- 3. staff workflow + audit integrity ----------
let probeLeadId = null;
if (staff) {
    let r = await staff.get('/rest/v1/leads?select=id');
    check('staff: leads readable', r.status === 200 && Array.isArray(r.body), 'HTTP ' + r.status);
    r = await staff.get('/rest/v1/staff_members?select=id,full_name,role,status');
    check('staff: staff list readable (assignment UI)', r.status === 200 && Array.isArray(r.body) && r.body.length >= 1, 'HTTP ' + r.status);

    r = await staff.post('/rest/v1/leads?select=id', LEAD, 'return=representation');
    probeLeadId = r.status === 201 && Array.isArray(r.body) ? r.body[0].id : null;
    check('staff: lead created', Boolean(probeLeadId), 'HTTP ' + r.status);

    if (probeLeadId) {
        // The caller's own staff id (auth.uid()) for exact actor comparisons.
        r = await staff.get('/rest/v1/staff_members?select=id,email');
        const me = (Array.isArray(r.body) ? r.body : []).find((s) => s.email === process.env.TEST_STAFF_EMAIL);
        const myId = me ? me.id : null;

        // Creation audit: exactly one 'created' row, actor = the creating user.
        r = await staff.get('/rest/v1/lead_activities?lead_id=eq.' + probeLeadId + '&activity_type=eq.created&select=actor_id');
        const created = Array.isArray(r.body) ? r.body : [];
        check('audit: creation logged exactly once', created.length === 1, 'count=' + created.length);
        check('audit: creation actor is the inserter (DB-managed)', created.length === 1 && myId && created[0].actor_id === myId, 'actor_id=' + (created[0] && created[0].actor_id ? 'set' : 'null'));

        // Note WITHOUT actor_id: the column default must record the caller.
        r = await staff.post('/rest/v1/lead_activities?select=actor_id', { lead_id: probeLeadId, activity_type: 'note', body: 'Note without explicit actor_id.' }, 'return=representation');
        const noteActor = r.status === 201 && Array.isArray(r.body) ? r.body[0].actor_id : null;
        check('audit: actor_id defaults to auth.uid() (addActivity regression)', Boolean(myId) && noteActor === myId, 'HTTP ' + r.status);

        // Forged actor must be rejected by the RLS with-check.
        const ownerId = owner ? (await owner.get('/rest/v1/staff_members?select=id&role=eq.owner')).body : null;
        const forgedId = Array.isArray(ownerId) && ownerId[0] ? ownerId[0].id : null;
        if (forgedId) {
            r = await staff.post('/rest/v1/lead_activities', { lead_id: probeLeadId, actor_id: forgedId, activity_type: 'note', body: 'Forged actor attempt.' });
            check('audit: cannot log activity as another staff', !(r.status >= 200 && r.status < 300), 'HTTP ' + r.status);
        }

        // Direct status update must produce exactly one status_change row.
        r = await staff.patch('/rest/v1/leads?id=eq.' + probeLeadId, { pipeline_status: 'contacted' });
        check('staff: direct status update allowed', r.status === 204, 'HTTP ' + r.status);
        r = await staff.get('/rest/v1/lead_activities?lead_id=eq.' + probeLeadId + '&activity_type=eq.status_change&old_status=eq.new&new_status=eq.contacted');
        check('audit: direct update logged exactly once', Array.isArray(r.body) && r.body.length === 1, 'count=' + (Array.isArray(r.body) ? r.body.length : 'n/a'));

        // RPC path: also exactly one (no duplicates).
        r = await staff.post('/rest/v1/rpc/change_lead_status', { p_lead_id: probeLeadId, p_new_status: 'qualified' });
        check('staff: change_lead_status rpc works', r.status >= 200 && r.status < 300, 'HTTP ' + r.status);
        r = await staff.get('/rest/v1/lead_activities?lead_id=eq.' + probeLeadId + '&activity_type=eq.status_change&new_status=eq.qualified');
        check('audit: rpc update logged exactly once', Array.isArray(r.body) && r.body.length === 1, 'count=' + (Array.isArray(r.body) ? r.body.length : 'n/a'));

        // Non-status update must not add activity noise.
        r = await staff.get('/rest/v1/lead_activities?lead_id=eq.' + probeLeadId + '&select=id');
        const before = Array.isArray(r.body) ? r.body.length : -1;
        r = await staff.patch('/rest/v1/leads?id=eq.' + probeLeadId, { next_followup_at: new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10) });
        check('staff: follow-up scheduled', r.status === 204, 'HTTP ' + r.status);
        r = await staff.get('/rest/v1/lead_activities?lead_id=eq.' + probeLeadId + '&select=id');
        check('audit: no noise from non-status updates', Array.isArray(r.body) && r.body.length === before, 'before=' + before + ' after=' + (Array.isArray(r.body) ? r.body.length : 'n/a'));

        // PostgREST join used by the UI.
        r = await staff.get('/rest/v1/leads?id=eq.' + probeLeadId + '&select=*,assigned_staff:staff_members!leads_assigned_to_fkey(full_name,email)');
        const joined = Array.isArray(r.body) && r.body[0];
        check('ui: assigned_staff join embeds', Boolean(joined) && 'assigned_staff' in joined, 'HTTP ' + r.status);

        // Staff must NOT be able to delete leads (owner-only).
        r = await staff.del('/rest/v1/leads?id=eq.' + probeLeadId);
        let stillThere = await staff.get('/rest/v1/leads?id=eq.' + probeLeadId + '&select=id');
        check('staff: lead delete denied', r.status >= 400 || (Array.isArray(stillThere.body) && stillThere.body.length === 1),
            'HTTP ' + r.status + ', still visible=' + (Array.isArray(stillThere.body) ? stillThere.body.length : 'n/a'));

        // Staff must not administer staff_members (zero rows affected).
        r = await staff.patch('/rest/v1/staff_members?id=eq.' + (forgedId || '00000000-0000-0000-0000-000000000000'), { status: 'disabled' }, 'return=representation');
        check('staff: staff administration denied', Array.isArray(r.body) && r.body.length === 0 && (r.status === 200 || r.status === 204), 'HTTP ' + r.status + ', rows ' + (Array.isArray(r.body) ? r.body.length : 'n/a'));
    }
}

// ---------- 4. owner administration ----------
if (owner && staff && probeLeadId) {
    let r = await owner.del('/rest/v1/leads?id=eq.' + probeLeadId);
    let gone = await owner.get('/rest/v1/leads?id=eq.' + probeLeadId + '&select=id');
    check('owner: lead delete allowed', r.status >= 200 && r.status < 300 && Array.isArray(gone.body) && gone.body.length === 0, 'HTTP ' + r.status);
    probeLeadId = null;

    // Disable the staff account, verify lockout, then restore.
    const staffId = (await owner.get('/rest/v1/staff_members?select=id&role=eq.staff')).body;
    const sid = Array.isArray(staffId) && staffId[0] ? staffId[0].id : null;
    if (sid) {
        r = await owner.patch('/rest/v1/staff_members?id=eq.' + sid, { status: 'disabled' });
        check('owner: staff disable allowed', r.status === 204, 'HTTP ' + r.status);
        let blocked = await staff.get('/rest/v1/leads?select=id');
        check('disabled staff: leads select empty', blocked.status === 200 && Array.isArray(blocked.body) && blocked.body.length === 0,
            'HTTP ' + blocked.status + ', rows ' + (Array.isArray(blocked.body) ? blocked.body.length : 'n/a'));
        r = await staff.post('/rest/v1/leads', LEAD);
        check('disabled staff: leads insert denied', !(r.status >= 200 && r.status < 300), 'HTTP ' + r.status);
        r = await owner.patch('/rest/v1/staff_members?id=eq.' + sid, { status: 'active' });
        check('owner: staff re-allowed', r.status === 204, 'HTTP ' + r.status);
        let ok = await staff.get('/rest/v1/leads?select=id&limit=1');
        check('re-enabled staff: leads readable again', ok.status === 200 && Array.isArray(ok.body), 'HTTP ' + ok.status);
    }
}

// ---------- cleanup ----------
if (probeLeadId && staff) {
    const ownerId = (await (owner || staff).get('/rest/v1/staff_members?select=id&role=eq.owner')).body;
    const oid = Array.isArray(ownerId) && ownerId[0] ? ownerId[0].id : null;
    const cleaner = oid ? owner : staff;
    if (cleaner) await cleaner.del('/rest/v1/leads?id=eq.' + probeLeadId);
}

console.log('----------------------------------------');
console.log('HOSTED VERIFICATION: ' + pass + ' passed, ' + fail + ' failed');
process.exit(fail ? 1 : 0);
