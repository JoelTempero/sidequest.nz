# Sidequest Digital — Marketing Site

## Overview
- **Project**: sidequest.nz marketing website
- **Type**: Static portfolio site (horizontal scroll)
- **Status**: Rebuilt (v2 — GSAP horizontal scroll, dark cinematic theme)
- **URL**: sidequest.nz

## Playbooks In Use
Read these from the Brain folder at session start. Do not copy into this project.
Brain location: `D:/Sidequest Digital/Dev Projects/Brain/`

- `JoelTempero.md` — working profile (always)
- `TokenDiscipline.md` — token cost hygiene (always)
- `DesignSystem.md` — design contract workflow (current phase)

## Tech Stack
- HTML5, CSS3 (custom properties), vanilla JS (ES modules)
- GSAP 3 + ScrollTrigger (CDN) — horizontal scroll, animations
- Web3Forms — contact form handling
- Google Fonts — Outfit (headings), Inter (body)
- Static hosting (no build step, no framework)

## Site Structure
- `index.html` — homepage with horizontal scroll (desktop), vertical + animations (mobile)
- `about.html` — editorial about page
- `work.html` — all projects, filterable grid
- `contact.html` — contact form + details
- `projects/<slug>/` — unique detail page per project
- `pages/terms.html`, `pages/privacy.html` — legal (kept from v1)

## Project Content System
- Projects stored in `projects/<slug>/` with `meta.json` + `index.html` + `assets/`
- `projects/manifest.json` — single index of all project metadata
- Homepage reads manifest to populate featured projects per category
- Work page reads manifest for full grid
- Each project detail page is a **unique, hand-crafted HTML file** — no shared template
- Brain project (Sidequest Center) will have a CMS tab that writes to this directory

## Key Files
- `css/style.css` — reset, variables, typography, dark theme foundation
- `css/layout.css` — horizontal scroll layout, page layouts, responsive
- `css/components.css` — nav, footer, cards, buttons
- `css/animations.css` — initial states, keyframes (GSAP does the heavy lifting)
- `js/main.js` — nav toggle, project loader utility
- `js/scroll.js` — GSAP ScrollTrigger horizontal scroll setup
- `js/animations.js` — per-panel and per-page animation timelines

## Design Language
- Dark theme (#0a0a0a base)
- Purple (#6d28d9) + orange (#f97316) accent system
- Atmospheric glows, noise overlay, gradient borders
- Storytelling copywriting (not marketing speak)
- Always "Sidequest Digital" (never shortened)

## Adding a New Project
1. Create `projects/<slug>/` directory
2. Add `meta.json` (schema: title, slug, summary, category, tags, featured, featuredImage, date, url, status)
3. Add `index.html` — custom, unique detail page (use Claude Code for creative uniqueness)
4. Add entry to `projects/manifest.json`
5. If featured, set `"featured": true` — appears on homepage in matching category panel

## Dev Commands
- Dev: Open with VS Code Live Server (no build step)
- Deploy: Push to git (static host auto-deploys)

## Related Projects
- **Brain (Sidequest Center)**: `D:/Sidequest Digital/Dev Projects/Brain/` — will have CMS tab that writes project content to this repo's `projects/` directory
- **Portal (retiring)**: `portal.sidequest.nz/` subfolder — being taken offline

## Session Log
- **2026-05-05**: Full site rebuild from vanilla business site to cinematic horizontal-scroll portfolio. Spec + plan + implementation complete. Removed pricing, service pages, Firebase dependency. Added GSAP horizontal scroll, dark theme, project content system.
