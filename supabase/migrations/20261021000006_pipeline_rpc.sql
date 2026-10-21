-- DTB Technologies — Lead Management System
-- Migration 006: pipeline integrity
--
-- Audit history is enforced at the DATABASE level so every supported update
-- path produces exactly one activity record:
--   * a BEFORE UPDATE trigger appends a status_change activity whenever
--     pipeline_status actually changes (direct update or RPC — no bypass);
--   * an AFTER INSERT trigger appends the lead's "created" activity, so every
--     lead has a creation record regardless of how it entered the system;
--   * actor_id defaults to the authenticated user (auth.uid()) and the RLS
--     with-check still rejects any attempt to log activity as someone else.
-- change_lead_status() remains as a thin, validated wrapper for the UI.

-- 1. actor_id is database-managed: defaults to the caller's identity.
alter table public.lead_activities
    alter column actor_id set default auth.uid();

-- 2. Status-change audit trigger (single source of truth for transitions).
create or replace function public.lead_status_audit()
returns trigger
language plpgsql
security invoker
set search_path = public
as $$
begin
    if new.pipeline_status is distinct from old.pipeline_status then
        insert into public.lead_activities
            (lead_id, actor_id, activity_type, body, old_status, new_status)
        values (
            new.id,
            auth.uid(),
            'status_change',
            'Status changed from ' || old.pipeline_status || ' to ' || new.pipeline_status || '.',
            old.pipeline_status,
            new.pipeline_status
        );
    end if;
    return new;
end;
$$;

drop trigger if exists leads_status_audit on public.leads;
create trigger leads_status_audit
    before update on public.leads
    for each row execute function public.lead_status_audit();

-- 3. Creation audit trigger.
create or replace function public.lead_created_audit()
returns trigger
language plpgsql
security invoker
set search_path = public
as $$
begin
    insert into public.lead_activities
        (lead_id, actor_id, activity_type, body)
    values (
        new.id,
        auth.uid(),
        'created',
        'Lead created.'
    );
    return new;
end;
$$;

drop trigger if exists leads_created_audit on public.leads;
create trigger leads_created_audit
    after insert on public.leads
    for each row execute function public.lead_created_audit();

-- 4. Validated status-change wrapper (the trigger records the history).
create or replace function public.change_lead_status(
    p_lead_id uuid,
    p_new_status text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
    v_old_status text;
begin
    if not public.is_active_staff() then
        raise exception 'Only active DTB staff can change lead status' using errcode = '42501';
    end if;

    if p_new_status not in ('new', 'contacted', 'qualified', 'proposal_sent', 'won', 'lost') then
        raise exception 'Unknown pipeline status' using errcode = '22023';
    end if;

    select pipeline_status into v_old_status
    from public.leads
    where id = p_lead_id;

    if v_old_status is null then
        raise exception 'Lead not found' using errcode = 'P0002';
    end if;

    if v_old_status = p_new_status then
        return;
    end if;

    update public.leads
    set pipeline_status = p_new_status
    where id = p_lead_id;
end;
$$;

revoke all on function public.change_lead_status(uuid, text) from public, anon;
grant execute on function public.change_lead_status(uuid, text) to authenticated;
