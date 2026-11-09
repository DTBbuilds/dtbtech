# DTB-CONVERT-011 — Reuse existing DTB2 Supabase infrastructure

**Owner decision:** Reuse existing **DTB2 → dtb-crm-test** from screenshot, currently paused in `ap-southeast-1` (Singapore). **No new project creation.** Until its contents and security are verified, use it **only for synthetic verification**, not as an automatically approved production home for customer data.

## Access blocker verified 10 Nov 2026
The connected Supabase integration has access only to **DTBbuilds's Org** and lists `jat-staging` and `keus-prod`. Neither is the intended environment. It **cannot see DTB2 or dtb-crm-test**, and neither could be resumed or changed in this session. The DTB2 browser dashboard is signed into a different organisation/account. Owner action: resume `dtb-crm-test` in its dashboard and reconnect/authorize the Supabase app in ChatGPT to the account with DTB2 access. Do not share API secrets in chat.

## Two incompatible schemas
1. CRM PR #2 migration 005 creates `public.enquiry_intake`, with `email text NOT NULL`, no idempotency/reference columns; migration 007 on PR #8 adds `lead_reference`, `idempotency_key TEXT`, staff triage and a **numeric, sequence-backed** reference `DTB-YYYYMMDD-NNNN`.
2. New standalone PR #33 creates `public.dtb_enquiries`, with `idempotency_key UUID`, nullable email when phone present, **random hexadecimal** `reference = DTB-YYYYMMDD-XXXXXXXXXXXX`, and no CRM staff policies.
3. PR #33's API inserts into `dtb_enquiries` and checks the hexadecimal reference in its frontend. **It is not compatible with `enquiry_intake` without an explicit reviewed adapter/migration.** Do not blindly apply both paths or toggle env flags to force it.
4. If DTB2 has legacy CRM migrations already, prefer **converging on its single `enquiry_intake` table** with a prospective compatibility migration and correct API mapping. If no CRM migrations exist, independently evaluate the minimal standalone table before creating one. Do not guess which state exists from its project name.

## READ-ONLY hosted discovery (run only after access)
```sql
select current_database() as database_name, current_setting('server_version') as postgres_version;
select to_regclass('public.enquiry_intake') as legacy_intake,
       to_regclass('public.dtb_enquiries') as standalone_intake,
       to_regclass('public.staff_members') as crm_staff,
       to_regclass('public.leads') as crm_leads;
select table_name, column_name, data_type, is_nullable
from information_schema.columns
where table_schema = 'public'
  and table_name in ('enquiry_intake','dtb_enquiries')
order by table_name, ordinal_position;
select c.relname, c.relrowsecurity as rls_enabled, c.relforcerowsecurity as rls_forced
from pg_class c join pg_namespace n on n.oid=c.relnamespace
where n.nspname='public' and c.relname in ('enquiry_intake','dtb_enquiries');
select tablename, policyname, roles, cmd, qual, with_check
from pg_policies where schemaname='public' and tablename in ('enquiry_intake','dtb_enquiries')
order by tablename, policyname;
select rolname, rolbypassrls from pg_roles
where rolname in ('anon','authenticated','service_role');
select table_name, privilege_type, grantee
from information_schema.role_table_grants
where table_schema='public'
and table_name in ('enquiry_intake','dtb_enquiries')
and grantee in ('anon','authenticated','service_role')
order by table_name, grantee, privilege_type;
```

Also list the applied migrations and Supabase security advisors, and check project status. Avoid querying/leaking any existing PII in the discovery result.

## Required next actions
1. Owner resumes project and connects the account with DTB2 organisation access. Reconfirm project ID/region and health.
2. Run SQL above, review installed migrations and RLS/grants; determine if an existing intake table is safely reusable.
3. Prepare schema-adapter/migration based on **actual columns**, not names or guesses. Run a synthetic insert/retry/read-denial test and cleanup. No real customer data yet.
4. Configure Turnstile site/secret and the exact DTB2 project server-only key in Vercel (not the existing unrelated Production keys), preferably Preview first. Do not activate public submit until end-to-end verified.
5. Owner signoff on production use, backup/retention, consent notice and a reliable lead-triage workflow. Test one canary, then deploy only on separate release approval.

**Current outcome:** Local PostgreSQL schema/RLS tests PASS, but hosted DB status and actual lead storage NOT TESTED; **NO-GO** for public activation. No data or infrastructure changed.
