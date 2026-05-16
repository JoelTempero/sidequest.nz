# Handoff: sidequest.nz Homepage

## Overview

A single-page, **horizontally-scrolling cinematic homepage** for sidequest.nz — a one-person studio in Christchurch, NZ that builds custom websites and small apps. The page reads like a side-scrolling platformer level: a static parallax landscape sits behind seven full-viewport panels, and the user pans the camera through them with the vertical scroll wheel / trackpad.

A small companion robot drifts autonomously across the screen, tracks the cursor with its eyes, and gives the page a mascot.

The brand line is **"Be Known. Stand Out."** Aesthetic: dark with a violet undertone (near-black `#08060d`, primary violet `#7c3aed`), all-sans typography (Space Grotesk for display, IBM Plex Mono for micro-text), tight letter-spacing.

## About the Design Files

The HTML/JSX files in this bundle are **design references**, not production code. They were authored as inline-Babel React prototypes inside a single HTML file — fine for showing intended look and behaviour, not how this should actually ship.

The task is to **recreate these designs in the target codebase's environment** using its existing patterns and libraries. If there is no codebase yet, the recommended framework is **React + Vite + TypeScript** (or **Next.js** if SEO/static export is wanted), since most of the prototype's logic translates 1:1.

The included files:

- `Sidequest Horizontal Homepage.html` — the entry point. Boots React, mounts `<App/>`, lays out the seven panels and fixed nav/chrome.
- `scroll-engine.jsx` — `useHorizontalScroll()` hook + shared `COLORS` palette + `useParallax()` helper.
- `world.jsx` — the static parallax landscape (sky, sun, stars, far mountains, clouds, mid hills, trees, ground, birds).
- `panels.jsx` — every panel: hero, four project panels, "see more", logos wall, contact. Includes shared atoms (`Eyebrow`, `headlineStyle`, `BigLink`, `FakeLogo`, `ProjectImage`).
- `robot.jsx` — the autonomous companion robot.

## Fidelity

**High-fidelity.** Final colours, typography, spacing, animation timings, and copy are all locked. Recreate pixel-perfectly. The only deliberately loose pieces are:
- The four project photos are **Unsplash placeholders** — replace with real client photography.
- The ten logos in the "Trusted by" panel are **fake names with generic SVG marks** — replace with real client logos.

## Layout & Structure

The page is **one viewport tall and ~7 viewports wide**. A horizontal track contains seven `<section data-panel>` elements, each `100vw × 100vh`. Vertical wheel input drives a `translate3d(-x, 0, 0)` on the track.

```
┌──────────┬──────────┬──────────┬──────────┬──────────┬──────────┬──────────┬──────────┐
│   00     │   01     │   02     │   03     │   04     │   05     │   06     │   07     │
│  HERO    │ QUEST 01 │ QUEST 02 │ QUEST 03 │ QUEST 04 │ INDEX    │ LOGOS    │ CONTACT  │
│          │ EDU      │ COMM (R) │ ARTS     │ SELF (R) │          │          │          │
└──────────┴──────────┴──────────┴──────────┴──────────┴──────────┴──────────┴──────────┘
   ↑ static parallax world spans the entire track behind every panel
   ↑ companion robot floats on top of all of it (zIndex 0, layered behind chrome)
   ↑ fixed top nav + bottom progress strip on top of everything
```

Body / root sets `overflow: hidden` and `height: 100%`. Scrollbars are hidden via `::-webkit-scrollbar { display: none }`.

## Screens / Panels

### 00 — Hero (`HeroPanel`)
- **Width × Height**: 100vw × 100vh
- **Eyebrow** (top): `SIDEQUEST · CHRISTCHURCH` — IBM Plex Mono 11px, letter-spacing 0.22em, uppercase, color `#c4b5fd`, with a 24×1px `Tick` rule before it
- **H1**: `Be Known.\nStand Out.` — Space Grotesk weight 500, `clamp(72px, 9vw, 152px)`, line-height 0.92, letter-spacing -0.045em, color `#f5f0ff`
  - "Known." styled italic weight 400, color `#c4b5fd`
  - "Out." styled color `#b8a8d4`
