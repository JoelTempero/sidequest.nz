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

// ─── Project Panels ───────────────────────────────────────────────────────────

/**
 * ProjectImage(src, alt) — image container with vignette overlay, filter, box-shadow.
 * Returns the container div element.
 *
 * @param {string} src
 * @param {string} alt
 * @returns {HTMLElement}
 */
function ProjectImage(src, alt) {
  const container = document.createElement('div');
  container.style.cssText = `
    width: min(420px, 32vw);
    aspect-ratio: 4/5;
    position: relative;
    margin-bottom: 18vh;
    box-shadow: 0 60px 140px -40px rgba(0,0,0,0.7), 0 0 0 1px rgba(196,181,253,0.20);
    overflow: hidden;
    background: #100819;
  `;

  const img = document.createElement('img');
  img.src = src;
  img.alt = alt;
  img.style.cssText = `
    width: 100%;
    height: 100%;
    object-fit: cover;
    filter: saturate(0.85) contrast(1.05);
    display: block;
  `;
  container.appendChild(img);

  // Subtle violet vignette overlay — positioned div on top of the image
  const vignette = document.createElement('div');
  vignette.style.cssText = `
    position: absolute;
    inset: 0;
    background: linear-gradient(160deg, rgba(124,58,237,0.18) 0%, transparent 35%, rgba(8,6,13,0.45) 100%);
    pointer-events: none;
  `;
  container.appendChild(vignette);

  return container;
}

/**
 * mountProjectPanel(panelEl, opts) — generic Quest panel (two-column grid, text + image).
 *
 * @param {HTMLElement} panelEl
 * @param {{
 *   number: number,
 *   sector: string,
 *   headline: string,
 *   sub: string,
 *   imageSrc: string,
 *   imageAlt: string,
 *   ctaHref: string,
 *   align: 'left' | 'right',
 * }} opts
 * @returns {{ destroy: () => void }}
 */
export function mountProjectPanel(panelEl, opts) {
  const { number, sector, headline, sub, imageSrc, imageAlt, ctaHref, align = 'left' } = opts;
  const imageOnRight = align === 'left';

  // Outer grid container — full height, two columns
  const grid = document.createElement('div');
  grid.style.cssText = `
    position: relative;
    height: 100%;
    display: grid;
    grid-template-columns: 1fr 1fr;
    align-items: center;
    padding: 0 80px;
    gap: 60px;
  `;
  panelEl.appendChild(grid);

  // ── Text column ────────────────────────────────────────────────────────────
  const textCol = document.createElement('div');
  textCol.style.cssText = `
    grid-column: ${imageOnRight ? 1 : 2};
    text-align: ${align};
    justify-self: ${align === 'right' ? 'end' : 'start'};
    max-width: 560px;
  `;

  // Eyebrow — mixed colour: "QUEST 0X / 04" in violet, tick, sector in default ink
  const brow = document.createElement('div');
  brow.style.cssText = `
    font-family: "IBM Plex Mono", monospace;
    font-size: 11px;
    letter-spacing: 0.22em;
    text-transform: uppercase;
    color: #c4b5fd;
    display: inline-flex;
    gap: 14px;
    align-items: center;
  `;

  const questLabel = document.createElement('span');
  questLabel.textContent = `QUEST ${String(number).padStart(2, '0')} / 04`;
  questLabel.style.color = '#c4b5fd';
  brow.appendChild(questLabel);

  brow.appendChild(tick());

  const sectorLabel = document.createElement('span');
  sectorLabel.textContent = sector;
  brow.appendChild(sectorLabel);

  textCol.appendChild(brow);

  // H2 headline
  const h2 = document.createElement('h2');
  h2.textContent = headline;
  h2.style.cssText = `
    font-family: "Space Grotesk", sans-serif;
    font-weight: 500;
    font-size: clamp(34px, 3.6vw, 62px);
    line-height: 0.95;
    letter-spacing: -0.04em;
    color: #f5f0ff;
    margin: 24px 0 0;
    text-shadow: 0 4px 40px rgba(0,0,0,0.6);
  `;
  textCol.appendChild(h2);

  // Sub-line — uppercased, mono, muted
  const subEl = document.createElement('div');
  subEl.textContent = sub;
  subEl.style.cssText = `
    margin-top: 24px;
    font-family: "IBM Plex Mono", monospace;
    font-size: 12px;
    letter-spacing: 0.16em;
    text-transform: uppercase;
    color: #b8a8d4;
  `;
  textCol.appendChild(subEl);

  // Quest CTA — "View case study →" real <a> link
  const cta = document.createElement('a');
  cta.href = ctaHref;
  cta.textContent = 'View case study →';
  cta.style.cssText = `
    display: inline-block;
    margin-top: 20px;
    font-family: "IBM Plex Mono", monospace;
    font-size: 11px;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: #c4b5fd;
    text-decoration: none;
    border-bottom: 1px solid transparent;
    transition: border-color 0.2s;
  `;
  cta.addEventListener('mouseenter', () => {
    cta.style.borderBottomColor = 'rgba(196,181,253,0.40)';
  });
  cta.addEventListener('mouseleave', () => {
    cta.style.borderBottomColor = 'transparent';
  });
  textCol.appendChild(cta);

  // ── Image column ───────────────────────────────────────────────────────────
  const imgCol = document.createElement('div');
  imgCol.style.cssText = `
    grid-column: ${imageOnRight ? 2 : 1};
    justify-self: ${imageOnRight ? 'end' : 'start'};
  `;
  imgCol.appendChild(ProjectImage(imageSrc, imageAlt));

  // Append columns in DOM order (grid-column handles visual placement)
  if (imageOnRight) {
    grid.appendChild(textCol);
    grid.appendChild(imgCol);
  } else {
    grid.appendChild(imgCol);
    grid.appendChild(textCol);
  }

  return {
    destroy() {
      grid.remove();
    },
  };
}

