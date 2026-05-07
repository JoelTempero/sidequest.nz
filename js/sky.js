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
 * #08060d → #1a0f2e → #2d1654 → #4a2378 (top to bottom).
 */
function makeSkyGradient(rootEl) {
  const layer = div(`
    position: absolute; top: 0; left: 0;
    width: 100%; height: 100%;
    background: linear-gradient(180deg,
      #08060d 0%,
      #1a0f2e 33%,
      #2d1654 66%,
      #4a2378 100%);
  `);
  rootEl.appendChild(layer);
}

/**
 * STARS — 60 small #c4b5fd circles in top 70% of viewport.
 * Each star has a unique phase seed (i * 0.83).
 * ONE shared RAF updates all 60 star opacities each tick.
 * Reduced motion: stars render at average opacity (0.55), no twinkle.
 */
function makeStars(rootEl, trackedRaf) {
  const wrapper = div(`
    position: absolute; top: 0; left: 0;
    width: 100%; height: 70%;
    pointer-events: none;
  `);
  rootEl.appendChild(wrapper);

  const s = svg(
    { width: '100%', height: '100%', preserveAspectRatio: 'none' },
    'display: block; position: absolute; top: 0; left: 0;',
  );
  wrapper.appendChild(s);

  const circles = [];
  const phases = [];

  for (let i = 0; i < 60; i++) {
    const cx = (i * 137) % 100;  // deterministic x% in 0-100
    const cy = (i * 71) % 70;    // deterministic y% in top 70%
    const r = i % 4 === 0 ? 1.4 : 1.0;
    const phase = i * 0.83;

    const staticOpacity = REDUCED_MOTION ? 0.5 : 0.5 + 0.4 * Math.sin(phase);

    const c = svgEl('circle', {
      cx: `${cx}%`,
      cy: `${cy}%`,
      r,
      fill: '#c4b5fd',
      opacity: staticOpacity,
    });
    s.appendChild(c);
    circles.push(c);
    phases.push(phase);
  }

  if (!REDUCED_MOTION) {
    // ONE shared RAF for all 60 stars
    trackedRaf(() => {
      const t = performance.now() * 0.001;
      for (let i = 0; i < circles.length; i++) {
        const opacity = 0.5 + 0.4 * Math.sin(t + phases[i]);
        circles[i].setAttribute('opacity', opacity);
      }
    });
  }
}

/**
 * AURORA RIBBON — static subtle violet curtain in upper third.
 * SVG path with linearGradient: rgba(196,181,253,0.0) → 0.12 → 0.0.
 * Wavy band shape, low opacity.
 */
function makeAurora(rootEl) {
  const uid = Math.random().toString(36).slice(2, 8);

  const wrapper = div(`
    position: absolute; top: 0; left: 0;
    width: 100%; height: 100%;
    pointer-events: none;
  `);
  rootEl.appendChild(wrapper);

  const s = svg(
    {
      width: '100%',
      height: '100%',
      viewBox: '0 0 1000 400',
      preserveAspectRatio: 'none',
    },
    'display: block; position: absolute; top: 0; left: 0;',
  );
  wrapper.appendChild(s);

  const defs = svgEl('defs');
  s.appendChild(defs);

  // Vertical gradient: transparent → violet → transparent
  const grad = svgEl('linearGradient', {
    id: `aurora-grad-${uid}`,
    x1: '0', y1: '0',
    x2: '0', y2: '1',
  });
  defs.appendChild(grad);
  grad.appendChild(svgEl('stop', { offset: '0%',   'stop-color': 'rgba(196,181,253,0)' }));
  grad.appendChild(svgEl('stop', { offset: '45%',  'stop-color': 'rgba(196,181,253,0.12)' }));
  grad.appendChild(svgEl('stop', { offset: '100%', 'stop-color': 'rgba(196,181,253,0)' }));

  // Wavy band path — occupies roughly 5%–35% from top in the viewBox
  // Upper edge: wavy line; lower edge: wavy line offset downward
  const auroraPath = [
    'M-50,30',
    'Q200,5   400,45',
    'Q600,85  800,50',
    'Q900,35  1050,55',
    'L1050,120',
    'Q900,105  800,120',
    'Q600,140  400,110',
    'Q200,80   -50,100',
    'Z',
  ].join(' ');

  s.appendChild(svgEl('path', {
    d: auroraPath,
    fill: `url(#aurora-grad-${uid})`,
  }));
}

