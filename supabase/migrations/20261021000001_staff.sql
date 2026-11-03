-- DTB Technologies — Lead Management System
-- Migration 001: staff membership
-- Staff identities link to Supabase Auth users. Password handling belongs to
-- Supabase Auth; no password hashes are stored here.

create table if not exists public.staff_members (
    id          uuid primary key references auth.users (id) on delete cascade,
    email       text not null unique,
    full_name   text not null,
    role        text not null default 'staff'
                check (role in ('owner', 'staff')),
    status      text not null default 'active'
                check (status in ('active', 'disabled')),
    created_at  timestamptz not null default now(),
    updated_at  timestamptz not null default now()
);

create index if not exists staff_members_status_idx on public.staff_members (status);

-- Keep updated_at honest.
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
    new.updated_at = now();
    return new;
end;
$$;

drop trigger if exists staff_members_updated_at on public.staff_members;
create trigger staff_members_updated_at
    before update on public.staff_members
    for each row execute function public.set_updated_at();

-- Fast, cache-safe check used by every RLS policy below.
create or replace function public.is_active_staff()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
    select exists (
        select 1
        from public.staff_members sm
        where sm.id = auth.uid()
          and sm.status = 'active'
    );
$$;

create or replace function public.is_owner()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
    select exists (
        select 1
        from public.staff_members sm
        where sm.id = auth.uid()
          and sm.status = 'active'
          and sm.role = 'owner'
    );
$$;

revoke all on function public.is_active_staff() from public;
revoke all on function public.is_owner() from public;
