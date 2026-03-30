// nextjs/lib/api.client.ts

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? '';
const API_KEY = process.env.NEXT_PUBLIC_API_KEY ?? '';

const MAX_ATTEMPTS = 6;
const BASE_WAIT_MS = 3000;
const MAX_WAIT_MS  = 15000;

// ── Tipos ──────────────────────────────────────────────────────────────────

export interface ExerciseParams {
  topic: string;
  subtopic: string;
  type: string;
}

// La API puede devolver distintas formas según el tipo de ejercicio.
// Usamos un tipo flexible: sabemos que siempre viene latex_enunciado,
// el resto varía según el renderer que corresponda.
export interface ExerciseResponse {
  latex_enunciado: string;
  [key: string]: unknown;
}

// ── Helpers ────────────────────────────────────────────────────────────────

function buildUrl(params: ExerciseParams): string {
  const url = new URL('/api/generate-exercise', API_URL);
  url.searchParams.set('topic',    params.topic);
  url.searchParams.set('subtopic', params.subtopic);
  url.searchParams.set('type',     params.type);
  return url.toString();
}

function authHeaders(): HeadersInit {
  return {
    'Content-Type': 'application/json',
    'X-API-Key':    API_KEY,
  };
}

async function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// ── Fetch con reintentos (cubre cold start ~55s) ───────────────────────────

async function fetchWithRetry(url: string, options: RequestInit): Promise<Response> {
  let wait = BASE_WAIT_MS;

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    try {
      const res = await fetch(url, options);
      if (res.ok) return res;

      // Sin sentido reintentar si es error de autenticación
      if (res.status === 401 || res.status === 403) return res;

      console.warn(`[API] Intento ${attempt}/${MAX_ATTEMPTS} — status ${res.status}`);
    } catch (err) {
      console.warn(`[API] Intento ${attempt}/${MAX_ATTEMPTS} — red: ${(err as Error).message}`);
    }

    if (attempt < MAX_ATTEMPTS) {
      await sleep(wait);
      wait = Math.min(Math.round(wait * 1.4), MAX_WAIT_MS);
    }
  }

  // Último intento — deja que el error suba al llamador
  return fetch(url, options);
}

// ── Función pública ────────────────────────────────────────────────────────

export async function fetchExercise(params: ExerciseParams): Promise<ExerciseResponse> {
  const url = buildUrl(params);
  console.log('[API] Llamando a:', url);

  const res = await fetchWithRetry(url, {
    method:  'GET',
    headers: authHeaders(),
  });

  if (!res.ok) {
    throw new Error(`Error API (${res.status})`);
  }

  return res.json() as Promise<ExerciseResponse>;
}

// ── Warmup proactivo ───────────────────────────────────────────────────────
// Se llama al cargar la página para "despertar" el servidor Flask en Render
// antes de que el usuario haga clic en "Nuevo ejercicio".

export async function warmupApi(): Promise<void> {
  try {
    const url = new URL('/health', API_URL).toString();
    await fetch(url, { method: 'GET', headers: authHeaders() });
    console.log('[API] Warmup completado');
  } catch {
    console.warn('[API] Warmup falló — el servidor puede estar durmiendo');
  }
}