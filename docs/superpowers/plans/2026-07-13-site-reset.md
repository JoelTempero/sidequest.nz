# Site Reset Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the sidequest.nz marketing site with a two-page, one-screen, dark, confident-minimal site.

**Architecture:** Static HTML/CSS/vanilla-JS, no build step, no dependencies. One `index.html` (statement + tagline + inline contact, fits one viewport on desktop), one `about.html` (capability + team). Two legal pages retained. Three independent JS modules, each with a single mount function and no shared state — the page renders correctly with all three absent.

**Tech Stack:** HTML5, CSS custom properties, ES modules, Canvas 2D, Web3Forms, GitHub Pages.

**Spec:** `docs/superpowers/specs/2026-07-13-site-reset-design.md`

## Global Constraints

- No dependencies, no framework, no build step. Under 15KB of JS total.
- Palette: base `#08060d`, violet primary `#7c3aed`, violet light `#c4b5fd`. Square corners.
- Type: Space Grotesk (display), IBM Plex Mono (micro). Both via Google Fonts.
- Always "Sidequest Digital", never shortened. Surname is **Stirling**, not Sterling.
- No client names, no case studies, no pricing, no services list, no testimonials.
- Every effect degrades to nothing under `prefers-reduced-motion: reduce` and on touch.
- No em dashes in body copy (house rule — use periods, colons, or commas).
- Host is GitHub Pages: no server-side redirects. Retired paths become meta-refresh stubs.
- **`churches/` is off limits.** It is a separately-deployed compiled app live at `sidequest.nz/churches/`, unrelated to the marketing site. Do not delete it, move it, edit it, or link to it. It must survive the reset byte-for-byte.
- `CNAME` and `images/{favicon,logo-icon}.png` must also survive.
- Windows/PS 5.1: write files with the Write tool, never `Get-Content -Raw` + `Set-Content` round-trips (corrupts UTF-8).

---

### Task 1: Branch and clear the ground

**Files:** none created yet.

