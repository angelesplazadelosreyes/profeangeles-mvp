// src/renderers/math.quadratic.render.js
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

// === Helpers: decimales -> fracciones LaTeX ===
function decimalToFraction(x, maxDen = 12) {
  if (!Number.isFinite(x)) return null;
  if (Math.abs(x - Math.round(x)) < 1e-12) return { num: Math.round(x), den: 1 };

  const sign = x < 0 ? -1 : 1;
  let a = Math.abs(x);

  let best = { num: Math.round(a), den: 1, err: Math.abs(a - Math.round(a)) };
  for (let den = 2; den <= maxDen; den++) {
    const num = Math.round(a * den);
    const val = num / den;
    const err = Math.abs(a - val);
    if (err < best.err - 1e-12) best = { num, den, err };
  }
  best.num *= sign;
  return { num: best.num, den: best.den };
}

function toLatexFraction(num, den) {
  if (den === 1) return String(num);
  return `\\frac{${num}}{${den}}`;
}

function replaceDecimalsInLatex(latex, { maxDen = 12 } = {}) {
  if (!latex) return latex;

  return latex.replace(/-?\d+\.\d+/g, (m, idx) => {
    const prev = idx > 0 ? latex[idx - 1] : '';
    if ((prev >= 'a' && prev <= 'z') || (prev >= 'A' && prev <= 'Z') || prev === '\\') return m;

    const val = parseFloat(m);
    const frac = decimalToFraction(val, maxDen);
    if (!frac) return m;
    return toLatexFraction(frac.num, frac.den);
  });
}

export function renderMathQuadraticAnalysis(root, data){
  if (!root) return;
  root.innerHTML = "";

  const grid = document.createElement("div");
  grid.className = "sol-grid";

  const left = document.createElement("div");
  left.className = "sol-col";
  const math = document.createElement("div");
  math.className = "solution-math";
  left.appendChild(math);

  const right = document.createElement("div");
  right.className = "sol-col";
  const fig = document.createElement("div");
  fig.className = "sol-figure";
  right.appendChild(fig);

  grid.appendChild(left);
  grid.appendChild(right);
  root.appendChild(grid);

  const _latex = replaceDecimalsInLatex(data?.latex_solucion || "", { maxDen: 12 });
  renderMathInto(math, _latex);

  const pngB64 = data?.plot?.png || data?.chart_png || null;

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
  canvas.className = "sol-chart"; // ✅ AQUÍ va el cambio
  fig.appendChild(canvas);

  if (window.__chartInstance){
    window.__chartInstance.destroy();
    window.__chartInstance = null;
  }
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
