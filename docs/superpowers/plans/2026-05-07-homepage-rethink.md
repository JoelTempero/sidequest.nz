# Homepage Rethink Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild the sidequest.nz homepage to match the locked-in handoff design (cinematic horizontal-scroll, parallax world, companion robot, violet aesthetic) using vanilla ES modules. Update global tokens so the rest of the site adopts the new palette/typography automatically.

**Architecture:** Vanilla JS, no build step. Single RAF loop drives horizontal pan from vertical wheel/touch/keyboard input. Parallax world layers, panels, and robot read the scroll position via shared state. New CSS custom properties on `:root` propagate to every page.

**Tech Stack:** HTML5, CSS3 (custom properties), vanilla JS (ES modules), Google Fonts (Space Grotesk, IBM Plex Mono). No frameworks, no build step, no GSAP.

**Spec:** `docs/superpowers/specs/2026-05-07-homepage-rethink-design.md`
**Source of truth for visual/behavioural detail:** `ref/design_handoff_homepage/README.md` + the JSX files alongside it. Each task below names the JSX file that defines its target behaviour — port from there.

---

## Task 1: Wipe dead homepage code + update global tokens

**Files:**
- Delete: `js/scroll.js`, `js/animations.js`, `js/canvas.js`, `js/interactions.js`, `css/animations.css`
- Modify: `css/style.css` (replace token variables, font imports, body styles)
- Modify: `css/components.css` (orange→violet, drop rounded corners on buttons)
- Modify: `css/layout.css` (delete homepage-specific section; keep work/contact/project sections)
- Modify: `index.html` (strip GSAP CDN tags + old script tags; leave `<head>` font links to update)
- Modify: `js/main.js` (delete homepage init code; keep nav toggle + work-page project loader)

- [ ] **Step 1.1:** Delete the five files listed above.
- [ ] **Step 1.2:** In `css/style.css`, swap the color tokens, font-family rules, and Google Fonts `@import` to use Space Grotesk + IBM Plex Mono. Variable names per spec (`--bg`, `--ink`, `--violet`, etc. — full list in spec §"Design Tokens").
- [ ] **Step 1.3:** In `css/components.css`, replace any orange (`#f97316`) reference with violet tokens; remove `border-radius` on buttons (square corners per handoff).
- [ ] **Step 1.4:** In `css/layout.css`, delete the homepage-specific block (horizontal scroll layout, panels). Keep the work/contact/project page sections.
- [ ] **Step 1.5:** In `index.html`, remove `<script src="https://cdn.jsdelivr.net/npm/gsap...">` lines and old module script tags. Update `<link>` for fonts to Space Grotesk + IBM Plex Mono. Leave the body empty for now (Task 8 rebuilds it).
- [ ] **Step 1.6:** In `js/main.js`, delete homepage-specific init. Keep the work-page manifest loader and any nav-toggle code that's used by `work.html` / `contact.html`.
- [ ] **Step 1.7:** Open `work.html` and `contact.html` in a browser. Verify they render with the new violet tokens and Space Grotesk/IBM Plex Mono fonts. Note any orange leftovers or bad cascade — fix inline if minor; flag for Task 11 if structural.
- [ ] **Step 1.8:** Commit: `chore: wipe creative-overhaul homepage code, swap global tokens to violet/Space Grotesk`

---

## Task 2: Build scroll-engine.js

**Files:**
- Create: `js/scroll-engine.js`
- Reference: `ref/design_handoff_homepage/scroll-engine.jsx`

Port `useHorizontalScroll` to a vanilla module that exports:
- `initScrollEngine({ trackEl })` — wires wheel, touch, keyboard, resize listeners and starts a single RAF loop. Returns `{ scrollRef, progressRef, activeIdxRef, jumpTo(idx) }` (refs are `{ current: number }` objects so other modules can read live values without React).
- `COLORS` — the exact palette object from the JSX, exported for any JS that needs colour values (robot, world).
- `subscribe(callback)` — callback(state) invoked once per frame with the latest scroll/progress/activeIdx (used by panels for the bottom counter).

