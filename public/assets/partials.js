async function include(el, url){
  try{
    const r = await fetch(url, { cache: 'no-cache' });
    el.innerHTML = await r.text();

    // Si es el header, una vez incluido marcamos el ítem activo
    if (url.endsWith('header.html')) highlightActive();
  }catch(e){
    el.innerHTML = "<!-- include failed: " + url + " -->";
  }
}

function normalizePath(p){
  if (!p) return '/';
  // quita query y hash
  p = p.split('?')[0].split('#')[0];

  // asegura slash inicial
  if (!p.startsWith('/')) p = '/' + p;

  // /index y /index.html cuentan como "/"
  if (p === '/' || p === '/index' || p === '/index.html') return '/';

  // quita trailing slashes y extensión .html
  p = p.replace(/\/+$/, '').replace(/\.html$/i, '');
  return p || '/';
}

function highlightActive(){
  const current = normalizePath(location.pathname);
  document.querySelectorAll('.menu a').forEach(a=>{
    const href = normalizePath(a.getAttribute('href') || '');
    if (href === current){
      a.classList.add('active');
      a.setAttribute('aria-current','page');
    }
  });
}


document.addEventListener('DOMContentLoaded', ()=>{
  document.querySelectorAll('[data-include]').forEach(el=>{
    const file = el.getAttribute('data-include');
    if (file === 'header') include(el, '/partials/header.html');
    if (file === 'footer') include(el, '/partials/footer.html');
  });
});
