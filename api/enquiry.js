// DTB Technologies — public enquiry intake endpoint (DTB-CONVERT-001B)
//
// Runs as a Vercel Function (api/enquiry.js) and inside the local Express dev
// server (server.js mounts the same handler). Persists to the
// public.enquiry_intake table using the SERVICE ROLE key, which lives only in
// server-side environment variables — never shipped to the browser. The table
// has no anon/authenticated insert grants (supabase/migrations 005 + 007).
//
// Required env vars (server-side only):
//   SUPABASE_URL              e.g. https://<project>.supabase.co
//   SUPABASE_SERVICE_ROLE_KEY secret — Vercel env only, never NEXT_PUBLIC/client
// Optional env vars:
//   RESEND_API_KEY            email notification service key
//   DTB_NOTIFY_EMAIL          inbox that receives enquiry notifications
//   DTB_NOTIFY_FROM           verified sender, e.g. enquiries@dtbtech.org
//
// Response contract:
//   201 { ok:true, reference:"DTB-YYYYMMDD-NNNN", duplicate:false }
//   200 { ok:true, reference:"DTB-...", duplicate:true }   (idempotent retry)
//   400 { ok:false, error:"validation", fields:{...} }
//   405 / 409 / 429 / 500 / 502 / 503 { ok:false, error:"..." }
// Success is only claimed when the row is actually persisted.

'use strict';

const POSTGREST_TIMEOUT_MS = 8000;
const MIN_FILL_MS = 1500;              // faster than this is almost certainly a bot
const MAX_BODY_BYTES = 32 * 1024;
const RATE_WINDOW_MS = 60 * 60 * 1000; // per-IP: 5 per hour
const RATE_MAX_PER_WINDOW = 5;
const RATE_DAY_MAX = 20;               // best-effort global daily cap

const ALLOWED_SERVICES = new Set([
    'Business website',
    'Website redesign or repair',
    'Online store or booking website',
    'Custom web or mobile application',
    'POS or business software',
    'Hosting, maintenance or IT support',
    'Other / not sure'
]);
const ALLOWED_PREFERRED = new Set(['whatsapp', 'email', 'phone']);
const ALLOWED_REGIONS = new Set(['Australia', 'Kenya', 'Other / remote']);
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

// Best-effort in-memory rate limiting. On Vercel each function instance has its
// own bucket, so this is a floor not a guarantee — documented in
// docs/enquiry-intake.md.
const ipHits = new Map();

function rateLimited(ip) {
    const now = Date.now();
    const dayAgo = now - 24 * 60 * 60 * 1000;
    let rec = ipHits.get(ip);
    if (!rec) { rec = { window: [], day: [] }; ipHits.set(ip, rec); }
    rec.window = rec.window.filter((t) => now - t < RATE_WINDOW_MS);
    rec.day = rec.day.filter((t) => now - t < dayAgo);
    if (rec.window.length >= RATE_MAX_PER_WINDOW || rec.day.length >= RATE_DAY_MAX) return true;
    rec.window.push(now);
    rec.day.push(now);
    if (ipHits.size > 10000) ipHits.clear();
    return false;
}

function clientIp(req) {
    // Prefer the platform-provided client IP; a caller can spoof or vary
    // X-Forwarded-For, so the first entry is untrusted. The LAST XFF entry is
    // the one appended by the edge proxy.
    const real = req.headers['x-real-ip'];
    if (typeof real === 'string' && real.length) return real.trim();
    const fwd = req.headers['x-forwarded-for'];
    if (typeof fwd === 'string' && fwd.length) {
        const parts = fwd.split(',');
        return parts[parts.length - 1].trim();
    }
    return (req.socket && req.socket.remoteAddress) || 'unknown';
}

function readBody(req) {
    // Any pre-parsed body (Express/Vercel), including JSON `null`, returns
    // immediately — the stream was already consumed, so listening for `end`
    // would hang forever.
    if (req.body !== undefined) {
        if (typeof req.body === 'string') {
            try { return Promise.resolve(JSON.parse(req.body)); } catch (_) { return Promise.resolve(null); }
        }
        return Promise.resolve(req.body);
    }
    return new Promise((resolve) => {
        let raw = '';
        let tooBig = false;
        req.on('data', (c) => {
            raw += c;
            if (raw.length > MAX_BODY_BYTES) { tooBig = true; req.destroy(); }
        });
        req.on('end', () => {
            if (tooBig) return resolve(null);
            try { resolve(JSON.parse(raw)); } catch (_) { resolve(null); }
        });
        req.on('error', () => resolve(null));
    });
}

