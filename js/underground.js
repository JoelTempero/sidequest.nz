/**
 * underground.js
 * Vertical-parallax archaeological backdrop for the work page.
 * Each layer reads window.scrollY each frame and applies
 * translate3d(0, -scrollY * factor, 0). Theme: dig site under dim violet light.
 *
 * Usage:
 *   mountUnderground(rootEl, opts?)
 *   – rootEl : DOM element to render into (will be styled position:fixed)
 *   Returns { destroy } — call destroy() to cancel all RAF loops.
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

/** Create an SVG child element (rect, path, circle, etc.) with correct namespace. */
function svgEl(tag, attrs) {
  const e = document.createElementNS('http://www.w3.org/2000/svg', tag);
  if (attrs) {
    for (const [k, v] of Object.entries(attrs)) e.setAttribute(k, v);
  }
  return e;
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
 * CAVE DEPTH — vertical gradient base, factor 0.05.
 * Almost-still. Deepens as user scrolls down.
 * Sized to H (max of 6× viewport height, 6000px).
 */
function makeCaveDepth(rootEl, { H, trackedRaf, getScrollY }) {
  const layer = div(`
    position: absolute; top: 0; left: 0;
    width: 100%; height: ${H}px;
    will-change: transform;
    background: linear-gradient(180deg,
      #06040b 0%,
      #0a0612 50%,
      #0d0814 100%);
  `);
  rootEl.appendChild(layer);

  const factor = 0.05;
  trackedRaf(() => {
    layer.style.transform = `translate3d(0, ${-getScrollY() * factor}px, 0)`;
  });
}

/**
 * DISTANT LANTERN POINTS — PNG of 30 lantern circles, factor 0.15.
 */
function makeLanternPoints(rootEl, { H, trackedRaf, getScrollY }) {
  const layer = div(`
    position: absolute; top: 0; left: 0;
    width: 100%; height: ${H}px;
    will-change: transform;
  `);
  rootEl.appendChild(layer);

  const img = document.createElement('img');
  img.src = 'images/underground/lantern-points.png';
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

  const factor = 0.15;
  trackedRaf(() => {
    layer.style.transform = `translate3d(0, ${-getScrollY() * factor}px, 0)`;
  });
}

/**
 * CRACKS — PNG of organic Bezier fissures in rock face.
 * Subtle parallax (factor 0.40).
 */
function makeCracks(rootEl, { H, trackedRaf, getScrollY }) {
  const layer = div(`
    position: absolute; top: 0; left: 0;
    width: 100%; height: ${H}px;
    will-change: transform;
  `);
  rootEl.appendChild(layer);

  const img = document.createElement('img');
  img.src = 'images/underground/cracks.png';
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

  const factor = 0.40;
  trackedRaf(() => {
    layer.style.transform = `translate3d(0, ${-getScrollY() * factor}px, 0)`;
  });
}

/**
 * ROCK NOISE — PNG of subtle scattered grain specs on cave wall.
 * Parallax factor 0.55.
 */
function makeRockNoise(rootEl, { H, trackedRaf, getScrollY }) {
  const layer = div(`
    position: absolute; top: 0; left: 0;
    width: 100%; height: ${H}px;
    will-change: transform;
  `);
  rootEl.appendChild(layer);

  const img = document.createElement('img');
  img.src = 'images/underground/rock-noise.png';
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

  const factor = 0.55;
  trackedRaf(() => {
    layer.style.transform = `translate3d(0, ${-getScrollY() * factor}px, 0)`;
  });
}

/**
 * FOSSIL SILHOUETTES — PNG of 6 decorative fossil shapes, factor 0.65.
 */
function makeFossils(rootEl, { H, trackedRaf, getScrollY }) {
  const layer = div(`
    position: absolute; top: 0; left: 0;
    width: 100%; height: ${H}px;
    will-change: transform;
  `);
  rootEl.appendChild(layer);

  const img = document.createElement('img');
  img.src = 'images/underground/fossils.png';
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
    layer.style.transform = `translate3d(0, ${-getScrollY() * factor}px, 0)`;
  });
}

/**
 * FOREGROUND ROCK — dark vertical gradient overlay on left and right edges, factor 0.85.
 * Suggests close walls. Each side ~80px wide, full height.
 */
