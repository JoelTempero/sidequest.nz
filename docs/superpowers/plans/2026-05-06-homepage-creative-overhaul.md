# Homepage Creative Overhaul — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transform the homepage from a repetitive horizontal-scroll portfolio into a cinematic, interactive experience with particle canvas, parallax, staggered entrances, and cursor-driven micro-interactions.

**Architecture:** Single canvas layer spans the full horizontal scroll for particle atmosphere. GSAP ScrollTrigger drives parallax and entrance choreography. Separate interactions module handles cursor glow, image tilt, and magnetic buttons via a single delegated mousemove handler. All animations use transform/opacity only.

**Tech Stack:** HTML5, CSS3 (custom properties), vanilla JS (ES modules pattern), GSAP 3 + ScrollTrigger (CDN), Canvas 2D API

**Design spec:** `docs/superpowers/specs/2026-05-06-homepage-creative-overhaul-design.md`

---

## File Map

| File | Action | Responsibility |
|---|---|---|
| `js/canvas.js` | Create | Particle system: dots, connecting lines, density curve, colour shift, cursor interaction, 30fps render loop |
| `js/interactions.js` | Create | Cursor glow div tracking, image 3D tilt, magnetic buttons — single delegated mousemove |
| `js/animations.js` | Rewrite | Text scramble function, per-panel entrance choreography, ScrollTrigger entrance triggers |
| `js/scroll.js` | Rewrite | Enhanced horizontal scroll with parallax rates per element, gradient blob drift, typography fragment parallax |
| `index.html` | Modify | Add canvas element, cursor glow div, gradient blobs, typography fragments, restructure all panels, add discover panel, wire new JS files |
| `css/style.css` | Modify | Canvas positioning, cursor glow styles, typography fragment styles, gradient blob styles |
| `css/layout.css` | Modify | Per-panel personality layouts, discover panel scattered layout, CTA enhancements |
| `css/animations.css` | Modify | Entrance initial states for new elements, scroll cue fade-out |

---

### Task 1: Canvas Particle System

**Files:** Create `js/canvas.js`

The foundation — a self-contained particle system that renders behind all content.

- [ ] **Step 1:** Create `js/canvas.js` with a `ParticleCanvas` class. Constructor takes a canvas element reference. Stores configuration: particle count range (80-150), proximity threshold (130px), colours array (purple `#6d28d9`, orange `#f97316`, white `#ffffff`), max dot size (6px), min dot size (2px).

- [ ] **Step 2:** Add `init()` method. Sizes canvas to viewport. Generates dots distributed across the full horizontal scroll width (not just viewport). Each dot gets: x/y position, size, colour (randomly picked from palette with opacity 0.1-0.5), velocity (random dx/dy at 0.1-0.3px/frame), base opacity. Apply density curve — divide the scroll width into zones and place fewer dots in the hero zone, progressively more toward the CTA zone. Apply colour shift — early zones weight purple, later zones weight orange.

- [ ] **Step 3:** Add `update(scrollProgress)` method. Moves each dot by its velocity (ambient drift). Wraps or bounces dots at boundaries. `scrollProgress` (0-1 float from GSAP) is used to offset the camera/draw position — the canvas draws in viewport space but the dots live in scroll-space. If cursor is active, dots within 200px of cursor get opacity boost (lerp toward 0.7) and drift gently toward cursor (lerp factor 0.02).

- [ ] **Step 4:** Add `draw()` method. Clears canvas. For each visible dot (within viewport after scroll offset): draw filled circle with shadowBlur for glow effect. Then draw connecting lines — for each pair of visible dots within proximity threshold, draw a line with opacity based on distance (closer = more opaque, range 0.03-0.08). Use `rgba(255,255,255,opacity)` for lines.

- [ ] **Step 5:** Add render loop. `requestAnimationFrame` with 30fps throttle (track last frame time, skip if <33ms elapsed). Check `document.hidden` — skip frames when tab not visible. Check `prefers-reduced-motion` and mobile (viewport width ≤768) — if either, don't start the loop at all.

- [ ] **Step 6:** Add `setCursor(x, y)` and `clearCursor()` methods for external cursor input. Store cursor position in scroll-space (add scroll offset to screen-space cursor). Add `setScrollProgress(progress)` method called by scroll.js.

- [ ] **Step 7:** Export/expose `initParticleCanvas(canvasElement)` function that creates instance, calls init, starts render loop, and returns the instance (so scroll.js and interactions.js can call methods on it). Add resize handler (debounced) that re-sizes canvas and re-distributes dots.

- [ ] **Step 8:** Verify in browser — add a temporary `<canvas>` to index.html, include the script, call init. Confirm dots render, drift, and connecting lines appear. Remove temporary additions.

- [ ] **Step 9:** Commit: `feat: add canvas particle system with dot network and density curve`

