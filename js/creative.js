/* ============================================
   SIDEQUEST DIGITAL - Creative Effects
   Wild, artistic, memorable interactions
   ============================================ */

/* --------------------------------------------
   WebGL Particle System - Fluid/Organic Feel
   -------------------------------------------- */
class ParticleField {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.particles = [];
        this.mouse = { x: null, y: null, radius: 150 };
        this.hue = 270; // Start with purple
        
        this.resize();
        this.init();
        this.animate();
        
        window.addEventListener('resize', () => this.resize());
        window.addEventListener('mousemove', (e) => {
            this.mouse.x = e.x;
            this.mouse.y = e.y;
        });
        window.addEventListener('mouseout', () => {
            this.mouse.x = null;
            this.mouse.y = null;
        });
    }
    
    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }
    
    init() {
        this.particles = [];
        const numberOfParticles = Math.floor((this.canvas.width * this.canvas.height) / 12000);
        
        for (let i = 0; i < numberOfParticles; i++) {
            const size = Math.random() * 3 + 1;
            const x = Math.random() * this.canvas.width;
            const y = Math.random() * this.canvas.height;
            const speedX = (Math.random() - 0.5) * 0.5;
            const speedY = (Math.random() - 0.5) * 0.5;
            
            this.particles.push({
                x, y, size, speedX, speedY,
                baseX: x,
                baseY: y,
                density: Math.random() * 30 + 1
            });
        }
    }
    
    animate() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Slowly shift hue for organic feel
        this.hue += 0.1;
        if (this.hue > 360) this.hue = 0;
        
        this.particles.forEach((p, i) => {
            // Mouse interaction - push particles away
            if (this.mouse.x && this.mouse.y) {
                const dx = this.mouse.x - p.x;
                const dy = this.mouse.y - p.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                const forceDirectionX = dx / distance;
                const forceDirectionY = dy / distance;
                const maxDistance = this.mouse.radius;
                const force = (maxDistance - distance) / maxDistance;
                
                if (distance < this.mouse.radius) {
                    p.x -= forceDirectionX * force * p.density;
                    p.y -= forceDirectionY * force * p.density;
                }
            }
            
            // Return to base position (elastic)
            const dx = p.baseX - p.x;
            const dy = p.baseY - p.y;
            p.x += dx * 0.02;
            p.y += dy * 0.02;
            
            // Gentle drift
            p.x += p.speedX;
            p.y += p.speedY;
            p.baseX += p.speedX * 0.1;
            p.baseY += p.speedY * 0.1;
            
            // Wrap around edges
            if (p.baseX < 0) p.baseX = this.canvas.width;
            if (p.baseX > this.canvas.width) p.baseX = 0;
            if (p.baseY < 0) p.baseY = this.canvas.height;
            if (p.baseY > this.canvas.height) p.baseY = 0;
            
            // Draw particle
            const hueOffset = (i * 0.5) % 60;
            this.ctx.fillStyle = `hsla(${this.hue + hueOffset}, 80%, 60%, ${0.3 + (p.size / 4) * 0.4})`;
            this.ctx.beginPath();
            this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            this.ctx.fill();
        });
        
        // Draw connections
        this.connectParticles();
        
        requestAnimationFrame(() => this.animate());
    }
    
    connectParticles() {
        for (let a = 0; a < this.particles.length; a++) {
            for (let b = a + 1; b < this.particles.length; b++) {
                const dx = this.particles[a].x - this.particles[b].x;
                const dy = this.particles[a].y - this.particles[b].y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < 100) {
                    const opacity = 0.15 * (1 - distance / 100);
                    this.ctx.strokeStyle = `rgba(139, 92, 246, ${opacity})`;
                    this.ctx.lineWidth = 1;
                    this.ctx.beginPath();
                    this.ctx.moveTo(this.particles[a].x, this.particles[a].y);
                    this.ctx.lineTo(this.particles[b].x, this.particles[b].y);
                    this.ctx.stroke();
                }
            }
        }
    }
}


