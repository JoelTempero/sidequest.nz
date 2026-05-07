# Z-Axis Navigation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Extend the homepage's parallax world along the Z-axis. Click `Work` → camera pans down through ground into an archaeological underground archive (vertical-scrolling project list). Click `Contact` → camera pans up into a dusk-stars sky panel (single static contact form). Returns and cross-sub-page transits use full continuous pans masked by an overlay handoff at the page navigation boundary.

**Architecture:** Three real HTML pages (`index.html`, `work.html`, `contact.html`) with a shared transition orchestrator (`js/transition.js`) that animates a camera pan, fades a violet overlay to mask the page navigation, and the destination page renders with its themed parallax environment already at the arrival altitude. Each environment (underground, sky) is its own vanilla-JS module mirroring the world.js pattern (RAF-driven layered SVG/divs reading `window.scrollY` for vertical parallax).

**Tech Stack:** HTML5, CSS3 (custom properties), vanilla JS (ES modules), Google Fonts. No build step. Reuses `js/scroll-engine.js` exports (`COLORS`, `subscribe`) and `js/panels.js` helpers (`eyebrow`, `tick`, `bigLink`, `mountTopNav`). No new dependencies.

**Spec:** `docs/superpowers/specs/2026-05-07-z-axis-navigation-design.md` — read this for visual/behavioural source-of-truth.

---

## Task 1: Transition module + overlay infrastructure

**Files:**
- Create: `js/transition.js`
- Modify: `css/components.css` (add `#transition-overlay` styles)
- Modify: `index.html`, `work.html`, `contact.html` (add the overlay div + initial-state inline style)

Builds the cross-page transition orchestrator. The overlay div sits at `z-index: 100`, full viewport, `pointer-events: none`. Source page animates its world downward/upward via RAF; at ~80% the overlay opacity ramps 0→1; once opaque, `window.location.href` navigates. Destination pages render with overlay opacity = 1 from first paint (inline `<style>` to avoid FOUC), then on `DOMContentLoaded` the entry animation begins and the overlay fades 1→0.

- [ ] **Step 1.1:** Create `js/transition.js`. Export:
  ```
  transitionTo({ destination, direction, duration })
  ```
  - `direction`: `'down'` (to underground), `'up'` (to sky), `'transit-up'` (work→sky, 1600ms), `'transit-down'` (sky→work, 1600ms), `'return-up'` (underground→home), `'return-down'` (sky→home).
  - On call: cancel any in-flight scroll engine, start RAF pan against `document.body` or a designated camera transform, ramp `#transition-overlay` opacity from 0→1 starting at progress 0.8, navigate at progress 1.0.
  - For surface pages (homepage), the existing horizontal track is what gets translated vertically during the pan (an additional `translateY` on top of its current `translateX`). A simpler alternative: animate `document.body { transform: translate3d(0, -panY, 0) }` with `body { will-change: transform }`.
- [ ] **Step 1.2:** Also export `playEntryAnimation({ direction, duration })` for destination pages to call on `DOMContentLoaded`. This animates the destination's world from an offset position into its rest position (~400ms) while ramping `#transition-overlay` opacity from 1→0.
- [ ] **Step 1.3:** Add to `css/components.css`:
  ```css
  #transition-overlay {
    position: fixed;
    inset: 0;
    background: var(--bg);
    z-index: 100;
    pointer-events: none;
    opacity: 0;
  }
  ```
- [ ] **Step 1.4:** Add `<div id="transition-overlay"></div>` to each of `index.html`, `work.html`, `contact.html` at top of `<body>`. On `work.html` and `contact.html` ONLY, add an inline `<style>` block in `<head>` setting `#transition-overlay { opacity: 1 }` so the overlay is opaque on first paint of destination pages (prevents flash of destination content before entry animation runs).
- [ ] **Step 1.5:** `node --check js/transition.js` — pass.
- [ ] **Step 1.6:** Commit: `feat: transition.js — camera-pan orchestrator + overlay handoff for cross-page nav`

---

## Task 2: Underground environment module

**Files:**
- Create: `js/underground.js`
- Reference: `js/world.js` for the parallax-layer pattern (commit `2d50e19`); copy the `raf()` / `trackedRaf()` / `destroy()` pattern.

