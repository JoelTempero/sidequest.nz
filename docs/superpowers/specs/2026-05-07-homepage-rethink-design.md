# Homepage Rethink — Design Spec

**Date:** 2026-05-07
**Status:** Draft (awaiting user review)
**Supersedes:** `2026-05-06-homepage-creative-overhaul-design.md`

## Context

The previous creative overhaul (canvas particles, GSAP entrance choreography, parallax layers, text scramble) shipped but didn't land visually. After bug fixes the result still read as incomplete and over-layered. Joel worked with the Claude design tool to produce a new, locked-in concept; the full design package lives in `ref/design_handoff_homepage/`.

This spec captures the **project-specific decisions** for porting that handoff into the existing sidequest.nz codebase. It does not duplicate the handoff README, which is the high-fidelity source of truth for visuals, animations, copy patterns, design tokens, and behavioural detail.

**Read both:** this spec + `ref/design_handoff_homepage/README.md`.

## What's Changing

The homepage is being rebuilt wholesale. The new direction:

- **Aesthetic:** dark with violet undertone (`#08060d` base, `#7c3aed` primary). Replaces the previous purple+orange dual-accent scheme.
- **Typography:** Space Grotesk (display) + IBM Plex Mono (micro) — replaces Outfit + Syne.
- **Concept:** side-scrolling platformer level. A static parallax landscape (sky → mountains → trees → ground) sits behind seven full-viewport panels, plus a wandering companion robot.
- **Interaction:** vertical wheel/trackpad input drives horizontal pan via a single `requestAnimationFrame` loop. No GSAP.
- **Brand line:** "Be Known. Stand Out."

## Scope

**In scope:**
- Full rewrite of `index.html` to match the handoff design.
- Wipe homepage-specific JS (`scroll.js`, `animations.js`, `canvas.js`, `interactions.js`) and homepage CSS.
- Replace with new vanilla-JS modules: `scroll-engine.js`, `world.js`, `panels.js`, `robot.js`.
- **Global token swap:** update `css/style.css` to the new palette and type system. The work, contact, and project-detail pages adopt the new tokens automatically. Light cleanup where orange accents need to become violet.
- Drop GSAP CDN.

**Out of scope:**
- Bespoke redesign of `work.html`, `contact.html`, project detail pages, legal pages. They inherit the new tokens but keep their existing layouts.
- Real client logos for Panel 06 (placeholder for launch, swap when Joel provides).
- Real photography for the four Quest panels (placeholder for launch, swap when Joel provides).
- Returning Technicolour Thoughts to the homepage marquee (deferred until Joel has more content).
- Adding a CMS for project content (separate Brain project).

## Stack Decision

**Vanilla JS, no build step.** The handoff prototype is React + inline Babel; we port the patterns to plain ES modules. Rationale:

- Aligns with the project's "no build step, no framework" principle in `CLAUDE.md`.
- The prototype's logic (RAF loops, DOM math, simple state machines) translates 1:1 to vanilla — React is incidental to the design, not load-bearing.
- Static hosting deploy stays trivial.

## Project Lineup

Four Quest panels feature 4 of the 5 live projects. **Technicolour Thoughts is dropped from the homepage marquee for this launch** (still listed on `work.html`).

| # | Project | Headline | Sub-line | Detail link |
|---|---|---|---|---|
| 01 | Chill Air | "Job sheets, off the kitchen counter." | `Chill Air · website + client portal · 2026` | `projects/chill-air/` |
| 02 | Storybook Weddings | "Photos delivered, not chased." | `Storybook Weddings · website + client portal · 2026` | `projects/storybook-weddings/` |
| 03 | My Living Hope | "Off-the-shelf wouldn't do." | `My Living Hope · custom Shopify theme · 2026` | `projects/my-living-hope/` |
| 04 | 24CHCH | "One weekend, every short film." | `24CHCH · annual film competition · 2026` | `projects/24chch/` |

Quest panels use the existing `ProjectPanel` shape from the handoff. Layout alternates: 01 image-right, 02 image-left, 03 image-right, 04 image-left.

### Quest CTA

The handoff doesn't specify a click target on Quest panels. We add a small `View case study →` link below the sub-line:
- IBM Plex Mono, 11px, letter-spacing 0.18em, uppercase, color `#c4b5fd`.
- Hairline `1px` underline on hover (`rgba(196,181,253,0.40)`).
- Links to the project's existing detail page (paths in the table above).

## Panel Copy Adjustments

The handoff README specifies most copy verbatim. The two changes:

### Panel 05 — See More
The handoff says: *"Twenty-six more quests in the back catalogue."*
We're using: *"More quests in the back catalogue."* — drops the made-up number. Single CTA: `Full work index →` (primary, links to `work.html`). The handoff's secondary `Field notes →` button is **hidden for launch** (no destination yet); panel layout stays balanced as a single-CTA composition.

### Panel 06 — Logos
Ten fake-logo placeholders ship at launch, exactly as drawn in `panels.jsx`. Real client logos to be swapped in by Joel later — keep the panel structure (10 slots, hand-picked positions, depths, `bobPhase`) so the swap is just SVG replacements.

