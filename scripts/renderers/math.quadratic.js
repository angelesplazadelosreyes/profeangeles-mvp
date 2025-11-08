// scripts/renderers/math.quadratic.js
// Renderer 2-columnas: análisis LaTeX + gráfico.
// Si el backend trae PNG base64 (Matplotlib), lo mostramos.
// Si no, caemos a Chart.js con coeffs+graph o con data.chart.

let __id = 0;
const uid = (p = "grafico") => `${p}-${++__id}`;

function renderMathInto(el, latex, opts = {}){
  if (!el) return;

  const { raw = false, wrapClass = "", display = true } = opts;

  // Si raw=false, agregamos delimitadores; si raw=true, asumimos que el string ya viene con \[...\] o \(...\)
  let body = "";
  if (latex) {
    body = raw ? latex : (display ? `\\[${latex}\\]` : `\\(${latex}\\)`);
  }

  el.innerHTML = wrapClass ? `<div class="${wrapClass}">${body}</div>` : body;

  if (window.MathJax?.typesetPromise){
    return MathJax.typesetPromise([el]);
  }
}


// === Helpers: decimales -> fracciones LaTeX ===
function decimalToFraction(x, maxDen = 12) {
  // enteros tal cual
  if (!Number.isFinite(x)) return null;
  if (Math.abs(x - Math.round(x)) < 1e-12) return { num: Math.round(x), den: 1 };

  const sign = x < 0 ? -1 : 1;
  let a = Math.abs(x);

  // búsqueda de mejor fracción con denominador acotado
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
  // maneja signo en el numerador
  return `\\frac{${num}}{${den}}`;
}

function replaceDecimalsInLatex(latex, { maxDen = 12 } = {}) {
  if (!latex) return latex;

  // Reemplaza tokens tipo -12.5, 0.333..., 2.75, etc.
  // Evita tocar números pegados a comandos (\sin0.5), variables (x0.5) o dentro de \frac{...}{...}
  return latex.replace(/-?\d+\.\d+/g, (m, idx) => {
    // No reemplazar si viene justo después de una letra o una barra invertida
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

  // Grid 2-col
  const grid = document.createElement("div");
  grid.className = "sol-grid";

  // Columna izquierda: LaTeX
  const left = document.createElement("div");
  left.className = "sol-col";
  const math = document.createElement("div");
  math.className = "solution-math";
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
  function renderSolutionLines(container, latexRaw){
    if (!container) return;
    if (!latexRaw) { container.innerHTML = ""; return; }

    // 1) quitar \[ ... \] si vienen
    let s = latexRaw.trim()
      .replace(/^\\\[((?:.|\n)*)\\\]$/,'$1')
      .replace(/\\begin\{aligned\}/g,'')
      .replace(/\\end\{aligned\}/g,'');

    // 2) quitar \begin{aligned} ... \end{aligned}
    s = s
      .replace(/\\\]\s*/g, '\n')   
      .replace(/\s*\\\[/g, '\n');

    // 3) separar por los saltos \\[6pt] (tolerante a espacios)
    const parts = s.split(/(?:\\\\\s*(?:\[\s*6pt\s*\])?|\n)+/g)
                  .map(t => t.trim())
                  .filter(Boolean);

    // 4) limpiar y pintar cada línea como display independiente
    // 4) limpiar y pintar cada línea como display independiente
    container.innerHTML = "";
    for (let part of parts){             // 👈 antes decía const
      part = part.replace(/^\\\[/, "").replace(/\\\]$/, "").trim();

      const line = document.createElement("div");
      line.className = "solution-math";
      container.appendChild(line);

      // le pasamos ya envuelto en display; raw:true para no re-envolver
      renderMathInto(line, `\\[${part}\\]`, { raw:true });
    }
  }


  const _latex = replaceDecimalsInLatex(data?.latex_solucion || "", { maxDen: 12 });
  renderSolutionLines(math, _latex);



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
  canvas.className = "sol-chart"; 
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
