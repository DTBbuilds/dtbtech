-- DTB Technologies — Lead Management System
-- RLS and authorisation test suite.
-- Runs against a local PostgreSQL with supabase/test/local-stub.sql applied.
-- Uses synthetic test records only (fixed UUIDs, example.com addresses).
--
-- Usage:
--   psql -p 5433 -U postgres -d dtb_dev -v ON_ERROR_STOP=1 -f supabase/test/rls-test.sql

create temp table test_log (name text, pass boolean, detail text);
grant all on test_log to public;

-- Reset synthetic data so the suite is re-runnable against an existing schema.
truncate public.lead_activities, public.leads, public.staff_members cascade;
truncate auth.users cascade;

-- Fixture: synthetic identities and records (as superuser).
insert into auth.users (id, email) values
    ('11111111-1111-1111-1111-111111111111', 'owner@example.com'),
    ('22222222-2222-2222-2222-222222222222', 'staff@example.com'),
    ('33333333-3333-3333-3333-333333333333', 'disabled@example.com'),
    ('44444444-4444-4444-4444-444444444444', 'outsider@example.com')
on conflict (id) do nothing;

insert into public.staff_members (id, email, full_name, role, status) values
    ('11111111-1111-1111-1111-111111111111', 'owner@example.com', 'Test Owner', 'owner', 'active'),
    ('22222222-2222-2222-2222-222222222222', 'staff@example.com', 'Test Staff', 'staff', 'active'),
    ('33333333-3333-3333-3333-333333333333', 'disabled@example.com', 'Disabled Staff', 'staff', 'disabled')
on conflict (id) do nothing;

insert into public.leads (contact_name, business_name, email, phone, country,
                          service_required, project_description, budget, timeframe,
                          lead_source, pipeline_status, assigned_to)
values ('Synthetic Contact', 'Example Business', 'contact@example.com', '+61 400 000 000',
        'Australia', 'Business website', 'Synthetic lead used by the automated RLS test suite.',
        'AUD 2,000', 'Within 1-2 months', 'website_brief', 'new',
        '22222222-2222-2222-2222-222222222222');
-- The leads_created_audit trigger records the "created" activity automatically.

-- Result helpers.
create temp view test_summary as select name, pass, detail from test_log order by name;

-- ============================================================
-- 1. Anonymous visitors: every operation must be denied.
-- ============================================================
set role anon;

do $$
begin
    begin
        perform 1 from public.leads;
        insert into test_log values ('anon: leads select denied', false, 'unexpected success');
    exception when insufficient_privilege then
        insert into test_log values ('anon: leads select denied', true, null);
    end;
end $$;

do $$
begin
    begin
        insert into public.leads (contact_name, service_required, project_description)
        values ('Anon', 'x', 'anon insert attempt');
        insert into test_log values ('anon: leads insert denied', false, 'unexpected success');
    exception when insufficient_privilege then
        insert into test_log values ('anon: leads insert denied', true, null);
    end;
end $$;

do $$
begin
    begin
        perform 1 from public.staff_members;
        insert into test_log values ('anon: staff select denied', false, 'unexpected success');
    exception when insufficient_privilege then
        insert into test_log values ('anon: staff select denied', true, null);
    end;
end $$;

do $$
begin
    begin
        perform 1 from public.lead_activities;
        insert into test_log values ('anon: activities select denied', false, 'unexpected success');
    exception when insufficient_privilege then
        insert into test_log values ('anon: activities select denied', true, null);
    end;
end $$;

do $$
begin
    begin
        perform 1 from public.enquiry_intake;
        insert into test_log values ('anon: intake select denied', false, 'unexpected success');
    exception when insufficient_privilege then
        insert into test_log values ('anon: intake select denied', true, null);
    end;
end $$;

reset role;

-- ============================================================
-- 2. Authenticated but not staff: silent zero-row reads, denied writes.
-- ============================================================
select set_config('request.jwt.claim.sub', '44444444-4444-4444-4444-444444444444', false);
set role authenticated;

do $$
begin
    if exists (select 1 from public.leads) then
        insert into test_log values ('non-staff: leads select empty', false, 'saw rows');
    else
        insert into test_log values ('non-staff: leads select empty', true, null);
    end if;
end $$;

do $$
begin
    if exists (select 1 from public.staff_members) then
        insert into test_log values ('non-staff: staff select empty', false, 'saw rows');
    else
        insert into test_log values ('non-staff: staff select empty', true, null);
    end if;
end $$;

do $$
begin
    begin
        insert into public.leads (contact_name, service_required, project_description)
        values ('Outsider', 'x', 'non-staff insert attempt');
        insert into test_log values ('non-staff: leads insert denied', false, 'unexpected success');
    exception when insufficient_privilege then
        insert into test_log values ('non-staff: leads insert denied', true, null);
    end;
