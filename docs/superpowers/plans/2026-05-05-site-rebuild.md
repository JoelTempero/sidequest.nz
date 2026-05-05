# Sidequest Digital Site Rebuild — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild sidequest.nz as a dark, cinematic horizontal-scroll portfolio site with GSAP animations, local project content, and unique per-project detail pages.

**Architecture:** Static HTML/CSS/JS site with GSAP + ScrollTrigger for horizontal scroll (desktop) and scroll-triggered animations (mobile/all pages). Project content stored as local JSON/HTML files. No build tools, no framework, no external CMS dependency.

**Tech Stack:** HTML5, CSS3 (custom properties, grid, flexbox), vanilla JS (ES modules), GSAP 3 + ScrollTrigger (CDN), Web3Forms (contact), Google Fonts (Outfit, Inter)

**Spec:** `docs/superpowers/specs/2026-05-05-site-rebuild-design.md`

---

## Task 1: Cleanup & Directory Scaffold

**Files:**
- Delete: `pages/pricing.html`, `pages/websites.html`, `pages/apps.html`, `pages/portals.html`, `pages/systems.html`, `pages/projects.html`, `pages/project.html`
- Delete: `css/style.css`, `css/layout.css`, `css/components.css`, `css/creative.css`
- Delete: `js/main.js`, `js/creative.js`
- Create: `css/style.css` (empty), `css/layout.css` (empty), `css/components.css` (empty), `css/animations.css` (empty)
- Create: `js/main.js` (empty), `js/scroll.js` (empty), `js/animations.js` (empty)
- Create: `projects/` directory
- Keep: `images/`, `pages/terms.html`, `pages/privacy.html`

- [ ] **Step 1: Delete old CSS and JS files**

```bash
rm css/style.css css/layout.css css/components.css css/creative.css
rm js/main.js js/creative.js
```

- [ ] **Step 2: Delete removed pages**

```bash
rm pages/pricing.html pages/websites.html pages/apps.html pages/portals.html pages/systems.html pages/projects.html pages/project.html
```

- [ ] **Step 3: Create new empty files and directories**

```bash
mkdir -p projects
touch css/style.css css/layout.css css/components.css css/animations.css
touch js/main.js js/scroll.js js/animations.js
```

- [ ] **Step 4: Create placeholder HTML files**

