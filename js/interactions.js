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

            // Inject shine overlay
            var shine = document.createElement('div');
            shine.className = 'tilt-shine';
            shine.style.cssText =
                'position:absolute;inset:0;' +
                'background:linear-gradient(135deg,rgba(255,255,255,0.25) 0%,transparent 60%);' +
                'pointer-events:none;opacity:0;transition:opacity 0.3s;';
            el.appendChild(shine);

            var maxDeg = el.getAttribute('data-tilt') === 'light' ? 4 : 8;

            items.push({
                el: el,
                shine: shine,
                maxDeg: maxDeg,
                currentRotX: 0,
                currentRotY: 0,
                targetRotX: 0,
                targetRotY: 0,
                active: false,
                leaveTween: null
            });
        }

        // Single RAF loop for all tilt items
        var running = true;
        var rafId = null;

        function tick() {
            if (!running) return;

            for (var i = 0; i < items.length; i++) {
                var item = items[i];

                if (item.active) {
                    item.currentRotX = lerp(item.currentRotX, item.targetRotX, 0.1);
                    item.currentRotY = lerp(item.currentRotY, item.targetRotY, 0.1);

                    item.el.style.transform =
                        'perspective(800px) rotateX(' + item.currentRotX.toFixed(2) +
                        'deg) rotateY(' + item.currentRotY.toFixed(2) + 'deg)';

                    // Shift shine gradient angle based on tilt
                    var angle = 135 + item.currentRotY * 3 - item.currentRotX * 3;
                    item.shine.style.background =
                        'linear-gradient(' + angle.toFixed(0) +
                        'deg,rgba(255,255,255,0.25) 0%,transparent 60%)';
                    item.shine.style.opacity = '0.15';
                }
            }

            rafId = requestAnimationFrame(tick);
        }

        rafId = requestAnimationFrame(tick);

        return {
            items: items,
            stop: function () {
                running = false;
                if (rafId) cancelAnimationFrame(rafId);
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
                    var rect = item.el.getBoundingClientRect();

                    if (mx >= rect.left && mx <= rect.right &&
                        my >= rect.top && my <= rect.bottom) {
                        // Inside this element
                        if (item.leaveTween) {
                            item.leaveTween.kill();
                            item.leaveTween = null;
                        }
                        item.active = true;

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

                        (function (itm) {
                            itm.leaveTween = gsap.to(itm, {
                                currentRotX: 0,
                                currentRotY: 0,
                                duration: 0.4,
                                ease: 'power2.out',
                                onUpdate: function () {
                                    itm.el.style.transform =
                                        'perspective(800px) rotateX(' +
                                        itm.currentRotX.toFixed(2) + 'deg) rotateY(' +
                                        itm.currentRotY.toFixed(2) + 'deg)';
                                },
                                onComplete: function () {
                                    itm.el.style.transform =
                                        'perspective(800px) rotateX(0deg) rotateY(0deg)';
                                    itm.leaveTween = null;
                                }
                            });
                        })(item);
                    }
                }
            }

            // 4. Magnetic proximity
            if (magneticState) {
                for (var j = 0; j < magneticState.items.length; j++) {
                    var mItem = magneticState.items[j];
                    var mRect = mItem.el.getBoundingClientRect();
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

                        mItem.el.style.transform =
                            'translate(' + translateX.toFixed(1) + 'px, ' +
                            translateY.toFixed(1) + 'px)';
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
