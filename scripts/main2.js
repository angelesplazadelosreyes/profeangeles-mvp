// /scripts/main2.js
// Lógica de exercises2 usando la API de playground
import { fetchPlayground } from './api2.js';

let lastExercise = null;
let chart = null;

/* ===========================
   Opciones (mínimas para tests)
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

// Dibuja el gráfico si el backend envía datos estilo {chart:{labels, values}}
function dibujarGraficoDesdeChartObj(chartObj){
  const canvas = document.getElementById('grafico');
  if (!canvas || !chartObj) return;
  const ctx = canvas.getContext('2d');

  const labels = chartObj.labels || [];
  const values = chartObj.values || [];

  if (chart) chart.destroy();
  chart = new Chart(ctx, {
    type: chartObj.type || 'line',
    data: {
      labels,
      datasets: [{ label: chartObj.label || 'f(x)', data: values }]
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

// Si el playground devuelve el mismo formato que prod (coeffs + graph)
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

/* ===========================
   Filtros (poblar selects)
   =========================== */
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

  // Primera carga
  refreshSubtemas();
}

/* ===========================
   Acciones
   =========================== */
async function nuevoEjercicio(){
  try{
    const tema = document.getElementById('tema')?.value || 'Álgebra';
    const subtema = document.getElementById('subtema')?.value || 'Función cuadrática';
    const tipo = document.getElementById('tipo')?.value || 'analisis_completo';

    const data = await fetchPlayground({ tema, subtema, tipo });
    lastExercise = data;

    renderMath(data.latex_enunciado || '', 'enunciado');
    renderMath('', 'solucion');

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
    renderMath(lastExercise.latex_solucion || '', 'solucion');

    if (lastExercise.chart){
      dibujarGraficoDesdeChartObj(lastExercise.chart);
    } else if (lastExercise.graph && lastExercise.coeffs){
      dibujarGraficoCuadratica(lastExercise);
    }
  }catch(err){
    alert(err.message || 'Failed to fetch (playground)');
  }
}

/* ===========================
   Boot
   =========================== */
function wireUI(){
  const btnNuevo = document.getElementById('btn-nuevo');
  const btnMostrar = document.getElementById('btn-mostrar');
  if (btnNuevo) btnNuevo.addEventListener('click', nuevoEjercicio);
  if (btnMostrar) btnMostrar.addEventListener('click', mostrarRespuesta);
}

window.addEventListener('DOMContentLoaded', ()=>{
  initFilters();
  wireUI();
});
