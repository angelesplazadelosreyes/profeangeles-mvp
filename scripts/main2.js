// /scripts/main2.js
// Lógica de exercises2 usando la API de playground (arquitectura con renderers)
import { fetchPlayground } from './api2.js';

let lastExercise = null;
let chartInstance = null;

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
   Helpers DOM / MathJax
   =========================== */
function byId(id){ return document.getElementById(id); }
function clear(el){ if (el) el.innerHTML = ""; }
function renderMathInto(el, latex){
  if (!el) return;
  el.innerHTML = latex ? `$$${latex}$$` : "";
  if (window.MathJax?.typesetPromise){
    window.MathJax.typesetPromise([el]);
  }
}
let __uid = 0;
function uid(prefix="id"){ __uid += 1; return `${prefix}-${__uid}`; }

/* ===========================
   Renderers (soluciones ad-hoc)
   =========================== */

// 1) Texto/LaTeX en una columna (biología, química, u otros sin gráfico)
function renderTextOnly(root, data){
  clear(root);
  const col = document.createElement('div');
  col.className = 'sol-col';
  const math = document.createElement('div');
  math.className = 'mathjax';
  col.appendChild(math);
  root.appendChild(col);

  const latex = data?.latex_solucion || '';
  renderMathInto(math, latex);
}

// 2) Cuadrática: 2 columnas (análisis LaTeX + gráfico)
function renderMathQuadraticAnalysis(root, data){
  clear(root);

  const grid = document.createElement('div');
  grid.className = 'sol-grid';

  // Columna izquierda: análisis
  const left = document.createElement('div');
  left.className = 'sol-col';
  const math = document.createElement('div');
  math.className = 'mathjax';
  left.appendChild(math);

  // Columna derecha: gráfico
  const right = document.createElement('div');
  right.className = 'sol-col';
  const canvas = document.createElement('canvas');
  canvas.id = uid('grafico');
  canvas.className = 'sol-chart';
  right.appendChild(canvas);

  grid.appendChild(left);
  grid.appendChild(right);
  root.appendChild(grid);

  // Pintar LaTeX
  renderMathInto(math, data?.latex_solucion || '');

  // Pintar gráfico (acepta dos formatos: chart simple o coeffs+graph)
  const ctx = canvas.getContext('2d');
  if (chartInstance) { chartInstance.destroy(); chartInstance = null; }

  if (data?.chart){
    const labels = data.chart.labels || data.chart.data?.labels || [];
    const values = data.chart.values || data.chart.data?.datasets?.[0]?.data || [];
    chartInstance = new Chart(ctx, {
      type: data.chart.type || 'line',
      data: {
        labels,
        datasets: [{
          label: data.chart.label || data.chart.data?.datasets?.[0]?.label || 'f(x)',
          data: values
        }]
      },
      options: data.chart.options || { responsive:true, maintainAspectRatio:false }
    });
  } else if (data?.graph && data?.coeffs){
    const { x_min, x_max, step } = data.graph;
    const { a, b, c } = data.coeffs;
    const xs = [], ys = [];
    for (let x=x_min; x<=x_max; x+=step){
      const xr = Number(x.toFixed(2));
      xs.push(xr);
      ys.push(a*xr*xr + b*xr + c);
    }
    chartInstance = new Chart(ctx, {
      type: 'line',
      data: { labels: xs, datasets: [{ label: 'y = ax² + bx + c', data: ys }] },
      options: { responsive:true, maintainAspectRatio:false }
    });
  }
}

// 3) Fallback: detecta si es cuadrática; si no, texto
function renderFallback(root, data){
  if (data?.graph && data?.coeffs) return renderMathQuadraticAnalysis(root, data);
  return renderTextOnly(root, data);
}

// Registry de renderers
const RENDERERS = {
  'math:funcion_cuadratica:analisis_completo': renderMathQuadraticAnalysis,
  'text:default': renderTextOnly,
  'fallback': renderFallback
};

// Resolución del renderer a usar
function selectRendererKey(data){
  const meta = data?.meta || {};
  // Si backend manda layout explícito
  if (meta.layout === 'two-column') return 'math:funcion_cuadratica:analisis_completo';
  if (meta.layout === 'single-column') return 'text:default';

  // Si manda subject/type/subtype
  if (meta.subject && meta.type && meta.subtype){
    return `${meta.subject}:${meta.type}:${meta.subtype}`.toLowerCase();
  }

  // Compatibilidad por estructura de datos
  if (data?.graph && data?.coeffs) return 'math:funcion_cuadratica:analisis_completo';
  return 'text:default';
}