- [ ] **Step 2.1:** Create the file. Define `COLORS` constant (copy verbatim from `scroll-engine.jsx`).
- [ ] **Step 2.2:** Implement `initScrollEngine`: query the track element, set up wheel listener (passive: false, `preventDefault`, prefer `deltaY`, fall back `deltaX`), touch listener (drag delta × 2), keyboard listener (arrows / PgUp / PgDn / Home / End jump 0.7vw or to ends), resize listener (re-measure `scrollWidth - innerWidth`).
- [ ] **Step 2.3:** Implement the RAF tick: lerp `scroll.current` toward `scroll.target` at factor 0.08; snap when `Math.abs(diff) < 0.5`; write `transform: translate3d(-x, 0, 0)` on the track; update `progress.current` and `activeIdx.current`; fire subscribers.
- [ ] **Step 2.4:** Implement `jumpTo(idx)` — sets `scroll.target = idx * window.innerWidth`.
- [ ] **Step 2.5:** Verification: in a scratch HTML page, mount a track with 3 coloured `100vw` divs and confirm wheel/keyboard scroll horizontally and snap correctly.
- [ ] **Step 2.6:** Commit: `feat: scroll-engine module — horizontal pan from vertical wheel/touch/keyboard`

---

## Task 3: Build world.js (parallax landscape)

**Files:**
- Create: `js/world.js`
- Reference: `ref/design_handoff_homepage/world.jsx`

Port `<World>` to a function `mountWorld(rootEl, { scrollRef, totalWidth, mode })` that builds the eight layers as DOM nodes (SVG for mountains/clouds/trees/birds/sun, divs for sky/stars/ground) and runs each layer's RAF tick. `mode: 'horizontal'` (default) applies `translate3d(-scroll * factor, 0, 0)`. `mode: 'vertical'` (used by mobile fallback in Task 9) applies `translate3d(0, -window.scrollY * factor, 0)` instead.

- [ ] **Step 3.1:** Create file scaffold + `mountWorld` signature.
- [ ] **Step 3.2:** Build the sky layer (linear-gradient div, factor 0.02).
- [ ] **Step 3.3:** Build the sun layer (radial-gradient disc, factor 0.06, repeat every 1800px).
- [ ] **Step 3.4:** Build the stars layer (80 deterministic divs in top 40%, no parallax).
- [ ] **Step 3.5:** Build far mountains (SVG path, peak heights array per handoff, factor 0.18).
- [ ] **Step 3.6:** Build clouds (three-ellipse SVG puffs, factor 0.30).
- [ ] **Step 3.7:** Build mid hills (SVG path, factor 0.45).
- [ ] **Step 3.8:** Build trees (SVG silhouettes, factor 0.65, 280px stride).
- [ ] **Step 3.9:** Build ground band + grass tufts (factor 0.85).
- [ ] **Step 3.10:** Build birds (M-shape SVG paths, factor 0.25 + independent `performance.now()` drift).
- [ ] **Step 3.11:** Each layer: own RAF tick reading `scrollRef.current` and writing `transform`. Apply `will-change: transform`.
- [ ] **Step 3.12:** Verification: mount in a scratch HTML page with a fake `scrollRef`; pan via console; confirm each layer parallaxes at the right speed and the landscape composes correctly.
- [ ] **Step 3.13:** Commit: `feat: world.js — parallax landscape (sky, sun, stars, mountains, clouds, hills, trees, ground, birds)`

---

## Task 4: Build robot.js (companion)

**Files:**
- Create: `js/robot.js`
- Reference: `ref/design_handoff_homepage/robot.jsx`

Port `<CompanionRobot>` to `mountRobot(rootEl)` that creates the SVG body + jet plume and runs the autonomous wander state machine (target picking, spring physics, body tilt, eye tracking, blinks, jet plume scaling).

- [ ] **Step 4.1:** Create file. Build the SVG markup (72×72 viewBox: rounded body, antenna, face, eyes, smile, fins, status light, nozzle, jet plume — exact shapes/colours from `robot.jsx`). Mark wrapper `aria-hidden="true"`.
- [ ] **Step 4.2:** Track mouse position via `mousemove` listener (no throttle, just store last x/y).
- [ ] **Step 4.3:** Implement the state machine per handoff §"The Companion Robot · Behaviour": pick target (35% near cursor / 65% random upper 70%), wobble target, spring (k=0.0035, d=0.965), clamp speed (3.2 px/frame), tilt body, eye tracking, blink timer, jet plume scaling.
- [ ] **Step 4.4:** Apply transforms on every RAF tick. `position: fixed`, `zIndex: 0`, `pointerEvents: none`.
- [ ] **Step 4.5:** Verification: load in a scratch page; move cursor around; confirm robot wanders, eyes track, body tilts on velocity, jet plume scales with speed, blink fires every 3.5–8s.
- [ ] **Step 4.6:** Commit: `feat: robot.js — autonomous companion with cursor-tracking eyes`