/**
 * MOUNTAIN RIDGE SILHOUETTE — static SVG path at bottom 20% of viewport.
 * Peak heights cycling through deterministic array, filled #06040b.
 */
function makeMountainRidge(rootEl) {
  const wrapper = div(`
    position: absolute; bottom: 0; left: 0;
    width: 100%; height: 20%;
    pointer-events: none;
  `);
  rootEl.appendChild(wrapper);

  const peakHeights = [110, 140, 80, 160, 120, 95, 135, 175, 100, 125];
  const peakWidth = 700;
  const viewW = 7000; // wide enough to cover any viewport
  const viewH = 400;  // viewBox height for the ridge strip

  // baseY: bottom of the ridge strip (where peaks rise from)
  const baseY = viewH;
  const total = Math.ceil(viewW / peakWidth) + 2;

  let d = `M-${peakWidth},${baseY}`;
  for (let i = 0; i < total; i++) {
    const h  = peakHeights[i % peakHeights.length];
    const x1 = i * peakWidth + peakWidth * 0.5;
    const x2 = (i + 1) * peakWidth;
    d += ` Q${x1},${baseY - h} ${x2},${baseY}`;
  }
  d += ` L${viewW + peakWidth},${viewH + 50} L-${peakWidth},${viewH + 50} Z`;

  const s = svg(
    {
      width: '100%',
      height: '100%',
      viewBox: `0 0 ${viewW} ${viewH}`,
      preserveAspectRatio: 'none',
    },
    'display: block; position: absolute; bottom: 0; left: 0;',
  );
  wrapper.appendChild(s);

  s.appendChild(svgEl('path', {
    d,
    fill: '#06040b',
  }));
}

/**
 * CLOUD DRIFT — 3 ellipse puffs in rgba(196,181,253,0.20).
 * Drifting horizontally, cycling off-screen and back.
 * ONE shared RAF updates all 3 clouds each tick.
 * Position vertically just above the mountain ridge.
 * Reduced motion: clouds frozen at initial position.
 */
function makeCloudDrift(rootEl, trackedRaf) {
  const vwBase = window.innerWidth;
  const cloudData = [
    { yPct: 74, width: 220, height: 38, speedMult: 1.0,  offset: 0 },
    { yPct: 78, width: 160, height: 28, speedMult: 0.72, offset: vwBase / 3 },
    { yPct: 71, width: 290, height: 48, speedMult: 0.55, offset: 2 * vwBase / 3 },
  ];

  const containers = cloudData.map((cloud, i) => {
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

    const s = svg(
      {
        width: cloud.width,
        height: cloud.height,
        viewBox: `0 0 ${cloud.width} ${cloud.height}`,
      },
      'display: block; overflow: visible;',
    );
    container.appendChild(s);

    const cx = cloud.width * 0.5;
    const cy = cloud.height * 0.5;
    const rx = cloud.width * 0.5;
    const ry = cloud.height * 0.5;

    // Main puff
    s.appendChild(svgEl('ellipse', {
      cx,
      cy,
      rx,
      ry,
      fill: 'rgba(196,181,253,0.20)',
    }));
    // Smaller top-right lobe
    s.appendChild(svgEl('ellipse', {
      cx: cx + rx * 0.42,
      cy: cy - ry * 0.25,
      rx: rx * 0.55,
      ry: ry * 0.65,
      fill: 'rgba(196,181,253,0.20)',
    }));
    // Smaller bottom-left lobe
    s.appendChild(svgEl('ellipse', {
      cx: cx - rx * 0.35,
      cy: cy + ry * 0.18,
      rx: rx * 0.45,
      ry: ry * 0.55,
      fill: 'rgba(196,181,253,0.20)',
    }));

    return container;
  });

  if (!REDUCED_MOTION) {
    // ONE shared RAF for all 3 clouds
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
    position: fixed;
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
  makeStars(rootEl, trackedRaf);
  makeAurora(rootEl);
  makeMountainRidge(rootEl);
  makeCloudDrift(rootEl, trackedRaf);

  return {
    destroy() {
      cancels.forEach(c => c());
      cancels.length = 0;
    },
  };
}
