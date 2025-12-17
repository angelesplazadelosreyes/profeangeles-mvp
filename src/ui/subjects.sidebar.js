// src/ui/subjects.sidebar.js
// Maneja la sidebar de materias y el encabezado dinámico en exercises.html:
//
// - Íconos por materia
// - Marcar materia activa
// - Actualizar título del header
// - Sidebar colapsable en móvil

/* ===========================
   Íconos por materia (SVG)
   =========================== */
const SUBJECT_ICONS = {
  matematicas: `
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <rect x="3" y="3" rx="4" width="18" height="18" fill="#FFD400" stroke="#1d2b2f" stroke-width="1.5"/>
      <path d="M8 16l4-8 4 8M10 12h4" stroke="#1d2b2f" stroke-width="1.8" fill="none"
            stroke-linecap="round" stroke-linejoin="round"/>
    </svg>`,
  quimica: `
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <rect x="3" y="3" rx="4" width="18" height="18" fill="#FF8A00" stroke="#1d2b2f" stroke-width="1.5"/>
      <path d="M10 7h4M12 7v3l3 5a3 3 0 0 1-3 3h-2a3 3 0 0 1-3-3l3-5V7"
            stroke="#1d2b2f" stroke-width="1.8" fill="none"
            stroke-linecap="round" stroke-linejoin="round"/>
    </svg>`,
  biologia: `
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <rect x="3" y="3" rx="4" width="18" height="18" fill="#00D48B" stroke="#1d2b2f" stroke-width="1.5"/>
      <path d="M7 15c0-4 5-7 10-6 2 1 2 6-2 8-4 2-7 1-8-2Z"
            stroke="#1d2b2f" stroke-width="1.8" fill="none" stroke-linejoin="round"/>
      <path d="M8.5 15c3.5-1 6-2.5 8.5-5"
            stroke="#1d2b2f" stroke-width="1.8" fill="none" stroke-linecap="round"/>
    </svg>`,
  fisica: `
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <rect x="3" y="3" rx="4" width="18" height="18" fill="#9B5DE5" stroke="#1d2b2f" stroke-width="1.5"/>
      <ellipse cx="12" cy="12" rx="6.5" ry="3" fill="none" stroke="#1d2b2f" stroke-width="1.8"/>
      <ellipse cx="12" cy="12" rx="6.5" ry="3" transform="rotate(60 12 12)" fill="none" stroke="#1d2b2f" stroke-width="1.8"/>
      <ellipse cx="12" cy="12" rx="6.5" ry="3" transform="rotate(-60 12 12)" fill="none" stroke="#1d2b2f" stroke-width="1.8"/>
      <circle cx="12" cy="12" r="1.6" fill="#1d2b2f" stroke="none"/>
    </svg>`
};

function subjectKeyFromText(txt){
  const s = (txt||'').toLowerCase();
  if (s.includes('matem')) return 'matematicas';
  if (s.includes('quím') || s.includes('quimi')) return 'quimica';
  if (s.includes('biol')) return 'biologia';
  if (s.includes('fís') || s.includes('fis')) return 'fisica';
  return 'matematicas';
}

function getCurrentSubjectKey(){
  const active = document.querySelector('.subjects__item[aria-current="page"]');
  const name = active?.getAttribute('data-subject') || active?.textContent || '';
  return subjectKeyFromText(name);
}

/* ===========================
   Render header (icono + título)
   =========================== */
export function renderHeaderIcon(){
  const holder = document.querySelector('.subject-icon-header');
  if (!holder) return;
  const key = getCurrentSubjectKey();
  holder.innerHTML = SUBJECT_ICONS[key] || '';
}

export function renderSubjectTitle(){
  const span = document.getElementById('subject-name');
  if (!span) return;
  const active = document.querySelector('.subjects__item[aria-current="page"]');
  const name = active?.getAttribute('data-subject') || active?.textContent?.trim() || 'Matemáticas';
  span.textContent = name;
}

/* ===========================
   Aplicar íconos en sidebar
   =========================== */
export function applySidebarIcons(){
  document.querySelectorAll('.subjects__item').forEach(li=>{
    const name = li.getAttribute('data-subject') || li.textContent || '';
    const key = subjectKeyFromText(name);
    const box = li.querySelector('.subjects__icon');
    if (box && SUBJECT_ICONS[key]) box.innerHTML = SUBJECT_ICONS[key];
  });
}

/* ===========================
   Sidebar: activo + título dinámico
   =========================== */
export function initSubjectsSidebar(){
  const list = document.getElementById('subjects');
  if (!list) return;

  const items = Array.from(list.querySelectorAll('.subjects__item'));

  function setActive(item){
    if (item.getAttribute('aria-disabled') === 'true') return;

    // Quitar activo del resto y marcar el nuevo
    items.forEach(i => i.removeAttribute('aria-current'));
    item.setAttribute('aria-current', 'page');

    // Actualizar título e icono
    renderSubjectTitle();
    renderHeaderIcon();
  }

  function handleActivate(e){
    if (e.type === 'keydown' && !(e.key === 'Enter' || e.key === ' ')) return;
    e.preventDefault();
    setActive(e.currentTarget);
  }

  items.forEach(item => {
    item.addEventListener('click', handleActivate);
    item.addEventListener('keydown', handleActivate);
  });
}

/* ===========================
   Sidebar colapsable en móvil
   =========================== */
export function initSidebarToggle(){
  const btn = document.getElementById('toggle-subjects');
  const sidebar = document.getElementById('sidebar');
  const list = document.getElementById('subjects');
  if (!btn || !sidebar || !list) return;

  function setOpen(open){
    if (open){
      sidebar.classList.add('is-open');
      btn.setAttribute('aria-expanded', 'true');
    }else{
      sidebar.classList.remove('is-open');
      btn.setAttribute('aria-expanded', 'false');
    }
  }

  // Click del botón
  btn.addEventListener('click', ()=>{
    const isOpen = sidebar.classList.contains('is-open');
    setOpen(!isOpen);
  });

  // Cerrar al seleccionar una materia (mejor UX en móvil)
  list.addEventListener('click', (e)=>{
    const item = e.target.closest('.subjects__item');
    if (!item) return;
    if (window.matchMedia('(max-width: 768px)').matches){
      setOpen(false);
    }
  });

  // Cerrar al hacer click fuera (solo móvil)
  document.addEventListener('click', (e)=>{
    if (!window.matchMedia('(max-width: 768px)').matches) return;
    const clickedInside = sidebar.contains(e.target) || btn.contains(e.target);
    if (!clickedInside) setOpen(false);
  });
}
