# Z-Axis Single-Page Refactor — Design Spec

**Date:** 2026-05-08
**Status:** Draft (awaiting user review)
**Supersedes:** `2026-05-07-z-axis-navigation-design.md` (the cross-page transition approach)

## Context

The Z-axis navigation shipped on `feat/homepage-rethink` — clicking `Work` panned the camera down to the underground page; clicking `Contact` panned up to the sky page. Three real HTML pages, masked page navigation, a transition orchestrator.

After live review, the seam between source and destination is the recurring pain point:
- The browser's repaint moment between page navigations leaves a brief blank flash even with overlay handoffs.
- The sky page's gradient bottom (`#6d3aa8`) is markedly brighter than the homepage's mid-frame top, so ascending into the sky reads as a sudden jump in luminance.
- The underground's top is darker than the homepage's bottom edge, with a similar (though less severe) discontinuity.

The structural cause: separate documents can't share a continuous camera. Even with matching body backgrounds and inline styles to suppress FOUC, the page-load moment is a real boundary.

This spec collapses the three zones into a single `index.html` with three vertically-stacked sections. Browser scroll position becomes the camera. Hash routes (`/#work`, `/#contact`) provide shareable URLs without page navigation. The transition orchestrator is replaced by a JS-driven scroll animation between zones.

In the same scope: real project imagery on the four Quest panels (replacing Unsplash placeholders) and a layout fix for the Quest panels' "void in the middle" — image and text now sit as a paired magazine spread instead of opposite-edge bookends.

## What's Changing (vs. Previous Z-Axis)

- Three real HTML pages (`index.html`, `work.html`, `contact.html`) → **one** `index.html` with three zones.
- Cross-page navigation with overlay handoff → **JS-driven `window.scrollTo` animation**.
- URL routing via separate page files → **hash routes** (`/#work`, `/#contact`, no hash = homepage).
- `js/transition.js`, `js/work-page.js`, `js/contact-page.js`, `work.html`, `contact.html` → **deleted**.
- Each environment's container changes from `position: fixed` to `position: absolute` within its zone, so it scrolls naturally with the document.
- Quest panel images: Unsplash placeholders → real `projects/<slug>/assets/hero.*` from manifest.
- Quest panel layout: edge-to-edge text+image with void in middle → centered paired-spread.

## Architecture

### Document structure

```
<body>
  <nav id="top-nav"></nav>
  <main id="page">
    <section id="zone-sky"        class="zone">  [sky env + contact form/bio]  </section>
    <section id="zone-homepage"   class="zone">  [world env + robot + #track]   </section>
    <section id="zone-underground" class="zone"> [underground env + project list] </section>
  </main>
  <footer id="bottom-strip"></footer>
</body>
```

Heights:
- `#zone-sky`: `100vh` exactly (single static panel).
- `#zone-homepage`: `100vh` exactly. Contains the existing `#track` (8 horizontal panels) — track scrolls horizontally inside this fixed-height section.
- `#zone-underground`: `auto` height — sized by content (project list grows with project count). Each project entry has its own breathing room.

### Camera = scroll position of `#page`

- `html { overflow: hidden; height: 100% }`.
- `body { overflow: hidden; height: 100% }`.
- `#page { height: 100vh; overflow-y: scroll; scrollbar-width: none }` — this is the scrollable container. Scroll position is `pageEl.scrollTop`, not `window.scrollY`.
- Scrollbar is hidden via `scrollbar-width: none` + `::-webkit-scrollbar { display: none }`.

The choice between document-scroll and inner-scroll-container is deliberate. Document scroll would be more native (screen readers, browser scroll-restoration), but the wheel-hijack at the homepage zone is cleaner when scoped to a specific element's scroll. The inner container also lets us hide the scrollbar visually without affecting the rest of the layout.

### Zone Y positions (constants, recomputed on resize)

```js
const skyY        = 0;                           // top of #page
const homepageY   = window.innerHeight;          // 1 viewport down
const undergroundY = window.innerHeight * 2;     // 2 viewports down
```

Underground bottom is `undergroundY + undergroundHeight` (variable based on project list).

## Scroll Model

### Wheel handling per zone

A wheel handler on `#page` (or `window`, scoped to `#page` in handler logic):

- **Homepage zone** (`scrollTop ≈ homepageY`):
  - `e.preventDefault()`.
  - `pageEl.scrollTop = homepageY` (clamp; ignore any vertical drift).
  - Route `e.deltaY` to the existing `scroll-engine.js` (drives `#track` horizontal pan).