Create empty `about.html`, `work.html`, `contact.html` at the root (just `<!DOCTYPE html>` shells for now — they'll be built in later tasks).

```html
<!-- about.html, work.html, contact.html — same shell -->
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Sidequest Digital</title>
</head>
<body>
    <!-- Built in later tasks -->
</body>
</html>
```

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "chore: clean old site, scaffold new directory structure"
```

---

## Task 2: CSS Foundation

**Files:**
- Create: `css/style.css` — reset, custom properties, typography, base dark theme

- [ ] **Step 1: Write the CSS foundation**

Write `css/style.css` with:

```css
/* ===== Reset ===== */
*, *::before, *::after {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

html {
    scroll-behavior: smooth;
}

body {
    font-family: 'Inter', system-ui, -apple-system, sans-serif;
    background: var(--bg-deep);
    color: var(--text-primary);
    line-height: 1.6;
    overflow-x: hidden;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
}

img, video {
    max-width: 100%;
    display: block;
}

a {
    color: inherit;
    text-decoration: none;
}

button {
    cursor: pointer;
    border: none;
    background: none;
    font: inherit;
    color: inherit;
}

ul, ol {
    list-style: none;
}

/* ===== Custom Properties ===== */
:root {
    /* Backgrounds */
    --bg-deep: #0a0a0a;
    --bg-elevated: #1a1a1a;
    --bg-surface: #111111;

    /* Text */
    --text-primary: #ffffff;
    --text-secondary: rgba(255, 255, 255, 0.6);
    --text-muted: rgba(255, 255, 255, 0.4);

    /* Accents */
    --accent-purple: #6d28d9;
    --accent-purple-light: #a78bfa;
    --accent-orange: #f97316;

    /* Effects */
    --border-subtle: rgba(255, 255, 255, 0.06);
    --glow-purple: rgba(109, 40, 217, 0.2);
    --glow-orange: rgba(249, 115, 22, 0.15);

    /* Typography scale */
    --font-heading: 'Outfit', system-ui, sans-serif;
    --font-body: 'Inter', system-ui, sans-serif;

    --text-xs: clamp(0.7rem, 0.8vw, 0.75rem);
    --text-sm: clamp(0.8rem, 0.9vw, 0.875rem);
    --text-base: clamp(0.9rem, 1vw, 1rem);
    --text-lg: clamp(1.1rem, 1.2vw, 1.25rem);
    --text-xl: clamp(1.3rem, 1.5vw, 1.5rem);
    --text-2xl: clamp(1.8rem, 2.5vw, 2rem);
    --text-3xl: clamp(2.2rem, 3.5vw, 3rem);
    --text-4xl: clamp(3rem, 5vw, 4.5rem);
    --text-5xl: clamp(4rem, 7vw, 6rem);

    /* Spacing */
    --space-xs: 0.25rem;
    --space-sm: 0.5rem;
    --space-md: 1rem;
    --space-lg: 1.5rem;
    --space-xl: 2rem;
    --space-2xl: 3rem;
    --space-3xl: 4rem;
    --space-4xl: 6rem;

    /* Layout */
    --nav-height: 64px;
    --container-max: 1200px;

    /* Transitions */
    --ease-out: cubic-bezier(0.16, 1, 0.3, 1);
    --ease-in-out: cubic-bezier(0.65, 0, 0.35, 1);

    /* Border radius */
    --radius-sm: 4px;
    --radius-md: 8px;
    --radius-lg: 12px;
    --radius-xl: 16px;
    --radius-full: 9999px;
}

/* ===== Typography ===== */
h1, h2, h3, h4, h5, h6 {
    font-family: var(--font-heading);
    font-weight: 800;
    line-height: 1.1;
    letter-spacing: -0.02em;
}

h1 { font-size: var(--text-5xl); }
h2 { font-size: var(--text-4xl); }
h3 { font-size: var(--text-2xl); }
h4 { font-size: var(--text-xl); }

p {
    font-size: var(--text-base);
    color: var(--text-secondary);
    line-height: 1.7;
}

.label {
    font-size: var(--text-xs);
    letter-spacing: 0.15em;
    text-transform: uppercase;
    color: var(--text-muted);
    font-weight: 500;
}

/* ===== Utilities ===== */
.container {
    width: 100%;
    max-width: var(--container-max);
    margin: 0 auto;
    padding: 0 var(--space-xl);
}

.text-gradient {
    background: linear-gradient(135deg, var(--accent-purple-light), var(--accent-orange));
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
}

/* ===== Noise Overlay ===== */
body::after {
    content: '';
    position: fixed;
    inset: 0;
    pointer-events: none;
    z-index: 9999;
    opacity: 0.03;
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
}
```

- [ ] **Step 2: Verify in browser**

Open `index.html` (even the old one temporarily) — confirm dark background renders, no flash of white, noise overlay visible subtly on close inspection.

- [ ] **Step 3: Commit**

```bash
git add css/style.css
git commit -m "feat: add CSS foundation — dark theme, variables, typography"
```

---

## Task 3: Shared Navigation & Footer

**Files:**
- Create: `css/components.css` — nav and footer styles
- Reference: `images/logo-icon.png` (existing)

- [ ] **Step 1: Write navigation CSS in `css/components.css`**

```css
/* ===== Navigation ===== */
.nav {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    height: var(--nav-height);
    z-index: 1000;
    display: flex;
    align-items: center;
    background: rgba(10, 10, 10, 0.8);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    border-bottom: 1px solid var(--border-subtle);
}

.nav-inner {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    max-width: var(--container-max);
    margin: 0 auto;
    padding: 0 var(--space-xl);
}

.nav-logo {
    display: flex;
    align-items: center;
    gap: var(--space-sm);
    font-family: var(--font-heading);
    font-weight: 700;
    font-size: var(--text-base);
    color: var(--text-primary);
}

.nav-logo img {
    width: 28px;
    height: 28px;
}

.nav-links {
    display: flex;
    align-items: center;
    gap: var(--space-2xl);
}

.nav-link {
    font-size: var(--text-sm);
    color: var(--text-muted);
    transition: color 0.3s var(--ease-out);
    position: relative;
}

.nav-link:hover,
.nav-link.active {
    color: var(--text-primary);
}

.nav-link::after {
    content: '';
    position: absolute;
    bottom: -4px;
    left: 0;
    width: 0;
    height: 1px;
    background: var(--accent-purple-light);
    transition: width 0.3s var(--ease-out);
}

.nav-link:hover::after {
    width: 100%;
}

/* Mobile nav toggle */
.nav-toggle {
    display: none;
    flex-direction: column;
    gap: 5px;
    padding: 4px;
}

.nav-toggle span {
    display: block;
    width: 20px;
    height: 1.5px;
    background: var(--text-primary);
    transition: transform 0.3s var(--ease-out), opacity 0.3s;
}

.nav-toggle.open span:nth-child(1) {
    transform: rotate(45deg) translate(4px, 4px);
}

.nav-toggle.open span:nth-child(2) {
    opacity: 0;
}

.nav-toggle.open span:nth-child(3) {
    transform: rotate(-45deg) translate(4px, -4px);
}

/* Mobile nav overlay */
.nav-mobile {
    position: fixed;
    inset: 0;
    top: var(--nav-height);
    background: var(--bg-deep);
    z-index: 999;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: var(--space-2xl);
    opacity: 0;
    pointer-events: none;
    transition: opacity 0.3s var(--ease-out);
}

.nav-mobile.open {
    opacity: 1;
    pointer-events: all;
}

.nav-mobile a {
    font-family: var(--font-heading);
    font-size: var(--text-2xl);
    font-weight: 700;
    color: var(--text-secondary);
    transition: color 0.3s;
}

.nav-mobile a:hover {
    color: var(--text-primary);
}

@media (max-width: 768px) {
    .nav-links { display: none; }
    .nav-toggle { display: flex; }
}

/* ===== Footer ===== */
.footer {
    background: var(--bg-deep);
    border-top: 1px solid var(--border-subtle);
    padding: var(--space-4xl) 0 var(--space-2xl);
}

.footer-inner {
    max-width: var(--container-max);
    margin: 0 auto;
    padding: 0 var(--space-xl);
    display: flex;
    justify-content: space-between;
    align-items: start;
    gap: var(--space-3xl);
}

.footer-brand {
    display: flex;
    flex-direction: column;
    gap: var(--space-sm);
}

.footer-brand-name {
    font-family: var(--font-heading);
    font-weight: 700;
    font-size: var(--text-lg);
}

.footer-tagline {
    font-size: var(--text-sm);
    color: var(--text-muted);
}

.footer-links {
    display: flex;
    gap: var(--space-2xl);
}

.footer-link {
    font-size: var(--text-sm);
    color: var(--text-muted);
    transition: color 0.3s;
}

.footer-link:hover {
    color: var(--text-primary);
}

.footer-bottom {
    max-width: var(--container-max);
    margin: var(--space-3xl) auto 0;
    padding: var(--space-xl) var(--space-xl) 0;
    border-top: 1px solid var(--border-subtle);
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.footer-copyright {
    font-size: var(--text-xs);
    color: var(--text-muted);
}

.footer-legal {
    display: flex;
    gap: var(--space-lg);
}

.footer-legal a {
    font-size: var(--text-xs);
    color: var(--text-muted);
    transition: color 0.3s;
}

.footer-legal a:hover {
    color: var(--text-secondary);
}

@media (max-width: 768px) {
    .footer-inner {
        flex-direction: column;
        gap: var(--space-2xl);
    }
    .footer-links {
        flex-direction: column;
        gap: var(--space-md);
    }
    .footer-bottom {
        flex-direction: column;
        gap: var(--space-md);
        text-align: center;
    }
}
```

- [ ] **Step 2: Write `js/main.js` — nav toggle logic**

```javascript
// Navigation mobile toggle
const navToggle = document.querySelector('.nav-toggle');
const navMobile = document.querySelector('.nav-mobile');

if (navToggle && navMobile) {
    navToggle.addEventListener('click', () => {
        navToggle.classList.toggle('open');
        navMobile.classList.toggle('open');
        document.body.style.overflow = navMobile.classList.contains('open') ? 'hidden' : '';
    });

    navMobile.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            navToggle.classList.remove('open');
            navMobile.classList.remove('open');
            document.body.style.overflow = '';
        });
    });
}
```

- [ ] **Step 3: Commit**

```bash
git add css/components.css js/main.js
git commit -m "feat: add navigation and footer styles + mobile toggle"
```

---

## Task 4: Homepage HTML Structure

**Files:**
- Rewrite: `index.html` — full homepage with all 6 panel containers

- [ ] **Step 1: Write `index.html`**

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="Sidequest Digital — Be Known. Stand Out. Custom websites, apps, and digital solutions crafted with creativity and care.">
    <title>Sidequest Digital — Be Known. Stand Out.</title>

    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Outfit:wght@400;500;600;700;800;900&display=swap" rel="stylesheet">

    <link rel="stylesheet" href="css/style.css">
    <link rel="stylesheet" href="css/layout.css">
    <link rel="stylesheet" href="css/components.css">
    <link rel="stylesheet" href="css/animations.css">

    <link rel="icon" type="image/png" href="images/favicon.png">
    <link rel="apple-touch-icon" href="images/favicon.png">
</head>
<body>
    <!-- Navigation -->
    <nav class="nav">
        <div class="nav-inner">
            <a href="/" class="nav-logo">
                <img src="images/logo-icon.png" alt="Sidequest Digital">
                <span>Sidequest Digital</span>
            </a>
            <ul class="nav-links">
                <li><a href="/" class="nav-link active">Home</a></li>
                <li><a href="about.html" class="nav-link">About</a></li>
                <li><a href="work.html" class="nav-link">Work</a></li>
                <li><a href="contact.html" class="nav-link">Contact</a></li>
            </ul>
            <button class="nav-toggle" aria-label="Toggle menu">
                <span></span><span></span><span></span>
            </button>
        </div>
    </nav>

    <!-- Mobile nav overlay -->
    <div class="nav-mobile">
        <a href="/">Home</a>
        <a href="about.html">About</a>
        <a href="work.html">Work</a>
        <a href="contact.html">Contact</a>
    </div>

    <!-- Horizontal Scroll Wrapper (desktop) -->
    <main class="horizontal-scroll" id="horizontal-scroll">
        <div class="panels">

            <!-- Panel 1: Hero -->
            <section class="panel panel-hero" id="panel-hero">
                <div class="panel-glow panel-glow-purple"></div>
                <div class="panel-content">
                    <h1 class="hero-title">
                        <span class="hero-line">Be Known.</span>
                        <span class="hero-line text-gradient">Stand Out.</span>
                    </h1>
                    <p class="hero-subtitle">Crafting one-of-a-kind digital experiences for communities, schools, and small businesses.</p>
                </div>
                <div class="hero-scroll-cue">
                    <span>Scroll</span>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                </div>
            </section>

            <!-- Panel 2: Websites -->
            <section class="panel panel-service" id="panel-websites" data-category="websites">
                <div class="panel-glow panel-glow-purple"></div>
                <div class="panel-content">
                    <span class="label">01</span>
                    <h2 class="panel-title">Your corner<br>of the internet</h2>
                    <p class="panel-desc">Not another template. A digital home built from scratch — designed to represent exactly who you are.</p>
                    <div class="featured-project" data-category="websites">
                        <!-- Populated by JS from projects/meta.json -->
                    </div>
                </div>
            </section>

            <!-- Panel 3: Web Apps -->
            <section class="panel panel-service" id="panel-apps" data-category="apps">
                <div class="panel-glow panel-glow-orange"></div>
                <div class="panel-content">
                    <span class="label">02</span>
                    <h2 class="panel-title">Tools that<br>work like you do</h2>
                    <p class="panel-desc">Custom-built applications shaped around your workflow. Not the other way around.</p>
                    <div class="featured-project" data-category="apps">
                        <!-- Populated by JS -->
                    </div>
                </div>
            </section>

            <!-- Panel 4: Portals -->
            <section class="panel panel-service" id="panel-portals" data-category="portals">
                <div class="panel-glow panel-glow-purple"></div>
                <div class="panel-content">
                    <span class="label">03</span>
                    <h2 class="panel-title">A space<br>for your people</h2>
                    <p class="panel-desc">Secure, branded portals where your clients and team feel at home.</p>
                    <div class="featured-project" data-category="portals">
                        <!-- Populated by JS -->
                    </div>
                </div>
            </section>

            <!-- Panel 5: Systems -->
            <section class="panel panel-service" id="panel-systems" data-category="systems">
                <div class="panel-glow panel-glow-orange"></div>
                <div class="panel-content">
                    <span class="label">04</span>
                    <h2 class="panel-title">Clarity from<br>the chaos</h2>
                    <p class="panel-desc">Management systems that bring your team together and make the complex feel simple.</p>
                    <div class="featured-project" data-category="systems">
                        <!-- Populated by JS -->
                    </div>
                </div>
            </section>

            <!-- Panel 6: Teaser / CTA -->
            <section class="panel panel-teaser" id="panel-teaser">
                <div class="panel-glow panel-glow-purple"></div>
                <div class="panel-content">
                    <h2 class="panel-title">That's just<br>the <span class="text-gradient">highlights</span></h2>
                    <p class="panel-desc">Every project is a new adventure. See where we've been.</p>
                    <a href="work.html" class="btn-primary">
                        See All Work
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                    </a>
                </div>
            </section>

        </div>
    </main>

    <!-- Footer -->
    <footer class="footer">
        <div class="footer-inner">
            <div class="footer-brand">
                <span class="footer-brand-name">Sidequest Digital</span>
                <span class="footer-tagline">Be Known. Stand Out.</span>
            </div>
            <div class="footer-links">
                <a href="about.html" class="footer-link">About</a>
                <a href="work.html" class="footer-link">Work</a>
                <a href="contact.html" class="footer-link">Contact</a>
            </div>
        </div>
        <div class="footer-bottom">
            <p class="footer-copyright">&copy; 2025 Sidequest Digital. All rights reserved.</p>
            <div class="footer-legal">
                <a href="pages/terms.html">Terms</a>
                <a href="pages/privacy.html">Privacy</a>
            </div>
        </div>
    </footer>

    <!-- GSAP -->
    <script src="https://cdn.jsdelivr.net/npm/gsap@3/dist/gsap.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/gsap@3/dist/ScrollTrigger.min.js"></script>

    <!-- Site JS -->
    <script src="js/main.js"></script>
    <script src="js/scroll.js"></script>
    <script src="js/animations.js"></script>
</body>
</html>
```

