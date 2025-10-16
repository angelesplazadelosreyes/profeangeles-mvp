let lastExercise = null;
let chart = null;

/* ===========================
   Opciones (extensible)
   =========================== */
const OPTIONS = {
  "Álgebra": {
    "Función cuadrática": [
      { id: "analisis_completo", label: "Análisis completo (raíces, vértice, etc.)" }
    ]
  }
};

/* ===========================
   Utils
   =========================== */
function renderMath(latex, elId){
  const el = document.getElementById(elId);
  if (!el) return;
  el.innerHTML = latex ? `$$${latex}$$` : "";
  if (window.MathJax?.typesetPromise){
    window.MathJax.typesetPromise([el]);
  }
}

function buildApiUrl(){
  const tema = document.getElementById('tema').value;
  const subtema = document.getElementById('subtema').value;
  const tipo = document.getElementById('tipo').value;

  const PROD_API = 'https://profeangeles-mvp.onrender.com'; // Render

  // Switch por querystring para local/producción:
  //   ?api=prod  -> Render
  //   ?api=local -> localhost:5000
  //   (sin parámetro) -> auto (local si host es localhost/127.0.0.1)
  const apiParam = new URLSearchParams(location.search).get('api');
  let base;
  if (apiParam === 'prod') {
    base = PROD_API;
  } else if (apiParam === 'local') {
    base = 'http://localhost:5000';
  } else {
    const isLocal = location.hostname === 'localhost' || location.hostname === '127.0.0.1';
    base = isLocal ? 'http://localhost:5000' : PROD_API;
  }

  const url = new URL('/api/generate-exercise', base);
  url.searchParams.set('topic', tema);
  url.searchParams.set('subtopic', subtema);
  url.searchParams.set('type', tipo);
  return url.toString();
}

/* ===========================
   Warmup + backoff para Render
   =========================== */
async function warmAndFetch(apiUrl) {
  const ROOT = 'https://profeangeles-mvp.onrender.com/';

  // 1) “Despertar” la instancia
  let wait = 1500;
  for (let i = 0; i < 4; i++) {
    try {
      const r = await fetch(ROOT, { method: 'GET' });
      if (r.ok) break;
    } catch (_) {}
    await new Promise(r => setTimeout(r, wait));
    wait = Math.round(wait * 1.7);
  }

  // 2) Llamada real con reintentos
  wait = 1800;
  for (let i = 0; i < 5; i++) {
    try {
      const res = await fetch(apiUrl, { method: 'GET' });
      if (res.ok) return res;
      if (res.status !== 503) return res;
    } catch (_) {}
    await new Promise(r => setTimeout(r, wait));
    wait = Math.round(wait * 1.7);
  }

  // Intento final
  return fetch(apiUrl, { method: 'GET' });
}

async function fetchEjercicio(){
  const res = await warmAndFetch(buildApiUrl());
  if(!res.ok) throw new Error(`Error API (${res.status})`);
  return await res.json();
}

/* ===========================
   Acciones de ejercicio
   =========================== */
async function nuevoEjercicio(){
  try{
    const data = await fetchEjercicio();
    lastExercise = data;

    // mostrar enunciado del nuevo ejercicio
    renderMath(data.latex_enunciado, 'enunciado');

    // limpiar solución y gráfico anteriores
    renderMath("", 'solucion');
    if (chart){ chart.destroy(); chart = null; }
  }catch(err){
    alert(err.message || 'Failed to fetch');
  }
}

async function mostrarRespuesta(){
  try{
    if(!lastExercise){
      lastExercise = await fetchEjercicio();
    }
    renderMath(lastExercise.latex_solucion, 'solucion');
    dibujarGrafico(lastExercise);
  }catch(err){
    alert(err.message || 'Failed to fetch');
  }
}

function dibujarGrafico(data){
  const canvas = document.getElementById('grafico');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  const { x_min, x_max, step } = data.graph;
  const { coeffs } = data;

  const xs = [];
  const ys = [];
  for(let x = x_min; x <= x_max; x += step){
    xs.push(Number(x.toFixed(2)));
    ys.push(coeffs.a*x*x + coeffs.b*x + coeffs.c);
  }

  if(chart) chart.destroy();
  chart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: xs,
      datasets: [{ label: 'y = ax² + bx + c', data: ys }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: { title:{display:true,text:'x'} },
        y: { title:{display:true,text:'y'} }
      }
    }
  });
}

/* ===========================
   Filtros
   =========================== */
function initFilters(){
  const temaSel = document.getElementById('tema');
  const subtemaSel = document.getElementById('subtema');
  const tipoSel = document.getElementById('tipo');

  temaSel.innerHTML = Object.keys(OPTIONS).map(t => `<option value="${t}">${t}</option>`).join('');

  function refreshSubtemas(){
    const t = temaSel.value;
    const subs = Object.keys(OPTIONS[t] || {});
    subtemaSel.innerHTML = subs.map(s => `<option value="${s}">${s}</option>`).join('');
    refreshTipos();
  }

  function refreshTipos(){
    const t = temaSel.value;
    const s = subtemaSel.value;
    const tipos = (OPTIONS[t] && OPTIONS[t][s]) || [];
    tipoSel.innerHTML = tipos.map(opt => `<option value="${opt.id}">${opt.label}</option>`).join('');
  }

  temaSel.addEventListener('change', refreshSubtemas);
  subtemaSel.addEventListener('change', refreshTipos);

  refreshSubtemas();
}

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

function applySidebarIcons(){
  document.querySelectorAll('.subjects__item').forEach(li=>{
    const name = li.getAttribute('data-subject') || li.textContent || '';
    const key = subjectKeyFromText(name);
    const box = li.querySelector('.subjects__icon');
    if (box && SUBJECT_ICONS[key]) box.innerHTML = SUBJECT_ICONS[key];
  });
}

function renderHeaderIcon(){
  const holder = document.querySelector('.subject-icon-header');
  if (!holder) return;
  const key = getCurrentSubjectKey();
  holder.innerHTML = SUBJECT_ICONS[key] || '';
}
function renderSubjectTitle(){
  const span = document.getElementById('subject-name');
  if (!span) return;
  const active = document.querySelector('.subjects__item[aria-current="page"]');
  const name = active?.getAttribute('data-subject') || active?.textContent?.trim() || 'Matemáticas';
  span.textContent = name;
}

/* ===========================
   Sidebar: activo + título dinámico
   =========================== */
function initSubjectsSidebar(){
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
function initSidebarToggle(){
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

/* ===========================
   Boot
   =========================== */
window.addEventListener('DOMContentLoaded', ()=>{
  initSubjectsSidebar();
  initSidebarToggle();
  initFilters();

  // Pintar iconos al cargar y sincronizar encabezado
  applySidebarIcons();
  renderSubjectTitle();
  renderHeaderIcon();

  document.getElementById('btn-nuevo').addEventListener('click', nuevoEjercicio);
  document.getElementById('btn-mostrar').addEventListener('click', mostrarRespuesta);
});
