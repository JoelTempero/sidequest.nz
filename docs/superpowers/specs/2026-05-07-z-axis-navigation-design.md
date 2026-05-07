# Z-Axis Navigation — Design Spec

**Date:** 2026-05-07
**Status:** Draft (awaiting user review)
**Builds on:** `2026-05-07-homepage-rethink-design.md` (the homepage's parallax world is the foundation this spec extends)

## Context

The homepage rebuild established a horizontal-scroll cinematic experience with an 8-layer parallax landscape: sky → sun → stars → mountains → clouds → hills → trees → ground → birds. The page reads like a side-scrolling platformer level, with a wandering companion robot above the world.

Currently, `work.html` and `contact.html` exist on the new violet/Space Grotesk tokens but kept their old conventional layouts (centered container, hero, grid/form). The top nav's `Work` and `Contact` links currently jump to homepage panels (`#panel-q1`, `#panel-contact`) instead of routing to those separate pages.

This spec extends the homepage world along the **Z-axis**:
- Click `Work` → camera physically pans **down** past the ground line into an underground archive.
- Click `Contact` → camera pans **up** past the sky into a dusk-stars view.
- Click `Home` from either → reverse pan returns to the surface.
- Cross-sub-page transit (Work ↔ Contact) is one continuous pan through the surface.

The intent is to make the metaphor literal: you actually descend or ascend, rather than navigating between unrelated pages.

## Architecture

### Three environments

| Environment | Page | Theme | Behaviour |
|---|---|---|---|
| Surface | `index.html` | Existing 8-layer landscape, robot mascot | Horizontal scroll through 8 panels |
| Underground | `work.html` | Archaeological / specimen — rock strata, fossils, dim lantern violet glow | Vertical-scroll project list with vertical-parallax backdrop |
| Sky | `contact.html` | Dusk + stars emerging — violet → indigo, mountains visible far below | Single static panel, no scroll |

The robot stays on the surface only — he is the homepage's mascot, not site furniture.

### Transition mechanic

Real page navigation between three real URLs (`index.html`, `work.html`, `contact.html`) — preserves SEO, bookmarking, link sharing.

The visual continuity comes from a **pan animation + overlay handoff**:

1. User clicks a nav link to a different zone.
2. Source page plays a local pan animation (~800ms one-way, ~1600ms cross-sub-page transit). The source page's world parallaxes vertically out of view in the direction of travel.
3. At ~80% animation progress, a violet/dark overlay fades to fully cover the screen.
4. While overlay is opaque, the browser navigates to the destination URL (instant, masked by overlay).
5. Destination page loads with its environment already at the arrival position. As the overlay fades out, the destination page plays a short "settle" animation (~400ms) — the world drifts the last small distance into rest position.
6. Total felt transit time: ~1.0–1.2s one-way, ~1.6s cross-sub-page.

### Cross-sub-page transit (Work ↔ Sky)

Per Joel's call: full continuous pan rather than direct wipe. Work → Sky animates the underground environment falling away upward (camera ascends past rock strata, bursts through the ground line implicitly, ascends into sky), then overlay handoff to the sky page. ~1.6s total. Implementation may simplify this as an extra-long single-direction pan rather than literally rendering the surface mid-transit — the overlay masks any unrendered intermediate state.

## Underground (work)

### Theme

Archaeological / specimen. Visual layers (vertically arranged, far → near):
- Far: deep cave dimness, faint distant lantern points (small violet glows)
- Mid: rock strata bands in earth-tones tinted violet (deep `#1a0f2e` to `#3a1d6e` range)
- Near: foreground rock textures with subtle highlights from the dim violet ambient
- Optional: occasional fossil silhouettes embedded in strata (small SVG outlines, sparse)
- Optional: dust motes / cave particles drifting slowly

The user feels they're inside a curated dig site, browsing artifacts under warm dim violet light. Tonally consistent with the homepage's grounded violet aesthetic — not goth, not cluttered, not literal.

### Layout

- **No horizontal scroll.** Camera holds still horizontally.
- Vertical native scroll. Background parallaxes vertically as the user scrolls down.
- Page content = vertical list of project entries.

### Content

A vertical column of project entries. Initial 5 (Chill Air, Storybook Weddings, Technicolour Thoughts, My Living Hope, 24CHCH) — note this includes Technicolour Thoughts which is dropped from the homepage marquee but still listed in the full archive.

Each entry contains:
- Project image (4:5 portrait, ~280–360px wide, with vignette + filter matching homepage's `ProjectImage` treatment)
- Eyebrow: `CASE STUDY 0X / 0N` (sequential, where N is total project count)
- H2: project title (Space Grotesk weight 500)
- Sub-line: `Client · type · year` (Plex Mono, uppercase, `--ink-2`)
- Short summary paragraph (2–3 sentences from `meta.json`)
- Tags row (existing manifest tags rendered as Plex Mono pill labels)
- `View case study →` CTA linking to `projects/<slug>/`

Layout per entry: alternating left/right alignment (matching homepage Quest panel rhythm), separated by horizontal rock-strata divider lines (`--line-mid` opacity, slightly textured).

### Page chrome

- Top nav: same as homepage. `Work` is active.
- No bottom progress strip (no horizontal scroll to track).
- Optional small "depth indicator" — Plex Mono micro text in a corner showing how far down you've scrolled, themed as a depth gauge (e.g. `-12 m` decorative). Nice-to-have, not required.
- Page intro: short eyebrow `THE ARCHIVE` + brief framing line at the top of the underground (e.g. *"Five quests so far. More to dig up."*).

### Filter buttons

Dropped. With 5 projects all in 1–2 categories, the filter adds no value. Re-introduce when project count grows past ~15.

## Sky (contact)

### Theme

Dusk + stars emerging. Visual layers (vertically arranged, far → near):
- Far: sky gradient deepening from violet (top-of-frame) through indigo to dark below
- Mid: scattered stars (more dense at top, fewer toward bottom — implies altitude)
- Near: silhouette of mountain ridge along the bottom edge of viewport (the user is looking *down* at where they came from)
- Optional: faint aurora ribbon, subtle, single curtain in the upper third
- Optional: a slow-drifting cloud or two below the mountain ridge

The user feels they've ascended above the surface to a quiet contemplative altitude.

### Layout

- **Single static panel.** No vertical scroll.
- All content visible at once on a typical desktop viewport.

### Content

Right-aligned column (matching the homepage contact panel's right-alignment treatment), max-width ~820px:
- Eyebrow: `KIA ORA`
- H2: `I'm Joel. Say hi.` (italic violet on "Joel.", muted on "Say hi." — matching homepage panel exactly)
- Bio: 2–3 sentences (current bio adapted to the elevated voice)
- Two contact links stacked: email (Space Grotesk 28px), phone (22px)
- Form: name, email, project type select, message textarea, submit button (matches existing contact form, restyled to fit)
- Legal links row: `Terms · Privacy` (Plex Mono 11px, `--ink-3`)

### Page chrome

- Top nav: same. `Contact` is active.
- No bottom progress strip.

## File Structure

### New JS modules

```
js/
  underground.js   — vertical-parallax underground environment + entry animation
  sky.js           — sky environment + entry animation (mostly static, gentle star twinkle)
  transition.js    — camera-pan transition orchestrator: animation, overlay, navigation handoff
  work-page.js     — entry point for work.html (mounts underground + project list)
  contact-page.js  — entry point for contact.html (mounts sky + form)
```

### Modified files

```
js/homepage.js      — top nav links updated to trigger transition.js (currently jump to panels)
js/panels.js        — mountTopNav signature accepts an optional transition handler
work.html           — body rewritten to underground structure
contact.html        — body rewritten to sky structure
css/layout.css      — underground + sky page CSS blocks added (own scoped sections)
css/components.css  — any shared transition overlay styles
```

### Reuse from existing modules

- `js/scroll-engine.js` — `COLORS` palette + `subscribe()` pattern reusable. Underground may use a vertical-scroll variant of the engine, or just rely on native scroll + RAF reading `window.scrollY`.
- `js/world.js` — pattern for parallax layers (RAF + transform) is the template. `world.js` itself is surface-only; underground/sky get their own modules.
- `js/panels.js` — `eyebrow()`, `tick()`, `bigLink()`, `mountTopNav()`, `mountProjectPanel`'s `ProjectImage` helper.

### `transition.js` API

```js
// Triggered by nav link click.
transitionTo({
  destination: 'work.html' | 'contact.html' | 'index.html',
  direction: 'down' | 'up' | 'transit-up' | 'transit-down',
  duration: 800 | 1600,
});
```

The function:
1. Cancels any in-flight scroll on the source page.
2. Starts an RAF-driven pan animation against a configured "camera" element (the source page's world container, or a dedicated transition layer).
3. At ~80% progress, fades a full-viewport `#transition-overlay` div from 0 → 1 opacity (~150ms).
4. Once overlay is at 1, calls `window.location.href = destination`.

Destination pages instantiate the overlay at full opacity on first paint (via inline `<style>`) so there's no flash of unstyled content during page load. After DOMContentLoaded, the destination's entry animation runs (~400ms) while the overlay fades 1 → 0.

The overlay is a single `<div>` with `background: var(--bg)` (or violet gradient), `z-index: 100`, `pointer-events: none`.

## Mobile fallback (≤900px)

The Z-axis camera pan presumes desktop horizontal-scroll mechanics on the homepage. On mobile, the homepage is already vertical-stacked and uses native scroll; introducing additional pan animations on top of native scroll would feel jittery.

Mobile behaviour:
- **No camera pan.** Top-nav clicks navigate normally (`window.location.href = ...`).
- **Themed pages still render.** The underground and sky environments are part of the page CSS/JS — they appear regardless of how you arrived.
- **Underground on mobile:** vertical scroll list, parallax backdrop runs vertically (matches the desktop behaviour, just without the entry pan).
- **Sky on mobile:** single panel, content stacked, sky backdrop visible.
- **Reduced-motion gate** on mobile additionally disables the parallax backdrop animation.

## Reduced motion (`prefers-reduced-motion: reduce`)

- **No camera pan.** Click nav → instant `window.location.href`.
- **No entry animations** on destination pages.
- **Themed environments still render** statically. Underground rock strata, sky gradient, mountains-from-above all visible — they just don't parallax or animate.
- Star twinkle and any other ambient motion disabled.

## Top Nav Behaviour

- `Home` link: `href="index.html"`. Click handler triggers reverse-direction transition based on current zone:
  - From underground → pan up to surface.
  - From sky → pan down to surface.
  - From homepage anchor: existing in-page jump (unchanged).
  - **Always lands the user at panel 0 (hero)** — previous horizontal scroll position on the homepage is not restored. Simpler model, predictable arrival point.
- `Work` link: `href="work.html"`. Click handler triggers transition:
  - From homepage → pan down.
  - From sky → cross-sub-page transit (down through surface, into underground).
- `Contact` link: `href="contact.html"`. Click handler triggers transition:
  - From homepage → pan up.
  - From underground → cross-sub-page transit (up through surface, into sky).
- Active state matches current zone.

If JS is disabled (or transition.js fails to load), the `<a href>` fallback navigates the user to the destination page with no animation. Graceful degradation.

## Out of Scope

- Blog / field-notes section. The homepage's secondary `Field notes →` button stays hidden; this spec doesn't introduce a third zone.
- Real client logos for the homepage logos panel (still placeholder).
- Real project photography for homepage Quest panels (still Unsplash placeholders).
- Search / filter / sort on the underground archive (defer until project count grows).
- Restoring Technicolour Thoughts to the homepage marquee (separate decision).
- Re-architecting `js/world.js` into a generic parallax-environment module that all three zones share. Underground and sky get their own modules; if patterns repeat enough, refactor in a follow-up.
- Animated transition between project detail pages (`projects/<slug>/`). Detail pages keep their own existing layouts — only the index `work.html` is redesigned.

## Success Criteria

- Clicking `Work` on the homepage triggers a visible camera-pan animation + arrives at the underground page with no visual flash or jarring layout pop.
- Clicking `Contact` on the homepage triggers a pan-up + arrives at the sky page similarly.
- Clicking `Home` from either zone reverses the pan and returns to the surface.
- Cross-sub-page transit (Work → Contact, or vice versa) plays a longer continuous pan ~1.6s.
- The underground page presents a vertical-scrolling project list with parallax rock-strata backdrop.
- The sky page presents a single static contact panel with sky-themed backdrop.
- Mobile: no pan, but themed pages render correctly with backdrops adapted to vertical layout.
- Reduced motion: no pan, no entry animations, themed pages still visible (static).
- All URLs remain real, shareable, SEO-indexable.
- No console errors across desktop / mobile / reduced-motion.

## Open Questions / Deferred

1. **Depth indicator** on underground page (decorative `-12m` style readout) — leaning yes, but optional polish. Decide during implementation.
2. **Aurora ribbon** on sky page — optional. Decide during implementation.
3. **Star twinkle** subtle animation — included by default; can be disabled if it feels noisy.
4. **Cloud drift below the sky's mountain ridge** — optional. Implementation can include as a low-effort pleasant detail or skip.
5. **Pan animation curve** (ease-in-out vs custom cubic-bezier) — implementation detail, will tune in browser.