- [ ] **Step 2: Verify — open in browser, confirm dark page with nav visible, panels exist in DOM**

- [ ] **Step 3: Commit**

```bash
git add index.html
git commit -m "feat: homepage HTML structure with all 6 panels"
```

---

## Task 5: GSAP Horizontal Scroll Setup

**Files:**
- Create: `css/layout.css` — horizontal scroll layout, panel sizing
- Create: `js/scroll.js` — GSAP ScrollTrigger horizontal scroll

- [ ] **Step 1: Write `css/layout.css`**

```css
/* ===== Horizontal Scroll Layout (Desktop) ===== */
.horizontal-scroll {
    padding-top: var(--nav-height);
}

.panels {
    display: flex;
    width: fit-content;
}

.panel {
    width: 100vw;
    height: calc(100vh - var(--nav-height));
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    overflow: hidden;
    flex-shrink: 0;
    padding: var(--space-3xl);
}

.panel-content {
    position: relative;
    z-index: 2;
    max-width: 600px;
}

.panel-glow {
    position: absolute;
    width: 60%;
    height: 60%;
    border-radius: 50%;
    filter: blur(120px);
    opacity: 0.4;
    pointer-events: none;
}

.panel-glow-purple {
    background: var(--accent-purple);
    top: 20%;
    left: -10%;
}

.panel-glow-orange {
    background: var(--accent-orange);
    bottom: 20%;
    right: -10%;
}

/* Hero panel specific */
.panel-hero {
    text-align: center;
}

.hero-title {
    margin-bottom: var(--space-xl);
}

.hero-line {
    display: block;
}

.hero-subtitle {
    font-size: var(--text-xl);
    color: var(--text-secondary);
    max-width: 500px;
    margin: 0 auto;
}

.hero-scroll-cue {
    position: absolute;
    bottom: var(--space-2xl);
    right: var(--space-2xl);
    display: flex;
    align-items: center;
    gap: var(--space-sm);
    font-size: var(--text-xs);
    color: var(--text-muted);
    letter-spacing: 0.1em;
}

/* Service panels */
.panel-service .panel-title {
    font-size: var(--text-3xl);
    margin: var(--space-md) 0 var(--space-lg);
}

.panel-service .panel-desc {
    font-size: var(--text-lg);
    margin-bottom: var(--space-2xl);
}

/* Featured project card within panels */
.featured-project {
    background: var(--bg-elevated);
    border: 1px solid var(--border-subtle);
    border-radius: var(--radius-lg);
    padding: var(--space-lg);
    display: flex;
    gap: var(--space-lg);
    align-items: center;
    max-width: 480px;
    transition: border-color 0.3s var(--ease-out);
}

.featured-project:hover {
    border-color: var(--accent-purple);
}

.featured-project-image {
    width: 120px;
    height: 80px;
    border-radius: var(--radius-md);
    overflow: hidden;
    flex-shrink: 0;
    background: var(--bg-surface);
}

.featured-project-image img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.featured-project-info h4 {
    font-size: var(--text-base);
    font-weight: 600;
    margin-bottom: var(--space-xs);
}

.featured-project-info p {
    font-size: var(--text-sm);
    color: var(--text-muted);
}

/* Teaser panel */
.panel-teaser {
    text-align: center;
}

.panel-teaser .panel-title {
    font-size: var(--text-3xl);
    margin-bottom: var(--space-lg);
}

.panel-teaser .panel-desc {
    font-size: var(--text-lg);
    margin-bottom: var(--space-2xl);
}

/* CTA Button */
.btn-primary {
    display: inline-flex;
    align-items: center;
    gap: var(--space-sm);
    padding: var(--space-md) var(--space-xl);
    background: var(--accent-purple);
    color: var(--text-primary);
    font-family: var(--font-body);
    font-size: var(--text-sm);
    font-weight: 600;
    border-radius: var(--radius-full);
    transition: background 0.3s var(--ease-out), transform 0.3s var(--ease-out);
}

.btn-primary:hover {
    background: var(--accent-purple-light);
    transform: translateY(-2px);
}

/* ===== Mobile: Vertical Stack ===== */
@media (max-width: 768px) {
    .panels {
        display: flex;
        flex-direction: column;
        width: 100%;
    }

    .panel {
        width: 100%;
        height: auto;
        min-height: 80vh;
        padding: var(--space-4xl) var(--space-xl);
    }

    .panel-hero {
        min-height: calc(100vh - var(--nav-height));
    }

    .hero-scroll-cue {
        display: none;
    }

    .featured-project {
        flex-direction: column;
        text-align: center;
    }

    .featured-project-image {
        width: 100%;
        height: 160px;
    }
}
```

- [ ] **Step 2: Write `js/scroll.js`**

```javascript
// GSAP Horizontal Scroll — Desktop Only
function initHorizontalScroll() {
    const isDesktop = window.matchMedia('(min-width: 769px)').matches;
    if (!isDesktop) return;

    gsap.registerPlugin(ScrollTrigger);

    const scrollContainer = document.getElementById('horizontal-scroll');
    const panels = document.querySelector('.panels');
    const panelElements = gsap.utils.toArray('.panel');

    if (!scrollContainer || !panels || panelElements.length === 0) return;

    const totalScroll = panels.scrollWidth - window.innerWidth;

    gsap.to(panels, {
        x: -totalScroll,
        ease: 'none',
        scrollTrigger: {
            trigger: scrollContainer,
            pin: true,
            scrub: 1,
            end: () => `+=${totalScroll}`,
            invalidateOnRefresh: true,
        }
    });
}

// Initialize on DOM ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initHorizontalScroll);
} else {
    initHorizontalScroll();
}

// Reinitialize on resize (debounced)
let resizeTimeout;
window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
        ScrollTrigger.getAll().forEach(t => t.kill());
        initHorizontalScroll();
    }, 250);
});
```

- [ ] **Step 3: Verify in browser**

Desktop: Scroll vertically and panels should move horizontally. The page should be pinned during the scroll. Each panel should be viewport-width.

Mobile (resize to <769px): Panels should stack vertically, normal scroll behavior.

- [ ] **Step 4: Commit**

```bash
git add css/layout.css js/scroll.js
git commit -m "feat: GSAP horizontal scroll — panels move left on vertical scroll (desktop)"
```

---

## Task 6: Hero Panel Animation

**Files:**
- Create: `js/animations.js` — hero animation timeline + per-panel scroll-linked animations
- Update: `css/animations.css` — animation base states, keyframes

- [ ] **Step 1: Write `css/animations.css`**

```css
/* ===== Initial States (before GSAP animates) ===== */
.hero-line {
    opacity: 0;
    transform: translateY(40px);
}

.hero-subtitle {
    opacity: 0;
    transform: translateY(20px);
}

.hero-scroll-cue {
    opacity: 0;
}

.panel-service .label,
.panel-service .panel-title,
.panel-service .panel-desc,
.panel-service .featured-project {
    opacity: 0;
    transform: translateY(30px);
}

.panel-teaser .panel-title,
.panel-teaser .panel-desc,
.panel-teaser .btn-primary {
    opacity: 0;
    transform: translateY(30px);
}

/* ===== Glow Pulse ===== */
@keyframes glowPulse {
    0%, 100% { opacity: 0.3; transform: scale(1); }
    50% { opacity: 0.5; transform: scale(1.05); }
}

.panel-glow {
    animation: glowPulse 6s ease-in-out infinite;
}

/* ===== Scroll Cue Bounce ===== */
@keyframes cueBounce {
    0%, 100% { transform: translateX(0); }
    50% { transform: translateX(6px); }
}

.hero-scroll-cue svg {
    animation: cueBounce 2s ease-in-out infinite;
}
```

