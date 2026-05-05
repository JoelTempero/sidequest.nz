/* ============================================================
   SIDEQUEST.NZ — Canvas Particle System
   Dot network with density curve, colour shift, and cursor interaction.
   Renders behind all content across the full horizontal scroll width.
   ============================================================ */

(function () {
    'use strict';

    // ── Configuration ──────────────────────────────────────────

    var CONFIG = {
        particleCountMin: 80,
        particleCountMax: 150,
        proximityThreshold: 130,
        colours: ['#6d28d9', '#f97316', '#ffffff'],
        maxDotSize: 6,
        minDotSize: 2,
        minOpacity: 0.1,
        maxOpacity: 0.5,
        minVelocity: 0.1,
        maxVelocity: 0.3,
        cursorRadius: 200,
        cursorOpacityTarget: 0.7,
        cursorLerpFactor: 0.02,
        lineOpacityMin: 0.03,
        lineOpacityMax: 0.08,
        frameInterval: 1000 / 30, // ~33.33ms
        panelCount: 7,
        resizeDebounce: 250
    };

    // ── Helpers ─────────────────────────────────────────────────

    function rand(min, max) {
        return Math.random() * (max - min) + min;
    }

    function randInt(min, max) {
        return Math.floor(rand(min, max + 1));
    }

    function lerp(a, b, t) {
        return a + (b - a) * t;
    }

    function hexToRgb(hex) {
        var r = parseInt(hex.slice(1, 3), 16);
        var g = parseInt(hex.slice(3, 5), 16);
        var b = parseInt(hex.slice(5, 7), 16);
        return { r: r, g: g, b: b };
    }

    // Pre-compute RGB values for colours
    var COLOUR_RGB = CONFIG.colours.map(hexToRgb);

    // ── ParticleCanvas Class ────────────────────────────────────

    function ParticleCanvas(canvasElement) {
        this.canvas = canvasElement;
        this.ctx = canvasElement.getContext('2d');
        this.dots = [];
        this.scrollProgress = 0;
        this.cursorActive = false;
        this.cursorX = 0;
        this.cursorY = 0;
        this.lastFrameTime = 0;
        this.running = false;
        this.rafId = null;
        this.viewportWidth = 0;
        this.viewportHeight = 0;
        this.totalScrollWidth = 0;
    }

    // ── init ────────────────────────────────────────────────────

    ParticleCanvas.prototype.init = function () {
        this.sizeCanvas();
        this.generateDots();
    };

    ParticleCanvas.prototype.sizeCanvas = function () {
        this.viewportWidth = window.innerWidth;
        this.viewportHeight = window.innerHeight;
        this.canvas.width = this.viewportWidth;
        this.canvas.height = this.viewportHeight;
        // Total conceptual width: panelCount panels worth of viewport widths
        this.totalScrollWidth = this.viewportWidth * CONFIG.panelCount;
    };

    ParticleCanvas.prototype.generateDots = function () {
        var count = randInt(CONFIG.particleCountMin, CONFIG.particleCountMax);
        this.dots = [];

        // Divide scroll width into zones (one per panel)
        var zoneCount = CONFIG.panelCount;
        var zoneWidth = this.totalScrollWidth / zoneCount;

        // Density curve: hero (zone 0) gets fewest dots, CTA (last zone) gets most.
        // Weight increases linearly: zone 0 = 1, zone 1 = 2, ..., zone N = N+1
        var weights = [];
        var totalWeight = 0;
        for (var wi = 0; wi < zoneCount; wi++) {
            var w = wi + 1;
            weights.push(w);
            totalWeight += w;
        }

        // Distribute dot count proportionally to weights
        var dotsPerZone = [];
        var assigned = 0;
        for (var di = 0; di < zoneCount; di++) {
            if (di === zoneCount - 1) {
                // Last zone gets remainder to ensure exact total
                dotsPerZone.push(count - assigned);
            } else {
                var n = Math.round(count * weights[di] / totalWeight);
                dotsPerZone.push(n);
                assigned += n;
            }
        }

        // Generate dots per zone
        for (var z = 0; z < zoneCount; z++) {
            var zoneStart = z * zoneWidth;
            var zoneEnd = zoneStart + zoneWidth;
            // Colour shift: early zones lean purple (index 0), later zones add orange (index 1)
            // White (index 2) is always available but less common
            var purpleWeight = 1 - (z / (zoneCount - 1)) * 0.6; // 1.0 -> 0.4
            var orangeWeight = (z / (zoneCount - 1)) * 0.8;      // 0.0 -> 0.8
            var whiteWeight = 0.2;                                 // constant

            for (var i = 0; i < dotsPerZone[z]; i++) {
                // Pick colour based on weighted random
                var rgb = COLOUR_RGB[this.pickColour(purpleWeight, orangeWeight, whiteWeight)];
                var baseOpacity = rand(CONFIG.minOpacity, CONFIG.maxOpacity);

                var dot = {
                    x: rand(zoneStart, zoneEnd),
                    y: rand(0, this.viewportHeight),
                    size: rand(CONFIG.minDotSize, CONFIG.maxDotSize),
                    r: rgb.r,
                    g: rgb.g,
                    b: rgb.b,
                    baseOpacity: baseOpacity,
                    opacity: baseOpacity,
                    dx: rand(CONFIG.minVelocity, CONFIG.maxVelocity) * (Math.random() < 0.5 ? 1 : -1),
                    dy: rand(CONFIG.minVelocity, CONFIG.maxVelocity) * (Math.random() < 0.5 ? 1 : -1)
                };
                this.dots.push(dot);
            }
        }
    };

    ParticleCanvas.prototype.pickColour = function (purpleW, orangeW, whiteW) {
        var total = purpleW + orangeW + whiteW;
        var r = Math.random() * total;
        if (r < purpleW) return 0;      // purple
        if (r < purpleW + orangeW) return 1; // orange
        return 2;                         // white
    };

    // ── update ──────────────────────────────────────────────────

    ParticleCanvas.prototype.update = function () {
        var scrollOffset = this.scrollProgress * (this.totalScrollWidth - this.viewportWidth);

        // Cursor position in scroll-space
        var cursorScrollX = this.cursorX + scrollOffset;
        var cursorY = this.cursorY;

        for (var i = 0; i < this.dots.length; i++) {
            var dot = this.dots[i];

            // Cursor interaction (attract + glow, applied before drift so
            // ambient movement can still carry dots away from the cursor)
            if (this.cursorActive) {
                var cdx = cursorScrollX - dot.x;
                var cdy = cursorY - dot.y;
                var dist = Math.sqrt(cdx * cdx + cdy * cdy);

                if (dist < CONFIG.cursorRadius) {
                    // Opacity boost toward cursor target
                    dot.opacity = lerp(dot.opacity, CONFIG.cursorOpacityTarget, 0.05);
                    // Drift gently toward cursor
                    dot.x = lerp(dot.x, cursorScrollX, CONFIG.cursorLerpFactor);
                    dot.y = lerp(dot.y, cursorY, CONFIG.cursorLerpFactor);
                } else {
                    // Decay back to base opacity
                    dot.opacity = lerp(dot.opacity, dot.baseOpacity, 0.03);
                }
            } else {
                // No cursor — decay to base
                dot.opacity = lerp(dot.opacity, dot.baseOpacity, 0.03);
            }

            // Ambient drift (applied after cursor lerp so dots are never
            // permanently trapped — drift continuously pulls them away)
            dot.x += dot.dx;
            dot.y += dot.dy;

            // Bounce at boundaries (vertical: viewport height, horizontal: total scroll width)
            if (dot.x < 0) {
                dot.x = 0;
                dot.dx = Math.abs(dot.dx);
            } else if (dot.x > this.totalScrollWidth) {
                dot.x = this.totalScrollWidth;
                dot.dx = -Math.abs(dot.dx);
            }

            if (dot.y < 0) {
                dot.y = 0;
                dot.dy = Math.abs(dot.dy);
            } else if (dot.y > this.viewportHeight) {
                dot.y = this.viewportHeight;
                dot.dy = -Math.abs(dot.dy);
            }
        }
    };

    // ── draw ────────────────────────────────────────────────────

    ParticleCanvas.prototype.draw = function () {
        var ctx = this.ctx;
        var w = this.viewportWidth;
        var h = this.viewportHeight;

        ctx.clearRect(0, 0, w, h);

        var scrollOffset = this.scrollProgress * (this.totalScrollWidth - this.viewportWidth);

        // Collect visible dots (within viewport + some margin for connecting lines)
        var margin = CONFIG.proximityThreshold;
        var visible = [];
        for (var i = 0; i < this.dots.length; i++) {
            var dot = this.dots[i];
            var screenX = dot.x - scrollOffset;
            if (screenX > -margin && screenX < w + margin) {
                visible.push({
                    dot: dot,
                    screenX: screenX,
                    screenY: dot.y
                });
            }
        }

        // Draw connecting lines first (behind dots)
        ctx.lineWidth = 1;
        for (var i = 0; i < visible.length; i++) {
            for (var j = i + 1; j < visible.length; j++) {
                var a = visible[i];
                var b = visible[j];
                var dx = a.screenX - b.screenX;
                var dy = a.screenY - b.screenY;
                var dist = Math.sqrt(dx * dx + dy * dy);

                if (dist < CONFIG.proximityThreshold) {
                    // Opacity based on distance: closer = more opaque
                    var t = 1 - dist / CONFIG.proximityThreshold;
                    var lineOpacity = CONFIG.lineOpacityMin + t * (CONFIG.lineOpacityMax - CONFIG.lineOpacityMin);
                    ctx.strokeStyle = 'rgba(255,255,255,' + lineOpacity.toFixed(4) + ')';
                    ctx.beginPath();
                    ctx.moveTo(a.screenX, a.screenY);
                    ctx.lineTo(b.screenX, b.screenY);
                    ctx.stroke();
                }
            }
        }

        // Draw dots with glow
        for (var i = 0; i < visible.length; i++) {
            var v = visible[i];
            var dot = v.dot;

            ctx.shadowBlur = dot.size * 3;
            ctx.shadowColor = 'rgba(' + dot.r + ',' + dot.g + ',' + dot.b + ',' + (dot.opacity * 0.6).toFixed(4) + ')';
            ctx.fillStyle = 'rgba(' + dot.r + ',' + dot.g + ',' + dot.b + ',' + dot.opacity.toFixed(4) + ')';

            ctx.beginPath();
            ctx.arc(v.screenX, v.screenY, dot.size, 0, Math.PI * 2);
            ctx.fill();
        }

        // Reset shadow so it doesn't bleed into next frame's lines
        ctx.shadowBlur = 0;
        ctx.shadowColor = 'transparent';
    };

    // ── Render Loop ─────────────────────────────────────────────

    ParticleCanvas.prototype.startLoop = function () {
        if (this.running) return;
        this.running = true;
        this.lastFrameTime = performance.now();

        var self = this;
        function frame(now) {
            if (!self.running) return;
            self.rafId = requestAnimationFrame(frame);

            // Tab visibility check
            if (document.hidden) return;

            // 30fps throttle
            var elapsed = now - self.lastFrameTime;
            if (elapsed < CONFIG.frameInterval) return;
            self.lastFrameTime = now - (elapsed % CONFIG.frameInterval);

            self.update();
            self.draw();
        }

        this.rafId = requestAnimationFrame(frame);
    };

    ParticleCanvas.prototype.stopLoop = function () {
        this.running = false;
        if (this.rafId) {
            cancelAnimationFrame(this.rafId);
            this.rafId = null;
        }
    };

    // ── External API ────────────────────────────────────────────

    ParticleCanvas.prototype.setCursor = function (x, y) {
        this.cursorActive = true;
        // Store in screen space — scroll offset is applied in update()
        this.cursorX = x;
        this.cursorY = y;
    };

    ParticleCanvas.prototype.clearCursor = function () {
        this.cursorActive = false;
    };

    ParticleCanvas.prototype.setScrollProgress = function (progress) {
        this.scrollProgress = Math.max(0, Math.min(1, progress));
    };

    // ── Resize Handler ──────────────────────────────────────────

    ParticleCanvas.prototype.handleResize = function () {
        var oldWidth = this.totalScrollWidth;
        var oldHeight = this.viewportHeight;

        this.sizeCanvas();

        // Re-distribute dots proportionally to new dimensions
        var scaleX = this.totalScrollWidth / oldWidth;
        var scaleY = this.viewportHeight / oldHeight;
        for (var i = 0; i < this.dots.length; i++) {
            this.dots[i].x *= scaleX;
            this.dots[i].y *= scaleY;
        }
    };

    // ── Init Function (exposed globally) ────────────────────────

    function initParticleCanvas(canvasElement) {
        // Bail on mobile or reduced motion
        if (window.innerWidth <= 768) return null;
        if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return null;

        var pc = new ParticleCanvas(canvasElement);
        pc.init();
        pc.startLoop();

        // Debounced resize handler
        var resizeTimer;
        window.addEventListener('resize', function () {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(function () {
                // If viewport shrunk to mobile, stop
                if (window.innerWidth <= 768) {
                    pc.stopLoop();
                    return;
                }
                pc.handleResize();
            }, CONFIG.resizeDebounce);
        });

        return pc;
    }

    // Expose globally
    window.initParticleCanvas = initParticleCanvas;

})();
