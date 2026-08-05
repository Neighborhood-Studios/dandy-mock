# Dandy — marketing site handoff

Two self-contained HTML files (all images inlined as base64, no external assets needed except Google Fonts):

| File | What it is |
|---|---|
| `dandy-website-v2.html` | Homepage. **Rename to `index.html` when deploying** — the services page links back to it by that name. |
| `dandy-services.html` | "Our Services" scope-of-work page. Linked from the homepage footer ("Services") and from the FAQ item "What kinds of tasks does my Dandyman handle?" ("See what Dandy covers →"). |

## Cross-links to keep intact
- Homepage footer → `dandy-services.html`
- Homepage FAQ ("What kinds of tasks…") → `dandy-services.html`
- Services page nav/CTAs/footer → `index.html`, `index.html#join`, `index.html#pricing`, `index.html#neighborhoods`
- All homepage waitlist CTAs scroll to `#join` (the email form section at the bottom) — do not repoint them to external URLs.

## Homepage — key mechanics
- **Section order:** hero → marquee → familiar face → how it works (3 cards) → cadence/visits → **pricing (blue band)** → **receipt (same blue, directly below — intentional: price first, then the objection-handling math)** → gallery → Wrapped → drop/neighborhoods → FAQ → #join CTA → footer.
- **Drop map animation** (`#hoodMap`): plays on scroll-into-view, loops. Druid Hills pops in (Colin's photo bubble) → counts 50 → Sold out → Decatur (Hasani's bubble) does the same → East Atlanta pops with "Next drop coming soon." Chip positions are inline `top/left` percentages on `#chipDH`, `#chipDec`, `#chipEA`. Photo bubbles are 54px, floating above the pills (`.chip-face`).
- **Map image:** transparent-background WebP inlined on `#hoodMap`'s `<img>`. `.map-wrap > img` is scoped with `>` on purpose — don't loosen it or the chip avatars will inherit `width:100%` again.
- **Gallery captions** are dual-purpose: mood line (`<b>`) + covered-task line (`<em>`) inside `.gcap`.
- **Persona note (intentional):** hero pill says "Robert · Your Dandyman"; familiar-face cards say Colin (Decatur) and Hasani (Virginia-Highland).

## Services page — key mechanics
- Count-up hero stats, self-ticking maintenance checklists, auto-cycling seasonal cards, and the animated task **sorter** ("Fits in a visit" vs "Specialist territory") in the What We Don't Do section. All gated behind IntersectionObservers and `prefers-reduced-motion`.

## Open items / to finish
1. **Drop map faces:** currently Colin + Hasani crops. If generating realistic AI Dandy handymen (navy polo + Dandy cap), swap the base64 `src` on `.chip-face` imgs inside `#chipDH` / `#chipDec`.
2. **$836 receipt figure** is placeholder math — back with a real comparable-rate table before launch.
3. **Map chip drop data** is demo — wire to real drop status when available.
4. **Waitlist form** at `#join` is front-end only — needs a real submission endpoint.
5. Copy on both pages is final per Whit's latest review (July 2026 revisions applied).

## Gallery ("The neighborhood, handled") — photo slots
- 12 tiles, 6 per row. Seven are final photos; **five are dashed placeholder slots** with on-tile "Copy prompt" buttons (prompt text lives in hidden spans `#gpA`–`#gpE`).
- Workflow: click Copy prompt → paste into ChatGPT **along with the two handyman reference photos** → generate → replace the `.gtile.gph` div with `<div class="gtile"><img src="..."><span class="gcap"><b>Mood</b><em>Task</em></span></div>` using the same mood/task text.
- Slot → handyman: gpA gutter (Hasani), gpB smoke detector (Colin), gpC drop-in arrival (Hasani), gpD handshake (Colin), gpE caulking (Hasani).
- ⚠️ **Name/asset mismatch:** on the live site, *Colin* is the light-stubble handyman and *Hasani* is the full-dark-beard handyman — but the source asset files are named the opposite (`hasani-hero.webp` = Colin's face, `handyman2-hero.webp` = Hasani's face). The prompts avoid names and specify "light stubble" vs "full dark beard" so the generator can't grab the wrong man. Keep that convention.
- Loop mechanics: each strip's tiles are duplicated ×4 in JS and the keyframes translate −50%, so the drift is seamless with no white gaps up to ~3800px-wide viewports. If tiles are added/removed, keep the ×4 duplication.