---

## Task 5: Build panels.js skeleton + Hero + fixed chrome

**Files:**
- Create: `js/panels.js`
- Reference: `ref/design_handoff_homepage/panels.jsx`

Port the shared atoms (`Eyebrow`, `Tick`, `BigLink`, `headlineStyle`) plus the Hero panel and the fixed chrome (top nav, bottom strip with progress + counter).

- [ ] **Step 5.1:** Create file. Implement `eyebrow(text, opts)` and `tick()` helpers returning DOM nodes (matching the JSX inline-style approach).
- [ ] **Step 5.2:** Implement `mountHero(panelEl)` — eyebrow `SIDEQUEST · CHRISTCHURCH`, H1 `Be Known.\nStand Out.` with the italic + colour treatment per handoff, footer micro-line `SCROLL → FOUR RECENT WORKS` with inline arrow SVG.
- [ ] **Step 5.3:** Implement `mountTopNav(rootEl, { jumpTo, activeIdxRef })` — logo SVG + wordmark on the left, three Plex Mono links on the right (Home / Work / Contact). Active state from `activeIdxRef`. `position: fixed`, `zIndex: 50`.
- [ ] **Step 5.4:** Implement `mountBottomStrip(rootEl, { progressRef, activeIdxRef })` — counter `01 / 08 HOME` on the left, progress bar centre, `SCROLL ↓ → ←` legend right. Subscribes to scroll engine for live updates.
- [ ] **Step 5.5:** Verification: in a scratch HTML page, mount hero + chrome; confirm visuals match the handoff (open `Sidequest Horizontal Homepage.html` side-by-side as reference).
- [ ] **Step 5.6:** Commit: `feat: panels.js — hero panel + fixed top nav + bottom progress strip`

---

## Task 6: Quest panels (01–04)

**Files:**
- Modify: `js/panels.js`
- Reference: `ref/design_handoff_homepage/panels.jsx` (`ProjectPanel`, `ProjectImage`)

Build a generic `mountProjectPanel(panelEl, { number, sector, headline, sub, imageSrc, ctaHref, align })`. Spec §"Project Lineup" has the locked content for each.

- [ ] **Step 6.1:** Implement `mountProjectPanel`. Two-column grid `1fr 1fr`, gap 60px, padding `0 80px`. Eyebrow row: `QUEST 0X / 04 · SECTOR`. H2 with the two-line headline. Sub-line in Plex Mono. `View case study →` CTA below sub-line (Plex Mono 11px, uppercase, colour `#c4b5fd`, hairline underline on hover, real `<a href>` to detail page).
- [ ] **Step 6.2:** Implement `ProjectImage` helper — `min(420px, 32vw)` wide, aspect 4/5, `marginBottom: 18vh`, violet vignette overlay, `saturate(0.85) contrast(1.05)` filter, photo box-shadow per handoff. Image `<img src>` is the prop.
- [ ] **Step 6.3:** `align: 'left'` puts text-left/image-right; `align: 'right'` reverses. Quests 01 and 03 are left, 02 and 04 are right.
- [ ] **Step 6.4:** Wire each Quest with content from the spec table:
  - 01 Chill Air → "Job sheets, off the kitchen counter." → `projects/chill-air/`
  - 02 Storybook → "Photos delivered, not chased." → `projects/storybook-weddings/`
  - 03 My Living Hope → "Off-the-shelf wouldn't do." → `projects/my-living-hope/`
  - 04 24CHCH → "One weekend, every short film." → `projects/24chch/`
- [ ] **Step 6.5:** Use the handoff's Unsplash placeholder URLs (per handoff §"Assets") until real photos arrive.
- [ ] **Step 6.6:** Verification: mount all four in scratch page; confirm headline tone, sub-line, layout alternation, and CTA hover state.
- [ ] **Step 6.7:** Commit: `feat: panels.js — four Quest panels with View case study CTAs`

---

## Task 7: See-more, Logos, Contact

**Files:**
- Modify: `js/panels.js`
- Reference: `ref/design_handoff_homepage/panels.jsx` (`SeeMorePanel`, `LogosPanel`, `ParallaxLogo`, `FakeLogo`, `ContactPanel`)

