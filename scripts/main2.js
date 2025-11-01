// /scripts/main2.js
import { fetchPlayground } from './api2.js';

let lastExercise = null;
let chart = null;

/* Opciones */
const OPTIONS = {
  "Álgebra": {
    "Función cuadrática": [
      { id: "analisis_completo", label: "Análisis completo (raíces, vértice, etc.)" }
    ]
  }
};

/* Utils */
function renderMath(latex, elId){
  const el = document.getElementById(elId);
  if (!el) return;
  el.innerHTML = latex ? `$$${latex}$$` : "";
  if (window.MathJax?.typesetPromise){ window.MathJax.typesetPromise([el]); }
}

/* Split del LaTeX en secciones (robusto a saltos y espacios) */
function splitSolutionLatex(latex){
  const out = { primaria:"", domran:"", formas:"" };

  if (!latex){ return out; }

  // Tomamos el contenido dentro de \begin{aligned} ... \end{aligned}
  const m = latex.match(/\\begin{aligned}([\s\S]*?)\\end{aligned}/);
  const body = m ? m[1] : latex;

  // Cortamos por saltos \\[...] y limpiamos
  const parts = body.split(/\\\\\s*\[\d+pt\]\s*|\\\\\s*/).map(s => s.trim()).filter(Boolean);

  const keep = [];
  const domran = [];
  const formas = [];

  for(const line of parts){
    if (/\\textbf\{Dominio/.test(line) || /\\textbf\{Recorrido/.test(line)){
      domran.push(line);
    } else if (/\\textbf\{Forma can[oó]nica/.test(line) || /\\textbf\{Forma factorizada/.test(line)){
      formas.push(line);
    } else {
      keep.push(line);
    }
  }

  const join = arr => arr.length ? arr.join(r" \\[6pt] ") : "";

  out.primaria = join(keep);
  out.domran   = join(domran);
  out.formas   = join(formas);

  // Si por alguna razón no se detectó nada, devolvemos todo en primaria
  if (!out.primaria && (out.domran || out.formas)){
    // ok
  } else if (!out.primaria && !out.domran && !out.formas){
    out.primaria = body;
  }
  return out;
}

/* Chart.js */
function dibujarGraficoCuadratica(data){
  const canvas = document.getElementById('grafico');
  if (!canvas || !data?.graph || !data?.coeffs) return;
  const ctx = canvas.getContext('2d');

  const { x_min, x_max, step } = data.graph;
  const { a, b, c } = data.coeffs;

  const xs = [], ys = [];
  for(let x = x_min; x <= x_max; x += step){
    xs.push(Number(x.toFixed(2)));
    ys.push(a*x*x + b*x + c);
  }

  if (chart) chart.destroy();
  chart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: xs,
      datasets: [{ label: 'y = ax² + bx + c', data: ys }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: { title:{display:true,text:'x'} },
        y: { title:{display:true,text:'y'} }
      }
    }
  });
}

/* Selects */
function initFilters(){
  const temaSel = document.getElementById('tema');
  const subtemaSel = document.getElementById('subtema');
  const tipoSel = document.getElementById('tipo');
  if (!temaSel || !subtemaSel || !tipoSel) return;

  temaSel.innerHTML = Object.keys(OPTIONS).map(t => `<option value="${t}">${t}</option>`).join('');

  function refreshSubtemas(){
    const subs = Object.keys(OPTIONS[temaSel.value] || {});
    subtemaSel.innerHTML = subs.map(s => `<option value="${s}">${s}</option>`).join('');
    refreshTipos();
  }
  function refreshTipos(){
    const tipos = OPTIONS[temaSel.value]?.[subtemaSel.value] || [];
    tipoSel.innerHTML = tipos.map(opt => `<option value="${opt.id}">${opt.label}</option>`).join('');
  }
  temaSel.addEventListener('change', refreshSubtemas);
  subtemaSel.addEventListener('change', refreshTipos);
  refreshSubtemas();
}

/* Acciones */
async function nuevoEjercicio(){
  try{
    const tema = document.getElementById('tema')?.value || 'Álgebra';
    const subtema = document.getElementById('subtema')?.value || 'Función cuadrática';
    const tipo = document.getElementById('tipo')?.value || 'analisis_completo';

    const data = await fetchPlayground({ tema, subtema, tipo });
    lastExercise = data;

    renderMath(data.latex_enunciado || '', 'enunciado');

    // Limpiar secciones
    ['sol-primaria','sol-domran','sol-formas','sol-graph-note','sol-inversa'].forEach(id => renderMath('', id));
    if (chart){ chart.destroy(); chart = null; }
  }catch(err){
    alert(err.message || 'Failed to fetch (playground)');
  }
}

async function mostrarRespuesta(){
  try{
    if(!lastExercise){ await nuevoEjercicio(); if(!lastExercise) return; }

    // Split de la solución en 3 zonas
    const { primaria, domran, formas } = splitSolutionLatex(lastExercise.latex_solucion || '');

    renderMath(primaria || '', 'sol-primaria');
    renderMath(domran   || String.raw`\textbf{Dominio/Recorrido:}~\text{No disponible}`, 'sol-domran');
    renderMath(formas   || String.raw`\textbf{Formas:}~\text{No disponible}`, 'sol-formas');

    // Gráfico + nota
    if (lastExercise.graph && lastExercise.coeffs){
      dibujarGraficoCuadratica(lastExercise);
      renderMath(String.raw`\textit{Nota:}~\text{La línea punteada indica el eje de simetría; el vértice se marca con un punto.}`, 'sol-graph-note');
    }

    // Inversa opcional (placeholder)
    document.getElementById('inverse-block')?.setAttribute('hidden','');
  }catch(err){
    alert(err.message || 'Failed to fetch (playground)');
  }
}

/* Sidebar + iconos */
const SUBJECT_ICONS = { /* (igual que tu versión anterior) */ };
function subjectKeyFromText(txt){ const s=(txt||'').toLowerCase(); if(s.includes('matem'))return'matematicas'; if(s.includes('quím')||s.includes('quimi'))return'quimica'; if(s.includes('biol'))return'biologia'; if(s.includes('fís')||s.includes('fis'))return'fisica'; return 'matematicas'; }
function getCurrentSubjectKey(){ const active=document.querySelector('.subjects__item[aria-current="page"]'); const name=active?.getAttribute('data-subject')||active?.textContent||''; return subjectKeyFromText(name); }
function applySidebarIcons(){ document.querySelectorAll('.subjects__item').forEach(li=>{ const name=li.getAttribute('data-subject')||li.textContent||''; const key=subjectKeyFromText(name); const box=li.querySelector('.subjects__icon'); if(box && SUBJECT_ICONS[key]) box.innerHTML = SUBJECT_ICONS[key]; }); }
function renderHeaderIcon(){ const holder=document.querySelector('.subject-icon-header'); if(holder){ const key=getCurrentSubjectKey(); holder.innerHTML = SUBJECT_ICONS[key] || ''; } }
function renderSubjectTitle(){ const span=document.getElementById('subject-name'); if(!span) return; const active=document.querySelector('.subjects__item[aria-current="page"]'); const name=active?.getAttribute('data-subject')||active?.textContent?.trim()||'Matemáticas'; span.textContent=name; }
function initSubjectsSidebar(){ const list=document.getElementById('subjects'); if(!list) return; const items=[...list.querySelectorAll('.subjects__item')]; function setActive(item){ if(item.getAttribute('aria-disabled')==='true') return; items.forEach(i=>i.removeAttribute('aria-current')); item.setAttribute('aria-current','page'); renderSubjectTitle(); renderHeaderIcon(); } function handleActivate(e){ if(e.type==='keydown' && !(e.key==='Enter'||e.key===' ')) return; e.preventDefault(); setActive(e.currentTarget); } items.forEach(it=>{ it.addEventListener('click',handleActivate); it.addEventListener('keydown',handleActivate); }); }
function initSidebarToggle(){ const btn=document.getElementById('toggle-subjects'); const sidebar=document.getElementById('sidebar'); const list=document.getElementById('subjects'); if(!btn||!sidebar||!list) return; const setOpen=open=>{ if(open){ sidebar.classList.add('is-open'); btn.setAttribute('aria-expanded','true'); } else { sidebar.classList.remove('is-open'); btn.setAttribute('aria-expanded','false'); } }; btn.addEventListener('click',()=>{ setOpen(!sidebar.classList.contains('is-open')); }); list.addEventListener('click',()=>{ if (window.matchMedia('(max-width: 768px)').matches) setOpen(false); }); document.addEventListener('click',(e)=>{ if (!window.matchMedia('(max-width: 768px)').matches) return; const inside=sidebar.contains(e.target)||btn.contains(e.target); if(!inside) setOpen(false); }); }

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

  document.getElementById('btn-nuevo')?.addEventListener('click', nuevoEjercicio);
  document.getElementById('btn-mostrar')?.addEventListener('click', mostrarRespuesta);
});
