#!/usr/bin/env node
// DTB Technologies — hosted Supabase verification (DTB-LEADS-002A, item E).
//
// RUN ONLY AGAINST THE ISOLATED TEST PROJECT — never against production.
//
// Runs the authorisation and audit-integrity matrix against a REAL hosted
// Supabase project using the publishable key only (never a service key).
// Complements supabase/test/rls-test.sql, which proves the same guarantees
// against a local Postgres stub.
//
// Request semantics (per DTB-LEADS-002B):
//   * anonymous requests carry the publishable key in the `apikey` header only —
//     it is never treated as a Bearer JWT;
//   * authenticated requests carry the real access token from Supabase Auth in
//     `Authorization: Bearer`, plus the `apikey` header.
//
// Failure semantics:
//   * the runner aborts immediately if any required owner/staff/non-staff test
//     account is missing or cannot authenticate;
//   * an authentication failure, missing account, wrong key or network error is
//     NEVER counted as a successful RLS denial (a denial must be HTTP 403 or
//     404; 401 means the key/token is wrong, 2xx means data leaked, 0 means a
//     network error — all of those FAIL);
//   * every required test executes (no silent skips in full mode; dependent
//     sections abort loudly instead of passing vacuously) and synthetic records
//     are cleaned up even when tests fail.
//
// Usage:
//   node supabase/test/hosted-verification.mjs <preview-base-url> [--env <dotenv-file>]
//   node supabase/test/hosted-verification.mjs --url <supabase-url> --env <dotenv-file>
//   node supabase/test/hosted-verification.mjs <preview-base-url> --anon-only   (partial pre-check)
//
// Credentials are read from the environment or a dotenv file and are NEVER
// printed. Supported names:
//   SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY   (fallback when no preview URL given)
//   TEST_OWNER_EMAIL / TEST_OWNER_PASSWORD     (linked staff_members row, role owner)
//   TEST_STAFF_EMAIL / TEST_STAFF_PASSWORD     (linked staff_members row, role staff)
//   TEST_OUTSIDER_EMAIL / TEST_OUTSIDER_PASSWORD (auth user WITHOUT a staff row)

const args = process.argv.slice(2);

function parseArgs(argv) {
    const out = { positional: [], anonOnly: false };
    for (let i = 0; i < argv.length; i++) {
        if (argv[i] === '--env') out.envFile = argv[++i];
        else if (argv[i] === '--url') out.url = argv[++i];
        else if (argv[i] === '--anon-only') out.anonOnly = true;
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
    if (/Protected by Vercel Authentication/i.test(text)) {
        throw new Error('preview is behind Vercel Deployment Protection (SSO) — disable it for this deployment or pass the values via SUPABASE_URL/SUPABASE_PUBLISHABLE_KEY');
    }
    const u = /url:\s*"([^"]*)"/.exec(text);
    const k = /publishableKey:\s*"([^"]*)"/.exec(text);
    if (!u || !k || !u[1] || !k[1]) throw new Error('preview config has empty values — env vars not applied to this deployment');
    return { url: u[1], key: k[1] };
}

function maskTarget(url) {
    try {
        const h = new URL(url).host;
        const ref = h.split('.')[0];
        return h.replace(ref, ref.slice(0, 3) + '***');
    } catch { return '(unparsable url)'; }
}

class SetupError extends Error {}

const opts = parseArgs(args);
await loadDotenv(opts.envFile);

