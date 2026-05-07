/**
 * homepage.js
 * Full-site orchestrator for the single-page Z-axis architecture.
 *
 * Mounts all three zones:
 *   - Zone sky (#zone-sky):       sky environment + contact form/bio content
 *   - Zone homepage (#zone-homepage): world + robot + 8 panels + chrome
 *   - Zone underground (#zone-underground): underground environment + project list
 *
 * Owns:
 *   - Wheel handler with zone-routing logic (desktop only)
 *   - Hash routing (reads on load, listens to hashchange, updates on nav clicks)
 *   - Animated scroll between zones (800ms ease-in-out RAF lerp)
 *   - Mobile fallback: no wheel hijack, native scroll, scrollIntoView nav
 */

import { initScrollEngine, feedHorizontalDelta, feedTouchStart, feedTouchMove, feedTouchEnd } from './scroll-engine.js';
import { mountWorld } from './world.js';
import { mountRobot } from './robot.js';
import { mountSky } from './sky.js';
import { mountUnderground } from './underground.js';
import {
  mountHero,
  mountTopNav,
  mountBottomStrip,
  mountQuest01, mountQuest02, mountQuest03, mountQuest04,
  mountSeeMore,
  mountLogos,
  mountContact,
} from './panels.js';

// ─── Hash ↔ Zone mapping ─────────────────────────────────────────────────────

const ZONE_HASH = {
  '':         'homepage',
  '#work':    'underground',
  '#contact': 'sky',
};

const HASH_FOR = {
  homepage:    '',
  underground: '#work',
  sky:         '#contact',
};

// ─── RAF scroll animation ────────────────────────────────────────────────────

/**
 * Animate el.scrollTop from `from` to `to` over `duration` ms.
 * Uses ease-in-out (quadratic). Returns a cancel function.
 */
function animateScroll(el, from, to, duration) {
  let cancelled = false;
  const start = performance.now();
  function tick(now) {
    if (cancelled) return;
    const t = Math.min(1, (now - start) / duration);
    const eased = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
    el.scrollTop = from + (to - from) * eased;
    if (t < 1) requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
  return () => { cancelled = true; };
}

// ─── HTML escape helper ──────────────────────────────────────────────────────

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// ─── Sky zone content (ported from contact.html + contact-page.js) ───────────

function mountSkyContent(zoneEl) {
  const elevated = document.createElement('main');
  elevated.id = 'elevated';

  const content = document.createElement('div');
  content.className = 'elevated-content';

  content.innerHTML = `
    <span class="eyebrow">KIA ORA</span>
    <h1 id="elevated-h">I'm <span class="name">Joel.</span> <span class="muted">Say hi.</span></h1>
    <p class="bio">Solo developer based in Christchurch, NZ. Building custom websites, apps, and portals for communities, schools, and small businesses. You talk directly to the person building your thing.</p>
    <div class="contact-lines">
      <a class="email" href="mailto:joel@tempero.nz">joel@tempero.nz</a>
      <a class="phone" href="tel:+642040239009">+64 204 023 9009</a>
    </div>
    <form action="https://api.web3forms.com/submit" method="POST" class="elevated-form" id="contact-form">
      <input type="hidden" name="access_key" value="034020f4-ef4e-4f00-9988-3e99609b86c4">
      <input type="hidden" name="subject" value="New Contact from Sidequest Website">
      <input type="hidden" name="from_name" value="Sidequest Website">
      <input type="checkbox" name="botcheck" style="display:none;">
      <div class="form-row">
        <input type="text" id="name" name="name" placeholder="Your name" required>
        <input type="email" id="email" name="email" placeholder="you@company.com" required>
      </div>
      <select id="project" name="project" required>
        <option value="" disabled selected>What do you need?</option>
        <option value="website">Website</option>
        <option value="webapp">Web Application</option>
        <option value="portal">Client Portal</option>
        <option value="system">Management System</option>
        <option value="other">Something Else</option>
      </select>
      <textarea id="message" name="message" placeholder="Tell me more" rows="4" required></textarea>
      <button type="submit" class="elevated-submit" id="submit-btn">Send Message →</button>
      <p class="form-result" id="form-result"></p>
    </form>
    <div class="legal">
      <a href="pages/terms.html">Terms</a>
      <a href="pages/privacy.html">Privacy</a>
    </div>
  `;

  elevated.appendChild(content);
  zoneEl.appendChild(elevated);

  // Wire form submit
  const form = document.getElementById('contact-form');
  const resultEl = document.getElementById('form-result');
  const submitBtn = document.getElementById('submit-btn');
  if (!form || !resultEl || !submitBtn) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Sending…';
    submitBtn.disabled = true;
    resultEl.textContent = '';
    resultEl.style.color = '';

    try {
      const response = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify(Object.fromEntries(new FormData(form))),
      });
      const data = await response.json();

      if (data.success) {
        resultEl.textContent = "Message sent! I'll be in touch soon.";
        resultEl.style.color = '#22c55e';
        form.reset();
      } else {
        throw new Error(data.message || 'submit failed');
      }
    } catch (err) {
      resultEl.textContent = 'Something went wrong. Please try again.';
      resultEl.style.color = '#ef4444';
    }

    submitBtn.textContent = originalText;
    submitBtn.disabled = false;
  });
}