- **Footer micro-line**: `SCROLL → FOUR RECENT WORKS` — Plex Mono 11px, with an inline arrow SVG (60×10 viewBox, 1px stroke)
- **Padding**: 0 80px, content centered vertically with flex
- **Text shadow on H1 + headlines**: `0 4px 40px rgba(0,0,0,0.6)` (so type stays legible against the parallax sky)

### 01 — Quest 01 / Education (`Project01`)
- **Layout**: two-column grid `1fr 1fr`, gap 60px, padding `0 80px`. Text left, image right.
- **Eyebrow**: `QUEST 01 / 04 · EDUCATION` (mixed colors — "QUEST 01 / 04" violet `#c4b5fd`, separator tick, then sector in default ink)
- **H2**: `Twelve logins,\none door.` — Space Grotesk 500, `clamp(34px, 3.6vw, 62px)`, line-height 0.95, letter-spacing -0.04em
- **Sub-line** (below): `Maungatua College · learning portal · 2025` — Plex Mono 12px, letter-spacing 0.16em, uppercase
- **Image**: `<ProjectImage>` — `min(420px, 32vw)` wide, aspect 4/5, `marginBottom: 18vh` (lifts photo above the ground line in the world background)
  - Subtle violet vignette overlay: `linear-gradient(160deg, rgba(124,58,237,0.18) 0%, transparent 35%, rgba(8,6,13,0.45) 100%)`
  - Saturation/contrast filter: `saturate(0.85) contrast(1.05)`
  - Box-shadow: `0 60px 140px -40px rgba(0,0,0,0.7), 0 0 0 1px rgba(196,181,253,0.20)`

### 02 — Quest 02 / Community (`Project02`)
- Same `ProjectPanel` shape, but `align="right"` — text right, image left.
- Headline: `A spreadsheet, finally retired.`
- Sub: `Coast Pony Club · member directory · 2025`

### 03 — Quest 03 / Arts (`Project03`)
- Text left, image right.
- Headline: `A schedule that actually fits.`
- Sub: `Selwyn Choristers · rehearsal scheduler · 2025`

### 04 — Quest 04 / Self (`Project04`)
- Text right, image left.
- Headline: `The hardest brief was my own.`
- Sub: `joel.tempero.nz · the studio's own site · 2026`

### 05 — See More / Index (`SeeMorePanel`)
- **Eyebrow**: `THERE'S MORE`
- **H2**: `Twenty-six more quests in the back catalogue.` — `clamp(34px, 3.8vw, 64px)`
- **Two CTAs** (`BigLink`):
  - Primary (filled `#7c3aed`): `Full work index →`
  - Secondary (1px violet border, `backdrop-filter: blur(4px)`): `Field notes →`
  - Both: 18px Space Grotesk weight 500, padding `18px 28px`, no border-radius

### 06 — Logos / Trusted by (`LogosPanel`)
- Eyebrow top-left at `top: 12vh, left: 80`: `A FEW OF THE PEOPLE I'VE BUILT FOR`
- Sub-text bottom-right at `bottom: 14vh, right: 80`: `─ AND TWENTY-SIX OTHERS ACROSS AOTEAROA`
- Ten logos scattered across the panel at hand-picked `(x%, y%)` coordinates with per-logo `depth` (0 = far, 1 = near), `rot` (degrees), and a `bobPhase` derived from index.
- Each logo's `depth` controls:
  - **Scale**: `0.7 + depth * 0.6` → 0.7–1.3
  - **Opacity**: `0.35 + depth * 0.55` → 0.35–0.9
  - **Blur**: `(0.5 - depth) * 2` px when depth < 0.5
  - **Parallax speed**: horizontal pan = `-localX * (depth * 0.35)` where `localX = currentScroll - panelStart`
  - **Bob amplitude**: deeper logos bob more (`4 + (1 - depth) * 6` px vertical, `3 + (1 - depth) * 5` px horizontal)
- Each logo is a small SVG mark + wordmark in `#b8a8d4`. Five mark variants cycled by index (square+diagonal, circle+dot, triangle, stacked bars, arrow). Font alternates between Space Grotesk (even idx, weight 600) and IBM Plex Mono (odd idx, weight 500). Italic on every third.

The ten logo positions and depths are in `panels.jsx` — keep those exact values when porting.

