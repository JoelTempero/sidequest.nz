/**
 * world.js
 * Parallax landscape background — ported from ref/design_handoff_homepage/world.jsx.
 * Builds eight depth layers as DOM nodes (SVG + divs) and runs each layer's own
 * RAF tick driven by scrollRef.current (horizontal) or window.scrollY (vertical).
 *
 * Usage:
 *   mountWorld(rootEl, { scrollRef, totalWidth, mode })
 *   – rootEl      : DOM element to render into (will be styled position:fixed)
 *   – scrollRef   : { current: number } ref from initScrollEngine
 *   – totalWidth  : total horizontal track width in px (world layers = max(totalWidth, 12000))
 *   – mode        : 'horizontal' (default) | 'vertical'
 */

// ─── Reduced-motion detection ─────────────────────────────────────────────────
const REDUCED_MOTION = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Create an HTML div (not SVG). */
function div(cssText) {
  const d = document.createElement('div');
  if (cssText) d.style.cssText = cssText;
  return d;
}

/** Create an SVG element with correct namespace. */
function svg(attrs, cssText) {
  const s = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  if (attrs) {
    for (const [k, v] of Object.entries(attrs)) s.setAttribute(k, v);
  }
  if (cssText) s.style.cssText = cssText;
  return s;
}

/** Create an SVG child element (rect, path, etc.) with correct namespace. */
function svgEl(tag, attrs) {
  const e = document.createElementNS('http://www.w3.org/2000/svg', tag);
  if (attrs) {
    for (const [k, v] of Object.entries(attrs)) e.setAttribute(k, v);
  }
  return e;
}

/**
 * Register a repeating RAF callback.
 * Returns a cancel function (for teardown if needed).
 */
function raf(fn) {
  let id;
  const tick = () => { fn(); id = requestAnimationFrame(tick); };
  id = requestAnimationFrame(tick);
  return () => cancelAnimationFrame(id);
}

/**
 * Like raf(), but skips RAF entirely when REDUCED_MOTION is true.
 * Instead, calls fn() once so the layer renders at its initial (zero-scroll) position.
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
 * SKY — vertical gradient, factor 0.02.
 * Almost static — just the dark purple gradient.
 */
function makeSky(rootEl, { scrollRef, W, mode, trackedRaf }) {
  const layer = div(`
    position: absolute; top: 0; left: 0;
    width: ${W}px; height: 100%;
    will-change: transform;
    background: linear-gradient(180deg,
      #06040b 0%,
      #0d081a 25%,
      #1a0f2e 55%,
      #2d1654 78%,
      #4a2378 92%,
      #5d2a8e 100%);
  `);
  rootEl.appendChild(layer);

  const factor = 0.02;
  trackedRaf(() => {
    const x = mode === 'vertical' ? window.scrollY : (scrollRef.current || 0);
    layer.style.transform = mode === 'vertical'
      ? `translate3d(0, ${-x * factor}px, 0)`
      : `translate3d(${-x * factor}px, 0, 0)`;
  });
}

/**
 * SUN — soft violet glow disc PNG, factor 0.06.
 * PNG repeated every 1800px via multiple <img> elements so one is always visible.
 */
function makeSun(rootEl, { scrollRef, W, mode, trackedRaf }) {
  const layer = div(`
    position: absolute; top: 0; left: 0;
    width: ${W}px; height: 100%;
    will-change: transform;
  `);
  rootEl.appendChild(layer);

  const count = Math.ceil(W / 1800) + 1;
  for (let i = 0; i < count; i++) {
    const img = document.createElement('img');
    img.src = 'images/world/sun.png';
    img.alt = '';
    img.style.cssText = `
      position: absolute;
      left: ${600 + i * 1800}px;
      bottom: 34%;
      width: 280px; height: 280px;
      image-rendering: pixelated;
      image-rendering: -moz-crisp-edges;
      image-rendering: crisp-edges;
      pointer-events: none;
      user-select: none;
    `;
    layer.appendChild(img);
  }

  const factor = 0.06;
  trackedRaf(() => {
    const x = mode === 'vertical' ? window.scrollY : (scrollRef.current || 0);
    layer.style.transform = mode === 'vertical'
      ? `translate3d(0, ${-x * factor}px, 0)`
      : `translate3d(${-x * factor}px, 0, 0)`;
  });
}

/**
 * STARS — PNG of 80 deterministic stars in top 40% of viewport.
 * Static, no RAF, no parallax.
 */
