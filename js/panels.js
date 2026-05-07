/**
 * panels.js
 * Hero panel + fixed chrome (top nav, bottom progress strip).
 * Ported from ref/design_handoff_homepage/panels.jsx (HeroPanel, atoms)
 * and ref/design_handoff_homepage/Sidequest Horizontal Homepage.html (App nav/strip).
 *
 * Usage:
 *   import { mountHero, mountTopNav, mountBottomStrip } from './panels.js';
 *
 *   const heroHandle    = mountHero(panelEl);
 *   const navHandle     = mountTopNav(document.body, { jumpTo, activeIdxRef });
 *   const stripHandle   = mountBottomStrip(document.body, { progressRef, activeIdxRef });
 *
 *   // Teardown:
 *   heroHandle.destroy();
 *   navHandle.destroy();
 *   stripHandle.destroy();
 */

import { subscribe } from './scroll-engine.js';

// ─── Panel labels — used by the bottom counter ────────────────────────────────

const PANEL_LABELS = [
  'HOME',     // 0
  'QUEST 01', // 1
  'QUEST 02', // 2
  'QUEST 03', // 3
  'QUEST 04', // 4
  'INDEX',    // 5
  'LOGOS',    // 6
  'CONTACT',  // 7
];

const PANEL_COUNT = PANEL_LABELS.length; // 8

// ─── Shared atoms (private helpers) ──────────────────────────────────────────

/**
 * eyebrow(text, opts?) — IBM Plex Mono micro-label with an optional leading Tick.
 * Returns a div element.
 * @param {string} text
 * @param {{ color?: string, withTick?: boolean }} [opts]
 */
function eyebrow(text, { color = '#c4b5fd', withTick = true } = {}) {
  const el = document.createElement('div');
  el.style.cssText = `
    font-family: "IBM Plex Mono", monospace;
    font-size: 11px;
    letter-spacing: 0.22em;
    text-transform: uppercase;
    color: ${color};
    display: inline-flex;
    gap: 14px;
    align-items: center;
  `;
  if (withTick) el.appendChild(tick());
  const label = document.createElement('span');
  label.textContent = text;
  el.appendChild(label);
  return el;
}

/**
 * tick() — 24×1px horizontal rule in currentColor.
 * Returns a span element.
 */
function tick() {
  const el = document.createElement('span');
  el.style.cssText = `
    display: inline-block;
    width: 24px;
    height: 1px;
    background: currentColor;
    flex-shrink: 0;
  `;
  return el;
}

/**
 * scrollArrowSvg() — inline 60×10 arrow SVG.
 * Returns an SVGElement.
 */
function scrollArrowSvg() {
  const ns  = 'http://www.w3.org/2000/svg';
  const s   = document.createElementNS(ns, 'svg');
  s.setAttribute('width',   '60');
  s.setAttribute('height',  '10');
  s.setAttribute('viewBox', '0 0 60 10');
  const p = document.createElementNS(ns, 'path');
  p.setAttribute('d',            'M0 5 L52 5 M46 1 L52 5 L46 9');
  p.setAttribute('fill',         'none');
  p.setAttribute('stroke',       'currentColor');
  p.setAttribute('stroke-width', '1');
  s.appendChild(p);
  return s;
}

// ─── Hero Panel ───────────────────────────────────────────────────────────────

/**
 * Mount the Hero panel content into panelEl.
 * The panelEl should already be the `<section data-panel>` at index 0.
 *
 * @param {HTMLElement} panelEl
 * @returns {{ destroy: () => void }}
 */
