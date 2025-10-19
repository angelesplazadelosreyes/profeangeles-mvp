// /scripts/api.js
export let BASE_API_URL = 'https://api.profeangeles.cl'; // PROD por defecto

export function setApiBase(url) {
  BASE_API_URL = url;
}

// Ejemplo de cliente (lo rellenamos después):
export async function generarEjercicio(payload) {
  const res = await fetch(`${BASE_API_URL}/v1/ejercicios/generar`, {
    method: 'POST',
    headers: {'Content-Type':'application/json'},
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}
