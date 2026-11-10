# DTB-LEADS-INBOX-013 — Private enquiry inbox

**Status:** PR review only. No production merge, and no Auth owner created yet.

## Product
- Private `/dashboard/enquiries` page with DTB Supabase email/password sign-in.
- Server-delivered **publishable-only** browser configuration; never exposes `DTB_INTAKE_SERVICE_KEY`.
- Active staff-membership check and database-level RLS for reading contact details.
- List, filter by status, search references/names/businesses, paginate, inspect full enquiry, call/email links, refresh and sign out.
- Status stages: New (`unprocessed`), Contacted, Qualified, Proposal Sent, Won, Lost, plus legacy Processed/Rejected.
- Staff may only change the **status** column. Private database trigger sets `processed_at` and appends an immutable audit row in private `dtb_internal.enquiry_status_history`.
- No emails/WhatsApp are sent automatically by this release. No quote generation.

## Required owner bootstrap
Current Dtb2 Supabase project `lpvngjkaavvtierwejvi` has **0 Supabase Auth users and 0 staff_members**. The Supabase dashboard login is not automatically a CRM Auth user.
1. In Supabase Dashboard → Authentication → Users, invite your **approved owner email**; don't enable public sign-ups. Never share passwords or invite tokens in GitHub.
2. Link exactly that invited Supabase Auth user's UUID in `public.staff_members` with `role='owner'`, `status='active'` after verifying the email/UUID. A staff account without this row sees *Access denied*.
3. Configure Auth redirect allowlist for the EXACT Preview inbox URL; invite/password-reset and PKCE/recovery routes must be tested before live use.
4. Validate active owner and disabled/nonstaff sign-ins, direct PostgREST read as anon, and column-level grants to prevent modifying customer contact records.

## Vercel branch-scoped Preview variables
- `DTB_INBOX_SUPABASE_URL` = `https://lpvngjkaavvtierwejvi.supabase.co`
- `DTB_INBOX_PUBLISHABLE_KEY` = Dtb2 publishable key (public, `sb_publishable_...`; safe for browser).
- `DTB_INBOX_ENABLED=true` only after proper database RLS migration, no other Preview/Prod branches impacted.
- The inbox config endpoint returns **only** these public client details and includes no elevated key. Don't share secrets in PR/build logs.

## Testing and boundaries
- RLS denies anonymous and authenticated nonstaff, even with published client key.
- Validate owner/staff read, invalid input and authenticated status transition with immutable history; site cannot delete or modify customer details.
- Test 320/375/768/1440px, login/logout/recovery, network failures, search/filters/pagination, nonstaff denial and session timeout.
- This is a **stacked PR based on intake PR #33**, not merged to main and not automatically available on `dtbtech.org`.
- Hosted app E2E remains unverified until the owner has bootstrapped a real Supabase Auth user.
- Notifications/outbox are a separate follow-on and must not be claimed as working.

## Critical current infrastructure detail
The only hosted customer test data is in Dtb2 `public.enquiry_intake` (owner's Preview form success). Never treat the separate `public.leads` pipeline as a synchronised copy; the intake inbox reads the source table directly. Old CRM PR #2/#8 migrations must be reconciled before any future merge.
