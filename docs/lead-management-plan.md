# DTB Lead Management System — Implementation Plan (Phase 2)

**Status update (DTB-LEADS-002):** the foundation described below is now
implemented on branch `feat/dtb-leads-002-crm`: SQL migrations with RLS
(`supabase/migrations/`), staff auth flow, CRM UI (`dashboard/leads.html`),
build-time config generation and an automated RLS test suite
(`supabase/test/`). It stays inert until `SUPABASE_URL` and
`SUPABASE_PUBLISHABLE_KEY` are configured — see `docs/crm-setup.md`.
The section below is the original Phase 1 audit and plan; the "Option A"
architecture is what was built.

Status: **Plan only — not implemented.** Phase 1 (guided project brief) deliberately
transmits nothing and stores nothing; visitors review and send their own message.
No personal data is being collected by the static site today.

## 1. Current infrastructure audit (2026-10)

| Area | Finding |
| --- | --- |
| Hosting | Vercel static deployment (`vercel.json`, `cleanUrls`, no functions). Local dev is static Express (`server.js`). |
| API layer | None. No `/api/*` routes, no serverless functions in the repo. |
| Database | None. No Postgres/MySQL/Mongo/SQLite anywhere in the repo. |
| Authentication | `js/auth/*` and `dashboard.html` are a client-side demo: `localStorage`/`sessionStorage` session flags, placeholder `YOUR_API_KEY` in `js/auth/auth-service.js`, real Firebase calls commented out. Trivially bypassable; not security. |
| Feedback widget | Stores to `localStorage` only (per-browser demo, no backend). |
| Conclusion | The current stack **cannot** securely support persistence or server-side authorisation. A CRM must not be built on the existing client-side "auth". |

## 2. Requirements (from DTB-LEADS-001 Phase D)

- Lead record: name, business, contact details, service required, project description,
  country, source, budget, timeframe.
- Pipeline status: New → Contacted → Qualified → Proposal Sent → Won / Lost.
- Assigned owner, next follow-up date, notes and activity history.
- Search, filters, basic pipeline reporting.
- Access restricted to authorised DTB staff, enforced **server-side**.

## 3. Recommended architecture

**Option A (recommended): Supabase (managed Postgres + Auth + Row Level Security).**
- Least new moving parts: hosted Postgres, email/password auth with MFA, RLS policies
  enforce "DTB staff only" at the database level, REST/SDK access from a thin serverless
  layer or directly from an authenticated internal page.
- Free/low tier is sufficient for an internal CRM workload.

**Option B: Vercel Serverless Functions + managed Postgres (e.g. Neon) + session auth.**
- Keeps everything inside the existing Vercel project. Requires implementing session
  handling (httpOnly cookie, CSRF protection) and password hashing ourselves.

**Option C: Self-hosted on the existing AU hosting.**
- Maximum control, highest ops burden (backups, patching, TLS). Not recommended initially.

## 4. Data model (Option A sketch)

```
staff_users        id, email, password_hash (managed by Supabase Auth), role (owner/admin), created_at
leads              id, created_at, updated_at,
                   name, business, email, phone,
                   service, description,
                   country (AU/KE/other), source (website-brief/whatsapp/email/referral),
                   budget, timeframe,
                   status (new/contacted/qualified/proposal_sent/won/lost),
                   assigned_to → staff_users.id,
                   next_followup_at
lead_activities    id, lead_id → leads.id, staff_id, type (note/status_change/contact_attempt),
                   body, created_at
```

## 5. Security requirements (non-negotiable)

- All lead endpoints and pages require a **server-side verified session**; RLS or
  middleware denies anonymous reads/writes. No lead data in public static files,
  `localStorage`, or unauthenticated endpoints.
- Passwords hashed (managed auth), sessions in httpOnly Secure cookies, CSRF protection
  on mutating requests.
- Rate limiting + spam protection (e.g. honeypot, time-check, and Vercel/Supabase
  rate limits) on any public intake endpoint, if one is added later.
- Input validation server-side; least-privilege database roles; audit trail via
  `lead_activities`.
- Secrets only as environment variables — never committed.

## 6. Environment variables / credentials required (names only)

```
SUPABASE_URL=
SUPABASE_ANON_KEY=          # public client key, RLS-protected
SUPABASE_SERVICE_ROLE_KEY=  # server-only, never exposed to the browser
STAFF_INITIAL_EMAIL=        # bootstrap owner account (setup-time only)
STAFF_INITIAL_PASSWORD=     # bootstrap owner account (setup-time only, then rotate)
```

Provider setup: create the Supabase project, run the schema migration, create the first
staff user, enable MFA, then restrict dashboard access to DTB staff emails.

## 7. Rollout

1. Provision Supabase project + schema + first staff user (owner does this; secrets stay in Vercel env vars).
2. Build internal `/dashboard/leads` page (existing dashboard shell) reading/writing via authenticated SDK — server-verified session required.
3. Seed pipeline views: status board or filtered list, follow-up reminders, simple counts per status.
4. Only after the CRM is stable: consider an opt-in, consent-labelled public intake API
   with rate limiting, replacing the "prepare and send yourself" flow for visitors who
   explicitly want DTB to store their enquiry. Add a privacy notice at that point.