- [ ] **Step 2: Write `js/animations.js`**

```javascript
// Panel Animations — triggered by scroll position
function initAnimations() {
    gsap.registerPlugin(ScrollTrigger);

    const isDesktop = window.matchMedia('(min-width: 769px)').matches;

    if (isDesktop) {
        initDesktopAnimations();
    } else {
        initMobileAnimations();
    }
}

function initDesktopAnimations() {
    const panels = document.querySelector('.panels');
    if (!panels) return;

    // Hero entrance (plays immediately on load)
    const heroTl = gsap.timeline({ delay: 0.3 });

    heroTl
        .to('.hero-line', {
            opacity: 1,
            y: 0,
            duration: 0.8,
            stagger: 0.2,
            ease: 'power3.out'
        })
        .to('.hero-subtitle', {
            opacity: 1,
            y: 0,
            duration: 0.6,
            ease: 'power3.out'
        }, '-=0.3')
        .to('.hero-scroll-cue', {
            opacity: 1,
            duration: 0.5,
            ease: 'power2.out'
        }, '-=0.2');

    // Service panel animations — triggered when panel enters viewport
    const servicePanels = gsap.utils.toArray('.panel-service');
    const totalScroll = panels.scrollWidth - window.innerWidth;
    const scrollContainer = document.getElementById('horizontal-scroll');

    servicePanels.forEach((panel) => {
        const label = panel.querySelector('.label');
        const title = panel.querySelector('.panel-title');
        const desc = panel.querySelector('.panel-desc');
        const featured = panel.querySelector('.featured-project');

        const tl = gsap.timeline({
            scrollTrigger: {
                trigger: scrollContainer,
                start: 'top top',
                end: () => `+=${totalScroll}`,
                scrub: 1,
                // Calculate when this panel is in view
                onUpdate: (self) => {
                    const panelIndex = servicePanels.indexOf(panel);
                    const panelStart = (panelIndex + 1) / (servicePanels.length + 2);
                    const panelEnd = panelStart + (1 / (servicePanels.length + 2));
                    const progress = self.progress;

                    if (progress >= panelStart - 0.05 && progress <= panelEnd + 0.05) {
                        if (!panel.classList.contains('revealed')) {
                            panel.classList.add('revealed');
                            revealPanel(panel);
                        }
                    }
                }
            }
        });
    });

    // Teaser panel
    const teaserPanel = document.querySelector('.panel-teaser');
    if (teaserPanel) {
        ScrollTrigger.create({
            trigger: scrollContainer,
            start: 'top top',
            end: () => `+=${totalScroll}`,
            scrub: 1,
            onUpdate: (self) => {
                if (self.progress > 0.8 && !teaserPanel.classList.contains('revealed')) {
                    teaserPanel.classList.add('revealed');
                    revealPanel(teaserPanel);
                }
            }
        });
    }
}

function revealPanel(panel) {
    const elements = panel.querySelectorAll('.label, .panel-title, .panel-desc, .featured-project, .btn-primary');

    gsap.to(elements, {
        opacity: 1,
        y: 0,
        duration: 0.7,
        stagger: 0.12,
        ease: 'power3.out'
    });
}

function initMobileAnimations() {
    // Hero entrance on load
    const heroTl = gsap.timeline({ delay: 0.3 });
    heroTl
        .to('.hero-line', {
            opacity: 1,
            y: 0,
            duration: 0.8,
            stagger: 0.2,
            ease: 'power3.out'
        })
        .to('.hero-subtitle', {
            opacity: 1,
            y: 0,
            duration: 0.6,
            ease: 'power3.out'
        }, '-=0.3');

    // Scroll-triggered reveals for all other panels
    const panels = gsap.utils.toArray('.panel-service, .panel-teaser');
    panels.forEach(panel => {
        const elements = panel.querySelectorAll('.label, .panel-title, .panel-desc, .featured-project, .btn-primary');

        gsap.to(elements, {
            opacity: 1,
            y: 0,
            duration: 0.7,
            stagger: 0.1,
            ease: 'power3.out',
            scrollTrigger: {
                trigger: panel,
                start: 'top 75%',
                toggleActions: 'play none none none'
            }
        });
    });
}

// Initialize
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAnimations);
} else {
    initAnimations();
}
```

- [ ] **Step 3: Verify in browser**

Desktop:
- Hero text animates in on page load (fade up, staggered)
- Scroll cue appears with subtle bounce
- As you scroll right through panels, each panel's content reveals (fade up, staggered)
- Glows pulse subtly in background

Mobile:
- Hero animates on load
- Other panels reveal as you scroll down past them

- [ ] **Step 4: Commit**

```bash
git add css/animations.css js/animations.js
git commit -m "feat: GSAP animations — hero entrance, panel reveals, glow effects"
```

---

## Task 7: Project Content System

**Files:**
- Create: `projects/manifest.json` — index of all projects (avoids per-file fetch overhead)
- Create: `projects/example-website/meta.json` — sample project
- Create: `projects/example-app/meta.json` — sample project
- Update: `js/main.js` — project loader utility

- [ ] **Step 1: Create sample project metadata**

`projects/example-website/meta.json`:
```json
{
    "title": "Example Website Project",
    "slug": "example-website",
    "summary": "A custom-built website showcasing what's possible when you start from scratch.",
    "category": "websites",
    "tags": ["Custom Design", "Responsive"],
    "featured": true,
    "featuredImage": "projects/example-website/assets/hero.png",
    "date": "2025-03-15",
    "url": "https://example.com",
    "status": "live"
}
```

`projects/example-app/meta.json`:
```json
{
    "title": "Example Web App",
    "slug": "example-app",
    "summary": "A custom tool built around a specific workflow — because off-the-shelf wasn't cutting it.",
    "category": "apps",
    "tags": ["Web App", "Dashboard"],
    "featured": true,
    "featuredImage": "projects/example-app/assets/hero.png",
    "date": "2025-05-01",
    "url": "https://example-app.com",
    "status": "live"
}
```

- [ ] **Step 2: Create `projects/manifest.json`**

This file lists all projects so the site only needs one fetch call.

```json
[
    {
        "title": "Example Website Project",
        "slug": "example-website",
        "summary": "A custom-built website showcasing what's possible when you start from scratch.",
        "category": "websites",
        "tags": ["Custom Design", "Responsive"],
        "featured": true,
        "featuredImage": "projects/example-website/assets/hero.png",
        "date": "2025-03-15",
        "url": "https://example.com",
        "status": "live"
    },
    {
        "title": "Example Web App",
        "slug": "example-app",
        "summary": "A custom tool built around a specific workflow — because off-the-shelf wasn't cutting it.",
        "category": "apps",
        "tags": ["Web App", "Dashboard"],
        "featured": true,
        "featuredImage": "projects/example-app/assets/hero.png",
        "date": "2025-05-01",
        "url": "https://example-app.com",
        "status": "live"
    }
]
```

- [ ] **Step 3: Create placeholder asset directories**

```bash
mkdir -p projects/example-website/assets
mkdir -p projects/example-app/assets
```

Create a simple placeholder `index.html` in each project folder (will be replaced with unique designs later):

`projects/example-website/index.html`:
```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Example Website Project — Sidequest Digital</title>
    <link rel="stylesheet" href="../../css/style.css">
    <link rel="stylesheet" href="../../css/components.css">
</head>
<body>
    <nav class="nav">
        <div class="nav-inner">
            <a href="/" class="nav-logo">
                <img src="../../images/logo-icon.png" alt="Sidequest Digital">
                <span>Sidequest Digital</span>
            </a>
            <ul class="nav-links">
                <li><a href="/" class="nav-link">Home</a></li>
                <li><a href="../../about.html" class="nav-link">About</a></li>
                <li><a href="../../work.html" class="nav-link active">Work</a></li>
                <li><a href="../../contact.html" class="nav-link">Contact</a></li>
            </ul>
        </div>
    </nav>
    <main style="padding-top: calc(var(--nav-height) + var(--space-4xl)); min-height: 100vh;">
        <div class="container">
            <h1>Example Website Project</h1>
            <p>This page will be custom designed.</p>
        </div>
    </main>
</body>
</html>
```

- [ ] **Step 4: Update `js/main.js` — add project loader**

Append to `js/main.js`:

