// src/renderers/quadratic.solution.render.js
// Renderiza solución (LaTeX) + gráfico dentro de un root (solution-root)

import { renderMath } from './math.render.js';
import { drawQuadraticGraph } from './graph.quadratic.render.js';

export function renderQuadraticSolution(root, data) {
  if (!root) return;

  // Limpia todo lo previo
  root.innerHTML = '';

  // 1) Bloque texto solución
  const solDiv = document.createElement('div');
  solDiv.id = 'solucion'; // reutilizamos tu renderMath sin cambiarlo ahora
  root.appendChild(solDiv);

  // 2) Bloque gráfico
  const chartDiv = document.createElement('div');
  chartDiv.className = 'chart-wrap';
  root.appendChild(chartDiv);

  // Render
  renderMath(data?.latex_solucion || '', 'solucion');
  drawQuadraticGraph(data);
}
