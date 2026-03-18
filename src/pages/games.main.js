// src/pages/games.main.js
// Orquesta la página de juegos: sidebar, grid de tarjetas y modal.

import { mountTablas } from '../games/tablas.game.js';

// ── Datos de juegos por materia ──────────────────────────────
const GAMES = {
  'Matemáticas': [
    { id: 'tablas',    name: 'Tablas',    icon: '✖️',  available: true  },
    { id: 'tablas2',   name: 'Tablas 2',  icon: '🔢',  available: false },
    { id: 'factores',  name: 'Factores',  icon: '🧩',  available: false },
  ],
};

// ── Referencias DOM ──────────────────────────────────────────
const subjectItems  = document.querySelectorAll('.subjects__item');
const subjectName   = document.getElementById('subject-name');
const gamesGrid     = document.getElementById('games-grid');
const modal         = document.getElementById('game-modal');
const modalTitle    = document.getElementById('modal-title');
const modalBody     = document.getElementById('modal-body');
const modalClose    = document.getElementById('modal-close');
const modalBackdrop = document.getElementById('modal-backdrop');
const toggleBtn     = document.getElementById('toggle-subjects');
const sidebar       = document.getElementById('sidebar');

// ── Sidebar: cambio de materia ───────────────────────────────
subjectItems.forEach(item => {
  item.addEventListener('click', () => {
    if (item.getAttribute('aria-disabled') === 'true') return;
    subjectItems.forEach(i => i.removeAttribute('aria-current'));
    item.setAttribute('aria-current', 'page');
    const subject = item.dataset.subject;
    subjectName.textContent = subject;
    renderGrid(subject);
  });
});

// ── Sidebar: toggle móvil ────────────────────────────────────
toggleBtn?.addEventListener('click', () => {
  const expanded = toggleBtn.getAttribute('aria-expanded') === 'true';
  toggleBtn.setAttribute('aria-expanded', String(!expanded));
  sidebar.classList.toggle('sidebar--open', !expanded);
});

// ── Renderizar tarjetas ──────────────────────────────────────
function renderGrid(subject) {
  const games = GAMES[subject] ?? [];
  gamesGrid.innerHTML = '';

  games.forEach(game => {
    const card = document.createElement('button');
    card.className = 'game-card';
    card.setAttribute('type', 'button');

    if (!game.available) {
      card.setAttribute('aria-disabled', 'true');
      card.setAttribute('title', 'Próximamente');
      card.innerHTML = `
        <span class="game-card__icon">${game.icon}</span>
        <span class="game-card__name">${game.name}</span>
        <span class="game-card__soon">(próximamente)</span>
      `;
      card.addEventListener('click', () => {/* no-op */});
    } else {
      card.innerHTML = `
        <span class="game-card__icon">${game.icon}</span>
        <span class="game-card__name">${game.name}</span>
      `;
      card.addEventListener('click', () => openModal(game));
    }

    gamesGrid.appendChild(card);
  });
}

// ── Modal: abrir / cerrar ────────────────────────────────────
function openModal(game) {
  modalTitle.textContent = game.name;
  modalBody.innerHTML = '';
  modal.removeAttribute('hidden');
  document.body.style.overflow = 'hidden';

  if (game.id === 'tablas') {
    mountTablas(modalBody);
  }

  modalClose.focus();
}

function closeModal() {
  modal.setAttribute('hidden', '');
  document.body.style.overflow = '';
  modalBody.innerHTML = '';
}

modalClose.addEventListener('click', closeModal);
modalBackdrop.addEventListener('click', closeModal);
document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && !modal.hasAttribute('hidden')) closeModal();
});

// ── Inicializar con Matemáticas ──────────────────────────────
renderGrid('Matemáticas');