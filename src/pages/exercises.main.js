// src/pages/exercises.main.js

console.log('[exercises.main] cargado');

import { fetchExercise } from '../core/api.client.js';
import { MATH_OPTIONS } from '../subjects/math/options.js';
import { renderMath } from '../renderers/math.render.js';
import { selectRendererKey, loadRenderer } from '../renderers/registry.js';
import {
  initSubjectsSidebar,
  initSidebarToggle,
  applySidebarIcons,
  renderSubjectTitle,
  renderHeaderIcon
} from '../ui/subjects.sidebar.js';

let lastExercise = null;
let chartInstance = null;

/* ===========================
   Opciones (extensible)
   =========================== */
const OPTIONS = MATH_OPTIONS;

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

  setStatus(isLoading ? 'Generando… Paciencia, a veces demora un poco en cargar' : '');
}

/* ===================================================
   Chart: referencia compartida (compat con renderers)
   =================================================== */

function ensureSharedChartRef() {
  if (Object.getOwnPropertyDescriptor(window, '__chartInstance')) return;

  Object.defineProperty(window, '__chartInstance', {
    get() { return chartInstance; },
    set(v) { chartInstance = v; },
    configurable: true
  });
}

function destroyAnyChart() {
  // (1) nuestro puntero local
  if (chartInstance) { chartInstance.destroy(); chartInstance = null; }

  // (2) renderers tipo exercises2
  if (window.__chartInstance) { window.__chartInstance.destroy(); window.__chartInstance = null; }

  // (3) legado (por si quedó algo viejo)
  if (window.currentChart) { window.currentChart.destroy(); window.currentChart = null; }
}

function clearExerciseUI() {
  // 1) Limpiar enunciado
  const enunciado = document.getElementById('enunciado');
  if (enunciado) enunciado.innerHTML = '';

  // 2) Limpiar solución
  const solRoot = document.getElementById('solution-root');
  if (solRoot) solRoot.innerHTML = '';

  // 3) Destruir gráficos
  destroyAnyChart();

  // 4) Limpiar estado (opcional, pero prolijo)
  setStatus('');
}



/* ===================================================
   Solution mounting (único contenedor: #solution-root)
   =================================================== */

async function mountSolution(data) {
  const root = document.getElementById('solution-root');
  if (!root) return;

  ensureSharedChartRef();
  destroyAnyChart();
  root.innerHTML = '';

  const key = selectRendererKey(data);
  const renderFn = await loadRenderer(key);
  renderFn(root, data);
}

/* ===========================
   Acciones de ejercicio
   =========================== */

function renderLatexBlocks(containerId, blocks) {
  const el = document.getElementById(containerId);
  if (!el) return;

  el.innerHTML = "";

  for (const latex of blocks) {
    const line = document.createElement("div");
    line.className = "latex-line";
    line.innerHTML = latex ? `$$${latex}$$` : "";
    el.appendChild(line);
  }

  if (window.MathJax?.typesetPromise) {
    window.MathJax.typesetPromise([el]);
  }
}

function splitEnunciado3Lines(latexEnunciado) {
  if (!latexEnunciado) return null;

  // 1) separar pista si viene con \\[4pt]
  const parts = latexEnunciado.split("\\\\[4pt]");
  const main = (parts[0] || "").trim();
  const hint = (parts[1] || "").trim();

  // 2) dentro del main, separar texto vs "f(x) = ..."
  const marker = "f(x) =";
  const idx = main.indexOf(marker);

  // si no encontramos el patrón, devolvemos un bloque único
  if (idx === -1) {
    return [main, hint].filter(Boolean);
  }

  const line1 = main.slice(0, idx).trim().replace(/~\s*$/, "");
  const line2 = main.slice(idx).trim();

  // 3 líneas: texto, función, pista (si existe)
  const out = [];
  if (line1) out.push(line1);
  if (line2) out.push(line2);
  if (hint) out.push(hint);
  return out;
}


async function nuevoEjercicio() {
  clearExerciseUI();
  setLoading(true);
  try {
    const tema = document.getElementById('tema').value;
    const subtema = document.getElementById('subtema').value;
    const tipo = document.getElementById('tipo').value;

    const data = await fetchExercise({
      topic: tema,
      subtopic: subtema,
      type: tipo,
    });

    lastExercise = data;

    const blocks = splitEnunciado3Lines(data?.latex_enunciado || "");
    if (blocks) {
      renderLatexBlocks("enunciado", blocks);
    } else {
      renderMath("", "enunciado");
    }


    const solRoot = document.getElementById('solution-root');
    if (solRoot) solRoot.innerHTML = '';

    destroyAnyChart();
  } catch (err) {
    alert(err.message || 'Failed to fetch');
  } finally {
    setLoading(false);
  }
}

async function mostrarRespuesta() {
  setLoading(true);
  try {
    if (!lastExercise) {
      const tema = document.getElementById('tema').value;
      const subtema = document.getElementById('subtema').value;
      const tipo = document.getElementById('tipo').value;

      lastExercise = await fetchExercise({
        topic: tema,
        subtopic: subtema,
        type: tipo,
      });
    }

    await mountSolution(lastExercise);
  } catch (err) {
    alert(err.message || 'Failed to fetch');
  } finally {
    setLoading(false);
  }
}

/* ===========================
   Filtros
   =========================== */

function initFilters() {
  const temaSel = document.getElementById('tema');
  const subtemaSel = document.getElementById('subtema');
  const tipoSel = document.getElementById('tipo');

  temaSel.innerHTML = Object.keys(OPTIONS).map(t => `<option value="${t}">${t}</option>`).join('');

  function refreshSubtemas() {
    const t = temaSel.value;
    const subs = Object.keys(OPTIONS[t] || {});
    subtemaSel.innerHTML = subs.map(s => `<option value="${s}">${s}</option>`).join('');
    refreshTipos();
  }

  function refreshTipos() {
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

window.addEventListener('DOMContentLoaded', () => {
  initSubjectsSidebar();
  initSidebarToggle();
  initFilters();

  applySidebarIcons();
  renderSubjectTitle();
  renderHeaderIcon();

  document.getElementById('btn-nuevo').addEventListener('click', nuevoEjercicio);
  document.getElementById('btn-mostrar').addEventListener('click', mostrarRespuesta);
});
