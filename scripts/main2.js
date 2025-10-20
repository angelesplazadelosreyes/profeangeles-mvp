// /scripts/main2.js
// Lógica de exercises2 usando la API de playground
import { fetchPlayground } from './api2.js';

let lastExercise = null;
let chart = null;

// Reutilizamos helpers mínimos (idénticos a tu main.js)
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
      labels: labels,
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

// Si tu playground devuelve el mismo formato que prod (coeffs + graph), usamos esta función:
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

async function nuevoEjercicio(){
  try{
    // puedes leer selects como en tu main.js si ya están poblados
    const tema = document.getElementById('tema')?.value || 'Álgebra';
    const subtema = document.getElementById('subtema')?.value || 'Función cuadrática';
    const tipo = document.getElementById('tipo')?.value || 'analisis_completo';

    const data = await fetchPlayground({
      tema: tema, subtema: subtema, tipo: tipo
    });
    lastExercise = data;

    // Muestra enunciado y limpia solución previa
    renderMath(data.latex_enunciado || '', 'enunciado');
    renderMath('', 'solucion');

    // Limpia gráfico anterior
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
    // Muestra solución
    renderMath(lastExercise.latex_solucion || '', 'solucion');

    // Dibuja gráfico según lo que devuelva el playground:
    if (lastExercise.chart){             // variante “simple”
      dibujarGraficoDesdeChartObj(lastExercise.chart);
    } else if (lastExercise.graph && lastExercise.coeffs){ // formato “prod”
      dibujarGraficoCuadratica(lastExercise);
    }
  }catch(err){
    alert(err.message || 'Failed to fetch (playground)');
  }
}

function wireUI(){
  const btnNuevo = document.getElementById('btn-nuevo');
  const btnMostrar = document.getElementById('btn-mostrar');
  if (btnNuevo) btnNuevo.addEventListener('click', nuevoEjercicio);
  if (btnMostrar) btnMostrar.addEventListener('click', mostrarRespuesta);
}

window.addEventListener('DOMContentLoaded', wireUI);
