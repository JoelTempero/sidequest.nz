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

// Project Data Loader
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

// Populate featured project cards on homepage
async function populateFeaturedProjects() {
    const projects = await loadProjects();
    const slots = document.querySelectorAll('.featured-project[data-category]');

    slots.forEach(slot => {
        const category = slot.dataset.category;
        const featured = projects.find(p => p.category === category && p.featured);

        if (featured) {
            slot.innerHTML = `
                <a href="projects/${featured.slug}/" class="featured-project-link">
                    <div class="featured-project-image">
                        ${featured.featuredImage
                            ? `<img src="${featured.featuredImage}" alt="${featured.title}">`
                            : `<div style="width:100%;height:100%;background:var(--bg-surface);display:flex;align-items:center;justify-content:center;color:var(--text-muted);font-size:var(--text-xs);">Coming soon</div>`
                        }
                    </div>
                    <div class="featured-project-info">
                        <h4>${featured.title}</h4>
                        <p>${featured.summary}</p>
                    </div>
                </a>
            `;
        } else {
            slot.innerHTML = `
                <div style="padding:var(--space-lg);text-align:center;color:var(--text-muted);font-size:var(--text-sm);">
                    Projects coming soon
                </div>
            `;
        }
    });
}

// Run on homepage only
if (document.querySelector('.featured-project[data-category]')) {
    populateFeaturedProjects();
}
