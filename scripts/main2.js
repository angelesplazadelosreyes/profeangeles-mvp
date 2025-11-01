// /scripts/main2.js
// Lógica de exercises2 usando la API de playground
import { fetchPlayground } from './api2.js';

let lastExercise = null;
let chart = null;

/* ============ Config (detecta ids nuevos si existen) ============ */
const IDS = {
  enunciado: 'enunciado',
  solFunc: document.getElementById('sol-func') ? 'sol-func' : 'solucion',
  solGraph: document.getElementById('sol-graph') ? 'sol-graph' : null,
  grafico: 'grafico'
};

/* ========================= Opciones (extensible) ========================= */
const OPTIONS = {
  "Álgebra": {
    "Función cuadrática": [
      { id: "analisis_completo", label: "Análisis completo (raíces, vértice, etc.)" }
    ]
  }
};

/* ================================ Utils ================================ */
function renderMath(latex, elId){
  const el = document.getElementById(elId);
  if (!el) return;
  el.innerHTML = latex ? `$$${latex}$$` : "";
  if (window.MathJax?.typesetPromise){
    window.MathJax.typesetPromise([el]);
  }
}

/* ================== Gráfico (formato simple genérico) ================== */
function dibujarGraficoDesdeChartObj(chartObj){
  const canvas = document.getElementById(IDS.grafico);
  if (!canvas || !chartObj) return;
  const ctx = canvas.getContext('2d');

  const labels = chartObj.labels || chartObj.data?.labels || [];
  const values = chartObj.values || chartObj.data?.datasets?.[0]?.data || [];

  if (chart) chart.destroy();
  chart = new Chart(ctx, {
    type: chartObj.type || 'line',
    data: {
      labels,
      datasets: [{
        label: chartObj.label || chartObj.data?.datasets?.[0]?.label || 'f(x)',
        data: values,
        borderWidth: 2,
        pointRadius: 0
      }]
    },
    options: chartObj.options || {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { position: 'bottom', labels: { boxWidth: 14, usePointStyle: true } }
      },
      scales: {
        x: { title:{display:true,text:'x'}, grid:{color:'rgba(0,0,0,.06)'} },
        y: { title:{display:true,text:'y'}, grid:{color:'rgba(0,0,0,.06)'} }
      }
    }
  });
}

/* =========== Gráfico cuadrática con anotaciones útiles =========== */
function dibujarGraficoCuadratica(data){
  const canvas = document.getElementById(IDS.grafico);
  if (!canvas || !data?.graph || !data?.coeffs) return;
  const ctx = canvas.getContext('2d');

  const { x_min, x_max, step, vertex, roots = [], axis, y_intercept } = data.graph;
  const { a, b, c } = data.coeffs;

  const xs = [];
  const ys = [];
  for(let x = x_min; x <= x_max + 1e-9; x += step){
    xs.push(Number(x.toFixed(2)));
    ys.push(a*x*x + b*x + c);
  }

  // Datos auxiliares
  const vx = vertex?.x ?? (-(b)/(2*a));
  const vy = vertex?.y ?? (a*vx*vx + b*vx + c);
  const axisX = axis?.x ?? vx;

  // Dataset principal (parábola)
  const dsParabola = {
    label: 'Parábola',
    data: ys,
    borderWidth: 2,
    pointRadius: 0
  };

  // Vértice
  const vertIdx = xs.findIndex(x => Math.abs(x - vx) < step/2) ?? 0;
  const dsVertice = {
    type: 'scatter',
    label: 'Vértice',
    data: [{ x: vx, y: vy }],
    pointRadius: 5
  };

  // Corte con eje y (x=0)
  const dsCorteY = {
    type: 'scatter',
    label: 'Corte con eje y',
    data: [{ x: 0, y: c }],
    pointStyle: 'circle',
    pointRadius: 4
  };

  // Raíces reales (si existen)
  const dsRaices = {
    type: 'scatter',
    label: 'Raíces reales',
    data: (roots || []).map(r => ({ x: r, y: 0 })),
    pointStyle: 'cross',
    pointRadius: 5
  };

  // Eje de simetría (línea vertical punteada)
  const dsEje = {
    label: 'Eje de simetría',
    data: xs.map(() => null),
    borderDash: [6, 6],
    pointRadius: 0
  };

  // Construimos el gráfico
  if (chart) chart.destroy();
  chart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: xs,
      datasets: [dsParabola, dsEje, dsVertice, dsCorteY, dsRaices]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      parsing: false, // usamos valores ya calculados
      plugins: {
        legend: { position: 'bottom', labels: { boxWidth: 14, usePointStyle: true } }
      },
      scales: {
        x: { title:{display:true,text:'x'}, grid:{ color:'rgba(0,0,0,.06)' } },
        y: { title:{display:true,text:'y'}, grid:{ color:'rgba(0,0,0,.06)' } }
      }
    },
    plugins: [{
      // Dibuja la línea vertical del eje de simetría en x = axisX
      id: 'axisLine',
      afterDraw(c){
        const xScale = c.scales.x, yScale = c.scales.y;
        if (!xScale || !yScale) return;
        const xPix = xScale.getPixelForValue(axisX);
        const ctx2 = c.ctx;
        ctx2.save();
        ctx2.setLineDash([6,6]);
        ctx2.beginPath();
        ctx2.moveTo(xPix, yScale.top);
        ctx2.lineTo(xPix, yScale.bottom);
        ctx2.stroke();
        ctx2.restore();
      }
    }]
  });
}