Vertical-parallax underground environment. Read `window.scrollY` each frame and apply `translate3d(0, -scrollY * factor, 0)` to each layer. Theme: archaeological — rock strata bands, fossil silhouettes, dim violet lantern points.

Layer composition (back → front, factors are multipliers on `window.scrollY`):

| Layer | Factor | Description |
|---|---|---|
| Cave depth | 0.05 | Almost-still dark gradient base, deepens further from the surface as user scrolls |
| Distant lantern points | 0.15 | Sparse small `#c4b5fd` glows scattered, mostly upper portion |
| Far rock strata | 0.30 | Horizontal banded gradient `#1a0f2e → #2a1351 → #3a1d6e`, deterministic seed for band heights |
| Mid rock strata | 0.50 | Closer banded gradient with subtle texture noise, `#3a1d6e → #2a1351` |
| Fossil silhouettes | 0.65 | Sparse `#0a0612` SVG outlines (simple shapes — bones, leaves, shells), every ~400px vertically |
| Foreground rock | 0.85 | Dark texture suggesting close walls, with subtle violet rim highlights |
| Dust motes | 0.10 + drift | Slow upward-drifting `rgba(196,181,253,0.15)` particles, `performance.now()` based |

Container: `position: fixed; inset: 0; pointer-events: none; z-index: 0; overflow: hidden`. Layers sized to `max(window.innerHeight * 6, 6000)` so they cover deep scroll.

- [ ] **Step 2.1:** Create file scaffold + `mountUnderground(rootEl, opts)` signature. Returns `{ destroy }`.
- [ ] **Step 2.2:** Implement cave depth + far rock strata layers (gradient divs).
- [ ] **Step 2.3:** Implement distant lantern points (deterministic SVG circles in upper region).
- [ ] **Step 2.4:** Implement mid rock strata + foreground rock (gradient divs with optional SVG noise).
- [ ] **Step 2.5:** Implement fossil silhouettes (5–8 simple SVG paths placed every ~400px, inline-svg).
- [ ] **Step 2.6:** Implement dust motes (small SVG circles that drift upward via `performance.now()`).
- [ ] **Step 2.7:** Each layer registers via `trackedRaf()`. `destroy()` cancels all RAFs + removes DOM.
- [ ] **Step 2.8:** Reduced-motion detection at module load — if true, all layers render once at rest position, no RAFs registered.
- [ ] **Step 2.9:** `node --check js/underground.js` — pass. `import('./js/underground.js')` exports `[ 'mountUnderground' ]`.
- [ ] **Step 2.10:** Commit: `feat: underground.js — archaeological vertical-parallax environment`

---

## Task 3: Sky environment module

**Files:**
- Create: `js/sky.js`
- Reference: `js/world.js` for the parallax-layer pattern.

Single-panel sky environment. Mostly static (no scroll on the sky page) but with subtle motion: star twinkle, optional aurora shimmer, slow cloud drift below the mountain ridge.

Layer composition (back → front):

| Layer | Behaviour | Description |
|---|---|---|
| Sky gradient | static | Deep violet at top → indigo → dark below, full viewport |
| Stars | twinkle | 60 small `#c4b5fd` circles, top 70% of viewport, opacity oscillates per-star at varied frequencies (each star has a unique `phase` seed) |
| Aurora ribbon | optional/static | Single subtle violet curtain in the upper third, very low opacity (`rgba(196,181,253,0.12)`). Per spec Open Question — include by default; can be removed if too noisy. |
| Mountain ridge silhouette | static | Bottom 20% of viewport — silhouette `#06040b` matching homepage's mountain shape inversed |
| Cloud drift | slow horizontal | 2–3 ellipse puffs `#c4b5fd` low opacity, drifting horizontally via `performance.now() * 0.02 % viewport-width` |

Container: `position: fixed; inset: 0; pointer-events: none; z-index: 0; overflow: hidden`. Single viewport, no scroll-driven parallax.

