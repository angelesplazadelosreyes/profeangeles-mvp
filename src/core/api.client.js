// src/core/api.client.js
// Cliente centralizado para hablar con el backend Flask de Profe Ángeles.
//
// RESPONSABILIDADES:
// - Decidir la base URL (por ahora SIEMPRE Render).
// - Hacer un "warmup" inicial para despertar la instancia (solo 1 vez).
// - Exponer fetchExercise({ topic, subtopic, type }) que llama a /api/generate-exercise.
// -------------------------------------------------------------------

// URL base de producción (Render)
const PROD_API = 'https://profeangeles-mvp.onrender.com';

// Por ahora siempre usamos Render.
// Si algún día quieres alternar local/producción, se modifica aquí.
function resolveApiBase() {
  return PROD_API;
}

// Construye la URL completa para /api/generate-exercise
function buildApiUrl({ topic, subtopic, type }) {
  const base = resolveApiBase();
  const url = new URL('/api/generate-exercise', base);

  // Estos nombres deben coincidir con lo que espera el backend Flask
  url.searchParams.set('topic', topic);
  url.searchParams.set('subtopic', subtopic);
  url.searchParams.set('type', type);

  return url.toString();
}

/* ===========================
   Warmup + backoff para Render
   =========================== */

// Flag para no hacer warmup en cada llamada, solo la primera vez
let hasWarmedUp = false;

// Despierta Render solo una vez por carga de página
async function warmupOnce() {
  if (hasWarmedUp) return;

  const ROOT = PROD_API + '/';
  let wait = 1000; // 1s inicial

  for (let i = 0; i < 3; i++) {
    try {
      const r = await fetch(ROOT, { method: 'GET' });
      if (r.ok) {
        break; // ya despertó
      }
    } catch (_) {
      // ignoramos errores en warmup
    }
    await new Promise((r) => setTimeout(r, wait));
    wait = Math.round(wait * 1.5);
  }

  hasWarmedUp = true;
}

// Hace la llamada real con algunos reintentos suaves
async function warmAndFetch(apiUrl) {
  // 1) Aseguramos warmup (si ya se hizo, esto casi no cuesta nada)
  await warmupOnce();

  // 2) Llamada real con reintentos SOLO en caso de 503 o fallo de red
  let wait = 1200; // 1.2s
  for (let i = 0; i < 3; i++) {
    try {
      const res = await fetch(apiUrl, { method: 'GET' });
      if (res.ok) return res;
      if (res.status !== 503) return res; // otros errores -> no tiene sentido seguir reintentando
    } catch (_) {
      // ignoramos error de red puntual y reintentamos
    }
    await new Promise((r) => setTimeout(r, wait));
    wait = Math.round(wait * 1.5);
  }

  // Intento final (sin más backoff)
  return fetch(apiUrl, { method: 'GET' });
}

/* ===========================
   Función pública
   =========================== */

// Función pública: la que usará la página de ejercicios
export async function fetchExercise({ topic, subtopic, type }) {
  const apiUrl = buildApiUrl({ topic, subtopic, type });

  console.log('[API] Llamando a:', apiUrl);

  const res = await warmAndFetch(apiUrl);

  if (!res.ok) {
    throw new Error(`Error API (${res.status})`);
  }

  return await res.json();
}
