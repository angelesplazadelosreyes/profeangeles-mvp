// /scripts/main2.js
import { fetchPlayground } from './api2.js';

let lastExercise = null;
let chart = null;

/* ===========================
   Opciones
   =========================== */
const OPTIONS = {
  "Álgebra": {
    "Función cuadrática": [
      { id: "analisis_completo", label: "Análisis completo (raíces, vértice, etc.)" }
    ]
  }
};

/* ===========================
   Utils
   =========================== */
const $ = (id) => document.getElementById(id);

function setDisabled(el, v){
  if (!el) return;
  el.disabled = !!v;
  el.ariaBusy = v ? 'true' : 'false';
}

async function typeset(...els){
  const list = els.filter(Boolean);
  if (!list.length) return;
  if (window.MathJax?.typesetPromise){
    try { await window.MathJax.typesetPromise(list); } catch {}
  }
}
function renderLatexInto(id, latex){
  const el = $(id);
  if (!el) return Promise.resolve();
  el.innerHTML = latex ? `$$${latex}$$` : "";
  return typeset(el);
}

/* ===========================
   Parse de latex_solucion
   =========================== */
/**
 * Extrae líneas marcadas con \textbf{...:} desde el bloque LaTeX.
 * Devuelve un map por etiqueta (ej. "Dominio", "Recorrido", "Forma canónica", "Forma factorizada").
 */
function parseLatexSections(latex){
  if (!latex) return {};

  // quitar \begin{aligned}...\end{aligned}
  let body = latex.replace(/\\begin\{aligned\}/, '').replace(/\\end\{aligned\}/, '');

  // separar por saltos \\[6pt] o \\ (con posibles espacios)
  const parts = body.split(/\\\\\s*(?:\[\s*\d+pt\s*\])?\s*/g).map(s => s.trim()).filter(Boolean);

  const out = {};
  for (const line of parts){
    // Captura el título en \textbf{Título:}
    const m = line.match(/\\textbf\{([^}]+):\}\s*(.+)$/);
    if (m){
      const key = m[1].trim();     // p.ej. "Dominio"
      const val = m[2].trim();     // el resto de la línea en LaTeX
      out[key] = val;
    }
  }
  return out;
}

function buildDomainRangeLatex(sec){
  const dom = sec['Dominio'] ? String.raw`\textbf{Dominio:}~${sec['Dominio']}` : '';
  const rec = sec['Recorrido'] ? String.raw`\textbf{Recorrido:}~${sec['Recorrido']}` : '';
  const glue = (dom && rec) ? String.raw` \\[6pt] ` : '';
  return dom || rec ? String.raw`\begin{aligned}${dom}${glue}${rec}\end{aligned}` : '';
}

function buildFormsLatex(sec){
  const can = sec['Forma canónica'] ? String.raw`\textbf{Forma canónica:}~${sec['Forma canónica']}` : '';
  const fac = sec['Forma factorizada'] ? String.raw`\textbf{Forma factorizada:}~${sec['Forma factorizada']}` : '';
  const glue = (can && fac) ? String.raw` \\[6pt] ` : '';
  return can || fac ? String.raw`\begin{aligned}${can}${glue}${fac}\end{aligned}` : '';
}

function graphNote(){
  return String.raw`\textit{Nota:}~La curva es la parábola; el vértice y el eje pueden destacarse.`;
}

/* ===========================
   Chart.js — cuadrática
   =========================== */
function drawQuadraticChart(data){
  const canvas = $('grafico');
  if (!canvas || !data?.graph || !data?.coeffs) return;

  const ctx = canvas.getContext('2d');
  const { x_min, x_max, step } = data.graph;
  const { a, b, c } = data.coeffs;

  const xs = [];
  const ys = [];
  for(let x = x_min; x <= x_max; x = Number((x + step).toFixed(10))){
    xs.push(Number(x.toFixed(2)));
    ys.push(a*x*x + b*x + c);
  }

  if (chart) chart.destroy();
  chart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: xs,
      datasets: [{
        label: 'y = ax² + bx + c',
        data: ys,
        pointRadius: 0,
        tension: 0.25
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: true } },
      scales: {
        x: { title: { display: true, text: 'x' }, ticks: { maxTicksLimit: 9 } },
        y: { title: { display: true, text: 'y' } }
      }
    }
  });
}

/* ===========================
   Selects
   =========================== */
