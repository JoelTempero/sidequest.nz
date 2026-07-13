/* ============================================================
   Sidequest Digital — js/kinetic.js
   Subtle cursor-reactive headline distortion. Pure enhancement:
   if anything here is unsupported or misconfigured, it no-ops
   silently and the page (already complete without JS) is
   unaffected.

   Export: mountKinetic(headlineEl)
   ============================================================ */

const RADIUS = 90;
const MAX_TRANSLATE = 6;
const MAX_SCALE = 0.16;
const EASE = 0.18;

export function mountKinetic(headlineEl) {
  try {
    if (!headlineEl || typeof headlineEl.querySelectorAll !== 'function') return;
    if (headlineEl.dataset.kineticMounted === 'true') return;

    const isTouch = typeof window.matchMedia === 'function'
      && window.matchMedia('(pointer: coarse)').matches;
    if (isTouch) return;

    const reduced = typeof window.matchMedia === 'function'
      && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) return;

    const lines = headlineEl.querySelectorAll('.hero-line');
    if (!lines.length) return;

    headlineEl.dataset.kineticMounted = 'true';

    const letters = [];

    lines.forEach((line) => {
      const text = line.textContent;
      // Preserve the accessible name on the line itself; hide the
      // per-letter breakdown from assistive tech.
      line.setAttribute('aria-label', text);
      line.textContent = '';

      for (const ch of text) {
        const span = document.createElement('span');
        span.textContent = ch === ' ' ? ' ' : ch;
        span.setAttribute('aria-hidden', 'true');
        line.appendChild(span);
        letters.push({ el: span, x: 0, y: 0, tx: 0, ty: 0, ts: 1, s: 1 });
      }
    });

    let rafId = null;
    const pointer = { x: -9999, y: -9999, active: false };
    let measured = false;

    function measure() {
      for (const l of letters) {
        const r = l.el.getBoundingClientRect();
        l.x = r.left + r.width / 2;
        l.y = r.top + r.height / 2;
      }
      measured = true;
    }

    function update() {
      for (const l of letters) {
        let tx = 0;
        let ty = 0;
        let ts = 1;
        if (pointer.active) {
          const dx = l.x - pointer.x;
          const dy = l.y - pointer.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < RADIUS) {
            const force = 1 - dist / RADIUS;
            const safeDist = dist < 0.01 ? 0.01 : dist;
            tx = (dx / safeDist) * force * MAX_TRANSLATE;
            ty = (dy / safeDist) * force * MAX_TRANSLATE;
            ts = 1 + force * MAX_SCALE;
          }
        }
        l.tx += (tx - l.tx) * EASE;
        l.ty += (ty - l.ty) * EASE;
        l.s += (ts - l.s) * EASE;
        l.el.style.transform = `translate3d(${l.tx.toFixed(2)}px, ${l.ty.toFixed(2)}px, 0) scale(${l.s.toFixed(3)})`;
      }
    }

    function tick() {
      try {
        if (!measured) measure();
        update();
      } catch (err) {
        teardown();
        return;
      }
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

    function teardown() {
      stop();
      window.removeEventListener('resize', onResize);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerleave', onPointerGone);
      window.removeEventListener('blur', onPointerGone);
      document.removeEventListener('visibilitychange', onVisibilityChange);
      headlineEl.removeEventListener('animationend', onSettle);
      headlineEl.removeEventListener('transitionend', onSettle);
    }

    function onResize() {
      measured = false;
    }

    // #hero-lines has a font-size transition (contact panel open/close)
    // and .hero-line has an entrance animation — both reflow the letters
    // after our first snapshot. Re-measure once they settle.
    function onSettle(e) {
      if (e.target === headlineEl || e.target.classList.contains('hero-line')) {
        measured = false;
      }
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

    window.addEventListener('resize', onResize, { passive: true });
    window.addEventListener('pointermove', onPointerMove, { passive: true });
    window.addEventListener('pointerleave', onPointerGone, { passive: true });
    window.addEventListener('blur', onPointerGone, { passive: true });
    document.addEventListener('visibilitychange', onVisibilityChange);
    headlineEl.addEventListener('animationend', onSettle);
    headlineEl.addEventListener('transitionend', onSettle);

    start();
  } catch (err) {
    /* Decorative only — never surface a failure to the page or console. */
  }
}

mountKinetic(document.getElementById('hero-lines'));
