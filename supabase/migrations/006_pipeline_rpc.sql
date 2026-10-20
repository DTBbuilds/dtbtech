-- DTB Technologies — Lead Management System
-- Migration 006: atomic pipeline operations
--
-- change_lead_status updates a lead and appends a status_change activity in a
-- single transaction, so the history can never drift from the lead's status.
-- Authorisation is re-checked server-side inside the function; RLS still
-- applies to the underlying tables for any direct access.

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

    insert into public.lead_activities (lead_id, actor_id, activity_type, body, old_status, new_status)
    values (
        p_lead_id,
        auth.uid(),
        'status_change',
        'Status changed from ' || v_old_status || ' to ' || p_new_status || '.',
        v_old_status,
        p_new_status
    );
end;
$$;

revoke all on function public.change_lead_status(uuid, text) from public, anon;
grant execute on function public.change_lead_status(uuid, text) to authenticated;
