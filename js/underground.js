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
 * DISTANT LANTERN POINTS — 30 small circles, factor 0.15.
 * Half warm amber (#fbb86b), half violet (#c4b5fd). Radius 2.5 (every 4th = 4).
 * Opacity 0.55-0.85, deterministic placement using (i*137)%100 for x, (i*71)%100 for y.
 * Scattered over a H-px span, mostly upper portion.
 */
function makeLanternPoints(rootEl, { H, trackedRaf, getScrollY }) {
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

  for (let i = 0; i < 30; i++) {
    const cx = (i * 137) % 100;
    // Bias toward upper portion: only use top 60% of the height
    const cyPct = (i * 71) % 60;
    const cy = cyPct / 100 * H;
    const opacity = 0.55 + ((i * 53) % 100) / 100 * 0.3; // 0.55-0.85
    const r = i % 4 === 0 ? 4 : 2.5;
    // Alternate warm amber and violet for cave-light mix
    const fill = i % 2 === 0 ? '#fbb86b' : '#c4b5fd';
    const c = svgEl('circle', {
      cx: `${cx}%`,
      cy,
      r,
      fill,
      opacity,
    });
    s.appendChild(c);
  }

  const factor = 0.15;
  trackedRaf(() => {
    layer.style.transform = `translate3d(0, ${-getScrollY() * factor}px, 0)`;
  });
}

/**
 * CRACKS — irregular dark fissures threading through the rock face.
 * Thin SVG paths in slightly-lighter-than-bg violet, organic curves.
 * Subtle parallax (factor 0.40).
 */
function makeCracks(rootEl, { H, trackedRaf, getScrollY }) {
  const layer = div(`
    position: absolute; top: 0; left: 0;
    width: 100%; height: ${H}px;
    will-change: transform;
  `);
  rootEl.appendChild(layer);

  const s = svg(
    {
      width: '100%',
      height: H,
      viewBox: `0 0 100 ${H}`,
      preserveAspectRatio: 'none',
    },
    'display: block; position: absolute; top: 0; left: 0;',
  );
  layer.appendChild(s);

  // 14 cracks scattered vertically with deterministic placement.
  // Each crack is a Bezier curve, mostly vertical with horizontal drift,
  // sometimes branching with a short secondary path.
  const crackCount = 14;
  for (let i = 0; i < crackCount; i++) {
    const startX = (i * 137) % 100;       // deterministic x%, edge-to-edge
    const startY = (i * 179) % H;         // deterministic vertical position
    const length = 60 + (i * 53) % 120;   // 60–180px length
    const curve  = -20 + (i * 31) % 40;   // -20 to +20 horizontal drift
    const opacity = 0.18 + ((i * 41) % 100) / 100 * 0.18; // 0.18–0.36

    const endX = startX + curve / 4;       // small horizontal drift in % units
    const endY = startY + length;
    const ctrlX1 = startX + curve / 8;
    const ctrlX2 = endX - curve / 8;
    const ctrlY1 = startY + length * 0.3;
    const ctrlY2 = startY + length * 0.7;

    const d = `M${startX} ${startY} C${ctrlX1} ${ctrlY1}, ${ctrlX2} ${ctrlY2}, ${endX} ${endY}`;
    s.appendChild(svgEl('path', {
      d,
      stroke: `rgba(196, 181, 253, ${opacity})`,
      'stroke-width': 0.4,
      fill: 'none',
      'vector-effect': 'non-scaling-stroke',
    }));

    // Every fourth crack gets a small branching secondary path
    if (i % 4 === 0) {
      const branchLength = length * 0.4;
      const branchX = startX + curve / 6 + (i % 2 ? 6 : -6);
      const branchY = startY + length * 0.5;
      const branchD = `M${startX + curve / 8} ${startY + length * 0.4} L${branchX} ${branchY + branchLength * 0.5}`;
      s.appendChild(svgEl('path', {
        d: branchD,
        stroke: `rgba(196, 181, 253, ${opacity * 0.7})`,
        'stroke-width': 0.3,
        fill: 'none',
        'vector-effect': 'non-scaling-stroke',
      }));
    }
  }

  const factor = 0.40;
  trackedRaf(() => {
    layer.style.transform = `translate3d(0, ${-getScrollY() * factor}px, 0)`;
  });
}

/**
 * ROCK NOISE — subtle scattered specs giving the cave wall a textured grain.
 * Deterministic placement, small circles at varying opacities.
 * Parallax factor 0.55.
 */
function makeRockNoise(rootEl, { H, trackedRaf, getScrollY }) {
  const layer = div(`
    position: absolute; top: 0; left: 0;
    width: 100%; height: ${H}px;
    will-change: transform;
  `);
  rootEl.appendChild(layer);

  const s = svg(
    {
      width: '100%',
      height: H,
      viewBox: `0 0 100 ${H}`,
      preserveAspectRatio: 'none',
    },
    'display: block; position: absolute; top: 0; left: 0;',
  );
  layer.appendChild(s);

  const specCount = 220;
  for (let i = 0; i < specCount; i++) {
    const cx = (i * 137) % 100;
    const cy = (i * 71) % H;
    const r = 0.15 + ((i * 53) % 100) / 100 * 0.35;  // 0.15–0.50 radius
    const opacity = 0.12 + ((i * 41) % 100) / 100 * 0.20; // 0.12–0.32

    s.appendChild(svgEl('circle', {
      cx,
      cy,
      r,
      fill: `rgba(196, 181, 253, ${opacity})`,
    }));
  }

  const factor = 0.55;
  trackedRaf(() => {
    layer.style.transform = `translate3d(0, ${-getScrollY() * factor}px, 0)`;
  });
}

/**
 * FOSSIL SILHOUETTES — 6 sparse #0a0612 SVG paths, factor 0.65.
 * Simple decorative shapes (wishbone, leaf vein, shell spiral, etc.).
 * Placed every ~1000px vertically at random horizontal positions.
 */
function makeFossils(rootEl, { H, trackedRaf, getScrollY }) {
  const layer = div(`
    position: absolute; top: 0; left: 0;
    width: 100%; height: ${H}px;
    will-change: transform;
  `);
  rootEl.appendChild(layer);

  // Simple bone-like SVG path shapes — decorative silhouettes
  const fossilPaths = [
    // Wishbone / forked bone
    'M0,40 Q-15,-20 -5,-45 M0,40 Q15,-20 5,-45 M-5,-45 Q0,-60 5,-45',
    // Leaf vein
    'M0,50 L0,-50 M0,20 L-20,0 M0,20 L20,0 M0,0 L-15,-15 M0,0 L15,-15 M0,-20 L-10,-35 M0,-20 L10,-35',
    // Shell spiral (approximated with arcs)
    'M0,0 Q10,-10 15,0 Q20,15 10,25 Q-5,35 -20,20 Q-35,0 -25,-20 Q-10,-40 15,-35 Q40,-25 40,5',
    // Simple curved bone
    'M-30,10 Q-10,-20 10,10 M-30,10 L-38,18 M-30,10 L-22,18 M10,10 L18,18 M10,10 L2,18',
    // Fern frond
    'M0,50 L0,-50 M0,30 Q-25,15 -30,0 M0,10 Q-20,-5 -22,-18 M0,-10 Q-15,-22 -16,-34 M0,30 Q25,15 30,0 M0,10 Q20,-5 22,-18 M0,-10 Q15,-22 16,-34',
    // Abstract shell curve
    'M5,0 Q20,5 20,20 Q20,40 0,40 Q-25,40 -25,15 Q-25,-15 5,0',
  ];

  for (let i = 0; i < 6; i++) {
    const xPct = 15 + ((i * 137) % 70); // 15%-85% horizontal
    const yPos = 200 + i * 1000 + ((i * 89) % 400);

    const wrapper = div(`
      position: absolute;
      left: ${xPct}%;
      top: ${yPos}px;
      opacity: 0.35;
      transform: rotate(${((i * 47) % 30) - 15}deg) scale(${1.2 + (i * 23) % 10 / 10});
    `);
    layer.appendChild(wrapper);

    const s = svg(
      { width: 80, height: 80, viewBox: '-40 -60 80 120' },
      'display: block; overflow: visible;',
    );
    wrapper.appendChild(s);

    s.appendChild(svgEl('path', {
      d: fossilPaths[i % fossilPaths.length],
      fill: '#1a0f2e',
      stroke: 'rgba(196,181,253,0.55)',
      'stroke-width': '1.5',
      'stroke-linecap': 'round',
      'stroke-linejoin': 'round',
    }));
  }

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
