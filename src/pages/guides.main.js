// src/pages/guides.main.js
const API_BASE = import.meta.env.VITE_API_URL;
const API_KEY  = import.meta.env.VITE_API_KEY ?? '';
import { showLoadingModal, hideLoadingModal } from '../ui/loading.modal.js';

function authHeaders(extra = {}) {
  return {
    'Content-Type': 'application/json',
    'X-API-Key': API_KEY,
    ...extra,
  };
}

const SKILLS_ORDER = [
  { key: 'concavity',       label: 'Concavidad' },
  { key: 'discriminant',    label: 'Discriminante' },
  { key: 'roots',           label: 'Raíces' },
  { key: 'axis',            label: 'Eje de simetría' },
  { key: 'vertex',          label: 'Vértice' },
  { key: 'y_intercept',     label: 'Intersección con eje Y' },
  { key: 'domain',          label: 'Dominio' },
  { key: 'range',           label: 'Recorrido' },
  { key: 'canonical_form',  label: 'Forma canónica' },
  { key: 'factorized_form', label: 'Forma factorizada' },
  { key: 'graph',           label: 'Gráfico' },
];
const INVERSE = { key: 'inverse', label: 'Función inversa (restringe dominio)' };

let currentFunctionText = null;
let loading = false;

async function fetchCoeffs() {
  const res = await fetch(
    `${API_BASE}/api/generate-exercise?type=analisis_completo`,
    { cache: 'no-store', headers: authHeaders() }
  );
  if (!res.ok) throw new Error('Error generando ejercicio');
  const data = await res.json();
  return data.coeffs;
}

function toReadableFunction({ a, b, c }) {
  const minus = '−';
  let fx = 'f(x) = ';
  if (a === 1) fx += 'x²';
  else if (a === -1) fx += `${minus}x²`;
  else fx += `${a}x²`;
  if (b !== 0) fx += b > 0 ? ` + ${b}x` : ` ${minus} ${Math.abs(b)}x`;
  if (c !== 0) fx += c > 0 ? ` + ${c}` : ` ${minus} ${Math.abs(c)}`;
  return fx;
}

function ready() {
  const checkboxes = document.querySelectorAll(".skills-grid input[type='checkbox']");
  const button  = document.getElementById('generateGuideBtn');
  const preview = document.getElementById('statementPreview');
  const textEl  = document.getElementById('statementText');

  if (!checkboxes.length || !button || !preview || !textEl) {
    setTimeout(ready, 50);
    return;
  }

  function resetForm() {
    checkboxes.forEach(cb => { cb.checked = false; });
    currentFunctionText = null;
    loading = false;
    textEl.textContent = '';
    preview.style.display = 'none';
    button.disabled = true;
  }

  async function updateStatement() {
    const selected = Array.from(checkboxes).filter(cb => cb.checked).map(cb => cb.value);
    button.disabled = selected.length === 0;

    if (selected.length === 0) {
      preview.style.display = 'none';
      textEl.textContent = '';
      return;
    }

    if (!currentFunctionText && !loading) {
      loading = true;
      preview.style.display = 'block';
      textEl.textContent = 'Generando función… paciencia, puede tardar un momento';
      try {
        const coeffs = await fetchCoeffs();
        currentFunctionText = toReadableFunction(coeffs);
      } catch (err) {
        console.error(err);
        textEl.textContent = 'Error al generar la función.';
        return;
      } finally {
        loading = false;
      }
    }

    const ordered = [];
    SKILLS_ORDER.forEach(s => { if (selected.includes(s.key)) ordered.push(s.label); });
    if (selected.includes(INVERSE.key)) ordered.push(INVERSE.label);

    let out = `Dada la siguiente función cuadrática ${currentFunctionText}, determina:\n\n`;
    ordered.forEach((label, i) => { out += `${String.fromCharCode(97 + i)}) ${label}\n`; });

    textEl.textContent = out.trim();
    preview.style.display = 'block';
  }

  checkboxes.forEach(cb => cb.addEventListener('change', () => updateStatement()));

  button.addEventListener('click', async () => {
    const selected = Array.from(checkboxes).filter(cb => cb.checked).map(cb => cb.value);
    if (selected.length === 0) return;

    button.disabled = true;
    const oldText = button.textContent;
    button.textContent = 'Generando PDF…';
    showLoadingModal();

    try {
      const res = await fetch(`${API_BASE}/api/generate-guide-pdf`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ count: 10, skills: selected }),
      });

      if (!res.ok) throw new Error('Error generando PDF');

      const blob = await res.blob();
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement('a');
      a.href     = url;
      a.download = 'guia-funcion-cuadratica.pdf';
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      resetForm();

    } catch (err) {
      console.error(err);
      alert('No se pudo generar el PDF. Intenta nuevamente.');
    } finally {
      hideLoadingModal();
      button.textContent = oldText;
      button.disabled = false;
    }
  });

  updateStatement();
}

document.readyState === 'loading'
  ? document.addEventListener('DOMContentLoaded', ready)
  : ready();