let URL_, KEY;
try {
    if (opts.url || (opts.positional[0] && /^https?:\/\//.test(opts.positional[0]))) {
        const base = opts.url || opts.positional[0];
        ({ url: URL_, key: KEY } = await configFromPreview(base));
    } else if (process.env.SUPABASE_URL && process.env.SUPABASE_PUBLISHABLE_KEY) {
        URL_ = process.env.SUPABASE_URL.replace(/\/+$/, '');
        KEY = process.env.SUPABASE_PUBLISHABLE_KEY;
    } else {
        console.error('No source of Supabase config: pass a preview base URL, or set SUPABASE_URL + SUPABASE_PUBLISHABLE_KEY.');
        process.exit(2);
    }
} catch (e) {
    console.log('ABORTED: ' + (e && e.message ? e.message : e));
    process.exit(2);
}
console.log('Target project (masked): ' + maskTarget(URL_) + '  — must be the isolated TEST project');

let pass = 0, fail = 0;
function check(name, ok, detail) {
    if (ok) { pass++; console.log('PASS  ' + name); }
    else { fail++; console.log('FAIL  ' + name + (detail ? '  [' + detail + ']' : '')); }
}

// A denial is a proper RLS/permission result: 403 (permission denied / RLS
// violation) or 404 (table not visible to the role). Anything else — 401
// (bad key/token), 2xx (data leaked), 5xx or 0 (network error) — is NOT a pass.
const denied = (status) => status === 403 || status === 404;
const detail = (r) => 'HTTP ' + r.status + (r.error ? ' network: ' + r.error : '') + ((r.body && r.body.message) ? ' ' + r.body.message : '');

// REST helper. token === null → anonymous (apikey header only, no Bearer).
function api(token) {
    const base = { apikey: KEY, 'Content-Type': 'application/json' };
    const headers = token ? { ...base, Authorization: 'Bearer ' + token } : base;
    async function req(method, path, payload, prefer) {
        const h = { ...headers };
        if (prefer) h.Prefer = prefer;
        try {
            const r = await fetch(URL_ + path, { method, headers: h, body: payload === undefined ? undefined : JSON.stringify(payload) });
            return { status: r.status, body: await r.json().catch(() => null) };
        } catch (e) {
            return { status: 0, body: null, error: e.message };
        }
    }
    return {
        get: (path) => req('GET', path),
        post: (path, payload, prefer) => req('POST', path, payload, prefer),
        patch: (path, payload, prefer) => req('PATCH', path, payload, prefer),
        del: (path, prefer) => req('DELETE', path, undefined, prefer)
    };
}

// Sign-in result is three-valued so a network error can never be mistaken for
// a rejected credential (or vice versa).
async function signIn(email, password) {
    try {
        const r = await fetch(URL_ + '/auth/v1/token?grant_type=password', {
            method: 'POST',
            headers: { apikey: KEY, 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        const body = await r.json().catch(() => null);
        if (r.ok && body && body.access_token) return { token: body.access_token };
        return { rejected: true, status: r.status };
    } catch (e) {
        return { networkError: e && e.message ? e.message : String(e) };
    }
}

// Required accounts: abort the whole run if any is missing or cannot sign in.
async function requireAccount(label, emailEnv, passEnv) {
    const email = process.env[emailEnv], password = process.env[passEnv];
    if (!email || !password) {
        throw new SetupError(label + ' test account not configured — set ' + emailEnv + ' and ' + passEnv);
    }
    const res = await signIn(email, password);
    if (res.networkError) throw new SetupError('network error while signing in the ' + label + ' test account — aborting (' + res.networkError + ')');
    if (!res.token) throw new SetupError(label + ' test account could not authenticate (' + emailEnv + ', HTTP ' + res.status + ') — check the credentials or whether the invite was accepted');
    return res.token;
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

// ---------------------------------------------------------------- main run
const state = { probeLeadId: null, staffDisabledByUs: false, staffId: null };

try {
    if (opts.anonOnly) {
        console.log('Mode: ANON-ONLY pre-check (authenticated sections are skipped, not passed)');
        const anon = api(null);
        let r = await anon.get('/rest/v1/leads?select=id&limit=1');
        check('anon: leads select denied', denied(r.status), detail(r));
        r = await anon.post('/rest/v1/leads', LEAD);
        check('anon: leads insert denied', denied(r.status), detail(r));
        r = await anon.get('/rest/v1/staff_members?select=id&limit=1');
        check('anon: staff select denied', denied(r.status), detail(r));
        r = await anon.get('/rest/v1/lead_activities?select=id&limit=1');
        check('anon: activities select denied', denied(r.status), detail(r));
        r = await anon.get('/rest/v1/enquiry_intake?select=id&limit=1');
        check('anon: intake select denied (inert table)', denied(r.status), detail(r));
        console.log('Note: as anon, a missing table and a grant-revoked table can both look like 404 — run the full suite to disambiguate.');
    } else {
        // ---------- required accounts: fail fast, before any check ----------
        const ownerT = await requireAccount('Owner', 'TEST_OWNER_EMAIL', 'TEST_OWNER_PASSWORD');
        const staffT = await requireAccount('Staff', 'TEST_STAFF_EMAIL', 'TEST_STAFF_PASSWORD');
        const outsiderT = await requireAccount('Non-staff', 'TEST_OUTSIDER_EMAIL', 'TEST_OUTSIDER_PASSWORD');
        const owner = api(ownerT), staff = api(staffT), outsider = api(outsiderT), anon = api(null);

        // ---------- 0. migrations applied? (checked as an AUTHENTICATED staff user) ----------
        {
            const r = await staff.get('/rest/v1/leads?select=id&limit=1');
            if (r.status === 404 || (r.body && r.body.code === 'PGRST205')) {
                check('migrations applied (leads table reachable)', false, 'table not visible — apply migrations 001-006 first');
                throw new SetupError('migrations 001-006 are not applied to this project — aborting');
            }
            check('migrations applied (leads table reachable)', r.status === 200, detail(r));
            if (r.status !== 200) throw new SetupError('cannot reach the leads table as staff (HTTP ' + r.status + ') — aborting');
        }

        // ---------- 0b. wrong password must be rejected ----------
        {
            const bad = await signIn(process.env.TEST_STAFF_EMAIL, 'definitely-not-the-password');
            if (bad.networkError) check('auth: wrong password rejected', false, 'network error — not a valid rejection: ' + bad.networkError);
            else check('auth: wrong password rejected', bad.rejected === true, bad.token ? 'wrong password produced a session' : 'HTTP ' + bad.status);
        }

        // ---------- 0c. anonymous: everything denied (apikey header only, no Bearer) ----------
        {
            let q = await anon.get('/rest/v1/leads?select=id&limit=1');
            check('anon: leads select denied', denied(q.status), detail(q));
            q = await anon.post('/rest/v1/leads', LEAD);
            check('anon: leads insert denied', denied(q.status), detail(q));
            q = await anon.get('/rest/v1/staff_members?select=id&limit=1');
            check('anon: staff select denied', denied(q.status), detail(q));
            q = await anon.get('/rest/v1/lead_activities?select=id&limit=1');
            check('anon: activities select denied', denied(q.status), detail(q));
            q = await anon.get('/rest/v1/enquiry_intake?select=id&limit=1');
            check('anon: intake select denied (inert table)', denied(q.status), detail(q));
        }

        // ---------- 1. staff identity + probe lead (created FIRST so later checks are non-vacuous) ----------
        let r = await staff.get('/rest/v1/staff_members?email=eq.' + encodeURIComponent(process.env.TEST_STAFF_EMAIL) + '&select=id,email,status');
        const me = (Array.isArray(r.body) ? r.body : []).find((s) => s.email === process.env.TEST_STAFF_EMAIL);
        check('staff: own staff row resolvable (account linked)', Boolean(me && me.id), 'no staff_members row for the staff test account — run the linking SQL');
        if (!me) throw new SetupError('staff test account is not linked to staff_members — run the linking SQL, then re-run');
        if (me.status && me.status !== 'active') throw new SetupError('staff test account is disabled — re-enable it in Supabase, then re-run');
        state.staffId = me.id;

        r = await staff.get('/rest/v1/leads?select=id');
        check('staff: leads readable', r.status === 200 && Array.isArray(r.body), detail(r));
        r = await staff.get('/rest/v1/staff_members?select=id,full_name,role,status');
        check('staff: staff list readable (assignment UI)', r.status === 200 && Array.isArray(r.body) && r.body.length >= 1, detail(r));

        r = await staff.post('/rest/v1/leads?select=id', LEAD, 'return=representation');
        state.probeLeadId = r.status === 201 && Array.isArray(r.body) ? r.body[0].id : null;
        check('staff: lead created', Boolean(state.probeLeadId), detail(r));
        if (!state.probeLeadId) throw new SetupError('staff lead creation failed — aborting dependent checks');

        // Creation audit: exactly one 'created' row, actor = the creating user.
        r = await staff.get('/rest/v1/lead_activities?lead_id=eq.' + state.probeLeadId + '&activity_type=eq.created&select=actor_id');
        const created = Array.isArray(r.body) ? r.body : [];
        check('audit: creation logged exactly once', created.length === 1, 'count=' + created.length);
        check('audit: creation actor is the inserter (DB-managed)', created.length === 1 && created[0].actor_id === state.staffId,
            'actor_id=' + (created[0] && created[0].actor_id ? 'set (mismatch)' : 'null'));

        // ---------- 2. non-staff authenticated: silent empty reads, denied writes ----------
        // The probe lead now exists, so "empty" and "zero rows" prove RLS filtering,
        // not an empty database.
        {
            let q = await outsider.get('/rest/v1/leads?select=id');
            check('non-staff: leads select empty (probe lead invisible)', q.status === 200 && Array.isArray(q.body) && q.body.length === 0,
                q.status === 200 ? 'saw ' + q.body.length + ' rows' : detail(q));
            q = await outsider.get('/rest/v1/staff_members?select=id');
            check('non-staff: staff select empty', q.status === 200 && Array.isArray(q.body) && q.body.length === 0,
                'HTTP ' + q.status + ', rows ' + (Array.isArray(q.body) ? q.body.length : 'n/a'));
            q = await outsider.post('/rest/v1/leads', LEAD);
            check('non-staff: leads insert denied', denied(q.status), detail(q));
            q = await outsider.patch('/rest/v1/leads?id=eq.' + state.probeLeadId, { pipeline_status: 'won' }, 'return=representation');
            check('non-staff: leads update affects zero rows', q.status === 200 && Array.isArray(q.body) && q.body.length === 0,
                'HTTP ' + q.status + ', rows ' + (Array.isArray(q.body) ? q.body.length : 'n/a'));
            q = await outsider.del('/rest/v1/leads?id=eq.' + state.probeLeadId, 'return=representation');
            check('non-staff: leads delete affects zero rows', q.status === 200 && Array.isArray(q.body) && q.body.length === 0,
                'HTTP ' + q.status + ', rows ' + (Array.isArray(q.body) ? q.body.length : 'n/a'));
        }

        // ---------- 3. audit integrity on every write path ----------
        // Owner identity (needed for the forged-actor attempt).
        r = await owner.get('/rest/v1/staff_members?email=eq.' + encodeURIComponent(process.env.TEST_OWNER_EMAIL) + '&select=id,email,status');
        const ownerRow = (Array.isArray(r.body) ? r.body : []).find((s) => s.email === process.env.TEST_OWNER_EMAIL);
        check('owner: own staff row resolvable (account linked)', Boolean(ownerRow && ownerRow.id), 'no staff_members row for the owner test account — run the linking SQL');
        if (!ownerRow) throw new SetupError('owner test account is not linked to staff_members — run the linking SQL, then re-run');
        if (ownerRow.status && ownerRow.status !== 'active') throw new SetupError('owner test account is disabled — re-enable it in Supabase, then re-run');

        // Note WITHOUT actor_id: the column default must record the caller.
        r = await staff.post('/rest/v1/lead_activities?select=actor_id', { lead_id: state.probeLeadId, activity_type: 'note', body: 'Note without explicit actor_id.' }, 'return=representation');
        const noteActor = r.status === 201 && Array.isArray(r.body) ? r.body[0].actor_id : null;
        check('audit: actor_id defaults to auth.uid() (addActivity regression)', noteActor === state.staffId, detail(r));

        // Forged actor must be rejected by the RLS with-check.
        r = await staff.post('/rest/v1/lead_activities', { lead_id: state.probeLeadId, actor_id: ownerRow.id, activity_type: 'note', body: 'Forged actor attempt.' });
        check('audit: cannot log activity as another staff', denied(r.status), detail(r));

        // Direct status update must produce exactly one status_change row.
        r = await staff.patch('/rest/v1/leads?id=eq.' + state.probeLeadId, { pipeline_status: 'contacted' });
        check('staff: direct status update allowed', r.status === 204, detail(r));
        r = await staff.get('/rest/v1/lead_activities?lead_id=eq.' + state.probeLeadId + '&activity_type=eq.status_change&old_status=eq.new&new_status=eq.contacted');
        check('audit: direct update logged exactly once', Array.isArray(r.body) && r.body.length === 1, 'count=' + (Array.isArray(r.body) ? r.body.length : 'n/a'));

        // RPC path: also exactly one (no duplicates).
        r = await staff.post('/rest/v1/rpc/change_lead_status', { p_lead_id: state.probeLeadId, p_new_status: 'qualified' });
        check('staff: change_lead_status rpc works', r.status >= 200 && r.status < 300, detail(r));
        r = await staff.get('/rest/v1/lead_activities?lead_id=eq.' + state.probeLeadId + '&activity_type=eq.status_change&new_status=eq.qualified');
        check('audit: rpc update logged exactly once', Array.isArray(r.body) && r.body.length === 1, 'count=' + (Array.isArray(r.body) ? r.body.length : 'n/a'));

        // Non-status update must not add activity noise.
        r = await staff.get('/rest/v1/lead_activities?lead_id=eq.' + state.probeLeadId + '&select=id');
        const before = Array.isArray(r.body) ? r.body.length : -1;
        r = await staff.patch('/rest/v1/leads?id=eq.' + state.probeLeadId, { next_followup_at: new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10) });
        check('staff: follow-up scheduled', r.status === 204, detail(r));
        r = await staff.get('/rest/v1/lead_activities?lead_id=eq.' + state.probeLeadId + '&select=id');
        check('audit: no noise from non-status updates', Array.isArray(r.body) && r.body.length === before, 'before=' + before + ' after=' + (Array.isArray(r.body) ? r.body.length : 'n/a'));

        // PostgREST join used by the UI.
        r = await staff.get('/rest/v1/leads?id=eq.' + state.probeLeadId + '&select=*,assigned_staff:staff_members!leads_assigned_to_fkey(full_name,email)');
        const joined = Array.isArray(r.body) && r.body[0];
        check('ui: assigned_staff join embeds', Boolean(joined) && 'assigned_staff' in joined, detail(r));

        // Staff must NOT be able to delete leads (owner-only).
        r = await staff.del('/rest/v1/leads?id=eq.' + state.probeLeadId, 'return=representation');
        let stillThere = await staff.get('/rest/v1/leads?id=eq.' + state.probeLeadId + '&select=id');
        check('staff: lead delete denied', Array.isArray(r.body) && r.body.length === 0 && Array.isArray(stillThere.body) && stillThere.body.length === 1,
            'HTTP ' + r.status + ', still visible=' + (Array.isArray(stillThere.body) ? stillThere.body.length : 'n/a'));

        // Staff must not administer staff_members (zero rows affected).
        r = await staff.patch('/rest/v1/staff_members?id=eq.' + ownerRow.id, { status: 'disabled' }, 'return=representation');
        check('staff: staff administration denied', r.status === 200 && Array.isArray(r.body) && r.body.length === 0,
            'HTTP ' + r.status + ', rows ' + (Array.isArray(r.body) ? r.body.length : 'n/a'));

        // ---------- 4. owner administration ----------
        // Disable the staff account, verify lockout, then restore. The probe lead
        // still exists here, so the zero-rows checks are non-vacuous.
        r = await owner.get('/rest/v1/staff_members?email=eq.' + encodeURIComponent(process.env.TEST_STAFF_EMAIL) + '&select=id,status');
        const srow = (Array.isArray(r.body) ? r.body : [])[0];
        if (srow && srow.id) {
            state.staffId = srow.id;
            r = await owner.patch('/rest/v1/staff_members?id=eq.' + srow.id, { status: 'disabled' });
            check('owner: staff disable allowed', r.status === 204, detail(r));
            if (r.status === 204) state.staffDisabledByUs = true;
            let blocked = await staff.get('/rest/v1/leads?select=id');
            check('disabled staff: leads select empty (probe lead invisible)', blocked.status === 200 && Array.isArray(blocked.body) && blocked.body.length === 0,
                'HTTP ' + blocked.status + ', rows ' + (Array.isArray(blocked.body) ? blocked.body.length : 'n/a'));
            r = await staff.post('/rest/v1/leads', LEAD);
            check('disabled staff: leads insert denied', denied(r.status), detail(r));
            r = await staff.patch('/rest/v1/leads?id=eq.' + state.probeLeadId, { pipeline_status: 'won' }, 'return=representation');
            check('disabled staff: leads update affects zero rows', r.status === 200 && Array.isArray(r.body) && r.body.length === 0,
                'HTTP ' + r.status + ', rows ' + (Array.isArray(r.body) ? r.body.length : 'n/a'));
            r = await owner.patch('/rest/v1/staff_members?id=eq.' + srow.id, { status: 'active' });
            check('owner: staff re-enable allowed', r.status === 204, detail(r));
            if (r.status === 204) state.staffDisabledByUs = false;
            let ok = await staff.get('/rest/v1/leads?select=id&limit=1');
            check('re-enabled staff: leads readable again', ok.status === 200 && Array.isArray(ok.body), detail(ok));
        } else {
            check('owner: staff disable allowed', false, 'staff_members row for the staff test account not found');
        }

        // Owner-only delete of the probe lead doubles as cleanup.
        r = await owner.del('/rest/v1/leads?id=eq.' + state.probeLeadId, 'return=representation');
        let gone = await owner.get('/rest/v1/leads?id=eq.' + state.probeLeadId + '&select=id');
        check('owner: lead delete allowed', r.status === 200 && Array.isArray(r.body) && r.body.length === 1 && Array.isArray(gone.body) && gone.body.length === 0,
            'HTTP ' + r.status + ', remaining=' + (Array.isArray(gone.body) ? gone.body.length : 'n/a'));
        if (r.status === 200 && Array.isArray(r.body) && r.body.length === 1) state.probeLeadId = null;
    }
} catch (e) {
    console.log('ABORTED: ' + (e && e.message ? e.message : e));
    fail++;
} finally {
    // ---------- cleanup: always attempt, never silent ----------
    try {
        if (state.staffDisabledByUs) {
            const res = process.env.TEST_OWNER_EMAIL ? await signIn(process.env.TEST_OWNER_EMAIL, process.env.TEST_OWNER_PASSWORD) : null;
            if (res && res.token && state.staffId) {
                await api(res.token).patch('/rest/v1/staff_members?id=eq.' + state.staffId, { status: 'active' });
                console.log('CLEANUP: staff test account restored to active');
            } else {
                console.log('CLEANUP WARNING: could not restore the disabled staff test account — set it back to active in Supabase');
                process.exitCode = 3;
            }
        }
    } catch (e) { console.log('CLEANUP WARNING: staff restore failed — ' + (e && e.message ? e.message : e)); process.exitCode = 3; }
    try {
        if (state.probeLeadId) {
            const res = process.env.TEST_OWNER_EMAIL ? await signIn(process.env.TEST_OWNER_EMAIL, process.env.TEST_OWNER_PASSWORD) : null;
            if (res && res.token) {
                const cleaner = api(res.token);
                await cleaner.del('/rest/v1/leads?id=eq.' + state.probeLeadId, 'return=representation');
                const gone = await cleaner.get('/rest/v1/leads?id=eq.' + state.probeLeadId + '&select=id');
                if (Array.isArray(gone.body) && gone.body.length === 0) {
                    console.log('CLEANUP: synthetic probe lead removed (activities cascade)');
                } else {
                    console.log('CLEANUP WARNING: probe lead may remain — delete it manually (id ' + state.probeLeadId + ')');
                    process.exitCode = 3;
                }
            } else {
                console.log('CLEANUP WARNING: could not sign in to remove the probe lead — delete it manually (id ' + state.probeLeadId + ')');
                process.exitCode = 3;
            }
        }
    } catch (e) { console.log('CLEANUP WARNING: probe lead removal failed — ' + (e && e.message ? e.message : e)); process.exitCode = 3; }
}

console.log('----------------------------------------');
console.log('HOSTED VERIFICATION: ' + pass + ' passed, ' + fail + ' failed' + (process.exitCode ? ' (cleanup warnings — see above)' : ''));
process.exit(fail ? 1 : (process.exitCode || 0));
