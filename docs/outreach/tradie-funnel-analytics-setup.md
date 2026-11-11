# /tradies analytics — current inventory and activation gate

**As inspected on 11 November 2026:** production `js/tradies.js` creates `window.dataLayer` and records named events; there is **no evidence this alone sends data to GA4**. Installing GTM/GA4, configuring consent and verifying actual network delivery are **separate changes**.

## Event definitions present in current code

| Event | Trigger | What it really demonstrates |
| --- | --- | --- |
| `tradies_primary_cta` | Click on a marked CTA (including the full-brief link) | CTA click intention |
| `tradies_whatsapp_click` | Click on marked public WhatsApp links | Link intent, **not sent message** |
| `tradies_call_click` | Click on marked telephone link | Call intent, not completed call |
| `tradies_portfolio_click` | Click marked portfolio proof | Portfolio navigation |
| `tradies_website_check_start` | First form focus or submit | Form interaction, not qualified lead |
| `tradies_website_check_complete` | Valid form prepares a WhatsApp/email handoff | **Misleading legacy name**: preparation only, no sent confirmation; channel is `whatsapp` or `email`. Does not currently fire for copy-only |

Each delegated event has event name and page label `tradies`; some include a predefined short `context` token. The handoff event includes only a static channel. **No customer form values are placed in the current dataLayer by this script**. Any future dataLayer edits must preserve this invariant.

## Proposed reporting events — not yet implemented

- GA4 `page_view` for the actual `/tradies` route (not a made-up `tradies_page_view` unless explicitly added).
- CTA / full-brief continuation based on the existing `tradies_primary_cta` context.
- Website check started; WhatsApp/email/copy handoff intents distinctly named, so no "successful enquiry" is inferred.
- For genuine submissions later, only a backend-confirmed, idempotent success event **after durable storage**, with no contact information in analytics.

## Before enabling any third-party tracking

1. Owner chooses GA4/GTM property, container ID, legal/privacy basis and consent implementation for AU/KE visitors. **Do not hardcode or guess analytics IDs.**
2. Confirm/update site privacy notice and consent choices. Configure consent-sensitive tags not to fire before valid choice where required.
3. Load GTM via a separately reviewed PR only after choice; avoid adding tags in this documentation change.
4. Map allowed static event names to custom events in GTM. Keep `dataLayer` strictly free of: names, business names, email, phone, URLs from free-text fields, form answers, IP addresses, customer IDs, or message bodies. No custom dimensions derived from fields.
5. QA desktop/mobile and blocker/offline behavior: site and manual contact handoffs still function when GTM is blocked, absent or denied consent.
6. Test event intent classification: preparing WhatsApp/email is **not** proof a message was sent, received or converted; do not count it as a submitted enquiry.
7. Validate `/tradies?utm_source=...&utm_medium=...&utm_campaign=...` → a `data-utm-preserve` link to `/contact`; campaign params remain URL metadata and must not be exposed as personal data in analytics.
8. Verify each reported event with GTM Preview and GA4 DebugView (with appropriate consent), and explicitly test no form-content leakage. Save screenshots showing only test data and settings; no secrets.

## Decision / current state

**NOT ACTIVATED:** GTM ID not chosen, analytics consent not approved, no GA4 network/event verification performed here. Manual site funnel works without analytics. The measurement code and privacy verification remain future work under issue #30.
