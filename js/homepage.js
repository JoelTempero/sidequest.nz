import { initScrollEngine } from './scroll-engine.js';
import { mountWorld } from './world.js';
import { mountRobot } from './robot.js';
import {
  mountHero,
  mountTopNav,
  mountBottomStrip,
  mountQuest01, mountQuest02, mountQuest03, mountQuest04,
  mountSeeMore,
  mountLogos,
  mountContact,
} from './panels.js';
import { transitionTo } from './transition.js';

document.addEventListener('DOMContentLoaded', () => {
  const isMobile = window.matchMedia('(max-width: 900px)').matches;
  const isDesktop = !isMobile;

  const PANEL_COUNT = document.querySelectorAll('#track > .panel').length;
  const LOGOS_IDX = 6; // zero-based position of panel-logos in #track

  const worldRoot = document.getElementById('world');

  if (isDesktop) {
    // ── Desktop: horizontal scroll engine ──────────────────────────────────
    const trackEl = document.getElementById('track');
    const { scrollRef, progressRef, activeIdxRef, jumpTo } = initScrollEngine({ trackEl });

    const totalWidth = PANEL_COUNT * window.innerWidth;
    mountWorld(worldRoot, { scrollRef, totalWidth, mode: 'horizontal' });

    // Robot (companion)
    const robotRoot = document.getElementById('robot');
    mountRobot(robotRoot);

    // Top nav + bottom strip
    mountTopNav(document.getElementById('top-nav'), {
      jumpTo,
      activeIdxRef,
      onNavigate: (panelId) => {
        if (panelId === 'panel-hero') {
          jumpTo(0);
        } else if (panelId === 'panel-q1') {
          transitionTo({ destination: 'work.html', direction: 'down', duration: 800 });
        } else if (panelId === 'panel-contact') {
          transitionTo({ destination: 'contact.html', direction: 'up', duration: 800 });
        }
      },
    });
    mountBottomStrip(document.getElementById('bottom-strip'), { progressRef, activeIdxRef });

    // Mount each panel into its data-panel section
    mountHero(document.getElementById('panel-hero'));
    mountQuest01(document.getElementById('panel-q1'));
    mountQuest02(document.getElementById('panel-q2'));
    mountQuest03(document.getElementById('panel-q3'));
    mountQuest04(document.getElementById('panel-q4'));
    mountSeeMore(document.getElementById('panel-see'));
    mountLogos(document.getElementById('panel-logos'), {
      scrollRef,
      panelStartX: LOGOS_IDX * window.innerWidth, // logos is panel index 6
    });
    mountContact(document.getElementById('panel-contact'));

  } else {
    // ── Mobile: native vertical scroll ─────────────────────────────────────
    // No scroll engine — CSS stacks panels vertically, browser handles scroll.
    // World renders in vertical mode (reads window.scrollY directly).
    mountWorld(worldRoot, {
      scrollRef: { current: 0 }, // unused dummy — vertical mode reads window.scrollY
      totalWidth: window.innerWidth,
      mode: 'vertical',
    });

    // Top nav with scrollIntoView fallback (no jumpTo from scroll engine)
    const panels = document.querySelectorAll('#track > .panel');
    mountTopNav(document.getElementById('top-nav'), {
      jumpTo: (idx) => panels[idx]?.scrollIntoView({ behavior: 'smooth', block: 'start' }),
      activeIdxRef: { current: 0 }, // static — no RAF subscription on mobile
    });

    // No robot, no bottom strip on mobile.

    // Mount each panel
    mountHero(document.getElementById('panel-hero'));
    mountQuest01(document.getElementById('panel-q1'));
    mountQuest02(document.getElementById('panel-q2'));
    mountQuest03(document.getElementById('panel-q3'));
    mountQuest04(document.getElementById('panel-q4'));
    mountSeeMore(document.getElementById('panel-see'));
    // Logos panel: pass a dummy scrollRef and panelStartX=0 (parallax pan is negligible on mobile)
    mountLogos(document.getElementById('panel-logos'), {
      scrollRef: { current: 0 },
      panelStartX: 0,
    });
    mountContact(document.getElementById('panel-contact'));
  }
});
