/**
 * work-page.js
 * Entry point for the underground (work) page. Mounts the underground
 * environment, top nav, project list from manifest, and plays the
 * entry animation that fades the transition overlay.
 */

import { mountUnderground } from './underground.js';
import { mountTopNav } from './panels.js';
import { transitionTo, playEntryAnimation } from './transition.js';

const isMobile = window.matchMedia('(max-width: 900px)').matches;

document.addEventListener('DOMContentLoaded', async () => {
  // 1. Mount the underground parallax environment
  mountUnderground(document.getElementById('environment'));

  // 2. Mount top nav with Work active
  const navOpts = {
    jumpTo: () => {},
    activeIdxRef: { current: 1 },
  };

  if (!isMobile) {
    navOpts.onNavigate = (panelId) => {
      if (panelId === 'panel-hero') {
        transitionTo({ destination: 'index.html', direction: 'return-up', duration: 800 });
      } else if (panelId === 'panel-contact') {
        transitionTo({ destination: 'contact.html', direction: 'transit-up', duration: 1600 });
      }
    };
  }

  mountTopNav(document.getElementById('top-nav'), navOpts);

  // 3. Load and render projects
  try {
    const response = await fetch('projects/manifest.json');
    const projects = await response.json();
    renderProjects(projects);
  } catch (err) {
    console.error('Failed to load projects manifest:', err);
  }

  // 4. Play entry animation (fades overlay 1→0)
  if (!isMobile) {
    playEntryAnimation({ direction: 'down', duration: 400 });
  } else {
    const overlay = document.getElementById('transition-overlay');
    if (overlay) overlay.style.opacity = '0';
  }
});

function renderProjects(projects) {
  const list = document.getElementById('project-list');
  if (!list) return;

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
}

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
