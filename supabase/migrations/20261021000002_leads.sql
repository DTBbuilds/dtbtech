-- DTB Technologies — Lead Management System
-- Migration 002: leads

create table if not exists public.leads (
    id                  uuid primary key default gen_random_uuid(),
    created_at          timestamptz not null default now(),
    updated_at          timestamptz not null default now(),
    contact_name        text not null,
    business_name       text,
    email               text,
    phone               text,
    country             text not null default 'Australia'
                        check (country in ('Australia', 'Kenya', 'Other')),
    service_required    text not null,
    project_description text not null,
    budget              text,
    timeframe           text,
    lead_source         text not null default 'other'
                        check (lead_source in ('website_brief', 'whatsapp', 'email',
                                               'phone', 'referral', 'other')),
    pipeline_status     text not null default 'new'
                        check (pipeline_status in ('new', 'contacted', 'qualified',
                                                   'proposal_sent', 'won', 'lost')),
    assigned_to         uuid references public.staff_members (id) on delete set null,
    next_followup_at    date
);

create index if not exists leads_status_idx on public.leads (pipeline_status);
create index if not exists leads_assigned_idx on public.leads (assigned_to);
create index if not exists leads_followup_idx on public.leads (next_followup_at)
    where next_followup_at is not null;
create index if not exists leads_created_idx on public.leads (created_at desc);

drop trigger if exists leads_updated_at on public.leads;
create trigger leads_updated_at
    before update on public.leads
    for each row execute function public.set_updated_at();

-- Guard: a contact channel or a description must exist so a lead is reachable.
alter table public.leads drop constraint if exists leads_reachable_check;
alter table public.leads
    add constraint leads_reachable_check
    check (
        coalesce(email, '') <> ''
        or coalesce(phone, '') <> ''
        or length(coalesce(project_description, '')) >= 10
    );

alter table public.leads drop constraint if exists leads_contact_name_len;
alter table public.leads
    add constraint leads_contact_name_len check (length(contact_name) between 2 and 120);
