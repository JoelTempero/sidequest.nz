/**
 * scroll-engine.js
 * Horizontal pan from vertical wheel / touch / keyboard input.
 * Single RAF loop lerps scroll position and writes transform on the track element.
 */

// ─── Reduced-motion detection ─────────────────────────────────────────────────
const REDUCED_MOTION = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

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

// ─── Module-level feed functions (set by initScrollEngine) ────────────────────
/** Feed a vertical wheel delta into the horizontal scroll engine. */
let _feedHorizontalDelta = () => {};

/**
 * Feed a vertical wheel/keyboard delta into the horizontal scroll engine.
 * Call from the orchestrator's wheel handler when the homepage zone is active.
 * @param {number} dy
 */
export function feedHorizontalDelta(dy) {
  _feedHorizontalDelta(dy);
}

// Touch state shared between feedTouchStart / feedTouchMove / feedTouchEnd
let _touchX = null, _touchY = null, _touchStart = 0;
let _feedTouchStartFn  = (x, y) => {};
let _feedTouchMoveFn   = (x, y) => {};
let _feedTouchEndFn    = ()      => {};

/**
 * Begin a touch gesture. Call from homepage.js touchstart handler.
 * @param {number} x  clientX
 * @param {number} y  clientY
 */
export function feedTouchStart(x, y) { _feedTouchStartFn(x, y); }

/**
 * Continue a touch gesture. Call from homepage.js touchmove handler.
 * @param {number} x  clientX
 * @param {number} y  clientY
 */
export function feedTouchMove(x, y) { _feedTouchMoveFn(x, y); }

/** End a touch gesture. Call from homepage.js touchend handler. */
export function feedTouchEnd() { _feedTouchEndFn(); }

// ─── Init scroll engine ────────────────────────────────────────────────────────
/**
 * Wire up horizontal scroll listeners and start the RAF loop.
 * NOTE: window wheel and keyboard listeners are NOT registered here — the
 * orchestrator (homepage.js) owns those and calls feedHorizontalDelta(dy)
 * when appropriate.
 *
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

  // ── feedHorizontalDelta implementation ───────────────────────────────────────
  // Registered at module level so it can be called before initScrollEngine returns.
  _feedHorizontalDelta = (dy) => {
    if (dy === 0) return;
    scroll.target = Math.max(0, Math.min(maxScroll, scroll.target + dy));
  };

  // ── feedTouch* implementations ────────────────────────────────────────────────
  let touchStartX = null, touchStartY = null, touchBase = 0;

  _feedTouchStartFn = (x, y) => {
    touchStartX = x;
    touchStartY = y;
    touchBase   = scroll.target;
  };

  _feedTouchMoveFn = (x, y) => {
    if (touchStartY === null) return;
    const dy   = touchStartY - y;
    const dx   = touchStartX - x;
    const move = Math.abs(dy) > Math.abs(dx) ? dy : dx;
    scroll.target = Math.max(0, Math.min(maxScroll, touchBase + move * 2));
  };

  _feedTouchEndFn = () => { touchStartX = null; touchStartY = null; };

  // Touch listeners removed — orchestrator (homepage.js) registers touch on
  // pageEl and calls feedTouchStart / feedTouchMove / feedTouchEnd only when
  // the homepage zone is active. This prevents horizontal pan from firing when
  // the user touches the underground or sky zones.

  // ── RAF tick ─────────────────────────────────────────────────────────────────
  let rafId;
  const tick = () => {
    // Under reduced motion: snap directly to target — no smooth lerp glide.
    if (REDUCED_MOTION) {
      scroll.current = scroll.target;
    } else {
      scroll.current += (scroll.target - scroll.current) * 0.08;
      if (Math.abs(scroll.target - scroll.current) < 0.5) {
        scroll.current = scroll.target;
      }
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
