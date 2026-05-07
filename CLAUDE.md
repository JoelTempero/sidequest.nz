# Sidequest Digital — Marketing Site

## Overview
- **Project**: sidequest.nz marketing website
- **Type**: Static portfolio site (horizontal scroll)
- **Status**: Homepage rebuilt + Z-axis navigation extension shipped on `feat/homepage-rethink`. Click `Work` → camera pans down into an underground archaeological archive; click `Contact` → camera pans up into a dusk-stars sky panel. All cross-page transitions tested working desktop + mobile. Awaiting Joel's final review and merge.
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
- Google Fonts — Space Grotesk (display), IBM Plex Mono (mono/micro)
- Web3Forms — contact form handling
- Static hosting (no build step, no framework, no GSAP)

## Site Structure
- `index.html` — homepage with horizontal scroll (desktop), vertical stack (mobile ≤900px). 8 panels: hero, 4 quests (Chill Air, Storybook, My Living Hope, 24CHCH), see-more, logos, contact. Companion robot drifts above the parallax landscape (homepage only).
- `work.html` — underground archaeological archive (vertical-scroll project list with rock-strata + lantern parallax backdrop). All 5 projects.
- `contact.html` — dusk-stars sky panel (single static view with bio + form). Lifted above the surface metaphorically.
- `projects/<slug>/` — unique detail page per project
- `pages/terms.html`, `pages/privacy.html` — legal pages
- No about page (removed), no footers (removed site-wide)

## Z-Axis Navigation
- Click `Work` from homepage → ~800ms camera pan down → underground.
- Click `Contact` from homepage → ~800ms pan up → sky.
- Click `Home` from sub-page → ~800ms reverse pan → homepage hero.
- Cross-sub-page transit (Work ↔ Contact) → ~1600ms continuous pan through the surface.
- Mobile (≤900px): no camera pan, native `<a href>` navigation, themed backdrops still render.
- Reduced motion: instant page nav, no animations, themed backdrops static.
- Page navigation is masked by a violet overlay handoff at ~80% animation progress to prevent FOUC.

## Project Content System
- Projects stored in `projects/<slug>/` with `meta.json` + `index.html` + `assets/`
- `projects/manifest.json` — single index of all project metadata
- Homepage features 4 of 5 projects (Technicolour Thoughts deferred until more content). Each Quest panel hardcoded.
- Work page reads manifest dynamically for filterable grid (still shows all 5)
- Each project detail page is a **unique, hand-crafted HTML file** — no shared template
- Brain project (Sidequest Center) will have a CMS tab (not built yet)

## Key Files
- `css/style.css` — reset, violet+ink tokens, Google Fonts import, base typography
- `css/layout.css` — three scoped layout blocks (`body.homepage`, `body.underground`, `body.sky`) + legacy work/contact/project page rules. Mobile media queries at ≤900px per zone.
- `css/components.css` — nav glass, buttons (square corners), focus-visible styles, `#transition-overlay` styles
- `js/scroll-engine.js` — horizontal pan from vertical wheel/touch/keyboard. Single RAF, lerp, snap. Reduced-motion-aware.
- `js/world.js` — 8-layer parallax landscape (homepage only).
- `js/robot.js` — autonomous companion robot (homepage only).
- `js/underground.js` — 7-layer archaeological backdrop for work.html (rock strata, warm-amber + violet lantern points, fossil silhouettes, dust motes). Vertical parallax via window.scrollY.
- `js/sky.js` — 5-layer dusk-stars backdrop for contact.html (sky gradient, twinkling stars, aurora ribbon, mountain ridge, drifting clouds).
- `js/transition.js` — camera-pan orchestrator for cross-page nav. `transitionTo`, `playEntryAnimation`. Overlay handoff at ~80% animation progress.
- `js/panels.js` — all 8 homepage panels + fixed chrome (top nav, bottom strip). Shared atoms: `eyebrow`, `tick`, `bigLink`. `mountTopNav` accepts optional `onNavigate` for cross-page transitions.
- `js/homepage.js` — entry point for index.html. Branches isDesktop vs mobile.
- `js/work-page.js` — entry point for work.html. Mounts underground env, top nav, project list from manifest, plays entry animation.
- `js/contact-page.js` — entry point for contact.html. Mounts sky env, top nav, form (Web3Forms), plays entry animation.
- `js/main.js` — nav toggle, work-page manifest loader. Used by older pages.

