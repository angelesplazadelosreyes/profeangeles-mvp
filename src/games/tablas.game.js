// src/games/tablas.game.js
// Juego de tablas de multiplicar

// ── Configuración ────────────────────────────────────────────
const CONFIG = {
  totalQuestions: 15,
  difficulty: {
    facil:  { label: 'Fácil',   seconds: 10, points: 1 },
    medio:  { label: 'Medio',   seconds: 6,  points: 2 },
    dificil:{ label: 'Difícil', seconds: 3,  points: 3 },
  },
};

// ── Audio (Web Audio API — sin archivos externos) ─────────────
const AudioCtx = window.AudioContext || window.webkitAudioContext;
let ctx = null;

function getAudioCtx() {
  if (!ctx) ctx = new AudioCtx();
  return ctx;
}

function playTone(frequency, duration, type = 'sine', volume = 0.3) {
  try {
    const ac  = getAudioCtx();
    const osc = ac.createOscillator();
    const gain = ac.createGain();
    osc.connect(gain);
    gain.connect(ac.destination);
    osc.type = type;
    osc.frequency.setValueAtTime(frequency, ac.currentTime);
    gain.gain.setValueAtTime(volume, ac.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + duration);
    osc.start(ac.currentTime);
    osc.stop(ac.currentTime + duration);
  } catch (_) { /* silencio si el navegador bloquea */ }
}

function soundCorrect() {
  playTone(520, 0.12, 'sine', 0.3);
  setTimeout(() => playTone(660, 0.15, 'sine', 0.25), 100);
}

function soundWrong() {
  playTone(220, 0.25, 'sawtooth', 0.2);
}

function soundAlert() {
  playTone(440, 0.08, 'square', 0.15);
}

// ── Estado del juego ─────────────────────────────────────────
let state = {};

function initState(tableRange, diffKey) {
  state = {
    tableRange,           // 0 = todas, N = tabla específica
    diffKey,
    diff:   CONFIG.difficulty[diffKey],
    questions: generateQuestions(tableRange),
    current:   0,
    score:     0,
    hits:      0,
    timer:     null,
    secondsLeft: 0,
    answered:  false,
  };
}

// ── Generación de preguntas ──────────────────────────────────
function generateQuestions(tableRange) {
  const qs = [];
  for (let i = 0; i < CONFIG.totalQuestions; i++) {
    const a = tableRange === 0
      ? randInt(1, 12)
      : tableRange;
    const b       = randInt(1, 12);
    const correct = a * b;
    const options = generateOptions(correct);
    qs.push({ a, b, correct, options });
  }
  return qs;
}

function generateOptions(correct) {
  const opts = new Set([correct]);
  while (opts.size < 3) {
    const delta = randInt(1, 4) * (Math.random() < 0.5 ? 1 : -1);
    const wrong = correct + delta * randInt(1, 3);
    if (wrong > 0 && wrong !== correct) opts.add(wrong);
  }
  return shuffle([...opts]);
}

function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// ── Render principal ─────────────────────────────────────────
export function mountTablas(container) {
  renderSetup(container);
}

// ── PANTALLA 1: Configuración ────────────────────────────────
function renderSetup(container) {
  container.innerHTML = `
    <div class="tg-setup">

      <div class="tg-section-label">¿Hasta qué tabla practicar?</div>
      <div class="tg-table-selector">
        <button class="tg-table-btn tg-table-btn--active" data-table="0">Todas (1–12)</button>
        ${[2,3,4,5,6,7,8,9,10,11,12].map(n =>
          `<button class="tg-table-btn" data-table="${n}">Tabla del ${n}</button>`
        ).join('')}
      </div>

      <div class="tg-section-label" style="margin-top:1.5rem">Dificultad</div>
      <div class="tg-difficulty">
        ${Object.entries(CONFIG.difficulty).map(([key, d]) => `
          <button class="tg-diff-btn" data-diff="${key}">
            <span class="tg-diff-dot tg-diff-dot--${key}"></span>
            <span>${d.label}</span>
            <span class="tg-diff-sub">${d.seconds}s por pregunta</span>
          </button>
        `).join('')}
      </div>

      <button class="tg-start-btn" id="tg-start" disabled>Jugar</button>
    </div>
  `;

  let selectedTable = 0;
  let selectedDiff  = null;

  const tableBtns = container.querySelectorAll('.tg-table-btn');
  const diffBtns  = container.querySelectorAll('.tg-diff-btn');
  const startBtn  = container.querySelector('#tg-start');

  tableBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      tableBtns.forEach(b => b.classList.remove('tg-table-btn--active'));
      btn.classList.add('tg-table-btn--active');
      selectedTable = parseInt(btn.dataset.table);
    });
  });

  diffBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      diffBtns.forEach(b => b.classList.remove('tg-diff-btn--active'));
      btn.classList.add('tg-diff-btn--active');
      selectedDiff = btn.dataset.diff;
      startBtn.disabled = false;
    });
  });

  startBtn.addEventListener('click', () => {
    initState(selectedTable, selectedDiff);
    renderGame(container);
  });
}

