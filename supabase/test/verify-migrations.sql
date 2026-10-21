-- DTB Technologies — Lead Management System
-- Structural verification of the six migrations against a REAL Supabase project.
-- Output is a PASS/FAIL summary only; it contains no secrets and no client data.
--
-- Usage (SQL Editor on the TEST project, or psql against any Supabase-compatible DB):
--   Supabase CLI:  supabase db ... (n/a)  — paste into SQL Editor → Run, or:
--   psql "$DB_URL" -v ON_ERROR_STOP=1 -f supabase/test/verify-migrations.sql

create temp table verify_log (name text, pass boolean, detail text);

-- 1. Tables exist.
do $$
declare
    t text;
begin
    foreach t in array array['staff_members', 'leads', 'lead_activities', 'enquiry_intake'] loop
        if to_regclass('public.' || t) is not null then
            insert into verify_log values ('table: ' || t || ' exists', true, null);
        else
            insert into verify_log values ('table: ' || t || ' exists', false, 'missing');
        end if;
    end loop;
end $$;

-- 2. RLS enabled AND forced on all four tables.
do $$
declare
    r record;
begin
    for r in
        select c.relname, c.relrowsecurity, c.relforcerowsecurity
        from pg_class c
        where c.oid in ('public.staff_members'::regclass, 'public.leads'::regclass,
                        'public.lead_activities'::regclass, 'public.enquiry_intake'::regclass)
    loop
        insert into verify_log values (
            'rls: ' || r.relname || ' enabled+forced',
            r.relrowsecurity and r.relforcerowsecurity,
            'enable=' || r.relrowsecurity || ' force=' || r.relforcerowsecurity);
    end loop;
end $$;

-- 3. Expected policies present; immutable history has no UPDATE/DELETE policies;
--    staff records have no DELETE policy.
do $$
declare
    n int;
begin
    select count(*) into n from pg_policies
    where schemaname = 'public' and tablename = 'staff_members'
      and policyname in ('staff_select', 'staff_insert', 'staff_update');
    insert into verify_log values ('policies: staff_members has select/insert/update', n = 3, 'count=' || n);

    select count(*) into n from pg_policies
    where schemaname = 'public' and tablename = 'leads'
      and policyname in ('leads_select', 'leads_insert', 'leads_update', 'leads_delete');
    insert into verify_log values ('policies: leads has select/insert/update/delete', n = 4, 'count=' || n);

    select count(*) into n from pg_policies
    where schemaname = 'public' and tablename = 'lead_activities'
      and policyname in ('activities_select', 'activities_insert');
    insert into verify_log values ('policies: lead_activities has select/insert', n = 2, 'count=' || n);

    select count(*) into n from pg_policies
    where schemaname = 'public' and tablename = 'lead_activities'
      and cmd in ('UPDATE', 'DELETE');
    insert into verify_log values ('policies: lead_activities has NO update/delete (immutable)', n = 0, 'count=' || n);

    select count(*) into n from pg_policies
    where schemaname = 'public' and tablename = 'staff_members'
      and cmd = 'DELETE';
    insert into verify_log values ('policies: staff_members has NO delete policy', n = 0, 'count=' || n);

    select count(*) into n from pg_policies
    where schemaname = 'public' and tablename = 'enquiry_intake';
    insert into verify_log values ('policies: enquiry_intake has NO policies (inert)', n = 0, 'count=' || n);
end $$;

-- 4. Grants: anon has zero privileges on CRM tables and intake;
--    authenticated has the expected working set.
do $$
declare
    n int;
begin
    select count(*) into n from information_schema.role_table_grants
    where table_schema = 'public' and grantee = 'anon'
      and table_name in ('staff_members', 'leads', 'lead_activities', 'enquiry_intake');
    insert into verify_log values ('grants: anon has zero privileges on all four tables', n = 0, 'count=' || n);

    select count(*) into n from information_schema.role_table_grants
    where table_schema = 'public' and grantee = 'authenticated'
      and table_name = 'leads' and privilege_type in ('SELECT', 'INSERT', 'UPDATE', 'DELETE');
    insert into verify_log values ('grants: authenticated full CRUD on leads', n = 4, 'count=' || n);

    select count(*) into n from information_schema.role_table_grants
    where table_schema = 'public' and grantee = 'authenticated'
      and table_name = 'lead_activities' and privilege_type in ('SELECT', 'INSERT');
    insert into verify_log values ('grants: authenticated select+insert on lead_activities', n = 2, 'count=' || n);

    select count(*) into n from information_schema.role_table_grants
    where table_schema = 'public' and grantee = 'authenticated'
      and table_name = 'enquiry_intake';
    insert into verify_log values ('grants: authenticated has NO access to enquiry_intake', n = 0, 'count=' || n);
end $$;

-- 5. Functions and the actor_id default.
do $$
declare
    n int;
    d text;
begin
    select count(*) into n from pg_proc p
    join pg_namespace ns on ns.oid = p.pronamespace
    where ns.nspname = 'public'
      and (p.oid in (to_regprocedure('public.is_active_staff()'),
                     to_regprocedure('public.is_owner()'),
                     to_regprocedure('public.set_updated_at()'),
                     to_regprocedure('public.lead_status_audit()'),
                     to_regprocedure('public.lead_created_audit()'),
                     to_regprocedure('public.change_lead_status(uuid,text)')));
    insert into verify_log values ('functions: all six helpers/triggers/rpc exist', n = 6, 'count=' || n);

    select column_default into d from information_schema.columns
    where table_schema = 'public' and table_name = 'lead_activities' and column_name = 'actor_id';
    insert into verify_log values ('functions: actor_id defaults to auth.uid()', d like '%auth.uid()%', 'default=' || coalesce(d, 'none'));
end $$;

-- 6. Triggers.
do $$
declare
    n int;
begin
    select count(*) into n from pg_trigger
    where not tgisinternal
      and (tgrelid = 'public.staff_members'::regclass and tgname = 'staff_members_updated_at'
        or tgrelid = 'public.leads'::regclass and tgname in ('leads_updated_at', 'leads_status_audit', 'leads_created_audit'));
    insert into verify_log values ('triggers: updated_at x2 + status audit + created audit', n = 4, 'count=' || n);
end $$;

-- 7. Indexes.
do $$
declare
    n int;
begin
    select count(*) into n from pg_indexes
    where schemaname = 'public'
      and indexname in ('staff_members_status_idx', 'leads_status_idx', 'leads_assigned_idx',
                        'leads_followup_idx', 'leads_created_idx', 'lead_activities_lead_idx');
    insert into verify_log values ('indexes: all six present', n = 6, 'count=' || n);
end $$;

-- 8. Input constraints.
do $$
declare
    n int;
begin
    select count(*) into n from pg_constraint
    where conrelid in ('public.leads'::regclass, 'public.lead_activities'::regclass)
      and conname in ('leads_reachable_check', 'leads_contact_name_len',
                      'lead_activities_body_len', 'lead_activities_status_pair');
    insert into verify_log values ('constraints: reachability, name length, body length, status pair', n = 4, 'count=' || n);
end $$;

\echo '================ MIGRATION VERIFICATION SUMMARY ================'
select name, pass, coalesce(detail, '') as detail from verify_log order by pass, name;
\echo '==============================================================='

do $$
declare
    failures int;
begin
    select count(*) into failures from verify_log where not pass;
    if failures > 0 then
        raise exception 'MIGRATION VERIFICATION FAILED: % failing checks', failures;
    else
        raise notice 'MIGRATION VERIFICATION PASSED: all structural checks green';
    end if;
end $$;