---

### Task 2: Interactions Module

**Files:** Create `js/interactions.js`

Cursor glow, image tilt, and magnetic buttons — all driven by a single delegated mousemove.

- [ ] **Step 1:** Create `js/interactions.js`. Add `initCursorGlow()` — expects a div with class `.cursor-glow` in the DOM. On mousemove, update its transform position with lerp smoothing (factor 0.1). Use `requestAnimationFrame` for the lerp loop — store target position on mousemove, animate current position toward target each frame. Set `will-change: transform` via JS on init.

- [ ] **Step 2:** Add `initImageTilt()` — query all elements with `[data-tilt]` attribute. On mouseenter, track cursor position relative to element centre. Map offset to `rotateY` (horizontal) and `rotateX` (vertical), max ±8deg (or ±4deg if `data-tilt="light"`). Apply via `transform: perspective(800px) rotateX(Xdeg) rotateY(Ydeg)`. Lerp-smoothed. On mouseleave, tween back to `rotateX(0) rotateY(0)` over 0.4s. Add a `.tilt-shine` overlay div dynamically — a linear gradient that shifts position with the tilt angle.

- [ ] **Step 3:** Add `initMagneticButtons()` — query all `[data-magnetic]` elements. On mousemove (delegated from parent), check distance from cursor to each magnetic element's centre. If within 80px, apply `translate()` toward cursor (proportional to distance, max 12px). If outside range, spring back via GSAP tween (0.4s, elastic ease). On hover, add `letter-spacing: 0.5px` and `scale(1.03)` via class toggle.

- [ ] **Step 4:** Add `initInteractions()` orchestrator function. Checks for desktop (viewport >768px) and no `prefers-reduced-motion`. If passes, calls all three init functions. Sets up a single mousemove listener on `.panels` container that coordinates cursor glow position, tilt calculations, magnetic proximity, and passes cursor to canvas instance (if provided). Accept canvas instance as optional parameter.

- [ ] **Step 5:** Verify in browser with temporary test elements — a div with `data-tilt`, a button with `data-magnetic`, and the cursor glow div. Confirm all three effects work. Remove test elements.

- [ ] **Step 6:** Commit: `feat: add interactions module — cursor glow, image tilt, magnetic buttons`

---

### Task 3: Text Scramble & Entrance Animations

**Files:** Rewrite `js/animations.js`

- [ ] **Step 1:** Add `textScramble(element, duration)` function. Takes a DOM element and total duration in ms. Reads `textContent`, stores original. For each character position, cycles through 3-5 random glyphs from charset `!@#$%^&*()_+{}|:<>?` before resolving to the real character. Characters resolve left-to-right with 20-30ms stagger between each starting. Uses `requestAnimationFrame` for smooth updates — no setInterval. Returns a Promise that resolves when complete.

- [ ] **Step 2:** Add per-panel entrance timeline functions. Each returns a GSAP timeline (paused) that can be triggered by ScrollTrigger. All elements start from their CSS initial states (defined in animations.css).

  - `heroEntrance()` — scramble "Be Known." then "Stand Out." (1.5s total), fade up subtitle after, fade+bounce scroll cue last. Scroll cue fades out on first scroll event.
  - `chillAirEntrance()` — image slides from right (x: 60→0), text staggers up (y: 40→0, stagger 0.1s). Title gets scramble (0.7s).
  - `storybookEntrance()` — image scale up (0.95→1) with fade, text drifts from left (x: -40→0). Slower stagger (0.15s). Title scramble (0.8s).
  - `technicolourEntrance()` — title crashes from above (y: -60→0), image slides up from below (y: 60→0). Converging. Title scramble (0.6s).
  - `livingHopeEntrance()` — image parallax drift (x: 80→0, slower), text fades in (opacity, no movement). Title scramble (0.7s).
  - `discoverEntrance()` — thumbnails drift from various directions (randomised per-thumbnail x/y offsets), staggered (0.1-0.3s delays). Centre text fades up last. Title scramble (0.6s).
  - `ctaEntrance()` — title and button enter almost simultaneously (fade + slight y). Fast scramble (0.4s). No stagger.

- [ ] **Step 3:** Add `initEntrances(isDesktop)` function. On desktop, create a ScrollTrigger for each panel that plays its entrance timeline when the panel is ~30% into the viewport (horizontal scroll position). Use `containerAnimation` parameter from the main horizontal scroll tween. One-shot — `once: true`. On mobile, use vertical scroll triggers (start: `top 75%`) with simpler fade-up entrances + text scramble.

- [ ] **Step 4:** Commit: `feat: add text scramble effect and per-panel entrance choreography`

---

### Task 4: HTML Restructuring

**Files:** Modify `index.html`

