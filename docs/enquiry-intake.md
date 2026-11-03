# Public Enquiry Intake — DTB-CONVERT-001B

Status: **code-complete, not activated in production.** Builds on draft PR #2's
inert `enquiry_intake` table per its own activation notes (migration 005):
a server-side endpoint with validation, spam protection and rate limits —
never a direct anon insert.

## Architecture

```
contact.html brief form
  └─ js/enquiry-submit.js  (consent checkbox, honeypot, idempotency key, UTM*)
        └─ POST /api/enquiry
              api/enquiry.js  ← same handler: Vercel Function + Express dev (server.js)
                ├─ validate (lengths, service allowlist, email/phone, consent, honeypot, min-time)
                ├─ rate limit (per-IP 5/hr + 20/day, in-memory, best-effort on serverless)
                └─ PostgREST insert → public.enquiry_intake  (SERVICE ROLE key, server-side only)
                      ├─ trigger → lead_reference "DTB-YYYYMMDD-NNNN"
                      └─ idempotency_key unique → retry/back-button returns same reference
                └─ optional: Resend notification to DTB + opt-in visitor ack
```

*UTM captured only when `consent_given` is true.

## Environment checklist (names only — values stay out of the repo)

| Var | Where | Required |
|---|---|---|
| `SUPABASE_URL` | Vercel (Preview+Prod) + local `.env` | yes |
| `SUPABASE_SERVICE_ROLE_KEY` | Vercel env ONLY — never client, never `js/crm/config.js` | yes |
| `RESEND_API_KEY` | Vercel env | no (notification dormant without it) |
| `DTB_NOTIFY_EMAIL` / `DTB_NOTIFY_FROM` | Vercel env | no |

## Lead lifecycle

Intake rows land as `status='unprocessed'`; active staff can read + triage
(`processed`/`rejected`) via the RLS policies added in migration 007 —
visible in the CRM once a triage view is added there (follow-on). Promotion
to `leads` is a staff action, not automatic.

## Notification status — BLOCKED

`RESEND_API_KEY` is not configured; notification returns
`skipped_not_configured` honestly. Persisted record is the source of truth —
no lead is lost. Owner action: add Resend (or chosen provider) key + verified
sender, then this activates without code change.

## Data protection & Spam Act 2003 notes

- Consent checkbox required before storage; exact consent text persisted.
- Visitor acknowledgement email sent **only** with the explicit opt-in
  (`email_consent`) — transactional, enquiry-related only, no marketing.
- No unnecessary personal fields; UTM only with consent; brief warns against
  passwords/sensitive data.
- Intake table: anon + authenticated have no insert/delete; only the
  service-role endpoint writes; staff read/update is RLS-scoped to active staff.

## Rollback

Function is inert without env vars (503 `not_configured`, site keeps
WhatsApp/email). Migration is additive; rollback =
`drop policy…; revoke select/update…; drop trigger/function/columns` —
contact owner before doing so.

## QA evidence

- `node api/enquiry.test.mjs` — 17 checks green (405/503/400×9/201/idempotent
  409→200/502×2/429).
- `supabase/test/enquiry-intake-test.sql` — structural checks for the
  hosted/local pg harness (grants, indexes, policies, reference format).
- Hosted end-to-end (real reference + notification) is gated on the same
  Supabase test project as PR #2 — see `docs/crm-verification.md`.
