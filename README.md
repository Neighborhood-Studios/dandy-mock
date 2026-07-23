# Dandy — marketing site

GitHub Pages site for Dandy, deployed from the `main` branch root at **https://hidandy.com** (via `CNAME`).

## Pages

| File | Deploy path | What it is |
|---|---|---|
| `index.html` | `/` | Homepage (waitlist, pricing, drop map) |
| `dandy-services.html` | `/dandy-services` | "Our Services" scope-of-work page |
| `decatur.html` | `/decatur` | Decatur drop landing page (template for future neighborhoods) |
| `drop-day.html` | `/drop-day` | Drop-day booking page (Calendly embed) |
| `terms-of-service.html` | `/terms-of-service` | Terms of Service |
| `site-index.html` | `/site-index` | Internal password-gated page index (`noindex`) |

## Structure

- `assets/` — all page images, content-hashed (`img-<sha1-10>.<ext>`), deduped across pages. Images are kept **external** (not inline base64) so page HTML stays far under Apple's ~1MB iMessage preview cap.
- Root files required by crawlers/link previews — do not remove: `og-image.jpg` (every page's `og:image`), `apple-touch-icon.png` (+ `-precomposed.png`, requested by Apple's preview crawler), `favicon.ico`, `CNAME`.

See [README-HANDOFF.md](README-HANDOFF.md) for page mechanics, waitlist integrations, and the SEO/OG deploy checklist.
