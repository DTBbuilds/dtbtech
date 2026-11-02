# DTB-CONVERT-001E — Hosted Verification & Final Release Gates

Date: 2026-11-02 · **Nothing merged, deployed, or activated.**

## 1. PR status & checks

| PR | Head | Check state | Notes |
|----|------|-------------|-------|
| #6 Design system | `191997f` | Sourcery: **failure** (2 security flags) — **formally dispositioned false-positive** below; Vercel preview ✅ | merge-review ready |
| #7 Trust copy | `e4e2364` | merged updated #6 cleanly; no unapproved prices/claims (verified below) | merge-review ready |
| #2 CRM | `25bd06b` | draft; hosted gate unchanged | blocked §4 |
| #8 Enquiry intake | `5ebce79` | 22/22 unit tests green; hosted gate unchanged | blocked §4 |

**Sourcery disposition (PR #6, `components/nav-header.js`):** the flagged
`innerHTML` assigns a static template; all interpolations are
developer-controlled (`prefix` = pathname-depth only, fixed class strings,
static login branch). No user/URL/storage/network data reaches it. Same
pre-existing convention as `site-footer.js`. **Owner waiver requested at
merge review**; DOM-API refactor available as follow-up.

## 2. Marketing release — claims & QA (Workstream A)

- No prices on site (draft matrix `A$__ TBC`, doc-only); Afterpay removed;
  rank/Lighthouse/SLA claims softened — residual VERIFY items listed in
  `docs/claim-matrix.md` §3.
- Routes/links all 200; a11y: skip link focusable (`tabindex=-1`),
  `aria-current` exact-match, landmarks on all pages incl. skills,
  ≥44px targets, reduced-motion honoured.
- Performance: no new heavy assets; lazy images; Font Awesome CDN noted as
  future optimisation.
- Contact fallbacks: WhatsApp/email/copy store nothing and work without
  any backend — verified.
- Internal docs no longer web-served (`/docs/*`, `/supabase/*` → 404).

**Marketing decision: GO** for owner merge review of #6 then #7 — static,
self-contained, tested, reversible.

## 3. Test-project & preview setup instructions (Workstream B prep)

1. Supabase **test** project (free tier): disable public sign-ups
   (Auth→Providers→Email); apply `supabase/migrations/` in order
   (`supabase db push`); set Auth Site URL to the preview `/dashboard/leads`.
2. Vercel **Preview** env (project settings → Preview scope only):
   `SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY` (browser-safe),
   `SUPABASE_SERVICE_ROLE_KEY` (functions only — never publishable slot).
3. Optional notification test: `RESEND_API_KEY`, `DTB_NOTIFY_EMAIL`,
   `DTB_NOTIFY_FROM` (test sender).
4. Then: `node supabase/test/hosted-verification.mjs https://<preview> --env <test dotenv>`
   and `psql -f supabase/test/enquiry-intake-test.sql` against the test DB.
5. Public form E2E on preview: submit → real `DTB-YYYYMMDD-NNNN` reference;
   resubmit → same reference (`duplicate:true`); kill env → honest
   `503 not_configured` + working fallbacks.
Credentials go into env UIs only — never chat, git, or logs.

## 4. Hosted verification status — BLOCKED

No test-project or preview credentials exist in this environment; all hosted
checks (CRM auth matrix, RLS denial, migration 007 apply, real persistence,
distributed rate limit, staff triage permissions, notification delivery) are
**BLOCKED — owner provisioning required**. Not substituted with mocks.

**Distributed rate limiting (production note):** in-memory per-instance
limiting on serverless is a floor, not a guarantee — before go-live, move to a
Supabase-backed counter (insert attempts table + check) or Turnstile challenge
on repeated POSTs; spec in `docs/enquiry-intake.md`.

**Staff triage view:** `enquiry_intake` staff read/update RLS is in place
(migration 007); the CRM UI triage list is the one remaining code gap —
small follow-on inside `dashboard/leads.html` (read rows, mark
processed/rejected). Spec ready; flagged pending, not fabricated.

## 5. Deployment & rollback runbook

Merge order: **#6 → #7** (marketing, independent) → **#2 → #8** (backend,
after hosted verification). Vercel auto-deploys on merge to main.
Rollback: revert merge commits / Vercel "promote previous deployment";
backend envs absent ⇒ intake inert by default (503 honest state).
Migration 007 rollback: drop policies, trigger, sequence, added columns —
additive only, safe to reverse on the test project.

## 6. Final GO/NO-GO

- **Marketing site (PRs #6+#7): GO** — merge-review ready pending owner's
  Sourcery waiver acknowledgement.
- **Backend (PRs #2+#8): NO-GO** — blocked on hosted verification (§4) and
  notification config; owner must provision, then re-run the protocol.
