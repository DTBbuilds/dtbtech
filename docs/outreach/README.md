# DTB-OUTREACH-001 — Tradie acquisition operating guide

Status: **internal draft; no messages sent, no prospect data stored here.**
Scope: Western Sydney plumbers, electricians, cleaners and painters first; expand only after repeatable qualification. Source backlog: [#30](https://github.com/DTBbuilds/dtbtech/issues/30), [#24](https://github.com/DTBbuilds/dtbtech/issues/24).

## What exists today

- Public `/tradies` offers Website Rescue from A$450, Tradie Lead Website from A$1,500, and custom-quoted Local Lead Foundation. Confirm current offers on the live website before quoting a prospect.
- Existing public `/tradies` website-check flow **prepares** a WhatsApp/email draft or copies details. It is not proof of a successfully delivered enquiry; a real person must send it.
- The new private enquiry inbox is still Preview-only and lacks a verified first staff account. **Do not use or advertise it as an operational outbound CRM yet.**
- Do not promise traffic, rankings, leads, revenue, fixed delivery dates, or an unapproved support SLA.

## Daily sequence (human operated)

1. Identify up to **20 candidates** using business websites and published, business-owned contact channels. Start with Western Sydney; do not purchase or scrape private contact lists.
2. Validate trading activity, sector and location. Record the official source link and **date verified** in a **private, access-controlled** lead tracker, never in this public repository.
3. Check each live site at a mobile viewport and desktop; write three reproducible observations. Distinguish **Observed defect**, **Observed friction**, **Optional improvement**, and **Not verified**.
4. Score each lead against the qualification guide. Prefer a reachable, relevant business over a large list of weak matches.
5. Shortlist the best candidates. Prepare up to **10 personalised approaches per working day**; check factual accuracy and approved contact channel *before* sending. These are operating targets, not achieved results.
6. Log actual sends, replies, calls, quotes and outcomes; schedule **one respectful follow-up** if appropriate, stop after opt-out or no further interest.

## Storage / mapping

When the authenticated DTB Leads workspace is operational, store outreach prospects in its **private `leads` workflow**, subject to authorised roles and a reviewed privacy/retention process. Do **not** place cold-outreach records in the inbound customer `enquiry_intake` table. Until then use a restricted owner-controlled tracker; do not upload that tracker into this repository.

Recommended private fields: business name, official site, public business contact channel type, suburb, sector, source URL, observation and date, qualification score breakdown, proposed service, status, date last contacted, next follow-up date, outcome, owner, opt-out flag. Keep only data necessary to follow up.

## Release and decisions

- This folder is **documentation only**; it does not install GA4/GTM, send outreach, create customers or unlock the inbox.
- GA4/GTM and consent decisions are separately gated in [analytics setup](tradie-funnel-analytics-setup.md).
- Templates: [qualification](tradie-prospect-qualification.md), [three-point check](tradie-website-check-template.md), [messages](tradie-contact-templates.md), [scorecard](tradie-daily-scorecard.md).
- Before launch, owner reviews price/tax wording, outreach approach and privacy/retention rules. Existing `dtbbuildsoffice@gmail.com` remains the verified public email; do not replace with an untested `@dtbtech.org` inbox.