// ─── Quest panel exports ───────────────────────────────────────────────────────

/**
 * Quest 01 — Chill Air / TRADES
 * @param {HTMLElement} panelEl
 * @returns {{ destroy: () => void }}
 */
export function mountQuest01(panelEl) {
  return mountProjectPanel(panelEl, {
    number: 1,
    sector: 'TRADES',
    headline: 'Job sheets, off the kitchen counter.',
    sub: 'Chill Air · website + client portal · 2026',
    imageSrc: 'https://images.unsplash.com/photo-1497486751825-1233686d5d80?w=1200&q=80',
    imageAlt: 'Chill Air',
    ctaHref: 'projects/chill-air/',
    align: 'left',
  });
}

/**
 * Quest 02 — Storybook Weddings / WEDDINGS
 * @param {HTMLElement} panelEl
 * @returns {{ destroy: () => void }}
 */
export function mountQuest02(panelEl) {
  return mountProjectPanel(panelEl, {
    number: 2,
    sector: 'WEDDINGS',
    headline: 'Photos delivered, not chased.',
    sub: 'Storybook Weddings · website + client portal · 2026',
    imageSrc: 'https://images.unsplash.com/photo-1553284965-83fd3e82fa5a?w=1200&q=80',
    imageAlt: 'Storybook Weddings',
    ctaHref: 'projects/storybook-weddings/',
    align: 'right',
  });
}

/**
 * Quest 03 — My Living Hope / COMMERCE
 * @param {HTMLElement} panelEl
 * @returns {{ destroy: () => void }}
 */
export function mountQuest03(panelEl) {
  return mountProjectPanel(panelEl, {
    number: 3,
    sector: 'COMMERCE',
    headline: "Off-the-shelf wouldn't do.",
    sub: 'My Living Hope · custom Shopify theme · 2026',
    imageSrc: 'https://images.unsplash.com/photo-1465847899084-d164df4dedc6?w=1200&q=80',
    imageAlt: 'My Living Hope',
    ctaHref: 'projects/my-living-hope/',
    align: 'left',
  });
}

/**
 * Quest 04 — 24CHCH / ARTS
 * @param {HTMLElement} panelEl
 * @returns {{ destroy: () => void }}
 */
export function mountQuest04(panelEl) {
  return mountProjectPanel(panelEl, {
    number: 4,
    sector: 'ARTS',
    headline: 'One weekend, every short film.',
    sub: '24CHCH · annual film competition · 2026',
    imageSrc: 'https://images.unsplash.com/photo-1517292987719-0369a794ec0f?w=1200&q=80',
    imageAlt: '24CHCH',
    ctaHref: 'projects/24chch/',
    align: 'right',
  });
}