function initFilters(){
  const temaSel = $('tema');
  const subtemaSel = $('subtema');
  const tipoSel = $('tipo');
  if (!temaSel || !subtemaSel || !tipoSel) return;

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
    tipoSel.innerHTML = tipos.map(o => `<option value="${o.id}">${o.label}</option>`).join('');
  }

  temaSel.addEventListener('change', refreshSubtemas);
  subtemaSel.addEventListener('change', refreshTipos);
  refreshSubtemas();
}

/* ===========================
   Acciones
   =========================== */
async function nuevoEjercicio(){
  const btnNuevo = $('btn-nuevo');
  const btnMostrar = $('btn-mostrar');

  try{
    setDisabled(btnNuevo, true);
    setDisabled(btnMostrar, true);

    const tema = $('tema')?.value || 'Álgebra';
    const subtema = $('subtema')?.value || 'Función cuadrática';
    const tipo = $('tipo')?.value || 'analisis_completo';

    const data = await fetchPlayground({ tema, subtema, tipo });
    lastExercise = data;

    await renderLatexInto('enunciado', data.latex_enunciado || '');
    await renderLatexInto('sol-func', '');
    await renderLatexInto('sol-graph', '');
    await renderLatexInto('sol-domain', '');
    await renderLatexInto('sol-forms', '');
    if (chart){ chart.destroy(); chart = null; }
  }catch(err){
    alert(err?.message || 'Failed to fetch (playground)');
  }finally{
    setDisabled(btnNuevo, false);
    setDisabled(btnMostrar, false);
  }
}

async function mostrarRespuesta(){
  const btnMostrar = $('btn-mostrar');
  try{
    setDisabled(btnMostrar, true);

    if (!lastExercise){
      await nuevoEjercicio();
      if (!lastExercise) return;
    }

    // 1) Gráfico
    if (lastExercise.graph && lastExercise.coeffs){
      drawQuadraticChart(lastExercise);
      await renderLatexInto('sol-graph', graphNote());
    }else{
      await renderLatexInto('sol-graph', String.raw`\text{No hay datos de gráfico}`);
    }

    // 2) Parse y reparto
    const sections = parseLatexSections(lastExercise.latex_solucion || '');

    // Análisis general (la solución original completa)
    await renderLatexInto('sol-func', lastExercise.latex_solucion || '');

    // Dominio/Recorrido
    await renderLatexInto('sol-domain', buildDomainRangeLatex(sections));

    // Formas
    await renderLatexInto('sol-forms', buildFormsLatex(sections));

  }catch(err){
    alert(err?.message || 'Failed to fetch (playground)');
  }finally{
    setDisabled(btnMostrar, false);
  }
}

/* ===========================
   Sidebar + header icons
   =========================== */
const SUBJECT_ICONS = {
  matematicas: `
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <rect x="3" y="3" rx="4" width="18" height="18" fill="#FFD400" stroke="#1d2b2f" stroke-width="1.5"/>
      <path d="M8 16l4-8 4 8M10 12h4" stroke="#1d2b2f" stroke-width="1.8" fill="none"
            stroke-linecap="round" stroke-linejoin="round"/>
    </svg>`,
  quimica: `
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <rect x="3" y="3" rx="4" width="18" height="18" fill="#FF8A00" stroke="#1d2b2f" stroke-width="1.5"/>
      <path d="M10 7h4M12 7v3l3 5a3 3 0 0 1-3 3h-2a3 3 0 0 1-3-3l3-5V7"
            stroke="#1d2b2f" stroke-width="1.8" fill="none"
            stroke-linecap="round" stroke-linejoin="round"/>
    </svg>`,
  biologia: `
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <rect x="3" y="3" rx="4" width="18" height="18" fill="#00D48B" stroke="#1d2b2f" stroke-width="1.5"/>
      <path d="M7 15c0-4 5-7 10-6 2 1 2 6-2 8-4 2-7 1-8-2Z"
            stroke="#1d2b2f" stroke-width="1.8" fill="none" stroke-linejoin="round"/>
      <path d="M8.5 15c3.5-1 6-2.5 8.5-5"
            stroke="#1d2b2f" stroke-width="1.8" fill="none" stroke-linecap="round"/>
    </svg>`,
  fisica: `
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <rect x="3" y="3" rx="4" width="18" height="18" fill="#9B5DE5" stroke="#1d2b2f" stroke-width="1.5"/>
      <ellipse cx="12" cy="12" rx="6.5" ry="3" fill="none" stroke="#1d2b2f" stroke-width="1.8"/>
      <ellipse cx="12" cy="12" rx="6.5" ry="3" transform="rotate(60 12 12)" fill="none" stroke="#1d2b2f" stroke-width="1.8"/>
      <ellipse cx="12" cy="12" rx="6.5" ry="3" transform="rotate(-60 12 12)" fill="none" stroke="#1d2b2f" stroke-width="1.8"/>
      <circle cx="12" cy="12" r="1.6" fill="#1d2b2f" stroke="none"/>
    </svg>`
};

