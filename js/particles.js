/* ============================================================
   Sidequest Digital — js/particles.js
   Ambient canvas particle field. Pure enhancement: if anything
   here is unsupported or misconfigured, it no-ops silently and
   the page (already complete without JS) is unaffected.

   Export: mountParticles(canvasEl)
   ============================================================ */

const DPR_CAP = 2;
const BASE_COUNT_AT_1280x720 = 150;
const MAX_COUNT = 420;
const MIN_COUNT = 18;
const CURSOR_RADIUS = 140;
const REPEL_STRENGTH = 26;
const EASE = 0.06;
const DRIFT_SPEED = 0.12;
const RESIZE_DEBOUNCE_MS = 160;

export function mountParticles(canvasEl) {
  try {
    if (!canvasEl || typeof canvasEl.getContext !== 'function') return;
    const ctx = canvasEl.getContext('2d');
    if (!ctx) return;

    const tokens = getComputedStyle(document.documentElement);
    const colorViolet = (tokens.getPropertyValue('--violet-lite') || '#c4b5fd').trim() || '#c4b5fd';
    const colorWhite = (tokens.getPropertyValue('--ink-0') || '#f5f3f8').trim() || '#f5f3f8';

    const reduced = typeof window.matchMedia === 'function'
      && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let dpr = 1;
    let width = 0;
    let height = 0;
    let violets = [];
    let whites = [];
    let rafId = null;
    let resizeTimer = null;
    const pointer = { x: -9999, y: -9999, active: false };

    function countFor(w, h) {
      const density = BASE_COUNT_AT_1280x720 / (1280 * 720);
      return Math.max(MIN_COUNT, Math.min(MAX_COUNT, Math.round(w * h * density)));
    }

    function makeParticle(color) {
      return {
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * DRIFT_SPEED,
        vy: (Math.random() - 0.5) * DRIFT_SPEED,
        r: Math.random() * 1.5 + 0.6,
        a: Math.random() * 0.4 + 0.25,
        ox: 0,
        oy: 0,
        color: color
      };
    }

    function seed() {
      const total = countFor(width, height);
      const violetCount = Math.round(total * 0.55);
      violets = new Array(violetCount).fill(null).map(() => makeParticle(colorViolet));
      whites = new Array(total - violetCount).fill(null).map(() => makeParticle(colorWhite));
    }

    function resize() {
      width = window.innerWidth;
      height = window.innerHeight;
      dpr = Math.min(window.devicePixelRatio || 1, DPR_CAP);
      canvasEl.width = Math.round(width * dpr);
      canvasEl.height = Math.round(height * dpr);
      canvasEl.style.width = width + 'px';
      canvasEl.style.height = height + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      seed();
    }

    function drawGroup(list) {
      if (!list.length) return;
      ctx.fillStyle = list[0].color;
      for (const p of list) {
        ctx.globalAlpha = p.a;
        ctx.beginPath();
        ctx.arc(p.x + p.ox, p.y + p.oy, p.r, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    function drawFrame() {
      ctx.clearRect(0, 0, width, height);
      drawGroup(violets);
      drawGroup(whites);
      ctx.globalAlpha = 1;
    }

    function updateParticle(p) {
      p.x += p.vx;
      p.y += p.vy;
      if (p.x < -12) p.x = width + 12;
      else if (p.x > width + 12) p.x = -12;
      if (p.y < -12) p.y = height + 12;
      else if (p.y > height + 12) p.y = -12;

      let tox = 0;
      let toy = 0;
      if (pointer.active) {
        const dx = p.x - pointer.x;
        const dy = p.y - pointer.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist > 0.01 && dist < CURSOR_RADIUS) {
          const force = (1 - dist / CURSOR_RADIUS) * REPEL_STRENGTH;
          tox = (dx / dist) * force;
          toy = (dy / dist) * force;
        }
      }
      p.ox += (tox - p.ox) * EASE;
      p.oy += (toy - p.oy) * EASE;
    }

    function tick() {
      for (const p of violets) updateParticle(p);
      for (const p of whites) updateParticle(p);
      drawFrame();
      rafId = requestAnimationFrame(tick);
    }

    function start() {
      if (rafId !== null) return;
      rafId = requestAnimationFrame(tick);
    }

    function stop() {
      if (rafId === null) return;
      cancelAnimationFrame(rafId);
      rafId = null;
    }

    function onResize() {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(resize, RESIZE_DEBOUNCE_MS);
    }

    function onPointerMove(e) {
      pointer.x = e.clientX;
      pointer.y = e.clientY;
      pointer.active = true;
    }

    function onPointerGone() {
      pointer.active = false;
    }

    function onVisibilityChange() {
      if (document.hidden) stop();
      else start();
    }

    resize();

    if (reduced) {
      drawFrame();
      return;
    }

    window.addEventListener('resize', onResize, { passive: true });
    window.addEventListener('pointermove', onPointerMove, { passive: true });
    window.addEventListener('pointerleave', onPointerGone, { passive: true });
    window.addEventListener('blur', onPointerGone, { passive: true });
    document.addEventListener('visibilitychange', onVisibilityChange);

    start();
  } catch (err) {
    /* Decorative only — never surface a failure to the page or console. */
  }
}

mountParticles(document.getElementById('field'));
