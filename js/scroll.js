// GSAP Horizontal Scroll — Desktop Only
// Orchestrates: horizontal scroll, canvas progress, parallax layers,
// gradient blob drift, typography fragment parallax, entrance triggers.

window.initHorizontalScroll = function (canvasInstance) {
    var isDesktop = window.matchMedia('(min-width: 769px)').matches;
    var reducedMotion = window.matchMedia &&
        window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (!isDesktop) {
        // Mobile: no horizontal scroll, but still wire up entrances (vertical mode)
        window.__entrancesInitialised = true;
        if (window.initEntrances) {
            window.initEntrances(false, null);
        }
        return null;
    }

    gsap.registerPlugin(ScrollTrigger);

    var scrollContainer = document.getElementById('horizontal-scroll');
    var panels = document.querySelector('.panels');
    var panelElements = gsap.utils.toArray('.panel');

    if (!scrollContainer || !panels || panelElements.length === 0) return null;

    var totalScroll = panels.scrollWidth - window.innerWidth;

    // ── Step 1: Core horizontal scroll tween ────────────────────
    var scrollHasFired = false;

    var scrollTween = gsap.to(panels, {
        x: -totalScroll,
        ease: 'none',
        scrollTrigger: {
            trigger: scrollContainer,
            pin: true,
            scrub: 1,
            end: function () { return '+=' + totalScroll; },
            invalidateOnRefresh: true,
            onUpdate: function (self) {
                // Pass scroll progress to canvas
                if (canvasInstance && canvasInstance.setScrollProgress) {
                    canvasInstance.setScrollProgress(self.progress);
                }

                // Step 6: Fade out scroll cue on first scroll event
                if (!scrollHasFired) {
                    scrollHasFired = true;
                    var scrollCue = document.querySelector('.hero-scroll-cue');
                    if (scrollCue) {
                        gsap.to(scrollCue, { opacity: 0, duration: 0.3 });
                    }
                }
            }
        }
    });

    // ── Step 2: Parallax for project elements ───────────────────
    // Skip parallax when reduced-motion is preferred — elements stay in natural position
    if (!reducedMotion) {
        // .project-visual moves slightly slower (negative offset = lags behind)
        // .project-info moves slightly faster (positive offset = leads ahead)

        var visuals = gsap.utils.toArray('.panel-project .project-visual');
        var infos = gsap.utils.toArray('.panel-project .project-info');

        visuals.forEach(function (el) {
            gsap.to(el, {
                x: -80,  // moves slower, lags 80px over its panel's scroll span
                ease: 'none',
                scrollTrigger: {
                    trigger: el.closest('.panel'),
                    containerAnimation: scrollTween,
                    start: 'left right',   // enters from right edge
                    end: 'right left',     // exits past left edge
                    scrub: true
                }
            });
        });

        infos.forEach(function (el) {
            gsap.to(el, {
                x: 60,   // moves faster, leads 60px over its panel's scroll span
                ease: 'none',
                scrollTrigger: {
                    trigger: el.closest('.panel'),
                    containerAnimation: scrollTween,
                    start: 'left right',
                    end: 'right left',
                    scrub: true
                }
            });
        });

        // Also handle technicolour's unique layout elements
        var techVisual = document.querySelector('.technicolour-visual');
        if (techVisual) {
            gsap.to(techVisual, {
                x: -60,
                ease: 'none',
                scrollTrigger: {
                    trigger: document.querySelector('#panel-technicolour'),
                    containerAnimation: scrollTween,
                    start: 'left right',
                    end: 'right left',
                    scrub: true
                }
            });
        }

        var techMeta = document.querySelector('.technicolour-meta');
        if (techMeta) {
            gsap.to(techMeta, {
                x: 40,
                ease: 'none',
                scrollTrigger: {
                    trigger: document.querySelector('#panel-technicolour'),
                    containerAnimation: scrollTween,
                    start: 'left right',
                    end: 'right left',
                    scrub: true
                }
            });
        }
    }

    // ── Step 3: Gradient blob scroll-linked drift ───────────────
    var blob1 = document.querySelector('.blob-1');
    var blob2 = document.querySelector('.blob-2');
    var blob3 = document.querySelector('.blob-3');

    if (blob1) {
        gsap.to(blob1, {
            x: 350,
            y: 150,
            opacity: 0.15,
            ease: 'none',
            scrollTrigger: {
                trigger: scrollContainer,
                start: 'top top',
                end: function () { return '+=' + totalScroll; },
                scrub: true
            }
        });
    }

    if (blob2) {
        gsap.to(blob2, {
            x: -300,
            opacity: 0.12,
            ease: 'none',
            scrollTrigger: {
                trigger: scrollContainer,
                start: 'top top',
                end: function () { return '+=' + totalScroll; },
                scrub: true
            }
        });
    }

    if (blob3) {
        gsap.to(blob3, {
            x: 400,
            y: -200,
            opacity: 0.18,
            ease: 'none',
            scrollTrigger: {
                trigger: scrollContainer,
                start: 'top top',
                end: function () { return '+=' + totalScroll; },
                scrub: true
            }
        });
    }

    // ── Step 4: Typography fragment parallax ────────────────────
    // Skip when reduced-motion is preferred (parallax disabled)
    if (!reducedMotion) {
        var fragments = gsap.utils.toArray('.typo-fragment');
        var fragmentRates = [0.35, 0.45, 0.3];  // each drifts at a different rate

        fragments.forEach(function (frag, i) {
            var rate = fragmentRates[i] || 0.4;
            // Fragments move at (rate) fraction of total scroll, so they appear to lag
            var offsetX = totalScroll * rate;

            gsap.to(frag, {
                x: -offsetX,
                ease: 'none',
                scrollTrigger: {
                    trigger: scrollContainer,
                    start: 'top top',
                    end: function () { return '+=' + totalScroll; },
                    scrub: true
                }
            });
        });
    }

    // ── Step 5: Wire up entrance triggers ───────────────────────
    window.__entrancesInitialised = true;
    if (window.initEntrances) {
        window.initEntrances(true, scrollTween);
    }

    return scrollTween;
};

// ── Auto-init & Resize ──────────────────────────────────────────
// The init IIFE in index.html calls initHorizontalScroll with canvasInstance.
// This resize handler re-initialises on viewport change.

var _sqResizeTimeout;
window.addEventListener('resize', function () {
    clearTimeout(_sqResizeTimeout);
    _sqResizeTimeout = setTimeout(function () {
        ScrollTrigger.getAll().forEach(function (t) { t.kill(); });
        // On resize, canvas instance is still alive; re-init scroll with it
        window.initHorizontalScroll(window._sqCanvasInstance || null);
    }, 250);
});
