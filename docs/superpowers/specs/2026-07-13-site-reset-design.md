# Sidequest Digital — Site Reset

**Date:** 2026-07-13
**Status:** Approved design, ready for implementation plan

## Context

Sidequest Digital has changed shape as a business. The z-axis side-scroller redesign
(`feat/homepage-rethink` / `sidequest-backup`) is being parked, not deleted. The live site's
service pages, pricing, and case studies are being retired.

What replaces them is deliberately small: two pages, dark, still, confident. The site is a
business card with mystique. It sells nothing, proves nothing, and names no clients.

## Goals

- A homepage that fits one screen and makes a referral or a larger prospect want to write to you.
- An about page that says what Sidequest can do without listing services or packages.
- Effects that feel premium and run on a slow machine.
- Ship on GitHub Pages with no build step, no framework, no dependencies.

## Non-goals

- Client work, case studies, testimonials, logos, pricing.
- A CMS or blog. `js/cms.js` and the Tempero CMS integration are out of scope for this build.
- Restoring the z-axis world. It stays archived on its branch.

## Positioning

| Decision | Value |
| --- | --- |
| Job of the site | Business card with mystique |
| Register | Confident-minimal — mystery from what is left out, not from obfuscation |
| Audience | Referrals, and larger orgs who need Sidequest to punch above its weight |
| Two-island split | Bio detail only. No map, no motif. |

## Information architecture

```
/                  index.html    One screen. Statement, tagline, contact.
/about.html                      Capability + team.
/pages/privacy.html              Retained as-is (subpage chrome).
/pages/terms.html                Retained as-is (subpage chrome).
```

Everything else is deleted: `pages/{about,apps,portals,websites,systems,projects,project,pricing}.html`
and all `projects/<slug>/` case studies.

**Redirects.** The host is GitHub Pages (evidenced by `CNAME`, and the absence of any
`firebase.json` / `netlify.toml` / `vercel.json`). GitHub Pages has no server-side redirect
support. Every deleted path is therefore replaced by a stub HTML file containing a `noindex`
meta tag, a `<meta http-equiv="refresh">` to `/`, and a JS `location.replace('/')` fallback.
This is the same pattern already proven on `pages/pricing.html`.

## Homepage

One screen on desktop. No scroll to reach anything.

```
┌──────────────────────────────────────────────┐
│ ✦ Sidequest Digital                   About  │
│                                              │
│          BE KNOWN.                           │
│          STAND OUT.                          │
│          GET AHEAD.                          │
│                                              │
│          Being good is no longer enough.     │
│          Being early is.                     │
│                                              │
│ ─────────────────────────────────────────────│
│  [ contact strip ]                           │
└──────────────────────────────────────────────┘
```

### Copy

**Statement** (the hero, set very large):

> BE KNOWN.
> STAND OUT.
> GET AHEAD.

**Tagline** (beneath, restrained):

> Being good is no longer enough. Being early is.

Alternates on record, should the chosen line not survive contact with the eye:
- "The advantage goes to whoever moves first. We make sure that's you."
- "Everyone gets one shot at being early. This is yours."

### Contact strip

Pinned to the bottom of the viewport. Collapsed by default to a single line holding the
`Get in touch →` trigger on one side and the direct contact details on the other, so a visitor
who only wants to email or call never has to click anything.

Clicking the trigger expands the form **in place**, upward, above the strip — no navigation, no
page scroll, no redirect. The direct contact line remains visible throughout.

Form fields: name, email, message. Submits via `fetch()` to
`https://api.web3forms.com/submit` with the existing access key
`034020f4-ef4e-4f00-9988-3e99609b86c4`. On success the form is replaced in place by a
confirmation line. On failure it shows an inline error and the user's input is preserved.

The form is a real `<form>` with a real `action` so it degrades to a normal POST if JS fails.
The `fetch` handler calls `preventDefault()` only once it is certain it can take over.

The direct contact line, always present in the strip:

> Or hit us up direct — joel@tempero.nz — 0204 023 9009

### Mobile

One screen is not achievable on a phone with a headline, a tagline, and a form. Mobile
becomes one short, deliberate scroll: statement fills the first viewport, contact follows.
This is an accepted, explicit divergence from the desktop constraint — not a bug.