function makeStars(rootEl) {
  const wrapper = div(`
    position: absolute; top: 0; left: 0;
    width: 100%; height: 40%;
    pointer-events: none;
  `);
  rootEl.appendChild(wrapper);

  const img = document.createElement('img');
  img.src = 'images/world/stars.png';
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
 * FAR MOUNTAINS — image-based layer, factor 0.18.
 *
 * The mountain shape lives in `images/world/far-mountains.svg` (or .png
 * when pixel art is dropped in). The image stretches to fill the parallax
 * track via `object-fit: fill`. `image-rendering: pixelated` keeps pixel
 * edges crisp once a raster image replaces the SVG.
 *
 * To swap in your own art: replace the file at images/world/far-mountains.*
 * (keep the filename, or update the src below).
 */
function makeFarMountains(rootEl, { scrollRef, W, mode, trackedRaf }) {
  const layer = div(`
    position: absolute; top: 0; left: 0;
    width: ${W}px; height: 100%;
    will-change: transform;
  `);
  rootEl.appendChild(layer);

  const img = document.createElement('img');
  img.src = 'images/world/far-mountains.png';
  img.alt = '';
  img.style.cssText = `
    position: absolute;
    bottom: 0; left: 0;
    width: 100%; height: 100%;
    object-fit: fill;
    image-rendering: pixelated;
    image-rendering: -moz-crisp-edges;
    image-rendering: crisp-edges;
    pointer-events: none;
    user-select: none;
  `;
  layer.appendChild(img);

  const factor = 0.18;
  trackedRaf(() => {
    const x = mode === 'vertical' ? window.scrollY : (scrollRef.current || 0);
    layer.style.transform = mode === 'vertical'
      ? `translate3d(0, ${-x * factor}px, 0)`
      : `translate3d(${-x * factor}px, 0, 0)`;
  });
}

/**
 * CLOUDS — PNG of cloud puffs in sky band, factor 0.30.
 */
function makeClouds(rootEl, { scrollRef, W, mode, trackedRaf }) {
  const layer = div(`
    position: absolute; top: 0; left: 0;
    width: ${W}px; height: 100%;
    will-change: transform;
  `);
  rootEl.appendChild(layer);

  const img = document.createElement('img');
  img.src = 'images/world/clouds.png';
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
  layer.appendChild(img);

  const factor = 0.30;
  trackedRaf(() => {
    const x = mode === 'vertical' ? window.scrollY : (scrollRef.current || 0);
    layer.style.transform = mode === 'vertical'
      ? `translate3d(0, ${-x * factor}px, 0)`
      : `translate3d(${-x * factor}px, 0, 0)`;
  });
}

/**
 * MID HILLS — PNG of closer mountain range, factor 0.45.
 */
function makeMidHills(rootEl, { scrollRef, W, mode, trackedRaf }) {
  const layer = div(`
    position: absolute; top: 0; left: 0;
    width: ${W}px; height: 100%;
    will-change: transform;
  `);
  rootEl.appendChild(layer);

  const img = document.createElement('img');
  img.src = 'images/world/mid-hills.png';
  img.alt = '';
  img.style.cssText = `
    position: absolute;
    bottom: 0; left: 0;
    width: 100%; height: 100%;
    object-fit: fill;
    image-rendering: pixelated;
    image-rendering: -moz-crisp-edges;
    image-rendering: crisp-edges;
    pointer-events: none;
    user-select: none;
  `;
  layer.appendChild(img);

  const factor = 0.45;
  trackedRaf(() => {
    const x = mode === 'vertical' ? window.scrollY : (scrollRef.current || 0);
    layer.style.transform = mode === 'vertical'
      ? `translate3d(0, ${-x * factor}px, 0)`
      : `translate3d(${-x * factor}px, 0, 0)`;
  });
}

/**
 * TREES — PNG of sparse tree silhouettes, factor 0.65.
 */
function makeTrees(rootEl, { scrollRef, W, mode, trackedRaf }) {
  const layer = div(`
    position: absolute; top: 0; left: 0;
    width: ${W}px; height: 100%;
    will-change: transform;
  `);
  rootEl.appendChild(layer);

  const img = document.createElement('img');
  img.src = 'images/world/trees.png';
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
  layer.appendChild(img);

  const factor = 0.65;
  trackedRaf(() => {
    const x = mode === 'vertical' ? window.scrollY : (scrollRef.current || 0);
    layer.style.transform = mode === 'vertical'
      ? `translate3d(0, ${-x * factor}px, 0)`
      : `translate3d(${-x * factor}px, 0, 0)`;
  });
}

/**
 * GROUND — PNG of earth band with accent line and grass tufts.
 * Factor 0.85.
 */
function makeGround(rootEl, { scrollRef, W, mode, trackedRaf }) {
  const layer = div(`
    position: absolute; top: 0; left: 0;
    width: ${W}px; height: 100%;
    will-change: transform;
  `);
  rootEl.appendChild(layer);

  const img = document.createElement('img');
  img.src = 'images/world/ground.png';
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
  layer.appendChild(img);

  const factor = 0.85;
  trackedRaf(() => {
    const x = mode === 'vertical' ? window.scrollY : (scrollRef.current || 0);
    layer.style.transform = mode === 'vertical'
      ? `translate3d(0, ${-x * factor}px, 0)`
      : `translate3d(${-x * factor}px, 0, 0)`;
  });
}

/**
 * BIRDS — PNG sprite of M-shape flock, factor 0.25 + independent drift.
 * Drift: performance.now() * 0.04 % 2400 so they keep moving even at rest.
 * Combined into a single translate3d: -(scroll * 0.25) + drift.
 */
function makeBirds(rootEl, { scrollRef, mode, trackedRaf }) {
  const wrapper = div(`
    position: absolute; top: 18%; left: 0;
    width: 120px; height: 40px;
    will-change: transform;
  `);
  rootEl.appendChild(wrapper);

  const img = document.createElement('img');
  img.src = 'images/world/birds.png';
  img.alt = '';
  img.style.cssText = `
    display: block;
    width: 120px; height: 40px;
    image-rendering: pixelated;
    image-rendering: -moz-crisp-edges;
    image-rendering: crisp-edges;
    pointer-events: none;
    user-select: none;
  `;
  wrapper.appendChild(img);

  const factor = 0.25;
  trackedRaf(() => {
    const scroll = mode === 'vertical' ? window.scrollY : (scrollRef.current || 0);
    // Under reduced motion, REDUCED_MOTION is true so this RAF never fires again
    // after the initial static render — drift is 0 so birds are frozen.
    const drift = REDUCED_MOTION ? 0 : (performance.now() * 0.04) % 2400;
    wrapper.style.transform = mode === 'vertical'
      ? `translate3d(${drift}px, ${-scroll * factor}px, 0)`
      : `translate3d(${-(scroll * factor) + drift}px, 0, 0)`;
  });
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Mount the parallax world into rootEl.
 *
 * @param {HTMLElement} rootEl - Container element (e.g. <div id="world">).
 * @param {{ scrollRef: { current: number }, totalWidth: number, mode?: 'horizontal'|'vertical' }} opts
 * @returns {{ destroy: () => void }} Teardown handle — call destroy() to cancel all RAF loops.
 */
export function mountWorld(rootEl, { scrollRef, totalWidth, mode = 'horizontal' }) {
  // Container styling
  rootEl.style.cssText = `
    position: absolute;
    inset: 0;
    pointer-events: none;
    z-index: 0;
    overflow: hidden;
  `;

  // World layers are wider than the track for parallax breathing room
  const W = Math.max(totalWidth, 12000);

  // Unique suffix for gradient IDs — prevents collisions if mountWorld is called twice.
  const uid = Math.random().toString(36).slice(2, 8);

  // Tracked RAF — collects cancel functions so destroy() can stop all loops.
  // Under reduced motion, rafOrStatic calls fn() once and skips the loop.
  const cancels = [];
  const trackedRaf = (fn) => { cancels.push(rafOrStatic(fn)); };

  const ctx = { scrollRef, W, mode, uid, trackedRaf };

  // Build layers in back-to-front order
  makeSky(rootEl, ctx);
  makeSun(rootEl, ctx);
  makeStars(rootEl);          // static — no scrollRef needed
  makeFarMountains(rootEl, ctx);
  makeClouds(rootEl, ctx);
  makeMidHills(rootEl, ctx);
  makeTrees(rootEl, ctx);
  makeGround(rootEl, ctx);
  makeBirds(rootEl, { scrollRef, mode, trackedRaf }); // width-independent

  return {
    destroy() { cancels.forEach(c => c()); cancels.length = 0; },
  };
}