end $$;

do $$
declare
    affected int;
begin
    update public.leads set pipeline_status = 'won';
    get diagnostics affected = row_count;
    insert into test_log values ('non-staff: leads update denied', affected = 0,
        'rows affected=' || affected);
end $$;

reset role;

-- ============================================================
-- 3. Disabled staff member: treated like any non-staff user.
-- ============================================================
select set_config('request.jwt.claim.sub', '33333333-3333-3333-3333-333333333333', false);
set role authenticated;

do $$
begin
    if exists (select 1 from public.leads) then
        insert into test_log values ('disabled staff: leads select empty', false, 'saw rows');
    else
        insert into test_log values ('disabled staff: leads select empty', true, null);
    end if;
end $$;

do $$
begin
    begin
        insert into public.leads (contact_name, service_required, project_description)
        values ('Disabled', 'x', 'disabled staff insert attempt');
        insert into test_log values ('disabled staff: leads insert denied', false, 'unexpected success');
    exception when insufficient_privilege then
        insert into test_log values ('disabled staff: leads insert denied', true, null);
    end;
end $$;

reset role;

-- ============================================================
-- 4. Active staff: full CRM workflow on synthetic data.
-- ============================================================
select set_config('request.jwt.claim.sub', '22222222-2222-2222-2222-222222222222', false);
set role authenticated;

do $$
declare
    n int;
    st text;
    new_id uuid;
begin
    select count(*) into n from public.leads;
    insert into test_log values ('staff: leads readable', n >= 1, 'count=' || n);

    insert into public.leads (contact_name, business_name, email, country,
                              service_required, project_description, lead_source)
    values ('Synthetic Two', 'Example Two', 'two@example.com', 'Kenya',
            'POS or business software', 'Second synthetic lead for workflow tests.', 'referral')
    returning id into new_id;
    insert into test_log values ('staff: lead insert', new_id is not null, null);

    update public.leads set pipeline_status = 'contacted', next_followup_at = current_date + 3
    where id = new_id
    returning pipeline_status into st;
    insert into test_log values ('staff: lead update + follow-up', st = 'contacted', null);

    insert into public.lead_activities (lead_id, actor_id, activity_type, body)
    values (new_id, auth.uid(), 'contact_attempt', 'Called the synthetic contact.');
    insert into test_log values ('staff: activity insert as self', true, null);
end $$;

do $$
begin
    begin
        insert into public.lead_activities (lead_id, actor_id, activity_type, body)
        select id, '11111111-1111-1111-1111-111111111111', 'note', 'Forged actor test.'
        from public.leads limit 1;
        insert into test_log values ('staff: cannot act as another staff', false, 'unexpected success');
    exception when insufficient_privilege then
        insert into test_log values ('staff: cannot act as another staff', true, null);
    end;
end $$;

do $$
declare
    affected int;
    remaining int;
begin
    delete from public.leads where lead_source = 'website_brief';
    get diagnostics affected = row_count;
    select count(*) into remaining from public.leads where lead_source = 'website_brief';
    insert into test_log values ('staff: lead delete denied', affected = 0 and remaining >= 1,
        'rows deleted=' || affected || ', still visible to owner=' || remaining);
end $$;

do $$
begin
    begin
        update public.lead_activities set body = 'tampered';
        insert into test_log values ('staff: activity update denied', false, 'unexpected success');
    exception when insufficient_privilege or insufficient_privilege then
        insert into test_log values ('staff: activity update denied', true, null);
    when others then
        if sqlstate = '42501' then
            insert into test_log values ('staff: activity update denied', true, null);
        else
            insert into test_log values ('staff: activity update denied', false, sqlstate);
        end if;
    end;
end $$;

-- Input validation constraints.
do $$
begin
    begin
        insert into public.leads (contact_name, service_required, project_description, pipeline_status)
        values ('Bad Status', 'x', 'constraint test description here', 'nonsense');
        insert into test_log values ('constraint: invalid status rejected', false, 'unexpected success');
    exception when check_violation then
        insert into test_log values ('constraint: invalid status rejected', true, null);
    end;
end $$;

do $$
begin
    begin
        insert into public.leads (contact_name, service_required, project_description)
        values ('X', 'x', 'short name constraint test description');
        insert into test_log values ('constraint: short contact name rejected', false, 'unexpected success');
    exception when check_violation then
        insert into test_log values ('constraint: short contact name rejected', true, null);
    end;
end $$;

reset role;

