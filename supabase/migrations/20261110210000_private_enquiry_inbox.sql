-- DTB-LEADS-INBOX-013: read + triage on existing DTB2 enquiry_intake.
-- Apply to approved dtb-crm-test ONLY; not JAT/KEUS. Requires CRM migrations 001-006
-- and the 2026-11-10 intake activation migration already present on this project.
-- No customer data deleted and no public read granted.
begin;

do $$
begin
  if to_regclass('public.enquiry_intake') is null
     or to_regclass('public.staff_members') is null
     or to_regclass('public.enquiry_reference_seq') is null then
    raise exception 'Expected DTB2 CRM/intake migrations missing';
  end if;
  if to_regclass('public.dtb_enquiries') is not null then
    raise exception 'Unexpected duplicate standalone intake table exists';
  end if;
end;
$$;

-- Retain legacy processed/rejected statuses and add useful triage stages.
alter table public.enquiry_intake drop constraint if exists enquiry_intake_status_check;
alter table public.enquiry_intake
  add constraint enquiry_intake_status_check
  check (status in ('unprocessed','contacted','qualified','proposal_sent',
                   'won','lost','processed','rejected'));

-- Existing prepared intake deliberately had zero end-user privileges.
-- Re-enable ONLY select and a one-column status update for signed-in users.
revoke all on public.enquiry_intake from public, anon, authenticated;
grant select on public.enquiry_intake to authenticated;
grant update (status) on public.enquiry_intake to authenticated;

alter table public.enquiry_intake enable row level security;
alter table public.enquiry_intake force row level security;

drop policy if exists dtb_inbox_staff_read on public.enquiry_intake;
create policy dtb_inbox_staff_read on public.enquiry_intake
  for select to authenticated
  using ((select public.is_active_staff()));

drop policy if exists dtb_inbox_staff_status_update on public.enquiry_intake;
create policy dtb_inbox_staff_status_update on public.enquiry_intake
  for update to authenticated
  using ((select public.is_active_staff()))
  with check ((select public.is_active_staff()));

-- Only a private, trigger-written history can record status transitions.
create schema if not exists dtb_internal;
revoke all on schema dtb_internal from public, anon, authenticated;
create table if not exists dtb_internal.enquiry_status_history (
  id bigserial primary key,
  enquiry_id uuid not null references public.enquiry_intake(id) on delete restrict,
  actor_id uuid references auth.users(id) on delete set null,
  old_status text not null,
  new_status text not null,
  created_at timestamptz not null default now()
);
create index if not exists enquiry_status_history_enquiry_idx
  on dtb_internal.enquiry_status_history(enquiry_id,created_at desc);
alter table dtb_internal.enquiry_status_history enable row level security;
alter table dtb_internal.enquiry_status_history force row level security;
revoke all on dtb_internal.enquiry_status_history from public, anon, authenticated;

create or replace function dtb_internal.audit_enquiry_status_change()
returns trigger language plpgsql security definer
set search_path = pg_catalog
as $$
begin
  if new.status is distinct from old.status then
    new.processed_at = case when new.status = 'unprocessed' then null else now() end;
    insert into dtb_internal.enquiry_status_history
      (enquiry_id,actor_id,old_status,new_status)
    values (new.id,auth.uid(),old.status,new.status);
  end if;
  return new;
end;
$$;
revoke all on function dtb_internal.audit_enquiry_status_change()
  from public, anon, authenticated;

drop trigger if exists dtb_inbox_status_audit on public.enquiry_intake;
create trigger dtb_inbox_status_audit
  before update of status on public.enquiry_intake
  for each row execute function dtb_internal.audit_enquiry_status_change();
commit;
