# Z-Axis Single-Page Refactor Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Collapse `index.html`, `work.html`, `contact.html` into a single document with three vertically-stacked zones (sky, homepage, underground). Browser scroll position becomes the camera; hash routes (`/#work`, `/#contact`) drive shareable URLs. Replace cross-page transition orchestrator with JS-driven scroll animation. Tune Quest panels with real project imagery and a paired-spread layout that eliminates the void between text and image columns.

**Architecture:** One `<main id="page">` is the scrollable container (`overflow-y: scroll`, scrollbar hidden). Three `.zone` sections inside it. A wheel handler intercepts scroll in the homepage zone (clamps `scrollTop` and routes deltas to the existing horizontal pan engine); other zones use native scroll. Nav clicks animate `pageEl.scrollTop` over ~800ms. Each zone's themed environment becomes `position: absolute; inset: 0` within its zone (was `fixed`).

**Tech Stack:** HTML5, CSS3 (custom properties, hash routing, native scroll), vanilla JS (ES modules). No build step. Reuses existing modules — `scroll-engine.js`, `world.js`, `robot.js`, `panels.js`, `sky.js`, `underground.js` — with targeted refactors.

**Spec:** `docs/superpowers/specs/2026-05-08-zaxis-single-page-refactor-design.md` — read this for visual/behavioural source-of-truth.

---

## Task 1: Single-page architecture refactor

The big rewiring. After this task the site renders as one document with three zones, hash routing works, navigation animates between zones. Quest panels still use Unsplash placeholders and old layout (Task 2 fixes those). Visual edge mismatch remains (Task 3 fixes that).

**Files:**
- Modify: `index.html` (body restructure to three zones + new entry script)
- Modify: `css/layout.css` (drop `body.underground` + `body.sky` blocks; add `#page`, `.zone`, three zone-id rules; restructure mobile media queries)
- Modify: `css/style.css` (`html, body { overflow: hidden; height: 100% }`)
- Modify: `js/homepage.js` (becomes the orchestrator for all three zones — mounts every zone, wires hash routing, owns the wheel handler, exposes `scrollToZone`)
- Modify: `js/scroll-engine.js` (drop the `window` wheel listener; expose a new `feedHorizontalDelta(dy)` method that the orchestrator calls when in homepage zone)
- Modify: `js/world.js`, `js/robot.js`, `js/sky.js`, `js/underground.js` (root container `position: fixed` → `position: absolute`)
- Modify: `js/panels.js` (`mountTopNav`: drop `onNavigate` opt; add `onZoneClick(zoneId)` opt; update `NAV_ITEMS` hrefs to `#contact` / `#` / `#work`)
- Delete: `work.html`, `contact.html`, `js/work-page.js`, `js/contact-page.js`, `js/transition.js`

### Substeps

- [ ] **Step 1.1:** Delete the five legacy files (`work.html`, `contact.html`, `js/work-page.js`, `js/contact-page.js`, `js/transition.js`).