// ─── Underground zone content (ported from work.html + work-page.js) ─────────

async function fetchProjectsAndRender(zoneEl) {
  // Build the archive structure
  const archive = document.createElement('main');
  archive.id = 'archive';

  const intro = document.createElement('header');
  intro.className = 'archive-intro';
  intro.innerHTML = `
    <span class="eyebrow">THE ARCHIVE</span>
    <h1 id="archive-h">Five quests so far. More to dig up.</h1>
  `;
  archive.appendChild(intro);

  const list = document.createElement('ol');
  list.className = 'project-list';
  list.id = 'project-list';
  archive.appendChild(list);

  zoneEl.appendChild(archive);

  // Fetch and render projects
  try {
    const response = await fetch('projects/manifest.json');
    const projects = await response.json();

    const total = projects.length;
    const totalStr = String(total).padStart(2, '0');

    list.innerHTML = projects.map((p, i) => {
      const num = String(i + 1).padStart(2, '0');
      const align = i % 2 === 0 ? 'entry-left' : 'entry-right';
      const year = (p.date || '').slice(0, 4);
      const sub = `${p.title} · ${p.category} · ${year}`;
      const tags = (p.tags || []).map(t => `<span class="tag">${escapeHtml(t)}</span>`).join('');
      const headingId = `case-${p.slug}-h`;

      return `
        <li class="project-entry ${align}" aria-labelledby="${headingId}">
          <div class="text-col">
            <span class="eyebrow">CASE STUDY ${num} / ${totalStr}</span>
            <h2 id="${headingId}">${escapeHtml(p.title)}</h2>
            <p class="sub">${escapeHtml(sub)}</p>
            <p class="summary">${escapeHtml(p.summary)}</p>
            <div class="tags">${tags}</div>
            <a class="case-study-link" href="projects/${p.slug}/">View case study →</a>
          </div>
          <div class="image-col">
            <div class="project-image">
              ${p.featuredImage ? `<img src="${escapeHtml(p.featuredImage)}" alt="${escapeHtml(p.title)}">` : ''}
              <div class="vignette"></div>
            </div>
          </div>
        </li>
      `;
    }).join('');
  } catch (err) {
    console.error('Failed to load projects manifest:', err);
  }
}