function makeForegroundRock(rootEl, { H, trackedRaf, getScrollY }) {
  const layer = div(`
    position: absolute; top: 0; left: 0;
    width: 100%; height: ${H}px;
    will-change: transform;
    pointer-events: none;
  `);
  rootEl.appendChild(layer);

  // Left wall edge
  const leftEdge = div(`
    position: absolute;
    top: 0; left: 0;
    width: 80px; height: 100%;
    background: linear-gradient(to right, #06040b 0%, transparent 100%);
  `);
  layer.appendChild(leftEdge);

  // Right wall edge
  const rightEdge = div(`
    position: absolute;
    top: 0; right: 0;
    width: 80px; height: 100%;
    background: linear-gradient(to left, #06040b 0%, transparent 100%);
  `);
  layer.appendChild(rightEdge);

  const factor = 0.85;
  trackedRaf(() => {
    layer.style.transform = `translate3d(0, ${-getScrollY() * factor}px, 0)`;
  });
}

/**
 * DUST MOTES — 20 small circles, factor 0.10 + drift.
 * Mix of violet rgba(196,181,253,0.4) and warm rgba(251,184,107,0.3) for variety.
 * Radius 1.5, opacity 0.25-0.5.
 * Drift UPWARD via performance.now() * 0.02 % 200, independent of scroll.
 * Combined: translate3d(0, -scrollY * 0.10 - drift, 0).
 */
function makeDustMotes(rootEl, { H, trackedRaf, getScrollY }) {
  const layer = div(`
    position: absolute; top: 0; left: 0;
    width: 100%; height: ${H}px;
    will-change: transform;
  `);
  rootEl.appendChild(layer);

  const s = svg(
    { width: '100%', height: H, preserveAspectRatio: 'none' },
    'display: block; position: absolute; top: 0; left: 0;',
  );
  layer.appendChild(s);

  for (let i = 0; i < 20; i++) {
    const cx = (i * 137) % 100;
    const cyPct = (i * 71) % 100;
    const cy = cyPct / 100 * H;
    const opacity = 0.25 + ((i * 53) % 100) / 100 * 0.25; // 0.25-0.50
    // Alternate violet and warm amber dust
    const fill = i % 3 === 0 ? 'rgba(251,184,107,0.3)' : 'rgba(196,181,253,0.4)';
    const c = svgEl('circle', {
      cx: `${cx}%`,
      cy,
      r: 1.5,
      fill,
      opacity,
    });
    s.appendChild(c);
  }

  const factor = 0.10;
  trackedRaf(() => {
    const drift = REDUCED_MOTION ? 0 : (performance.now() * 0.02) % 200;
    layer.style.transform = `translate3d(0, ${-getScrollY() * factor - drift}px, 0)`;
  });
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Mount the underground parallax environment into rootEl.
 *
 * @param {HTMLElement} rootEl - Container element (e.g. <div id="environment">).
 * @param {object} [opts]
 * @param {() => number} [opts.getScrollY] - Function returning the current vertical
 *   scroll offset within the underground zone. Defaults to () => window.scrollY.
 * @returns {{ destroy: () => void }} Teardown handle — call destroy() to cancel all RAF loops.
 */
export function mountUnderground(rootEl, opts = {}) {
  const { getScrollY = () => window.scrollY } = opts;

  // Container styling
  rootEl.style.cssText = `
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    z-index: 0;
    overflow: hidden;
    background: #0d0814;
  `;

  // Layers sized tall enough to cover deep scroll
  const H = Math.max(window.innerHeight * 6, 6000);

  // Unique suffix for gradient IDs — prevents collisions if mountUnderground is called twice.
  const uid = Math.random().toString(36).slice(2, 8);

  // Tracked RAF — collects cancel functions so destroy() can stop all loops.
  // Under reduced motion, rafOrStatic calls fn() once and skips the loop.
  const cancels = [];
  const trackedRaf = (fn) => { cancels.push(rafOrStatic(fn)); };

  const ctx = { H, uid, trackedRaf, getScrollY };

  // Build layers in back-to-front order
  makeCaveDepth(rootEl, ctx);
  makeLanternPoints(rootEl, ctx);
  makeRockNoise(rootEl, ctx);
  makeCracks(rootEl, ctx);
  makeFossils(rootEl, ctx);
  makeForegroundRock(rootEl, ctx);
  makeDustMotes(rootEl, ctx);

  return {
    destroy() {
      cancels.forEach(c => c());
      cancels.length = 0;
    },
  };
}