- [ ] **Step 1.2:** Restructure `index.html` body. Keep `<head>` intact (Google Fonts, CSS links). New body shape:

  ```html
  <body>
    <nav id="top-nav"></nav>
    <main id="page">
      <section id="zone-sky" class="zone" aria-label="Contact"></section>
      <section id="zone-homepage" class="zone">
        <div id="world"></div>
        <div id="robot"></div>
        <div id="track">
          <section class="panel" data-panel="hero" id="panel-hero" aria-labelledby="panel-hero-h"></section>
          <section class="panel" data-panel="quest-01" id="panel-q1" aria-labelledby="panel-q1-h"></section>
          <section class="panel" data-panel="quest-02" id="panel-q2" aria-labelledby="panel-q2-h"></section>
          <section class="panel" data-panel="quest-03" id="panel-q3" aria-labelledby="panel-q3-h"></section>
          <section class="panel" data-panel="quest-04" id="panel-q4" aria-labelledby="panel-q4-h"></section>
          <section class="panel" data-panel="see-more" id="panel-see" aria-labelledby="panel-see-h"></section>
          <section class="panel" data-panel="logos" id="panel-logos" aria-label="Trusted by"></section>
          <section class="panel" data-panel="contact-recap" id="panel-contact" aria-labelledby="panel-contact-h"></section>
        </div>
        <footer id="bottom-strip"></footer>
      </section>
      <section id="zone-underground" class="zone" aria-label="Work archive"></section>
    </main>
    <script type="module" src="js/homepage.js"></script>
  </body>
  ```

  Note: `body` no longer has `class="homepage"`. Top nav is OUTSIDE `#page` (it's fixed-position chrome that overlays all zones). `#bottom-strip` stays inside `#zone-homepage` so it hides naturally when scrolled to other zones.

- [ ] **Step 1.3:** In `css/style.css`, set `html, body { overflow: hidden; height: 100%; margin: 0 }`. Remove any remaining `body.homepage` background overrides if present.

- [ ] **Step 1.4:** Rewrite `css/layout.css`. Delete the entire `body.homepage`, `body.underground`, `body.sky` blocks (and their mobile media queries). Add new structure:

  ```css
  /* ── Single-page Z-axis layout ────────────────────── */

  #page {
    height: 100vh;
    overflow-y: scroll;
    scrollbar-width: none; /* Firefox */
  }
  #page::-webkit-scrollbar { display: none; }

  .zone {
    position: relative;
    width: 100%;
  }

  #zone-sky        { height: 100vh; }
  #zone-homepage   { height: 100vh; overflow: hidden; }
  #zone-underground { min-height: 100vh; padding-bottom: 8vh; }

  #zone-homepage #track {
    display: flex;
    height: 100vh;
    will-change: transform;
  }
  #zone-homepage .panel {
    width: 100vw;
    height: 100vh;
    flex-shrink: 0;
    position: relative;
    z-index: 1;
  }

  /* Mobile: native vertical scroll throughout, zones stack naturally */
  @media (max-width: 900px) {
    html, body { overflow-y: auto; height: auto; }
    #page { height: auto; overflow-y: visible; }
    #zone-homepage { height: auto; overflow: visible; }
    #zone-homepage #track {
      flex-direction: column;
      height: auto;
      transform: none !important;
    }
    #zone-homepage .panel { padding: 0 32px; }
    #zone-homepage #robot { display: none; }
    #zone-homepage #bottom-strip { display: none; }
  }
  ```

  Keep all the panel-specific CSS rules (eyebrow, h2, sub, image, etc.) further down in the file — they're scoped via class selectors and don't depend on the body class. Update any selectors that previously read `body.homepage .X` to just `.X` or `#zone-homepage .X` as appropriate.

  Underground and sky styles (project-list, archive-intro, elevated-content, contact form, etc.) stay — change selector prefixes from `body.underground` → `#zone-underground` and `body.sky` → `#zone-sky`.

- [ ] **Step 1.5:** Convert each environment module's root-container styles from `position: fixed` to `position: absolute`:

  - `js/world.js`: in `mountWorld`, the line that sets `rootEl.style.cssText = 'position: fixed; inset: 0; ...'` becomes `position: absolute; inset: 0; ...`. Don't change anything else.
  - `js/robot.js`: in `mountRobot`, the `rootEl.style.cssText` setting `position: fixed` → `position: absolute`.
  - `js/sky.js`: same change in `mountSky`.
  - `js/underground.js`: same change in `mountUnderground`.

- [ ] **Step 1.6:** Refactor `js/scroll-engine.js`. Currently `initScrollEngine` registers wheel + keyboard listeners on `window`. New ownership:
  - **Drop** the `window.addEventListener('wheel', ...)` registration. The orchestrator owns wheel input now (it has zone-routing concerns).
  - **Drop** the `window.addEventListener('keydown', ...)` registration. Same reason — keyboard nav across zones is the orchestrator's job.
  - **Export** `feedHorizontalDelta(dy)` — does what the wheel handler used to do internally (`scroll.target = clamp(scroll.target + dy, 0, maxScroll)`). Orchestrator calls this when in homepage zone.
  - **Keep** the existing exports: `jumpTo(idx)`, `subscribe`, `COLORS`, `initScrollEngine`. Orchestrator uses `jumpTo` for keyboard-arrow handling.
  - **Keep** the touch listeners on `window` — they only fire in practice in homepage zone (desktop), and on mobile the scroll engine isn't initialised anyway. No zone-routing needed.

- [ ] **Step 1.7:** Rewrite `js/homepage.js` as the full-site orchestrator. Pseudocode:

  ```js
  import { initScrollEngine, feedHorizontalDelta, jumpToPanelIdx } from './scroll-engine.js';
  import { mountWorld } from './world.js';
  import { mountRobot } from './robot.js';
  import { mountSky } from './sky.js';
  import { mountUnderground } from './underground.js';
  import { mountHero, mountTopNav, mountBottomStrip,
           mountQuest01, mountQuest02, mountQuest03, mountQuest04,
           mountSeeMore, mountLogos, mountContact } from './panels.js';

  const ZONE_HASH = { '': 'homepage', '#work': 'underground', '#contact': 'sky' };
  const HASH_FOR  = { homepage: '', underground: '#work', sky: '#contact' };

  document.addEventListener('DOMContentLoaded', () => {
    const isMobile = window.matchMedia('(max-width: 900px)').matches;
    const pageEl  = document.getElementById('page');

    // Compute zone Y positions
    const skyY        = 0;
    const homepageY   = window.innerHeight;
    const undergroundY = window.innerHeight * 2;

    // Mount homepage zone (track + panels + chrome)
    if (!isMobile) {
      const { jumpTo } = initScrollEngine({ trackEl: document.getElementById('track') });
      mountWorld(document.getElementById('world'), { /* ... */ });
      mountRobot(document.getElementById('robot'));
      mountTopNav(document.getElementById('top-nav'), {
        jumpTo,
        onZoneClick: (zoneId) => scrollToZone(zoneId, { animated: true }),
      });
      mountBottomStrip(document.getElementById('bottom-strip'), { /* ... */ });
      // ... mount all 8 panels into #track ...
    } else {
      // Mobile: native scroll, no scroll engine, stacked layout
      // ... mount all panels (vertical layout via CSS), top nav with scrollIntoView fallback ...
    }

    // Mount sky zone
    mountSky(document.getElementById('zone-sky'));
    mountSkyContent(document.getElementById('zone-sky'));  // bio + form (port from contact-page.js)

    // Mount underground zone
    mountUnderground(document.getElementById('zone-underground'));
    fetchProjectsAndRender(document.getElementById('zone-underground'));  // port from work-page.js

    // Wheel handler — only on desktop
    if (!isMobile) {
      pageEl.addEventListener('wheel', (e) => {
        const inHomepage = Math.abs(pageEl.scrollTop - homepageY) < 50;
        const inSky      = pageEl.scrollTop < homepageY - 50;

        if (inHomepage) {
          e.preventDefault();
          pageEl.scrollTop = homepageY; // clamp
          feedHorizontalDelta(e.deltaY);
        } else if (inSky) {
          e.preventDefault();
          pageEl.scrollTop = skyY; // clamp; sky is static
        }
        // Underground: native vertical scroll within underground content.
        // Top of underground gets clamped by CSS (#zone-underground top edge).
        // Wait — that's not actually true. Need explicit clamp.
        else {
          if (pageEl.scrollTop < undergroundY) {
            pageEl.scrollTop = undergroundY; // clamp at top of underground
            e.preventDefault();
          }
        }
      }, { passive: false });
    }

    // Hash routing
    function scrollToZone(zoneId, { animated }) {
      const targetY = { sky: skyY, homepage: homepageY, underground: undergroundY }[zoneId];
      if (animated && !isMobile && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        animateScroll(pageEl, pageEl.scrollTop, targetY, 800);
      } else {
        pageEl.scrollTop = targetY;
      }
      const newHash = HASH_FOR[zoneId];
      if (newHash !== window.location.hash) {
        history.pushState(null, '', '/' + (newHash || ''));
      }
    }

    // Initial scroll position from hash
    const initialZone = ZONE_HASH[window.location.hash] || 'homepage';
    scrollToZone(initialZone, { animated: false });

    // Browser back/forward
    window.addEventListener('hashchange', () => {
      const zone = ZONE_HASH[window.location.hash] || 'homepage';
      scrollToZone(zone, { animated: !isMobile });
    });
  });

  function animateScroll(el, from, to, duration) {
    const start = performance.now();
    function tick(now) {
      const t = Math.min(1, (now - start) / duration);
      const eased = t < 0.5 ? 2*t*t : 1 - Math.pow(-2*t+2, 2)/2;
      el.scrollTop = from + (to - from) * eased;
      if (t < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }
  ```

  Build out the actual functions:
  - `mountSkyContent(zoneEl)` — port the form/bio markup from old `contact-page.js`. Append into the sky zone (sibling to where mountSky's environment renders).
  - `fetchProjectsAndRender(zoneEl)` — port from old `work-page.js`. Fetch `projects/manifest.json`, render the project list as before. Append into the underground zone.
  - The exact code from those files lives in `js/work-page.js` and `js/contact-page.js` at the time of their deletion — copy into homepage.js as private functions before deleting the files.

- [ ] **Step 1.8:** Refactor `mountTopNav` in `js/panels.js`. Drop the `onNavigate` opt and the click-handler branch that handles cross-page links. New shape:

  ```js
  export function mountTopNav(rootEl, { jumpTo, onZoneClick }) {
    // ... same DOM construction ...
    // NAV_ITEMS becomes:
    const NAV_ITEMS = [
      { label: 'Home',    href: '#',         zoneId: 'homepage' },
      { label: 'Work',    href: '#work',     zoneId: 'underground' },
      { label: 'Contact', href: '#contact',  zoneId: 'sky' },
    ];

    // Click handler:
    linkEl.addEventListener('click', (e) => {
      e.preventDefault();
      onZoneClick(item.zoneId);
    });
  }
  ```

  The `jumpTo` opt is still accepted for backwards compatibility (panel jump within homepage on logo click — leave the logo click calling `jumpTo(0)` if that's what it currently does).

  Drop the active-state subscribe logic that was tracking horizontal panel index. The active zone state is now the orchestrator's concern — pass an `activeZoneRef: { current: 'homepage' }` instead and update it from `scrollToZone`. Or simpler: the orchestrator calls `setActiveZone(zoneId)` exposed by `mountTopNav`, which updates the link colors directly.

- [ ] **Step 1.9:** Run `node --check` on every modified JS file:
  ```
  node --check js/homepage.js js/scroll-engine.js js/world.js js/robot.js js/sky.js js/underground.js js/panels.js
  ```
  All must pass.

- [ ] **Step 1.10:** Open `http://localhost:8765/index.html`. Verify:
  - Page loads with homepage zone visible (hero panel + parallax world + robot).
  - Wheel scroll drives horizontal pan through 8 panels (same as before).
  - Click `Work` → animates ~800ms scroll down to underground zone (with rock-strata env). URL becomes `/#work`.
  - Click `Contact` → animates scroll up to sky zone. URL becomes `/#contact`.
  - Click `Home` → returns to homepage zone. URL becomes `/`.
  - Direct load of `/#work` → arrives instantly at underground.
  - Browser back/forward navigates between zones.
  - No console errors.

- [ ] **Step 1.11:** Commit:
  ```
  git add -A
  git commit -m "refactor: collapse three pages into single document with hash routing"
  ```

---

## Task 2: Quest panel real images + paired-spread layout

**Files:**
- Modify: `js/panels.js` (Quest panel functions read from manifest; layout class additions)
- Modify: `css/layout.css` (paired-spread CSS)

After this task, Quest panels show real project hero images and the image+text sit as a centered paired unit.

### Substeps

- [ ] **Step 2.1:** In `js/panels.js`, find the four `mountQuestNN` wrapper functions. Each currently passes a hardcoded Unsplash URL as `imageSrc`. Refactor them to fetch the manifest and look up the project by slug. Approach: at the top of `panels.js`, add a module-level cache and async loader:

  ```js
  let manifestCache = null;
  async function loadManifest() {
    if (manifestCache) return manifestCache;
    const res = await fetch('projects/manifest.json');
    manifestCache = await res.json();
    return manifestCache;
  }

  async function getProjectBySlug(slug) {
    const projects = await loadManifest();
    return projects.find(p => p.slug === slug);
  }
  ```

  Then each `mountQuestNN` becomes async:

  ```js
  export async function mountQuest01(panelEl) {
    const project = await getProjectBySlug('chill-air');
    return mountProjectPanel(panelEl, {
      number: 1,
      sector: 'TRADES',
      headline: 'Job sheets, off the kitchen counter.',
      sub: `${project.title} · website + client portal · 2026`,
      imageSrc: project.featuredImage,
      imageAlt: project.title,
      ctaHref: `projects/${project.slug}/`,
      align: 'left',
    });
  }
  ```

  Repeat for `mountQuest02` (slug `storybook-weddings`), `mountQuest03` (slug `my-living-hope`), `mountQuest04` (slug `24chch`).

  In `homepage.js`, the panel mounting calls now need to handle promises — either `await` them in the orchestrator or fire-and-forget (the panel renders empty until the manifest resolves, then fills in). For UX, fire-and-forget is fine — the manifest loads fast.

- [ ] **Step 2.2:** Update CSS for the paired-spread Quest layout. In `css/layout.css`, find the existing `.project-grid` rules (or wherever the panel grid rules live — they're inside the homepage panels block). Add/modify:

  ```css
  /* Quest panel paired-spread layout */
  #zone-homepage .project-grid {
    max-width: 1100px;
    margin: 0 auto;
    padding: 0 32px;
    grid-template-columns: 1fr 1fr;
    gap: 32px;
  }

  /* Pull text and image toward the inner edge (the gap), not the outer edges */
  #zone-homepage .project-grid .text-col {
    justify-self: end;
    text-align: left;
  }
  #zone-homepage .project-grid .image-col {
    justify-self: start;
  }

  #zone-homepage .project-grid.entry-right .text-col {
    justify-self: start;
    text-align: right;
  }
  #zone-homepage .project-grid.entry-right .image-col {
    justify-self: end;
  }

  /* Image gets a touch more presence */
  #zone-homepage .project-image {
    width: min(420px, 38vw);
  }
  ```

  Make sure the existing `mountProjectPanel` adds `class="project-grid"` to the grid container (it already does per T6 of the homepage rebuild). If `align: 'right'`, also add `entry-right` class.

- [ ] **Step 2.3:** Verify in browser:
  - Each Quest panel shows the correct project's hero image (Chill Air photo on Quest 01, etc., not Unsplash).
  - Image and text sit as a paired unit near the center of the panel; no large void in the middle.
  - Quest 01 layout: image right, text left (image's left edge near center).
  - Quest 02 layout: image left, text right (text's right edge near center, text-align right).
  - Same for Quest 03 (image right) and Quest 04 (image left).

- [ ] **Step 2.4:** Commit:
  ```
  git add js/panels.js css/layout.css
  git commit -m "feat: Quest panels use real project imagery + paired-spread layout"
  ```

---

## Task 3: Visual edge matching

**Files:**
- Modify: `js/sky.js` (gradient inversion)
- Modify: `js/underground.js` (cave depth top color)

After this task, the seam between sky→homepage and homepage→underground is imperceptible — colors at the zone boundaries match.

### Substeps

- [ ] **Step 3.1:** In `js/sky.js`, find the sky gradient layer. Currently:
  ```
  linear-gradient(180deg, #0a0612 0%, #2d1654 30%, #4a2378 65%, #5d2a8e 90%, #6d3aa8 100%)
  ```
  (or similar — top dark, bottom bright). Invert so the BOTTOM matches the homepage's top atmospheric color (`#08060d` to `#1a0f2e` range). New gradient:

  ```
  linear-gradient(180deg, #6d3aa8 0%, #5d2a8e 25%, #4a2378 55%, #2d1654 80%, #08060d 100%)
  ```

  The brighter atmospheric colors are now at the TOP of the sky panel (the deep sky the camera is "looking up into"); the bottom of the sky panel matches the homepage top.

- [ ] **Step 3.2:** In `js/underground.js`, find `makeCaveDepth`. Its gradient currently starts at `#0a0612`:
  ```
  linear-gradient(180deg, #0a0612 0%, #1a0f2e 45%, #2a1351 100%)
  ```
  Change the top stop to `#06040b` (matching the homepage's ground band):

  ```
  linear-gradient(180deg, #06040b 0%, #1a0f2e 45%, #2a1351 100%)
  ```

  Also: the underground env's container `background` (currently `#0d0814`) — keep it but verify it's not overriding the cave depth top. If it's a backstop behind the gradient, no issue.

- [ ] **Step 3.3:** Verify in browser:
  - Scroll from homepage UP to sky → no jarring color shift; the seam is imperceptible.
  - Scroll from homepage DOWN to underground → same.
  - The brighter atmospheric haze is at the TOP of the sky panel, deepening downward to the homepage's atmospheric color at the seam.
  - The underground's top blends into the homepage's ground line.

- [ ] **Step 3.4:** Commit:
  ```
  git add js/sky.js js/underground.js
  git commit -m "fix: visual edge matching — sky bottom and underground top blend with homepage"
  ```

---

## Task 4: Mobile + reduced-motion verification

**Files:** likely none modified — verification + small fixes if needed.

The mobile branch in `homepage.js` (Task 1) already routes around the wheel hijack, and the CSS media query (Task 1) already collapses zones to native vertical scroll. This task verifies and fixes any gaps.

### Substeps

- [ ] **Step 4.1:** Open `http://localhost:8765/index.html` at viewport width 375px (use DevTools device emulation). Verify:
  - Page scrolls vertically natively.
  - All zones (sky → homepage → underground) are reachable by scrolling.
  - Top nav links navigate via hash + smooth scroll (or instant jump if reduced motion).
  - Project list in underground is single-column stacked.
  - Form in sky is full-width.
  - No wheel hijacking.

- [ ] **Step 4.2:** Toggle OS-level reduced motion. Reload. Verify:
  - All zone navigations are instant (no animation).
  - No environment animations (parallax, twinkle, etc.).
  - Hash routes still work.

- [ ] **Step 4.3:** If any gaps, fix them. Likely areas:
  - CSS media query may have leftover `body.homepage` references — replace with `#zone-homepage`.
  - Reduced-motion gate may need to apply to `animateScroll` (it does, per the orchestrator code in Task 1.7).

- [ ] **Step 4.4:** Commit (only if changes made):
  ```
  git add <files>
  git commit -m "fix: mobile + reduced-motion verification"
  ```

---

## Task 5: QA pass + ship-readiness

**Files:** `CLAUDE.md` only.

### Substeps

- [ ] **Step 5.1:** Full browser smoke test:
  - Homepage loads. Wheel drives horizontal pan. ✓
  - Click `Work` → ~800ms animated scroll down. URL `/#work`. Underground env + project list visible. ✓
  - From underground, scroll vertically through project list. Click each `View case study →` — navigates to project detail page. Browser back returns to underground at the same scroll position (browser scroll-restoration).
  - Click `Home` → ~800ms animated scroll up. URL `/`. Homepage zone visible at panel 0.
  - Click `Contact` → ~800ms animated scroll up. URL `/#contact`. Sky env + form visible.
  - Click `Work` from contact → animated scroll. (Or do they both hop through homepage? Per spec, animated scroll is just `pageEl.scrollTop` from current to target — so it's a 2× longer journey if you're going sky→underground. That's fine — the camera continuously pans through.)
  - Direct load of `/#work` → instant arrival at underground.
  - Browser back/forward navigates correctly.
  - No console errors.

- [ ] **Step 5.2:** Test in Firefox + Safari (or document if those aren't available locally — Joel can test later).

- [ ] **Step 5.3:** Run a Lighthouse audit on the homepage. Compare to baseline (if recorded). Flag any regression > 5 points.

- [ ] **Step 5.4:** Update `CLAUDE.md`. Replace the "Z-Axis Navigation" and "Site Structure" sections to reflect single-page architecture. Update Session Log with this refactor's summary. Update Next Steps (remove items addressed by this work).

- [ ] **Step 5.5:** Final commit:
  ```
  git add CLAUDE.md
  git commit -m "chore: update CLAUDE.md after Z-axis single-page refactor"
  ```

---

## Self-Review Notes

- **Spec coverage:** every spec section maps to a task. Architecture + scroll model + hash routing → T1. Visual edges → T3. Quest panel content + layout → T2. Mobile + reduced motion → T4. QA → T5.
- **Reuses established patterns:** environment modules' RAF + transform pattern, panel mount functions, scroll-engine's horizontal pan logic — all reused. Only the wheel-input ownership changes.
- **The big task (T1) is unavoidably large** because the refactor is structural — every file touches everything. Subagent should be briefed accordingly. Minor follow-up tasks (T2-T5) handle polish in smaller chunks.
- **No new test infrastructure** — this project tests visually in browser. Each task verifies in browser before commit.
- **Out of scope** items from the spec (real client logos, photography for non-featured projects, Technicolour re-add, project detail page redesigns) explicitly NOT in any task.
