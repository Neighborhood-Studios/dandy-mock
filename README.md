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
| `join.html` | `/join?ref=CODE` | Referral invite: the Dandy app's Refer a Friend share link lands here (`noindex`) |
| `.well-known/apple-app-site-association` | `/.well-known/apple-app-site-association` | iOS universal links: `hidandy.com/app/*` opens the Dandy app when installed (served because of `.nojekyll`) |
| `.well-known/assetlinks.json` | `/.well-known/assetlinks.json` | Android App Links for `com.hidandy.android` (`hidandy.com/app/*`): Play App Signing key + upload key SHA-256 (Play Console → App integrity) |
| `site-index.html` | `/site-index` | Internal password-gated page index (`noindex`) |
| `media/welcome.mp4`, `media/how-adding-tasks-works.mp4` | `/media/welcome.mp4`, `/media/how-adding-tasks-works.mp4` | Videos the Dandy app streams: the onboarding Welcome step and Home's "How adding tasks work" card. The app points at these exact URLs, so to change a video, replace the file under the same name (no app release needed). Currently Dandy-branded title-card placeholders. Keep the format: vertical 1080×1920 H.264 (High, level ≤ 4.1, yuv420p, 30 fps), AAC stereo track, `+faststart`, under ~50 MB |

## Structure

- `assets/` — all page images, content-hashed (`img-<sha1-10>.<ext>`), deduped across pages. Images are kept **external** (not inline base64) so page HTML stays far under Apple's ~1MB iMessage preview cap.
- Root files required by crawlers/link previews — do not remove: `og-image.jpg` (every page's `og:image`), `apple-touch-icon.png` (+ `-precomposed.png`, requested by Apple's preview crawler), `favicon.ico`, `favicon.svg` + `favicon-32x32.png` (linked from every page's head), `site.webmanifest` + `icon-192.png` / `icon-512.png` (PWA manifest + its icons), `CNAME`.

See [README-HANDOFF.md](README-HANDOFF.md) for page mechanics, waitlist integrations, and the SEO/OG deploy checklist.
