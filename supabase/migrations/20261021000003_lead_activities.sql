-- DTB Technologies — Lead Management System
-- Migration 003: lead activities (notes, contacts, follow-ups, status changes)

create table if not exists public.lead_activities (
    id            uuid primary key default gen_random_uuid(),
    lead_id       uuid not null references public.leads (id) on delete cascade,
    actor_id      uuid references public.staff_members (id) on delete set null,
    activity_type text not null
                  check (activity_type in ('created', 'note', 'contact_attempt',
                                           'follow_up', 'status_change')),
    body          text not null,
    old_status    text,
    new_status    text,
    created_at    timestamptz not null default now()
);

create index if not exists lead_activities_lead_idx
    on public.lead_activities (lead_id, created_at desc);

alter table public.lead_activities
    drop constraint if exists lead_activities_body_len;
alter table public.lead_activities
    add constraint lead_activities_body_len check (length(body) between 1 and 4000);

alter table public.lead_activities
    drop constraint if exists lead_activities_status_pair;
alter table public.lead_activities
    add constraint lead_activities_status_pair
    check (
        (activity_type <> 'status_change')
        or (old_status is not null and new_status is not null)
    );
