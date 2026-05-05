/* ===== Text Scramble & Entrance Animations ===== */
(function () {
    'use strict';

    var GLYPHS = '!@#$%^&*()_+{}|:<>?';
    var REDUCED_MOTION = window.matchMedia &&
        window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // ─── Text Scramble ──────────────────────────────────────────
    // Cycles each character through random glyphs before resolving
    // left-to-right. Uses requestAnimationFrame for smooth updates.
    // Returns a Promise that resolves when the effect finishes.

    function textScramble(element, duration) {
        return new Promise(function (resolve) {
            var original = element.textContent;
            var length = original.length;
            if (length === 0) { resolve(); return; }

            // Reduced motion: show text immediately, no animation
            if (REDUCED_MOTION) {
                element.textContent = original;
                resolve();
                return;
            }

            var glyphsPerChar = 4;                    // cycles before resolve
            var stagger = Math.min(30, Math.max(20, duration / length)); // 20-30ms
            var charDuration = glyphsPerChar * (duration / length * 0.6);

            // State per character: { resolved, startTime, glyphCount }
            var chars = [];
            for (var i = 0; i < length; i++) {
                chars.push({
                    resolved: false,
                    startTime: i * stagger,
                    glyphCount: 0,
                    interval: charDuration / glyphsPerChar
                });
            }

            var startTs = null;

            function randomGlyph() {
                return GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
            }

            function frame(ts) {
                if (startTs === null) startTs = ts;
                var elapsed = ts - startTs;
                var allDone = true;
                var output = '';

                for (var i = 0; i < length; i++) {
                    var ch = chars[i];

                    // Preserve whitespace as-is
                    if (original[i] === ' ') {
                        output += ' ';
                        continue;
                    }

                    if (ch.resolved) {
                        output += original[i];
                        continue;
                    }

                    var charElapsed = elapsed - ch.startTime;

                    if (charElapsed < 0) {
                        // Not started yet — show glyph placeholder
                        output += randomGlyph();
                        allDone = false;
                        continue;
                    }

                    var cyclesDone = Math.floor(charElapsed / ch.interval);

                    if (cyclesDone >= glyphsPerChar) {
                        ch.resolved = true;
                        output += original[i];
                    } else {
                        output += randomGlyph();
                        allDone = false;
                    }
                }

                element.textContent = output;

                if (allDone) {
                    element.textContent = original; // ensure clean final state
                    resolve();
                } else {
                    requestAnimationFrame(frame);
                }
            }

            requestAnimationFrame(frame);
        });
    }

    // ─── Panel Entrance Timelines ────────────────────────────────
    // Each returns a paused GSAP timeline. Elements animate from
    // their CSS initial states defined in animations.css.
    // When prefers-reduced-motion is active, all entrances use
    // near-instant opacity-only transitions (0.01s, no transforms).

    function heroEntrance() {
        var tl = gsap.timeline({ paused: true });

        var lines = document.querySelectorAll('.hero-line');
        var subtitle = document.querySelector('.hero-subtitle');
        var scrollCue = document.querySelector('.hero-scroll-cue');

        if (REDUCED_MOTION) {
            // Instant reveal, no movement
            tl.set(lines, { opacity: 1, y: 0 });
            tl.set(subtitle, { opacity: 1, y: 0 });
            if (scrollCue) tl.set(scrollCue, { opacity: 1 });
            return tl;
        }

        // Scramble hero lines sequentially then reveal
        tl.to(lines, {
            opacity: 1,
            y: 0,
            duration: 0.01,
            stagger: 0
        });

        // Text scramble via onStart callbacks
        tl.add(function () {
            if (lines[0]) {
                textScramble(lines[0], 700);
            }
        }, 0.05);

        tl.add(function () {
            if (lines[1]) {
                textScramble(lines[1], 800);
            }
        }, 0.7);

        // Fade up subtitle after scramble
        tl.to(subtitle, {
            opacity: 1,
            y: 0,
            duration: 0.6,
            ease: 'power3.out'
        }, 1.0);

        // Fade + bounce scroll cue last
        tl.to(scrollCue, {
            opacity: 1,
            duration: 0.5,
            ease: 'power2.out'
        }, 1.3);

        // Scroll cue fades out on first scroll
        window.addEventListener('scroll', function () {
            gsap.to(scrollCue, { opacity: 0, duration: 0.3 });
        }, { once: true });

        return tl;
    }

    // Helper: reduced-motion entrance — instant opacity reveal for all elements
    function instantEntrance(panel, selectors) {
        var tl = gsap.timeline({ paused: true });
        if (!panel) return tl;

        selectors.forEach(function (sel) {
            var els = panel.querySelectorAll(sel);
            if (els.length) {
                tl.set(els, { opacity: 1, x: 0, y: 0, scale: 1, clearProps: 'transform' });
            }
        });

        return tl;
    }

    function chillAirEntrance() {
        var panel = document.querySelector('#panel-chill-air');
        if (REDUCED_MOTION) {
            return instantEntrance(panel, ['.project-visual', '.panel-title', '.label', '.panel-desc', '.project-tags', '.btn-link']);
        }

        var tl = gsap.timeline({ paused: true });
        if (!panel) return tl;

        var visual = panel.querySelector('.project-visual');
        var title = panel.querySelector('.panel-title');
        var textEls = panel.querySelectorAll('.label, .panel-desc, .project-tags, .btn-link');

        // Image slides from right
        tl.from(visual, {
            x: 60,
            opacity: 0,
            duration: 0.8,
            ease: 'power3.out'
        }, 0);

        // Title scramble
        tl.from(title, {
            opacity: 0,
            y: 40,
            duration: 0.4,
            ease: 'power3.out'
        }, 0.1);
        tl.add(function () {
            if (title) textScramble(title, 700);
        }, 0.15);

        // Text staggers up
        tl.from(textEls, {
            y: 40,
            opacity: 0,
            duration: 0.6,
            stagger: 0.1,
            ease: 'power3.out'
        }, 0.2);

        return tl;
    }

    function storybookEntrance() {
        var panel = document.querySelector('#panel-storybook');
        if (REDUCED_MOTION) {
            return instantEntrance(panel, ['.project-visual', '.project-info', '.panel-title', '.label', '.panel-desc', '.project-tags', '.btn-link']);
        }

        var tl = gsap.timeline({ paused: true });
        if (!panel) return tl;

        var visual = panel.querySelector('.project-visual');
        var title = panel.querySelector('.panel-title');
        var textEls = panel.querySelectorAll('.label, .panel-desc, .project-tags, .btn-link');

        // Image scale up with fade
        tl.from(visual, {
            scale: 0.95,
            opacity: 0,
            duration: 0.9,
            ease: 'power2.out'
        }, 0);

        // Title drifts from left
        tl.from(title, {
            x: -40,
            opacity: 0,
            duration: 0.5,
            ease: 'power3.out'
        }, 0.1);
        tl.add(function () {
            if (title) textScramble(title, 800);
        }, 0.15);

        // Text drifts from left with slower stagger
        tl.from(textEls, {
            x: -40,
            opacity: 0,
            duration: 0.6,
            stagger: 0.15,
            ease: 'power3.out'
        }, 0.2);

        return tl;
    }

    function technicolourEntrance() {
        var panel = document.querySelector('#panel-technicolour');
        if (REDUCED_MOTION) {
            return instantEntrance(panel, ['.technicolour-info', '.technicolour-visual', '.technicolour-meta', '.panel-title', '.label', '.panel-desc', '.project-tags', '.btn-link']);
        }

        var tl = gsap.timeline({ paused: true });
        if (!panel) return tl;

        var visual = panel.querySelector('.project-visual');
        var title = panel.querySelector('.panel-title');
        var textEls = panel.querySelectorAll('.label, .panel-desc, .project-tags, .btn-link');

        // Title crashes from above
        tl.from(title, {
            y: -60,
            opacity: 0,
            duration: 0.6,
            ease: 'power3.out'
        }, 0);
        tl.add(function () {
            if (title) textScramble(title, 600);
        }, 0.05);

        // Image slides up from below (converging with title)
        tl.from(visual, {
            y: 60,
            opacity: 0,
            duration: 0.8,
            ease: 'power3.out'
        }, 0);

        // Supporting text
        tl.from(textEls, {
            y: 30,
            opacity: 0,
            duration: 0.5,
            stagger: 0.1,
            ease: 'power3.out'
        }, 0.3);

        return tl;
    }

    function livingHopeEntrance() {
        var panel = document.querySelector('#panel-living-hope');
        if (REDUCED_MOTION) {
            return instantEntrance(panel, ['.project-visual', '.project-info', '.panel-title', '.label', '.panel-desc', '.project-tags', '.btn-link']);
        }

        var tl = gsap.timeline({ paused: true });
        if (!panel) return tl;

        var visual = panel.querySelector('.project-visual');
        var title = panel.querySelector('.panel-title');
        var textEls = panel.querySelectorAll('.label, .panel-desc, .project-tags, .btn-link');

        // Image parallax drift (slower, from right)
        tl.from(visual, {
            x: 80,
            opacity: 0,
            duration: 1.2,
            ease: 'power2.out'
        }, 0);

        // Title scramble with fade (no movement)
        tl.from(title, {
            opacity: 0,
            duration: 0.5,
            ease: 'power2.out'
        }, 0.2);
        tl.add(function () {
            if (title) textScramble(title, 700);
        }, 0.25);

        // Text fades in (opacity only, no movement)
        tl.from(textEls, {
            opacity: 0,
            duration: 0.6,
            stagger: 0.1,
            ease: 'power2.out'
        }, 0.3);

        return tl;
    }

    function discoverEntrance() {
        var panel = document.querySelector('#panel-discover');
        if (REDUCED_MOTION) {
            return instantEntrance(panel, ['.discover-thumb', '.discover-center', '.panel-title', '.panel-desc', '.btn-link', '.btn-primary']);
        }

        var tl = gsap.timeline({ paused: true });
        if (!panel) return tl;

        var title = panel.querySelector('.panel-title');
        var thumbs = panel.querySelectorAll('.discover-thumb');
        var centerText = panel.querySelectorAll('.panel-desc, .btn-link, .btn-primary');

        // Thumbnails drift from various directions
        thumbs.forEach(function (thumb, i) {
            var xOffset = (Math.random() - 0.5) * 120; // -60 to +60
            var yOffset = (Math.random() - 0.5) * 80;  // -40 to +40
            var delay = 0.1 + Math.random() * 0.2;     // 0.1-0.3s

            tl.from(thumb, {
                x: xOffset,
                y: yOffset,
                opacity: 0,
                duration: 0.7,
                ease: 'power3.out'
            }, delay);
        });

        // Title scramble
        tl.from(title, {
            opacity: 0,
            duration: 0.3,
            ease: 'power2.out'
        }, 0.1);
        tl.add(function () {
            if (title) textScramble(title, 600);
        }, 0.15);

        // Centre text fades up last
        tl.from(centerText, {
            y: 20,
            opacity: 0,
            duration: 0.5,
            stagger: 0.1,
            ease: 'power3.out'
        }, 0.6);

        return tl;
    }

    function ctaEntrance() {
        var panel = document.querySelector('#panel-cta');
        if (REDUCED_MOTION) {
            return instantEntrance(panel, ['.panel-title', '.panel-desc', '.btn-primary']);
        }

        var tl = gsap.timeline({ paused: true });
        if (!panel) return tl;

        var title = panel.querySelector('.panel-title');
        var desc = panel.querySelector('.panel-desc');
        var btn = panel.querySelector('.btn-primary');

        // Title and button enter almost simultaneously
        tl.from(title, {
            y: 20,
            opacity: 0,
            duration: 0.5,
            ease: 'power3.out'
        }, 0);
        tl.add(function () {
            if (title) textScramble(title, 400);
        }, 0.05);

        tl.from(desc, {
            y: 15,
            opacity: 0,
            duration: 0.4,
            ease: 'power3.out'
        }, 0.05);

        tl.from(btn, {
            y: 15,
            opacity: 0,
            duration: 0.4,
            ease: 'power3.out'
        }, 0.1);

        return tl;
    }

    // ─── Entrance Initialisation ─────────────────────────────────
    // Called by scroll.js (Task 6) after horizontal scroll is set up.
    // isDesktop: boolean, containerAnimation: GSAP tween or null

    function initEntrances(isDesktop, containerAnimation) {
        gsap.registerPlugin(ScrollTrigger);

        // Hero always plays immediately (not scroll-triggered)
        var heroTl = heroEntrance();
        if (heroTl) {
            gsap.delayedCall(0.3, function () { heroTl.play(); });
        }

        // Panel entrance map: selector -> timeline factory
        var panelEntrances = [
            { selector: '#panel-chill-air', factory: chillAirEntrance },
            { selector: '#panel-storybook', factory: storybookEntrance },
            { selector: '#panel-technicolour', factory: technicolourEntrance },
            { selector: '#panel-living-hope', factory: livingHopeEntrance },
            { selector: '#panel-discover', factory: discoverEntrance },
            { selector: '#panel-cta', factory: ctaEntrance }
        ];

        if (isDesktop && containerAnimation) {
            // Desktop: ScrollTrigger with containerAnimation for horizontal scroll
            panelEntrances.forEach(function (entry) {
                var panel = document.querySelector(entry.selector);
                if (!panel) return;

                var tl = entry.factory();

                ScrollTrigger.create({
                    trigger: panel,
                    containerAnimation: containerAnimation,
                    start: 'left 70%',   // ~30% into viewport
                    once: true,
                    onEnter: function () { tl.play(); }
                });
            });
        } else {
            // Mobile: vertical scroll triggers with simpler entrances
            panelEntrances.forEach(function (entry) {
                var panel = document.querySelector(entry.selector);
                if (!panel) return;

                var tl = entry.factory();

                ScrollTrigger.create({
                    trigger: panel,
                    start: 'top 75%',
                    once: true,
                    onEnter: function () { tl.play(); }
                });
            });
        }

        // Also scramble any element with data-scramble attribute
        document.querySelectorAll('[data-scramble]').forEach(function (el) {
            var dur = parseInt(el.getAttribute('data-scramble'), 10) || 700;
            var scrambleTriggerOpts = {
                trigger: el,
                once: true,
                onEnter: function () { textScramble(el, dur); }
            };

            if (isDesktop && containerAnimation) {
                scrambleTriggerOpts.containerAnimation = containerAnimation;
                scrambleTriggerOpts.start = 'left 70%';
            } else {
                scrambleTriggerOpts.start = 'top 75%';
            }

            ScrollTrigger.create(scrambleTriggerOpts);
        });
    }

    // ─── Expose Globals ──────────────────────────────────────────
    window.textScramble = textScramble;
    window.initEntrances = initEntrances;

    // ─── Fallback Init ───────────────────────────────────────────
    // If scroll.js doesn't call initEntrances (e.g. old scroll.js
    // hasn't been updated yet), auto-init after DOM ready.
    // scroll.js (Task 6) will set window.__entrancesInitialised
    // before calling initEntrances to prevent double-init.

    function fallbackInit() {
        // Give scroll.js a tick to call initEntrances first
        setTimeout(function () {
            if (!window.__entrancesInitialised) {
                var isDesktop = window.matchMedia('(min-width: 769px)').matches;
                initEntrances(isDesktop, null);
            }
        }, 100);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', fallbackInit);
    } else {
        fallbackInit();
    }

})();
