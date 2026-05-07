/**
 * scroll-engine.js
 * Horizontal pan from vertical wheel / touch / keyboard input.
 * Single RAF loop lerps scroll position and writes transform on the track element.
 */

// ─── Colour palette ────────────────────────────────────────────────────────────
export const COLORS = {
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

// ─── Module-level subscriber list ──────────────────────────────────────────────
/** @type {Array<(state: { scroll: number, progress: number, activeIdx: number }) => void>} */
const subscribers = [];

// ─── Subscribe ─────────────────────────────────────────────────────────────────
/**
 * Register a callback that fires once per RAF tick.
 * @param {(state: { scroll: number, progress: number, activeIdx: number }) => void} callback
 * @returns {() => void} unsubscribe function
 */
export function subscribe(callback) {
  subscribers.push(callback);
  return () => {
    const idx = subscribers.indexOf(callback);
    if (idx !== -1) subscribers.splice(idx, 1);
  };
}

// ─── Init scroll engine ────────────────────────────────────────────────────────
/**
 * Wire up horizontal scroll listeners and start the RAF loop.
 * @param {{ trackEl: HTMLElement }} options
 * @returns {{
 *   scrollRef:    { current: number },
 *   progressRef:  { current: number },
 *   activeIdxRef: { current: number },
 *   jumpTo:       (idx: number) => void,
 * }}
 */
export function initScrollEngine({ trackEl }) {
  const scroll = { target: 0, current: 0 };
  const scrollRef    = { current: 0 };
  const progressRef  = { current: 0 };
  const activeIdxRef = { current: 0 };

  let maxScroll = 0;

  const recalc = () => {
    maxScroll = Math.max(0, trackEl.scrollWidth - window.innerWidth);
    scroll.target = Math.min(scroll.target, maxScroll);
  };
  recalc();
  window.addEventListener('resize', recalc);

  // ── Wheel ────────────────────────────────────────────────────────────────────
  const onWheel = (e) => {
    const dy = Math.abs(e.deltaY) > Math.abs(e.deltaX) ? e.deltaY : e.deltaX;
    if (dy === 0) return;
    e.preventDefault();
    scroll.target = Math.max(0, Math.min(maxScroll, scroll.target + dy));
  };
  window.addEventListener('wheel', onWheel, { passive: false });

  // ── Touch ────────────────────────────────────────────────────────────────────
  let touchX = null, touchY = null, touchStart = 0;

  const onTouchStart = (e) => {
    touchX = e.touches[0].clientX;
    touchY = e.touches[0].clientY;
    touchStart = scroll.target;
  };
  const onTouchMove = (e) => {
    if (touchY === null) return;
    const dy = touchY - e.touches[0].clientY;
    const dx = touchX - e.touches[0].clientX;
    const move = Math.abs(dy) > Math.abs(dx) ? dy : dx;
    scroll.target = Math.max(0, Math.min(maxScroll, touchStart + move * 2));
  };
  const onTouchEnd = () => { touchX = null; touchY = null; };

  window.addEventListener('touchstart', onTouchStart, { passive: true });
  window.addEventListener('touchmove',  onTouchMove,  { passive: true });
  window.addEventListener('touchend',   onTouchEnd);

  // ── Keyboard ─────────────────────────────────────────────────────────────────
  const onKey = (e) => {
    if (['ArrowRight', 'ArrowDown', 'PageDown'].includes(e.key)) {
      scroll.target = Math.min(maxScroll, scroll.target + window.innerWidth * 0.7);
    } else if (['ArrowLeft', 'ArrowUp', 'PageUp'].includes(e.key)) {
      scroll.target = Math.max(0, scroll.target - window.innerWidth * 0.7);
    } else if (e.key === 'Home') {
      scroll.target = 0;
    } else if (e.key === 'End') {
      scroll.target = maxScroll;
    } else {
      return;
    }
  };
  window.addEventListener('keydown', onKey);

  // ── RAF tick ─────────────────────────────────────────────────────────────────
  let rafId;
  const tick = () => {
    scroll.current += (scroll.target - scroll.current) * 0.08;
    if (Math.abs(scroll.target - scroll.current) < 0.5) {
      scroll.current = scroll.target;
    }

    trackEl.style.transform = `translate3d(${-scroll.current}px, 0, 0)`;

    scrollRef.current    = scroll.current;
    progressRef.current  = maxScroll > 0 ? scroll.current / maxScroll : 0;
    activeIdxRef.current = Math.round(scroll.current / window.innerWidth);

    const state = {
      scroll:    scrollRef.current,
      progress:  progressRef.current,
      activeIdx: activeIdxRef.current,
    };
    for (let i = 0; i < subscribers.length; i++) subscribers[i](state);

    rafId = requestAnimationFrame(tick);
  };
  rafId = requestAnimationFrame(tick);

  // ── jumpTo ───────────────────────────────────────────────────────────────────
  const jumpTo = (idx) => {
    scroll.target = Math.max(0, Math.min(maxScroll, idx * window.innerWidth));
  };

  return { scrollRef, progressRef, activeIdxRef, jumpTo };
}