// ── PANTALLA 2: Juego ────────────────────────────────────────
function renderGame(container) {
  const q = state.questions[state.current];

  container.innerHTML = `
    <div class="tg-game">
      <div class="tg-hud">
        <div class="tg-timer" id="tg-timer">
          <svg viewBox="0 0 36 36" width="48" height="48">
            <circle cx="18" cy="18" r="15" fill="none" stroke="var(--tg-timer-track,#e5e7eb)" stroke-width="3"/>
            <circle cx="18" cy="18" r="15" fill="none"
              stroke="var(--tg-timer-bar,#0d9488)" stroke-width="3"
              stroke-dasharray="94.25" stroke-dashoffset="0"
              stroke-linecap="round"
              transform="rotate(-90 18 18)"
              id="tg-timer-arc"/>
          </svg>
          <span class="tg-timer-num" id="tg-timer-num">${state.diff.seconds}</span>
        </div>

        <div class="tg-progress">
          <span id="tg-qnum">${state.current + 1}</span>/<span>${CONFIG.totalQuestions}</span>
        </div>

        <div class="tg-score-box">
          <span class="tg-heart">♥</span>
          <span id="tg-score">${state.score}</span>
        </div>
      </div>

      <div class="tg-question" id="tg-question">
        ${q.a} × ${q.b}
      </div>

      <div class="tg-options" id="tg-options">
        ${q.options.map(opt => `
          <button class="tg-opt-btn" data-val="${opt}">${opt}</button>
        `).join('')}
      </div>

      <div class="tg-feedback" id="tg-feedback"></div>
    </div>
  `;

  attachOptionListeners(container);
  startTimer(container);
}

function attachOptionListeners(container) {
  state.answered = false;
  container.querySelectorAll('.tg-opt-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      if (state.answered) return;
      handleAnswer(parseInt(btn.dataset.val), container);
    });
  });
}

function handleAnswer(val, container) {
  state.answered = true;
  clearInterval(state.timer);

  const q       = state.questions[state.current];
  const correct = val === q.correct;

  if (correct) {
    state.score += state.diff.points;
    state.hits++;
    soundCorrect();
  } else {
    soundWrong();
  }

  // Colorear botones
  container.querySelectorAll('.tg-opt-btn').forEach(btn => {
    const v = parseInt(btn.dataset.val);
    if (v === q.correct)  btn.classList.add('tg-opt--correct');
    else if (v === val)   btn.classList.add('tg-opt--wrong');
    btn.disabled = true;
  });

  setTimeout(() => nextQuestion(container), 600);
}

function nextQuestion(container) {
  state.current++;
  if (state.current >= CONFIG.totalQuestions) {
    renderResult(container);
  } else {
    renderGame(container);
  }
}

// ── Temporizador ─────────────────────────────────────────────
function startTimer(container) {
  state.secondsLeft = state.diff.seconds;
  const total       = state.diff.seconds;
  const arc         = container.querySelector('#tg-timer-arc');
  const numEl       = container.querySelector('#tg-timer-num');
  const circumference = 94.25;

  function tick() {
    state.secondsLeft--;
    if (numEl) numEl.textContent = state.secondsLeft;

    // Arco SVG
    if (arc) {
      const offset = circumference * (1 - state.secondsLeft / total);
      arc.style.strokeDashoffset = offset;
    }

    // Alerta últimos 2 segundos
    if (state.secondsLeft <= 2 && state.secondsLeft > 0) {
      soundAlert();
      if (arc) arc.style.stroke = '#ef4444';
      if (numEl) numEl.style.color = '#ef4444';
    }

    if (state.secondsLeft <= 0) {
      clearInterval(state.timer);
      if (!state.answered) {
        soundWrong();
        state.answered = true;
        // Mostrar respuesta correcta
        container.querySelectorAll('.tg-opt-btn').forEach(btn => {
          if (parseInt(btn.dataset.val) === state.questions[state.current].correct) {
            btn.classList.add('tg-opt--correct');
          }
          btn.disabled = true;
        });
        setTimeout(() => nextQuestion(container), 800);
      }
    }
  }

  state.timer = setInterval(tick, 1000);
}

// ── PANTALLA 3: Resultado ────────────────────────────────────
function renderResult(container) {
  const maxScore = CONFIG.totalQuestions * state.diff.points;
  const pct      = Math.round((state.hits / CONFIG.totalQuestions) * 100);

  const emoji = pct === 100 ? '🏆'
    : pct >= 80 ? '⭐'
    : pct >= 50 ? '👍'
    : '💪';

  container.innerHTML = `
    <div class="tg-result">
      <div class="tg-result-emoji">${emoji}</div>
      <h3 class="tg-result-title">
        ${pct === 100 ? '¡Perfecto!' : pct >= 80 ? '¡Muy bien!' : pct >= 50 ? '¡Bien!' : '¡Sigue practicando!'}
      </h3>
      <div class="tg-result-stats">
        <div class="tg-stat">
          <span class="tg-stat-val">${state.hits}<span class="tg-stat-total">/${CONFIG.totalQuestions}</span></span>
          <span class="tg-stat-label">Aciertos</span>
        </div>
        <div class="tg-stat">
          <span class="tg-stat-val">${state.score}<span class="tg-stat-total">/${maxScore}</span></span>
          <span class="tg-stat-label">Puntos</span>
        </div>
        <div class="tg-stat">
          <span class="tg-stat-val">${pct}<span class="tg-stat-total">%</span></span>
          <span class="tg-stat-label">Precisión</span>
        </div>
      </div>
      <div class="tg-result-actions">
        <button class="tg-action-btn tg-action-btn--secondary" id="tg-close">Cerrar</button>
        <button class="tg-action-btn tg-action-btn--primary" id="tg-retry">Otra vez</button>
      </div>
    </div>
  `;

  container.querySelector('#tg-retry').addEventListener('click', () => renderSetup(container));
  container.querySelector('#tg-close').addEventListener('click', () => {
    document.getElementById('modal-close').click();
  });
}