- [ ] **Step 7.1:** Implement `mountSeeMore(panelEl)`. Eyebrow `THERE'S MORE`. H2 *"More quests in the back catalogue."* (numbers dropped per spec). Single CTA `Full work index →` linking to `work.html` (filled `#7c3aed`, padding `18px 28px`, no border-radius, Space Grotesk 18px). Secondary `Field notes →` button **omitted**.
- [ ] **Step 7.2:** Implement `mountLogos(panelEl, { scrollRef, panelStartX })`. Eyebrow top-left `A FEW OF THE PEOPLE I'VE BUILT FOR`. Sub-text bottom-right `─ AND TWENTY-SIX OTHERS ACROSS AOTEAROA` (note: keep this line — it's flavour copy, not a literal claim).
- [ ] **Step 7.3:** Implement `parallaxLogo` and `fakeLogo` helpers. Use the exact 10 positions/depths/rotations/bobPhases from `panels.jsx`. Each logo gets its own RAF tick reading `scrollRef.current` for parallax pan + bob.
- [ ] **Step 7.4:** Implement `mountContact(panelEl)`. Right-aligned, max-width 820. Eyebrow `KIA ORA`. H2 `I'm Joel. Say hi.` with the italic + muted colour treatment. Two contact links stacked: `joel@tempero.nz` (Space Grotesk 28px, hairline underline) and `+64 204 023 9009` (22px, `#b8a8d4`).
- [ ] **Step 7.5:** Verification: mount in scratch page; confirm logos parallax at different speeds, see-more CTA contrast is right, contact links are clickable (`mailto:` and `tel:`).
- [ ] **Step 7.6:** Commit: `feat: panels.js — see-more, logos, contact panels`

---

## Task 8: Rebuild index.html + wire it all together

**Files:**
- Modify: `index.html`
- Modify: `css/layout.css` (add homepage layout block: track, panels, fixed chrome positioning, world container)

- [ ] **Step 8.1:** In `css/layout.css`, add the homepage-specific block: `body { overflow: hidden; height: 100% }`, `::-webkit-scrollbar { display: none }`, `.track { display: flex; height: 100vh; will-change: transform }`, `.panel { width: 100vw; height: 100vh; flex-shrink: 0; padding: 0 80px; position: relative; z-index: 1 }`, world container `position: fixed; inset: 0; z-index: 0; pointer-events: none`. Robot wrapper `position: fixed; inset: 0; z-index: 0; pointer-events: none`.
- [ ] **Step 8.2:** Rewrite `index.html` body. Structure:
  ```
  <body>
    <div id="world"></div>
    <div id="robot"></div>
    <nav id="top-nav"></nav>
    <main id="track">
      <section data-panel="hero"></section>
      <section data-panel="quest-01"></section>
      <section data-panel="quest-02"></section>
      <section data-panel="quest-03"></section>
      <section data-panel="quest-04"></section>
      <section data-panel="see-more"></section>
      <section data-panel="logos"></section>
      <section data-panel="contact"></section>
    </main>
    <footer id="bottom-strip"></footer>
    <script type="module" src="js/homepage.js"></script>
  </body>
  ```
- [ ] **Step 8.3:** Create `js/homepage.js` as the entry point. Import from scroll-engine, world, robot, panels. On `DOMContentLoaded`: init scroll engine on `#track`; mount world on `#world`; mount robot on `#robot`; mount each panel by querying `[data-panel]` and dispatching to the right `mount*` function; mount top nav and bottom strip last.
- [ ] **Step 8.4:** Open `index.html` in a real browser (not just file://; use VS Code Live Server). Confirm the page loads, all 8 panels render, scroll works, world parallaxes, robot wanders, nav clicks jump to panels.
- [ ] **Step 8.5:** Take a screenshot and compare to `ref/design_handoff_homepage/Sidequest Horizontal Homepage.html` open in the same browser. Note any visual deviations and fix.
- [ ] **Step 8.6:** Commit: `feat: rewrite index.html as 8-panel horizontal homepage with parallax world + companion robot`

---

## Task 9: Mobile fallback (≤900px)

**Files:**
- Modify: `css/layout.css`
- Modify: `js/homepage.js`

Per handoff §"Recommended Implementation Approach #8" + spec §"Mobile Fallback".

- [ ] **Step 9.1:** Add `@media (max-width: 900px)` block: `body { overflow-y: auto; overflow-x: hidden; height: auto }`, `.track { flex-direction: column; height: auto }`, `.panel { height: 100vh; width: 100vw; padding: 0 32px }`, project panels become single-column (text + image stacked, image first or text first based on `align`), bottom strip hidden.
- [ ] **Step 9.2:** In `js/homepage.js`, gate scroll-engine init on `window.matchMedia('(min-width: 901px)').matches`. On mobile, skip the engine; native vertical scroll handles navigation. Robot mount also gated to desktop.
- [ ] **Step 9.3:** World still mounts on mobile but converts horizontal parallax to vertical: a separate code path in `world.js` or a flag passed in. Simplest: when mobile, each layer reads `window.scrollY * factor` instead of `-scrollRef.current * factor`. Implement as a `mode: 'horizontal' | 'vertical'` option on `mountWorld`.
- [ ] **Step 9.4:** Verification: open in a desktop browser at `<= 900px` width; confirm panels stack vertically, native scroll works, robot is hidden, world parallaxes vertically, layout is readable.
- [ ] **Step 9.5:** Commit: `feat: mobile fallback — vertical stacked panels, native scroll, robot hidden, vertical world parallax`

---

## Task 10: Reduced motion + accessibility polish

**Files:**
- Modify: `css/layout.css` (or a new section)
- Modify: `js/world.js`, `js/robot.js`, `js/scroll-engine.js`
- Modify: `js/panels.js`

- [ ] **Step 10.1:** In each module that runs an RAF loop, check `window.matchMedia('(prefers-reduced-motion: reduce)').matches` at init. If true: world layers render once (no tick); robot renders once (no wander, no plume animation, no blink, no pulsing status); scroll engine still works (user is intentionally driving it) but skip the lerp — set `scroll.current = scroll.target` instantly.
- [ ] **Step 10.2:** In CSS, add `@media (prefers-reduced-motion: reduce)` rules to disable any CSS-driven animation/transition that survives.
- [ ] **Step 10.3:** Add `<section aria-labelledby>` references to each panel's H1/H2. Make sure each headline has an `id`.
- [ ] **Step 10.4:** Add focus-visible styles in `css/components.css`: `:focus-visible { outline: 2px solid var(--violet); outline-offset: 2px }` on nav links, CTAs, contact links.
- [ ] **Step 10.5:** Verification: enable "Reduce motion" in OS settings; reload — confirm static rendering. Tab through nav, CTAs — confirm visible focus rings.
- [ ] **Step 10.6:** Commit: `feat: respect prefers-reduced-motion + add focus-visible styles`

---

## Task 11: Verify token swap on other pages

**Files:**
- Modify (only as needed): `work.html`, `contact.html`, `pages/terms.html`, `pages/privacy.html`, `projects/*/index.html`

- [ ] **Step 11.1:** Open each non-homepage page in browser. Check for: orange leftovers, wrong fonts, broken layouts, mismatched accent colours.
- [ ] **Step 11.2:** Fix anything broken at the token level (prefer changing CSS over per-page overrides).
- [ ] **Step 11.3:** Verification: every page renders with the violet palette + Space Grotesk/Plex Mono without per-page hacks.
- [ ] **Step 11.4:** Commit: `chore: clean up cross-page token leftovers from creative-overhaul era`

---

## Task 12: QA pass + ship-readiness

**Files:** none modified — verification only

- [ ] **Step 12.1:** Run through the full homepage in Chrome at desktop width. Verify all 8 panels render, parallax works, robot wanders, scroll feels smooth, nav links jump correctly, all four `View case study →` CTAs route to the right detail page.
- [ ] **Step 12.2:** Same flow in Firefox + Safari (or a Safari-equivalent if on Windows — at minimum check the WebKit-prefix `-webkit-scrollbar` rule lands).
- [ ] **Step 12.3:** Mobile width (DevTools → 375px). Verify vertical stack, no horizontal scroll, no robot, world still visible.
- [ ] **Step 12.4:** Reduced motion (OS toggle). Verify static.
- [ ] **Step 12.5:** Lighthouse perf audit on the homepage. Compare to current homepage Lighthouse if available; flag any regression > 5 points.
- [ ] **Step 12.6:** Update `CLAUDE.md` Session Log + Next Steps to reflect the rebuild.
- [ ] **Step 12.7:** Final commit: `chore: update CLAUDE.md after homepage rethink ship`

---

## Self-Review Notes

- Spec coverage: every spec section maps to a task — wipe (T1), scroll (T2), world (T3), robot (T4), panels (T5–T7), wiring (T8), mobile (T9), a11y (T10), token swap (T11), QA (T12).
- The spec's Quest content (headlines, sub-lines, detail-page paths) is referenced inline in T6.
- The spec's Panel 05 copy change and Field-notes button hide are explicit in T7.1.
- The handoff JSX files are named per-task as the porting source, so the engineer always knows where the visual/behavioural truth lives without inlining hundreds of lines of code into the plan.
