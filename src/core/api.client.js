// src/core/api.client.js
const PROD_API = import.meta.env.VITE_API_URL;
const API_KEY  = import.meta.env.VITE_API_KEY ?? '';

function buildApiUrl({ topic, subtopic, type }) {
  const url = new URL('/api/generate-exercise', PROD_API);
  url.searchParams.set('topic', topic);
  url.searchParams.set('subtopic', subtopic);
  url.searchParams.set('type', type);
  return url.toString();
}

function authHeaders() {
  return {
    'Content-Type': 'application/json',
    'X-API-Key': API_KEY,
  };
}

/* ===========================
   Fetch con reintentos
   Cubre cold start de hasta ~55s
   =========================== */

const MAX_ATTEMPTS  = 6;
const BASE_WAIT_MS  = 3000;  // 3s entre reintentos
const MAX_WAIT_MS   = 15000; // tope de 15s por espera

async function fetchWithRetry(url, options) {
  let wait = BASE_WAIT_MS;

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    try {
      const res = await fetch(url, options);
      if (res.ok) return res;

      // 401 o 403: no tiene sentido reintentar
      if (res.status === 401 || res.status === 403) return res;

      // 503 u otro error de servidor: reintentamos
      console.warn(`[API] Intento ${attempt}/${MAX_ATTEMPTS} — status ${res.status}`);
    } catch (err) {
      // Error de red (servidor todavía durmiendo)
      console.warn(`[API] Intento ${attempt}/${MAX_ATTEMPTS} — red: ${err.message}`);
    }

    if (attempt < MAX_ATTEMPTS) {
      await new Promise((r) => setTimeout(r, wait));
      wait = Math.min(Math.round(wait * 1.4), MAX_WAIT_MS);
    }
  }

  // Último intento sin capturar — deja que el error llegue al caller
  return fetch(url, options);
}

/* ===========================
   Función pública
   =========================== */

export async function fetchExercise({ topic, subtopic, type }) {
  const url = buildApiUrl({ topic, subtopic, type });
  console.log('[API] Llamando a:', url);

  const res = await fetchWithRetry(url, {
    method: 'GET',
    headers: authHeaders(),
  });

  if (!res.ok) {
    throw new Error(`Error API (${res.status})`);
  }

  return await res.json();
}