const str = (v, max) => (typeof v === 'string' ? v.trim().slice(0, max) : '');

function validate(b) {
    const fields = {};
    const name = str(b.name, 120);
    if (!name) fields.name = 'required';
    const service = str(b.service, 80);
    if (!ALLOWED_SERVICES.has(service)) fields.service = 'invalid';
    const description = str(b.description, 4000);
    if (description.length < 15) fields.description = 'min_15';
    const email = str(b.email, 254).toLowerCase();
    const phone = str(b.phone, 40);
    if (email && !EMAIL_RE.test(email)) fields.email = 'invalid';
    if (!email && phone.replace(/\D/g, '').length < 7) {
        fields.contact = 'email_or_phone_required';
    }
    const preferred = str(b.preferredContact, 20).toLowerCase();
    const preferredContact = ALLOWED_PREFERRED.has(preferred) ? preferred : 'email';
    if (preferredContact === 'email' && !email) fields.email = 'required_for_preferred';
    if ((preferredContact === 'phone' || preferredContact === 'whatsapp') && !phone) {
        fields.phone = 'required_for_preferred';
    }
    if (b.consentGiven !== true) fields.consent = 'required';
    if (str(b.website, 200) !== '') fields.bot = 'honeypot'; // honeypot must stay empty
    const elapsed = Number(b.elapsedMs);
    if (!Number.isFinite(elapsed) || elapsed < MIN_FILL_MS) fields.bot = 'too_fast';
    const idempotencyKey = str(b.idempotencyKey, 64);
    if (idempotencyKey.length < 8) fields.idempotency = 'required';
    return {
        ok: Object.keys(fields).length === 0,
        fields,
        data: {
            contact_name: name || null,
            business_name: str(b.business, 80) || null,
            email: email || null,
            phone: phone || null,
            country: ALLOWED_REGIONS.has(str(b.region, 40)) ? str(b.region, 40) : null,
            service_required: service || null,
            project_description: description || null,
            budget: str(b.budget, 60) || null,
            timeframe: str(b.timeframe, 60) || null,
            consent_given: b.consentGiven === true,
            consent_text: str(b.consentText, 500) || null,
            email_consent: b.emailConsent === true,
            preferred_contact: preferredContact,
            source_page: str(b.sourcePage, 200) || null,
            idempotency_key: idempotencyKey || null,
            utm: (b.consentGiven === true && b.utm && typeof b.utm === 'object') ? {
                source: str(b.utm.source, 100) || null,
                medium: str(b.utm.medium, 100) || null,
                campaign: str(b.utm.campaign, 100) || null
            } : null
        }
    };
}

async function postgrest(path, init, serviceKey, url) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), POSTGREST_TIMEOUT_MS);
    try {
        return await fetch(url + '/rest/v1' + path, {
            ...init,
            signal: controller.signal,
            headers: {
                apikey: serviceKey,
                Authorization: 'Bearer ' + serviceKey,
                'Content-Type': 'application/json',
                ...(init && init.headers)
            }
        });
    } finally {
        clearTimeout(timer);
    }
}

