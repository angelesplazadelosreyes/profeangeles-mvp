// /scripts/api2.js
// Cliente para el PLAYGROUND (exercises2) – no toca producción

// === Configuración base ===
// Si usas el mismo Render para prod y playground, deja este base igual al de PROD.
// Si creas un Render separado para playground, reemplaza BASE_URL por el de ese servicio.
const PROD_RENDER_BASE = 'https://profeangeles-mvp.onrender.com'; // mismo que usas hoy en main.js
const LOCAL_BASE = 'http://localhost:5000';

// Ruta del endpoint del playground (ajústala si tu blueprint usa otra)
const ENDPOINT_PATH = '/api2/generate';

// Modo automático: local si navegas en localhost, Render si no.
function getBaseUrl() {
  const isLocal = location.hostname === 'localhost' || location.hostname === '127.0.0.1';
  return isLocal ? LOCAL_BASE : PROD_RENDER_BASE;
}

export function buildApi2Url(params = {}) {
  const url = new URL(ENDPOINT_PATH, getBaseUrl());
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  return url.toString();
}

async function warmRenderIfNeeded() {
  // “despierta” Render suavemente; no es crítico, pero ayuda en frío
  const ROOT = new URL('/', getBaseUrl()).toString();
  let wait = 1200;
  for (let i = 0; i < 3; i++) {
    try {
      const r = await fetch(ROOT, { method: 'GET' });
      if (r.ok) break;
    } catch {}
    await new Promise(r => setTimeout(r, wait));
    wait = Math.round(wait * 1.6);
  }
}

export async function fetchPlayground(params) {
  await warmRenderIfNeeded();
  const url = buildApi2Url(params);
  const res = await fetch(url, { method: 'GET' });
  if (!res.ok) throw new Error(`API2 error ${res.status}`);
  return res.json();
}
