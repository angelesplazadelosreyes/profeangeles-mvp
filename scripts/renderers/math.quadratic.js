// scripts/renderers/math.quadratic.js
// Renderer 2-columnas: análisis LaTeX + gráfico.
// Si el backend trae PNG base64 (Matplotlib), lo mostramos.
// Si no, caemos a Chart.js con coeffs+graph o con data.chart.

let __id = 0;
const uid = (p = "grafico") => `${p}-${++__id}`;

function renderMathInto(el, latex){
  if (!el) return;
  el.innerHTML = latex ? `$$${latex}$$` : "";
  if (window.MathJax?.typesetPromise){
    window.MathJax.typesetPromise([el]);
  }
}

export function renderMathQuadraticAnalysis(root, data){
  if (!root) return;
  root.innerHTML = "";

  // Grid 2-col
  const grid = document.createElement("div");
  grid.className = "sol-grid";

  // Columna izquierda: LaTeX
  const left = document.createElement("div");
  left.className = "sol-col";
  const math = document.createElement("div");
  math.className = "mathjax";
  left.appendChild(math);

  // Columna derecha: figura acotada
  const right = document.createElement("div");
  right.className = "sol-col";
  const fig = document.createElement("div");
  fig.className = "sol-figure";
  right.appendChild(fig);

  grid.appendChild(left);
  grid.appendChild(right);
  root.appendChild(grid);

  // Pintar LaTeX (ahora queda a la izquierda por CSS)
  renderMathInto(math, data?.latex_solucion || "");

  // Preferimos PNG (Matplotlib) si viene del backend
  const pngB64 =
    data?.plot?.png      ||  // recomendado
    data?.chart_png      ||  // alias alterno
    null;

  if (pngB64){
    const img = document.createElement("img");
    img.alt = "Gráfico de la función cuadrática";
    img.src = `data:image/png;base64,${pngB64}`;
    fig.appendChild(img);
    return;
  }

  // Fallback a Chart.js si no hay PNG
  const canvas = document.createElement("canvas");
  canvas.id = uid();
  fig.appendChild(canvas);

  // Evitar múltiples instancias globales
  if (window.__chartInstance){ window.__chartInstance.destroy(); window.__chartInstance = null; }
  const ctx = canvas.getContext("2d");

  if (data?.chart){
    const labels = data.chart.labels || data.chart.data?.labels || [];
    const values = data.chart.values || data.chart.data?.datasets?.[0]?.data || [];
    window.__chartInstance = new Chart(ctx, {
      type: data.chart.type || "line",
      data: { labels, datasets: [{ label: data.chart.label || "f(x)", data: values }] },
      options: data.chart.options || { responsive: true, maintainAspectRatio: false }
    });
  } else if (data?.graph && data?.coeffs){
    const { x_min, x_max, step } = data.graph;
    const { a, b, c } = data.coeffs;
    const xs = [], ys = [];
    for (let x = x_min; x <= x_max; x += step){
      const xr = Number(x.toFixed(2));
      xs.push(xr);
      ys.push(a*xr*xr + b*xr + c);
    }
    window.__chartInstance = new Chart(ctx, {
      type: "line",
      data: { labels: xs, datasets: [{ label: "y = ax² + bx + c", data: ys }] },
      options: { responsive: true, maintainAspectRatio: false }
    });
  }
}