/* =========================== Filtros =========================== */
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

/* =========================== Acciones =========================== */
async function nuevoEjercicio(){
  try{
    const tema = document.getElementById('tema')?.value || 'Álgebra';
    const subtema = document.getElementById('subtema')?.value || 'Función cuadrática';
    const tipo = document.getElementById('tipo')?.value || 'analisis_completo';

    const data = await fetchPlayground({ tema, subtema, tipo });
    lastExercise = data;

    renderMath(data.latex_enunciado || '', IDS.enunciado);
    // limpiamos salidas
    renderMath('', IDS.solFunc);
    if (IDS.solGraph) renderMath('', IDS.solGraph);
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

    // Por ahora la API trae una sola solución LaTeX.
    // La mostramos en la tarjeta “Análisis de la función”.
    renderMath(lastExercise.latex_solucion || '', IDS.solFunc);

    // Y el gráfico en la otra tarjeta.
    if (lastExercise.chart){
      dibujarGraficoDesdeChartObj(lastExercise.chart);
    } else if (lastExercise.graph && lastExercise.coeffs){
      dibujarGraficoCuadratica(lastExercise);
    }
  }catch(err){
    alert(err.message || 'Failed to fetch (playground)');
  }
}

/* =================== Sidebar e iconos (igual que antes) =================== */
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

/* ================= Sidebar + toggle (igual) ================= */
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
    if (open){ sidebar.classList.add('is-open'); btn.setAttribute('aria-expanded', 'true'); }
    else { sidebar.classList.remove('is-open'); btn.setAttribute('aria-expanded', 'false'); }
  }
  btn.addEventListener('click', ()=>{
    const isOpen = sidebar.classList.contains('is-open');
    setOpen(!isOpen);
  });
  list.addEventListener('click', (e)=>{
    const item = e.target.closest('.subjects__item');
    if (!item) return;
    if (window.matchMedia('(max-width: 768px)').matches){ setOpen(false); }
  });
  document.addEventListener('click', (e)=>{
    if (!window.matchMedia('(max-width: 768px)').matches) return;
    const clickedInside = sidebar.contains(e.target) || btn.contains(e.target);
    if (!clickedInside) setOpen(false);
  });
}

/* =============================== Boot =============================== */
window.addEventListener('DOMContentLoaded', ()=>{
  initSubjectsSidebar();
  initSidebarToggle();
  initFilters();

  applySidebarIcons();
  renderSubjectTitle();
  renderHeaderIcon();

  const btnNuevo = document.getElementById('btn-nuevo');
  const btnMostrar = document.getElementById('btn-mostrar');
  if (btnNuevo) btnNuevo.addEventListener('click', nuevoEjercicio);
  if (btnMostrar) btnMostrar.addEventListener('click', mostrarRespuesta);
});