```javascript
// Project Data Loader
async function loadProjects() {
    try {
        const response = await fetch('/projects/manifest.json');
        if (!response.ok) throw new Error('Failed to load projects');
        return await response.json();
    } catch (e) {
        console.warn('Could not load projects:', e);
        return [];
    }
}

// Populate featured project cards on homepage
async function populateFeaturedProjects() {
    const projects = await loadProjects();
    const slots = document.querySelectorAll('.featured-project[data-category]');

    slots.forEach(slot => {
        const category = slot.dataset.category;
        const featured = projects.find(p => p.category === category && p.featured);

        if (featured) {
            slot.innerHTML = `
                <a href="projects/${featured.slug}/" class="featured-project-link" style="display:flex;gap:var(--space-lg);align-items:center;text-decoration:none;color:inherit;">
                    <div class="featured-project-image">
                        ${featured.featuredImage
                            ? `<img src="${featured.featuredImage}" alt="${featured.title}">`
                            : `<div style="width:100%;height:100%;background:var(--bg-surface);display:flex;align-items:center;justify-content:center;color:var(--text-muted);font-size:var(--text-xs);">Coming soon</div>`
                        }
                    </div>
                    <div class="featured-project-info">
                        <h4>${featured.title}</h4>
                        <p>${featured.summary}</p>
                    </div>
                </a>
            `;
        } else {
            slot.innerHTML = `
                <div style="padding:var(--space-lg);text-align:center;color:var(--text-muted);font-size:var(--text-sm);">
                    Projects coming soon
                </div>
            `;
        }
    });
}

// Run on page load (homepage only)
if (document.querySelector('.featured-project[data-category]')) {
    populateFeaturedProjects();
}
```

- [ ] **Step 5: Verify — homepage should show featured project cards (or "coming soon" placeholders) in each service panel**

- [ ] **Step 6: Commit**

```bash
git add projects/ js/main.js
git commit -m "feat: project content system — manifest.json, sample data, homepage loader"
```

---

## Task 8: Work Page

**Files:**
- Rewrite: `work.html` — all projects grid with category filter
- Update: `css/layout.css` — add work page grid styles

- [ ] **Step 1: Write `work.html`**

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="Explore custom websites, apps, portals, and systems built by Sidequest Digital.">
    <title>Work — Sidequest Digital</title>

    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Outfit:wght@400;500;600;700;800;900&display=swap" rel="stylesheet">

    <link rel="stylesheet" href="css/style.css">
    <link rel="stylesheet" href="css/layout.css">
    <link rel="stylesheet" href="css/components.css">
    <link rel="stylesheet" href="css/animations.css">

    <link rel="icon" type="image/png" href="images/favicon.png">
</head>
<body>
    <nav class="nav">
        <div class="nav-inner">
            <a href="/" class="nav-logo">
                <img src="images/logo-icon.png" alt="Sidequest Digital">
                <span>Sidequest Digital</span>
            </a>
            <ul class="nav-links">
                <li><a href="/" class="nav-link">Home</a></li>
                <li><a href="about.html" class="nav-link">About</a></li>
                <li><a href="work.html" class="nav-link active">Work</a></li>
                <li><a href="contact.html" class="nav-link">Contact</a></li>
            </ul>
            <button class="nav-toggle" aria-label="Toggle menu">
                <span></span><span></span><span></span>
            </button>
        </div>
    </nav>
    <div class="nav-mobile">
        <a href="/">Home</a>
        <a href="about.html">About</a>
        <a href="work.html">Work</a>
        <a href="contact.html">Contact</a>
    </div>

    <main class="page-content">
        <section class="work-hero">
            <div class="container">
                <div class="work-hero-glow"></div>
                <h1>The Work</h1>
                <p class="work-hero-subtitle">Every project is its own adventure. Here's where we've been.</p>
            </div>
        </section>

        <section class="work-grid-section">
            <div class="container">
                <div class="work-filters">
                    <button class="filter-btn active" data-filter="all">All</button>
                    <button class="filter-btn" data-filter="websites">Websites</button>
                    <button class="filter-btn" data-filter="apps">Apps</button>
                    <button class="filter-btn" data-filter="portals">Portals</button>
                    <button class="filter-btn" data-filter="systems">Systems</button>
                </div>
                <div class="work-grid" id="work-grid">
                    <!-- Populated by JS -->
                </div>
            </div>
        </section>
    </main>

    <footer class="footer">
        <div class="footer-inner">
            <div class="footer-brand">
                <span class="footer-brand-name">Sidequest Digital</span>
                <span class="footer-tagline">Be Known. Stand Out.</span>
            </div>
            <div class="footer-links">
                <a href="about.html" class="footer-link">About</a>
                <a href="work.html" class="footer-link">Work</a>
                <a href="contact.html" class="footer-link">Contact</a>
            </div>
        </div>
        <div class="footer-bottom">
            <p class="footer-copyright">&copy; 2025 Sidequest Digital. All rights reserved.</p>
            <div class="footer-legal">
                <a href="pages/terms.html">Terms</a>
                <a href="pages/privacy.html">Privacy</a>
            </div>
        </div>
    </footer>

    <script src="https://cdn.jsdelivr.net/npm/gsap@3/dist/gsap.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/gsap@3/dist/ScrollTrigger.min.js"></script>
    <script src="js/main.js"></script>
    <script>
        // Work page — load and display all projects
        (async function() {
            const grid = document.getElementById('work-grid');
            const projects = await loadProjects();

            function renderGrid(filter) {
                const filtered = filter === 'all'
                    ? projects
                    : projects.filter(p => p.category === filter);

                grid.innerHTML = filtered.map(project => `
                    <a href="projects/${project.slug}/" class="work-card">
                        <div class="work-card-image">
                            ${project.featuredImage
                                ? `<img src="${project.featuredImage}" alt="${project.title}">`
                                : `<div class="work-card-placeholder"></div>`
                            }
                        </div>
                        <div class="work-card-body">
                            <div class="work-card-tags">
                                ${project.tags.map(t => `<span class="tag">${t}</span>`).join('')}
                            </div>
                            <h3>${project.title}</h3>
                            <p>${project.summary}</p>
                        </div>
                    </a>
                `).join('');

                // Staggered reveal
                gsap.registerPlugin(ScrollTrigger);
                gsap.from('.work-card', {
                    opacity: 0,
                    y: 40,
                    duration: 0.6,
                    stagger: 0.1,
                    ease: 'power3.out'
                });
            }

            renderGrid('all');

            // Filter buttons
            document.querySelectorAll('.filter-btn').forEach(btn => {
                btn.addEventListener('click', () => {
                    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
                    btn.classList.add('active');
                    renderGrid(btn.dataset.filter);
                });
            });
        })();
    </script>
</body>
</html>
```

- [ ] **Step 2: Add work page styles to `css/layout.css`**

Append to `css/layout.css`:

```css
/* ===== Work Page ===== */
.page-content {
    padding-top: var(--nav-height);
}

.work-hero {
    padding: var(--space-4xl) 0;
    position: relative;
    overflow: hidden;
}

.work-hero-glow {
    position: absolute;
    top: -50%;
    left: -20%;
    width: 60%;
    height: 200%;
    background: var(--glow-purple);
    border-radius: 50%;
    filter: blur(100px);
    pointer-events: none;
}

.work-hero h1 {
    position: relative;
    z-index: 1;
}

.work-hero-subtitle {
    position: relative;
    z-index: 1;
    font-size: var(--text-xl);
    color: var(--text-secondary);
    margin-top: var(--space-md);
}

.work-filters {
    display: flex;
    gap: var(--space-sm);
    margin-bottom: var(--space-3xl);
    flex-wrap: wrap;
}

.filter-btn {
    padding: var(--space-sm) var(--space-lg);
    font-size: var(--text-sm);
    color: var(--text-muted);
    border: 1px solid var(--border-subtle);
    border-radius: var(--radius-full);
    transition: all 0.3s var(--ease-out);
}

.filter-btn:hover {
    color: var(--text-secondary);
    border-color: var(--accent-purple);
}

.filter-btn.active {
    color: var(--text-primary);
    background: var(--accent-purple);
    border-color: var(--accent-purple);
}

.work-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
    gap: var(--space-2xl);
}

.work-card {
    display: block;
    background: var(--bg-elevated);
    border: 1px solid var(--border-subtle);
    border-radius: var(--radius-xl);
    overflow: hidden;
    transition: all 0.3s var(--ease-out);
}

.work-card:hover {
    border-color: var(--accent-purple);
    transform: translateY(-4px);
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
}

.work-card-image {
    aspect-ratio: 16/10;
    overflow: hidden;
    background: var(--bg-surface);
}

.work-card-image img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.4s var(--ease-out);
}

.work-card:hover .work-card-image img {
    transform: scale(1.05);
}

.work-card-placeholder {
    width: 100%;
    height: 100%;
    background: linear-gradient(135deg, var(--bg-surface), var(--bg-elevated));
}

