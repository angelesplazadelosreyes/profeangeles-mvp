// src/pages/exercises.main.js
// Punto de entrada de la página exercises.html.
// Lógica principal de la página de ejercicios.

console.log('[exercises.main] cargado');

import { fetchExercise } from '../core/api.client.js';
import { MATH_OPTIONS } from '../subjects/math/options.js';
import { renderMath } from '../renderers/math.render.js';
import { drawQuadraticGraph } from '../renderers/graph.quadratic.render.js';
import {
  initSubjectsSidebar,
  initSidebarToggle,
  applySidebarIcons,
  renderSubjectTitle,
  renderHeaderIcon
} from '../ui/subjects.sidebar.js';

let lastExercise = null;

function setStatus(msg) {
  const el = document.getElementById('status');
  if (!el) return;
  el.textContent = msg || '';
}

function setLoading(isLoading) {
  const btnNuevo = document.getElementById('btn-nuevo');
  const btnMostrar = document.getElementById('btn-mostrar');

  if (btnNuevo) btnNuevo.disabled = isLoading;
  if (btnMostrar) btnMostrar.disabled = isLoading;

  // Mensaje corto visible
  setStatus(isLoading ? 'Generando…' : '');
}


/* ===========================
   Opciones (extensible)
   =========================== */
const OPTIONS = MATH_OPTIONS;

/* ===========================
   Acciones de ejercicio
   =========================== */

async function nuevoEjercicio(){
  setLoading(true);
  try{
    const tema = document.getElementById('tema').value;
    const subtema = document.getElementById('subtema').value;
    const tipo = document.getElementById('tipo').value;

    const data = await fetchExercise({
      topic: tema,
      subtopic: subtema,
      type: tipo,
    });

    lastExercise = data;

    renderMath(data.latex_enunciado, 'enunciado');
    renderMath("", 'solucion');

    // Destruir gráfico previo (crítico para evitar lentitud)
    if (window.currentChart) {
      window.currentChart.destroy();
      window.currentChart = null;
    }

    // Limpia contenedor del gráfico
    const wrap = document.querySelector('.chart-wrap');
    if (wrap) wrap.innerHTML = '';

  }catch(err){
    alert(err.message || 'Failed to fetch');
  }finally{
    setLoading(false);
  }
}

async function mostrarRespuesta(){
  setLoading(true);
  try{
    if(!lastExercise){
      const tema = document.getElementById('tema').value;
      const subtema = document.getElementById('subtema').value;
      const tipo = document.getElementById('tipo').value;

      lastExercise = await fetchExercise({
        topic: tema,
        subtopic: subtema,
        type: tipo,
      });
    }

    renderMath(lastExercise.latex_solucion, 'solucion');
    drawQuadraticGraph(lastExercise);
  }catch(err){
    alert(err.message || 'Failed to fetch');
  } finally{
    setLoading(false);
  }
  
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
