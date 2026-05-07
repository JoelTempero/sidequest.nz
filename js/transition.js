/**
 * transition.js
 * Camera-pan transition orchestrator for Z-axis cross-page navigation.
 *
 * Exports:
 *   transitionTo({ destination, direction, duration })  — source-page exit
 *   playEntryAnimation({ direction, duration })          — destination-page entry
 *
 * Directions:
 *   'down'          — homepage → underground (camera pans down, body moves up)
 *   'up'            — homepage → sky (camera pans up, body moves down)
 *   'transit-up'    — underground → sky (cross-sub-page, 1600ms)
 *   'transit-down'  — sky → underground (cross-sub-page, 1600ms)
 *   'return-up'     — underground → homepage (camera pans up, body moves down)
 *   'return-down'   — sky → homepage (camera pans down, body moves up)
 */

// ─── In-flight lock ───────────────────────────────────────────────────────────
let inFlight = false;

// ─── Easing ───────────────────────────────────────────────────────────────────

/** Ease-in-out (quadratic). */
function easeInOut(t) {
  return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
}

/** Ease-out (quadratic). */
function easeOut(t) {
  return 1 - Math.pow(1 - t, 2);
}

// ─── Direction helpers ────────────────────────────────────────────────────────

/** Returns the pan multiplier for each direction. */
function panMultiplier(direction) {
  return direction === 'transit-up' || direction === 'transit-down' ? 2.5 : 1.5;
}

/**
 * Returns the sign of the body translateY for the exit animation.
 *
 * - 'down' / 'transit-down' / 'return-down':
 *     camera descends → body translates upward → negative Y
 * - 'up' / 'transit-up' / 'return-up':
 *     camera ascends → body translates downward → positive Y
 */
function exitSign(direction) {
  switch (direction) {
    case 'down':
    case 'transit-down':
    case 'return-down':
      return -1; // body goes up
    case 'up':
    case 'transit-up':
    case 'return-up':
    default:
      return 1;  // body goes down
  }
}

/**
 * Returns the starting sign for the entry animation.
 * Destination body starts offset in the direction of travel, then settles to 0.
 *
 * - Arrived from below (going 'up' / 'transit-up' / 'return-up'):
 *     source body went down, so destination starts translated down (positive Y) → animate to 0
 * - Arrived from above (going 'down' / 'transit-down' / 'return-down'):
 *     source body went up, so destination starts translated up (negative Y) → animate to 0
 */
function entrySign(direction) {
  switch (direction) {
    case 'up':
    case 'transit-up':
    case 'return-up':
      return 1;  // came from below — start translated down
    case 'down':
    case 'transit-down':
    case 'return-down':
    default:
      return -1; // came from above — start translated up
  }
}

// ─── Overlay helper ───────────────────────────────────────────────────────────

function getOverlay() {
  return document.getElementById('transition-overlay');
}

// ─── transitionTo ─────────────────────────────────────────────────────────────

/**
 * Orchestrate the source-page exit animation then navigate to the destination.
 *
 * @param {object} opts
 * @param {string} opts.destination  - URL to navigate to (e.g. 'work.html')
 * @param {string} opts.direction    - One of the six direction strings
 * @param {number} opts.duration     - Total animation duration in ms (typically 800 or 1600)
 */
export function transitionTo({ destination, direction, duration }) {
  // Reduced-motion gate — skip animation entirely
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    window.location.href = destination;
    return;
  }

  // In-flight lock — ignore double-clicks
  if (inFlight) return;
  inFlight = true;

  const overlay   = getOverlay();
  const sign      = exitSign(direction);
  const mult      = panMultiplier(direction);
  const vh        = window.innerHeight;

  document.body.style.willChange = 'transform';

  const start = performance.now();

  function tick(now) {
    const raw  = Math.min(1, (now - start) / duration);
    const t    = easeInOut(raw);
    const panY = sign * t * vh * mult;

    document.body.style.transform = `translateY(${panY}px)`;

    // Ramp overlay opacity from 0 → 1 over the last 20% (progress 0.8 → 1.0)
    if (overlay) {
      const overlayT = Math.max(0, (raw - 0.8) / 0.2);
      overlay.style.opacity = String(overlayT);
    }

    if (raw < 1) {
      requestAnimationFrame(tick);
    } else {
      // Ensure overlay is fully opaque before navigating
      if (overlay) overlay.style.opacity = '1';
      document.body.style.willChange = '';
      window.location.href = destination;
    }
  }

  requestAnimationFrame(tick);
}

// ─── playEntryAnimation ───────────────────────────────────────────────────────

/**
 * Orchestrate the destination-page entry animation.
 * Call on DOMContentLoaded on destination pages (work.html, contact.html).
 *
 * @param {object} opts
 * @param {string} opts.direction  - Same direction string used in the source transitionTo call
 * @param {number} opts.duration   - Entry animation duration in ms (typically 400)
 */
export function playEntryAnimation({ direction, duration }) {
  // Reduced-motion gate — instantly clear overlay and return
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const overlay = getOverlay();
    if (overlay) overlay.style.opacity = '0';
    return;
  }

  const overlay  = getOverlay();
  const sign     = entrySign(direction);
  const vh       = window.innerHeight;

  // Body starts at a 40% viewport offset in the direction of travel, settles to 0.
  const startOffset = sign * vh * 0.4;

  document.body.style.willChange = 'transform';
  document.body.style.transform  = `translateY(${startOffset}px)`;

  const start = performance.now();

  function tick(now) {
    const raw = Math.min(1, (now - start) / duration);
    const t   = easeOut(raw);

    // Animate body from startOffset → 0
    const panY = startOffset * (1 - t);
    document.body.style.transform = `translateY(${panY}px)`;

    // Fade overlay from 1 → 0
    if (overlay) {
      overlay.style.opacity = String(1 - t);
    }

    if (raw < 1) {
      requestAnimationFrame(tick);
    } else {
      document.body.style.transform  = '';
      document.body.style.willChange = '';
      if (overlay) overlay.style.opacity = '0';
    }
  }

  requestAnimationFrame(tick);
}