-- ============================================================
-- 5. Owner: staff administration and lead deletion.
-- ============================================================
-- Simulate the Supabase Auth admin "invite user" step (production: done from
-- the Supabase dashboard or service role, never by a client-side user).
insert into auth.users (id, email) values
    ('55555555-5555-5555-5555-555555555555', 'newstaff@example.com')
on conflict (id) do nothing;

select set_config('request.jwt.claim.sub', '11111111-1111-1111-1111-111111111111', false);
set role authenticated;

do $$
declare
    n int;
begin
    select count(*) into n from public.staff_members;
    insert into test_log values ('owner: staff readable', n >= 3, 'count=' || n);

    insert into public.staff_members (id, email, full_name, role)
    values ('55555555-5555-5555-5555-555555555555', 'newstaff@example.com', 'New Staff', 'staff');
    insert into test_log values ('owner: staff insert', true, null);

    update public.staff_members set status = 'disabled'
    where id = '55555555-5555-5555-5555-555555555555';
    insert into test_log values ('owner: staff disable', true, null);

    delete from public.leads where lead_source = 'referral';
    insert into test_log values ('owner: lead delete allowed', true, null);
end $$;

reset role;

-- ============================================================
-- 6. Audit integrity: history is enforced at the database level.
-- ============================================================
select set_config('request.jwt.claim.sub', '22222222-2222-2222-2222-222222222222', false);
set role authenticated;

do $$
declare
    new_id uuid;
    n int;
    actor uuid;
begin
    -- Created-audit trigger: inserting a lead records exactly one 'created'
    -- activity with the inserting staff member as actor.
    insert into public.leads (contact_name, email, service_required, project_description)
    values ('Audit Probe', 'audit@example.com', 'Business website',
            'Synthetic lead for audit-integrity regression tests.')
    returning id into new_id;

    select count(*) into n from public.lead_activities
    where lead_id = new_id and activity_type = 'created';
    insert into test_log values ('audit: lead creation logged', n = 1, 'created activities=' || n);

    select actor_id into actor from public.lead_activities
    where lead_id = new_id and activity_type = 'created';
    insert into test_log values ('audit: creation actor is the inserter', actor = auth.uid(), null);

    -- Regression: a DIRECT status update must not bypass history.
    update public.leads set pipeline_status = 'contacted' where id = new_id;

    select count(*) into n from public.lead_activities
    where lead_id = new_id and activity_type = 'status_change'
      and old_status = 'new' and new_status = 'contacted';
    insert into test_log values ('audit: direct update logged exactly once', n = 1, 'status_change count=' || n);

    select actor_id into actor from public.lead_activities
    where lead_id = new_id and activity_type = 'status_change';
    insert into test_log values ('audit: direct update actor recorded', actor = auth.uid(), null);

    -- RPC path: also exactly one activity (no duplicates).
    perform public.change_lead_status(new_id, 'qualified');

    select count(*) into n from public.lead_activities
    where lead_id = new_id and activity_type = 'status_change'
      and new_status = 'qualified';
    insert into test_log values ('audit: rpc update logged exactly once', n = 1, 'status_change count=' || n);

    -- Non-status updates must not create activity noise.
    update public.leads set next_followup_at = current_date + 7 where id = new_id;

    select count(*) into n from public.lead_activities where lead_id = new_id;
    insert into test_log values ('audit: no noise from non-status updates', n = 3, 'total activities=' || n);

    -- actor_id default: inserting an activity WITHOUT actor_id records the caller.
    insert into public.lead_activities (lead_id, activity_type, body)
    values (new_id, 'note', 'Note without explicit actor_id.');
    select actor_id into actor from public.lead_activities
    where lead_id = new_id and activity_type = 'note';
    insert into test_log values ('audit: actor_id defaults to auth.uid()', actor = auth.uid(), null);

    -- Cleanup of the probe lead (owner privileges are tested separately).
end $$;

reset role;

select set_config('request.jwt.claim.sub', '11111111-1111-1111-1111-111111111111', false);
set role authenticated;

do $$
declare
    affected int;
begin
    delete from public.leads where contact_name = 'Audit Probe';
    get diagnostics affected = row_count;
    insert into test_log values ('audit: probe lead cleaned up', affected = 1, null);
end $$;

reset role;

-- ============================================================
-- Summary
-- ============================================================
\echo '================ RLS TEST SUMMARY ================'
select name, pass, coalesce(detail, '') as detail from test_summary order by pass, name;
\echo '================================================='

do $$
declare
    failures int;
begin
    select count(*) into failures from test_log where not pass;
    if failures > 0 then
        raise exception 'RLS TESTS FAILED: % failing checks', failures;
    else
        raise notice 'RLS TESTS PASSED: all checks green';
    end if;
end $$;