export function mountHero(panelEl) {
  // Outer: full-height flex centred vertically, padding 0 80px
  const backdrop = document.createElement('div');
  backdrop.style.cssText = `
    position: relative;
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: flex-start;
    padding: 0 80px;
  `;
  panelEl.appendChild(backdrop);

  // Inner: max-width 880px container
  const inner = document.createElement('div');
  inner.style.cssText = 'max-width: 880px;';
  backdrop.appendChild(inner);

  // Eyebrow: Tick + "SIDEQUEST · CHRISTCHURCH"
  const brow = eyebrow('SIDEQUEST · CHRISTCHURCH', { color: '#c4b5fd', withTick: true });
  inner.appendChild(brow);

  // H1 copy: "Be Known." / "Stand Out."
  // "Known." — italic weight 400 #c4b5fd; "Out." — color #b8a8d4
  const h1 = document.createElement('h1');
  h1.style.cssText = `
    font-family: "Space Grotesk", sans-serif;
    font-weight: 500;
    font-size: clamp(72px, 9vw, 152px);
    line-height: 0.92;
    letter-spacing: -0.045em;
    color: #f5f0ff;
    margin: 32px 0 0;
    text-shadow: 0 4px 40px rgba(0,0,0,0.6);
  `;

  // "Be " + <span>Known.</span> (italic, violet)
  h1.appendChild(document.createTextNode('Be '));
  const knownSpan = document.createElement('span');
  knownSpan.textContent = 'Known.';
  knownSpan.style.cssText = `
    color: #c4b5fd;
    font-style: italic;
    font-weight: 400;
  `;
  h1.appendChild(knownSpan);

  h1.appendChild(document.createElement('br'));

  // "Stand " + <span>Out.</span> (muted ink2)
  h1.appendChild(document.createTextNode('Stand '));
  const outSpan = document.createElement('span');
  outSpan.textContent = 'Out.';
  outSpan.style.color = '#b8a8d4';
  h1.appendChild(outSpan);

  inner.appendChild(h1);

  // Footer micro-line: "SCROLL → FOUR RECENT WORKS"
  const footer = document.createElement('div');
  footer.style.cssText = `
    margin-top: 40px;
    font-family: "IBM Plex Mono", monospace;
    font-size: 11px;
    letter-spacing: 0.22em;
    text-transform: uppercase;
    color: #7a6a92;
    display: inline-flex;
    gap: 16px;
    align-items: center;
  `;

  const scrollLabel = document.createElement('span');
  scrollLabel.textContent = 'SCROLL';
  footer.appendChild(scrollLabel);
  footer.appendChild(scrollArrowSvg());
  const worksLabel = document.createElement('span');
  worksLabel.textContent = 'FOUR RECENT WORKS';
  footer.appendChild(worksLabel);

  inner.appendChild(footer);

  return {
    destroy() {
      backdrop.remove();
    },
  };
}

// ─── Top Nav ──────────────────────────────────────────────────────────────────

/**
 * Build and mount the fixed top nav bar.
 *
 * @param {HTMLElement} rootEl  - Parent to append into (e.g. document.body).
 * @param {{ jumpTo: (idx: number) => void, activeIdxRef: { current: number } }} opts
 * @returns {{ destroy: () => void }}
 */