## Mobile Fallback (≤900px)

Per handoff:
- Vertical stacked layout: each panel becomes `100vh`, full-bleed.
- World background still renders but with vertical parallax instead of horizontal.
- Companion robot hidden.
- Bottom panel-counter strip dropped.
- Top nav stays; nav links still scroll-to-panel via vertical `scrollIntoView`.

## Accessibility

- **Reduced motion** (`@media (prefers-reduced-motion: reduce)`): freeze all parallax layers, kill bird animation, disable robot wandering (still rendered, static), remove jet-plume animation, remove pulsing status light.
- **Keyboard navigation:** arrows / PageUp / PageDown / Home / End drive horizontal pan (per handoff). Top-nav links are real anchors.
- **Focus states:** visible outlines on all nav and CTA elements (violet, 2px, 2px offset).
- **Semantic HTML:** each panel is `<section>` with an `aria-labelledby` referencing its headline. Robot is `aria-hidden="true"`.

## File Structure

```
js/
  scroll-engine.js    — horizontal scroll + wheel/touch/keyboard input + RAF loop, exports COLORS + utility hooks
  world.js            — parallax landscape (sky, sun, stars, mountains, clouds, mid-hills, trees, ground, birds)
  panels.js           — 8 panels (hero, 4 quests, see-more, logos, contact) + shared atoms
  robot.js            — companion robot state machine + render
  main.js             — entry point: bootstraps the homepage on DOMContentLoaded; existing nav/work-loader logic stays

css/
  style.css           — globals: reset, tokens, typography (UPDATED — new palette + fonts)
  layout.css          — page layouts (UPDATED — homepage section replaced; work/contact sections kept)
  components.css      — nav, buttons (UPDATED — violet tokens, no rounded corners on buttons)
  animations.css      — DELETED (no longer used)

index.html            — REWRITTEN to handoff structure (8 panels + fixed chrome)
```

`work.html`, `contact.html`, `pages/terms.html`, `pages/privacy.html`, and `projects/<slug>/index.html` files keep their existing layouts. They pick up the new global tokens automatically; any hard-coded orange/Outfit/Syne references get a token swap.

## Code Disposition

**Wipe entirely:**
- `js/scroll.js`, `js/animations.js`, `js/canvas.js`, `js/interactions.js`
- `css/animations.css`
- The homepage section of `css/layout.css`
- GSAP + ScrollTrigger CDN script tags from `index.html`

**Keep:**
- `js/main.js` — but the homepage-bootstrapping code in it goes; nav toggle and work-page project loader stay.
- All other pages.
- All assets in `projects/<slug>/assets/`.
- `projects/manifest.json`.

## Design Tokens

Source of truth: handoff `scroll-engine.jsx` `COLORS` constant. Promote to CSS custom properties on `:root` in `css/style.css`:

```css
:root {
  --bg: #08060d;
  --bg-2: #100819;
  --bg-3: #1a0f2e;
  --ink: #f5f0ff;
  --ink-2: #b8a8d4;
  --ink-3: #7a6a92;
  --ink-4: #3d3450;
  --violet: #7c3aed;
  --violet-light: #c4b5fd;
  --violet-glow: rgba(124, 58, 237, 0.35);
  --line: rgba(196, 181, 253, 0.10);
  --line-mid: rgba(196, 181, 253, 0.20);

  --font-display: "Space Grotesk", sans-serif;
  --font-mono: "IBM Plex Mono", monospace;
}
```

Type scale, spacing, border-radius rules: per handoff README §"Design Tokens".

## Performance Notes

- Single RAF tick in `scroll-engine.js`. Each parallax layer / logo / robot can have its own RAF (per the handoff) — fine for ~30 elements.
- All transforms via `translate3d` + `will-change: transform`.
- No React, no virtual DOM, no diff loop.
- Drop GSAP CDN load (~50KB).

## SEO

The site is statically authored — panel content is real HTML, present at first paint. No JS-rendered text. Crawlers see headlines, copy, and project links without JavaScript.

## Open Questions / Deferred

1. **Real photography for Quests** — Joel will source. Until then we use the handoff's Unsplash placeholders.
2. **Real client logos** — Joel will source. Until then we ship the 10 fake logos from `panels.jsx`.
3. **Technicolour Thoughts re-add** — when Joel has more content / a fifth slot is desired, decide whether to expand to 5 Quest panels or rotate.
4. **Field notes section** — Panel 05 currently hides the secondary CTA. When/if a field-notes page exists, restore the second button (handoff has the styling locked in).

## Success Criteria

- Homepage renders the eight panels per the handoff with locked colours, type, spacing, copy.
- Horizontal scroll works via wheel, trackpad, touch, and keyboard.
- World parallax + robot behave per handoff.
- Mobile fallback renders cleanly at ≤900px.
- Reduced-motion users see a static page.
- `work.html`, `contact.html`, project detail pages, legal pages all adopt the new tokens without visual breakage.
- GSAP no longer loaded.
- Lighthouse: no perf regression vs the current homepage.