## About page

Capability, not services. No client names, no packages, no pricing, no proof.

> ### We supercharge what you're already building.
>
> Your idea, your business, your whatever. We make it faster, sharper, and harder to ignore.
>
> App development · Web development · Systems management · Team consultation · Advertising
>
> ---
>
> **Joel Tempero** — South Island
> **Harrison Stirling** — North Island

The discipline list is set as plain text with no descriptions, no icons, and no links. Team
members have no role, no email, and no photo — name and island only.

Note the surname spelling: **Stirling**, not Sterling.

## Visual language

Continuity with the existing brand, refined rather than replaced.

| Token | Value |
| --- | --- |
| Base | `#08060d` (near-black, violet bias) |
| Violet primary | `#7c3aed` |
| Violet light | `#c4b5fd` |
| Display type | Space Grotesk |
| Micro/mono type | IBM Plex Mono |
| Corners | Square |

The existing `images/logo-icon.png` mark (a starburst and a branching path with an arrow)
is retained beside the wordmark. Always "Sidequest Digital", never shortened.

Navigation is a wordmark top-left and a single `About` link top-right. Nothing else.

## Effects

Two effects, both cheap. The stated constraint is that they must run on a slow machine.

### Particle field

A single `<canvas>` behind the content, filling the viewport.

- Roughly 150 slow-drifting points in violet and white; count scales with viewport area so a
  small window does less work.
- Points repel softly from the cursor within a radius.
- Device pixel ratio capped at 2, so a 4K display does not render 4x the pixels.
- `requestAnimationFrame` loop pauses on `visibilitychange` when the tab is hidden.
- Under `prefers-reduced-motion: reduce`, one static frame is drawn and the loop never starts.

### Type distortion

The headline is split into per-letter spans at runtime. On `mousemove`, letters within a radius
of the cursor receive a small `transform` — translate and scale only, so the work stays on the
GPU and no layout is triggered. Disabled on touch devices and under reduced motion.

### Budget

No dependencies. No framework. Under 15KB of JavaScript across the whole site.

## File structure

```
index.html
about.html
pages/privacy.html          (retained)
pages/terms.html            (retained)
css/site.css                tokens, base type, layout, components
js/particles.js             canvas field
js/kinetic.js               headline letter distortion
js/contact.js               Web3Forms fetch submit + inline expand
images/logo-icon.png        (retained)
images/favicon.png          (retained)
CNAME                       (retained)
```

Each JS module owns one job and exports a single mount function. `particles.js` knows nothing
about the headline; `kinetic.js` knows nothing about the canvas; `contact.js` knows nothing
about either. None of them share state. Each can be deleted independently without breaking the
others, and the page renders correctly with all three absent.

`css/style.css`, `css/layout.css`, `css/components.css`, and `css/subpage.css` are consolidated
into a single `css/site.css`. At this size, one file of roughly 300 lines is easier to hold in
your head than four. `subpage.css` is folded in for the two legal pages.

## Error handling

- **Web3Forms unreachable or returns non-2xx** — inline error message, form stays populated,
  and the direct email and phone below the form remain the escape hatch.
- **JS fails to load entirely** — the page is fully readable and the form still submits as a
  standard POST. The effects are enhancement only; nothing depends on them.
- **Canvas unsupported** — `particles.js` returns early. The background is the base colour.
- **Reduced motion** — both effects degrade to static, as described above.

## Verification

- Homepage fits one viewport at 1280x720 and 1920x1080 with no scrollbar.
- Contact form submits and lands in the inbox; the page does not navigate away.
- Old URLs redirect to `/`.
- Reduced-motion: no animation runs.
- JS disabled: page readable, form submits.
- Lighthouse: performance and accessibility both above 95.
- Throttled CPU (6x slowdown in devtools): particle field holds a usable frame rate.

## Branch strategy

The z-axis work is preserved on `feat/homepage-rethink` and `origin/sidequest-backup`. Neither
is touched.

New work happens on `feat/reset`, branched from `origin/main`, and merges to `main` only when
approved. The live site is untouched until that merge.

## Open items

None blocking. Tagline B is chosen and is a one-line change if it does not survive review.