// ─── bigLink helper ───────────────────────────────────────────────────────────

/**
 * bigLink({ label, href, primary }) — filled or ghost CTA anchor.
 * primary: filled #7c3aed bg, color #f5f0ff, no border.
 * ghost:   transparent bg, 1px rgba(196,181,253,0.20) border, backdrop-filter blur(4px).
 * Both: Space Grotesk 18px weight 500, padding 18px 28px, no border-radius.
 *
 * @param {{ label: string, href: string, primary?: boolean }} opts
 * @returns {HTMLAnchorElement}
 */
function bigLink({ label, href, primary = false }) {
  const a = document.createElement('a');
  a.href = href;
  a.textContent = label;
  a.style.cssText = `
    display: inline-flex;
    align-items: center;
    gap: 14px;
    padding: 18px 28px;
    font-family: "Space Grotesk", sans-serif;
    font-size: 18px;
    font-weight: 500;
    letter-spacing: -0.01em;
    text-decoration: none;
    background: ${primary ? '#7c3aed' : 'transparent'};
    color: ${primary ? '#f5f0ff' : '#f5f0ff'};
    border: ${primary ? 'none' : '1px solid rgba(196,181,253,0.20)'};
    ${primary ? '' : 'backdrop-filter: blur(4px);'}
    cursor: pointer;
  `;
  return a;
}

// ─── See More Panel ───────────────────────────────────────────────────────────

/**
 * Mount the "See More / Index" panel.
 * ONE CTA only — "Full work index →" (primary). Field notes hidden for launch.
 * H2: "More quests in the back catalogue." — numbers dropped per spec.
 *
 * @param {HTMLElement} panelEl
 * @returns {{ destroy: () => void }}
 */
export function mountSeeMore(panelEl) {
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

  // Inner: max-width 820px container
  const inner = document.createElement('div');
  inner.style.cssText = 'max-width: 820px;';
  backdrop.appendChild(inner);

  // Eyebrow: Tick + "THERE'S MORE"
  const brow = eyebrow("THERE'S MORE", { color: '#c4b5fd', withTick: true });
  inner.appendChild(brow);

  // H2: "More quests in the back catalogue."
  const h2 = document.createElement('h2');
  h2.style.cssText = `
    font-family: "Space Grotesk", sans-serif;
    font-weight: 500;
    font-size: clamp(34px, 3.8vw, 64px);
    line-height: 0.95;
    letter-spacing: -0.04em;
    color: #f5f0ff;
    margin: 24px 0 0;
    text-shadow: 0 4px 40px rgba(0,0,0,0.6);
  `;
  h2.textContent = 'More quests in the back catalogue.';
  inner.appendChild(h2);

  // CTA row — ONE link only (Field notes hidden for launch)
  const ctaRow = document.createElement('div');
  ctaRow.style.cssText = `
    margin-top: 36px;
    display: flex;
    gap: 12px;
  `;
  ctaRow.appendChild(bigLink({ label: 'Full work index →', href: 'work.html', primary: true }));
  inner.appendChild(ctaRow);

  return {
    destroy() {
      backdrop.remove();
    },
  };
}

// ─── Logos Panel ──────────────────────────────────────────────────────────────

/**
 * Mount the "Logos / Trusted by" panel with 10 parallax-bobbing fake logos.
 * Positions, depths, rotations copied verbatim from panels.jsx LOGO_POSITIONS.
 *
 * @param {HTMLElement} panelEl
 * @param {{ scrollRef: { current: number }, panelStartX: number }} opts
 * @returns {{ destroy: () => void }}
 */
