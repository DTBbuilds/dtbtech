-- DTB Technologies — Lead Management System
-- Migration 005: future public enquiry intake (PREPARED, NOT ACTIVATED)
--
-- This migration documents the consent-labelled public intake endpoint that
-- Phase 3 may activate. It is intentionally inert: the table exists, RLS denies
-- everyone, and no website form writes to it yet. Activation requires:
--   * a server-side endpoint (Vercel Function) with validation, spam protection
--     and rate limits — never a direct anon insert;
--   * an explicit consent checkbox and privacy notice on the public form;
--   * tested delivery/notification behaviour.
-- Do not grant any role access to this table until those controls exist.

create table if not exists public.enquiry_intake (
    id                  uuid primary key default gen_random_uuid(),
    created_at          timestamptz not null default now(),
    processed_at        timestamptz,
    contact_name        text not null,
    business_name       text,
    email               text not null,
    phone               text,
    country             text,
    service_required    text not null,
    project_description text not null,
    budget              text,
    timeframe           text,
    consent_given       boolean not null default false,
    consent_text        text,
    source_page         text,
    spam_score          numeric,
    status              text not null default 'unprocessed'
                        check (status in ('unprocessed', 'processed', 'rejected'))
);

alter table public.enquiry_intake enable row level security;
alter table public.enquiry_intake force row level security;

-- Deliberately no grants and no policies: nobody can read or write this table
-- through the anon or authenticated roles. Only the service role (server-side)
-- may ever touch it, once the intake endpoint is built and tested.
revoke all on public.enquiry_intake from anon;
revoke all on public.enquiry_intake from authenticated;
