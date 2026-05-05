/* ============================================================
   SIDEQUEST.NZ — Main JS
   Navigation mobile toggle + project data loader
   ============================================================ */

(function () {
  const navToggle = document.querySelector('.nav-toggle');
  const navMobile = document.querySelector('.nav-mobile');

  if (!navToggle || !navMobile) return;

  function openMenu() {
    navToggle.classList.add('open');
    navMobile.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeMenu() {
    navToggle.classList.remove('open');
    navMobile.classList.remove('open');
    document.body.style.overflow = '';
  }

  navToggle.addEventListener('click', function () {
    if (navToggle.classList.contains('open')) {
      closeMenu();
    } else {
      openMenu();
    }
  });

  navMobile.querySelectorAll('a').forEach(function (link) {
    link.addEventListener('click', closeMenu);
  });
})();

// Project Data Loader (used by work.html grid)
async function loadProjects() {
    try {
        const response = await fetch('/projects/manifest.json');
        if (!response.ok) throw new Error('Failed to load projects');
        return await response.json();
    } catch (e) {
        console.warn('Could not load projects:', e);
        return [];
    }
}
