/* ============================================================
   SIDEQUEST.NZ — Interactions Module
   Cursor glow, image tilt, magnetic buttons — all driven by
   a single delegated mousemove on the .panels container.
   ============================================================ */

(function () {
    'use strict';

    // ── Shared Helpers ─────────────────────────────────────────

    function lerp(a, b, t) {
        return a + (b - a) * t;
    }

    // ── Cursor Glow ────────────────────────────────────────────

    function initCursorGlow() {
        var el = document.querySelector('.cursor-glow');
        if (!el) return null;

        el.style.willChange = 'transform';

        var state = {
            el: el,
            currentX: 0,
            currentY: 0,
            targetX: 0,
            targetY: 0,
            running: false,
            rafId: null
        };

        function tick() {
            if (!state.running) return;

            state.currentX = lerp(state.currentX, state.targetX, 0.1);
            state.currentY = lerp(state.currentY, state.targetY, 0.1);

            state.el.style.transform =
                'translate3d(' + state.currentX + 'px, ' + state.currentY + 'px, 0)';

            state.rafId = requestAnimationFrame(tick);
        }

        // Start the lerp loop
        state.running = true;
        state.rafId = requestAnimationFrame(tick);

        return state;
    }

    // ── Image Tilt ─────────────────────────────────────────────

    function initImageTilt() {
        var tiltEls = document.querySelectorAll('[data-tilt]');
        if (!tiltEls.length) return null;

        var items = [];

        for (var i = 0; i < tiltEls.length; i++) {
            var el = tiltEls[i];

            // Ensure position context for the shine overlay
            var pos = window.getComputedStyle(el).position;
            if (pos === 'static') {
                el.style.position = 'relative';
            }
            el.style.overflow = 'hidden';
            el.style.willChange = 'transform';

            // Inject shine overlay — no CSS transition, opacity driven by JS (m2)
            var shine = document.createElement('div');
            shine.className = 'tilt-shine';
            shine.style.cssText =
                'position:absolute;inset:0;' +
                'background:linear-gradient(135deg,rgba(255,255,255,0.25) 0%,transparent 60%);' +
                'pointer-events:none;opacity:0;';
            el.appendChild(shine);

            var maxDeg = el.getAttribute('data-tilt') === 'light' ? 4 : 8;

            items.push({
                el: el,
                shine: shine,
                maxDeg: maxDeg,
                cachedRect: el.getBoundingClientRect(), // C1: cache rect
                currentRotX: 0,
                currentRotY: 0,
                targetRotX: 0,
                targetRotY: 0,
                active: false,
                leaveTween: null
            });
        }

        // I2: conditional RAF — only runs when at least one item is active
        var activeCount = 0;
        var rafId = null;

        function tick() {
            if (activeCount <= 0) {
                rafId = null;
                return;
            }

            for (var i = 0; i < items.length; i++) {
                var item = items[i];

                if (item.active) {
                    item.currentRotX = lerp(item.currentRotX, item.targetRotX, 0.1);
                    item.currentRotY = lerp(item.currentRotY, item.targetRotY, 0.1);

                    // m1: avoid toFixed string allocation — use Math.round
                    var rotX = Math.round(item.currentRotX * 100) / 100;
                    var rotY = Math.round(item.currentRotY * 100) / 100;

                    item.el.style.transform =
                        'perspective(800px) rotateX(' + rotX +
                        'deg) rotateY(' + rotY + 'deg)';

                    // Shift shine gradient angle based on tilt
                    var angle = 135 + item.currentRotY * 3 - item.currentRotX * 3;
                    item.shine.style.background =
                        'linear-gradient(' + Math.round(angle) +
                        'deg,rgba(255,255,255,0.25) 0%,transparent 60%)';
                    item.shine.style.opacity = '0.15';
                }
            }

            rafId = requestAnimationFrame(tick);
        }

        function startLoop() {
            if (!rafId) {
                rafId = requestAnimationFrame(tick);
            }
        }

        return {
            items: items,
            activeCount: activeCount,
            incrementActive: function () { activeCount++; startLoop(); },
            decrementActive: function () { activeCount = Math.max(0, activeCount - 1); },
            stop: function () {
                activeCount = 0;
                if (rafId) { cancelAnimationFrame(rafId); rafId = null; }
            }
        };
    }

    // ── Magnetic Buttons ───────────────────────────────────────

    function initMagneticButtons() {
        var magneticEls = document.querySelectorAll('[data-magnetic]');
        if (!magneticEls.length) return null;

        var items = [];

        for (var i = 0; i < magneticEls.length; i++) {
            var el = magneticEls[i];
            el.style.willChange = 'transform';

            items.push({
                el: el,
                cachedRect: el.getBoundingClientRect(), // C1: cache rect
                attracted: false,
                tween: null
            });
        }

        // Hover class toggle
        function onEnter(e) {
            e.currentTarget.classList.add('magnetic-hover');
        }

        function onLeave(e) {
            e.currentTarget.classList.remove('magnetic-hover');
        }

        for (var j = 0; j < magneticEls.length; j++) {
            magneticEls[j].addEventListener('mouseenter', onEnter);
            magneticEls[j].addEventListener('mouseleave', onLeave);
        }

        return { items: items };
    }

    // ── Orchestrator ───────────────────────────────────────────

    function initInteractions(canvasInstance) {
        // Gate: desktop only, no reduced motion
        if (window.innerWidth <= 768) return;
        if (window.matchMedia &&
            window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

        var glowState = initCursorGlow();
        var tiltState = initImageTilt();
        var magneticState = initMagneticButtons();

        var panelsContainer = document.querySelector('.panels');
        if (!panelsContainer) return;

        // C1: debounced resize listener to refresh cached rects
        var resizeTimer = null;
        function refreshCachedRects() {
            if (tiltState) {
                for (var i = 0; i < tiltState.items.length; i++) {
                    tiltState.items[i].cachedRect = tiltState.items[i].el.getBoundingClientRect();
                }
            }
            if (magneticState) {
                for (var j = 0; j < magneticState.items.length; j++) {
                    magneticState.items[j].cachedRect = magneticState.items[j].el.getBoundingClientRect();
                }
            }
        }
        window.addEventListener('resize', function () {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(refreshCachedRects, 200);
        });

        // Also refresh on scroll (horizontal scroll changes element positions)
        var scrollTimer = null;
        panelsContainer.addEventListener('scroll', function () {
            clearTimeout(scrollTimer);
            scrollTimer = setTimeout(refreshCachedRects, 100);
        });
        // GSAP ScrollTrigger may scroll the wrapper, so listen on window too
        window.addEventListener('scroll', function () {
            clearTimeout(scrollTimer);
            scrollTimer = setTimeout(refreshCachedRects, 100);
        });

        // ── Single delegated mousemove ─────────────────────────

        panelsContainer.addEventListener('mousemove', function (e) {
            var mx = e.clientX;
            var my = e.clientY;

            // 1. Cursor glow position
            if (glowState) {
                glowState.targetX = mx;
                glowState.targetY = my;
            }

            // 2. Canvas cursor tracking
            if (canvasInstance && canvasInstance.setCursor) {
                canvasInstance.setCursor(mx, my);
            }

            // 3. Tilt calculations — check if cursor is over any tilt element
            if (tiltState) {
                for (var i = 0; i < tiltState.items.length; i++) {
                    var item = tiltState.items[i];
                    var rect = item.cachedRect; // C1: use cached rect

                    if (mx >= rect.left && mx <= rect.right &&
                        my >= rect.top && my <= rect.bottom) {
                        // Inside this element
                        if (item.leaveTween) {
                            item.leaveTween.kill();
                            item.leaveTween = null;
                        }
                        if (!item.active) {
                            item.active = true;
                            tiltState.incrementActive(); // I2: start RAF if needed
                        }

                        var centreX = rect.left + rect.width / 2;
                        var centreY = rect.top + rect.height / 2;
                        var offsetX = (mx - centreX) / (rect.width / 2);  // -1 to 1
                        var offsetY = (my - centreY) / (rect.height / 2); // -1 to 1

                        // rotateY follows horizontal offset, rotateX follows inverted vertical
                        item.targetRotY = offsetX * item.maxDeg;
                        item.targetRotX = -offsetY * item.maxDeg;
                    } else if (item.active) {
                        // Just left this element — tween back to neutral
                        item.active = false;
                        item.shine.style.opacity = '0';

                        (function (itm, ts) {
                            itm.leaveTween = gsap.to(itm, {
                                currentRotX: 0,
                                currentRotY: 0,
                                duration: 0.4,
                                ease: 'power2.out',
                                onUpdate: function () {
                                    var rx = Math.round(itm.currentRotX * 100) / 100;
                                    var ry = Math.round(itm.currentRotY * 100) / 100;
                                    itm.el.style.transform =
                                        'perspective(800px) rotateX(' +
                                        rx + 'deg) rotateY(' +
                                        ry + 'deg)';
                                },
                                onComplete: function () {
                                    itm.el.style.transform =
                                        'perspective(800px) rotateX(0deg) rotateY(0deg)';
                                    itm.leaveTween = null;
                                    ts.decrementActive(); // I2: stop RAF when last item done
                                }
                            });
                        })(item, tiltState);
                    }
                }
            }

            // 4. Magnetic proximity
            if (magneticState) {
                for (var j = 0; j < magneticState.items.length; j++) {
                    var mItem = magneticState.items[j];
                    var mRect = mItem.cachedRect; // C1: use cached rect
                    var mCentreX = mRect.left + mRect.width / 2;
                    var mCentreY = mRect.top + mRect.height / 2;
                    var dx = mx - mCentreX;
                    var dy = my - mCentreY;
                    var dist = Math.sqrt(dx * dx + dy * dy);

                    if (dist < 80) {
                        // Within magnetic range — pull toward cursor
                        var pull = (80 - dist) / 80; // 0 at edge, 1 at centre
                        var translateX = (dx / 80) * 12 * pull;
                        var translateY = (dy / 80) * 12 * pull;

                        // Kill any existing spring-back tween
                        if (mItem.tween) {
                            mItem.tween.kill();
                            mItem.tween = null;
                        }

                        // I1: use gsap.set so GSAP owns the transform throughout
                        gsap.set(mItem.el, { x: translateX, y: translateY });
                        mItem.attracted = true;
                    } else if (mItem.attracted) {
                        // Outside range — spring back
                        mItem.attracted = false;

                        (function (mi) {
                            mi.tween = gsap.to(mi.el, {
                                x: 0,
                                y: 0,
                                duration: 0.4,
                                ease: 'elastic.out(1, 0.5)',
                                clearProps: 'transform',
                                onComplete: function () {
                                    mi.tween = null;
                                }
                            });
                        })(mItem);
                    }
                }
            }
        });

        // Clear canvas cursor when mouse leaves the panels container
        panelsContainer.addEventListener('mouseleave', function () {
            if (canvasInstance && canvasInstance.clearCursor) {
                canvasInstance.clearCursor();
            }
        });
    }

    // Expose globally
    window.initInteractions = initInteractions;

})();
