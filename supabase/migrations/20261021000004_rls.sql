-- DTB Technologies — Lead Management System
-- Migration 004: Row Level Security and explicit grants
--
-- Posture:
--   anon (unauthenticated visitors): no table privileges at all.
--   authenticated (Supabase Auth users): privileges granted, but every row
--   operation passes an RLS policy that requires active DTB staff membership.
--   service_role (server-side only): bypasses RLS; key must never leave the server.

alter table public.staff_members   enable row level security;
alter table public.leads           enable row level security;
alter table public.lead_activities enable row level security;

alter table public.staff_members   force row level security;
alter table public.leads           force row level security;
alter table public.lead_activities force row level security;

-- 1. Deny everything to anonymous visitors.
revoke all on public.staff_members   from anon;
revoke all on public.leads           from anon;
revoke all on public.lead_activities from anon;

-- 2. Base grants for authenticated users; RLS decides which rows apply.
grant select, insert, update, delete on public.staff_members   to authenticated;
grant select, insert, update, delete on public.leads           to authenticated;
grant select, insert                 on public.lead_activities to authenticated;

-- 3. Helper functions: executable by authenticated users only.
grant execute on function public.is_active_staff() to authenticated;
grant execute on function public.is_owner()        to authenticated;

-- 4. staff_members policies
drop policy if exists staff_select on public.staff_members;
create policy staff_select on public.staff_members
    for select to authenticated
    using (public.is_active_staff() or id = auth.uid());

drop policy if exists staff_insert on public.staff_members;
create policy staff_insert on public.staff_members
    for insert to authenticated
    with check (public.is_owner());

drop policy if exists staff_update on public.staff_members;
create policy staff_update on public.staff_members
    for update to authenticated
    using (public.is_owner())
    with check (public.is_owner());

-- No delete policy: staff records are disabled, never deleted, so lead
-- assignment history stays intact.

-- 5. leads policies — active staff only, every verb.
drop policy if exists leads_select on public.leads;
create policy leads_select on public.leads
    for select to authenticated
    using (public.is_active_staff());

drop policy if exists leads_insert on public.leads;
create policy leads_insert on public.leads
    for insert to authenticated
    with check (public.is_active_staff());

drop policy if exists leads_update on public.leads;
create policy leads_update on public.leads
    for update to authenticated
    using (public.is_active_staff())
    with check (public.is_active_staff());

drop policy if exists leads_delete on public.leads;
create policy leads_delete on public.leads
    for delete to authenticated
    using (public.is_owner());

-- 6. lead_activities policies — append-only history.
drop policy if exists activities_select on public.lead_activities;
create policy activities_select on public.lead_activities
    for select to authenticated
    using (public.is_active_staff());

drop policy if exists activities_insert on public.lead_activities;
create policy activities_insert on public.lead_activities
    for insert to authenticated
    with check (public.is_active_staff() and actor_id = auth.uid());

-- No update/delete policies: activity history is immutable.
