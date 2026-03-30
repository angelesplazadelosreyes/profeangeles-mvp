// nextjs/lib/renderers/math.quadratic.renderer.ts

import { ExerciseResponse } from '@/lib/api.client';

let __id = 0;
const uid = (p = 'grafico') => `${p}-${++__id}`;

function renderMathInto(el: HTMLElement, latex: string): void {
  el.innerHTML = latex ? `$$${latex}$$` : '';
  window.MathJax?.typesetPromise([el]);
}

// ── Decimales → fracciones LaTeX ─────────────────────────────────────────

function decimalToFraction(x: number, maxDen = 12): { num: number; den: number } | null {
  if (!Number.isFinite(x)) return null;
  if (Math.abs(x - Math.round(x)) < 1e-12) return { num: Math.round(x), den: 1 };

  const sign = x < 0 ? -1 : 1;
  const a = Math.abs(x);

  let best = { num: Math.round(a), den: 1, err: Math.abs(a - Math.round(a)) };
  for (let den = 2; den <= maxDen; den++) {
    const num = Math.round(a * den);
    const val = num / den;
    const err = Math.abs(a - val);
    if (err < best.err - 1e-12) best = { num, den, err };
  }
  return { num: best.num * sign, den: best.den };
}

function toLatexFraction(num: number, den: number): string {
  if (den === 1) return String(num);
  return `\\frac{${num}}{${den}}`;
}

function replaceDecimalsInLatex(latex: string, maxDen = 12): string {
  if (!latex) return latex;
  return latex.replace(/-?\d+\.\d+/g, (m, idx) => {
    const prev = idx > 0 ? latex[idx - 1] : '';
    const isLetter = /[A-Za-z]/.test(prev);
    if (prev === '\\') return m;
    if (isLetter && !m.startsWith('-')) return m;
    const val = parseFloat(m);
    const frac = decimalToFraction(val, maxDen);
    if (!frac) return m;
    return toLatexFraction(frac.num, frac.den);
  });
}

function sanitizeLatexColors(latex: string): string {
  if (!latex) return latex;
  let s = latex;
  s = s.replace(/\\color\s+([a-zA-Z]+)\b/g, '\\color{$1}');
  s = s.replace(
    /\\color\{([a-zA-Z]+)\}([^\n\r]*?)(?=(\\\\\[6pt\]|\\\\|$))/g,
    (m, color, rest) => {
      if (m.startsWith('{\\color')) return m;
      return `{\\color{${color}}${rest}}`;
    }
  );
  s = s.replace(/\\color[a-zA-Z]+/g, '');
  return s;
}

function stripAlignedWrapper(latex: string): string {
  let s = (latex ?? '').trim();
  s = s.replace(/^\\begin\{aligned\}/, '');
  s = s.replace(/\\end\{aligned\}$/, '');
  return s.trim();
}

function wrapAligned(body: string): string {
  return `\\begin{aligned}${(body ?? '').trim()}\\end{aligned}`;
}

// ── Renderer principal ────────────────────────────────────────────────────

