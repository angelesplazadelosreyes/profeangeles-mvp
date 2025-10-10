let lastExercise = null;
let chart = null;

// === Opciones (extensible) ===
const OPTIONS = {
  "Álgebra": {
    "Función cuadrática": [
      { id: "analisis_completo", label: "Análisis completo (raíces, vértice, etc.)" }
    ]
  }
};

// === Utils ===
function renderMath(latex, elId){
  const el = document.getElementById(elId);
  if (!el) return; // evita error si el elemento no existe
  el.innerHTML = latex ? `$$${latex}$$` : "";
  if (window.MathJax?.typesetPromise){
    window.MathJax.typesetPromise([el]);
  }
}

function buildApiUrl(){
  const tema = document.getElementById('tema').value;
  const subtema = document.getElementById('subtema').value;
  const tipo = document.getElementById('tipo').value;

  // Local: usa Flask en tu PC. Producción: usa Render.
  const isLocal = location.hostname === 'localhost' || location.hostname === '127.0.0.1';
  const PROD_API = 'https://profeangeles-mvp.onrender.com'; // ← tu URL de Render
  const base = isLocal ? 'http://localhost:5000' : PROD_API;

  const url = new URL('/api/generate-exercise', base);
  url.searchParams.set('topic', tema);
  url.searchParams.set('subtopic', subtema);
  url.searchParams.set('type', tipo);
  return url.toString();
}


// Helper: reintenta ante 503 / errores de red (cold start Render)
async function fetchWithRetry(url, opts = {}, retries = 2, delayMs = 1500) {
  try {
    const res = await fetch(url, opts);
    if (res.status === 503 && retries > 0) {
      await new Promise(r => setTimeout(r, delayMs));
      return fetchWithRetry(url, opts, retries - 1, delayMs * 1.5);
    }
    return res;
  } catch (err) {
    if (retries > 0) {
      await new Promise(r => setTimeout(r, delayMs));
      return fetchWithRetry(url, opts, retries - 1, delayMs * 1.5);
    }
    throw err;
  }
}

async function fetchEjercicio(){
  const res = await fetchWithRetry(buildApiUrl(), { method: 'GET' }, 2, 1200);
  if(!res.ok) throw new Error(`Error API (${res.status})`);
  return await res.json();
}


// === Acciones ===
async function nuevoEjercicio(){
  try{
    const data = await fetchEjercicio();
    lastExercise = data;

    // ✅ mostrar enunciado del nuevo ejercicio
    renderMath(data.latex_enunciado, 'enunciado');

    // limpiar solución y gráfico anteriores
    renderMath("", 'solucion');
    if (chart){ chart.destroy(); chart = null; }
  }catch(err){
    alert(err.message);
  }
}


async function mostrarRespuesta(){
  try{
    if(!lastExercise){
      lastExercise = await fetchEjercicio();
      // renderMath(lastExercise.latex_enunciado, 'enunciado'); // opcional si vuelves a mostrar enunciado
    }
    renderMath(lastExercise.latex_solucion, 'solucion');
    dibujarGrafico(lastExercise);
  }catch(err){
    alert(err.message);
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

// === Filtros ===
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

window.addEventListener('DOMContentLoaded', ()=>{
  initFilters();
  document.getElementById('btn-nuevo').addEventListener('click', nuevoEjercicio);
  document.getElementById('btn-mostrar').addEventListener('click', mostrarRespuesta);
});
