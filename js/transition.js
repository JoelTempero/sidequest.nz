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

// ─── Tuning constants ─────────────────────────────────────────────────────────
const PAN_MULT_SINGLE  = 1.5;  // body travels 1.5× viewport height on single-hop
const PAN_MULT_TRANSIT = 2.5;  // body travels 2.5× for cross-sub-page (work ↔ sky)
const ENTRY_OFFSET_VH  = 0.4;  // destination body starts 40% viewport offset before settling

// ─── Valid directions ─────────────────────────────────────────────────────────
const VALID_DIRECTIONS = new Set([
  'down', 'up',
  'transit-up', 'transit-down',
  'return-up', 'return-down',
]);

function assertDirection(direction) {
  if (!VALID_DIRECTIONS.has(direction)) {
    console.error(`transition.js: unknown direction "${direction}"`);
  }
}

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
  return direction === 'transit-up' || direction === 'transit-down' ? PAN_MULT_TRANSIT : PAN_MULT_SINGLE;
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
 * Destination body continues the source's pan direction so the journey feels
 * like one continuous camera movement (no bounce-back).
 *
 * - Going 'down' (descent): source body went up; destination keeps going up,
 *   starting below rest (positive Y offset) and rising to 0. Visually: content
 *   appears to rise from below as the camera continues descending past it.
 * - Going 'up' (ascent): source body went down; destination keeps going down,
 *   starting above rest (negative Y offset) and dropping to 0. Visually:
 *   content drops into view as the camera continues rising past it.
 */
function entrySign(direction) {
  switch (direction) {
    case 'down':
    case 'transit-down':
    case 'return-down':
      return 1;  // descending — content rises up into rest
    case 'up':
    case 'transit-up':
    case 'return-up':
    default:
      return -1; // ascending — content drops down into rest
  }
}

// ─── transitionTo ─────────────────────────────────────────────────────────────

/**
 * Orchestrate the source-page exit animation then navigate to the destination.
 *
 * Continuity is maintained by matching body backgrounds across pages
 * (all pages use `var(--bg)`), so the navigation moment is seamless without
 * a masking overlay. The destination's themed environment renders on top of
 * that shared base immediately on load.
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

  assertDirection(direction);

  // In-flight lock — ignore double-clicks
  if (inFlight) return;
  inFlight = true;

  const sign = exitSign(direction);
  const mult = panMultiplier(direction);
  const vh   = window.innerHeight;

  document.body.style.willChange = 'transform';

  const start = performance.now();

  function tick(now) {
    const raw  = Math.min(1, (now - start) / duration);
    const t    = easeInOut(raw);
    const panY = sign * t * vh * mult;

    document.body.style.transform = `translateY(${panY}px)`;

    if (raw < 1) {
      requestAnimationFrame(tick);
    } else {
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
 * Body content starts offset in the direction of travel and settles to rest.
 * The themed environment (#environment, position:fixed) renders immediately
 * and is unaffected by the body translation, so the backdrop is visible from
 * first paint.
 *
 * @param {object} opts
 * @param {string} opts.direction  - Same direction string used in the source transitionTo call
 * @param {number} opts.duration   - Entry animation duration in ms (typically 400)
 */
export function playEntryAnimation({ direction, duration }) {
  // Reduced-motion gate — skip animation entirely
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    return;
  }

  assertDirection(direction);

  const sign = entrySign(direction);
  const vh   = window.innerHeight;

  // Body starts at a 40% viewport offset in the direction of travel, settles to 0.
  const startOffset = sign * vh * ENTRY_OFFSET_VH;

  document.body.style.willChange = 'transform';
  document.body.style.transform  = `translateY(${startOffset}px)`;

  const start = performance.now();

  function tick(now) {
    const raw = Math.min(1, (now - start) / duration);
    const t   = easeOut(raw);

    const panY = startOffset * (1 - t);
    document.body.style.transform = `translateY(${panY}px)`;

    if (raw < 1) {
      requestAnimationFrame(tick);
    } else {
      document.body.style.transform  = '';
      document.body.style.willChange = '';
    }
  }

  requestAnimationFrame(tick);
}