### 07 — Contact (`ContactPanel`)
- Right-aligned content, `max-width: 820`.
- Eyebrow: `KIA ORA`
- H2: `I'm Joel. Say hi.` — `clamp(38px, 4vw, 70px)`, "Joel." italic violet `#c4b5fd`, "Say hi." in muted `#7a6a92`
- Two contact links stacked, right-aligned:
  - `joel@tempero.nz` — Space Grotesk 28px weight 500, with `border-bottom: 1px solid rgba(196,181,253,0.20)`
  - `+64 204 023 9009` — 22px, color `#b8a8d4`

## The World (Parallax Background)

Lives in `world.jsx` as `<World currentRef={…} totalWidth={…}/>`. A `position: fixed` container spanning the viewport, but its inner layers are sized to `max(totalTrackWidth, 12000px)` so they have parallax breathing room.

Each layer reads `currentRef.current` every animation frame and applies `transform: translate3d(-x * factor, 0, 0)`. No React re-renders.

| Layer | Factor | Description |
|---|---|---|
| Sky | 0.02 | Vertical gradient `#06040b → #0d081a → #1a0f2e → #2d1654 → #4a2378 → #5d2a8e` (top to bottom, almost still) |
| Sun | 0.06 | Soft violet glow disc (280×280, radial gradient `rgba(196,181,253,0.55) → rgba(124,58,237,0.25) → transparent`), repeated every 1800px so it's always visible. Bottom positioned at 34% |
| Stars | (static) | 80 small circles sprinkled in the top 40% of the viewport, deterministic placement `(i*137)%100, (i*71)%100`, every third star slightly larger |
| Far mountains | 0.18 | SVG path of soft peaks. `peakWidth: 700px`, peak heights cycle through `[110, 140, 80, 160, 120, 95, 135, 175, 100, 125, 150, 90, 145, 115]`. Linear gradient `#3a1d6e → #1a0f2e` top-to-bottom. baseY 600 in a 1080-tall viewBox |
| Clouds | 0.30 | Three-ellipse puffs in `#c4b5fd`, opacity 0.18–0.40 by index, in the top 40% of viewport |
| Mid hills | 0.45 | Closer range, `peakWidth: 480px`, peak heights `[70, 90, 55, 110, 75, 95, 60, 100, 85, 65]`, gradient `#5d2a8e → #2a1351`, baseY 780 |
| Trees | 0.65 | Sparse silhouettes in `#0a0612`. Two kinds (tall pine triangles, round canopies), every 3rd or 5th slot in a 280px stride |
| Ground | 0.85 | Earth band `#06040b` from y=900 to y=1080, top edge accent line `rgba(196,181,253,0.35)` 1.5px tall, scattered grass tufts (3-stroke groups) every ~60px (every 3rd) |
| Birds | 0.25 + animated | Small flock of M-shapes (`<path>` strokes in `#c4b5fd`) drifting horizontally. Independently translates by `performance.now() * 0.04 % 2400` so they keep moving even at rest |

## The Companion Robot

