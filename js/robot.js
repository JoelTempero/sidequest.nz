/**
 * robot.js
 * Autonomous companion robot — ported from ref/design_handoff_homepage/robot.jsx.
 *
 * Usage:
 *   import { mountRobot } from './robot.js';
 *   const { destroy } = mountRobot(document.getElementById('robot'));
 *
 * The robot wanders the screen on its own schedule, tracks the cursor with its
 * eyes, tilts its body based on velocity, and flickers its jet plume when moving.
 * Layered at z-index 0 — behind panels (z-index 1) but above the world.
 */

// ─── Reduced-motion detection ─────────────────────────────────────────────────
const REDUCED_MOTION = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Register a RAF loop. Returns a cancel function. */
function trackedRaf(fn) {
  let id;
  const tick = () => { fn(); id = requestAnimationFrame(tick); };
  id = requestAnimationFrame(tick);
  return () => cancelAnimationFrame(id);
}

// ─── Palettes ─────────────────────────────────────────────────────────────────

/** Default violet palette — ported exactly from robot.jsx. */
const VIOLET = {
  primary:  '#7c3aed',  // strokes, nozzle stroke, mouth, fins/antenna stroke
  light:    '#c4b5fd',  // antenna tip, eyes, status light
  bodyFill: '#1a0f2e',  // body + fins fill
  nozzle:   '#3d3450',  // nozzle fill
  screen:   '#06040b',  // face panel
  jet:      'rgba(196,181,253,0.85)',
  jetMid:   '#f5f0ff',
  jetCore:  '#fff',
};

/** Blue palette — same value relationships, shifted to a cool blue hue. */
const BLUE = {
  primary:  '#2563eb',
  light:    '#93c5fd',
  bodyFill: '#0f1e3a',
  nozzle:   '#34405d',
  screen:   '#040810',
  jet:      'rgba(147,197,253,0.85)',
  jetMid:   '#eff6ff',
  jetCore:  '#fff',
};

// ─── SVG markup ───────────────────────────────────────────────────────────────

/**
 * Build the full robot SVG as an innerHTML string for a given palette.
 * Using innerHTML for the static SVG structure is cleaner than
 * createElementNS() for every node — only the animated parts need live refs
 * (obtained via querySelector after mount).
 *
 * Geometry ported exactly from robot.jsx; colours come from the palette.
 */
const buildRobotSvg = (p, mood = 'happy') => /* html */`
<svg viewBox="0 0 72 72" width="100%" height="100%" overflow="visible" aria-hidden="true">

  <!-- JET PLUME — anchored at the nozzle (36, 54) in SVG space -->
  <!-- transformOrigin set inline because Safari needs it on the element -->
  <g id="rbt-jet" style="transform-origin: 36px 54px;">
    <ellipse cx="36" cy="68" rx="6" ry="14" fill="${p.jet}"/>
    <ellipse cx="36" cy="66" rx="3.5" ry="9" fill="${p.jetMid}"/>
    <ellipse cx="36" cy="64" rx="1.6" ry="5" fill="${p.jetCore}"/>
  </g>

  <!-- JET NOZZLE — small trapezoid attached to body bottom -->
  <path d="M30 52 L42 52 L40 56 L32 56 Z" fill="${p.nozzle}" stroke="${p.primary}" stroke-width="1"/>

  <!-- BODY — rounded square -->
  <rect x="14" y="14" width="44" height="40" rx="9" ry="9"
        fill="${p.bodyFill}" stroke="${p.primary}" stroke-width="1.5"/>

  <!-- TOP ANTENNA -->
  <line x1="36" y1="14" x2="36" y2="6" stroke="${p.primary}" stroke-width="1.5"/>
  <circle cx="36" cy="5" r="2.2" fill="${p.light}"/>

  <!-- SCREEN / FACE PANEL -->
  <rect x="20" y="22" width="32" height="22" rx="4" ry="4" fill="${p.screen}"/>

  <!-- EYES -->
  <!-- Left eye: transform-origin at the eye centre (28, 33) -->
  <g id="rbt-eye-l" style="transform-origin: 28px 33px; transform-box: fill-box;">
    <circle cx="28" cy="33" r="3.2" fill="${p.light}"/>
  </g>
  <!-- Right eye: transform-origin at the eye centre (44, 33) -->
  <g id="rbt-eye-r" style="transform-origin: 44px 33px; transform-box: fill-box;">
    <circle cx="44" cy="33" r="3.2" fill="${p.light}"/>
  </g>

  ${mood === 'sad' ? `
  <!-- WORRIED EYEBROWS — inner ends raised -->
  <line x1="24" y1="29" x2="32" y2="26.5" stroke="${p.primary}" stroke-width="1.2" stroke-linecap="round"/>
  <line x1="48" y1="29" x2="40" y2="26.5" stroke="${p.primary}" stroke-width="1.2" stroke-linecap="round"/>` : ''}

  <!-- MOUTH — smile (happy) or frown (sad) -->
  <path d="${mood === 'sad' ? 'M30 41 Q36 37 42 41' : 'M30 39 Q36 42 42 39'}"
        stroke="${p.primary}" stroke-width="1.2" fill="none" stroke-linecap="round"/>

  <!-- SIDE FINS -->
  <path d="M14 30 L8 28 L8 36 L14 38 Z" fill="${p.bodyFill}" stroke="${p.primary}" stroke-width="1.2"/>
  <path d="M58 30 L64 28 L64 36 L58 38 Z" fill="${p.bodyFill}" stroke="${p.primary}" stroke-width="1.2"/>

  <!-- TINY STATUS LIGHT — pulsing via CSS animation -->
  <circle id="rbt-status" cx="50" cy="48" r="1.4" fill="${p.light}">
    <animate attributeName="opacity" values="1;0.3;1" dur="1.6s" repeatCount="indefinite"/>
  </circle>

</svg>
`;

