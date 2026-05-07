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

document.addEventListener('DOMContentLoaded', () => {
  // Scroll engine
  const trackEl = document.getElementById('track');
  const { scrollRef, progressRef, activeIdxRef, jumpTo } = initScrollEngine({ trackEl });

  // World (parallax background)
  const worldRoot = document.getElementById('world');
  const totalWidth = 8 * window.innerWidth;
  mountWorld(worldRoot, { scrollRef, totalWidth, mode: 'horizontal' });

  // Robot (companion)
  const robotRoot = document.getElementById('robot');
  mountRobot(robotRoot);

  // Top nav + bottom strip
  mountTopNav(document.getElementById('top-nav'), { jumpTo, activeIdxRef });
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
    panelStartX: 6 * window.innerWidth, // logos is panel index 6
  });
  mountContact(document.getElementById('panel-contact'));
});