.work-card-body {
    padding: var(--space-lg);
}

.work-card-tags {
    display: flex;
    gap: var(--space-xs);
    margin-bottom: var(--space-sm);
    flex-wrap: wrap;
}

.tag {
    font-size: var(--text-xs);
    padding: 2px 8px;
    background: rgba(109, 40, 217, 0.15);
    color: var(--accent-purple-light);
    border-radius: var(--radius-sm);
}

.work-card-body h3 {
    font-size: var(--text-lg);
    font-weight: 700;
    margin-bottom: var(--space-xs);
}

.work-card-body p {
    font-size: var(--text-sm);
    color: var(--text-muted);
    line-height: 1.5;
}

.work-grid-section {
    padding-bottom: var(--space-4xl);
}
```

- [ ] **Step 3: Verify — navigate to `work.html`, confirm grid renders, filters work, cards animate in**

- [ ] **Step 4: Commit**

```bash
git add work.html css/layout.css
git commit -m "feat: work page — filterable project grid with staggered reveals"
```

---

## Task 9: About Page

**Files:**
- Rewrite: `about.html` — editorial, personal, animated

- [ ] **Step 1: Write `about.html`**

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="Meet Joel Tempero — the solo developer behind Sidequest Digital. Based in Christchurch, New Zealand.">
    <title>About — Sidequest Digital</title>

    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Outfit:wght@400;500;600;700;800;900&display=swap" rel="stylesheet">

    <link rel="stylesheet" href="css/style.css">
    <link rel="stylesheet" href="css/layout.css">
    <link rel="stylesheet" href="css/components.css">
    <link rel="stylesheet" href="css/animations.css">

    <link rel="icon" type="image/png" href="images/favicon.png">
</head>
<body>
    <nav class="nav">
        <div class="nav-inner">
            <a href="/" class="nav-logo">
                <img src="images/logo-icon.png" alt="Sidequest Digital">
                <span>Sidequest Digital</span>
            </a>
            <ul class="nav-links">
                <li><a href="/" class="nav-link">Home</a></li>
                <li><a href="about.html" class="nav-link active">About</a></li>
                <li><a href="work.html" class="nav-link">Work</a></li>
                <li><a href="contact.html" class="nav-link">Contact</a></li>
            </ul>
            <button class="nav-toggle" aria-label="Toggle menu">
                <span></span><span></span><span></span>
            </button>
        </div>
    </nav>
    <div class="nav-mobile">
        <a href="/">Home</a>
        <a href="about.html">About</a>
        <a href="work.html">Work</a>
        <a href="contact.html">Contact</a>
    </div>

    <main class="page-content">
        <section class="about-hero">
            <div class="container">
                <div class="about-hero-glow"></div>
                <div class="about-grid">
                    <div class="about-text">
                        <span class="label">The Human</span>
                        <h1>Joel Tempero</h1>
                        <p class="about-intro">Solo developer. Based in Christchurch, New Zealand. Building custom digital solutions for communities, schools, and small businesses.</p>
                    </div>
                    <div class="about-image">
                        <div class="about-image-frame">
                            <img src="images/joel.jpg" alt="Joel Tempero">
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <section class="about-story">
            <div class="container">
                <div class="about-story-content">
                    <p class="about-large-text">I believe every business deserves digital tools that are as unique as they are.</p>
                    <p>Not another template with your logo slapped on. Not a one-size-fits-all solution that almost works. Something built from scratch, designed around how you actually work and what you actually need.</p>
                    <p>I work directly with you — no account managers, no handoffs, no telephone game. You talk to the person building your thing, every single time.</p>
                </div>
            </div>
        </section>

        <section class="about-approach">
            <div class="container">
                <span class="label">How I Work</span>
                <h2>The Approach</h2>
                <div class="approach-grid">
                    <div class="approach-card">
                        <h3>Listen First</h3>
                        <p>Every project starts with understanding — your goals, your people, your constraints. The tech comes second.</p>
                    </div>
                    <div class="approach-card">
                        <h3>Build With You</h3>
                        <p>You're involved at every step. Regular check-ins, real progress, no surprises at launch.</p>
                    </div>
                    <div class="approach-card">
                        <h3>Ship & Support</h3>
                        <p>Launch is just the beginning. I stick around to help it grow and evolve with your needs.</p>
                    </div>
                </div>
            </div>
        </section>
    </main>

    <footer class="footer">
        <div class="footer-inner">
            <div class="footer-brand">
                <span class="footer-brand-name">Sidequest Digital</span>
                <span class="footer-tagline">Be Known. Stand Out.</span>
            </div>
            <div class="footer-links">
                <a href="about.html" class="footer-link">About</a>
                <a href="work.html" class="footer-link">Work</a>
                <a href="contact.html" class="footer-link">Contact</a>
            </div>
        </div>
        <div class="footer-bottom">
            <p class="footer-copyright">&copy; 2025 Sidequest Digital. All rights reserved.</p>
            <div class="footer-legal">
                <a href="pages/terms.html">Terms</a>
                <a href="pages/privacy.html">Privacy</a>
            </div>
        </div>
    </footer>

    <script src="https://cdn.jsdelivr.net/npm/gsap@3/dist/gsap.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/gsap@3/dist/ScrollTrigger.min.js"></script>
    <script src="js/main.js"></script>
    <script>
        gsap.registerPlugin(ScrollTrigger);

        // Hero reveal
        gsap.from('.about-text > *', {
            opacity: 0, y: 30, duration: 0.7, stagger: 0.15, ease: 'power3.out', delay: 0.2
        });
        gsap.from('.about-image-frame', {
            opacity: 0, scale: 0.9, duration: 0.8, ease: 'power3.out', delay: 0.4
        });

        // Story section
        gsap.from('.about-story-content > *', {
            opacity: 0, y: 30, duration: 0.7, stagger: 0.15, ease: 'power3.out',
            scrollTrigger: { trigger: '.about-story', start: 'top 70%' }
        });

        // Approach cards
        gsap.from('.approach-card', {
            opacity: 0, y: 40, duration: 0.6, stagger: 0.15, ease: 'power3.out',
            scrollTrigger: { trigger: '.about-approach', start: 'top 70%' }
        });
    </script>
</body>
</html>
```

- [ ] **Step 2: Add about page styles to `css/layout.css`**

Append to `css/layout.css`:

```css
/* ===== About Page ===== */
.about-hero {
    padding: var(--space-4xl) 0;
    position: relative;
    overflow: hidden;
}

.about-hero-glow {
    position: absolute;
    top: -30%;
    right: -10%;
    width: 50%;
    height: 150%;
    background: var(--glow-purple);
    border-radius: 50%;
    filter: blur(120px);
    pointer-events: none;
}

.about-grid {
    display: grid;
    grid-template-columns: 1.2fr 0.8fr;
    gap: var(--space-4xl);
    align-items: center;
    position: relative;
    z-index: 1;
}

.about-text h1 {
    margin: var(--space-md) 0 var(--space-lg);
}

.about-intro {
    font-size: var(--text-xl);
    color: var(--text-secondary);
    line-height: 1.6;
}

.about-image-frame {
    border-radius: var(--radius-xl);
    overflow: hidden;
    border: 1px solid var(--border-subtle);
    aspect-ratio: 3/4;
}

.about-image-frame img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.about-story {
    padding: var(--space-4xl) 0;
    border-top: 1px solid var(--border-subtle);
}

.about-story-content {
    max-width: 700px;
}

.about-large-text {
    font-family: var(--font-heading);
    font-size: var(--text-2xl);
    font-weight: 700;
    color: var(--text-primary);
    line-height: 1.3;
    margin-bottom: var(--space-2xl);
}

.about-story-content p + p {
    margin-top: var(--space-lg);
}

.about-approach {
    padding: var(--space-4xl) 0;
    border-top: 1px solid var(--border-subtle);
}

.about-approach h2 {
    margin: var(--space-md) 0 var(--space-3xl);
}

.approach-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: var(--space-2xl);
}

.approach-card {
    padding: var(--space-2xl);
    background: var(--bg-elevated);
    border: 1px solid var(--border-subtle);
    border-radius: var(--radius-lg);
    transition: border-color 0.3s var(--ease-out);
}

.approach-card:hover {
    border-color: var(--accent-purple);
}

.approach-card h3 {
    font-size: var(--text-lg);
    margin-bottom: var(--space-md);
}

.approach-card p {
    font-size: var(--text-sm);
    color: var(--text-muted);
}

@media (max-width: 768px) {
    .about-grid {
        grid-template-columns: 1fr;
        gap: var(--space-2xl);
    }
    .about-image-frame {
        aspect-ratio: 1;
        max-width: 280px;
    }
    .approach-grid {
        grid-template-columns: 1fr;
    }
}
```

