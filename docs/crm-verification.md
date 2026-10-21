# DTB CRM — Hosted Supabase Verification Protocol (DTB-LEADS-002A, item E)

The local suite (`npm run test:db`) proves the SQL and RLS logic against a
Supabase-compatible stub. Before merging PR #2, the same guarantees must be
re-verified against the **real hosted service**. This document is the exact
protocol. It requires the Supabase project credentials from `docs/crm-setup.md`.

Use a **dedicated test project** (free tier is sufficient) — never a production
database. All records used below are synthetic.

## 1. Setup

1. Create the test project; disable public sign-ups (Auth → Providers → Email).
2. Apply migrations 001–006 in order (SQL Editor or `supabase db push`).
3. Set the test project's Auth **Site URL** to the preview CRM page so invite and
   recovery emails land on the preview set-password view (see `docs/crm-setup.md`).
4. Note the project URL and publishable key; set them as Vercel **Preview**
   environment variables (`SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY`) — publishable
   values only; no service-role key ever goes into the browser or Vercel Preview.
5. Invite two test staff (one owner, one staff) and one address that will NOT be
   linked to `staff_members` (the "non-staff" probe). Complete each invite through
   the CRM set-password view.

## 2. Authentication matrix (browser + supabase-js)

| Check | Expected |
| --- | --- |
| Open `/dashboard/leads` signed out | Staff sign-in screen; no data visible |
| Sign in with wrong password | "Incorrect email or password." |
| Sign in as invited owner | CRM overview renders; header shows owner email |
| Sign in as invited staff | CRM renders; no "Delete lead" button (owner-only) |
| Sign in as non-staff account | "Access restricted — not linked to a DTB staff record" |
| Disable a staff account, sign in again | "Access restricted — disabled" |
| Sign out | Returns to sign-in; no CRM data reachable afterwards |
| Old demo auth (`localStorage` `dtb_auth_user`) | Irrelevant to CRM access; CRM ignores it |

## 3. RLS / PostgREST checks (from a browser console on the CRM page, or a Node script with the publishable key)

```js
const { createClient } = supabase;
const c = createClient(URL, PUBLISHABLE_KEY);
// as ANON (no session):
await c.from('leads').select('*');        // expect: error 42501 / empty + permission denied
await c.from('leads').insert({...});      // expect: permission denied
// as NON-STAFF authenticated:
await c.from('leads').select('*');        // expect: data [] (RLS filters), no error
await c.from('leads').insert({...});      // expect: 42501 new row violates policy
// as STAFF:
await c.from('leads').select('*');        // expect: rows
await c.from('staff_members').select('*');// expect: staff list (assignment UI needs it)
```

Also verify the PostgREST join used by the UI:
`c.from('leads').select('*, assigned_staff:staff_members!leads_assigned_to_fkey(full_name, email)')`
returns embedded owner names.

## 4. Audit integrity (regression for item C)

1. As staff: create a lead → `lead_activities` must contain exactly one `created`
   row with `actor_id` = the creating user (database default; the client sends no actor).
2. As staff: change status via the CRM ("Change status" → RPC) → exactly one
   `status_change` activity.
3. As staff: change status by ANY other supported path (direct table update via the
   same authenticated client) → still exactly one `status_change` activity per
   transition — the trigger, not the client, records history.
4. As staff: attempt `insert into lead_activities` with `actor_id` set to ANOTHER
   staff member → must fail (RLS with-check).
5. As staff: update only budget/follow-up (no status change) → no new activity rows.

## 5. Onboarding flows (item D)

| Check | Expected |
| --- | --- |
| Open a fresh invite link | Set Your Password view; password (min 8) + confirm; continue into CRM |
| Reuse/expire an invite link | "This invitation link is no longer valid…" + sign-in screen |
| Forgot password → email link | Choose a New Password view; new password works on next sign-in |
| Public registration attempt | Impossible: sign-ups disabled and the UI has no sign-up path |

## 6. Preview deployment (item F)

1. With the Preview env vars set, redeploy the branch (any push).
2. Open the Vercel preview URL for `/dashboard/leads` while authenticated as a test
   staff member of the TEST project.
3. Verify: sign-in works, leads list loads, create/status/follow-up operations work,
   and the production site (`https://www.dtbtech.org`) is unaffected.

## 7. Sign-off

Record the results (or screenshots) in PR #2. Merge only after every table above
is green against the hosted service.