/* --------------------------------------------
   Magnetic Text Effect
   -------------------------------------------- */
class MagneticText {
    constructor(element) {
        this.element = element;
        this.text = element.textContent;
        this.chars = [];
        this.mouse = { x: 0, y: 0 };
        this.isActive = true;
        
        this.splitText();
        this.addEventListeners();
        this.animate();
    }
    
    splitText() {
        this.element.innerHTML = '';
        this.element.style.display = 'inline-flex';
        this.element.style.flexWrap = 'wrap';
        
        [...this.text].forEach((char, i) => {
            const span = document.createElement('span');
            span.textContent = char === ' ' ? '\u00A0' : char;
            span.style.display = 'inline-block';
            span.style.transition = 'transform 0.1s ease-out';
            span.dataset.index = i;
            this.element.appendChild(span);
            this.chars.push({
                el: span,
                x: 0,
                y: 0,
                targetX: 0,
                targetY: 0
            });
        });
    }
    
    addEventListeners() {
        document.addEventListener('mousemove', (e) => {
            this.mouse.x = e.clientX;
            this.mouse.y = e.clientY;
        });
    }
    
    animate() {
        if (!this.isActive) return;
        
        this.chars.forEach((char) => {
            const rect = char.el.getBoundingClientRect();
            const charCenterX = rect.left + rect.width / 2;
            const charCenterY = rect.top + rect.height / 2;
            
            const deltaX = this.mouse.x - charCenterX;
            const deltaY = this.mouse.y - charCenterY;
            const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
            const maxDistance = 200;
            
            if (distance < maxDistance) {
                const force = (1 - distance / maxDistance) * 20;
                char.targetX = (deltaX / distance) * force;
                char.targetY = (deltaY / distance) * force;
            } else {
                char.targetX = 0;
                char.targetY = 0;
            }
            
            // Smooth interpolation
            char.x += (char.targetX - char.x) * 0.15;
            char.y += (char.targetY - char.y) * 0.15;
            
            char.el.style.transform = `translate(${char.x}px, ${char.y}px)`;
        });
        
        requestAnimationFrame(() => this.animate());
    }
    
    destroy() {
        this.isActive = false;
        this.element.innerHTML = this.text;
    }
}


/* --------------------------------------------
   Text Scramble Effect
   -------------------------------------------- */
class TextScramble {
    constructor(element) {
        this.element = element;
        this.chars = '!<>-_\\/[]{}—=+*^?#________';
        this.frameRequest = null;
    }
    
    async animate(newText) {
        const oldText = this.element.textContent;
        const length = Math.max(oldText.length, newText.length);
        const duration = 1000;
        const startTime = performance.now();
        
        return new Promise((resolve) => {
            const update = () => {
                const elapsed = performance.now() - startTime;
                const progress = elapsed / duration;
                
                let result = '';
                for (let i = 0; i < length; i++) {
                    const charProgress = progress * length - i;
                    
                    if (charProgress > 1) {
                        result += newText[i] || '';
                    } else if (charProgress > 0) {
                        result += this.chars[Math.floor(Math.random() * this.chars.length)];
                    } else {
                        result += oldText[i] || '';
                    }
                }
                
                this.element.textContent = result;
                
                if (progress < 1) {
                    this.frameRequest = requestAnimationFrame(update);
                } else {
                    this.element.textContent = newText;
                    resolve();
                }
            };
            
            update();
        });
    }
}


/* --------------------------------------------
   Cinematic Scroll - Horizontal Section
   -------------------------------------------- */
class HorizontalScroll {
    constructor(container) {
        this.container = container;
        this.sections = container.querySelectorAll('.h-scroll-section');
        this.totalWidth = 0;
        
        this.calculateWidth();
        this.bindEvents();
    }
    
    calculateWidth() {
        this.sections.forEach(section => {
            this.totalWidth += section.offsetWidth;
        });
        this.container.style.width = `${this.totalWidth}px`;
    }
    
    bindEvents() {
        window.addEventListener('scroll', () => this.onScroll());
    }
    
