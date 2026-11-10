# DTB-LEADS-INBOX-013 — Verified Handoff (10 Nov 2026)

## Change set
- New internal `/dashboard/enquiries` responsive inbox, Supabase Auth sign-in, invited-user password setup/recovery, sign-out.
- Search by reference/contact/business, status filtering, pagination, full details and contact links, status-only editing.
- Strict `public.enquiry_intake` RLS: signed-in **active DTB staff** can SELECT and UPDATE(status), no INSERT/DELETE or editing customer PII. Anonymous access denied.
- Private `dtb_internal.enquiry_status_history` trigger records status transitions with actor identity and timestamps.
- Historical staff helper `is_active_staff()`, `is_owner()` anonymous EXECUTE revoked.
- `/api/inbox-config` returns only **public publishable key** and project URL. No service key in frontend or browser API.
- Branch-specific Vercel Preview environment configured for DTB2. Production unchanged.

## Local QA — executed
- PostgreSQL 18.6, CRM migrations 001–006 + intake activation 007 + inbox 013 + helper hardening: PASS.
- Anonymous/no-staff/disabled-staff read denied: PASS.
- Synthetic active owner read and status update: PASS; customer-detail UPDATE grants denied; status audit created exactly one row: PASS.
- Anonymous helper EXECUTE blocked after hardening while staff EXECUTE preserved: PASS.
- Node syntax checks and `npm run build`: PASS.
- `node tests/inbox-config.test.cjs`: PASS; config disabled and public-only enabled states.
- `node tests/inbox-ui.test.cjs` with jsdom@26: PASS; disabled screen, nonstaff screen, active staff list, safe text rendering (no DOM injection), status-only save confirmation.

## Hosted Supabase Dtb2 — executed
- Project `lpvngjkaavvtierwejvi` / `dtb-crm-test`; no new project created.
- Migrations applied and registered:
  - `20261110095025` — `dtb_private_enquiry_inbox_013`.
  - `20261110100055` — `dtb_inbox_helper_hardening`.
- Hosted RLS enabled and forced; **2 policies** (active staff read and status update).
- Anon table SELECT/UPDATE false; authenticated status UPDATE true, email UPDATE false, table DELETE false.
- Hosted no-authenticated-member SELECT returned 0 rows.
- Anonymous `is_active_staff` and `is_owner` EXECUTE both false; authenticated helper remains accessible.
- Existing owner test enquiry preserved: 1 intake row.
- **0 Supabase Auth users and 0 active staff**, so genuine login/session/inbox workflow is **NOT RUN**. Do not claim hosted staff auth passed.

## Owner bootstrap needed for functional login
- Owner must choose and confirm their **intended staff sign-in email**.
- In Dtb2 Supabase Dashboard → Authentication → Users, invite exactly that approved address (or create user through supported Admin UI).
- Explicitly link its auth.users UUID to public.staff_members with `role='owner', status='active'`; never invent owner account or use Supabase dashboard login as Auth identity.
- Configure Auth Site URL and allowed redirects to exact inbox Preview URL; verify invite and recovery flow with real email delivery.
- Check preview page on mobile + desktop, real signed-in status transition, nonstaff denial, failure recovery.
- No automatic notifications yet. Owner must check private inbox manually until notification/outbox release.

## Deployment gate
- This branch is **stacked on draft intake PR #33** and should be reviewed as a draft PR, not merged independently to production.
- Vercel Preview branch only; no Production env, release, data deletion or real customer modifications.
- Migration history versions assigned by Supabase differ from repository file names; reconcile before any `supabase db push` / older CRM PR #8 migration.
- Additional legacy advisor warnings (`set_updated_at` search path and intentionally available authenticated CRM RPCs) to review separately.
- Production GO/NO-GO: **NO-GO** until first real staff login, end-to-end Preview tests, privacy and incident/notification operational gate.