## Design Language
- Dark theme (#08060d base — near-black with violet bias)
- Violet system: primary `#7c3aed`, light `#c4b5fd`, with a 4-step ink scale
- Sans-only typography: Space Grotesk display, IBM Plex Mono micro
- Square corners on cards/buttons (deliberate "magazine zine" feel)
- Noise overlay
- Side-scrolling-platformer concept with parallax landscape behind 8 viewport-sized panels
- Storytelling copywriting (not marketing speak)
- Always "Sidequest Digital" (never shortened)

## Creative Direction (current — homepage rethink)
- **Concept:** side-scrolling-platformer level. Parallax landscape (sky → mountains → trees → ground) sits behind 8 full-viewport panels. Companion robot drifts above the world.
- **Brand line:** "Be Known. Stand Out."
- **Design handoff source:** `ref/design_handoff_homepage/` (locked-in JSX prototype + README)
- **Design spec:** `docs/superpowers/specs/2026-05-07-homepage-rethink-design.md`
- **Implementation plan:** `docs/superpowers/plans/2026-05-07-homepage-rethink.md`
- **Built on branch `feat/homepage-rethink`** across 12 tasks: token swap, scroll engine, parallax world, robot, 8 panels, mobile fallback, reduced-motion + a11y, cross-page cleanup, browser smoke test.
- **QA verdict (smoke test):** Functional. All 8 panels render, scroll/parallax/robot all work, mobile fallback stacks correctly, no console errors. Joel needs to do final visual review on real domain + cross-browser + Lighthouse.

## Previous Creative Direction (archived)
- Earlier attempt: 7-panel + canvas particles + GSAP entrance choreography. Didn't land visually. Wiped in T1 of the rethink.
- Spec: `docs/superpowers/specs/2026-05-06-homepage-creative-overhaul-design.md`
- Plan: `docs/superpowers/plans/2026-05-06-homepage-creative-overhaul.md`

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
1. **Joel reviews `feat/homepage-rethink` end-to-end** — homepage + Z-axis transitions to work/contact, both desktop + mobile, in Chrome + Firefox + Safari. Toggle OS-level reduced-motion. Run Lighthouse on each of the three pages and compare to baselines.
2. **Visual contrast tuning** — the underground and sky environments may benefit from further calibration in the live browser (recent fix lifted contrast but Joel may want more punch on rock strata, lantern glow, aurora visibility).
3. **Replace placeholder content when Joel has it:**
   - Real project photography for the four Quest panels (currently Unsplash placeholders)
   - Real client logos (currently 10 fake placeholders in panel 06)
4. **Restore Technicolour Thoughts** to the homepage marquee when ready (decide: 5th Quest panel, or rotate one out).
5. **Field notes section** — Panel 05 hides the secondary CTA. When/if a field-notes page exists, restore the second `BigLink` button (handoff has the styling locked).
6. Design review of project detail pages (visual QA — separate from this rebuild).
7. Build CMS tab in Sidequest Center to manage project content (not started).
8. Merge `feat/homepage-rethink` to main + deploy live.

## Key Decisions
- **Horizontal scroll** (desktop) with vertical fallback (mobile ≤900px) — single RAF + lerp engine
- **Vanilla JS, no build step, no framework** — ports the React design handoff to plain ES modules. GSAP dropped.
- **Per-layer RAF** for parallax world and logos — clean separation, single tick per element
- **Static content** over Firebase — simpler, faster, no external dependency
- **Unique per-project pages** — no shared template, each project is hand-crafted HTML
- **Always "Sidequest Digital"** — never shortened
- **Space Grotesk + IBM Plex Mono** — tightly tracked sans-only typography
- **Square corners** on cards/buttons — deliberate magazine-zine feel
- **No about page** — condensed bio lives on contact page instead
- **No footers** — minimal site, legal links on contact page
- **Content visible by default** — no CSS hidden states; animations are polish, not gatekeepers
- **`body.homepage` namespacing** — keeps the homepage layout block from leaking into work/contact/project pages
- **Legacy token aliases** — `--text-primary`, `--accent-purple`, etc. map to the new tokens so shared pages adopt the palette without per-page rewrites

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
- **2026-05-07 (session 2)**: Z-axis navigation extension. Brainstormed: clicking Work physically pans the camera down past the ground line into an underground archive; clicking Contact pans up into a dusk-stars sky panel. Wrote spec + 9-task plan. Executed via subagent-driven development. Built `transition.js` (camera-pan orchestrator + violet-overlay handoff at ~80% animation progress to mask the page navigation), `underground.js` (7-layer archaeological backdrop — rock strata, warm-amber + violet lantern points, fossil silhouettes, dust motes), `sky.js` (5-layer dusk-stars backdrop — sky gradient, twinkling stars, aurora ribbon, mountain ridge silhouette, drifting clouds), `work-page.js`, `contact-page.js`. Rewrote work.html and contact.html with `body.underground` / `body.sky` scoped CSS blocks. Wired homepage top nav (`onNavigate` callback in `mountTopNav`). Mobile (≤900px) skips the camera pan and uses native `<a href>` nav. Reduced-motion gates throughout. Visual contrast pass after first QA showed environments were too subtle — lifted strata brighter, lanterns warmer + larger, stars bigger, aurora ~2.3× more opaque. Final QA caught a mobile sub-page nav bug (preventDefault firing before isMobile check) — fixed by only passing onNavigate on desktop. Branch ready for Joel's end-to-end review.
- **2026-05-07**: Homepage rethink. Joel brought a Claude-design-tool handoff (`ref/design_handoff_homepage/`) — locked-in violet-aesthetic horizontal-scroll concept with parallax landscape and companion robot. Brainstormed scope (vanilla JS, homepage + global token swap, 4 of 5 projects featured, drop Technicolour for now). Wrote spec + 12-task plan. Executed all 12 tasks via subagent-driven development with spec + code reviews per task. Wiped GSAP + creative-overhaul code; built `scroll-engine.js`, `world.js`, `robot.js`, `panels.js`, `homepage.js`. Mobile fallback (≤900px) stacks vertically. Reduced-motion + a11y polish (focus-visible, aria-labelledby IDs, frozen RAF under reduced-motion). Cross-page token cleanup caught 5 broken `--accent-orange` references on project pages. Browser smoke test passed — all 8 panels render, scroll works, mobile stacks correctly, no console errors. Bug fix: html element needed overflow:hidden so the browser didn't intercept wheel input via native horizontal scroll on the html box.
- **2026-05-06 (session 3)**: Visual QA of homepage. Found broken: hero text garbled (double text scramble), project panels showing images but no text (CSS hid parent containers while GSAP animated children), CTA scramble resolving to glyphs. Fixed: removed CSS opacity:0 states, moved to gsap.set() targeting exact elements, fixed textScramble to store original text and cancel overlaps, removed redundant data-scramble handler, added 5s safety fallback. Result still not landing visually — Joel wants to rethink the creative direction rather than keep patching.
- **2026-05-06 (session 2)**: Brainstormed homepage creative overhaul via visual companion (Cinematic + Interactive hybrid, intensity 4-5). Wrote design spec + implementation plan. Executed all 7 tasks via subagent-driven development with spec + code quality reviews. Built: canvas particle system, parallax layers, gradient blobs, typography fragments, text scramble, cursor glow, image tilt, magnetic buttons, per-panel entrance choreography (unique layouts for each project), discover panel with scattered thumbnails, CTA with peak energy. Fixed bugs: canvas cursor trapping, getBoundingClientRect thrashing, GSAP/direct-style transform conflicts. Found and fixed `gsap.from()` vs CSS opacity:0 conflict (converted all to `fromTo()`). Visual QA not yet completed — needs real browser testing next session.
- **2026-05-06**: Font swap Inter→Syne, removed about page + footers site-wide, added bio card to contact page, rewrote homepage with all 5 project panels + unified background, fixed invisible content bug (CSS opacity states), fixed work page card visibility. Homepage is functional but needs creative overhaul — brainstorm planned for next session using visual companion + Creativity playbook at intensity 4-5.
- **2026-05-05 (session 2)**: Migrated 5 published posts from portal Firestore into new project content system. Downloaded 19 images. Created unique detail pages per project. Removed example placeholders.
- **2026-05-05**: Full site rebuild from vanilla business site to cinematic horizontal-scroll portfolio. Spec + plan + implementation complete.