    onScroll() {
        const scrollProgress = window.scrollY / (document.body.scrollHeight - window.innerHeight);
        const translateX = scrollProgress * (this.totalWidth - window.innerWidth);
        this.container.style.transform = `translateX(-${translateX}px)`;
    }
}


/* --------------------------------------------
   Tilt Card Effect
   -------------------------------------------- */
class TiltCard {
    constructor(element) {
        this.element = element;
        this.maxTilt = 10;
        this.perspective = 1000;
        this.scale = 1.02;
        
        this.element.style.transformStyle = 'preserve-3d';
        this.element.style.transition = 'transform 0.1s ease-out';
        
        this.addEventListeners();
    }
    
    addEventListeners() {
        this.element.addEventListener('mouseenter', () => this.onEnter());
        this.element.addEventListener('mousemove', (e) => this.onMove(e));
        this.element.addEventListener('mouseleave', () => this.onLeave());
    }
    
    onEnter() {
        this.element.style.transition = 'transform 0.1s ease-out';
    }
    
    onMove(e) {
        const rect = this.element.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        
        const tiltX = ((y - centerY) / centerY) * this.maxTilt;
        const tiltY = ((centerX - x) / centerX) * this.maxTilt;
        
        this.element.style.transform = `
            perspective(${this.perspective}px)
            rotateX(${tiltX}deg)
            rotateY(${tiltY}deg)
            scale(${this.scale})
        `;
    }
    
    onLeave() {
        this.element.style.transition = 'transform 0.5s ease-out';
        this.element.style.transform = `
            perspective(${this.perspective}px)
            rotateX(0deg)
            rotateY(0deg)
            scale(1)
        `;
    }
}


/* --------------------------------------------
   Staggered Reveal with Character Animation
   -------------------------------------------- */
class StaggeredReveal {
    constructor(elements) {
        this.elements = elements;
        this.observer = null;
        
        this.init();
    }
    
    init() {
        this.observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.reveal(entry.target);
                    this.observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.2 });
        
        this.elements.forEach(el => this.observer.observe(el));
    }
    
    reveal(element) {
        const text = element.textContent;
        element.innerHTML = '';
        element.style.opacity = '1';
        
        [...text].forEach((char, i) => {
            const span = document.createElement('span');
            span.textContent = char === ' ' ? '\u00A0' : char;
            span.style.opacity = '0';
            span.style.display = 'inline-block';
            span.style.transform = 'translateY(30px) rotate(10deg)';
            span.style.transition = `all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) ${i * 0.03}s`;
            element.appendChild(span);
            
            requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                    span.style.opacity = '1';
                    span.style.transform = 'translateY(0) rotate(0deg)';
                });
            });
        });
    }
}


/* --------------------------------------------
   Morphing Blob Background
   -------------------------------------------- */
class MorphingBlob {
    constructor(element) {
        this.element = element;
        this.paths = [
            "M44.2,-51.8C56.5,-40.9,65,-25.5,67.9,-8.7C70.8,8.1,68.1,26.2,58.4,39.2C48.6,52.2,31.9,60,14.1,64.3C-3.7,68.6,-22.5,69.4,-37.8,62C-53.1,54.6,-64.9,39,-70.2,21.5C-75.6,4,-74.5,-15.5,-66,-31.2C-57.5,-46.9,-41.6,-58.8,-25.3,-68.2C-9,-77.6,7.6,-84.5,22.6,-80.2C37.6,-75.8,51,-70.2,44.2,-51.8Z",
            "M41.9,-50.9C53.7,-41.4,62.3,-27.7,66.4,-12.2C70.5,3.3,70.1,20.6,62.2,33.8C54.4,47,39.1,56.1,22.8,61.6C6.5,67.1,-10.8,68.9,-26.8,63.8C-42.7,58.7,-57.2,46.6,-64.4,31.3C-71.5,16,-71.2,-2.5,-65.5,-18.7C-59.8,-34.9,-48.6,-48.8,-35.4,-58C-22.2,-67.1,-6.9,-71.5,5.9,-68.4C18.7,-65.3,30.1,-60.4,41.9,-50.9Z",
            "M37.4,-43.1C49.4,-35.4,60.8,-24.4,65.8,-10.4C70.7,3.7,69.3,20.8,61,34.2C52.7,47.5,37.6,57.1,21.4,62.3C5.2,67.5,-12.1,68.4,-27.1,62.5C-42.1,56.6,-54.8,43.9,-62.2,28.5C-69.6,13.1,-71.6,-5,-66.4,-20.6C-61.2,-36.2,-48.8,-49.2,-35.1,-56.4C-21.3,-63.6,-6.3,-65,-4.9,-59.1C-3.4,-53.2,25.5,-50.9,37.4,-43.1Z"
        ];
        this.currentPath = 0;
        this.morphDuration = 3000;
        
        this.animate();
    }
    