function mountSolution(data){
  const root = byId('solution-root');
  if (!root) return;
  const key = selectRendererKey(data);
  const renderer = RENDERERS[key] || RENDERERS['fallback'];
  renderer(root, data);
}

/* ===========================
   Filtros (poblar selects)
   =========================== */
function initFilters(){
  const temaSel = byId('tema');
  const subtemaSel = byId('subtema');
  const tipoSel = byId('tipo');
  if (!temaSel || !subtemaSel || !tipoSel) return;

  temaSel.innerHTML = Object.keys(OPTIONS)
    .map(t => `<option value="${t}">${t}</option>`).join('');

  function refreshTipos(){
    const t = temaSel.value;
    const s = subtemaSel.value;
    const tipos = (OPTIONS[t] && OPTIONS[t][s]) || [];
    tipoSel.innerHTML = tipos.map(opt => `<option value="${opt.id}">${opt.label}</option>`).join('');
  }

  function refreshSubtemas(){
    const t = temaSel.value;
    const subs = Object.keys(OPTIONS[t] || {});
    subtemaSel.innerHTML = subs.map(s => `<option value="${s}">${s}</option>`).join('');
    refreshTipos();
  }

  temaSel.addEventListener('change', refreshSubtemas);
  subtemaSel.addEventListener('change', refreshTipos);
  refreshSubtemas(); // primera carga
}

/* ===========================
   Acciones (fetch + render)
   =========================== */
async function nuevoEjercicio(){
  try{
    const tema = byId('tema')?.value || 'Álgebra';
    const subtema = byId('subtema')?.value || 'Función cuadrática';
    const tipo = byId('tipo')?.value || 'analisis_completo';

    const data = await fetchPlayground({ tema, subtema, tipo });
    lastExercise = data;

    // Enunciado
    const enEl = byId('enunciado');
    renderMathInto(enEl, data.latex_enunciado || '');

    // Limpia solución y gráfico
    const root = byId('solution-root');
    clear(root);
    if (chartInstance){ chartInstance.destroy(); chartInstance = null; }
  }catch(err){
    alert(err.message || 'Failed to fetch (playground)');
  }
}

async function mostrarRespuesta(){
  try{
    if (!lastExercise){
      await nuevoEjercicio();       // nuevoEjercicio asigna lastExercise
      if (!lastExercise) return;
    }
    mountSolution(lastExercise);     // decide layout y renderiza
  }catch(err){
    alert(err.message || 'Failed to fetch (playground)');
  }
}

/* ===========================
   Íconos por materia (SVG) — mismo look que main.js
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
  const span = byId('subject-name');
  if (!span) return;
  const active = document.querySelector('.subjects__item[aria-current="page"]');
  const name = active?.getAttribute('data-subject') || active?.textContent?.trim() || 'Matemáticas';
  span.textContent = name;
}

/* ===========================
   Sidebar: activo + título
   =========================== */
function initSubjectsSidebar(){
  const list = byId('subjects');
  if (!list) return;
  const items = Array.from(list.querySelectorAll('.subjects__item'));

  function setActive(item){
    if (item.getAttribute('aria-disabled') === 'true') return;
    items.forEach(i => i.removeAttribute('aria-current'));
    item.setAttribute('aria-current', 'page');
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
  const btn = byId('toggle-subjects');
  const sidebar = byId('sidebar');
  const list = byId('subjects');
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

  btn.addEventListener('click', ()=>{
    const isOpen = sidebar.classList.contains('is-open');
    setOpen(!isOpen);
  });

  list.addEventListener('click', (e)=>{
    const item = e.target.closest('.subjects__item');
    if (!item) return;
    if (window.matchMedia('(max-width: 768px)').matches){
      setOpen(false);
    }
  });

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

  applySidebarIcons();
  renderSubjectTitle();
  renderHeaderIcon();

  const btnNuevo = byId('btn-nuevo');
  const btnMostrar = byId('btn-mostrar');
  if (btnNuevo) btnNuevo.addEventListener('click', nuevoEjercicio);
  if (btnMostrar) btnMostrar.addEventListener('click', mostrarRespuesta);
});
