// src/renderers/registry.js
// Registro central de renderers (Vite-friendly: loaders estáticos)

export function selectRendererKey(data) {
  const meta = data?.meta || {};

  if (meta.layout === 'two-column') return 'math:funcion_cuadratica:analisis_completo';
  if (meta.layout === 'single-column') return 'text:default';

  if (data?.graph && data?.coeffs) return 'math:funcion_cuadratica:analisis_completo';

  return 'text:default';
}

const RENDERER_LOADERS = {
  'math:funcion_cuadratica:analisis_completo': async () => {
    const mod = await import('./math.quadratic.render.js');
    return mod.renderMathQuadraticAnalysis;
  },
  'text:default': async () => {
    const mod = await import('./text.default.render.js');
    return mod.renderTextOnly;
  },
};

export async function loadRenderer(rendererKey) {
  const loader = RENDERER_LOADERS[rendererKey] || RENDERER_LOADERS['text:default'];
  const fn = await loader();

  if (typeof fn !== 'function') {
    throw new Error(`Renderer "${rendererKey}" no exporta una función válida`);
  }
  return fn;
}
