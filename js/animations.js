function initAnimations() {
    gsap.registerPlugin(ScrollTrigger);

    // Hero entrance (both desktop and mobile)
    const heroTl = gsap.timeline({ delay: 0.3 });
    heroTl
        .to('.hero-line', {
            opacity: 1, y: 0, duration: 0.8, stagger: 0.2, ease: 'power3.out'
        })
        .to('.hero-subtitle', {
            opacity: 1, y: 0, duration: 0.6, ease: 'power3.out'
        }, '-=0.3')
        .to('.hero-scroll-cue', {
            opacity: 1, duration: 0.5, ease: 'power2.out'
        }, '-=0.2');

    // Mobile only: scroll-triggered entrance for panels
    const isMobile = window.matchMedia('(max-width: 768px)').matches;
    if (isMobile) {
        gsap.utils.toArray('.panel-project, .panel-cta').forEach(panel => {
            const elements = panel.querySelectorAll(
                '.label, .panel-title, .panel-desc, .project-visual, .project-tags, .btn-link, .btn-primary'
            );
            gsap.from(elements, {
                opacity: 0,
                y: 30,
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
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAnimations);
} else {
    initAnimations();
}