export function mountTopNav(rootEl, { jumpTo, activeIdxRef }) {
  const nav = document.createElement('nav');
  nav.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    padding: 24px 40px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    z-index: 50;
    pointer-events: none;
    background: linear-gradient(180deg, rgba(8,6,13,0.85) 0%, rgba(8,6,13,0.0) 100%);
    backdrop-filter: blur(2px);
  `;
  rootEl.appendChild(nav);

  // ── Logo + wordmark (left) ────────────────────────────────────────────────
  const brand = document.createElement('div');
  brand.style.cssText = `
    font-family: "Space Grotesk", sans-serif;
    font-size: 16px;
    font-weight: 600;
    letter-spacing: -0.01em;
    color: #f5f0ff;
    display: flex;
    align-items: center;
    gap: 10px;
    pointer-events: auto;
    cursor: pointer;
  `;

  // Logo SVG: 18×18 violet bordered square + violet check mark
  const ns = 'http://www.w3.org/2000/svg';
  const logoSvg = document.createElementNS(ns, 'svg');
  logoSvg.setAttribute('width',   '18');
  logoSvg.setAttribute('height',  '18');
  logoSvg.setAttribute('viewBox', '0 0 18 18');

  const logoRect = document.createElementNS(ns, 'rect');
  logoRect.setAttribute('x',            '0.5');
  logoRect.setAttribute('y',            '0.5');
  logoRect.setAttribute('width',        '17');
  logoRect.setAttribute('height',       '17');
  logoRect.setAttribute('fill',         'none');
  logoRect.setAttribute('stroke',       '#7c3aed');
  logoRect.setAttribute('stroke-width', '1.5');
  logoSvg.appendChild(logoRect);

  const logoCheck = document.createElementNS(ns, 'path');
  logoCheck.setAttribute('d',              'M4 9 L7.5 12.5 L14 6');
  logoCheck.setAttribute('fill',           'none');
  logoCheck.setAttribute('stroke',         '#c4b5fd');
  logoCheck.setAttribute('stroke-width',   '1.5');
  logoCheck.setAttribute('stroke-linecap', 'square');
  logoSvg.appendChild(logoCheck);

  brand.appendChild(logoSvg);

  // Wordmark: "sidequest.nz" — ".nz" rendered in violet #7c3aed
  const wordmark = document.createElement('span');
  wordmark.appendChild(document.createTextNode('sidequest'));
  const nzSpan = document.createElement('span');
  nzSpan.textContent = '.nz';
  nzSpan.style.color = '#7c3aed';
  wordmark.appendChild(nzSpan);
  brand.appendChild(wordmark);

  brand.addEventListener('click', () => jumpTo(0));
  nav.appendChild(brand);

  // ── Nav links (right) ─────────────────────────────────────────────────────
  const links = document.createElement('div');
  links.style.cssText = `
    display: flex;
    gap: 32px;
    font-family: "IBM Plex Mono", monospace;
    font-size: 11px;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    pointer-events: auto;
  `;

  // Each link: { label, onClick, isActive(idx) }
  const NAV_ITEMS = [
    {
      label:    'Home',
      onClick:  () => jumpTo(0),
      isActive: (idx) => idx === 0,
    },
    {
      label:    'Work',
      onClick:  () => jumpTo(1),
      // Active while on any of the four project panels or the index/logos panels
      isActive: (idx) => idx >= 1 && idx <= 4,
    },
    {
      label:    'Contact',
      onClick:  () => jumpTo(7),
      isActive: (idx) => idx === 7,
    },
  ];

  const linkEls = NAV_ITEMS.map(({ label, onClick, isActive }) => {
    const a = document.createElement('a');
    a.textContent   = label;
    a.style.cssText = `
      cursor: pointer;
      color: #b8a8d4;
      text-decoration: none;
    `;
    a.addEventListener('click', onClick);
    links.appendChild(a);
    return { el: a, isActive };
  });

  nav.appendChild(links);

  // ── Subscribe to scroll engine for active state updates ───────────────────
  const unsubscribe = subscribe(({ activeIdx }) => {
    for (const { el, isActive } of linkEls) {
      el.style.color = isActive(activeIdx) ? '#c4b5fd' : '#b8a8d4';
    }
  });

  return {
    destroy() {
      unsubscribe();
      nav.remove();
    },
  };
}

// ─── Bottom Strip ─────────────────────────────────────────────────────────────

/**
 * Build and mount the fixed bottom progress strip.
 *
 * @param {HTMLElement} rootEl  - Parent to append into (e.g. document.body).
 * @param {{ progressRef: { current: number }, activeIdxRef: { current: number } }} opts
 * @returns {{ destroy: () => void }}
 */
export function mountBottomStrip(rootEl, { progressRef, activeIdxRef }) {
  const strip = document.createElement('div');
  strip.style.cssText = `
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    padding: 20px 40px;
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
    z-index: 50;
    pointer-events: none;
    font-family: "IBM Plex Mono", monospace;
    font-size: 11px;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: #7a6a92;
  `;
  rootEl.appendChild(strip);

  // ── Left: panel counter ───────────────────────────────────────────────────
  // e.g. "01  /  08  HOME"
  const counter = document.createElement('div');
  counter.style.cssText = `
    display: flex;
    align-items: center;
    gap: 16px;
  `;

  const numEl   = document.createElement('span');
  numEl.style.color = '#c4b5fd';
  numEl.textContent = '01';

  const slashEl = document.createElement('span');
  slashEl.textContent = '/';

  const totalEl = document.createElement('span');
  totalEl.textContent = String(PANEL_COUNT).padStart(2, '0'); // "08" — static

  const labelEl = document.createElement('span');
  labelEl.style.cssText = 'margin-left: 14px; color: #b8a8d4;';
  labelEl.textContent = PANEL_LABELS[0];

  counter.appendChild(numEl);
  counter.appendChild(slashEl);
  counter.appendChild(totalEl);
  counter.appendChild(labelEl);
  strip.appendChild(counter);

  // ── Centre: progress bar ──────────────────────────────────────────────────
  const barWrap = document.createElement('div');
  barWrap.style.cssText = `
    flex: 1;
    margin: 0 40px;
    max-width: 600px;
    position: relative;
    align-self: center;
  `;

  const track = document.createElement('div');
  track.style.cssText = `
    height: 1px;
    background: rgba(196,181,253,0.15);
  `;
  barWrap.appendChild(track);

  const fill = document.createElement('div');
  fill.style.cssText = `
    position: absolute;
    top: 0;
    left: 0;
    height: 1px;
    width: 0%;
    background: #c4b5fd;
    transition: width 0.05s linear;
  `;
  barWrap.appendChild(fill);
  strip.appendChild(barWrap);

  // ── Right: scroll legend ──────────────────────────────────────────────────
  const legend = document.createElement('div');
  legend.style.cssText = 'display: flex; gap: 18px;';
  const scrollText = document.createElement('span');
  scrollText.textContent = 'SCROLL';
  const arrowText = document.createElement('span');
  arrowText.textContent = '↓ → ←';
  legend.appendChild(scrollText);
  legend.appendChild(arrowText);
  strip.appendChild(legend);

  // ── Subscribe to scroll engine for live updates ───────────────────────────
  const unsubscribe = subscribe(({ progress, activeIdx }) => {
    const clamped = Math.max(0, Math.min(PANEL_COUNT - 1, activeIdx));
    numEl.textContent   = String(clamped + 1).padStart(2, '0');
    labelEl.textContent = PANEL_LABELS[clamped] || '';
    fill.style.width    = `${progress * 100}%`;
  });

  return {
    destroy() {
      unsubscribe();
      strip.remove();
    },
  };
}
