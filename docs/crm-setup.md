# DTB CRM — Setup & Bootstrap Guide (Phase 2)

The lead management system is a static CRM page (`dashboard/leads.html`) backed by
Supabase (Postgres + Auth + RLS). Nothing is activated until the environment
variables below are configured; until then the page shows a clear
"CRM not configured yet" state and the public website is unaffected.

## 1. Create the Supabase project

1. Create a project at supabase.com (choose the region closest to Sydney, e.g. ap-southeast-2).
2. Under **Authentication → Providers → Email**: disable **"Allow new users to sign up"**
   (staff accounts are invited only). Confirm email is optional for invited users.
3. Under **Authentication → URL Configuration**, set the Site URL to
   `https://www.dtbtech.org` and add `https://www.dtbtech.org/dashboard/leads`
   as a redirect URL.

## 2. Apply the database migrations

Run the SQL files in `supabase/migrations/` in numeric order (001 → 006) in the
Supabase **SQL Editor** (or `supabase db push` with the CLI). They create:

- `staff_members` — staff linked to Supabase Auth users (owner/staff roles, active/disabled status)
- `leads` — the lead pipeline records
- `lead_activities` — append-only notes, contacts, follow-ups and status changes
- Row Level Security policies + explicit grants (anonymous users have **no** access)
- `enquiry_intake` — prepared-but-inert table for a future consent-labelled public endpoint
- `change_lead_status()` — atomic status change + history entry

## 3. Bootstrap the owner account (documented process)

1. **Auth → Users → Invite user**: invite the owner's email (e.g. `dtbbuildsoffice@gmail.com`).
   The invitation email links to the CRM page; when opened, the page detects the
   invite flow (`type=invite`) and shows the **Set Your Password** view. The staff
   member chooses a password (minimum 8 characters) and continues straight into
   the CRM. Expired or already-used links show a clear message and a sign-in
   screen with a "Forgot password?" option instead.
2. In the SQL Editor, link the invited Auth user to staff membership:

   ```sql
   insert into public.staff_members (id, email, full_name, role)
   select id, email, 'Full Name', 'owner'
   from auth.users where email = 'OWNER-EMAIL@example.com';
   ```

   (Do this before or right after the invite is accepted; both orders work.)
3. Additional staff: invite via Auth, then insert with `role = 'staff'`.
4. **Password recovery**: the sign-in screen has a "Forgot password?" option that
   sends a reset email; the recovery link opens the same set-password view
   (`type=recovery`). Set **Auth → URL Configuration → Site URL** to
   `https://www.dtbtech.org` so emailed links resolve to the production CRM page.
5. Disable leavers with `update public.staff_members set status = 'disabled' where email = '…';`
   (rows are never deleted, so lead assignment history survives).

## 4. Configure environment variables

Set these in **Vercel → Project → Settings → Environment Variables** (and in a local
`.env` for development, copied from `.env.example`):

| Variable | Purpose |
| --- | --- |
| `SUPABASE_URL` | Project URL, e.g. `https://xyz.supabase.co` |
| `SUPABASE_PUBLISHABLE_KEY` | Modern publishable key (safe for the browser; RLS protects data) |

`npm run build` generates `js/crm/config.js` from these variables at build time
(`scripts/generate-crm-config.mjs`). The generated file is gitignored and never
contains secret keys. No service/secret key is needed for this phase; if one ever
is, it must live only in server-side (Vercel Function) environments.

## 5. Deploy

Push to `main` (or merge the feature PR). Vercel builds and deploys; the CRM is then
available at `https://www.dtbtech.org/dashboard/leads` for active staff only.

## 6. Local development & tests

```bash
npm install
npm run build          # CSS + CRM config generation
npm run test:db        # migrations + RLS suite (needs a local PostgreSQL; see supabase/test/)
```

`supabase/test/local-stub.sql` provides minimal Supabase-compatible stubs (roles,
`auth.users`, `auth.uid()`) for a plain local PostgreSQL instance, and
`supabase/test/rls-test.sql` asserts the full authorisation matrix with synthetic
records only: anonymous denial, non-staff denial, disabled-staff denial, staff
workflow, owner administration, immutability of activity history and input
constraints. Never seed fake client data into production.
