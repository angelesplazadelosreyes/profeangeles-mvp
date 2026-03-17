// src/ui/loading.modal.js
import { CURIOSITIES, generateArithmeticExercise } from '../data/loading.content.js';

const SHOW_DELAY_MS = 2000; // solo aparece si la API tarda más de 2s

let modalEl = null;
let rotatorInterval = null;
let showTimeout = null;

// ── Crear DOM del modal ──────────────────────────────────────────
function createModal() {
  const el = document.createElement('div');
  el.id = 'loading-modal';
  el.innerHTML = `
    <div class="lm-backdrop"></div>
    <div class="lm-card" role="dialog" aria-live="polite">
      <div class="lm-spinner"></div>
      <p class="lm-title">Despertando el servidor…</p>
      <p class="lm-sub">El servidor gratuito se duerme si no lo usan. <br>Puede tardar hasta 30 segundos la primera vez.</p>
      <div class="lm-content" id="lm-content"></div>
    </div>
  `;
  document.body.appendChild(el);
  return el;
}

// ── Contenido rotatorio ──────────────────────────────────────────
let currentArithmetic = null;
let curiosityPool = [];

function getNextCuriosity() {
  if (curiosityPool.length === 0) {
    curiosityPool = [...CURIOSITIES].sort(() => Math.random() - 0.5);
  }
  return curiosityPool.pop();
}

function renderCuriosity() {
  const content = document.getElementById('lm-content');
  if (!content) return;
  const item = getNextCuriosity();
  content.innerHTML = `
    <div class="lm-curiosity">
      <span class="lm-tag">¿Sabías que…?</span>
      <p>${item.text}</p>
      <small>${item.source}</small>
    </div>
  `;
}

function renderArithmetic() {
  const content = document.getElementById('lm-content');
  if (!content) return;
  currentArithmetic = generateArithmeticExercise();

  // Genera 3 opciones: respuesta correcta + 2 distractores únicos
  const correct = currentArithmetic.answer;
  const options = new Set([correct]);
  while (options.size < 3) {
    const offset = Math.floor(Math.random() * 10) + 1;
    options.add(correct + (Math.random() > 0.5 ? offset : -offset));
  }
  const shuffled = [...options].sort(() => Math.random() - 0.5);

  content.innerHTML = `
    <div class="lm-arithmetic">
      <span class="lm-tag">Ejercicio rápido</span>
      <p class="lm-question">¿Cuánto es <strong>${currentArithmetic.question}</strong>?</p>
      <div class="lm-options">
        ${shuffled.map(opt => `
          <button class="lm-option" data-value="${opt}">${opt}</button>
        `).join('')}
      </div>
      <p id="lm-feedback" class="lm-feedback"></p>
    </div>
  `;

  content.querySelectorAll('.lm-option').forEach(btn => {
    btn.addEventListener('click', () => {
      const val = parseInt(btn.dataset.value, 10);
      const feedback = document.getElementById('lm-feedback');
      content.querySelectorAll('.lm-option').forEach(b => b.disabled = true);

      if (val === correct) {
        btn.classList.add('lm-option-correct');
        if (feedback) { feedback.textContent = '¡Correcto! 🎉'; feedback.className = 'lm-feedback lm-correct'; }
      } else {
        btn.classList.add('lm-option-wrong');
        content.querySelectorAll('.lm-option').forEach(b => {
          if (parseInt(b.dataset.value, 10) === correct) b.classList.add('lm-option-correct');
        });
        if (feedback) { feedback.textContent = `La respuesta era ${correct}.`; feedback.className = 'lm-feedback lm-wrong'; }
      }
    });
  });
}


let rotatorStep = 0;
function rotateContent() {
  if (rotatorStep % 2 === 0) renderCuriosity();
  else renderArithmetic();
  rotatorStep++;
}

// ── API pública ──────────────────────────────────────────────────
export function showLoadingModal() {
  // Espera 2s antes de mostrar — si la API responde rápido, el modal nunca aparece
  showTimeout = setTimeout(() => {
    if (!modalEl) modalEl = createModal();
    modalEl.classList.add('lm-visible');
    rotatorStep = 0;
    rotateContent();
    rotatorInterval = setInterval(rotateContent, 3000);
  }, SHOW_DELAY_MS);
}

export function hideLoadingModal() {
  clearTimeout(showTimeout);
  clearInterval(rotatorInterval);
  rotatorInterval = null;
  showTimeout = null;
  if (modalEl) modalEl.classList.remove('lm-visible');
}