- **Underground zone** (`scrollTop > homepageY + 50`):
  - Native vertical scroll within `#zone-underground`.
  - Top boundary: clamp `scrollTop` at `undergroundY` (don't let wheel-up cross back into homepage; nav click required).
- **Sky zone** (`scrollTop < homepageY - 50`):
  - `e.preventDefault()`.
  - `pageEl.scrollTop = skyY` (clamp).
  - Wheel does nothing (sky is a static panel).

The 50px tolerance prevents flicker at zone boundaries during animated nav scrolls.

### Nav clicks (zone switching)

`mountTopNav` (in `panels.js`) is simplified — no more `onNavigate` callback. Each link gets a `data-zone` attribute and a click handler that calls `scrollToZone(zoneId)`:

```js
function scrollToZone(zoneId) {
  const targets = { sky: skyY, homepage: homepageY, underground: undergroundY };
  animateScroll(pageEl, pageEl.scrollTop, targets[zoneId], 800);
  window.location.hash = zoneId === 'homepage' ? '' : zoneId;
}
```

`animateScroll` is a small RAF helper: lerps `pageEl.scrollTop` from current to target with ease-in-out over the duration. Updates the `inFlight` flag to ignore double-clicks.

The nav links also get real `href` values (`href="#contact"` for sky, `href="#"` for homepage, `href="#work"` for underground) so no-JS visitors get native anchor jumps as a graceful fallback.

### Hash routing

- `/` → load with `pageEl.scrollTop = homepageY`. Shows homepage.
- `/#work` → load with `pageEl.scrollTop = undergroundY`. Shows underground immediately.
- `/#contact` → load with `pageEl.scrollTop = skyY`. Shows sky immediately.
- `hashchange` event fires on browser back/forward → `scrollToZone` is called accordingly.
- Hash → zone map: `#work` → `underground`, `#contact` → `sky`, anything else → `homepage`.

On initial load, JS reads `window.location.hash`, computes target zone, sets `pageEl.scrollTop` instantly (no animation). The first frame the user sees is already at the right zone.

### Browser back/forward

Updating `window.location.hash` pushes a history entry. Back/forward triggers `hashchange`, which animates to the previous zone. Standard pattern.

## Visual Continuity

### Zone-relative environments

Each environment's root container changes from `position: fixed; inset: 0` to `position: absolute; inset: 0` (relative to the zone, which is `position: relative; height: 100vh`). The environment scrolls naturally as part of the zone.

Affected modules:
- `js/world.js` — world container `position: absolute; inset: 0` within `#zone-homepage`.
- `js/robot.js` — robot wrapper `position: absolute; inset: 0` within `#zone-homepage` (was fixed).
- `js/sky.js` — sky env `position: absolute; inset: 0` within `#zone-sky`.
- `js/underground.js` — underground env `position: absolute; top: 0; left: 0; width: 100%; height: 100%` within `#zone-underground`. Note: underground is taller than viewport, so the env spans the full zone height (it currently does, sized to `max(window.innerHeight * 6, 6000)`).

The world parallax + robot only render visible content when `#zone-homepage` is in view. When the camera scrolls into sky or underground, homepage zone scrolls out of view; world + robot go with it.

### Edge color matching

- **Sky bottom** = **homepage top** color. Currently sky's bottom is `#6d3aa8` (bright violet), homepage top is dark `#08060d`. Fix: invert the sky gradient so its bottom is dark (matches homepage top), and the brighter colors are at the top of the sky panel (deeper into the sky's "view"). New gradient: `linear-gradient(180deg, #6d3aa8 0%, #5d2a8e 25%, #4a2378 55%, #2d1654 80%, #08060d 100%)`. The brighter atmospheric haze is now at the TOP of the sky panel (where the camera is "looking up into deep sky"); the bottom of the sky panel matches the homepage's atmospheric top.
- **Underground top** = **homepage bottom** color. The homepage's ground line (in world.js) is `#06040b` at the very bottom; the underground's top section currently uses cave depth gradient starting at `#0a0612`. Fix: the cave depth gradient's top stop becomes `#06040b` (exact match to homepage's ground band), then darkens through the rest as before. Effectively imperceptible at the seam.

### Panel layout fix (Quest 01–04)

Current: `display: grid; grid-template-columns: 1fr 1fr; gap: 60px; padding: 0 80px`. Image and text occupy opposite edges of the viewport with ~30% void in the middle.

New: paired-spread layout.

- Add a `.project-grid` wrapper with `max-width: 1100px; margin: 0 auto; padding: 0 32px`.
- Reduce gap: `60px` → `32px`.
- For `align: 'left'` (image right): `text-col` gets `justify-self: end`, `image-col` gets `justify-self: start`. Both blocks pull toward the gap.
- For `align: 'right'` (image left): `text-col` gets `justify-self: start; text-align: right`, `image-col` gets `justify-self: end`.
- Image: `min(420px, 38vw)` (was `32vw` — 6vw more presence).

Result: image + text sit as a cohesive pair near the panel's center; atmospheric world parallax breathes on the outside. The "void in the middle" disappears.

### Real project imagery

Quest panels use the manifest's `featuredImage` field instead of Unsplash placeholders. The four featured panels:

| Quest | Project | Image path |
|---|---|---|
| 01 | Chill Air | `projects/chill-air/assets/hero.jpg` |
| 02 | Storybook Weddings | `projects/storybook-weddings/assets/hero.png` |
| 03 | My Living Hope | `projects/my-living-hope/assets/hero.webp` |
| 04 | 24CHCH | `projects/24chch/assets/hero.png` |

