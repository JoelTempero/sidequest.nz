# Sidequest Digital — Marketing Site

## Overview
- **Project**: sidequest.nz marketing website
- **Type**: Static portfolio site (horizontal scroll)
- **Status**: Structure in place, needs creative overhaul (homepage is functional but "boring")
- **URL**: sidequest.nz

## Playbooks In Use
Read these from the Brain folder at session start. Do not copy into this project.
Brain location: `D:/Sidequest Digital/Dev Projects/Brain/`

- `JoelTempero.md` — working profile (always)
- `TokenDiscipline.md` — token cost hygiene (always)
- `DesignSystem.md` — design contract workflow (current phase)
- `Creativity.md` — motion, layout creativity, scroll behaviour (current phase — homepage redesign)

## Tech Stack
- HTML5, CSS3 (custom properties), vanilla JS (ES modules)
- GSAP 3 + ScrollTrigger (CDN) — horizontal scroll, animations
- Web3Forms — contact form handling
- Google Fonts — Outfit (headings), Syne (body)
- Static hosting (no build step, no framework)

## Site Structure
- `index.html` — homepage with horizontal scroll (desktop), vertical (mobile). 7 panels: hero, 5 projects, CTA
- `work.html` — all projects, filterable grid
- `contact.html` — contact form + bio card + legal links (terms/privacy)
- `projects/<slug>/` — unique detail page per project
- `pages/terms.html`, `pages/privacy.html` — legal pages
- No about page (removed), no footers (removed site-wide)

## Project Content System
- Projects stored in `projects/<slug>/` with `meta.json` + `index.html` + `assets/`
- `projects/manifest.json` — single index of all project metadata
- Homepage has all 5 projects hardcoded as individual panels
- Work page reads manifest dynamically for filterable grid
- Each project detail page is a **unique, hand-crafted HTML file** — no shared template
- Brain project (Sidequest Center) will have a CMS tab (not built yet)

## Key Files
- `css/style.css` — reset, variables, typography, dark theme foundation
- `css/layout.css` — horizontal scroll layout, project showcase panels, page layouts, responsive
- `css/components.css` — nav, buttons (footer styles are dead code — can be cleaned up)
- `css/animations.css` — hero initial states only (project panels visible by default)
- `js/main.js` — nav toggle, project data loader (used by work.html)
- `js/scroll.js` — GSAP ScrollTrigger horizontal scroll setup
- `js/animations.js` — hero entrance + mobile scroll reveals

## Design Language
- Dark theme (#0a0a0a base)
- Purple (#6d28d9) + orange (#f97316) accent system
- Unified fixed atmospheric background (purple + orange radial glows)
- Noise overlay
- Storytelling copywriting (not marketing speak)
- Always "Sidequest Digital" (never shortened)

## Creative Direction (pending brainstorm)
- **Journey type:** TBD — likely Interactive Explorer / Cinematic Reveal hybrid
- **Intensity:** 4-5 (this is Joel's own portfolio — go big)
- **Current problem:** Homepage is functional but blocky, rigid, repetitive. Every panel looks the same. No parallax, no scroll-driven transforms, no interactive moments, no storytelling arc.
- **Goal:** Each section tells a story, not just showcases a product. Through-the-roof engaging. Parallax, cursor effects, bold typography, full-bleed imagery, asymmetric layouts.
- **References to pull from:** linear.app, vercel, tesla, ferrari, spacex (dark cinematic); figma (playful interactive); stripe (polish)

## Adding a New Project
1. Create `projects/<slug>/` directory
2. Add `meta.json` (schema: title, slug, summary, category, tags, featured, featuredImage, date, url, status)
3. Add `index.html` — custom, unique detail page
4. Add entry to `projects/manifest.json`
5. Add panel to `index.html` homepage (currently hardcoded)

## Dev Commands
- Dev: Open with VS Code Live Server (no build step)
- Deploy: Push to git (static host auto-deploys)

## Next Steps
1. **Brainstorm homepage creative overhaul** — use visual companion, reference Creativity.md + DesignSystem.md, design spec with intensity 4-5 approach
2. **Implement homepage redesign** — parallax, scroll transforms, storytelling sections, interactive moments
3. Design review of project detail pages (visual QA)
4. Add .superpowers/ to .gitignore
5. Build CMS tab in Sidequest Center to manage project content (not started)
6. Deploy live and verify on real domain

## Key Decisions
- **Horizontal scroll** (desktop) with vertical fallback (mobile) — inspired by sms.playstation.com
- **GSAP + ScrollTrigger** over vanilla CSS scroll-driven animations — better control, browser support
- **Local static content** over Firebase — simpler, faster, no external dependency
- **Unique per-project pages** — no shared template, each project is hand-crafted HTML
- **Always "Sidequest Digital"** — never shortened
- **Syne body font** over Inter — more creative personality for a portfolio site
- **No about page** — condensed bio lives on contact page instead
- **No footers** — minimal site, legal links on contact page
- **Content visible by default** — no CSS hidden states for GSAP; animations are polish, not gatekeepers

## Related Projects
- **Brain (Sidequest Center)**: `D:/Sidequest Digital/Dev Projects/Brain/` — will have CMS tab that writes project content to this repo's `projects/` directory
- **Portal (retiring)**: `portal.sidequest.nz/` subfolder — being taken offline

## Live Projects
Five real projects:
- **Chill Air** (websites) — heat pump installer, website + portal
- **Storybook Weddings** (portals) — wedding photography, website + client portal
- **Technicolour Thoughts** (websites) — production studio, brand website
- **My Living Hope** (websites) — custom Shopify theme, e-commerce
- **24CHCH** (websites) — annual short film competition event site

## Session Log
- **2026-05-06**: Font swap Inter→Syne, removed about page + footers site-wide, added bio card to contact page, rewrote homepage with all 5 project panels + unified background, fixed invisible content bug (CSS opacity states), fixed work page card visibility. Homepage is functional but needs creative overhaul — brainstorm planned for next session using visual companion + Creativity playbook at intensity 4-5.
- **2026-05-05 (session 2)**: Migrated 5 published posts from portal Firestore into new project content system. Downloaded 19 images. Created unique detail pages per project. Removed example placeholders.
- **2026-05-05**: Full site rebuild from vanilla business site to cinematic horizontal-scroll portfolio. Spec + plan + implementation complete.
