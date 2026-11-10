# DTB-OUTREACH-001 — Tradie prospect qualification

Status: **internal operating template; no outreach authorised by this document**. Related: GitHub issue #30 and acquisition issue #24. No prospect names, personal details or contact records belong in this public repository.

## Objective and operating boundaries

Identify Australian trades and local-services businesses where a specific, verifiable website or enquiry-workflow improvement could justify an optional DTB Technologies conversation. Start with plumbers, electricians, cleaners and painters in Western Sydney; expand only when the team can deliver appropriately. A business's existing website, absence of online booking, or design preferences alone are **not** proof of a defect.

**Source policy:** use a business's own publicly accessible website and official public contact page. Record the exact URL and date checked in a private, access-controlled DTB Leads tracker, **not in Git**. Respect site terms, unsubscribe/opt-out requests, applicable Australian spam and privacy obligations. No purchased lists, automated email, personal contact scraping or guessing addresses.

## Qualification steps (per prospect)

1. Verify the business exists and operates in a relevant service area; record its official website URL and source evidence in the private tracker. Mark inaccessible pages `NOT VERIFIED` rather than speculating.
2. Inspect the homepage and contact/quote pathway on mobile and desktop. Record one to three **observable** facts, each paired with the exact page URL and date. Examples: form submit produces a visible error; phone link is nonfunctional; mobile menu covers its CTA. A missing online booking option is a **suggestion**, not necessarily a fault.
3. Identify the practical business outcome DTB could help with: clearer mobile quote action, enquiry form, appointment-request flow, service-area page, or scoped website rescue. Check actual feasibility before pitching.
4. Confirm an **official business contact channel** is published. Do not collect personal contact information from directories or social profiles as a workaround.
5. Score the opportunity (below), write a short three-point website check, and request an individual human review before any contact.

## Weighted fit score

Score each factor 1 (weak/unverified) to 5 (strong/confirmed), with an explanation and supporting link retained privately.

| Factor | Weight | How to score |
| --- | ---: | --- |
| Observed friction | 35% | 1 = none confirmed; 3 = plausible verified obstacle; 5 = clear, reproducible visitor-facing defect |
| Fit with DTB services | 30% | 1 = unrelated; 3 = moderate; 5 = directly addressable with existing capability |
| Official contact route quality | 15% | 1 = no verified route; 3 = one published route; 5 = direct official business enquiry pathway |
| Small scoped deliverability | 20% | 1 = complex/uncertain; 3 = needs discovery; 5 = narrow solution with clear boundaries |

**Score:** `0.35 × friction + 0.30 × fit + 0.15 × contact + 0.20 × deliverability` (1.00–5.00). This is a prioritisation tool, **not** a predicted conversion rate. Prioritise the highest-scoring, actually verified leads; no automatic outreach is triggered by a score.

## Private DTB Leads field mapping

Keep a single access-controlled canonical record for each business, with source date and current owner. The active public site still uses manual WhatsApp/email handoffs; draft CRM PR #2 and inbox PR #35 are **not production**. Do **not** assume the private CRM can accept outreach records until its owner access and permissions are verified.

| Operator information | Intended lead data / handling |
| --- | --- |
| Business and public official site | `business_name` and a source/evidence link in private notes, where supported |
| Business sector / suburb | Qualification note or approved lead custom field, never inferred private address |
| Official public business contact method | Private contact note; never commit individuals' details to Git |
| Observed issue + checked date | Evidence-backed qualification note and source URL |
| Proposed DTB service | `service_required` or a qualification note |
| Stage and next action | `pipeline_status`, `next_followup_at` when available and authorised |
| Owner/reply/quote history | `assigned_to` and private `lead_activities` when available |
| Campaign/source | `lead_source` such as `outreach-tradies` where the schema supports it |

**Do not force unsupported statuses into a database enum.** Suggested operator stages for a private worksheet while CRM is blocked: `candidate → qualified → contacted → replied → call booked → proposal sent → won/lost`. Map only the supported subset to the actual CRM pipeline (`New → Contacted → Qualified → Proposal Sent → Won/Lost`) after verifying access. Track `call booked` and `replied` as activity notes if no native stage exists. A candidate is not a website-submitted enquiry.

## Daily run (human-reviewed)

1. Research up to 20 candidates, checking source links and reproducible facts.
2. Qualify and score; select the five most actionable opportunities for deeper review.
3. Draft up to 10 **individually reviewed** approaches; the target is optional, never a justification for unwanted or irrelevant messages.
4. Record only messages actually sent by an authorised operator, any replies, any opt-outs and next steps privately.
5. Reconcile against previous outreach before sending; do not contact the same business repeatedly. Stop on a refusal.
6. End the day by updating the private scorecard and reviewing pending genuine replies.

## Definition of done for one prospect

- [ ] Verified operating business and official site with checked date
- [ ] One or more sourced observations, not aesthetic guesses
- [ ] Clear service fit and realistic, narrow offer
- [ ] Public official business contact route verified
- [ ] Score and rationale recorded privately
- [ ] Three-point check drafted
- [ ] Outreach text individually approved; **not sent automatically**
- [ ] Stage, human owner and follow-up recorded if any contact occurs