export const ROBOT_PALETTES = { violet: VIOLET, blue: BLUE };

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Mount the companion robot into rootEl.
 *
 * @param {HTMLElement} rootEl - Container element (e.g. <div id="robot">).
 * @returns {{ destroy: () => void }} Teardown handle.
 */
export function mountRobot(rootEl, { scale = 1, palette = VIOLET, mood = 'happy' } = {}) {
  const SIZE = 72 * scale;
  const HALF = SIZE / 2;

  // ── Style the host container ──────────────────────────────────────────────
  rootEl.style.cssText = `
    position: absolute;
    inset: 0;
    z-index: 0;
    pointer-events: none;
  `;

  // ── Outer wrapper: positioned via translate3d each frame ──────────────────
  // Matches robot.jsx's wrapRef div (position: fixed, top: 0, left: 0)
  const wrap = document.createElement('div');
  wrap.setAttribute('aria-hidden', 'true');
  wrap.style.cssText = `
    position: absolute;
    top: 0;
    left: 0;
    width: ${SIZE}px;
    height: ${SIZE}px;
    pointer-events: none;
    will-change: transform;
  `;
  rootEl.appendChild(wrap);

  // ── Inner body div: receives tilt rotation ────────────────────────────────
  // Matches robot.jsx's bodyRef div (transformOrigin: 50% 50%)
  const body = document.createElement('div');
  body.style.cssText = `
    width: 100%;
    height: 100%;
    transform-origin: 50% 50%;
    will-change: transform;
  `;
  body.innerHTML = buildRobotSvg(palette, mood);
  wrap.appendChild(body);

  // ── Grab refs to animated elements ───────────────────────────────────────
  const eyeL  = body.querySelector('#rbt-eye-l');
  const eyeR  = body.querySelector('#rbt-eye-r');
  const jet   = body.querySelector('#rbt-jet');

  // ── State ─────────────────────────────────────────────────────────────────
  let mouseX = window.innerWidth * 0.5;
  let mouseY = window.innerHeight * 0.5;

  let posX  = window.innerWidth  * 0.75;
  let posY  = window.innerHeight * 0.35;
  let velX  = 0;
  let velY  = 0;
  let targetX = posX;
  let targetY = posY;

  let nextTargetAt = performance.now() + 1500;

  // Blink state: blink is a 0→1 impulse that decays at 0.18/frame.
  // 1 = eyes fully closed, 0 = eyes open.
  let blink = 0;
  let nextBlinkAt = performance.now() + 3500 + Math.random() * 4000;

  // ── Target picker ─────────────────────────────────────────────────────────
  function pickNewTarget() {
    const W = window.innerWidth;
    const H = window.innerHeight;

    // 35% chance: somewhere within 180–400px of the cursor
    // 65% chance: random point in the upper 70% of the viewport
    const investigate = Math.random() < 0.35;
    if (investigate) {
      const r = 180 + Math.random() * 220;  // 180–400px radius
      const a = Math.random() * Math.PI * 2;
      targetX = Math.max(80, Math.min(W - 80, mouseX + Math.cos(a) * r));
      targetY = Math.max(80, Math.min(H - 140, mouseY + Math.sin(a) * r));
    } else {
      targetX = 100 + Math.random() * (W - 200);
      // bias toward upper 70% so it doesn't bury itself in the ground
      targetY = 80 + Math.random() * (H * 0.65);
    }

    // Longer dwell when target is far away, shorter when close
    const dist = Math.hypot(targetX - posX, targetY - posY);
    nextTargetAt = performance.now() + 1800 + Math.random() * 2600 + dist * 1.2;
  }

  // ── Mouse listener ────────────────────────────────────────────────────────
  const onMove = (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
  };
  window.addEventListener('mousemove', onMove);

  // ── Reduced-motion: render once at initial position, skip all animation ───
  if (REDUCED_MOTION) {
    wrap.style.transform = `translate3d(${posX - HALF}px, ${posY - HALF}px, 0)`;
    // Disable SVG <animate> pulsing status light
    const animateEl = body.querySelector('#rbt-status animate');
    if (animateEl) animateEl.setAttribute('dur', '0s');
    return {
      destroy() {
        window.removeEventListener('mousemove', onMove);
        rootEl.innerHTML = '';
      },
    };
  }

  // ── RAF tick ──────────────────────────────────────────────────────────────
  const cancelLoop = trackedRaf(() => {
    const now = performance.now();

    // 1. Pick a new target if it's time
    if (now > nextTargetAt) pickNewTarget();

    // 2. Wobble the target so even at rest the robot bobs gently
    const wobbleX = Math.sin(now * 0.0011) * 22;
    const wobbleY = Math.cos(now * 0.0016) * 18;
    const tX = targetX + wobbleX;
    const tY = targetY + wobbleY;

    // 3. Spring physics toward wobbled target (k=0.0035, d=0.965)
    const k = 0.0035;
    const d = 0.965;
    const ax = (tX - posX) * k;
    const ay = (tY - posY) * k;
    velX = (velX + ax) * d;
    velY = (velY + ay) * d;

    // 4. Clamp speed to 3.2 px/frame
    const maxSpeed = 3.2;
    const sp = Math.hypot(velX, velY);
    if (sp > maxSpeed) {
      velX = (velX / sp) * maxSpeed;
      velY = (velY / sp) * maxSpeed;
    }
    posX += velX;
    posY += velY;

    // 5. Body tilt — clamp(velX * 3.5, -18, 18) degrees
    const tilt = Math.max(-18, Math.min(18, velX * 3.5));

    // 6. Eye tracking — pupils shift toward cursor (max 3px)
    const dx   = mouseX - posX;
    const dy   = mouseY - posY;
    const dist = Math.hypot(dx, dy) || 1;
    const eyeShift = Math.min(3, dist / 60);
    const ex = (dx / dist) * eyeShift;
    const ey = (dy / dist) * eyeShift;

    // 7. Blink — impulse at nextBlinkAt, decays 0.18/frame
    if (now > nextBlinkAt) {
      blink = 1;
      nextBlinkAt = now + 3500 + Math.random() * 4500;
    }
    blink = Math.max(0, blink - 0.18);
    // When blink > 0.5: eyes slammed shut (scaleY 0.05); otherwise partially open
    const blinkScaleY = blink > 0.5 ? 0.05 : (1 - blink * 0.4);

    // 8. Jet plume scaling
    const speed = Math.hypot(velX, velY);
    const jetScaleY = 0.6 + Math.min(1.6, speed * 0.9) + Math.sin(now * 0.04) * 0.12;
    const jetScaleX = 0.85 + Math.sin(now * 0.06) * 0.15;
    const jetOpacity = 0.5 + Math.min(0.5, speed * 0.25);

    // ── Write transforms ──────────────────────────────────────────────────
    // Outer wrapper: translate so the robot is centred at (posX, posY)
    // We subtract HALF so posX/posY is the robot's centre, not its top-left.
    wrap.style.transform = `translate3d(${posX - HALF}px, ${posY - HALF}px, 0)`;

    // Body div: tilt rotation
    body.style.transform = `rotate(${tilt}deg)`;

    // Eyes: translate + blink scale
    // setAttribute for SVG elements (style transform may not propagate in all browsers)
    eyeL.setAttribute('transform', `translate(${ex} ${ey}) scale(1 ${blinkScaleY})`);
    eyeR.setAttribute('transform', `translate(${ex} ${ey}) scale(1 ${blinkScaleY})`);

    // Jet plume: scale + opacity
    jet.style.transform = `scaleY(${jetScaleY}) scaleX(${jetScaleX})`;
    jet.style.opacity   = jetOpacity;
  });

  // ── Teardown ──────────────────────────────────────────────────────────────
  return {
    destroy() {
      cancelLoop();
      window.removeEventListener('mousemove', onMove);
      rootEl.innerHTML = '';
    },
  };
}
