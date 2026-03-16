// src/pages/class-area.main.js

import { areasData, recargos, referidos } from '../data/classes.data.js';

const WS_NUMBER = '56971312255';

function formatCLP(amount) {
  return `$${amount.toLocaleString('es-CL')}`;
}

function getAreaParam() {
  const params = new URLSearchParams(window.location.search);
  return params.get('area');
}

function buildPreciosTable(precios, label = '') {
  return `
    <div class="precios-block">
      ${label ? `<h4 class="nivel-label">${label}</h4>` : ''}
      <table class="precios-table">
        <thead>
          <tr>
            <th>Modalidad</th>
            <th>Clase única</th>
            <th>Pack 4</th>
            <th>Pack 8</th>
            <th>Pack 12</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Online</td>
            <td>${formatCLP(precios.unica)}</td>
            <td>${formatCLP(precios.pack4)}</td>
            <td>${formatCLP(precios.pack8)}</td>
            <td>${formatCLP(precios.pack12)}</td>
          </tr>
          <tr>
            <td>Presencial <span class="presencial-nota">(Curicó)</span></td>
            <td>${formatCLP(precios.unica + recargos.presencial)}</td>
            <td>${formatCLP(precios.pack4 + recargos.presencial)}</td>
            <td>${formatCLP(precios.pack8 + recargos.presencial)}</td>
            <td>${formatCLP(precios.pack12 + recargos.presencial)}</td>
          </tr>
        </tbody>
      </table>
      <p class="referido-nota">* Con descuento referido: ${formatCLP(recargos.presencial === 0 ? 0 : 1000)} menos por clase en cualquier pack.</p>
    </div>
  `;
}

function buildPythonSelector(niveles) {
  const tabs = niveles.map((n, i) => `
    <button class="nivel-tab ${i === 0 ? 'active' : ''}" data-nivel="${n.id}">
      ${n.nombre}
    </button>
  `).join('');

  const panels = niveles.map((n, i) => `
    <div class="nivel-panel ${i === 0 ? 'active' : ''}" id="panel-${n.id}">
      <p class="nivel-desc">${n.descripcion}</p>
      ${buildPreciosTable(n.precios)}
    </div>
  `).join('');

  return `
    <div class="nivel-selector">
      <div class="nivel-tabs">${tabs}</div>
      <div class="nivel-panels">${panels}</div>
    </div>
  `;
}

function buildFaq(faqList) {
  const items = faqList.map(item => `
    <details class="faq-item">
      <summary class="faq-pregunta">${item.pregunta}</summary>
      <p class="faq-respuesta">${item.respuesta}</p>
    </details>
  `).join('');

  return `
    <section class="area-section">
      <h2>Preguntas frecuentes</h2>
      ${items}
    </section>
  `;
}

function buildReferidosBox() {
  return `
    <div class="referidos-box">
      <h3>Programa de referidos</h3>
      <ul>
        <li><strong>Si refieres a alguien:</strong> ${referidos.beneficioReferidor}</li>
        <li><strong>Si te refirieron:</strong> ${referidos.beneficioReferido}</li>
      </ul>
    </div>
  `;
}

function renderArea(area) {
  const data = areasData[area];

  const preciosHTML = area === 'python'
    ? buildPythonSelector(data.niveles)
    : buildPreciosTable(data.precios);

  const materiasHTML = data.materias
    ? `<ul class="materias-list">${data.materias.map(m => `<li>${m}</li>`).join('')}</ul>`
    : '';

  return `
    <section class="area-hero">
      <a href="/classes.html" class="back-link">← Volver a clases</a>
      <h1>${data.titulo}</h1>
      <p class="area-descripcion">${data.descripcion}</p>
    </section>

    <section class="area-section">
      <h2>¿A quién va dirigido?</h2>
      <p>${data.dirigidoA}</p>
    </section>

    ${data.materias ? `
    <section class="area-section">
      <h2>Materias disponibles</h2>
      ${materiasHTML}
    </section>` : ''}

    <section class="area-section">
      <h2>Precios</h2>
      <p class="precios-nota">Los precios corresponden al valor por clase dentro de cada pack. El recargo presencial es de ${formatCLP(recargos.presencial)} por clase (solo Curicó).</p>
      ${preciosHTML}
    </section>

    ${buildReferidosBox()}

    <section class="area-section">
      <h2>Temario</h2>
      <p class="proximamente">Próximamente disponible.</p>
    </section>

    ${buildFaq(data.faq)}

    <section class="area-cta">
      <h2>¿Listo para empezar?</h2>
      <p>Agenda tu sesión diagnóstica gratuita de 20 minutos.</p>
      
        <a href="https://wa.me/${WS_NUMBER}?text=Hola%20Profe%20%C3%81ngeles%2C%20quiero%20una%20sesi%C3%B3n%20diagn%C3%B3stica%20para%20el%20%C3%A1rea%20${encodeURIComponent(data.titulo)}"
        class="btn-whatsapp"
        target="_blank"
        rel="noopener noreferrer"
      >
        Contactar por WhatsApp
      </a>
    </section>
  `;
}

function renderError() {
  return `
    <section class="area-hero">
      <a href="/classes.html" class="back-link">← Volver a clases</a>
      <h1>Área no encontrada</h1>
      <p>El área solicitada no existe. Por favor vuelve a la página de clases.</p>
    </section>
  `;
}

function initTabs() {
  const tabs = document.querySelectorAll('.nivel-tab');
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      document.querySelectorAll('.nivel-panel').forEach(p => p.classList.remove('active'));
      tab.classList.add('active');
      document.getElementById(`panel-${tab.dataset.nivel}`).classList.add('active');
    });
  });
}

function init() {
  const area = getAreaParam();
  const container = document.getElementById('area-content');

  if (!area || !areasData[area]) {
    container.innerHTML = renderError();
    return;
  }

  document.title = `${areasData[area].titulo} — ProfeÁngeles`;
  container.innerHTML = renderArea(area);

  if (area === 'python') initTabs();
}

init();