function subjectKeyFromText(txt){
  const s = (txt||'').toLowerCase();
  if (s.includes('matem')) return 'matematicas';
  if (s.includes('quím') || s.includes('quimi')) return 'quimica';
  if (s.includes('biol')) return 'biologia';
  if (s.includes('fís') || s.includes('fis')) return 'fisica';
  return 'matematicas';
}
function getCurrentSubjectKey(){
  const active = document.querySelector('.subjects__item[aria-current="page"]');
  const name = active?.getAttribute('data-subject') || active?.textContent || '';
  return subjectKeyFromText(name);
}
function applySidebarIcons(){
  document.querySelectorAll('.subjects__item').forEach(li=>{
    const name = li.getAttribute('data-subject') || li.textContent || '';
    const key = subjectKeyFromText(name);
    const box = li.querySelector('.subjects__icon');
    if (box && SUBJECT_ICONS[key]) box.innerHTML = SUBJECT_ICONS[key];
  });
}
function renderHeaderIcon(){
  const holder = document.querySelector('.subject-icon-header');
  if (!holder) return;
  const key = getCurrentSubjectKey();
  holder.innerHTML = SUBJECT_ICONS[key] || '';
}
function renderSubjectTitle(){
  const span = $('subject-name');
  if (!span) return;
  const active = document.querySelector('.subjects__item[aria-current="page"]');
  const name = active?.getAttribute('data-subject') || active?.textContent?.trim() || 'Matemáticas';
  span.textContent = name;
}

/* ===========================
   Sidebar & toggle
   =========================== */
function initSubjectsSidebar(){
  const list = $('subjects');
  if (!list) return;
  const items = Array.from(list.querySelectorAll('.subjects__item'));

  function setActive(item){
    if (item.getAttribute('aria-disabled') === 'true') return;
    items.forEach(i => i.removeAttribute('aria-current'));
    item.setAttribute('aria-current', 'page');
    renderSubjectTitle();
    renderHeaderIcon();
  }
  function handleActivate(e){
    if (e.type === 'keydown' && !(e.key === 'Enter' || e.key === ' ')) return;
    e.preventDefault(); setActive(e.currentTarget);
  }
  items.forEach(item => {
    item.addEventListener('click', handleActivate);
    item.addEventListener('keydown', handleActivate);
  });
}

function initSidebarToggle(){
  const btn = $('toggle-subjects');
  const sidebar = $('sidebar');
  const list = $('subjects');
  if (!btn || !sidebar || !list) return;

  function setOpen(open){
    if (open){
      sidebar.classList.add('is-open'); btn.setAttribute('aria-expanded','true');
    }else{
      sidebar.classList.remove('is-open'); btn.setAttribute('aria-expanded','false');
    }
  }
  btn.addEventListener('click', ()=>{
    const isOpen = sidebar.classList.contains('is-open');
    setOpen(!isOpen);
  });
  list.addEventListener('click', ()=>{
    if (window.matchMedia('(max-width: 768px)').matches) setOpen(false);
  });
  document.addEventListener('click', (e)=>{
    if (!window.matchMedia('(max-width: 768px)').matches) return;
    const inside = sidebar.contains(e.target) || btn.contains(e.target);
    if (!inside) setOpen(false);
  });
}

/* ===========================
   Boot
   =========================== */
window.addEventListener('DOMContentLoaded', ()=>{
  initSubjectsSidebar();
  initSidebarToggle();
  initFilters();

  applySidebarIcons();
  renderSubjectTitle();
  renderHeaderIcon();

  $('btn-nuevo')?.addEventListener('click', nuevoEjercicio);
  $('btn-mostrar')?.addEventListener('click', mostrarRespuesta);
});
