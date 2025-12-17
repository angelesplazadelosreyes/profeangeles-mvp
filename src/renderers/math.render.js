// src/renderers/math.render.js
// Renderiza expresiones LaTeX en un elemento usando MathJax 3.

export function renderMath(latex, elId) {
  const el = document.getElementById(elId);
  if (!el) return;

  el.innerHTML = latex ? `$$${latex}$$` : "";

  if (window.MathJax?.typesetPromise) {
    window.MathJax.typesetPromise([el]);
  }
}
