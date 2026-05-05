# Homepage Creative Overhaul — Design Spec

## Overview

Transform the sidequest.nz homepage from a functional but repetitive horizontal-scroll portfolio into a cinematic, interactive experience at intensity 4-5. The horizontal scroll is the backbone — everything works within that framework.

**Journey archetype:** Cinematic + Interactive Hybrid
**Technical approach:** GSAP + ScrollTrigger + Lightweight Canvas (2D)
**Performance constraint:** Lean and efficient — CSS transforms/opacity only, 30fps canvas, no heavy GPU work

## Page Structure

7 panels within the existing horizontal scroll:

1. **Hero** — Abstract motion canvas with tagline
2. **Chill Air** — Project showcase (clean, professional)
3. **Storybook Weddings** — Project showcase (elegant, image-dominant)
4. **Technicolour Thoughts** — Project showcase (bold, expressive)
5. **My Living Hope** — Project showcase (product-focused, understated)
6. **Discover More** — Scattered project thumbnails, gateway to work page
7. **CTA** — "Got a project in mind?" peak energy

## Scroll Behavior

**Parallax layers:** Elements within each panel move at different speeds during horizontal scroll. Images, text, and background elements each have their own scroll rate, creating depth.

**Staggered entrances:** As each panel scrolls into the viewport, its elements arrive at different times and from different directions — choreographed to scroll position (not time-based). Entrances are unconventional — not just predictable top-to-bottom reveals. Additional graphics and decorative motion bridge the transitions.

## Hero Panel

- **Canvas layer:** Full-viewport canvas behind all content. Animated dot network with connected constellation lines, flowing curved lines, and small geometric shapes. Purple/orange/white accent colours at low opacity. Cursor interaction — dots near the cursor glow brighter and drift toward it.
- **Gradient blobs:** 2-3 large CSS radial gradients that drift slowly via GSAP. Purple top-left, orange bottom-right. Scroll-responsive.
- **Tagline:** "SIDEQUEST DIGITAL" label above. "Be Known." in white, "Stand Out." in purple→orange gradient. Text scramble entrance (characters resolve from random glyphs, ~1.5s). Cursor glow interacts with text area.
- **Subtitle:** "Crafting one-of-a-kind digital experiences for communities, schools, and small businesses." Fades up after title resolves.
- **Scroll cue:** "SCROLL →" bottom-right, gentle horizontal bounce. Fades out after first scroll.
- **Canvas continuity:** The canvas spans the full horizontal scroll width. It starts as the hero's centrepiece, then becomes the bridging atmosphere layer between all panels.

## Project Panels (2-5): Same Bones, Different Personality

Every panel shares the same elements — project image, category label, title, description, tags, "View Project" link. They differ in proportions, typography scale, accent treatment, entrance choreography, and position of elements.

### Panel 2 — Chill Air
- **Personality:** Clean, professional. The "straight man" that sets the baseline.
- **Layout:** Image 55% width left, text right. Standard proportions.
- **Entrance:** Image slides in from right, text staggers up from bottom. Orderly and confident.
- **Accent:** Purple label.

### Panel 3 — Storybook Weddings
- **Personality:** Elegant, romantic. Image-dominant.
- **Layout:** Text 35% left (right-aligned), image 65% right (taller crop).
- **Entrance:** Image fades in with soft scale-up, text drifts in from the left. Slower pacing.
- **Accent:** Purple label.

