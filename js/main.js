/* ============================================================
   SIDEQUEST.NZ — Main JS
   Navigation mobile toggle
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

  navMobile.querySelectorAll('.nav-link').forEach(function (link) {
    link.addEventListener('click', closeMenu);
  });
})();