// ─── Main ────────────────────────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', () => {
  const isMobile = window.matchMedia('(max-width: 900px)').matches;
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const pageEl = document.getElementById('page');

  // Zone Y positions (computed once; recomputed on resize)
  let skyY        = 0;
  let homepageY   = window.innerHeight;
  let undergroundY = window.innerHeight * 2;

  function recomputeZoneY() {
    skyY         = 0;
    homepageY    = window.innerHeight;
    undergroundY = window.innerHeight * 2;
  }
  window.addEventListener('resize', recomputeZoneY);

  // ── In-flight lock (suppress wheel during animated scroll) ───────────────────
  let inFlight = false;
  let inFlightTimeoutId = null;

  // ── scrollToZone ─────────────────────────────────────────────────────────────
  let cancelActiveScroll = null;

  function scrollToZone(zoneId, { animated = true } = {}) {
    // On desktop, zone Y positions are fixed multiples of innerHeight (scroll camera model).
    // On mobile, zones are natural-height document sections — resolve from element offsetTop.
    let targetY;
    if (isMobile) {
      const zoneEl = document.getElementById(`zone-${zoneId}`);
      if (!zoneEl) return;
      targetY = zoneEl.offsetTop;
    } else {
      targetY = { sky: skyY, homepage: homepageY, underground: undergroundY }[zoneId];
      if (targetY === undefined) return;
    }

    // Update URL hash (pushState so back/forward works).
    // Use window.location.pathname so subpath deployments don't get reset to root.
    const newHash = HASH_FOR[zoneId];
    const currentHash = window.location.hash;
    if (newHash !== currentHash) {
      history.pushState(null, '', window.location.pathname + newHash);
    }

    if (animated && !isMobile && !prefersReducedMotion) {
      // Cancel any pending inFlight timeout from a prior animation
      if (inFlightTimeoutId) {
        clearTimeout(inFlightTimeoutId);
        inFlightTimeoutId = null;
      }
      inFlight = true;
      if (cancelActiveScroll) cancelActiveScroll();
      cancelActiveScroll = animateScroll(pageEl, pageEl.scrollTop, targetY, 800);
      // Clear in-flight flag after animation completes (duration 800ms + 20ms buffer)
      inFlightTimeoutId = setTimeout(() => {
        inFlight = false;
        cancelActiveScroll = null;
        inFlightTimeoutId = null;
      }, 820);
    } else if (isMobile) {
      // On mobile, #page has overflow-y: visible so pageEl.scrollTop is a no-op.
      // Drive the document scroll via window.scrollTo. Use smooth for animated nav,
      // instant for initial load and reduced-motion.
      const behavior = (animated && !prefersReducedMotion) ? 'smooth' : 'instant';
      window.scrollTo({ top: targetY, behavior });
      inFlight = false;
    } else {
      pageEl.scrollTop = targetY;
      inFlight = false;
    }
  }

  // ── Mount homepage zone ───────────────────────────────────────────────────────
  if (!isMobile) {
    // Desktop: horizontal scroll engine + full environment
    const trackEl = document.getElementById('track');
    const PANEL_COUNT = trackEl ? trackEl.querySelectorAll('.panel').length : 8;
    const LOGOS_IDX = 6;

    const { scrollRef, progressRef, activeIdxRef, jumpTo } = initScrollEngine({ trackEl });
    const totalWidth = PANEL_COUNT * window.innerWidth;

    mountWorld(document.getElementById('world'), { scrollRef, totalWidth, mode: 'horizontal' });
    mountRobot(document.getElementById('robot'));

    mountTopNav(document.getElementById('top-nav'), {
      jumpTo,
      onZoneClick: (zoneId) => scrollToZone(zoneId, { animated: true }),
    });

    mountBottomStrip(document.getElementById('bottom-strip'), { progressRef, activeIdxRef });

    // Mount panels
    mountHero(document.getElementById('panel-hero'));
    mountQuest01(document.getElementById('panel-q1'));
    mountQuest02(document.getElementById('panel-q2'));
    mountQuest03(document.getElementById('panel-q3'));
    mountQuest04(document.getElementById('panel-q4'));
    mountSeeMore(document.getElementById('panel-see'));
    mountLogos(document.getElementById('panel-logos'), {
      scrollRef,
      panelStartX: LOGOS_IDX * window.innerWidth,
    });
    mountContact(document.getElementById('panel-contact'));

    // ── Wheel handler (desktop only) ─────────────────────────────────────────
    pageEl.addEventListener('wheel', (e) => {
      if (inFlight) {
        e.preventDefault();
        return;
      }

      const scrollTop = pageEl.scrollTop;
      const inHomepage = Math.abs(scrollTop - homepageY) < 50;
      const inSky      = scrollTop < homepageY - 50;
      const inUnderground = scrollTop > homepageY + 50;

      if (inHomepage) {
        e.preventDefault();
        pageEl.scrollTop = homepageY; // clamp vertical drift
        const dy = Math.abs(e.deltaY) > Math.abs(e.deltaX) ? e.deltaY : e.deltaX;
        feedHorizontalDelta(dy);
      } else if (inSky) {
        e.preventDefault();
        pageEl.scrollTop = skyY; // clamp; sky is static
      } else if (inUnderground) {
        // Underground: allow native vertical scroll, but clamp at the top boundary
        if (pageEl.scrollTop < undergroundY) {
          e.preventDefault();
          pageEl.scrollTop = undergroundY;
        }
        // else: native scroll through underground content
      }
    }, { passive: false });

    // ── Keyboard handler (desktop — horizontal navigation in homepage zone) ───
    window.addEventListener('keydown', (e) => {
      if (inFlight) return;
      const scrollTop = pageEl.scrollTop;
      const inHomepage = Math.abs(scrollTop - homepageY) < 50;
      if (!inHomepage) return;

      if (['ArrowRight', 'ArrowDown', 'PageDown'].includes(e.key)) {
        feedHorizontalDelta(window.innerWidth * 0.7);
      } else if (['ArrowLeft', 'ArrowUp', 'PageUp'].includes(e.key)) {
        feedHorizontalDelta(-window.innerWidth * 0.7);
      } else if (e.key === 'Home') {
        jumpTo(0);
      } else if (e.key === 'End') {
        feedHorizontalDelta(Infinity);
      }
    });

    // ── Touch handler (desktop — zone-gated, registered on pageEl not window) ─
    // Only routes to horizontal pan when the homepage zone is active.
    // Sky and underground receive native browser scroll unimpeded.
    pageEl.addEventListener('touchstart', (e) => {
      const inHomepage = Math.abs(pageEl.scrollTop - homepageY) < 50;
      if (!inHomepage) return;
      feedTouchStart(e.touches[0].clientX, e.touches[0].clientY);
    }, { passive: true });

    pageEl.addEventListener('touchmove', (e) => {
      const inHomepage = Math.abs(pageEl.scrollTop - homepageY) < 50;
      if (!inHomepage) return;
      feedTouchMove(e.touches[0].clientX, e.touches[0].clientY);
    }, { passive: true });

    pageEl.addEventListener('touchend', () => {
      feedTouchEnd();
    });

  } else {
    // ── Mobile: native vertical scroll ───────────────────────────────────────
    mountWorld(document.getElementById('world'), {
      scrollRef: { current: 0 },
      totalWidth: window.innerWidth,
      mode: 'vertical',
    });

    const panels = document.querySelectorAll('#zone-homepage .panel');

    mountTopNav(document.getElementById('top-nav'), {
      jumpTo: (idx) => panels[idx]?.scrollIntoView({ behavior: 'smooth', block: 'start' }),
      onZoneClick: (zoneId) => {
        // Use scrollToZone so the URL hash updates and the correct scroll method is used.
        // scrollToZone on mobile uses window.scrollTo for initial/instant jumps,
        // and zone zone Y is computed from the actual zone element's offsetTop.
        scrollToZone(zoneId, { animated: !prefersReducedMotion });
      },
    });

    // Mount panels (no robot, no bottom strip on mobile)
    mountHero(document.getElementById('panel-hero'));
    mountQuest01(document.getElementById('panel-q1'));
    mountQuest02(document.getElementById('panel-q2'));
    mountQuest03(document.getElementById('panel-q3'));
    mountQuest04(document.getElementById('panel-q4'));
    mountSeeMore(document.getElementById('panel-see'));
    mountLogos(document.getElementById('panel-logos'), {
      scrollRef: { current: 0 },
      panelStartX: 0,
    });
    mountContact(document.getElementById('panel-contact'));
  }

  // ── Mount sky zone ────────────────────────────────────────────────────────
  // Create an inner env container so mountSky doesn't overwrite the zone's
  // position/height (which must remain relative+100vh for the scroll camera to work).
  const skyEnvEl = document.createElement('div');
  skyEnvEl.id = 'sky-env';
  document.getElementById('zone-sky').appendChild(skyEnvEl);
  mountSky(skyEnvEl);
  mountSkyContent(document.getElementById('zone-sky'));

  // ── Mount underground zone ────────────────────────────────────────────────
  const undergroundEnvEl = document.createElement('div');
  undergroundEnvEl.id = 'underground-env';
  document.getElementById('zone-underground').appendChild(undergroundEnvEl);
  mountUnderground(undergroundEnvEl, {
    getScrollY: () => Math.max(0, pageEl.scrollTop - undergroundY),
  });
  fetchProjectsAndRender(document.getElementById('zone-underground'));

  // ── Hash routing: initial scroll position ────────────────────────────────
  const initialZone = ZONE_HASH[window.location.hash] || 'homepage';
  // Instant jump on load (no animation)
  scrollToZone(initialZone, { animated: false });

  // ── Hash routing: browser back/forward ───────────────────────────────────
  window.addEventListener('hashchange', () => {
    const zone = ZONE_HASH[window.location.hash] || 'homepage';
    scrollToZone(zone, { animated: !isMobile });
  });
});