### Panel 4 — Technicolour Thoughts
- **Personality:** Bold, expressive. Most dramatic.
- **Layout:** Massive title top-left. Image bottom-right as accent (~50% width). Description bottom-left.
- **Entrance:** Title crashes in from above, image slides up from below — converging entrance.
- **Accent:** Orange label (matches the studio's energy).

### Panel 5 — My Living Hope
- **Personality:** Product-focused, understated.
- **Layout:** Image 70% width left (dominant), compact text tucked right.
- **Entrance:** Image enters with horizontal parallax drift (arrives slightly after panel), text fades in quietly.
- **Accent:** Purple label.

## Panel 6 — Discover More

- **Layout:** 4-6 scattered project thumbnail cards at various sizes, positions, and slight rotations across the panel. Centre text overlays: "There's more." headline + "See All Work →" link to work.html.
- **Thumbnails:** Small preview cards using real project images (24CHCH and others from manifest). Subtle border, slight rotation, varying opacity — like photos scattered on a desk.
- **Entrance:** Thumbnails drift in from different directions at different parallax speeds. Some arrive early, some late — organic, not choreographed. Centre text fades up last.
- **Interactivity:** Thumbnails respond to cursor (slight tilt on hover, glow brightens near cursor). Clicking any thumbnail goes to that project page. "See All Work" is a magnetic button linking to work.html.
- **Canvas:** Particles get denser here, building energy toward CTA.

## Panel 7 — CTA

- **Canvas atmosphere:** Particle density at peak — more dots, brighter glows, more connecting lines. The energy building across the scroll reaches its climax.
- **Gradient blobs:** Stronger opacity. Purple and orange converge toward centre.
- **Title:** "Got a project in mind?" with gradient question mark. Text scramble entrance, faster than hero (~0.4s).
- **Button:** "Get In Touch" — magnetic button. On hover, button glows and nearby canvas particles react (drift toward it, brighten). Links to contact.html.
- **Pacing:** Fast entrance — no slow reveals. Title and button appear almost simultaneously. The journey is done, this is the payoff.

## Atmosphere Layer

A continuous visual layer spanning the entire horizontal scroll, behind all panel content.

### Canvas (2D)
- **Element:** Single `<canvas>` positioned fixed, full viewport size. Draw offset by GSAP's horizontal scroll progress.
- **Particles:** 80-150 dots total across full scroll width. Sizes 2-6px. Colours: purple, orange, white at 0.1-0.5 opacity. Subtle glow via shadow blur.
- **Connected lines:** Dots within 120-150px proximity get a faint connecting line (rgba white, 0.03-0.08 opacity). Constellation/network effect.
- **Dot motion:** Slow ambient drift per dot (0.1-0.3px/frame). Random velocity, wrap/bounce at boundaries. Simple linear movement, no physics.
- **Cursor interaction:** Dots within ~200px of cursor glow brighter and drift gently toward cursor position. Smoothed with lerp.
- **Density curve:** Sparse at hero, progressively denser toward CTA. Set at initialisation.
- **Colour shift:** Early panels lean purple. Later panels introduce more orange. CTA area is warmest.
- **Performance:** 30fps throttle via requestAnimationFrame. Skip frames when tab not visible. Disabled on mobile and `prefers-reduced-motion`.

### CSS Layers
- **Gradient blobs:** 3-4 large radial gradients (CSS absolute positioned). Drift via GSAP tied to scroll progress. Purple dominant early, orange grows toward CTA.
- **Typography fragments:** 2-3 oversized words ("CREATE", "BUILD", "LAUNCH") at 5-10% opacity, positioned between panels. Scroll at 0.3-0.5× parallax speed. Font: Outfit at 15-20vw size.
- **Noise overlay:** Existing subtle noise texture remains.
- **Cursor glow:** CSS `radial-gradient` div (~300px radius, purple-tinted, 0.06-0.1 opacity) following mouse via JS with lerp smoothing (0.1 factor).

## Interactive Moments

### 1. Cursor Glow
- Fixed-position div with `radial-gradient` background. Position updated via `mousemove` with lerp smoothing (0.1 factor). Purple-tinted, 0.06-0.1 opacity.
- Canvas dots also respond — nearby dots glow brighter and drift toward cursor.
- Active everywhere. Desktop only.
- Performance: single div, CSS only, `will-change: transform`.

### 2. Image Tilt
- Project images respond to cursor position with 3D tilt via CSS `perspective(800px)`. JS maps cursor offset from image centre to `rotateX`/`rotateY` (max ±8deg). Smoothed with lerp. Resets flat on mouse leave.
- Scope: all project images (panels 2-5), lighter version (±4deg) on discover thumbnails.
- Enhancement: subtle shine/reflection gradient shifts with tilt.
- Performance: `transform` only, `will-change: transform` on container.

### 3. Magnetic Buttons
- "View Project" links and CTA button pull toward cursor when within ~80px range. `translate` offset proportional to distance (max ~12px). GSAP spring-back on leave (0.4s, elastic ease).
- Scope: all "View Project →" links, "See All Work →", "Get In Touch" button.
- Enhancement: letter-spacing widens +0.5px on hover, subtle scale bump (1.03).
- Performance: `transform: translate()` only. Single delegated `mousemove` listener on panels container.

### 4. Text Scramble
- Titles display randomised characters before resolving to real text. Each character cycles through 3-5 random glyphs from charset (`!@#$%^&*()_+{}|:<>?`) before landing. Left-to-right stagger (20-30ms per char).
- Scope: hero tagline, all project titles (panels 2-5), "There's more." (discover), "Got a project in mind?" (CTA). Category labels do NOT scramble.
- Timing: hero ~1.5s, project titles ~0.6-0.8s, CTA ~0.4s. Accelerating pacing across the journey.
- One-shot: each title scrambles once on first entrance. No re-trigger on reverse scroll.
- Performance: pure DOM text manipulation, ~50 lines of JS.

## Mobile Fallback

- Canvas layer disabled — no particle rendering.
- Static gradient blobs remain (CSS only, no animation).
- Typography fragments hidden.
- No cursor interactions (glow, tilt, magnetic, scramble on scroll only — not cursor-triggered).
- Vertical scroll layout with scroll-triggered fade-up entrances (existing mobile behavior, enhanced with staggered timing).
- Project panels stack vertically with consistent layout (image above, text below).
- Discover panel thumbnails arranged in a simple grid instead of scattered.
- Text scramble still fires on scroll-triggered entrance (touch-friendly — no cursor dependency).

## Performance Budget

- All interactions use `transform` and `opacity` only — no layout or paint triggers.
- Single delegated `mousemove` handler for cursor glow + tilt + magnetic buttons.
- Canvas throttled to 30fps, disabled on mobile and `prefers-reduced-motion`.
- `will-change` applied sparingly: cursor glow div, image containers, magnetic buttons.
- All cursor interactions desktop-only.
- No external dependencies beyond GSAP 3 + ScrollTrigger (already in use).

## Files Affected

- `index.html` — restructure panel HTML, add canvas element, add data attributes for panel personalities
- `css/layout.css` — panel layout variations, typography scale per panel, discover panel layout
- `css/animations.css` — entrance initial states, parallax layer setup
- `js/scroll.js` — enhanced ScrollTrigger with parallax rates, staggered entrance timelines per panel
- `js/animations.js` — entrance choreography, text scramble, scroll-triggered reveals
- `js/canvas.js` — new file: particle system, dot network, cursor interaction, density curve
- `js/interactions.js` — new file: cursor glow, image tilt, magnetic buttons
- `css/style.css` — cursor glow styles, typography fragment styles, canvas positioning
