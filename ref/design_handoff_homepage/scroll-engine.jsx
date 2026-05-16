// Sidequest — horizontal cinematic homepage
// Vertical wheel translates to horizontal pan. Each project panel = its own world.

const COLORS = {
  bg:        '#08060d',
  bg2:       '#100819',
  bg3:       '#1a0f2e',
  ink:       '#f5f0ff',
  ink2:      '#b8a8d4',
  ink3:      '#7a6a92',
  ink4:      '#3d3450',
  violet:    '#7c3aed',
  violetLt:  '#c4b5fd',
  violetGlow:'rgba(124,58,237,0.35)',
  line:      'rgba(196,181,253,0.10)',
  lineMid:   'rgba(196,181,253,0.20)',
};

// ──────────────────────────────────────────────────────────
// Horizontal scroll engine
// vertical wheel/trackpad → horizontal pan; track fixed-position
// progress for the chrome elements (counter, progress bar).
// ──────────────────────────────────────────────────────────
function useHorizontalScroll() {
  const trackRef = React.useRef(null);
  const targetRef = React.useRef(0);
  const currentRef = React.useRef(0);
  const maxRef = React.useRef(0);
  const [progress, setProgress] = React.useState(0);
  const [activeIdx, setActiveIdx] = React.useState(0);

  React.useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    const recalc = () => {
      maxRef.current = Math.max(0, track.scrollWidth - window.innerWidth);
      targetRef.current = Math.min(targetRef.current, maxRef.current);
    };
    recalc();
    window.addEventListener('resize', recalc);

    const onWheel = (e) => {
      // prefer vertical delta, fall back to horizontal
      const dy = Math.abs(e.deltaY) > Math.abs(e.deltaX) ? e.deltaY : e.deltaX;
      if (dy === 0) return;
      e.preventDefault();
      targetRef.current = Math.max(0, Math.min(maxRef.current, targetRef.current + dy));
    };
    window.addEventListener('wheel', onWheel, { passive: false });

    // touch fallback — vertical drag → horizontal scroll
    let touchY = null, touchX = null, touchStart = 0;
    const onTouchStart = (e) => {
      touchY = e.touches[0].clientY;
      touchX = e.touches[0].clientX;
      touchStart = targetRef.current;
    };
    const onTouchMove = (e) => {
      if (touchY == null) return;
      const dy = touchY - e.touches[0].clientY;
      const dx = touchX - e.touches[0].clientX;
      const move = Math.abs(dy) > Math.abs(dx) ? dy : dx;
      targetRef.current = Math.max(0, Math.min(maxRef.current, touchStart + move * 2));
    };
    const onTouchEnd = () => { touchY = null; touchX = null; };
    window.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchmove', onTouchMove, { passive: true });
    window.addEventListener('touchend', onTouchEnd);

    // keyboard
    const onKey = (e) => {
      if (['ArrowRight', 'ArrowDown', 'PageDown'].includes(e.key)) {
        targetRef.current = Math.min(maxRef.current, targetRef.current + window.innerWidth * 0.7);
      } else if (['ArrowLeft', 'ArrowUp', 'PageUp'].includes(e.key)) {
        targetRef.current = Math.max(0, targetRef.current - window.innerWidth * 0.7);
      } else if (e.key === 'Home') { targetRef.current = 0; }
      else if (e.key === 'End') { targetRef.current = maxRef.current; }
    };
    window.addEventListener('keydown', onKey);

    let raf;
    const tick = () => {
      const lerp = 0.08;
      currentRef.current += (targetRef.current - currentRef.current) * lerp;
      if (Math.abs(targetRef.current - currentRef.current) < 0.5) {
        currentRef.current = targetRef.current;
      }
      track.style.transform = `translate3d(${-currentRef.current}px, 0, 0)`;
      const p = maxRef.current > 0 ? currentRef.current / maxRef.current : 0;
      setProgress(p);
      // active panel — query data-panel children
      const panels = track.querySelectorAll('[data-panel]');
      const cx = currentRef.current + window.innerWidth / 2;
      let active = 0, acc = 0;
      panels.forEach((p, i) => {
        const w = p.offsetWidth;
        if (cx >= acc && cx < acc + w) active = i;
        acc += w;
      });
      setActiveIdx(active);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener('resize', recalc);
      window.removeEventListener('wheel', onWheel);
      window.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);
      window.removeEventListener('keydown', onKey);
      cancelAnimationFrame(raf);
    };
  }, []);

  const jumpTo = React.useCallback((idx) => {
    const track = trackRef.current;
    if (!track) return;
    const panels = track.querySelectorAll('[data-panel]');
    let acc = 0;
    for (let i = 0; i < idx && i < panels.length; i++) acc += panels[i].offsetWidth;
    targetRef.current = Math.max(0, Math.min(maxRef.current, acc));
  }, []);

  return { trackRef, progress, activeIdx, currentRef, jumpTo };
}

// parallax helper — read scroll position via ref, no React re-render
function useParallax(currentRef, panelStartGetter, factor = 0.3) {
  const ref = React.useRef(null);
  React.useEffect(() => {
    let raf;
    const tick = () => {
      const el = ref.current;
      if (el) {
        const start = panelStartGetter();
        const offset = (currentRef.current - start) * factor;
        el.style.transform = `translate3d(${-offset}px, 0, 0)`;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [currentRef, panelStartGetter, factor]);
  return ref;
}

Object.assign(window, { COLORS, useHorizontalScroll, useParallax });
