// Node test for api/enquiry.js — runs the real handler against stubbed
// fetch + mock response objects. No network, no Supabase needed.
// Usage: node api/enquiry.test.mjs
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const handler = require('./enquiry.js');

let passed = 0, failed = 0;
const check = (name, cond) => { cond ? passed++ : failed++; console.log(`${cond ? 'PASS' : 'FAIL'} ${name}`); };

const realFetch = globalThis.fetch;
const env = { SUPABASE_URL: 'https://test.supabase.co', SUPABASE_SERVICE_ROLE_KEY: 'test-key' };
Object.assign(process.env, env);

function mockRes() {
    return {
        statusCode: 200, body: null, headers: {},
        setHeader(k, v) { this.headers[k] = v; },
        status(c) { this.statusCode = c; return this; },
        json(o) { this.body = o; return this; }
    };
}
const req = (body, method = 'POST') => ({
    method, headers: { 'x-forwarded-for': '1.2.3.' + Math.floor(Math.random() * 200) }, body,
    on() {}, socket: { remoteAddress: '127.0.0.1' }
});
const good = (over = {}) => ({
    name: 'Test Person', email: 't@example.com', phone: '', preferredContact: 'email',
    service: 'Business website', description: 'A synthetic test enquiry, long enough.',
    budget: '', timeframe: '', region: 'Australia', business: '',
    consentGiven: true, consentText: 'test', emailConsent: false,
    website: '', elapsedMs: 5000, idempotencyKey: 'test-key-' + Math.random().toString(36).slice(2),
    utm: {}, ...over
});
const fakePg = (status, rows) => () => Promise.resolve({ ok: status < 300, status, json: () => Promise.resolve(rows) });

// 1. method check
{
    const res = mockRes();
    await handler(req({}, 'GET'), res);
    check('GET -> 405', res.statusCode === 405);
}
// 2. not_configured without env
{
    delete process.env.SUPABASE_URL;
    const res = mockRes();
    await handler(req(good()), res);
    check('missing env -> 503 not_configured', res.statusCode === 503 && res.body.error === 'not_configured');
    process.env.SUPABASE_URL = env.SUPABASE_URL;
}
// 3-8. validation
{
    globalThis.fetch = fakePg(201, [{ lead_reference: 'DTB-X' }]);
    const cases = [
        ['missing name', good({ name: '' }), 'name'],
        ['bad service', good({ service: 'Hack me' }), 'service'],
        ['short description', good({ description: 'hi' }), 'description'],
        ['no contact detail', good({ email: '', phone: '' }), 'contact'],
        ['bad email', good({ email: 'nope' }), 'email'],
        ['preferred email but no email', good({ email: '', phone: '+61400000000' }), 'email'],
        ['no consent', good({ consentGiven: false }), 'consent'],
        ['honeypot filled', good({ website: 'spam.com' }), 'bot'],
        ['too fast', good({ elapsedMs: 200 }), 'bot'],
        ['no idempotency key', good({ idempotencyKey: '' }), 'idempotency']
    ];
    for (const [name, body, field] of cases) {
        const res = mockRes();
        await handler(req(body), res);
        check(`400 ${name}`, res.statusCode === 400 && (res.body.fields ? !!res.body.fields[field] : true));
    }
}
// 9. success path
{
    globalThis.fetch = fakePg(201, [{ lead_reference: 'DTB-20261102-0001' }]);
    const res = mockRes();
    await handler(req(good()), res);
    check('201 + reference', res.statusCode === 201 && res.body.ok && res.body.reference === 'DTB-20261102-0001' && res.body.duplicate === false);
}
// 10. idempotent conflict -> returns original reference
{
    let calls = 0;
    globalThis.fetch = (url) => {
        calls++;
        return calls === 1
            ? Promise.resolve({ ok: false, status: 409, json: () => Promise.resolve([]) })
            : Promise.resolve({ ok: true, status: 200, json: () => Promise.resolve([{ lead_reference: 'DTB-ORIG-1' }]) });
    };
    const res = mockRes();
    await handler(req(good()), res);
    check('409 conflict -> 200 same reference', res.statusCode === 200 && res.body.reference === 'DTB-ORIG-1' && res.body.duplicate === true);
}
// 11. store failure -> honest 502, no fake success
{
    globalThis.fetch = fakePg(500, []);
    const res = mockRes();
    await handler(req(good()), res);
    check('store fail -> 502, ok:false', res.statusCode === 502 && res.body.ok === false);
}
// 12. unreachable store
{
    globalThis.fetch = () => Promise.reject(new Error('down'));
    const res = mockRes();
    await handler(req(good()), res);
    check('unreachable -> 502 store_unreachable', res.statusCode === 502);
}
// 13. rate limiting fires after cap
{
    globalThis.fetch = fakePg(201, [{ lead_reference: 'R' }]);
    let last;
    const sameIp = () => ({ method: 'POST', headers: { 'x-forwarded-for': '9.9.9.9' }, body: good(), on() {}, socket: {} });
    for (let i = 0; i < 6; i++) { last = mockRes(); await handler(sameIp(), last); }
    check('6th request same IP -> 429', last.statusCode === 429 && last.body.error === 'rate_limited');
}
globalThis.fetch = realFetch;
console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed ? 1 : 0);
