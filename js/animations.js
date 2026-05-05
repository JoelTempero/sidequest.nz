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

    // Service panel animations — triggered when panel scrolls into view
    const servicePanels = gsap.utils.toArray('.panel-service');
    const scrollContainer = document.getElementById('horizontal-scroll');
    const totalScroll = panels.scrollWidth - window.innerWidth;

    servicePanels.forEach((panel, index) => {
        ScrollTrigger.create({
            trigger: scrollContainer,
            start: 'top top',
            end: () => `+=${totalScroll}`,
            scrub: true,
            onUpdate: (self) => {
                const panelCount = servicePanels.length + 2; // +2 for hero and teaser
                const panelStart = (index + 1) / panelCount;
                const threshold = panelStart - 0.02;

                if (self.progress >= threshold && !panel.classList.contains('revealed')) {
                    panel.classList.add('revealed');
                    revealPanel(panel);
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
            scrub: true,
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