- [ ] Confirm `feat/homepage-rethink` and `origin/sidequest-backup` both exist and are pushed. The z-axis world must survive untouched. If `feat/homepage-rethink` is not on a remote, push it.
- [ ] Create `feat/reset` from `origin/main` (NOT from local `main`, which is the backup repo's history).
- [ ] Verify the working tree matches `origin/main`: `index.html`, `css/{style,layout,components,creative}.css`, `js/{main,creative}.js`, `pages/*.html` (10 files), `CNAME`, `images/`.
- [ ] Commit nothing. This task is a checkpoint.

---

### Task 2: `css/site.css` — the whole design system

**Files:** Create `css/site.css`. Delete `css/{style,layout,components,creative}.css` in Task 9, not yet.

**Produces:** every class the later tasks consume. Later tasks must not invent new class names.

- [ ] Write `css/site.css` containing, in order: reset, custom-property tokens, base type, `.site-nav`, `.hero`, `.contact-strip`, `.about-*`, `.legal-*`, and a `@media (prefers-reduced-motion: reduce)` block that kills all animation.
- [ ] Tokens: the palette above, plus a 4-step ink scale for muted text.
- [ ] Layout: `body` is a full-height flex column. Hero flexes to fill. Contact strip sits at the bottom, in flow (not `position: fixed` — fixed strips fight mobile browser chrome).
- [ ] Desktop must fit 100vh with no scrollbar. Use `svh` units with a `vh` fallback so mobile browser chrome does not cause a phantom scroll.
- [ ] Mobile (≤900px): the page becomes one short deliberate scroll. This is intended, per spec.
- [ ] Commit: `feat: single stylesheet for the reset`

---

### Task 3: `index.html` — structure and copy, no effects

Build the page so it is complete and correct with zero JavaScript. Effects are added on top in Tasks 4–6.

**Files:** Rewrite `index.html`.

**Produces:** the DOM hooks the JS tasks bind to. Use exactly these IDs: `#field` (canvas), `#hero-lines` (headline wrapper), `#contact-form`, `#contact-trigger`, `#contact-panel`.

- [ ] Head: Space Grotesk + IBM Plex Mono Google Fonts, `css/site.css`, favicon, and real meta/OG tags (title, description, `og:image` using `images/logo-icon.png`).
- [ ] Nav: `images/logo-icon.png` + "Sidequest Digital" wordmark top-left; a single `About` link top-right.
- [ ] Hero: three lines in `#hero-lines` — `BE KNOWN.` / `STAND OUT.` / `GET AHEAD.` — set very large, plus the tagline beneath: **"Being good is no longer enough. Being early is."**
- [ ] Contact strip, collapsed state: `Get in touch →` trigger (`#contact-trigger`) on one side; on the other, always visible: `Or hit us up direct` with `joel@tempero.nz` (mailto) and `0204 023 9009` (tel:+64204023 9009 → `tel:+642040239009`).
- [ ] Contact panel (`#contact-panel`), hidden by default via a `[hidden]` attribute: a real `<form id="contact-form" action="https://api.web3forms.com/submit" method="POST">` with name, email, message, the hidden `access_key` `034020f4-ef4e-4f00-9988-3e99609b86c4`, a hidden `subject`, and a hidden `botcheck` honeypot.
- [ ] The form must work as a plain POST with JS disabled. Do not rely on JS for validity — use `required` and `type="email"`.
- [ ] Empty `<canvas id="field">` behind the content, `aria-hidden="true"`.
- [ ] **Verify:** open in a browser with JS disabled. Page reads correctly, form submits, no console errors.
- [ ] Commit: `feat: new homepage structure and copy`

---

### Task 4: `js/particles.js` — canvas field

**Files:** Create `js/particles.js`. Modify `index.html` to import it.

**Interfaces:** exports `mountParticles(canvasEl)`. Returns early (no-op) if the canvas is missing, 2D context is unavailable, or reduced-motion is set (after drawing one static frame).

- [ ] ~150 slow-drifting points in violet and white. Count scales with viewport area so a small window does less work.
- [ ] Soft cursor repel within a radius. Points ease back to their drift when the cursor leaves.
- [ ] Cap `devicePixelRatio` at 2. Handle resize with a debounce.
- [ ] `requestAnimationFrame` loop; cancel it on `visibilitychange` when the tab hides, restart when it shows.
- [ ] Reduced motion: draw one static frame, never start the loop.
- [ ] **Verify:** DevTools → 6x CPU throttle. Frame rate stays usable. Then toggle reduced-motion and confirm it goes static.
- [ ] Commit: `feat: canvas particle field`

---

### Task 5: `js/kinetic.js` — headline distortion

**Files:** Create `js/kinetic.js`. Modify `index.html` to import it.

**Interfaces:** exports `mountKinetic(headlineEl)`. No-op on touch devices, under reduced motion, or if the element is missing.

- [ ] Split the headline into per-letter `<span>`s at runtime. Preserve the accessible text: wrap each line so a screen reader still announces "BE KNOWN." not "B E K N O W N".
- [ ] On `mousemove`, letters within a radius of the cursor get a `transform` — **translate and scale only**. No filters, no blur, no properties that trigger layout or paint.
- [ ] Throttle to `requestAnimationFrame`. Do not do work per mousemove event.
- [ ] **Verify:** DevTools → Rendering → Paint flashing. Moving the cursor over the headline must not repaint the whole page.
- [ ] Commit: `feat: kinetic headline`

---

### Task 6: `js/contact.js` — inline expand + fetch submit

**Files:** Create `js/contact.js`. Modify `index.html` to import it.

**Interfaces:** exports `mountContact(trigger, panel, form)`. No-op if any element is missing (form still POSTs normally).

- [ ] Trigger toggles `#contact-panel`'s `hidden` attribute, expanding **upward** above the strip. Set `aria-expanded` on the trigger. Move focus to the first field on open. Escape closes it.
- [ ] On submit: `preventDefault()` only after confirming `fetch` exists. POST JSON to `https://api.web3forms.com/submit`.
- [ ] Success: replace the form in place with a confirmation line. Do not navigate. Do not redirect.
- [ ] Failure (network error or non-2xx): show an inline error, **keep the user's input**, and leave the direct email/phone visible as the escape hatch.
- [ ] Disable the submit button while in flight so a double-click cannot double-send.
- [ ] **Verify:** submit a real test message and confirm it lands in the inbox and the page does not navigate away. Then block the request in DevTools and confirm the error path preserves input.
- [ ] Commit: `feat: inline contact form`

---

### Task 7: `about.html`

**Files:** Create `about.html` at the repo root (NOT `pages/about.html` — that path becomes a stub).

- [ ] Same nav as home, but the right-hand link reads `Home` and points to `/`.
- [ ] Headline: **"We supercharge what you're already building."**
- [ ] Lede: "Your idea, your business, your whatever. We make it faster, sharper, and harder to ignore."
- [ ] Disciplines, as plain text with no descriptions, no icons, no links: App development · Web development · Systems management · Team consultation · Advertising
- [ ] Team, name and island only. No role, no email, no photo:
      **Joel Tempero** — South Island
      **Harrison Stirling** — North Island
- [ ] Reuse `css/site.css`. Reuse `js/particles.js` (the field belongs on both pages). Do not import `kinetic.js` or `contact.js`.
- [ ] **Verify:** no client names, no services list, no pricing anywhere on the page.
- [ ] Commit: `feat: about page`

---

### Task 8: Re-skin the legal pages

**Files:** Rewrite `pages/privacy.html`, `pages/terms.html`.

These currently reference the old stylesheets, which Task 9 deletes. They must be re-pointed or they break.

- [ ] Keep the existing legal **text** verbatim. This is the only content on the site being preserved. Do not rewrite it, do not "improve" it.
- [ ] Swap the head to `css/site.css` and the new fonts. Use the `.legal-*` classes from Task 2.
- [ ] Nav: wordmark links to `/`, single `About` link. No particle canvas (these are reading pages).
- [ ] **Verify:** both pages scroll normally and are readable. The homepage's `overflow: hidden` scroll lock must not leak into them.
- [ ] Commit: `feat: reskin legal pages`

---

### Task 9: Delete the old site, stub the dead URLs

**Files:** Delete `css/{style,layout,components,creative}.css`, `js/{main,creative}.js`, `pages/{apps,portals,systems,websites,projects,project}.html`. Rewrite `pages/{about,pricing}.html` as stubs.

- [ ] Delete the six retired service/project pages, the four old stylesheets, and the two old JS files.
- [ ] Replace each retired path with a stub: `<meta name="robots" content="noindex">`, `<meta http-equiv="refresh" content="0;url=/">`, and a `location.replace('/')` JS fallback. Follow the existing `pages/pricing.html` pattern.
- [ ] `pages/about.html` stubs to `/about.html` (not `/`), since that content genuinely moved.
- [ ] `pages/pricing.html` is already a stub. Leave it.
- [ ] Grep the whole tree for references to the deleted files. Any surviving `href` or `src` pointing at them is a broken link. There must be zero.
- [ ] **Verify:** `python -m http.server 5500`, then load every retired URL and confirm it lands on `/` (or `/about.html`). Confirm no 404s and no console errors anywhere.
- [ ] Commit: `feat: retire the old site`

---

### Task 10: Verification pass

No commit. This is a gate. Every item must pass before Task 11.

- [ ] Homepage fits one viewport at 1280x720 and 1920x1080. **No scrollbar.**
- [ ] Mobile (375px): one short scroll, nothing clipped, tap targets ≥44px.
- [ ] `prefers-reduced-motion: reduce`: zero animation, page still looks intentional.
- [ ] JS disabled: page fully readable, form still submits.
- [ ] 6x CPU throttle: particle field holds a usable frame rate.
- [ ] Lighthouse: performance ≥95, accessibility ≥95.
- [ ] Total JS under 15KB.
- [ ] Keyboard only: tab through nav, trigger, form. Focus is always visible. Escape closes the panel.
- [ ] Real form submission lands in the inbox.
- [ ] Cross-browser: Chrome, Firefox, Safari/WebKit if reachable.

---

### Task 11: Merge and deploy

**Gated on Joel's explicit approval. Do not merge autonomously.**

- [ ] Show Joel the site running locally first.
- [ ] Merge `feat/reset` → `main`, push to `origin`.
- [ ] Confirm GitHub Pages has rebuilt and `sidequest.nz` serves the new site.
- [ ] Hard-refresh past Edge cache and confirm the live site, including the retired-URL redirects.
- [ ] Update `CLAUDE.md`: new architecture, the archived z-axis branch, new session log entry, reset Next Steps.