    animate() {
        setInterval(() => {
            this.currentPath = (this.currentPath + 1) % this.paths.length;
            this.element.style.transition = `d ${this.morphDuration}ms ease-in-out`;
            this.element.setAttribute('d', this.paths[this.currentPath]);
        }, this.morphDuration);
    }
}


/* --------------------------------------------
   Scroll-Triggered Parallax
   -------------------------------------------- */
class ScrollParallax {
    constructor() {
        this.elements = document.querySelectorAll('[data-parallax]');
        this.animate();
    }
    
    animate() {
        this.elements.forEach(el => {
            const speed = parseFloat(el.dataset.parallax) || 0.5;
            const rect = el.getBoundingClientRect();
            const scrolled = window.scrollY;
            const offset = (scrolled - (rect.top + scrolled - window.innerHeight)) * speed;
            
            el.style.transform = `translateY(${offset}px)`;
        });
        
        requestAnimationFrame(() => this.animate());
    }
}


/* --------------------------------------------
   Floating Elements
   -------------------------------------------- */
class FloatingElement {
    constructor(element) {
        this.element = element;
        this.startY = 0;
        this.amplitude = parseFloat(element.dataset.float) || 20;
        this.speed = parseFloat(element.dataset.floatSpeed) || 0.002;
        
        this.animate();
    }
    
    animate() {
        const y = Math.sin(Date.now() * this.speed) * this.amplitude;
        const rotate = Math.sin(Date.now() * this.speed * 0.7) * 3;
        this.element.style.transform = `translateY(${y}px) rotate(${rotate}deg)`;
        
        requestAnimationFrame(() => this.animate());
    }
}


/* --------------------------------------------
   Glitch Text Effect
   -------------------------------------------- */
class GlitchText {
    constructor(element) {
        this.element = element;
        this.text = element.textContent;
        this.isGlitching = false;
        
        this.createLayers();
        this.startRandomGlitch();
    }
    
    createLayers() {
        this.element.style.position = 'relative';
        this.element.dataset.text = this.text;
        
        // Add CSS for pseudo-elements
        const style = document.createElement('style');
        style.textContent = `
            .glitch-text {
                position: relative;
            }
            .glitch-text::before,
            .glitch-text::after {
                content: attr(data-text);
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                opacity: 0;
            }
            .glitch-text::before {
                color: #ff00ea;
                z-index: -1;
            }
            .glitch-text::after {
                color: #00fff2;
                z-index: -2;
            }
            .glitch-text.glitching::before {
                animation: glitch-1 0.2s infinite;
                opacity: 0.8;
            }
            .glitch-text.glitching::after {
                animation: glitch-2 0.2s infinite;
                opacity: 0.8;
            }
            @keyframes glitch-1 {
                0%, 100% { transform: translate(0); }
                20% { transform: translate(-3px, 3px); }
                40% { transform: translate(3px, -3px); }
                60% { transform: translate(-3px, -3px); }
                80% { transform: translate(3px, 3px); }
            }
            @keyframes glitch-2 {
                0%, 100% { transform: translate(0); }
                20% { transform: translate(3px, -3px); }
                40% { transform: translate(-3px, 3px); }
                60% { transform: translate(3px, 3px); }
                80% { transform: translate(-3px, -3px); }
            }
        `;
        document.head.appendChild(style);
        this.element.classList.add('glitch-text');
    }
    
