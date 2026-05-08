/**
 * sky.js
 * Dusk-stars environment for the sky (contact) panel.
 * Mostly static — the sky page doesn't scroll — but with subtle motion:
 * per-star twinkle at varied frequencies, slow horizontal cloud drift.
 *
 * Usage:
 *   mountSky(rootEl)
 *   – rootEl : DOM element to render into (will be styled position:fixed)
 *   Returns { destroy } — call destroy() to cancel all RAF loops.
 */

// ─── Reduced-motion detection ─────────────────────────────────────────────────
const REDUCED_MOTION = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Create an SVG element with correct namespace. */
function svg(attrs, cssText) {
  const s = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  if (attrs) {
    for (const [k, v] of Object.entries(attrs)) s.setAttribute(k, v);
  }
  if (cssText) s.style.cssText = cssText;
  return s;
}

/** Create an SVG child element (rect, path, circle, etc.) with correct namespace. */
function svgEl(tag, attrs) {
  const e = document.createElementNS('http://www.w3.org/2000/svg', tag);
  if (attrs) {
    for (const [k, v] of Object.entries(attrs)) e.setAttribute(k, v);
  }
  return e;
}

/** Create an HTML div (not SVG). */
function div(cssText) {
  const d = document.createElement('div');
  if (cssText) d.style.cssText = cssText;
  return d;
}

/**
 * Register a repeating RAF callback. Returns a cancel function.
 */
function raf(fn) {
  let id;
  const tick = () => { fn(); id = requestAnimationFrame(tick); };
  id = requestAnimationFrame(tick);
  return () => cancelAnimationFrame(id);
}

/**
 * Like raf(), but skips RAF entirely when REDUCED_MOTION is true.
 * Instead, calls fn() once so the layer renders at its initial (static) state.
 * Returns a no-op cancel function.
 */
function rafOrStatic(fn) {
  if (REDUCED_MOTION) {
    fn(); // render once at rest position
    return () => {};
  }
  return raf(fn);
}

// ─── Layer builders ───────────────────────────────────────────────────────────

/**
 * SKY GRADIENT — static vertical gradient, full viewport.
 * Cosmic darkening upward: bottom matches homepage atmospheric top (continuity
 * at the seam), then progressively darkens toward the top (deeper into cosmos).
 * The brightness comes from the aurora and stars, not the background.
 * #02010a → #04030a → #06040b → #08060d (top to bottom).
 */
function makeSkyGradient(rootEl) {
  const layer = div(`
    position: absolute; top: 0; left: 0;
    width: 100%; height: 100%;
    background: linear-gradient(180deg,
      #02010a 0%,
      #04030a 35%,
      #06040b 70%,
      #08060d 100%);
  `);
  rootEl.appendChild(layer);
}

/**
 * STARS — PNG of 60 static stars in top 70% of viewport.
 * Twinkle dropped in favour of static PNG. For future twinkle, animate
 * the whole image opacity with a CSS keyframe. For now, static is fine.
 */
function makeStars(rootEl) {
  const wrapper = div(`
    position: absolute; top: 0; left: 0;
    width: 100%; height: 70%;
    pointer-events: none;
  `);
  rootEl.appendChild(wrapper);

  const img = document.createElement('img');
  img.src = 'images/sky/stars.png';
  img.alt = '';
  img.style.cssText = `
    position: absolute;
    top: 0; left: 0;
    width: 100%; height: 100%;
    object-fit: fill;
    image-rendering: pixelated;
    image-rendering: -moz-crisp-edges;
    image-rendering: crisp-edges;
    pointer-events: none;
    user-select: none;
  `;
  wrapper.appendChild(img);
  // Static — no RAF needed.
}

/**
 * AURORA RIBBON — PNG of two layered violet curtains in upper third.
 */
function makeAurora(rootEl) {
  const wrapper = div(`
    position: absolute; top: 0; left: 0;
    width: 100%; height: 100%;
    pointer-events: none;
  `);
  rootEl.appendChild(wrapper);

  const img = document.createElement('img');
  img.src = 'images/sky/aurora.png';
  img.alt = '';
  img.style.cssText = `
    position: absolute;
    top: 0; left: 0;
    width: 100%; height: 100%;
    object-fit: fill;
    image-rendering: pixelated;
    image-rendering: -moz-crisp-edges;
    image-rendering: crisp-edges;
    pointer-events: none;
    user-select: none;
  `;
  wrapper.appendChild(img);
}

/**
 * CLOUD DRIFT — 3 PNG cloud images drifting horizontally.
 * Each cloud is its own <img> element with independent speed.
 * Reduced motion: clouds frozen at initial position.
 */
function makeCloudDrift(rootEl, trackedRaf) {
  const vwBase = window.innerWidth;
  const cloudData = [
    { yPct: 74, width: 280, height: 48, speedMult: 1.0,  offset: 0,           src: 'images/sky/cloud-0.png' },
    { yPct: 78, width: 210, height: 38, speedMult: 0.72, offset: vwBase / 3,  src: 'images/sky/cloud-1.png' },
    { yPct: 71, width: 360, height: 56, speedMult: 0.55, offset: 2 * vwBase / 3, src: 'images/sky/cloud-2.png' },
  ];

  const containers = cloudData.map((cloud) => {
    const container = div(`
      position: absolute;
      top: ${cloud.yPct}%;
      left: 0;
      width: ${cloud.width}px;
      height: ${cloud.height}px;
      will-change: transform;
      pointer-events: none;
    `);
    rootEl.appendChild(container);

    const img = document.createElement('img');
    img.src = cloud.src;
    img.alt = '';
    img.style.cssText = `
      display: block;
      width: ${cloud.width}px;
      height: ${cloud.height}px;
      image-rendering: pixelated;
      image-rendering: -moz-crisp-edges;
      image-rendering: crisp-edges;
      pointer-events: none;
      user-select: none;
    `;
    container.appendChild(img);

    return container;
  });

  if (!REDUCED_MOTION) {
    trackedRaf(() => {
      const now = performance.now();
      const vw = window.innerWidth + 200;
      cloudData.forEach((cloud, i) => {
        const x = ((now * 0.02 * cloud.speedMult) + cloud.offset) % vw - 100;
        containers[i].style.transform = `translate3d(${x}px, 0, 0)`;
      });
    });
  }
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Mount the sky environment into rootEl.
 *
 * @param {HTMLElement} rootEl - Container element to render into.
 * @returns {{ destroy: () => void }} Teardown handle — call destroy() to cancel all RAF loops.
 */
export function mountSky(rootEl) {
  // Container styling
  rootEl.style.cssText = `
    position: absolute;
    inset: 0;
    pointer-events: none;
    z-index: 0;
    overflow: hidden;
  `;

  // Tracked RAF — collects cancel functions so destroy() can stop all loops.
  // Under reduced motion, rafOrStatic calls fn() once and skips the loop.
  const cancels = [];
  const trackedRaf = (fn) => { cancels.push(rafOrStatic(fn)); };

  // Build layers in back-to-front order
  makeSkyGradient(rootEl);
  makeStars(rootEl);      // static PNG — no RAF needed
  makeAurora(rootEl);
  makeCloudDrift(rootEl, trackedRaf);

  return {
    destroy() {
      cancels.forEach(c => c());
      cancels.length = 0;
    },
  };
}