- [ ] **Step 3.1:** Create file scaffold + `mountSky(rootEl)` signature. Returns `{ destroy }`.
- [ ] **Step 3.2:** Implement sky gradient layer (gradient div).
- [ ] **Step 3.3:** Implement stars layer with per-star twinkle (60 SVG circles, each with a closure capturing its phase, RAF updates opacity via `0.5 + 0.5 * Math.sin(performance.now() * 0.001 + phase)`).
- [ ] **Step 3.4:** Implement aurora ribbon (single static SVG path or gradient div). Per Open Question, include by default with low opacity; document as removable.
- [ ] **Step 3.5:** Implement mountain ridge silhouette (SVG path matching homepage's `peakHeights` array, inversed at bottom).
- [ ] **Step 3.6:** Implement cloud drift (2–3 ellipses, RAF updates `transform: translate3d(...)` with `performance.now()`-based offset).
- [ ] **Step 3.7:** Reduced-motion detection — if true: stars render at average opacity, aurora static, no cloud drift, no twinkle.
- [ ] **Step 3.8:** `node --check js/sky.js` — pass. Exports `[ 'mountSky' ]`.
- [ ] **Step 3.9:** Commit: `feat: sky.js — dusk-stars environment with twinkle and cloud drift`

---

## Task 4: work.html rewrite + work-page.js

**Files:**
- Modify: `work.html` (rewrite body)
- Create: `js/work-page.js` (entry point — mounts underground + project list + nav)
- Modify: `css/layout.css` (add `body.underground` scoped CSS block)

Underground page. Replaces existing filter-grid with a vertical-scrolling project list inside the underground environment.

`<body class="underground">`. Structure:

```
<body class="underground">
  <div id="transition-overlay"></div>
  <div id="environment"></div>          <!-- mountUnderground here -->
  <nav id="top-nav"></nav>
  <main id="archive">
    <header class="archive-intro">       <!-- eyebrow + framing line -->
      <span class="eyebrow">THE ARCHIVE</span>
      <h1>Five quests so far. More to dig up.</h1>
    </header>
    <ol class="project-list">
      <!-- one <li class="project-entry"> per project, rendered by work-page.js -->
    </ol>
  </main>
  <script type="module" src="js/work-page.js"></script>
</body>
```

CSS for `body.underground` (scoped block in layout.css):
- `body.underground { background: var(--bg); color: var(--ink); min-height: 100vh; overflow-y: auto }`
- `body.underground #environment { position: fixed; inset: 0; z-index: 0; pointer-events: none }`
- `body.underground #archive { position: relative; z-index: 1; max-width: 1100px; margin: 0 auto; padding: 18vh 80px 25vh }`
- `.archive-intro { margin-bottom: 12vh }`
- `.archive-intro h1 { font: 500 clamp(38px, 4vw, 70px)/0.95 var(--font-display); letter-spacing: -0.04em; color: var(--ink); text-shadow: 0 4px 40px rgba(0,0,0,0.6); margin-top: 24px }`
- `.project-list { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 16vh }`
- `.project-entry { display: grid; grid-template-columns: 1fr 1fr; gap: 60px; align-items: center; position: relative }`
- `.project-entry.entry-right { direction: rtl }` and `.project-entry.entry-right > * { direction: ltr }` (or use grid-column overrides like in `mountProjectPanel`)
- Strata divider between entries: `.project-entry::after { content: ''; position: absolute; bottom: -8vh; left: 0; right: 0; height: 1px; background: var(--line-mid) }` (last child suppresses)
- Image styling matches homepage's `ProjectImage` (vignette overlay div, filter, box-shadow).

`work-page.js`:
- Import `mountUnderground` from `./underground.js`
- Import `mountTopNav` from `./panels.js`
- Import `playEntryAnimation` from `./transition.js`
- Reuse the existing `loadProjects()` from `js/main.js` if exposed; otherwise fetch `projects/manifest.json` directly.
- On `DOMContentLoaded`:
  1. Mount underground env into `#environment`.
  2. Mount top nav into `#top-nav` with `Work` active. Wire `Home` and `Contact` link clicks via `transition.js` (return-up + transit-up respectively).
  3. Fetch manifest, render `<li class="project-entry">` per project alternating `entry-left` / `entry-right`. Each entry: image (with vignette + filter), eyebrow `CASE STUDY 0X / 0N`, h2 title, sub-line `<client> · <type from tags> · <year from date>`, summary, `View case study →` link to `projects/<slug>/`.
  4. Call `playEntryAnimation({ direction: incoming-direction, duration: 400 })` reading `sessionStorage` to detect arrival direction (or default to fade-only if no transition state).

- [ ] **Step 4.1:** Modify `work.html` body to the structure above. Strip GSAP CDN and old contents. Update font links (already done — verify).
- [ ] **Step 4.2:** Add `body.underground` CSS block to `css/layout.css` per the rules above.
- [ ] **Step 4.3:** Create `js/work-page.js` with the entry-point logic above.
- [ ] **Step 4.4:** Verify projects manifest path. Reuse `loadProjects()` from `main.js` (it's already exported globally for `work.html`'s old inline script). Update its return shape if needed.
- [ ] **Step 4.5:** `node --check js/work-page.js` — pass.
- [ ] **Step 4.6:** Open `work.html` via local server. Confirm: underground env renders, project list appears, scroll causes vertical parallax, no console errors.
- [ ] **Step 4.7:** Commit: `feat: work.html rewrite — underground archive with vertical-parallax backdrop`

---

## Task 5: contact.html rewrite + contact-page.js

**Files:**
- Modify: `contact.html` (rewrite body)
- Create: `js/contact-page.js`
- Modify: `css/layout.css` (add `body.sky` scoped CSS block)

Sky page. Single static panel. Form, bio, contact info all in one elevated view.

`<body class="sky">`. Structure:

```
<body class="sky">
  <div id="transition-overlay"></div>
  <div id="environment"></div>          <!-- mountSky here -->
  <nav id="top-nav"></nav>
  <main id="elevated">
    <div class="elevated-content">
      <span class="eyebrow">KIA ORA</span>
      <h1>I'm <em>Joel.</em> <span class="muted">Say hi.</span></h1>
      <p class="bio">…</p>
      <div class="contact-lines">
        <a href="mailto:joel@tempero.nz">joel@tempero.nz</a>
        <a href="tel:+642040239009">+64 204 023 9009</a>
      </div>
      <form …>…</form>
      <div class="legal">…</div>
    </div>
  </main>
  <script type="module" src="js/contact-page.js"></script>
</body>
```

CSS for `body.sky`:
- `body.sky { background: var(--bg); color: var(--ink); height: 100vh; overflow: hidden }` (single panel, no scroll)
- `body.sky #environment { position: fixed; inset: 0; z-index: 0; pointer-events: none }`
- `body.sky #elevated { position: relative; z-index: 1; height: 100vh; display: flex; align-items: center; justify-content: flex-end; padding: 0 80px }`
- `.elevated-content { max-width: 820px; text-align: right }`
- H1 sizing matches homepage contact panel: `clamp(38px, 4vw, 70px)`. Italic + colour treatment on "Joel.", muted on "Say hi." (reuse pattern from `mountContact` in panels.js — copy exact spans/styles).
- Form styles: refine existing `.contact-form` to fit right-aligned column, square corners on inputs, violet focus ring (already in components.css from T10 of homepage rebuild).

`contact-page.js`:
- Import `mountSky` from `./sky.js`
- Import `mountTopNav` from `./panels.js`
- Import `playEntryAnimation` from `./transition.js`
- On `DOMContentLoaded`:
  1. Mount sky env into `#environment`.
  2. Mount top nav with `Contact` active. Wire `Home` (return-down) + `Work` (transit-down).
  3. Wire form submit via Web3Forms (reuse existing handler from current `contact.html`).
  4. Call `playEntryAnimation({ direction: 'up', duration: 400 })`.

- [ ] **Step 5.1:** Modify `contact.html` body. Strip GSAP CDN, old `<style>` blocks, old structure.
- [ ] **Step 5.2:** Add `body.sky` CSS block to `css/layout.css`.
- [ ] **Step 5.3:** Create `js/contact-page.js`.
- [ ] **Step 5.4:** Port form submit handler from old `contact.html` into `contact-page.js`. Same Web3Forms endpoint, same access key, same UX (Sending… → success/error).
- [ ] **Step 5.5:** `node --check js/contact-page.js` — pass.
- [ ] **Step 5.6:** Open `contact.html` via local server. Sky env renders, form usable, no console errors. Submit to a test value and confirm Web3Forms response (or just verify network call fires).
- [ ] **Step 5.7:** Commit: `feat: contact.html rewrite — elevated sky panel with form + bio`

---

## Task 6: Wire homepage top nav to use transitions

**Files:**
- Modify: `js/panels.js` (`mountTopNav` accepts an optional `onNavigate` handler)
- Modify: `js/homepage.js` (passes a transition-aware handler)

Currently `mountTopNav` builds nav links with `href` attributes and inline `jumpTo` handlers. To support cross-page transitions on the homepage, we let the caller intercept the click and trigger a transition before (or instead of) the default navigation.

Approach: extend `mountTopNav`'s `opts` to accept an optional `onNavigate(targetIdx, panelId)` callback. If provided, this is called inside the click handler IN ADDITION TO `e.preventDefault()`. The caller decides whether to call `jumpTo` (homepage anchor) or `transitionTo` (cross-page). If not provided, falls back to current `jumpTo`-only behaviour.

In `homepage.js` desktop branch, after `initScrollEngine`:
```js
import { transitionTo } from './transition.js';

mountTopNav(document.getElementById('top-nav'), {
  jumpTo,
  activeIdxRef,
  onNavigate: (panelId) => {
    if (panelId === 'panel-hero') return jumpTo(0);
    if (panelId === 'panel-q1') return transitionTo({
      destination: 'work.html', direction: 'down', duration: 800
    });
    if (panelId === 'panel-contact') return transitionTo({
      destination: 'contact.html', direction: 'up', duration: 800
    });
  },
});
```

Update the `NAV_ITEMS` array's link `href` values: the Work/Contact entries should be `href="work.html"` / `href="contact.html"` (real page links — graceful fallback if JS disabled). Home stays `href="#panel-hero"`.

- [ ] **Step 6.1:** In `js/panels.js` `mountTopNav`, add `onNavigate` to the destructured `opts`. Inside the click handler, after `e.preventDefault()`, call `onNavigate(panelId)` if provided; otherwise fall back to `jumpTo(jumpIdx)`.
- [ ] **Step 6.2:** Update `NAV_ITEMS` link `href`s: Work → `'work.html'`, Contact → `'contact.html'`. Home stays as anchor.
- [ ] **Step 6.3:** In `js/homepage.js` desktop branch, import `transitionTo` from `./transition.js`. Pass `onNavigate` as shown above to `mountTopNav`.
- [ ] **Step 6.4:** In the mobile branch of `homepage.js`, no transition — keep the existing `scrollIntoView` fallback for in-page anchors AND let the real `<a href>` carry the user to `work.html` / `contact.html` natively (do NOT preventDefault for cross-page links on mobile).
- [ ] **Step 6.5:** Verify homepage in browser: clicking Work triggers pan-down + arrives at work.html. Clicking Contact triggers pan-up + arrives at contact.html.
- [ ] **Step 6.6:** Commit: `feat: top nav wires to transition.js for cross-page Z-axis pans`

---

## Task 7: Mobile fallbacks for work + contact pages

**Files:**
- Modify: `css/layout.css` (mobile media queries inside `body.underground` and `body.sky` blocks)
- Modify: `js/work-page.js`, `js/contact-page.js` (gate transition-related logic on viewport)

Mobile behaviour per spec:
- No camera pan (top nav uses real `<a href>` natively).
- Themed parallax backdrops still render; underground keeps vertical parallax (already works on any viewport because it reads `window.scrollY`); sky becomes mostly static.
- Project list on underground: single column, image stacks above text.
- Contact page: form full-width, content top-aligned (no `flex-end` right alignment), reasonable mobile padding.

- [ ] **Step 7.1:** Add `@media (max-width: 900px)` block inside `body.underground` section of `css/layout.css`:
  - `body.underground #archive { padding: 14vh 24px 18vh }`
  - `.project-entry { grid-template-columns: 1fr !important; gap: 32px !important }`
  - `.project-entry.entry-right { direction: ltr }` (reset)
  - `.project-entry > * { grid-column: 1 !important }`
- [ ] **Step 7.2:** Add `@media (max-width: 900px)` block inside `body.sky` section:
  - `body.sky { height: auto; overflow: auto }`
  - `body.sky #elevated { height: auto; min-height: 100vh; padding: 14vh 24px; justify-content: flex-start }`
  - `.elevated-content { max-width: 100%; text-align: left }`
  - Form inputs full-width.
- [ ] **Step 7.3:** In `work-page.js` and `contact-page.js`, detect mobile via `window.matchMedia('(max-width: 900px)').matches`. On mobile, skip `playEntryAnimation` (the overlay's inline-style opacity:1 is still set on destination pages, but we need to reset it). Add a CSS rule: on mobile, `#transition-overlay { opacity: 0 !important }` so it's never visible.
- [ ] **Step 7.4:** In `homepage.js` mobile branch, ensure the top nav links use real `<a href>` to navigate (let the browser handle it — no `preventDefault`, no `transitionTo` call).
- [ ] **Step 7.5:** Verify by resizing browser to ≤900px. Underground: vertical-stacked project list, parallax still runs. Sky: form usable, full-width. Top nav navigates cross-page natively.
- [ ] **Step 7.6:** Commit: `feat: mobile fallback for underground + sky — single-column, native nav, no pan`

---

## Task 8: Reduced motion support

**Files:**
- Modify: `js/transition.js`, `js/underground.js`, `js/sky.js` (gate animation paths)

Per spec:
- Click nav → instant `window.location.href`. No pan.
- Destination pages: no entry animation. Overlay never appears.
- Themed environments render statically. No twinkle, no drift, no parallax.

- [ ] **Step 8.1:** In `transition.js`, at the top of `transitionTo({...})`, if `window.matchMedia('(prefers-reduced-motion: reduce)').matches`, immediately call `window.location.href = destination` and return. Skip the animation entirely.
- [ ] **Step 8.2:** In `transition.js` `playEntryAnimation`, under reduced motion: instantly set `#transition-overlay { opacity: 0 }` and return.
- [ ] **Step 8.3:** Confirm reduced-motion gating in `underground.js` and `sky.js` (already added in Tasks 2 + 3 — verify).
- [ ] **Step 8.4:** Add to the `@media (prefers-reduced-motion: reduce)` global rule in `css/layout.css` (already exists from T10 of homepage rebuild) — confirm it covers transition overlay too. If not, add: `#transition-overlay { transition-duration: 0s !important }`.
- [ ] **Step 8.5:** Test by enabling OS-level reduced motion. Click Work — should navigate instantly to work.html with no pan. Sky / underground render statically.
- [ ] **Step 8.6:** Commit: `feat: respect prefers-reduced-motion across transitions and themed environments`

---

## Task 9: QA pass + ship-readiness

**Files:** none modified — verification only.

- [ ] **Step 9.1:** Local server running. Open `index.html`. Click Work — observe: ~800ms pan down, overlay fade, arrive at work.html with underground environment visible at rest, project list scrolls vertically with parallax.
- [ ] **Step 9.2:** From work.html, click Contact — observe: ~1600ms transit pan, arrive at contact.html with sky environment.
- [ ] **Step 9.3:** From contact.html, click Home — observe: ~800ms pan down, arrive at homepage hero panel.
- [ ] **Step 9.4:** From homepage, click Contact — observe: ~800ms pan up, arrive at sky.
- [ ] **Step 9.5:** Browser back button from any sub-page — should arrive at homepage; ideally without a broken animation state (overlay should be opacity:0 on homepage normally, no entry animation needed).
- [ ] **Step 9.6:** Resize to ≤900px. Click nav — instant native navigation, themed pages render correctly mobile-stacked.
- [ ] **Step 9.7:** Enable OS reduced-motion. Click nav — instant navigation, static environments.
- [ ] **Step 9.8:** Check console for errors across all paths.
- [ ] **Step 9.9:** Lighthouse perf audit on each page, compare to homepage baseline. Flag any regression > 5 points.
- [ ] **Step 9.10:** Update `CLAUDE.md` Session Log + Next Steps to reflect the rebuild.
- [ ] **Step 9.11:** Final commit: `chore: update CLAUDE.md after Z-axis navigation ship`

---

## Self-Review Notes

- **Spec coverage:** every spec section has a task — transition (T1), underground (T2), sky (T3), work page (T4), contact page (T5), top-nav wiring (T6), mobile (T7), reduced-motion (T8), QA (T9).
- **Reuses established patterns:** every new module follows the `world.js` / `robot.js` shape (RAF + transform writes + `destroy()`). No reinvented architecture.
- **Real URLs preserved:** `work.html` and `contact.html` remain bookmarkable / shareable / SEO-indexable. The transition is JS sugar on top of real navigation.
- **Graceful degradation:** JS-disabled visitors see the destination page directly via `<a href>` — no broken state.
- **Open Questions from spec** (depth indicator, aurora, star twinkle, cloud drift, pan curve) are handled inline during implementation per their notes, not as separate tasks.
- **Out of scope** items from the spec (blog, real photography, real logos, search, Technicolour re-add, world.js refactor) explicitly NOT in any task.