- [ ] **Step 1:** Add atmosphere elements before the `<main>` tag: canvas element (`<canvas id="particle-canvas">`), cursor glow div (`<div class="cursor-glow">`). These sit fixed behind everything.

- [ ] **Step 2:** Add atmosphere elements inside `.panels` (so they scroll with content): 3 gradient blob divs (`<div class="gradient-blob blob-1/2/3">`), 3 typography fragment divs (`<div class="typo-fragment" data-text="CREATE/BUILD/LAUNCH">`). Position these between panels using absolute positioning.

- [ ] **Step 3:** Restructure hero panel. Add `data-scramble="1500"` to title lines. Add "SIDEQUEST DIGITAL" label above the title. Keep existing tagline and scroll cue structure.

- [ ] **Step 4:** Restructure project panels 2-5. Each gets a unique class (`panel-chill-air`, `panel-storybook`, `panel-technicolour`, `panel-living-hope`) for CSS targeting. Add `data-tilt` to all `.project-visual` elements. Add `data-magnetic` to all `.btn-link` elements. Add `data-scramble` with duration to all `.panel-title` elements (700, 800, 600, 700). Rearrange inner HTML per panel personality (e.g., Technicolour has title top-left, image bottom-right — different DOM order than Chill Air).

- [ ] **Step 5:** Replace the 24CHCH panel with the discover panel. Structure: `<section class="panel panel-discover">` containing 5 thumbnail cards (`<a class="discover-thumb" data-tilt="light">` with images from manifest) and centre text with "There's more." heading (`data-scramble="600"`) and "See All Work →" link (`data-magnetic`).

- [ ] **Step 6:** Update CTA panel. Add `data-scramble="400"` to title. Add `data-magnetic` to CTA button.

- [ ] **Step 7:** Add script tags for new files: `<script src="js/canvas.js"></script>` and `<script src="js/interactions.js"></script>` before the existing JS includes. Add a small init script at the bottom that wires everything together: creates canvas instance, passes it to interactions init, passes it to scroll setup.

- [ ] **Step 8:** Verify in browser — page loads without JS errors, all panels render (unstyled personality layouts are fine at this stage), atmosphere elements exist in DOM.

- [ ] **Step 9:** Commit: `feat: restructure homepage HTML — panels, atmosphere, data attributes`

---

### Task 5: CSS — Atmosphere & Panel Layouts

**Files:** Modify `css/style.css`, `css/layout.css`, `css/animations.css`

- [ ] **Step 1:** In `style.css` — add canvas positioning (fixed, inset 0, z-index 0, pointer-events none). Add cursor glow styles (fixed, 300px×300px, radial-gradient purple at 0.08 opacity, border-radius 50%, pointer-events none, z-index 1, `will-change: transform`). Add gradient blob styles (absolute, large dimensions, radial-gradient, blur filter, pointer-events none). Add typography fragment styles (absolute, Outfit font, 15-20vw size, 5-8% opacity, white, pointer-events none, `will-change: transform`).

- [ ] **Step 2:** In `layout.css` — update `.panel-content` max-width to be panel-specific. Add personality layouts:
  - `.panel-chill-air .project-showcase` — flex, image 55%, text 45%
  - `.panel-storybook .project-showcase` — flex-direction row-reverse (was already alternating, but now explicit), text right-aligned at 35%, image 65% with taller aspect ratio
  - `.panel-technicolour` — CSS grid or absolute positioning: title area top-left (massive font size: text-5xl), image bottom-right (~50% width), description bottom-left
  - `.panel-living-hope .project-showcase` — image 70%, text 30% compact
  - Remove the generic `nth-child(odd/even)` flex-direction alternation — each panel now has explicit layout

- [ ] **Step 3:** In `layout.css` — add discover panel layout. `.panel-discover` uses relative positioning. Thumbnails (`.discover-thumb`) are absolute positioned with specific top/left/width/rotation per item (use nth-child selectors or inline styles set in HTML). Centre text is centred via flex. Mobile override: thumbnails become a 2-column grid, no rotation.

- [ ] **Step 4:** In `layout.css` — update CTA panel. Gradient blob opacity stronger in CTA zone. No layout changes needed — centred text + button is correct.

- [ ] **Step 5:** In `animations.css` — add entrance initial states for new elements. All elements that get entrance animations start with `opacity: 0` and their entrance offset (e.g., `.panel-chill-air .project-visual { opacity: 0; transform: translateX(60px); }`). Hero elements keep existing states. Add scroll cue transition for fade-out. Typography fragments and gradient blobs don't need initial hidden states — they're always visible.

- [ ] **Step 6:** Verify in browser — panel layouts look correct for each personality (even without animations). Atmosphere elements (blobs, fragments) are visible. Canvas is positioned correctly (even if not rendering particles yet from this step alone).