export function renderMathQuadraticAnalysis(
  root: HTMLElement,
  data: ExerciseResponse
): void {
  root.innerHTML = '';

  const etype =
    (data?.meta as Record<string, unknown> | undefined)?.filters &&
    ((data.meta as Record<string, unknown>).filters as Record<string, string>)?.type
      ? ((data.meta as Record<string, unknown>).filters as Record<string, string>).type
      : (data?.type as string | undefined) ?? 'analisis_completo';

  const isConversion =
    etype === 'convert_factorizada_a_general_y_canonica' ||
    etype === 'convert_canonica_a_general_y_factorizada';

  const grid = document.createElement('div');
  grid.className = isConversion ? 'sol-grid sol-grid--single' : 'sol-grid';

  const latexRaw = sanitizeLatexColors(
    replaceDecimalsInLatex((data?.latex_solucion as string) ?? '')
  );
  const body = stripAlignedWrapper(latexRaw);
  const parts = body.split('\\\\[6pt]').map((s) => s.trim()).filter(Boolean);

  const pngB64 = (data?.plot as Record<string, string> | undefined)?.png ?? null;

  // ── MODO CONVERSIÓN: 1 columna ──────────────────────────────────────────
  if (isConversion) {
    const sol = document.createElement('div');
    sol.className = 'sol-col area-conv-text';

    const solMath = document.createElement('div');
    solMath.className = 'solution-math';
    sol.appendChild(solMath);
    renderMathInto(solMath, wrapAligned(parts.join('\\\\[6pt]')));

    const figWrap = document.createElement('div');
    figWrap.className = 'sol-col area-full area-full-figure';

    const fig = document.createElement('div');
    fig.className = 'sol-figure sol-figure--below';

    const caption = document.createElement('div');
    caption.className = 'sol-figure-title';
    caption.textContent = 'Gráfico de la función';
    fig.appendChild(caption);

    figWrap.appendChild(fig);
    grid.appendChild(sol);
    grid.appendChild(figWrap);
    root.appendChild(grid);

    if (pngB64) {
      const img = document.createElement('img');
      img.alt = 'Gráfico de la función cuadrática';
      img.src = `data:image/png;base64,${pngB64}`;
      fig.appendChild(img);
      return;
    }

    mountChartJs(fig, data);
    return;
  }

  // ── MODO ANÁLISIS COMPLETO: 2 columnas ─────────────────────────────────
  const left = document.createElement('div');
  left.className = 'sol-col area-left1';
  const math = document.createElement('div');
  math.className = 'solution-math';
  left.appendChild(math);

  const right = document.createElement('div');
  right.className = 'sol-col area-right1';
  const fig = document.createElement('div');
  fig.className = 'sol-figure';
  right.appendChild(fig);

  const full = document.createElement('div');
  full.className = 'sol-col area-full';

  grid.appendChild(left);
  grid.appendChild(right);
  grid.appendChild(full);
  root.appendChild(grid);

  const mainBody = parts.slice(0, -2).join('\\\\[6pt]');
  const tailBody = parts.slice(-2).join('\\\\[6pt]');

  renderMathInto(math, wrapAligned(mainBody));

  const fullMath = document.createElement('div');
  fullMath.className = 'solution-math';
  full.appendChild(fullMath);
  renderMathInto(fullMath, wrapAligned(tailBody));

  if (pngB64) {
    const img = document.createElement('img');
    img.alt = 'Gráfico de la función cuadrática';
    img.src = `data:image/png;base64,${pngB64}`;
    fig.appendChild(img);
    return;
  }

  mountChartJs(fig, data);
}

// ── Chart.js fallback ─────────────────────────────────────────────────────

function mountChartJs(fig: HTMLElement, data: ExerciseResponse): void {
  const canvas = document.createElement('canvas');
  canvas.id = uid();
  canvas.className = 'sol-chart';
  fig.appendChild(canvas);

  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const graph = data?.graph as
    | { x_min: number; x_max: number; step: number }
    | undefined;
  const coeffs = data?.coeffs as
    | { a: number; b: number; c: number }
    | undefined;

  if (graph && coeffs) {
    const { x_min, x_max, step } = graph;
    const { a, b, c } = coeffs;
    const xs: number[] = [];
    const ys: number[] = [];
    for (let x = x_min; x <= x_max; x += step) {
      const xr = Number(x.toFixed(2));
      xs.push(xr);
      ys.push(a * xr * xr + b * xr + c);
    }

    // Chart es una global cargada desde CDN
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    new (window as any).Chart(ctx, {
      type: 'line',
      data: {
        labels: xs,
        datasets: [{ label: 'y = ax² + bx + c', data: ys }],
      },
      options: { responsive: true, maintainAspectRatio: false },
    });
  }
}