Lives in `robot.jsx`. Single component `<CompanionRobot/>`, mounted at the App root, `position: fixed` with `zIndex: 0` (intentionally behind the panels' text — sits on top of the world layer but reads as part of the scenery).

Visual: 72×72px viewBox, drawn as SVG.
- Rounded-square body `#1a0f2e` with 1.5px violet `#7c3aed` stroke, 9px corner radius
- Top antenna: line + small `#c4b5fd` ball
- Inner face panel: dark `#06040b` rect
- Two violet `#c4b5fd` circle eyes (radius 3.2)
- Tiny smile path
- Two side fins (1.2px stroke triangles)
- Pulsing status light (`#c4b5fd`, opacity animates 1 → 0.3 → 1 over 1.6s)
- Below the body: a trapezoidal nozzle `#3d3450`/`#7c3aed`, then a three-layer ellipse jet plume in `rgba(196,181,253,0.85)` / `#f5f0ff` / `#fff`

### Behaviour

The robot has its own state, NOT a follower. Update loop runs at 60fps via `requestAnimationFrame`.

```
state:
  posX, posY            — current screen position
  velX, velY            — current velocity
  targetX, targetY      — current goal
  nextTargetAt          — timestamp when to pick a new goal
  blink, nextBlinkAt    — blink timer

every frame:
  1. if now > nextTargetAt → pick a new target:
       35% chance: somewhere within 180–400px of the cursor
       65% chance: a random point in the upper 70% of the viewport
       schedule next pick: 1800–4400ms + 1.2px-of-distance
  2. wobble target by Math.sin(t*0.0011)*22, Math.cos(t*0.0016)*18
  3. spring toward wobbled target: k=0.0035, d=0.965
  4. clamp speed to maxSpeed=3.2 px/frame
  5. tilt body by clamp(velX * 3.5, ±18 deg)
  6. eyes: shift pupils by (mouse-pos)/dist * min(3, dist/60)
  7. blink: 1 → 0 over ~6 frames; next blink in 3500–8000ms
  8. jet plume: scaleY = 0.6 + min(1.6, speed*0.9) + sine flicker
                opacity = 0.5 + min(0.5, speed*0.25)
```

The eyes always track the cursor regardless of body movement. The body wanders independently.

**Layering**: Robot is `zIndex: 0`. Panels are `zIndex: 1`. Top nav and bottom chrome are `zIndex: 50`. The robot reads as scenery, not UI.

## Interactions

- **Wheel/trackpad**: vertical OR horizontal delta → horizontal pan. `e.deltaY` preferred; falls back to `e.deltaX`. `passive: false` on the listener (calls `preventDefault`).
- **Touch**: vertical OR horizontal drag → horizontal pan, multiplied by 2.
- **Keyboard**: ←/→/↑/↓/PageUp/PageDown jump 0.7vw. Home/End jump to ends.
- **Top-nav links** (`Home` / `Work` / `Contact`): call `jumpTo(0|1|7)`. Active state when current panel matches.
- **Smoothing**: target → current via lerp factor 0.08 each frame. `Math.abs(target-current) < 0.5` snaps.
- **Re-measure on resize**: track `scrollWidth - innerWidth` is the max scroll.

## Fixed Chrome

### Top Nav
- `position: fixed`, `padding: 24px 40px`, `zIndex: 50`, `pointerEvents: none` on container (re-enabled on children)
- Background fade: `linear-gradient(180deg, rgba(8,6,13,0.85) 0%, rgba(8,6,13,0.0) 100%)`, `backdrop-filter: blur(2px)`
- **Left**: 18×18 logo SVG (violet bordered square + violet check mark) + wordmark `sidequest.nz` (".nz" in `#7c3aed`). Space Grotesk 16px weight 600.
- **Right**: three nav links — Plex Mono 11px, letter-spacing 0.18em, uppercase, color `#b8a8d4`, active `#c4b5fd`

### Bottom Strip
- `position: fixed`, `padding: 20px 40px`, `zIndex: 50`
- **Left**: panel counter `01 / 08  HOME` — Plex Mono 11px, current number `#c4b5fd`, label `#b8a8d4`
- **Center**: progress bar — 1px-tall track `rgba(196,181,253,0.15)` with overlay fill `#c4b5fd`, max-width 600px
- **Right**: `SCROLL  ↓ → ←` legend

## Design Tokens

Defined in `scroll-engine.jsx` as `COLORS`. Use these exact values.

```js
const COLORS = {
  bg:        '#08060d',   // page background, near-black with violet bias
  bg2:       '#100819',   // raised surfaces
  bg3:       '#1a0f2e',   // robot body, deeper recess
  ink:       '#f5f0ff',   // primary text
  ink2:      '#b8a8d4',   // secondary text
  ink3:      '#7a6a92',   // tertiary / muted text
  ink4:      '#3d3450',   // dividers, metadata bullets
  violet:    '#7c3aed',   // primary brand violet
  violetLt:  '#c4b5fd',   // light violet accent (italics, eyes, glow)
  violetGlow:'rgba(124,58,237,0.35)',
  line:      'rgba(196,181,253,0.10)',  // subtle dividers
  lineMid:   'rgba(196,181,253,0.20)',  // mid-emphasis dividers, photo borders
};
```

### Typography

```
Display:  Space Grotesk — Google Fonts, weights 400, 500, 600, 700
Mono:     IBM Plex Mono — Google Fonts, weights 400, 500, italic 400
```

Type scale used (all clamp-responsive):
- Hero H1: `clamp(72px, 9vw, 152px)` — line-height 0.92, letter-spacing -0.045em
- Project H2: `clamp(34px, 3.6–3.8vw, 62–64px)` — line-height 0.95, letter-spacing -0.04em
- See-more H2: `clamp(34px, 3.8vw, 64px)`
- Contact H2: `clamp(38px, 4vw, 70px)`
- Body large: 22px, line-height 1.45
- Body: 17–20px, line-height 1.5–1.6
- Mono micro: 10–12px, letter-spacing 0.15–0.22em, uppercase

All headlines use:
```css
font-family: "Space Grotesk", sans-serif;
font-weight: 500;
color: #f5f0ff;
text-shadow: 0 4px 40px rgba(0,0,0,0.6);
```

### Spacing

No formal scale — used directly: `12, 24, 28, 32, 36, 40, 60, 80px`. Padding on every panel: `0 80px` horizontally.

### Borders, Radius, Shadows

- **Border radius**: 0 on cards/buttons (deliberate, square corners reinforce the "magazine zine" feel). Robot body uses 9px. Photos have no rounded corners.
- **Photo shadow**: `0 60px 140px -40px rgba(0,0,0,0.7), 0 0 0 1px rgba(196,181,253,0.20)`
- **Robot glow**: from the violet stroke + blur on the jet plume only

## Assets

- **Logo (top nav)**: inline SVG — 18×18 violet bordered square with `#c4b5fd` check mark
- **Project photos** (currently Unsplash placeholders — replace):
  - 01 Maungatua: `unsplash.com/photo-1497486751825-1233686d5d80` (school corridor)
  - 02 Coast Pony: `unsplash.com/photo-1553284965-83fd3e82fa5a` (pony in field)
  - 03 Choristers: `unsplash.com/photo-1465847899084-d164df4dedc6` (choir performing)
  - 04 Joel: `unsplash.com/photo-1517292987719-0369a794ec0f` (designer at desk)
- **All other visuals** (mountains, sun, clouds, trees, ground, birds, robot, fake logos): inline SVG, no external assets

## Performance Notes

- All transforms go via `transform: translate3d()` and CSS-only writes — no React re-renders for scroll, world parallax, robot, or logo bob. Only `progress` and `activeIdx` are React state.
- `willChange: transform` on the track, robot wrapper, and parallax layers.
- Single `requestAnimationFrame` loop in `useHorizontalScroll`. Each parallax layer / logo / robot has its own RAF — fine for ~30 elements, but if porting watch for jank on low-end devices and consider consolidating into a single `tick()` if needed.

## Recommended Implementation Approach

1. **React + Vite + TypeScript** is the natural target. The prototype is already React, just inlined.
2. Promote `COLORS` and the type scale to a `tokens.ts` module (or Tailwind config).
3. Each panel becomes its own component file. `ProjectPanel` is a generic wrapper — keep it that way.
4. Move the world layers into a single `<World>` component with sub-components (`<FarMountains>`, `<MidHills>`, etc.). They're already self-contained.
5. `useHorizontalScroll`, `useParallax` port directly as custom hooks. They're the most reusable piece.
6. Replace the four Unsplash photos with the real ones.
7. Replace the ten fake logos with real client SVG marks.
8. **Mobile**: the prototype is desktop-only. For phones, render a vertical stacked layout instead — same panels, full-bleed, 100vh each. Keep the world background fixed but vertical-parallax. Hide the robot below ~900px width or shrink it. Drop the bottom counter.
9. **Accessibility**: respect `prefers-reduced-motion` — disable robot wandering, parallax (lock layers), and birds. Make wheel-to-horizontal optional via a settings toggle if it confuses users.
10. **SEO**: this is a portfolio site — server-render the panel content (Next.js or Astro) so crawlers see the headlines and copy.

## Files In This Bundle

- `Sidequest Horizontal Homepage.html` — entry HTML, mounts the React app
- `scroll-engine.jsx` — `useHorizontalScroll`, `useParallax`, `COLORS`
- `world.jsx` — `<World>` and all eight landscape sub-components
- `panels.jsx` — all seven panels + shared atoms (`Eyebrow`, `Tick`, `ProjectPanel`, `ProjectImage`, `BigLink`, `LogosPanel`, `ParallaxLogo`, `FakeLogo`)
- `robot.jsx` — `<CompanionRobot>`

Open `Sidequest Horizontal Homepage.html` directly in a browser to see the working reference.