export function mountLogos(panelEl, { scrollRef, panelStartX }) {
  // Panel container: relative + overflow hidden
  panelEl.style.overflow = 'hidden';
  panelEl.style.position = 'relative';

  // Eyebrow — absolute, top 12vh, left 80px
  const browWrap = document.createElement('div');
  browWrap.style.cssText = `
    position: absolute;
    top: 12vh;
    left: 80px;
    z-index: 5;
  `;
  const brow = eyebrow("A FEW OF THE PEOPLE I'VE BUILT FOR", { color: '#c4b5fd', withTick: true });
  browWrap.appendChild(brow);
  panelEl.appendChild(browWrap);

  // Sub-text — absolute, bottom 14vh, right 80px
  const subText = document.createElement('div');
  subText.style.cssText = `
    position: absolute;
    bottom: 14vh;
    right: 80px;
    z-index: 5;
    font-family: "IBM Plex Mono", monospace;
    font-size: 11px;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: #7a6a92;
  `;
  subText.textContent = '─ AND TWENTY-SIX OTHERS ACROSS AOTEAROA';
  panelEl.appendChild(subText);

  // 10 logos — verbatim from panels.jsx
  const logos = [
    { name: 'Maungatua',           kind: 'mark', x: 8,  y: 18, depth: 0.85, rot: -3 },
    { name: 'Coast Pony Club',     kind: 'word', x: 28, y: 64, depth: 0.40, rot:  2 },
    { name: 'Selwyn Choristers',   kind: 'word', x: 52, y: 22, depth: 0.70, rot: -1 },
    { name: 'Kōwhai Lab',          kind: 'mark', x: 73, y: 58, depth: 0.95, rot:  4 },
    { name: 'Tūī & Co.',           kind: 'word', x: 18, y: 78, depth: 0.25, rot:  0 },
    { name: 'Halberg Foundation',  kind: 'word', x: 88, y: 30, depth: 0.55, rot: -2 },
    { name: 'Ōtautahi Build',      kind: 'mark', x: 40, y: 44, depth: 0.30, rot:  1 },
    { name: 'Riverbend Press',     kind: 'word', x: 62, y: 76, depth: 0.60, rot: -4 },
    { name: 'Southern Cross',      kind: 'word', x: 82, y: 80, depth: 0.50, rot:  3 },
    { name: 'Whēkau Studio',       kind: 'mark', x: 12, y: 42, depth: 0.75, rot: -2 },
  ];

  // SVG mark shapes — five variants cycled by index (verbatim from FakeLogo in panels.jsx)
  function makeMark(idx) {
    const ns = 'http://www.w3.org/2000/svg';
    const svg = document.createElementNS(ns, 'svg');
    svg.setAttribute('width', '22');
    svg.setAttribute('height', '22');
    svg.setAttribute('viewBox', '0 0 24 24');

    const shapeIdx = idx % 5;
    let el;
    if (shapeIdx === 0) {
      // square with diagonal
      const g = document.createElementNS(ns, 'g');
      const rect = document.createElementNS(ns, 'rect');
      rect.setAttribute('x', '2'); rect.setAttribute('y', '2');
      rect.setAttribute('width', '20'); rect.setAttribute('height', '20');
      rect.setAttribute('stroke', 'currentColor'); rect.setAttribute('stroke-width', '1.5');
      rect.setAttribute('fill', 'none');
      g.appendChild(rect);
      const line = document.createElementNS(ns, 'line');
      line.setAttribute('x1', '2'); line.setAttribute('y1', '22');
      line.setAttribute('x2', '22'); line.setAttribute('y2', '2');
      line.setAttribute('stroke', 'currentColor'); line.setAttribute('stroke-width', '1.5');
      g.appendChild(line);
      el = g;
    } else if (shapeIdx === 1) {
      // circle + dot
      const g = document.createElementNS(ns, 'g');
      const circle = document.createElementNS(ns, 'circle');
      circle.setAttribute('cx', '12'); circle.setAttribute('cy', '12'); circle.setAttribute('r', '10');
      circle.setAttribute('stroke', 'currentColor'); circle.setAttribute('stroke-width', '1.5');
      circle.setAttribute('fill', 'none');
      g.appendChild(circle);
      const dot = document.createElementNS(ns, 'circle');
      dot.setAttribute('cx', '12'); dot.setAttribute('cy', '12'); dot.setAttribute('r', '3');
      dot.setAttribute('fill', 'currentColor');
      g.appendChild(dot);
      el = g;
    } else if (shapeIdx === 2) {
      // triangle
      const g = document.createElementNS(ns, 'g');
      const poly = document.createElementNS(ns, 'polygon');
      poly.setAttribute('points', '12,3 22,21 2,21');
      poly.setAttribute('stroke', 'currentColor'); poly.setAttribute('stroke-width', '1.5');
      poly.setAttribute('fill', 'none');
      g.appendChild(poly);
      el = g;
    } else if (shapeIdx === 3) {
      // stacked bars
      const g = document.createElementNS(ns, 'g');
      [[3,4,18,3],[3,11,12,3],[3,18,18,3]].forEach(([x, y, w, h]) => {
        const rect = document.createElementNS(ns, 'rect');
        rect.setAttribute('x', x); rect.setAttribute('y', y);
        rect.setAttribute('width', w); rect.setAttribute('height', h);
        rect.setAttribute('fill', 'currentColor');
        g.appendChild(rect);
      });
      el = g;
    } else {
      // arrow
      const g = document.createElementNS(ns, 'g');
      const path = document.createElementNS(ns, 'path');
      path.setAttribute('d', 'M3 12 L18 12 M14 6 L20 12 L14 18');
      path.setAttribute('stroke', 'currentColor'); path.setAttribute('stroke-width', '1.8');
      path.setAttribute('fill', 'none'); path.setAttribute('stroke-linecap', 'square');
      g.appendChild(path);
      el = g;
    }
    svg.appendChild(el);
    return svg;
  }

  const rafs = [];
  const logoEls = [];

  logos.forEach((logo, i) => {
    const { name, kind, x, y, depth, rot } = logo;

    // Outer wrapper — positioned absolutely, reads scrollRef in RAF
    const wrapper = document.createElement('div');
    wrapper.style.cssText = `
      position: absolute;
      left: ${x}%;
      top: ${y}%;
      will-change: transform;
    `;

    // Inner — scale + opacity + blur from depth
    const scale   = 0.7 + depth * 0.6;
    const opacity = 0.35 + depth * 0.55;
    const blur    = depth < 0.5 ? (0.5 - depth) * 2 : 0;
    const inner = document.createElement('div');
    inner.style.cssText = `
      transform: scale(${scale});
      opacity: ${opacity};
      ${blur > 0 ? `filter: blur(${blur}px);` : ''}
    `;

    // FakeLogo: mark SVG + wordmark text
    const logoEl = document.createElement('div');
    logoEl.style.cssText = `
      display: flex;
      align-items: center;
      gap: 10px;
      color: #b8a8d4;
      opacity: 0.85;
    `;

    logoEl.appendChild(makeMark(i));

    const fontFamily = (i % 2 === 0) ? '"Space Grotesk", sans-serif' : '"IBM Plex Mono", monospace';
    const fontStyle  = (i % 3 === 0) ? 'italic' : 'normal';
    const fontWeight = (i % 2 === 0) ? 600 : 500;
    const letterSpacing = (kind === 'mark') ? '0.02em' : '-0.01em';

    const wordmark = document.createElement('span');
    wordmark.textContent = name;
    wordmark.style.cssText = `
      font-family: ${fontFamily};
      font-style: ${fontStyle};
      font-weight: ${fontWeight};
      font-size: 15px;
      letter-spacing: ${letterSpacing};
      white-space: nowrap;
    `;
    logoEl.appendChild(wordmark);

    inner.appendChild(logoEl);
    wrapper.appendChild(inner);
    panelEl.appendChild(wrapper);
    logoEls.push(wrapper);

    // Per-logo RAF: bob + parallax pan (verbatim from ParallaxLogo useEffect)
    const bobPhase = i * 0.7;
    let raf;
    const tickFn = () => {
      const t = performance.now() * 0.0008;
      const bobY = Math.sin(t + bobPhase) * (4 + (1 - depth) * 6);
      const bobX = Math.cos(t * 0.7 + bobPhase) * (3 + (1 - depth) * 5);
      const localX = (scrollRef.current || 0) - (panelStartX || 0);
      const parX = -localX * (depth * 0.35);
      wrapper.style.transform = `translate3d(${parX + bobX}px, ${bobY}px, 0) rotate(${rot}deg)`;
      raf = requestAnimationFrame(tickFn);
    };
    raf = requestAnimationFrame(tickFn);
    rafs.push(() => cancelAnimationFrame(raf));
  });

  return {
    destroy() {
      rafs.forEach(cancel => cancel());
      browWrap.remove();
      subText.remove();
      logoEls.forEach(el => el.remove());
    },
  };
}

