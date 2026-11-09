# DTB-CONVERT-011 — Secure public project-enquiry intake

**Status: implementation branch only; feature OFF; no database migrations applied.**

## Why the existing Vercel keys aren't sufficient
The existing Production project exposes only `SUPABASE_URL` + `SUPABASE_PUBLISHABLE_KEY`. Neither proves an isolated DTB intake database exists, and the connected Supabase project list shows JAT + KEUS only. **Never insert DTB customer data into either.** This feature deliberately does NOT consume the generic keys.

## Implementation
- `GET /api/enquiry`: returns `enabled:false` until all secure config and owner launch flag are set; client disables the new submit button but preserves WhatsApp/email.
- `POST /api/enquiry`: explicit name, contact method, consent; strict input validation, Origin allowlist, Turnstile **server-side** siteverify and action/hostname checks; bounded payload; best-effort per-instance rate limiting; unique idempotency key.
- Server holds privileged DB key. Public clients receive only an opt-in submit result with reference number following a **confirmed row insert**; no unverified 'submitted' message. On network error, the visitor keeps form data and can use manual alternatives.
- Self-contained additive table migration `supabase/standalone-intake.sql` keeps the table RLS-enabled, grants no anon/authenticated access, and stores no IP addresses.
- No automatic outbound email until verified sender/provider and separate approval; initial records reviewed in Supabase Dashboard.
- No CRM, existing customer data or production environment touched.

## Required Vercel env names (values must be set only through secure settings)
- `DTB_INTAKE_ENABLED=true` — final launch switch; leave unset until tests pass.
- `DTB_INTAKE_SUPABASE_URL` — URL of verified dedicated DTB Supabase project.
- `DTB_INTAKE_SERVICE_KEY` — server-only Supabase `sb_secret_...` key preferred (legacy service-role JWT accepted only for migration compatibility). Send opaque secret key as `apikey`, NOT an `Authorization: Bearer` JWT. NEVER expose or use `NEXT_PUBLIC_`.
- `DTB_TURNSTILE_SITE_KEY` — public Turnstile site key.
- `DTB_TURNSTILE_SECRET_KEY` — private Turnstile secret.
- `DTB_TURNSTILE_HOSTNAMES` — comma-separated exact allowed hosts (including specific Preview only when needed), e.g. `dtbtech.org,www.dtbtech.org`.

Turnstile siteverify uses action `dtb_enquiry`, exact hostname verification and a fresh single-use token. Preview uses independent test credentials. Never use the documented Cloudflare testing key/secret in Production.

## Launch test gates
1. Owner verifies DTB-only database and approves migration, storage/retention notice and release plan.
2. Apply `supabase/standalone-intake.sql` only to approved DB (never JAT/KEUS) and verify columns/indexes/RLS/grants with read-only queries.
3. Configure dedicated secrets, Turnstile hostnames and final launch flag in the correct Vercel scope.
4. Test synthetic submission: 201 with stored reference, repeat request with new challenge & same idempotency yields 200 duplicate. Confirm no anonymous read access.
5. Test invalid/missing consent, wrong domain, invalid bot tokens, spam, oversized input, DB outage and retries. Check privacy notice.
6. Verify owner can actually inspect incoming leads in Supabase dashboard. Avoid publishing visitor information in build logs or GitHub.
7. Enable Submit button and run one owner-controlled live canary before broader acquisition.
8. Rollback: set `DTB_INTAKE_ENABLED=false` (manual channels remain), redeploy/revalidate. Retain stored enquiries pending retention decision; do not drop data to roll back.

**Rate limit caveat:** in-memory per-instance limiter is a secondary control, not a durable global limit. Turnstile is mandatory and more robust throttling should be considered before substantial marketing traffic.

**Privacy:** update DTB's privacy notice to describe collection, access, purpose, retention and third-party providers before enabling the flag. No marketing opt-in is bundled with project-enquiry consent.
