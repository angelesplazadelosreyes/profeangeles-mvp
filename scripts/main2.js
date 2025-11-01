// /scripts/main2.js
import { fetchPlayground } from './api2.js';

let lastExercise = null;
let chart = null;

/* Opciones */
const OPTIONS = {
  "Álgebra": {
    "Función cuadrática": [
      { id: "analisis_completo", label: "Análisis completo (raíces, vértice, etc.)" }
    ]
  }
};

/* Utils */
function renderMath(latex, elId){
  const el = document.getElementById(elId);
  if (!el) return;
  el.innerHTML = latex ? `$$${latex}$$` : "";
  if (window.MathJax?.typesetPromise){
    window.MathJax.typesetPromise([el]);
  }
}

/* Chart.js a partir de coeffs + rango */
function dibujarGraficoCuadratica(data){
  const canvas = document.getElementById('grafico');
  if (!canvas || !data?.graph || !data?.coeffs) return;
  const ctx = canvas.getContext('2d');

  const { x_min, x_max, step } = data.graph;
  const { a, b, c } = data.coeffs;

  const xs = [];
  const ys = [];
  for(let x = x_min; x <= x_max; x += step){
    xs.push(Number(x.toFixed(2)));
    ys.push(a*x*x + b*x + c);
  }

  if (chart) chart.destroy();
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

/* Selects */
function initFilters(){
  const temaSel = document.getElementById('tema');
  const subtemaSel = document.getElementById('subtema');
  const tipoSel = document.getElementById('tipo');
  if (!temaSel || !subtemaSel || !tipoSel) return;

  temaSel.innerHTML = Object.keys(OPTIONS)
    .map(t => `<option value="${t}">${t}</option>`).join('');

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

/* Acciones */
async function nuevoEjercicio(){
  try{
    const tema = document.getElementById('tema')?.value || 'Álgebra';
    const subtema = document.getElementById('subtema')?.value || 'Función cuadrática';
    const tipo = document.getElementById('tipo')?.value || 'analisis_completo';

    const data = await fetchPlayground({ tema, subtema, tipo });
    lastExercise = data;

    renderMath(data.latex_enunciado || '', 'enunciado');
    renderMath('', 'sol-func');      // limpiamos análisis función
    renderMath('', 'sol-graph');     // limpiamos análisis gráfico/leyendas

    if (chart){ chart.destroy(); chart = null; }
  }catch(err){
    alert(err.message || 'Failed to fetch (playground)');
  }
}

async function mostrarRespuesta(){
  try{
    if(!lastExercise){
      await nuevoEjercicio();
      if(!lastExercise) return;
    }
    // Escribimos la solución en la tarjeta de función
    renderMath(lastExercise.latex_solucion || '', 'sol-func');

    // El gráfico va en la segunda tarjeta
    if (lastExercise.graph && lastExercise.coeffs){
      dibujarGraficoCuadratica(lastExercise);
      // opcional: texto breve bajo el gráfico
      const info = String.raw`\textit{Nota:}~La línea punteada marca el eje de simetría; el vértice se muestra como punto destacado.`;
      renderMath(info, 'sol-graph');
    }else{
      renderMath(String.raw`\text{No hay datos de gráfico}`, 'sol-graph');
    }
  }catch(err){
    alert(err.message || 'Failed to fetch (playground)');
  }
}

/* Sidebar + header icon (igual que antes) */
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

function initSubjectsSidebar(){
  const list = document.getElementById('subjects');
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

/* Boot */
window.addEventListener('DOMContentLoaded', ()=>{
  initSubjectsSidebar();
  initSidebarToggle();
  initFilters();

  applySidebarIcons();
  renderSubjectTitle();
  renderHeaderIcon();

  document.getElementById('btn-nuevo')?.addEventListener('click', nuevoEjercicio);
  document.getElementById('btn-mostrar')?.addEventListener('click', mostrarRespuesta);
});