- [ ] **Step 7:** Commit: `feat: add atmosphere CSS and per-panel personality layouts`

---

### Task 6: Scroll Enhancements — Parallax & Orchestration

**Files:** Rewrite `js/scroll.js`

- [ ] **Step 1:** Rewrite `initHorizontalScroll()`. Keep the core GSAP horizontal scroll tween but store a reference to it. On scroll progress update, pass progress (0-1) to the canvas instance via `setScrollProgress()`.

- [ ] **Step 2:** Add parallax for elements within panels. After the main scroll tween, create individual ScrollTrigger tweens for elements with `data-parallax` attributes. These use `containerAnimation` (the main scroll tween) so they trigger based on horizontal position. Rate is set via `data-parallax="0.3"` (moves at 0.3× scroll speed). Apply to: project images, text blocks, gradient blobs, typography fragments. Each gets a `translateX` offset based on scroll progress × rate.

- [ ] **Step 3:** Add gradient blob scroll-linked drift. Each `.gradient-blob` gets a GSAP tween tied to the main scroll progress. Blob 1 drifts right and down. Blob 2 drifts left. Blob 3 drifts right and up. Movement range: ~200-400px across the full scroll. Opacity also shifts — blobs near CTA zone get higher opacity.

- [ ] **Step 4:** Add typography fragment parallax. Each `.typo-fragment` scrolls at 0.3-0.5× the panel speed via `translateX` offset. They appear to drift past slower than the panels.

- [ ] **Step 5:** Wire up entrance triggers. Call `initEntrances(true)` from animations.js, passing the main scroll tween as the container animation. Each panel's entrance timeline fires when its panel hits ~30% into viewport.

- [ ] **Step 6:** Scroll cue: on first scroll event (ScrollTrigger onUpdate, first fire), fade out `.hero-scroll-cue` via GSAP.

- [ ] **Step 7:** Verify in browser — parallax depth is visible when scrolling, gradient blobs drift, typography fragments scroll slower, panel entrances fire at the right positions.

- [ ] **Step 8:** Commit: `feat: enhanced scroll — parallax layers, blob drift, entrance triggers`

---

### Task 7: Integration & Mobile Fallback

**Files:** Modify `js/scroll.js`, `js/animations.js`, `css/layout.css`

- [ ] **Step 1:** Wire the orchestration in the init script (bottom of index.html). Desktop flow: init canvas → init horizontal scroll (pass canvas ref) → init entrances (pass container animation) → init interactions (pass canvas ref). Mobile flow: skip canvas, skip horizontal scroll, init mobile entrances (vertical ScrollTriggers), skip cursor interactions.

- [ ] **Step 2:** Add `prefers-reduced-motion` support across all files. In canvas.js: skip render loop, show static dots (single frame draw). In interactions.js: skip cursor glow and tilt, keep magnetic as simple hover. In animations.js: skip scramble (show text immediately), reduce entrance durations to 0.3s simple fades.

- [ ] **Step 3:** Mobile layout overrides in `layout.css`. All personality panels revert to a consistent mobile layout: image above (100% width, 16:9 aspect), text below. No absolute positioning, no asymmetric layouts. Discover thumbnails become a 2×2 or 2×3 grid (no scatter, no rotation). Typography fragments hidden. Gradient blobs static (no scroll-linked animation).

- [ ] **Step 4:** Mobile entrances in `animations.js`. Vertical scroll-triggered fade-ups with staggered timing (existing pattern, enhanced). Text scramble still fires on mobile scroll entrance (doesn't need cursor).

- [ ] **Step 5:** Full integration test in browser — desktop: complete horizontal scroll journey with all effects. Mobile (use devtools responsive mode): vertical scroll, no canvas, clean layouts, fade-up entrances. Test `prefers-reduced-motion` via devtools emulation.

- [ ] **Step 6:** Performance check — open devtools Performance tab, record a full scroll-through. Verify: no layout/paint in animation frames, canvas stays under 2ms/frame, no jank (consistent 60fps for DOM, 30fps for canvas).

- [ ] **Step 7:** Commit: `feat: integration, mobile fallback, reduced-motion support`

---

## Task Dependency Order

```
Task 1 (canvas) ──────────────────┐
Task 2 (interactions) ────────────┤
Task 3 (animations/scramble) ─────┼── Task 6 (scroll/parallax) ── Task 7 (integration)
Task 4 (HTML restructure) ────────┤
Task 5 (CSS layouts) ─────────────┘
```

Tasks 1-5 can be executed in parallel (independent files, no cross-dependencies). Task 6 depends on all of 1-5 being complete. Task 7 depends on Task 6.

If executing sequentially, recommended order: 1 → 2 → 3 → 4 → 5 → 6 → 7 (canvas first gives early visual feedback).
