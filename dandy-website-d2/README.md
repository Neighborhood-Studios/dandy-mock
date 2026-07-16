# Dandy — new marketing site

**Open `index.html` in a browser.** Everything is self-contained: one HTML file + `/assets`.

## What's inside
- Hero with real photo + floating in-app UI overlays (Casa-style custom-graphic feel)
- Task marquee ticker
- "A familiar face" — dedicated Dandyman section (50 homes, W2, nametag overlay)
- Three lanes: You add / Bill suggests / Autopilot (self-looping tick animation)
- Hours that bank — live looping phone demo of the 1.5h→4.5h mechanic
- "The receipt you didn't get" — scroll-triggered $0→$836 tally, strike, $149 card
- Visit Wrapped teaser — live looping phone story
- Pricing (benefits from the current site), 30-day Guarantee
- Neighborhoods — real Atlanta map + drop-model scarcity + floating status chips
- FAQ, final CTA, footer

## To finish
1. Two dashed PLACEHOLDER cards near the bottom each contain a ready image
   prompt with a copy button. Generate, save into `/assets`, swap the card
   for an `<img>` — then delete that whole placeholder section.
2. The $836 figure is placeholder math — back it with a real comparable-rate
   table before launch (fine print is already written to support it).
3. Map chips (Druid Hills sold out / Decatur 6 left) are demo data — wire to
   real drop status.
4. CTAs link to `waitlist.html` from the Webflow export — keep or repoint.

All motion is transform/opacity and respects prefers-reduced-motion.
