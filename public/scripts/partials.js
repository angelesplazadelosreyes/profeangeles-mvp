// /scripts/partials.js
document.addEventListener('DOMContentLoaded', async () => {
  async function inject(el, name) {
    try {
      const res = await fetch(`/partials/${name}.html`, { cache: 'no-cache' });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      el.outerHTML = await res.text();
    } catch (err) {
      console.error(`[partials] Error cargando ${name}:`, err);
    }
  }

  // 1) Inyecta parciales
  const headers = document.querySelectorAll('[data-include="header"]');
  const footers = document.querySelectorAll('[data-include="footer"]');
  await Promise.all([...headers].map(el => inject(el, 'header')));
  await Promise.all([...footers].map(el => inject(el, 'footer')));

  // 1.2) Toggle menú hamburguesa (móvil)
  (function initNavToggle() {
    const toggle = document.querySelector('.nav-toggle');
    const menu   = document.getElementById('main-menu');
    if (!toggle || !menu) return;

    toggle.addEventListener('click', function () {
      const open = menu.classList.toggle('menu-open');
      toggle.setAttribute('aria-expanded', open);
      toggle.classList.toggle('nav-toggle--open', open);
    });

    document.addEventListener('click', function (e) {
      if (!e.target.closest('.nav')) {
        menu.classList.remove('menu-open');
        toggle.setAttribute('aria-expanded', 'false');
        toggle.classList.remove('nav-toggle--open');
      }
    });
  })();

  // 1.1) Utilidades del footer (migradas desde el parcial)
  (function initFooterUtils() {
    const yearEl = document.getElementById('footer-year');
    if (yearEl) yearEl.textContent = new Date().getFullYear();

    const emailEl = document.getElementById('footer-email');
    if (emailEl && navigator.clipboard) {
      emailEl.addEventListener('click', async () => {
        try {
          await navigator.clipboard.writeText('contacto@profeangeles.cl');
          const prev = emailEl.title;
          emailEl.title = '¡Copiado!';
          setTimeout(() => (emailEl.title = prev || 'Enviar correo'), 1500);
        } catch {}
      });
    }
  })();

  // 2) Marca activo en el menú según la URL (links + dropdown buttons)
  (function markActive() {
    const norm = (p) => {
      if (!p) return '/';
      let x = p.toLowerCase();

      // si viene con query/hash, lo limpiamos
      x = x.split('?')[0].split('#')[0];

      if (x.endsWith('.html')) x = x.slice(0, -5);
      if (x === '/index') x = '/';
      return x;
    };

    const current = norm(location.pathname);

    // Limpia activos previos (links + botones)
    document.querySelectorAll('header .menu a.active, header .menu .menu-link.active')
      .forEach(el => el.classList.remove('active'));

    document.querySelectorAll('header .menu a[aria-current="page"]')
      .forEach(el => el.removeAttribute('aria-current'));

    // 2.1) Activa link exacto si existe (Inicio, o sub-items del dropdown)
    const links = Array.from(document.querySelectorAll('header .menu a[href]'));
    const activeLink = links.find(a => norm(a.getAttribute('href')) === current);

    if (activeLink) {
      activeLink.classList.add('active');
      activeLink.setAttribute('aria-current', 'page');
    }

    // 2.2) Activa dropdown padre según ruta (Ejercicios / Servicios)
    const isExercises = current.startsWith('/exercises') || current.startsWith('/guides');
    const isServices  = current.startsWith('/classes') || current.startsWith('/services-dev');

    if (isExercises) {
      document.querySelector('header .menu .menu-link[data-menu="exercises"]')
        ?.classList.add('active');
    }

    if (isServices) {
      document.querySelector('header .menu .menu-link[data-menu="services"]')
        ?.classList.add('active');
    }
  })();

});
