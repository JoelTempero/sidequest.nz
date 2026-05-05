// GSAP Horizontal Scroll — Desktop Only
function initHorizontalScroll() {
    const isDesktop = window.matchMedia('(min-width: 769px)').matches;
    if (!isDesktop) return;

    gsap.registerPlugin(ScrollTrigger);

    const scrollContainer = document.getElementById('horizontal-scroll');
    const panels = document.querySelector('.panels');
    const panelElements = gsap.utils.toArray('.panel');

    if (!scrollContainer || !panels || panelElements.length === 0) return;

    const totalScroll = panels.scrollWidth - window.innerWidth;

    gsap.to(panels, {
        x: -totalScroll,
        ease: 'none',
        scrollTrigger: {
            trigger: scrollContainer,
            pin: true,
            scrub: 1,
            end: () => `+=${totalScroll}`,
            invalidateOnRefresh: true,
        }
    });
}

// Initialize on DOM ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initHorizontalScroll);
} else {
    initHorizontalScroll();
}

// Reinitialize on resize (debounced)
let resizeTimeout;
window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
        ScrollTrigger.getAll().forEach(t => t.kill());
        initHorizontalScroll();
    }, 250);
});