async function sendNotifications(env, row) {
    // Dormant unless both values are configured; never blocks persistence.
    if (!env.RESEND_API_KEY || !env.DTB_NOTIFY_EMAIL) return 'skipped_not_configured';
    const from = env.DTB_NOTIFY_FROM || 'enquiries@dtbtech.org';
    const send = (to, subject, text) => fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { Authorization: 'Bearer ' + env.RESEND_API_KEY, 'Content-Type': 'application/json' },
        body: JSON.stringify({ from, to, subject, text })
    });
    try {
        await send(env.DTB_NOTIFY_EMAIL,
            'New enquiry ' + row.lead_reference + ' — ' + row.service_required,
            [
                'Reference: ' + row.lead_reference,
                'Name: ' + row.contact_name,
                'Business: ' + (row.business_name || '—'),
                'Preferred contact: ' + row.preferred_contact,
                'Email: ' + (row.email || '—'),
                'Phone: ' + (row.phone || '—'),
                'Region: ' + (row.country || '—'),
                'Budget: ' + (row.budget || '—'),
                'Timeframe: ' + (row.timeframe || '—'),
                '',
                row.project_description
            ].join('\n'));
        // Visitor acknowledgement only when they explicitly opted in
        // (Spam Act 2003 — consent-labelled transactional message).
        if (row.email_consent && row.email) {
            await send(row.email,
                'We received your enquiry — ' + row.lead_reference,
                'Hi ' + row.contact_name + ',\n\nThanks for contacting DTB Technologies. '
                + 'Your enquiry reference is ' + row.lead_reference + '. '
                + 'We reply during business hours.\n\n— DTB Technologies');
        }
        return 'sent';
    } catch (_) {
        return 'failed';
    }
}

async function handler(req, res) {
    res.setHeader('Cache-Control', 'no-store');
    if (req.method !== 'POST') {
        res.setHeader('Allow', 'POST');
        return res.status(405).json({ ok: false, error: 'method_not_allowed' });
    }

    const env = process.env;
    if (!env.SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY) {
        // Honest failure — the public site keeps WhatsApp/email fallbacks.
        return res.status(503).json({ ok: false, error: 'not_configured' });
    }

    if (rateLimited(clientIp(req))) {
        return res.status(429).json({ ok: false, error: 'rate_limited' });
    }

    const declared = Number(req.headers['content-length']);
    if (Number.isFinite(declared) && declared > MAX_BODY_BYTES) {
        return res.status(413).json({ ok: false, error: 'payload_too_large' });
    }
    const body = await readBody(req);
    if (body === null || typeof body !== 'object') {
        return res.status(400).json({ ok: false, error: 'invalid_json' });
    }
    if (JSON.stringify(body).length > MAX_BODY_BYTES) {
        return res.status(413).json({ ok: false, error: 'payload_too_large' });
    }

    const v = validate(body);
    if (v.fields.bot) return res.status(400).json({ ok: false, error: 'rejected' }); // silent-ish drop
    if (!v.ok) return res.status(400).json({ ok: false, error: 'validation', fields: v.fields });

    const insert = await postgrest('/enquiry_intake', {
        method: 'POST',
        headers: { Prefer: 'return=representation' },
        body: JSON.stringify(v.data)
    }, env.SUPABASE_SERVICE_ROLE_KEY, env.SUPABASE_URL).catch(() => null);

    if (!insert) return res.status(502).json({ ok: false, error: 'store_unreachable' });

    if (insert.status === 409) {
        // Idempotency conflict: fetch the original row and echo its reference.
        const existing = await postgrest(
            '/enquiry_intake?idempotency_key=eq.' + encodeURIComponent(v.data.idempotency_key)
            + '&select=lead_reference',
            { method: 'GET' }, env.SUPABASE_SERVICE_ROLE_KEY, env.SUPABASE_URL
        ).catch(() => null);
        const rows = existing && existing.ok ? await existing.json().catch(() => []) : [];
        if (rows.length && rows[0].lead_reference) {
            return res.status(200).json({ ok: true, reference: rows[0].lead_reference, duplicate: true });
        }
        return res.status(409).json({ ok: false, error: 'conflict' });
    }

    if (!insert.ok) {
        const errBody = await insert.json().catch(() => null);
        if (errBody && errBody.code === 'PGRST204') {
            // Column unknown to PostgREST — migration 007 not yet applied.
            return res.status(503).json({ ok: false, error: 'store_not_ready' });
        }
        return res.status(502).json({ ok: false, error: 'store_failed' });
    }

    const rows = await insert.json().catch(() => []);
    const row = rows[0];
    if (!row || !row.lead_reference) {
        return res.status(502).json({ ok: false, error: 'store_failed' });
    }

    const notification = await sendNotifications(env, row);
    return res.status(201).json({ ok: true, reference: row.lead_reference, duplicate: false, notification });
}

module.exports = handler;
module.exports.default = handler;