// ─── Contact Panel ────────────────────────────────────────────────────────────

/**
 * Mount the Contact panel.
 * Right-aligned, max-width 820px.
 * H2 "I'm Joel. Say hi." — "Joel." italic violet, "Say hi." muted.
 * Two real anchor links: mailto + tel.
 *
 * @param {HTMLElement} panelEl
 * @returns {{ destroy: () => void }}
 */
export function mountContact(panelEl) {
  // Outer: full-height flex centred vertically, right-aligned, padding 0 80px
  const backdrop = document.createElement('div');
  backdrop.style.cssText = `
    position: relative;
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: flex-end;
    padding: 0 80px;
  `;
  panelEl.appendChild(backdrop);

  // Inner: max-width 820px container, text right
  const inner = document.createElement('div');
  inner.style.cssText = `
    max-width: 820px;
    text-align: right;
  `;
  backdrop.appendChild(inner);

  // Eyebrow: "KIA ORA" + Tick (tick after label for right-align per JSX)
  const brow = document.createElement('div');
  brow.style.cssText = `
    font-family: "IBM Plex Mono", monospace;
    font-size: 11px;
    letter-spacing: 0.22em;
    text-transform: uppercase;
    color: #c4b5fd;
    display: inline-flex;
    gap: 14px;
    align-items: center;
  `;
  const kiaOra = document.createElement('span');
  kiaOra.textContent = 'KIA ORA';
  brow.appendChild(kiaOra);
  brow.appendChild(tick());
  inner.appendChild(brow);

  // H2: "I'm Joel. Say hi."
  // "Joel." — italic violet #c4b5fd
  // "Say hi." — muted #7a6a92
  const h2 = document.createElement('h2');
  h2.style.cssText = `
    font-family: "Space Grotesk", sans-serif;
    font-weight: 500;
    font-size: clamp(38px, 4vw, 70px);
    line-height: 0.95;
    letter-spacing: -0.04em;
    color: #f5f0ff;
    margin: 24px 0 0;
    text-shadow: 0 4px 40px rgba(0,0,0,0.6);
  `;
  h2.appendChild(document.createTextNode("I'm "));
  const joelSpan = document.createElement('span');
  joelSpan.textContent = 'Joel.';
  joelSpan.style.cssText = `
    color: #c4b5fd;
    font-style: italic;
    font-weight: 400;
  `;
  h2.appendChild(joelSpan);
  h2.appendChild(document.createTextNode(' '));
  const sayHiSpan = document.createElement('span');
  sayHiSpan.textContent = 'Say hi.';
  sayHiSpan.style.color = '#7a6a92';
  h2.appendChild(sayHiSpan);
  inner.appendChild(h2);

  // Contact links — stacked, right-aligned
  const linksWrap = document.createElement('div');
  linksWrap.style.cssText = `
    margin-top: 44px;
    display: flex;
    flex-direction: column;
    gap: 8px;
    align-items: flex-end;
    font-family: "Space Grotesk", sans-serif;
    font-size: 28px;
    font-weight: 500;
    letter-spacing: -0.02em;
    color: #f5f0ff;
  `;

  const emailLink = document.createElement('a');
  emailLink.href = 'mailto:joel@tempero.nz';
  emailLink.textContent = 'joel@tempero.nz';
  emailLink.style.cssText = `
    color: #f5f0ff;
    text-decoration: none;
    border-bottom: 1px solid rgba(196,181,253,0.20);
    padding-bottom: 4px;
  `;
  linksWrap.appendChild(emailLink);

  const phoneLink = document.createElement('a');
  phoneLink.href = 'tel:+642040239009';
  phoneLink.textContent = '+64 204 023 9009';
  phoneLink.style.cssText = `
    color: #b8a8d4;
    text-decoration: none;
    font-size: 22px;
  `;
  linksWrap.appendChild(phoneLink);

  inner.appendChild(linksWrap);

  return {
    destroy() {
      backdrop.remove();
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
