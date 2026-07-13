# Sidequest Digital — Marketing Site

## Overview
- **Project**: sidequest.nz marketing website
- **Type**: One-page static "business card". Dark, minimal, confident.
- **Status**: **LIVE**. Deployed 2026-07-13. The old multi-page service site and the z-axis scroller redesign are both retired.
- **URL**: sidequest.nz (GitHub Pages, via `CNAME`)

## Playbooks In Use
Read from the Brain folder at session start. Do not copy into this project.
Brain location: `D:/Sidequest Digital/Dev Projects/Brain/`

- `JoelTempero.md` — working profile (always)
- `TokenDiscipline.md` — token cost hygiene (always)
- `DesignSystem.md` — design contract workflow (current phase)

## Architecture
One page. `index.html` is the whole site.
- Nav: wordmark only, no links.
- Hero: `BE KNOWN. / STAND OUT. / GET AHEAD.` + tagline "Secure your place in the new technical age."
- A decorative `.you-are-here` marker (star + arrow + label) anchored to the headline's right edge, so it travels with the type instead of the viewport.
- Bottom `.contact-bar` with a "Get in touch" trigger. It opens `#contact-panel`, which holds EVERYTHING else: 6 disciplines, a compressed Web3Forms contact form, Joel + Harrison, direct email/phone, and Privacy/Terms links.
- `pages/privacy.html`, `pages/terms.html` — legal pages. "Return to home" top-left and bottom-left.
- 8 meta-refresh stubs in `pages/` for retired URLs (GitHub Pages has no server-side redirects).
- **`churches/` is a SEPARATE deployed app at sidequest.nz/churches/. Do not touch it.**

## Key Files
- `css/site.css` — the entire design system, one file.
- `js/particles.js` — canvas particle field. `mountParticles(canvasEl)`.
- `js/kinetic.js` — headline cursor distortion. `mountKinetic(headlineEl)`.
- `js/contact.js` — panel open/close + fetch submit. `mountContact(trigger, panel, form)`.
- Two inline scripts in `index.html`: the `no-js`→`js` class swap, and the panel collapse + fallback toggle.

## Non-obvious constraints (break these and the site breaks)
- **`#contact-panel[hidden]` is the SINGLE source of visibility truth.** Never write a `display` rule on `html.js #contact-panel` (specificity 1,1,1) — it outranks `#contact-panel[hidden]` (1,1,0) and makes the panel impossible to close. This bug shipped once and was caught in review.
- **The panel is out of flow** (absolute on desktop, fixed on mobile) so the headline stays PINNED and never moves when it opens. That is deliberate, not incidental.
- **Progressive enhancement is load-bearing.** The panel ships OPEN in the markup; JS collapses it. With JS off the form is simply visible inline and posts natively. There must be exactly ONE `#contact-form` and zero `<noscript>`.
- **`aria-label` on a `<span>` does nothing** (role `generic` prohibits naming). `kinetic.js` must name the `<h1>`, not the `.hero-line` spans, or the headline has NO accessible name once the letters are split.
- **Tap-target rules must track class renames.** A stale `.contact-direct a` selector silently left every mobile contact link under 44px.
- Surname is **Stirling**, never Sterling. Always "Sidequest Digital", never shortened.

## Design Language
- Base `#08060d`, violet `#7c3aed`, violet-light `#c4b5fd`, 4-step ink scale.
- `--border-ui: #6a6380` for interactive borders (3.56:1). `--hairline` fails contrast — decorative rules only.
- Space Grotesk (display) + Hanken Grotesk (micro/UI). Square corners.
- No dependencies, no framework, no build step. ~5.5KB of JS gzipped.

## Verified at deploy
Lighthouse desktop: performance 98, accessibility 100. One screen at 1280 and 1920, panel collapsed and open. 60fps at 6x CPU throttle. Fully usable with JS disabled. All 7 mobile tap targets at 44px.

## Dev Commands
- Dev: `python -m http.server 5500` from project root.
- Deploy: push to `origin/main`. GitHub Pages auto-deploys (~1 min).
- **`origin/main` is the live site. Local `main` is a DIFFERENT history (the backup repo) — do not merge into it.** Push feature branches with `git push origin <branch>:main`.

## Archived
- **Z-axis scroller redesign** — `origin/feat/homepage-rethink` and `origin/sidequest-backup`. The parallax world, companion robot, three-zone camera. Preserved intact, not deleted.
- Old multi-page service site (apps/portals/websites/systems/projects/pricing) — in git history before the reset.

## Next Steps
1. **`og:image` is the 512x512 logo** — social cards render it square/cropped. Needs a purpose-made 1200x630 banner.
2. Optional: shorten the contact panel further so more of the statement shows behind it when open.

## Session Log
- **2026-07-13**: Full reset. Retired the z-axis scroller (archived to branches) and the multi-page service site. Built a one-page business card: statement + tagline + everything-inside-the-panel. Deployed to sidequest.nz. Reviews caught, before ship: an empty accessible name on the headline (aria-label on a span is ignored by Chrome/Safari), an unreachable privacy policy on a form-collecting site, 1.21:1 form borders, a CSS specificity dead-end that made the contact form un-openable, and sub-44px mobile tap targets on all four contact links.