`mountQuest01..04` read from `projects/manifest.json` instead of hardcoding URLs. Sub-line and headline stay locked per the previous spec.

## Files Affected

### Modified
- `index.html` — body restructured to three zones inside `<main id="page">`. Stays the entry point.
- `js/homepage.js` — becomes the orchestrator for all three zones. Mounts world+robot+panels in homepage zone, mounts sky env + contact form in sky zone, mounts underground env + project list in underground zone. Wires nav clicks to `scrollToZone`. Reads hash on load for initial scroll position.
- `css/layout.css` — drop `body.underground` and `body.sky` blocks; add `#page`, `.zone`, `#zone-sky`, `#zone-homepage`, `#zone-underground` rules. Mobile media query restructured for the new layout.
- `css/style.css` — `html, body { overflow-y: hidden; height: 100% }`.
- `js/scroll-engine.js` — wheel handler scoped to `#page` instead of `window`. New `inHomepageZone()` check; clamp `pageEl.scrollTop = homepageY` while in homepage zone.
- `js/world.js` — root container `position: absolute` instead of `fixed` (still scoped to its zone).
- `js/robot.js` — same change.
- `js/underground.js` — same change.
- `js/sky.js` — same change.
- `js/panels.js` — `mountTopNav` simplified: drop `onNavigate` opt; replace with `onZoneClick(zoneId)` callback. Update nav link `href` values to `#sky` / no-hash / `#work`.
- `js/main.js` — keep nav-toggle logic if still needed; otherwise delete.

### Deleted
- `work.html`
- `contact.html`
- `js/work-page.js`
- `js/contact-page.js`
- `js/transition.js`

### Reused unchanged
- `js/scroll-engine.js`'s horizontal scroll engine logic (only the wheel handler scope changes).
- `js/panels.js` Quest panel rendering (only minor layout CSS + `featuredImage` swap; copy stays).

## Mobile (≤900px)

The single-document architecture works for mobile too, with simpler scroll behavior:

- `html, body { overflow-y: auto }` — native vertical scroll throughout.
- `#zone-homepage` becomes vertical-stacked (no horizontal track on mobile — already implemented in T9 of homepage rebuild).
- Nav clicks use `el.scrollIntoView({ behavior: 'smooth', block: 'start' })` against the target zone.
- No wheel hijacking; everything scrolls natively.
- Quest panel paired-spread layout collapses to single-column stacked (already implemented).

The user vertically scrolls through the whole document. The Z-axis metaphor is preserved (sky at top, underground at bottom) but the camera-pan ceremony is replaced by native scrolling.

## Reduced Motion

- Nav clicks: `pageEl.scrollTop = target` instantly (skip animateScroll's RAF).
- Hash route on load: same instant set (already the case for direct loads).
- Environments: existing reduced-motion handling unchanged.
- CSS global rule for `prefers-reduced-motion: reduce` already disables animations/transitions.

## Out of Scope

- Real client logos for Panel 06 (still 10 fake placeholders).
- Real photography for non-featured projects.
- Restoring Technicolour Thoughts to the homepage marquee.
- Field-notes section.
- Project detail page redesign (`projects/<slug>/index.html` files).
- Per-page SEO meta tags beyond what's already on `index.html` (we accepted that work/contact zones don't need their own crawled URLs; SEO comes from project detail pages).

## Success Criteria

- One `index.html` document at `/`. No more `work.html` or `contact.html` files.
- Clicking `Work` from anywhere animates `#page.scrollTop` to the underground zone over ~800ms; URL becomes `/#work`. No flash, no overlay, no page navigation.
- Clicking `Contact` does the equivalent for the sky zone (`/#contact`).
- Clicking `Home` returns to the homepage zone (`/`).
- Direct loads of `/#work` / `/#contact` arrive instantly at the target zone.
- Sky's bottom and underground's top blend imperceptibly into the homepage's top and bottom edges respectively.
- Quest panels have real project imagery and the paired-spread layout (no void in the middle).
- Browser back/forward navigates between zones correctly.
- Mobile: native scroll throughout, no wheel hijack, all zones reachable.
- Reduced motion: instant scroll switches, no animations.
- No console errors across desktop / mobile / reduced-motion.

## Open Questions

- **Animation duration:** 800ms for nav clicks felt right in the previous Z-axis design. Same duration here unless live tuning suggests otherwise.
- **Scroll lock at homepage clamp:** the wheel handler clamps `scrollTop = homepageY` while in homepage zone. There's a tiny edge case where animated nav scrolls into homepage zone briefly clamp-jitter — implementation will use the `inFlight` flag to suppress wheel handling during animated transitions.
- **Bottom strip:** the homepage's `#bottom-strip` (counter + progress bar) currently shows when in homepage zone. Should it hide when scrolled into sky/underground zones? Simplest: keep showing always (it's part of homepage chrome but `position: fixed` to bottom of viewport — actually after the refactor it'll need to be inside `#zone-homepage` so it hides naturally when out of zone). Defer to implementation; default to "hides naturally".
