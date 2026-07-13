/**
 * Contact panel — expand/collapse, and submit without leaving the page.
 *
 * Pure enhancement. The page ships with the panel open and the form posting
 * normally; this module collapses it, wires the trigger, and upgrades the
 * submit to fetch. If it never runs, the form still works as a plain POST.
 */

const ENDPOINT = 'https://api.web3forms.com/submit';

export function mountContact(trigger, panel, form) {
  try {
    if (!trigger || !panel || !form) return;
    if (panel.dataset.contactMounted === 'true') return;
    panel.dataset.contactMounted = 'true';

    const status = form.querySelector('.form-status');
    const strip = panel.closest('.contact-strip');
    const closeBtn = document.getElementById('contact-close');

    /* The inline script in index.html already collapsed the panel before first
       paint. Mirror that state here rather than assuming it. */
    const setOpen = (open) => {
      panel.hidden = !open;
      trigger.setAttribute('aria-expanded', String(open));
      /* The trigger is hidden while open, so the panel sits flush at the foot
         of the page with no bar beneath it. #contact-close and Escape are the
         only ways back out — see #contact-close in site.css. */
      if (strip) strip.classList.toggle('is-open', open);
    };

    setOpen(!panel.hidden);

    /* index.html wires a bare onclick fallback in case this module never
       loads. Now that it has, take it over — otherwise both handlers fire and
       the toggles cancel out. */
    trigger.onclick = null;
    if (closeBtn) closeBtn.onclick = null;

    const open = () => {
      setOpen(true);
      const first = form.querySelector('input:not([type=hidden]), textarea');
      if (first) first.focus();
    };

    const close = () => {
      setOpen(false);
      trigger.focus();
    };

    trigger.addEventListener('click', () => {
      if (panel.hidden) open();
      else close();
    });

    if (closeBtn) closeBtn.addEventListener('click', close);

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && !panel.hidden) close();
    });

    const say = (msg, kind) => {
      if (!status) return;
      status.textContent = msg;
      status.classList.toggle('form-status--error', kind === 'error');
      status.classList.toggle('form-status--ok', kind === 'ok');
    };

    form.addEventListener('submit', async (e) => {
      if (typeof window.fetch !== 'function') return; /* Let it POST normally. */
      e.preventDefault();

      const btn = form.querySelector('button[type=submit]');
      /* Disabling the focused button blurs focus to <body>. Park it on the
         status line instead, so a keyboard user stays where the news is. */
      if (status) {
        status.setAttribute('tabindex', '-1');
        status.focus();
      }
      if (btn) btn.disabled = true;
      say('Sending...', null);

      try {
        const res = await fetch(ENDPOINT, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          body: JSON.stringify(Object.fromEntries(new FormData(form))),
        });

        if (!res.ok) throw new Error(String(res.status));

        /* Keep the form (and its live region) mounted and just hide the
           fields. Replacing the form would destroy .form-status, and a
           freshly-inserted live region does not reliably announce. */
        form.querySelectorAll('.field').forEach((el) => { el.hidden = true; });
        if (btn) btn.hidden = true;
        say('Got it. We will come back to you shortly.', 'ok');
      } catch (err) {
        /* Keep every keystroke the visitor typed. The email and phone in the
           bar below are still right there as the escape hatch. */
        if (btn) btn.disabled = false;
        say('That did not send. Email or call us direct and we will pick it up.', 'error');
      }
    });
  } catch (err) {
    /* Enhancement only. A broken panel must never break the page. */
  }
}

mountContact(
  document.getElementById('contact-trigger'),
  document.getElementById('contact-panel'),
  document.getElementById('contact-form')
);