## Waitlist form → Mailchimp + HubSpot
The `#join` form now pushes each submission (email + ZIP) to **both** platforms client-side — no backend. Config lives in the `WAITLIST` constant near `wlSubmit()` in the homepage script. Four values to fill:
1. **HubSpot portalId + formGuid** — create a form in HubSpot (fields: `email`, `zip`), click Embed, copy `portalId` and `formId` from the embed snippet. Submissions go to the CORS-enabled Forms API v3 endpoint.
2. **Mailchimp actionUrl** — Audience → Signup forms → Embedded forms → copy the `<form action>` URL.
3. **Mailchimp zipFieldName** — add a ZIP merge field to the audience, then use the matching input name from the embed code (usually `MERGE2`).
4. **Mailchimp honeypotName** (optional but recommended) — the `b_…` hidden input name from the embed code, for bot filtering.

Until configured, submissions show the success UI and log `[waitlist] … not configured — skipped` to the console; nothing is sent. Behavior is optimistic: the success state shows immediately and pushes fire in the background (failures log to console, don't block the user). Alternative architecture if you'd rather maintain one list: point the form at HubSpot only and enable the HubSpot ↔ Mailchimp sync app from the HubSpot App Marketplace.

## Head code (required on every page)
Both pages already include, in `<head>`: the Webflow-matching viewport tag (`viewport-fit=cover`), `theme-color` `#003953`, the **Meta Pixel** (ID `1101244721912216`) with its `<noscript>` fallback, and the **Google tag** (gtag.js, ID `G-7VMER7T9SN`). **Any new page added to the site must carry this same head block** — copy it from the top of either file. When deploying, verify the pixel fires with Meta Pixel Helper.

## Terms of Service page
`terms-of-service.html` — deploy at `/terms-of-service`. Linked from the homepage footer ("Terms") and the services page footer. Carries the full required head block (pixel etc.). Contact email throughout: bill@hidandy.com. ⚠ **Drafted in-house as a starting point — have a Georgia-licensed attorney review before launch**, especially §4 billing, §7 parts billing, §8 guarantee scope, §11–12 disclaimers/liability, §13 insurance claims window, and the §9 no-direct-hire clause. Effective date is set to July 22, 2026 — update on publish.

## Waitlist → Zapier (primary integration path)
The form's first-choice destination is a **Zapier Catch Hook** (`WAITLIST.zapierWebhookUrl`). Setup: duplicate the existing Webflow-triggered Zap → swap trigger to "Webhooks by Zapier → Catch Hook" → remap the three fields (`email`, `zip`, `dateSubmitted` — sent as ISO 8601) into the same downstream steps. All existing logic is preserved unchanged: zip service-area filter and its two paths, Mailchimp ZIPCODE merge field + per-path tags, HubSpot zip field, GMass "you're early"/"waitlist" emails, and the signed-up-after-07/09 date condition. Payload also includes `source` and `pageUri`. When the webhook URL is set, the direct Mailchimp/HubSpot pushes are skipped automatically (prevents duplicate contacts); they remain as a fallback if the webhook is ever unset. No secrets live in the page — a catch-hook URL is designed to be publicly callable.

## Phone-capture experiment (dormant)
The waitlist form contains a hidden phone field (`#wlPhone`). Toggle with `WAITLIST.collectPhone` (currently `false`). The Zapier payload **always** includes a `phone` key (empty string while hidden), so: submit one test with the flag on (or rely on the empty key) to get `phone` into the hook sample, map it in the Zap now (HubSpot phone property / Mailchimp PHONE merge), and the future experiment is a one-flag flip — no rewiring. Validation when visible: optional field, but if filled must be 10 US digits (11 with leading 1); digits-only are sent.

## SEO / Open Graph / Favicon — deploy checklist
All three pages now carry: title ("Dandy Handyman — Same handyman, every time." on the homepage), meta description (hero-based), canonical URL, full Open Graph + Twitter Card tags, an inline PNG favicon (works immediately, no file dependency), and the homepage additionally has LocalBusiness JSON-LD schema (name, Atlanta service area, $149/month price range, bill@hidandy.com).

**Files that MUST be uploaded to the site root for link previews to work:**
- `og-image.jpg` → serve at `https://www.hidandy.com/og-image.jpg` (1200×630, referenced by every page's og:image — link previews will show no image until this exists at that exact URL)
- `apple-touch-icon.png` → site root (referenced by `<link rel="apple-touch-icon">` and the JSON-LD logo)
- `favicon-32.png` / `favicon-512.png` → optional but recommended at root for crawlers that ignore inline icons

**Canonical URLs assume:** homepage at `https://www.hidandy.com/`, services at `/services`, terms at `/terms-of-service`. If deploy paths differ, update each page's `<link rel="canonical">` and `og:url`.

**Post-deploy verification:** run the URL through Facebook Sharing Debugger and Google Rich Results Test; both should show the image, title, description, and (Google) the LocalBusiness schema.

## Neighborhood drop pages (template) — decatur.html
`decatur.html` — deploy at `/decatur`. Ad-traffic landing page for the Decatur drop; the master template for future neighborhoods (cloning checklist is in a comment at the top of the file). Structure: hero with the brand-colored "Neighborhood Handyman in Decatur" SVG art → Meet Colin (Decatur's dedicated Dandyman) → hyper-local "Built for Decatur homes" section (bungalow housing stock, Oakhurst/Winnona Park/MAK sub-neighborhood tags) → how membership works + $149 chip → drop meter (demo % in `HOOD.waitlistPct` — wire to real data) → mini FAQ → waitlist form. Form posts to the SAME Zapier catch hook as the homepage with an added `neighborhood: "decatur"` key and `source: "dandy-decatur-landing"` — map `neighborhood` in the Zap to tag/route these leads. ZIP pre-fills 30030 (editable). Full head stack (gtag, pixel, OG, favicon) included; canonical/og:url assume `/decatur`.

## Fail-open animations (deployment safety)
All hidden-until-animated styles (scroll reveals, receipt line items, Dandy card, drop-map chips, checklist ticks) are gated behind an `html.js` class that the page's own script applies on load. **If a deploy pipeline strips or blocks the inline `<script>` (Webflow embed limits are the classic culprit), every section still renders fully visible — just without animation.** Nothing on any page can appear blank due to missing JS. If a deployed page ever shows an empty section, the diagnosis is: the script didn't run AND the CSS was also modified — check both were carried over verbatim.

## Site index (internal) — site-index.html
Password-gated overview of every page: preview thumbnail, name, deploy path, one-paragraph description, click-through to the page. **Password: `hidandy`** (all lowercase) (stored as a SHA-256 hash in the code, unlocks for the browser session). ⚠ This is a courtesy gate on a static page — it deters casual visitors but is NOT real security; keep secrets off this page. `noindex,nofollow` is set. Card links are relative (`index.html`, `dandy-services.html`, etc.) so they work in the deployed folder and locally; keep all pages in the same directory. If new pages are added to the site, add a card here.

## Drop Day page — drop-day.html (v2)
Deploy at `/drop-day`. Single centered card on the blue gradient (no split screen). Loader ("Welcome to the Drop.") → card: Bill door-photo banner with live pill → drop context + fact chips → booking panel. Booking panel has TWO implementations in the file:
1. **Calendly embed** (active default) — `bill-hidandy/dandydropday`, brand-colored, skeleton shimmer, and a fallback "Open Bill's calendar →" link that appears if the Calendly script can't load (sandboxed previews block it; it works on a real domain). Bookings fire sparkles + toast + `fbq('track','Schedule')` + GA4 `walkthrough_booked` via Calendly postMessage events.
2. **Custom slot picker** (BUILT, ships dormant) — date strip + time-slot grid UI already coded in the file, gated by `PICKER = { enabled:false, apiBase:'' }`. Preview the UI anytime with `?picker=demo` (clearly-labeled sample slots). See next section to activate for real.
**Sold-out state:** GIF renders edge-to-edge at the top of the centered card (the source GIF's transparent side margins were cropped out — that was the mystery whitespace), headline + copy + waitlist CTA below. Switch with `?state=soldout` or `DROP_STATE`. **Delete the bottom-left `#previewToggle` button before real launch.**

## Calendly custom picker — ClaudeBot build spec
**Yes: Whit will supply a Calendly personal access token. It goes ONLY in the proxy's server-side environment (env var `CALENDLY_TOKEN`) — NEVER into any HTML/JS/file served to browsers.** The front-end is already done; ClaudeBot builds one small serverless proxy (Cloudflare Worker / Vercel function) and flips a flag.

**Endpoint to implement:** `GET {apiBase}/slots?days=14`
Response shape the page expects:
```json
{ "days": [ { "date": "2026-07-30",
              "slots": [ { "start": "2026-07-30T10:00:00-04:00" } ] } ] }
```
**Implementation with Calendly API v2** (Bearer CALENDLY_TOKEN):
1. `GET https://api.calendly.com/users/me` → `resource.uri`
2. `GET https://api.calendly.com/event_types?user={uri}` → find slug `dandydropday` → its `uri`
3. `GET https://api.calendly.com/event_type_available_times?event_type={uri}&start_time={A}&end_time={B}` — Calendly caps each query at a 7-day window, so call twice to cover 14 days; concatenate `collection[]` of available times.
4. Group by date in **America/New_York**, map to the shape above. Cache ~60s. CORS: allow the production origin(s) only. Never echo the token or Calendly URIs beyond what's needed.

**Activate:** in drop-day.html set `PICKER.enabled = true` and `PICKER.apiBase = 'https://<proxy-host>'`. Slot clicks open Calendly's confirm form for that exact time (`https://calendly.com/bill-hidandy/dandydropday/{startISO}`) — booking confirmation stays on Calendly rails, so reminders/reschedules keep working. If the proxy errors, the page automatically falls back to the embed.

## Scottdale page — scottdale.html (direct sales, no drop)
Deploy at `/scottdale`. Cloned from the Decatur template but converted to DIRECT SALES: no drop mechanics, no waitlist form, no Zapier hook. All CTAs → `/walkthrough`. ⚠ SPELLING: the community's official name is **Scottdale** (no middle "s") — all on-page copy uses "Scottdale"; the URL slug stays `/scottdale` per Whit's request. Local flavor: 1901 cotton-mill village history (mill cottages + new townhome infill), E Ponce corridor, DeKalb Farmers Market, PATH trail, Tobie Grant; ZIP 30079. Dandyman: **Bill**.
**Click-to-call:** nav pill + final-CTA ghost button, (404) 905-5770. On touch devices these are plain `tel:+14049055770` links; on desktop (fine pointer, >880px) a branded modal opens instead ("Call Bill to schedule your walkthrough" + number + copy button). Sections: hero (Bill door photo + Scottdale chips) → Meet Bill → Built for Scottdale (mill-cottage cards + hood tags) → How it works → Pricing → Receipt (ONE-OFF HANDYMAN · SCOTTDALE) → Getting started (3 walkthrough steps) → FAQ (drop Q replaced with walkthrough Q) → final CTA.

## Walkthrough booking page — walkthrough.html
Deploy at `/walkthrough`. Centered, brand-framed Calendly embed on the blue gradient: logo topbar with call pill, headline + trust chips, cream booking card (Bill avatar header + FREE·45MIN tag), skeleton shimmer, stalled-fallback direct link. Bookings fire sparkles + toast + `fbq('track','Schedule')` + GA4 `walkthrough_booked`. **CALENDLY URL IS A PLACEHOLDER** — the `CALENDLY` constant at the top of the script currently points at `bill-hidandy/dandydropday`; swap it for the real walkthrough event link when Whit supplies it (brand colors/params are appended automatically).


## Scottdale page — scottdale.html (direct sales, no drop)
Deploy at `/scottdale` (official local spelling, confirmed by Whit). Direct-sales variant of the neighborhood template: NO drop mechanics, no waitlist. All CTAs → `/walkthrough`. Localized for Scottdale: mill-village history (1901 Scottdale Cotton Mill), mill cottages + townhome infill, E Ponce corridor, DeKalb Farmers Market, PATH trail, Tobie Grant, ZIP 30079. Dandyman on this page is **Bill** with his phone throughout.
**Phone treatment:** desktop shows a plain, traditional number top-right (non-clickable); ≤760px it becomes a tap-to-call pill (`tel:+14049055770`).
**Inquiry form** (bottom, in the final CTA section): name / phone (optional) / email / message → POSTs JSON to its OWN dedicated Zapier catch hook `https://hooks.zapier.com/hooks/catch/23415577/46sj4zz/` (Scottdale inquiries ONLY — the shared waitlist hook `44zimzq` remains correct for the homepage and Decatur forms; never point Scottdale back at it) with `formType:"inquiry"`, `source:"dandy-scottdale-inquiry"`, `neighborhood:"scottdale"` — branch the Zap on `formType` so inquiries route to email/Slack instead of the waitlist path.

## Walkthrough booking page — walkthrough.html
Deploy at `/walkthrough`. Brand-framed, centered Calendly embed on the blue gradient for Bill's **dandy-home-walk-thru** event (URL lives in the `CALENDLY` constant at the top of the script; brand colors ride along as URL params). Skeleton shimmer + "Open Bill's calendar →" fallback if the Calendly script can't load. Bookings fire sparkles + toast + `fbq('track','Schedule')` + GA4 `walkthrough_booked`. Same desktop-number / mobile-call-button phone treatment. Linked from every Scottdale CTA.


## Zapier hooks — routing map (do not cross these)
- `44zimzq` — shared WAITLIST hook: homepage (`index.html`) + Decatur (`decatur.html`) forms. Unchanged.
- `46sj4zz` — dedicated SCOTTDALE INQUIRY hook: `scottdale.html` inquiry form only. Live and wired via ClawBot.
