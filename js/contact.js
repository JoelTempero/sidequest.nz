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

    /* The inline script in index.html already collapsed the panel before first
       paint. Mirror that state here rather than assuming it. */
    const setOpen = (open) => {
      panel.hidden = !open;
      trigger.setAttribute('aria-expanded', String(open));
    };

    setOpen(!panel.hidden);

    trigger.addEventListener('click', () => {
      const open = panel.hidden;
      setOpen(open);
      if (open) {
        const first = form.querySelector('input:not([type=hidden]), textarea');
        if (first) first.focus();
      } else {
        trigger.focus();
      }
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && !panel.hidden) {
        setOpen(false);
        trigger.focus();
      }
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
      if (btn) btn.disabled = true;
      say('Sending...', null);

      try {
        const res = await fetch(ENDPOINT, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          body: JSON.stringify(Object.fromEntries(new FormData(form))),
        });

        if (!res.ok) throw new Error(String(res.status));

        /* Replace the form with a confirmation, in place. */
        const done = document.createElement('p');
        done.className = 'form-status form-status--ok';
        done.setAttribute('role', 'status');
        done.textContent = 'Got it. We will come back to you shortly.';
        form.replaceWith(done);
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
