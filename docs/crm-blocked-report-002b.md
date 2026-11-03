# DTB-LEADS-002B — Hosted Verification Blocker Report (issue #16)

**Date:** 2026-11-03 · **Branch:** `feat/dtb-leads-002-crm` @ `25bd06b` · **Mode:** read-only, no credentials changed

## Verdict: outcome (B) — blocked; not a PASS

## Independently verified (local, no credentials)

| Check | Result | Evidence |
|---|---|---|
| Migration order/naming | PASS — 6 migrations `20261021000001-6` applied in filename order; additive only | `supabase/migrations/` |
| RLS design (static) | PASS — forced RLS on staff/leads/activities/intake; owner/staff predicates via `is_active_staff()`; append-only `lead_activities` trigger; atomic status RPC | migrations 001-006 |
| `enquiry_intake` posture | PASS — no grants, no policies; inert by design (migration 005) | static |
| Harness coverage vs `crm-verification.md` | PASS — `hosted-verification.mjs` + `run-remote-verify.mjs` + `rls-test.sql` cover auth matrix, denied CRUD, audit integrity, status transitions, invite/recovery, disabled staff, joins, cleanup | static review |
| Client-side secret hygiene | PASS — publishable key only via generated gitignored `js/crm/config.js`; service role never referenced in client code | `scripts/generate-crm-config.mjs` |
| Secrets in repo/logs | PASS — none found | grep sweep |
| Preview surface | partial — root returns 302 (Vercel preview-protection auth wall); CRM page not publicly reachable, which is correct but blocks unauthenticated browser checks | live check |

## Blocked (NOT RUN) — missing prerequisites

1. **Dedicated non-production Supabase test project** — `SUPABASE_URL` (project ref), `SUPABASE_PUBLISHABLE_KEY`, `SUPABASE_ACCESS_TOKEN` (Management API token for `run-remote-verify.mjs`).
2. **Three synthetic test identities** — `TEST_OWNER_*`, `TEST_STAFF_*`, `TEST_OUTSIDER_*` email/password pairs in the test project (staff rows seeded per `rls-test.sql` fixture pattern).
3. **Vercel Preview env vars** — `SUPABASE_URL` + `SUPABASE_PUBLISHABLE_KEY` (Preview scope only) so `/dashboard/leads` leaves placeholder mode; plus preview-protection bypass or a logged-in browser session for browser E2E.
4. Local postgres for `run-local-tests.sh` — `psql`/`supabase` CLI absent on this host.

## PR #2 / PR #8 dependency review

- PR #8 (`feat/dtb-convert-001b-lead-intake`) is stacked on this branch and blocked by the same gate; **not merged, intake not activated**.
- Main has advanced to `90c05b3` (marketing releases merged); CRM branch untouched since `25bd06b` — no drift conflicts observed on the CRM file set; a rebase/merge check is safe to defer until hosted gates pass.

## Setup checklist for owner (no secrets in repo/comments)

1. Create Supabase **test** project (free tier); disable public sign-ups; apply `supabase/migrations/` in order; set Auth Site URL to the preview `/dashboard/leads`.
2. Create 3 synthetic users; seed `staff_members` (owner/staff/disabled+outsider) per `supabase/test/rls-test.sql` fixture roles.
3. Add Vercel **Preview**-scoped env vars; redeploy preview.
4. Then run: `supabase/test/run-local-tests.sh` (or hosted SQL equivalents), `node supabase/test/run-remote-verify.mjs <project-ref>`, `node supabase/test/hosted-verification.mjs`, and the `/dashboard/leads` browser matrix in `docs/crm-verification.md`.

## GO/NO-GO: **NO-GO** for PR #2 merge until the hosted matrix genuinely passes.