    startRandomGlitch() {
        setInterval(() => {
            if (Math.random() > 0.95) {
                this.element.classList.add('glitching');
                setTimeout(() => {
                    this.element.classList.remove('glitching');
                }, 200 + Math.random() * 300);
            }
        }, 100);
    }
}


/* --------------------------------------------
   Initialize All Creative Effects
   -------------------------------------------- */
document.addEventListener('DOMContentLoaded', () => {
    // Particle field in hero
    const heroCanvas = document.getElementById('hero-particles');
    if (heroCanvas) {
        new ParticleField(heroCanvas);
    }
    
    // Magnetic text on hero title
    const magneticElements = document.querySelectorAll('.magnetic-text');
    magneticElements.forEach(el => new MagneticText(el));
    
    // Text scramble effect
    const scrambleElements = document.querySelectorAll('.scramble-text');
    scrambleElements.forEach(el => {
        const scramble = new TextScramble(el);
        const originalText = el.textContent;
        
        // Scramble on load
        el.textContent = '';
        setTimeout(() => scramble.animate(originalText), 500);
        
        // Scramble on hover
        el.addEventListener('mouseenter', () => {
            scramble.animate(originalText);
        });
    });
    
    // Tilt cards
    const tiltCards = document.querySelectorAll('.tilt-card');
    tiltCards.forEach(el => new TiltCard(el));
    
    // Staggered text reveal
    const staggerElements = document.querySelectorAll('.stagger-reveal');
    if (staggerElements.length) {
        new StaggeredReveal(staggerElements);
    }
    
    // Floating elements
    const floatingElements = document.querySelectorAll('[data-float]');
    floatingElements.forEach(el => new FloatingElement(el));
    
    // Glitch text
    const glitchElements = document.querySelectorAll('.glitch-on-hover');
    glitchElements.forEach(el => new GlitchText(el));
    
    // Initialize parallax
    if (document.querySelectorAll('[data-parallax]').length) {
        new ScrollParallax();
    }
    
    // Morphing blobs
    const blobPaths = document.querySelectorAll('.morph-blob');
    blobPaths.forEach(el => new MorphingBlob(el));
});


/* --------------------------------------------
   Scroll Progress & Section Transitions
   -------------------------------------------- */
class ScrollProgress {
    constructor() {
        this.progressBar = document.createElement('div');
        this.progressBar.className = 'scroll-progress';
        this.progressBar.innerHTML = '<div class="scroll-progress-bar"></div>';
        document.body.appendChild(this.progressBar);
        
        this.bar = this.progressBar.querySelector('.scroll-progress-bar');
        
        // Add styles
        const style = document.createElement('style');
        style.textContent = `
            .scroll-progress {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 3px;
                z-index: 9999;
                background: rgba(255,255,255,0.1);
            }
            .scroll-progress-bar {
                height: 100%;
                width: 0%;
                background: linear-gradient(90deg, #6d28d9, #f97316);
                transition: width 0.1s ease-out;
            }
        `;
        document.head.appendChild(style);
        
        window.addEventListener('scroll', () => this.update());
    }
    
    update() {
        const scrollTop = window.scrollY;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        const progress = (scrollTop / docHeight) * 100;
        this.bar.style.width = `${progress}%`;
    }
}

// Initialize scroll progress
document.addEventListener('DOMContentLoaded', () => {
    new ScrollProgress();
});


/* --------------------------------------------
   Export for use in other files
   -------------------------------------------- */
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        ParticleField,
        MagneticText,
        TextScramble,
        TiltCard,
        StaggeredReveal,
        MorphingBlob,
        ScrollParallax,
        FloatingElement,
        GlitchText,
        ScrollProgress
    };
}