- [ ] **Step 3: Verify — navigate to about.html, confirm layout, image, scroll animations**

- [ ] **Step 4: Commit**

```bash
git add about.html css/layout.css
git commit -m "feat: about page — editorial layout with scroll-triggered animations"
```

---

## Task 10: Contact Page

**Files:**
- Rewrite: `contact.html`

- [ ] **Step 1: Write `contact.html`**

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="Get in touch with Sidequest Digital. Let's build something together.">
    <title>Contact — Sidequest Digital</title>

    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Outfit:wght@400;500;600;700;800;900&display=swap" rel="stylesheet">

    <link rel="stylesheet" href="css/style.css">
    <link rel="stylesheet" href="css/layout.css">
    <link rel="stylesheet" href="css/components.css">
    <link rel="stylesheet" href="css/animations.css">

    <link rel="icon" type="image/png" href="images/favicon.png">
</head>
<body>
    <nav class="nav">
        <div class="nav-inner">
            <a href="/" class="nav-logo">
                <img src="images/logo-icon.png" alt="Sidequest Digital">
                <span>Sidequest Digital</span>
            </a>
            <ul class="nav-links">
                <li><a href="/" class="nav-link">Home</a></li>
                <li><a href="about.html" class="nav-link">About</a></li>
                <li><a href="work.html" class="nav-link">Work</a></li>
                <li><a href="contact.html" class="nav-link active">Contact</a></li>
            </ul>
            <button class="nav-toggle" aria-label="Toggle menu">
                <span></span><span></span><span></span>
            </button>
        </div>
    </nav>
    <div class="nav-mobile">
        <a href="/">Home</a>
        <a href="about.html">About</a>
        <a href="work.html">Work</a>
        <a href="contact.html">Contact</a>
    </div>

    <main class="page-content">
        <section class="contact-section">
            <div class="container">
                <div class="contact-glow"></div>
                <div class="contact-grid">
                    <div class="contact-info">
                        <span class="label">Get In Touch</span>
                        <h1>Let's Talk</h1>
                        <p class="contact-intro">Got an idea? A problem? A vague notion that you need "something digital"? Let's chat.</p>

                        <div class="contact-details">
                            <div class="contact-detail">
                                <span class="label">Email</span>
                                <a href="mailto:joel@tempero.nz">joel@tempero.nz</a>
                            </div>
                            <div class="contact-detail">
                                <span class="label">Phone</span>
                                <a href="tel:+64204023009">0204 023 9009</a>
                            </div>
                            <div class="contact-detail">
                                <span class="label">Location</span>
                                <span>Christchurch, New Zealand</span>
                            </div>
                        </div>
                    </div>

                    <form action="https://api.web3forms.com/submit" method="POST" class="contact-form" id="contact-form">
                        <input type="hidden" name="access_key" value="034020f4-ef4e-4f00-9988-3e99609b86c4">
                        <input type="hidden" name="subject" value="New Contact from Sidequest Website">
                        <input type="hidden" name="from_name" value="Sidequest Website">
                        <input type="checkbox" name="botcheck" style="display:none;">

                        <div class="form-row">
                            <div class="form-group">
                                <label for="name">Name</label>
                                <input type="text" id="name" name="name" placeholder="Your name" required>
                            </div>
                            <div class="form-group">
                                <label for="email">Email</label>
                                <input type="email" id="email" name="email" placeholder="you@company.com" required>
                            </div>
                        </div>
                        <div class="form-group">
                            <label for="project">What do you need?</label>
                            <select id="project" name="project" required>
                                <option value="" disabled selected>Select a project type</option>
                                <option value="website">Website</option>
                                <option value="webapp">Web Application</option>
                                <option value="portal">Client Portal</option>
                                <option value="system">Management System</option>
                                <option value="other">Something Else</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label for="message">Tell me more</label>
                            <textarea id="message" name="message" placeholder="What's on your mind?" rows="5" required></textarea>
                        </div>
                        <button type="submit" class="btn-primary btn-submit" id="submit-btn">
                            Send Message
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                        </button>
                        <p class="form-result" id="form-result"></p>
                    </form>
                </div>
            </div>
        </section>
    </main>

    <footer class="footer">
        <div class="footer-inner">
            <div class="footer-brand">
                <span class="footer-brand-name">Sidequest Digital</span>
                <span class="footer-tagline">Be Known. Stand Out.</span>
            </div>
            <div class="footer-links">
                <a href="about.html" class="footer-link">About</a>
                <a href="work.html" class="footer-link">Work</a>
                <a href="contact.html" class="footer-link">Contact</a>
            </div>
        </div>
        <div class="footer-bottom">
            <p class="footer-copyright">&copy; 2025 Sidequest Digital. All rights reserved.</p>
            <div class="footer-legal">
                <a href="pages/terms.html">Terms</a>
                <a href="pages/privacy.html">Privacy</a>
            </div>
        </div>
    </footer>

    <script src="https://cdn.jsdelivr.net/npm/gsap@3/dist/gsap.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/gsap@3/dist/ScrollTrigger.min.js"></script>
    <script src="js/main.js"></script>
    <script>
        // Entrance animations
        gsap.from('.contact-info > *', {
            opacity: 0, y: 30, duration: 0.7, stagger: 0.12, ease: 'power3.out', delay: 0.2
        });
        gsap.from('.contact-form', {
            opacity: 0, y: 30, duration: 0.7, ease: 'power3.out', delay: 0.4
        });

        // Form submission
        const form = document.getElementById('contact-form');
        const result = document.getElementById('form-result');
        const submitBtn = document.getElementById('submit-btn');

        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const originalHTML = submitBtn.innerHTML;
            submitBtn.innerHTML = 'Sending...';
            submitBtn.disabled = true;

            try {
                const response = await fetch('https://api.web3forms.com/submit', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
                    body: JSON.stringify(Object.fromEntries(new FormData(form)))
                });
                const data = await response.json();

                if (data.success) {
                    result.textContent = 'Message sent! I\'ll be in touch soon.';
                    result.style.color = '#22c55e';
                    form.reset();
                } else {
                    throw new Error(data.message);
                }
            } catch (err) {
                result.textContent = 'Something went wrong. Please try again.';
                result.style.color = '#ef4444';
            }

            result.style.display = 'block';
            submitBtn.innerHTML = originalHTML;
            submitBtn.disabled = false;
        });
    </script>
</body>
</html>
```

- [ ] **Step 2: Add contact page styles to `css/layout.css`**

Append to `css/layout.css`:

```css
/* ===== Contact Page ===== */
.contact-section {
    padding: var(--space-4xl) 0;
    position: relative;
    min-height: calc(100vh - var(--nav-height));
    display: flex;
    align-items: center;
}

.contact-glow {
    position: absolute;
    top: 10%;
    left: -20%;
    width: 50%;
    height: 80%;
    background: var(--glow-purple);
    border-radius: 50%;
    filter: blur(120px);
    pointer-events: none;
}

.contact-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: var(--space-4xl);
    align-items: start;
    position: relative;
    z-index: 1;
}

.contact-info h1 {
    margin: var(--space-md) 0 var(--space-lg);
}

.contact-intro {
    font-size: var(--text-lg);
    color: var(--text-secondary);
    margin-bottom: var(--space-3xl);
}

.contact-details {
    display: flex;
    flex-direction: column;
    gap: var(--space-xl);
}

.contact-detail .label {
    display: block;
    margin-bottom: var(--space-xs);
}

.contact-detail a,
.contact-detail span {
    font-size: var(--text-xl);
    font-weight: 600;
    color: var(--text-primary);
}

.contact-detail a:hover {
    color: var(--accent-purple-light);
}

/* Form Styles */
.contact-form {
    background: var(--bg-elevated);
    border: 1px solid var(--border-subtle);
    border-radius: var(--radius-xl);
    padding: var(--space-2xl);
}

.form-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: var(--space-lg);
}

.form-group {
    margin-bottom: var(--space-lg);
}

.form-group label {
    display: block;
    font-size: var(--text-sm);
    font-weight: 500;
    color: var(--text-secondary);
    margin-bottom: var(--space-sm);
}

.form-group input,
.form-group select,
.form-group textarea {
    width: 100%;
    padding: var(--space-md);
    background: var(--bg-surface);
    border: 1px solid var(--border-subtle);
    border-radius: var(--radius-md);
    color: var(--text-primary);
    font-family: var(--font-body);
    font-size: var(--text-base);
    transition: border-color 0.3s var(--ease-out);
}

.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
    outline: none;
    border-color: var(--accent-purple);
}

.form-group textarea {
    resize: vertical;
    min-height: 120px;
}

.btn-submit {
    width: 100%;
    justify-content: center;
}

.form-result {
    display: none;
    margin-top: var(--space-lg);
    text-align: center;
    font-size: var(--text-sm);
}

