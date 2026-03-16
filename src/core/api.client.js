// src/core/api.client.js
const PROD_API = 'https://profeangeles-mvp.onrender.com';

function resolveApiBase() {
  return PROD_API;
}

function buildApiUrl({ topic, subtopic, type }) {
  const base = resolveApiBase();
  const url = new URL('/api/generate-exercise', base);
  url.searchParams.set('topic', topic);
  url.searchParams.set('subtopic', subtopic);
  url.searchParams.set('type', type);
  return url.toString();
}

// Lee la key desde variable de entorno de Vite
const API_KEY = import.meta.env.VITE_API_KEY ?? '';

// Headers autenticados para endpoints protegidos
function authHeaders() {
  return {
    'Content-Type': 'application/json',
    'X-API-Key': API_KEY,
  };
}

/* ===========================
   Warmup + backoff para Render
   =========================== */

let hasWarmedUp = false;

async function warmupOnce() {
  if (hasWarmedUp) return;

  const ROOT = PROD_API + '/';
  let wait = 1000;

  for (let i = 0; i < 3; i++) {
    try {
      // '/' es ruta pública, no necesita key
      const r = await fetch(ROOT, { method: 'GET' });
      if (r.ok) break;
    } catch (_) {}
    await new Promise((r) => setTimeout(r, wait));
    wait = Math.round(wait * 1.5);
  }

  hasWarmedUp = true;
}

async function warmAndFetch(apiUrl) {
  await warmupOnce();

  let wait = 1200;
  for (let i = 0; i < 3; i++) {
    try {
      const res = await fetch(apiUrl, {
        method: 'GET',
        headers: authHeaders(),
      });
      if (res.ok) return res;
      if (res.status !== 503) return res;
    } catch (_) {}
    await new Promise((r) => setTimeout(r, wait));
    wait = Math.round(wait * 1.5);
  }

  // Intento final
  return fetch(apiUrl, {
    method: 'GET',
    headers: authHeaders(),
  });
}

/* ===========================
   Función pública
   =========================== */

export async function fetchExercise({ topic, subtopic, type }) {
  const apiUrl = buildApiUrl({ topic, subtopic, type });
  console.log('[API] Llamando a:', apiUrl);

  const res = await warmAndFetch(apiUrl);

  if (!res.ok) {
    throw new Error(`Error API (${res.status})`);
  }

  return await res.json();
}