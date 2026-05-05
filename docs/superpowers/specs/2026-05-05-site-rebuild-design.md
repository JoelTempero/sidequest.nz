# Sidequest Digital — Site Rebuild Design Spec

## Overview

Complete rebuild of sidequest.nz marketing site with a creativity-first approach. Moving from a conventional business site to an immersive, artistic portfolio experience inspired by [sms.playstation.com](https://sms.playstation.com/).

**Goals:**
- Showcase work through storytelling, not advertising
- Horizontal scroll experience on desktop, vertical with animations on mobile
- Each project page is a unique, hand-crafted experience
- Remove Firebase dependency — content managed locally
- Remove pricing page entirely
- Dark, cinematic visual identity with purple/orange brand accents

## Tech Stack

- **HTML/CSS/JS** — no framework (static marketing site)
- **GSAP + ScrollTrigger** — horizontal scroll, timeline animations, scroll-driven reveals
- **Local static content** — project data as files in the repo, no external CMS
- **Hosting** — static (GitHub Pages or equivalent, same as current)
- **Fonts** — Outfit (headings), Inter (body) — carried forward from current site
- **Form handling** — Web3Forms (same as current)

## Site Structure

### Navigation (fixed, always visible)

```
[Sidequest Digital logo]     Home | About | Work | Contact     [Client Portal button - removed]
```

Portal button removed since portal is being taken offline.

### Homepage — Horizontal Scroll (Desktop)

The homepage is a single horizontal scroll experience. The nav stays fixed above. GSAP ScrollTrigger maps vertical scroll input to horizontal panel movement.

**Panel sequence:**

| # | Panel | Content | Creative Direction |
|---|-------|---------|-------------------|
| 1 | Hero | "Be Known. Stand Out." tagline, atmospheric animation | Grand entrance — brand glow, particle effects, large type |
| 2 | Websites | Storytelling title + featured project | Each service panel has its own visual personality |
| 3 | Web Apps | Storytelling title + featured project | Different energy, different accent treatment |
| 4 | Portals | Storytelling title + featured project | |
| 5 | Systems | Storytelling title + featured project | |
| 6 | Teaser | Compelling transition to Work page | Makes people want to see more — "See all the work →" |

**Panel design notes:**
- Titles should feel like storytelling, not product categories (e.g. "Your corner of the internet" not "Websites")
- Each panel features one real project as proof of what's possible
- Panels have distinct visual treatments while maintaining cohesion
- Animations reward scrolling — elements reveal, shift, and respond to scroll position

### Homepage — Mobile

- Vertical scroll with each section as a full-width block
- Same content sequence, reorganised for vertical flow
- Scroll-triggered animations (fade-in, slide-up, stagger reveals)
- Touch-friendly, fast-loading
- No horizontal scroll mechanism on mobile

### About Page (separate, vertical scroll)

- Joel Tempero's story — editorial, personal
- More artistic than a typical corporate "about" page
- Scroll-triggered animations consistent with site personality
- Dark atmospheric design

### Work Page (separate, vertical scroll)

- All projects displayed
- Filterable by category (websites, web apps, portals, systems)
- Grid/masonry layout with staggered reveal animations
- Each card links to its unique project detail page
- Projects sourced from local `projects/` directory

### Contact Page (separate, vertical scroll)

- Simple, direct, atmospheric
- Contact form (Web3Forms) + direct contact details (email, phone, location)
- Dark aesthetic with brand accent glows

### Project Detail Pages (unique per project)

- **No shared template** — each project page is a custom, hand-crafted HTML experience
- Designed individually using Claude Code for creative uniqueness
- Only consistent elements: nav header and footer
- Can have custom animations, layouts, colour treatments, interactive elements
- Metadata (for listing/filtering) comes from `meta.json`, but the page itself is freeform

## Content Architecture

```
projects/
  project-slug/
    index.html       <- fully custom detail page (unique per project)
    meta.json        <- metadata for listings and homepage featured slots
    assets/          <- project-specific images, videos
```

**meta.json schema:**
```json
{
  "title": "Project Name",
  "slug": "project-slug",
  "summary": "One-line description",
  "category": "websites|apps|portals|systems",
  "tags": ["tag1", "tag2"],
  "featured": true,
  "featuredImage": "assets/hero.png",
  "date": "2025-06-15",
  "url": "https://example.com",
  "status": "live|in-progress|archived"
}
```

**Homepage featured selection:** The build/runtime reads all `meta.json` files, filters by `featured: true`, groups by category, and assigns one per service panel on the homepage.

## Visual Design Language

### Colour Palette

| Role | Value | Usage |
|------|-------|-------|
| Background (deep) | #0a0a0a | Page base |
| Background (elevated) | #1a1a1a | Cards, panels |
| Background (surface) | #111111 | Subtle elevation |
| Text primary | #ffffff | Headings, key content |
| Text secondary | rgba(255,255,255,0.6) | Body text, descriptions |
| Text muted | rgba(255,255,255,0.4) | Labels, metadata |
| Accent primary | #6d28d9 | Purple — highlights, glows, active states |
| Accent primary light | #a78bfa | Purple light — hover states, subtle accents |
| Accent secondary | #f97316 | Orange — warmth, energy, secondary highlights |
| Border subtle | rgba(255,255,255,0.06) | Card borders, dividers |
| Glow purple | rgba(109,40,217,0.2) | Radial glows, atmospheric effects |
| Glow orange | rgba(249,115,22,0.15) | Secondary atmospheric effects |

### Typography

- **Headings:** Outfit (700-900 weight), large scale, tight tracking
- **Body:** Inter (400-500), comfortable reading size
- **Accents/Labels:** Inter or monospace, small caps, letter-spacing for labels

### Atmospheric Effects

- Radial gradient glows behind key elements
- Subtle noise/grain texture overlay
- Gradient borders (purple → transparent)
- Particle effects (hero, subtle)
- Smooth parallax layers within panels

### Animation Philosophy

- **Purposeful** — every animation communicates something or rewards interaction
- **Smooth** — GSAP easing, no janky CSS transitions
- **Scroll-driven** — elements respond to scroll position, not just appear/disappear
- **Staggered** — grouped elements animate sequentially for rhythm
- **Performant** — GPU-accelerated transforms, no layout thrashing

## GSAP Implementation Notes

### Horizontal Scroll (Desktop)

```
- Container holds all panels in a flex row
- GSAP ScrollTrigger pins the container
- Vertical scroll input maps to horizontal translateX
- Each panel can have its own scroll-triggered timeline
- Individual elements within panels animate based on scroll progress
```

### Mobile Fallback

```
- Panels stack vertically (standard flow)
- ScrollTrigger still used for element-level animations
- Intersection Observer as lightweight alternative for simple reveals
- No horizontal scroll mechanism
```

### Per-Panel Timelines

Each service panel has its own animation timeline:
- Title reveals (clip-path, fade, slide)
- Featured project card enters (scale, opacity, position)
- Background effects animate (glow pulse, gradient shift)
- Decorative elements respond to scroll progress

## Migration Notes

### What's Being Removed

- Pricing page (`pages/pricing.html`)
- Individual service pages (`pages/websites.html`, `pages/apps.html`, `pages/portals.html`, `pages/systems.html`)
- Firebase SDK dependency (projects loaded from Firestore)
- Portal link in nav
- All current CSS (complete rewrite)
- All current JS (complete rewrite)

### What's Being Kept

- Brand name: "Sidequest Digital" (always full name, never shortened)
- Tagline: "Be Known. Stand Out."
- Contact details (email, phone, location)
- Web3Forms integration for contact form
- Favicon and logo assets
- Domain and hosting setup
- Terms/Privacy pages (low priority, can keep as-is initially)

### What's New

- GSAP + ScrollTrigger
- Horizontal scroll homepage
- Local project content system
- Unique per-project detail pages
- Dark cinematic visual identity
- Storytelling copywriting approach

## Cross-Project Integration

### Sidequest Center (Brain project)

The Brain project at `D:/Sidequest Digital/Dev Projects/Brain/` will have a CMS tab ("Posts" or "Projects") that:
- Creates/edits project `meta.json` files
- Manages project images/assets
- Provides a preview of project metadata
- Writes files directly to `sidequest.nz/projects/` directory

**Action required:** Update the Brain project's `CLAUDE.md` to document:
- The connection between Brain's CMS tab and this project's content structure
- The `meta.json` schema and where files are written
- The relationship between the two projects
- How featured projects are selected for the homepage

This ensures future sessions working on either project understand the integration.

## Build & Development

### Dev Workflow

1. Open project in VS Code
2. Use Live Server or similar for local dev (no build step needed for HTML/CSS/JS)
3. GSAP loaded via CDN or local copy
4. Projects created by adding folders to `projects/`
5. Deploy by pushing to git (static host picks up changes)

### File Structure (target)

```
sidequest.nz/
├── index.html              <- homepage (horizontal scroll)
├── about.html              <- about page
├── work.html               <- all projects page
├── contact.html            <- contact page
├── css/
│   ├── style.css           <- base/reset, variables, typography
│   ├── layout.css          <- horizontal scroll, grid, responsive
│   ├── components.css      <- cards, buttons, nav, footer
│   ��── animations.css      <- GSAP-complementary CSS, transitions
├── js/
│   ├── main.js             <- nav, utilities, project data loading
│   ├── scroll.js           <- GSAP ScrollTrigger horizontal scroll setup
│   └── animations.js       <- per-section animation timelines
├── images/
│   ├── logo-icon.png
│   ├── favicon.png
│   └─��� joel.jpg
├── projects/
│   ├── project-slug/
│   │   ├── index.html      <- unique detail page
│   │   ├── meta.json       <- metadata
│   │   └── assets/         <- project images
│   └── ...
├── pages/
│   ├── terms.html          <- kept as-is
│   └── privacy.html        <- kept as-is
└── docs/
    └���─ superpowers/specs/  <- this spec
```

## Open Questions (to resolve during implementation)

1. **Storytelling titles** — exact copy for each service panel (to be crafted during build)
2. **Hero animation** — specific particle/glow effect for the entry (to be designed in-browser)
3. **Project detail page patterns** — first few projects will establish creative patterns that inform future ones
4. **Work page layout** — grid vs masonry vs something more creative (to be decided when building)
5. **GSAP licensing** — free tier covers commercial use for standard features; confirm ScrollTrigger is included
