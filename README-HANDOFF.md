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
