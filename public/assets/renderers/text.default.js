// scripts/renderers/text.default.js
// Renderer 1-columna: solo LaTeX/texto

function renderMathInto(el, latex){
  if (!el) return;
  el.innerHTML = latex ? `$$${latex}$$` : "";
  if (window.MathJax?.typesetPromise){
    window.MathJax.typesetPromise([el]);
  }
}

export function renderTextOnly(root, data){
  if (!root) return;
  root.innerHTML = "";

  const col = document.createElement("div");
  col.className = "sol-col";

  const math = document.createElement("div");
  math.className = "mathjax";

  col.appendChild(math);
  root.appendChild(col);

  renderMathInto(math, data?.latex_solucion || "");
}
