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
 * SUN — soft violet glow disc, factor 0.06.
 * Repeated every 1800px so one is always visible.
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
    const disc = div(`
      position: absolute;
      left: ${600 + i * 1800}px;
      bottom: 34%;
      width: 280px; height: 280px;
      border-radius: 50%;
      background: radial-gradient(circle,
        rgba(196,181,253,0.55) 0%,
        rgba(124,58,237,0.25) 40%,
        transparent 70%);
      filter: blur(2px);
    `);
    layer.appendChild(disc);
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
 * STARS — 80 deterministic circles in top 40% of viewport.
 * Static, no RAF, no parallax.
 */
function makeStars(rootEl) {
  const wrapper = div(`
    position: absolute; top: 0; left: 0;
    width: 100%; height: 40%;
    opacity: 0.6;
    pointer-events: none;
  `);
  rootEl.appendChild(wrapper);

  const s = svg(
    { width: '100%', height: '100%', preserveAspectRatio: 'none' },
    'display: block;',
  );
  wrapper.appendChild(s);

  for (let i = 0; i < 80; i++) {
    const cx = (i * 137) % 100;
    const cy = (i * 71) % 100;
    const r  = i % 3 === 0 ? 1.2 : 0.6;
    const c  = svgEl('circle', {
      cx: `${cx}%`,
      cy: `${cy}%`,
      r,
      fill: '#c4b5fd',
    });
    s.appendChild(c);
  }
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
  img.src = 'images/world/far-mountains.svg';
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
 * CLOUDS — three-ellipse puffs in #c4b5fd, factor 0.30.
 * Deterministic placement in sky band (top 40% of viewBox).
 */
function makeClouds(rootEl, { scrollRef, W, mode, trackedRaf }) {
  const layer = div(`
    position: absolute; top: 0; left: 0;
    width: ${W}px; height: 100%;
    will-change: transform;
  `);
  rootEl.appendChild(layer);

  const stride = 600;
  const count  = Math.ceil(W / stride) + 2;

  const s = svg(
    {
      width: W,
      viewBox: `0 0 ${W} 1080`,
      preserveAspectRatio: 'none',
    },
    'position: absolute; top: 0; left: 0; width: 100%; height: 100%;',
  );
  layer.appendChild(s);

  for (let i = 0; i < count; i++) {
    const seed = i * 73;
    const x    = i * stride + (seed % 200);
    const y    = 80 + ((seed * 31) % 220);
    const w    = 140 + (seed % 120);
    const o    = 0.18 + ((seed % 100) / 100) * 0.22;

    const g = svgEl('g', { opacity: o });
    s.appendChild(g);

    g.appendChild(svgEl('ellipse', {
      cx: x, cy: y,
      rx: w * 0.5, ry: w * 0.16,
      fill: '#c4b5fd',
    }));
    g.appendChild(svgEl('ellipse', {
      cx: x + w * 0.25, cy: y - 6,
      rx: w * 0.32, ry: w * 0.13,
      fill: '#c4b5fd',
    }));
    g.appendChild(svgEl('ellipse', {
      cx: x - w * 0.2, cy: y + 4,
      rx: w * 0.28, ry: w * 0.11,
      fill: '#c4b5fd',
    }));
  }

  const factor = 0.30;
  trackedRaf(() => {
    const x = mode === 'vertical' ? window.scrollY : (scrollRef.current || 0);
    layer.style.transform = mode === 'vertical'
      ? `translate3d(0, ${-x * factor}px, 0)`
      : `translate3d(${-x * factor}px, 0, 0)`;
  });
}

/**
 * MID HILLS — closer range, factor 0.45.
 * baseY 780, peakWidth 480, gradient #5d2a8e → #2a1351.
 */
function makeMidHills(rootEl, { scrollRef, W, mode, uid, trackedRaf }) {
  const layer = div(`
    position: absolute; top: 0; left: 0;
    width: ${W}px; height: 100%;
    will-change: transform;
  `);
  rootEl.appendChild(layer);

  const baseY       = 780;
  const peakWidth   = 480;
  const peakHeights = [70, 90, 55, 110, 75, 95, 60, 100, 85, 65];
  const total       = Math.ceil(W / peakWidth) + 2;

  let d = `M0,${baseY + 200}`;
  for (let i = 0; i < total; i++) {
    const h  = peakHeights[i % peakHeights.length];
    const x1 = i * peakWidth + peakWidth * 0.5;
    const x2 = (i + 1) * peakWidth;
    d += ` Q${x1},${baseY - h} ${x2},${baseY}`;
  }
  d += ` L${W + peakWidth * 2},1080 L0,1080 Z`;

  const s = svg(
    {
      width: W,
      viewBox: `0 0 ${W} 1080`,
      preserveAspectRatio: 'none',
    },
    'position: absolute; bottom: 0; left: 0; height: 100%;',
  );
  layer.appendChild(s);

  const defs = svgEl('defs');
  s.appendChild(defs);
  const grad = svgEl('linearGradient', { id: `mid-grad-${uid}`, x1: '0', y1: '0', x2: '0', y2: '1' });
  defs.appendChild(grad);
  grad.appendChild(svgEl('stop', { offset: '0%',   'stop-color': '#5d2a8e', 'stop-opacity': '0.85' }));
  grad.appendChild(svgEl('stop', { offset: '100%', 'stop-color': '#2a1351', 'stop-opacity': '1' }));

  s.appendChild(svgEl('path', { d, fill: `url(#mid-grad-${uid})` }));

  const factor = 0.45;
  trackedRaf(() => {
    const x = mode === 'vertical' ? window.scrollY : (scrollRef.current || 0);
    layer.style.transform = mode === 'vertical'
      ? `translate3d(0, ${-x * factor}px, 0)`
      : `translate3d(${-x * factor}px, 0, 0)`;
  });
}

/**
 * TREES — sparse silhouettes in #0a0612, factor 0.65.
 * 280px stride, every 3rd or 5th slot. Two kinds: tall pine, round canopy.
 */
function makeTrees(rootEl, { scrollRef, W, mode, trackedRaf }) {
  const layer = div(`
    position: absolute; top: 0; left: 0;
    width: ${W}px; height: 100%;
    will-change: transform;
  `);
  rootEl.appendChild(layer);

  const stride = 280;
  const count  = Math.ceil(W / stride) + 2;

  const s = svg(
    {
      width: W,
      viewBox: `0 0 ${W} 1080`,
      preserveAspectRatio: 'none',
    },
    'position: absolute; top: 0; left: 0; width: 100%; height: 100%;',
  );
  layer.appendChild(s);

  for (let i = 0; i < count; i++) {
    if (i % 3 !== 0 && i % 5 !== 0) continue;
    const seed  = i * 89;
    const x     = i * stride + (seed % 80);
    const baseY = 880;
    const h     = 60 + (seed % 60);
    const kind  = i % 7 === 0 ? 'wide' : 'tall';

    const g = svgEl('g');
    s.appendChild(g);

    // trunk
    g.appendChild(svgEl('rect', {
      x: x - 2, y: baseY,
      width: 4, height: 20,
      fill: '#0a0612',
    }));

    if (kind === 'tall') {
      // pine triangle
      g.appendChild(svgEl('polygon', {
        points: `${x},${baseY - h} ${x - h * 0.35},${baseY} ${x + h * 0.35},${baseY}`,
        fill: '#0a0612',
      }));
    } else {
      // round canopy
      g.appendChild(svgEl('ellipse', {
        cx: x, cy: baseY - h * 0.5,
        rx: h * 0.4, ry: h * 0.5,
        fill: '#0a0612',
      }));
    }
  }

  const factor = 0.65;
  trackedRaf(() => {
    const x = mode === 'vertical' ? window.scrollY : (scrollRef.current || 0);
    layer.style.transform = mode === 'vertical'
      ? `translate3d(0, ${-x * factor}px, 0)`
      : `translate3d(${-x * factor}px, 0, 0)`;
  });
}

/**
 * GROUND — earth band #06040b from y=900 to y=1080, accent line, grass tufts.
 * Factor 0.85.
 */
function makeGround(rootEl, { scrollRef, W, mode, trackedRaf }) {
  const layer = div(`
    position: absolute; top: 0; left: 0;
    width: ${W}px; height: 100%;
    will-change: transform;
  `);
  rootEl.appendChild(layer);

  const s = svg(
    {
      width: W,
      viewBox: `0 0 ${W} 1080`,
      preserveAspectRatio: 'none',
    },
    'position: absolute; top: 0; left: 0; width: 100%; height: 100%;',
  );
  layer.appendChild(s);

  // earth band
  s.appendChild(svgEl('rect', {
    x: 0, y: 900,
    width: W, height: 180,
    fill: '#06040b',
  }));

  // top edge accent line
  s.appendChild(svgEl('rect', {
    x: 0, y: 899,
    width: W, height: 1.5,
    fill: 'rgba(196,181,253,0.35)',
  }));

  // grass tufts — every 3rd of 60px intervals
  const tufts = Math.ceil(W / 60);
  for (let i = 0; i < tufts; i++) {
    const seed = i * 41;
    const x    = i * 60 + (seed % 30);
    if (seed % 3 !== 0) continue;

    const g = svgEl('g', {
      stroke: 'rgba(196,181,253,0.5)',
      'stroke-width': '1',
      'stroke-linecap': 'round',
    });
    s.appendChild(g);

    g.appendChild(svgEl('line', { x1: x,     y1: 898, x2: x - 2, y2: 892 }));
    g.appendChild(svgEl('line', { x1: x + 1, y1: 898, x2: x + 1, y2: 890 }));
    g.appendChild(svgEl('line', { x1: x + 3, y1: 898, x2: x + 4, y2: 893 }));
  }

  const factor = 0.85;
  trackedRaf(() => {
    const x = mode === 'vertical' ? window.scrollY : (scrollRef.current || 0);
    layer.style.transform = mode === 'vertical'
      ? `translate3d(0, ${-x * factor}px, 0)`
      : `translate3d(${-x * factor}px, 0, 0)`;
  });
}

/**
 * BIRDS — M-shape flock, factor 0.25 + independent performance.now() drift.
 * Drift: performance.now() * 0.04 % 2400 so they keep moving even at rest.
 * Combined into a single translate3d: -(scroll * 0.25) + drift.
 */
function makeBirds(rootEl, { scrollRef, mode, trackedRaf }) {
  const wrapper = div(`
    position: absolute; top: 18%; left: 0;
    width: 60px; height: 20px;
    will-change: transform;
  `);
  rootEl.appendChild(wrapper);

  const s = svg(
    { width: 120, height: 40, viewBox: '0 0 120 40' },
    'display: block; overflow: visible;',
  );
  wrapper.appendChild(s);

  const g = svgEl('g', {
    stroke: '#c4b5fd',
    'stroke-width': '1.5',
    fill: 'none',
    'stroke-linecap': 'round',
    'stroke-linejoin': 'round',
  });
  s.appendChild(g);

  // Four M-shape birds from world.jsx BirdFlock
  const paths = [
    'M5 18 L11 14 L17 18',
    'M30 22 L35 18 L40 22',
    'M55 16 L60 12 L65 16',
    'M85 24 L89 20 L93 24',
  ];
  for (const d of paths) {
    g.appendChild(svgEl('path', { d }));
  }

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