@media (max-width: 768px) {
    .contact-grid {
        grid-template-columns: 1fr;
        gap: var(--space-3xl);
    }
    .form-row {
        grid-template-columns: 1fr;
    }
}
```

- [ ] **Step 3: Verify — test form renders, submit works (sends to Web3Forms), animations play on load**

- [ ] **Step 4: Commit**

```bash
git add contact.html css/layout.css
git commit -m "feat: contact page — atmospheric form with Web3Forms integration"
```

---

## Task 11: Mobile Polish & Responsive Tweaks

**Files:**
- Update: `css/layout.css` — additional mobile breakpoints
- Update: `css/animations.css` — mobile animation adjustments

- [ ] **Step 1: Add responsive refinements to `css/layout.css`**

Append to `css/layout.css`:

```css
/* ===== Global Mobile Adjustments ===== */
@media (max-width: 768px) {
    .container {
        padding: 0 var(--space-lg);
    }

    h1 { font-size: var(--text-3xl); }
    h2 { font-size: var(--text-2xl); }

    .panel-service .panel-title {
        font-size: var(--text-2xl);
    }
}

@media (max-width: 480px) {
    .container {
        padding: 0 var(--space-md);
    }
}
```

- [ ] **Step 2: Ensure mobile animations don't conflict**

In `css/animations.css`, add:

```css
/* On mobile, don't hide elements that GSAP hasn't initialized yet */
@media (max-width: 768px) {
    .hero-scroll-cue {
        display: none;
    }
}
```

- [ ] **Step 3: Test on mobile viewport (browser DevTools, 375px and 768px widths)**

Verify:
- Homepage stacks vertically
- Nav toggle works, mobile overlay opens/closes
- All pages are readable and usable
- Animations fire on scroll (not stuck invisible)
- Touch scrolling is smooth

- [ ] **Step 4: Commit**

```bash
git add css/layout.css css/animations.css
git commit -m "fix: mobile responsive polish — breakpoints, animation fallbacks"
```

---

## Task 12: Cleanup & Final Wiring

**Files:**
- Delete: `pages/about.html` (old, replaced by root `about.html`)
- Update: `pages/terms.html`, `pages/privacy.html` — update nav links to new structure
- Verify: all internal links work

- [ ] **Step 1: Delete old about page**

```bash
rm pages/about.html
```

- [ ] **Step 2: Update terms.html and privacy.html nav links**

In both `pages/terms.html` and `pages/privacy.html`, update the navigation to match the new site structure. Replace old nav with:

```html
<nav class="nav">
    <div class="nav-inner">
        <a href="../" class="nav-logo">
            <img src="../images/logo-icon.png" alt="Sidequest Digital">
            <span>Sidequest Digital</span>
        </a>
        <ul class="nav-links">
            <li><a href="../" class="nav-link">Home</a></li>
            <li><a href="../about.html" class="nav-link">About</a></li>
            <li><a href="../work.html" class="nav-link">Work</a></li>
            <li><a href="../contact.html" class="nav-link">Contact</a></li>
        </ul>
    </div>
</nav>
```

Update their CSS references to point to `../css/style.css`, `../css/components.css`, etc.

- [ ] **Step 3: Verify all links work**

Navigate through the entire site:
- Home → About (link works)
- Home → Work (link works)
- Home → Contact (link works)
- Work → project detail page (link works)
- Footer links work
- Terms/Privacy pages load correctly
- No 404s in browser console

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "chore: cleanup old pages, fix internal links for new structure"
```

---

## Task 13: CLAUDE.md & Brain Integration

**Files:**
- Create: `CLAUDE.md` (project root) — project documentation for future sessions
- Update: `D:/Sidequest Digital/Dev Projects/Brain/CLAUDE.md` — add cross-project reference

- [ ] **Step 1: Create project `CLAUDE.md`**

```markdown
# Sidequest Digital — Marketing Site

## Overview
- **Project**: sidequest.nz marketing website
- **Type**: Static portfolio site
- **Status**: Rebuilt (v2 — horizontal scroll, GSAP)
- **URL**: sidequest.nz

## Tech Stack
- HTML5, CSS3 (custom properties), vanilla JS (ES modules)
- GSAP 3 + ScrollTrigger (CDN) — horizontal scroll, animations
- Web3Forms — contact form handling
- Google Fonts — Outfit (headings), Inter (body)
- Static hosting (no build step)

## Site Structure
- `index.html` — homepage with horizontal scroll (desktop), vertical + animations (mobile)
- `about.html` — editorial about page
- `work.html` — all projects, filterable grid
- `contact.html` — contact form + details
- `projects/<slug>/` — unique detail page per project
- `pages/terms.html`, `pages/privacy.html` — legal (kept from v1)

## Project Content System
- Projects stored in `projects/<slug>/` with `meta.json` + `index.html` + `assets/`
- `projects/manifest.json` — single index of all project metadata
- Homepage reads manifest to populate featured projects per category
- Work page reads manifest for full grid
- Each project detail page is a **unique, hand-crafted HTML file** — no shared template
- Brain project (Sidequest Center) has a CMS tab that writes to this directory

## Key Files
- `css/style.css` — reset, variables, typography, dark theme foundation
- `css/layout.css` — horizontal scroll layout, page layouts, responsive
- `css/components.css` — nav, footer, cards, buttons
- `css/animations.css` — initial states, keyframes (GSAP does the heavy lifting)
- `js/main.js` — nav toggle, project loader utility
- `js/scroll.js` — GSAP ScrollTrigger horizontal scroll setup
- `js/animations.js` — per-panel and per-page animation timelines

## Design Language
- Dark theme (#0a0a0a base)
- Purple (#6d28d9) + orange (#f97316) accent system
- Atmospheric glows, noise overlay, gradient borders
- Storytelling copywriting (not marketing speak)
- Always "Sidequest Digital" (never shortened)

## Adding a New Project
1. Create `projects/<slug>/` directory
2. Add `meta.json` with schema (see spec)
3. Add `index.html` — custom, unique detail page
4. Add entry to `projects/manifest.json`
5. If featured, set `"featured": true` in meta.json

## Dev Commands
- Dev: Open with VS Code Live Server (no build step)
- Deploy: Push to git (static host auto-deploys)

## Playbooks In Use
- `JoelTempero.md` — working profile (always)
- `TokenDiscipline.md` — token cost hygiene (always)
- `DesignSystem.md` — design contract workflow (current phase)

## Related Projects
- **Brain (Sidequest Center)**: `D:/Sidequest Digital/Dev Projects/Brain/` — CMS tab writes project content to this repo's `projects/` directory
- **Portal (retiring)**: `portal.sidequest.nz/` subfolder — being taken offline, no longer maintained
```

- [ ] **Step 2: Update Brain project CLAUDE.md**

Read `D:/Sidequest Digital/Dev Projects/Brain/CLAUDE.md` and add a section documenting the connection:

```markdown
## Connected Projects

### Sidequest Digital Website (`D:/Sidequest Digital/Dev Projects/Business/sidequest.nz`)

The CMS/Projects tab in Sidequest Center manages content for the marketing site:
- Writes project `meta.json` files to `sidequest.nz/projects/<slug>/meta.json`
- Updates `sidequest.nz/projects/manifest.json` (the index file)
- Schema: `{ title, slug, summary, category, tags, featured, featuredImage, date, url, status }`
- Categories: `websites`, `apps`, `portals`, `systems`
- Featured projects (`featured: true`) appear on the homepage horizontal scroll panels
- Each project has a unique hand-crafted `index.html` detail page (not generated by CMS)
```

- [ ] **Step 3: Commit both files**

```bash
git add CLAUDE.md
git commit -m "docs: add project CLAUDE.md for future sessions"
```

(Brain project commit done separately in that repo)

---

## Task 14: Final Verification

- [ ] **Step 1: Full site walkthrough**

Open the site with Live Server and verify:
1. Homepage horizontal scroll works smoothly on desktop
2. Hero animation plays on load
3. Service panels reveal as you scroll through
4. Featured projects load (or show placeholder)
5. Teaser panel CTA links to work page
6. Work page grid loads, filters function
7. About page looks editorial, animations work
8. Contact form submits successfully
9. Mobile: all pages work, vertical layout, touch-friendly
10. Nav works on all pages (desktop + mobile toggle)
11. Footer links work
12. Terms/Privacy pages accessible
13. No console errors
14. No flash of white on page load (dark theme immediate)

- [ ] **Step 2: Performance check**

- Page should load fast (no Firebase, no heavy JS bundles)
- GSAP CDN should be cached after first load
- Images should not block rendering (defer/lazy where possible)
- No layout shift from GSAP initial states

- [ ] **Step 3: Commit any final tweaks**

```bash
git add -A
git commit -m "polish: final tweaks from verification walkthrough"
```
