/**
 * contact-page.js
 * Entry point for the sky (contact) page. Mounts the sky environment,
 * top nav, wires the form submit, plays the entry animation.
 */

import { mountSky } from './sky.js';
import { mountTopNav } from './panels.js';
import { transitionTo, playEntryAnimation } from './transition.js';

const isMobile = window.matchMedia('(max-width: 900px)').matches;

document.addEventListener('DOMContentLoaded', () => {
  // 1. Mount the sky environment
  mountSky(document.getElementById('environment'));

  // 2. Mount top nav with Contact active
  mountTopNav(document.getElementById('top-nav'), {
    jumpTo: () => {},
    activeIdxRef: { current: 7 }, // Contact is active at idx 7
    onNavigate: (panelId) => {
      if (isMobile) return;
      if (panelId === 'panel-hero') {
        transitionTo({ destination: 'index.html', direction: 'return-down', duration: 800 });
      } else if (panelId === 'panel-q1') {
        transitionTo({ destination: 'work.html', direction: 'transit-down', duration: 1600 });
      }
    },
  });

  // 3. Wire form submit (port from old contact.html)
  wireForm();

  // 4. Play entry animation
  if (!isMobile) {
    playEntryAnimation({ direction: 'up', duration: 400 });
  } else {
    const overlay = document.getElementById('transition-overlay');
    if (overlay) overlay.style.opacity = '0';
  }
});

function wireForm() {
  const form = document.getElementById('contact-form');
  const result = document.getElementById('form-result');
  const submitBtn = document.getElementById('submit-btn');
  if (!form || !result || !submitBtn) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Sending…';
    submitBtn.disabled = true;
    result.textContent = '';
    result.style.color = '';

    try {
      const response = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify(Object.fromEntries(new FormData(form))),
      });
      const data = await response.json();

      if (data.success) {
        result.textContent = "Message sent! I'll be in touch soon.";
        result.style.color = '#22c55e';
        form.reset();
      } else {
        throw new Error(data.message || 'submit failed');
      }
    } catch (err) {
      result.textContent = 'Something went wrong. Please try again.';
      result.style.color = '#ef4444';
    }

    submitBtn.textContent = originalText;
    submitBtn.disabled = false;
  });
}
