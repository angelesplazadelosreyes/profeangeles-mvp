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

  // 2) Marca activo en el menú según la URL
  (function markActive() {
    const norm = (p) => {
      if (!p) return '/';
      let x = p.toLowerCase();
      if (x.endsWith('.html')) x = x.slice(0, -5);
      if (x === '/index') x = '/';
      return x;
    };
    const current = norm(location.pathname);

    document.querySelectorAll('header .menu a').forEach(a => {
      const href = a.getAttribute('href') || '';
      const target = norm(href);
      if (target === current) {
        a.classList.add('active');
        a.setAttribute('aria-current', 'page');
      } else {
        a.classList.remove('active');
        a.removeAttribute('aria-current');
      }
    });
  })();
});
