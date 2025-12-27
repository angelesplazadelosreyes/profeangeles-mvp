// src/renderers/registry.js
// Registro central de renderers (source-level)

const RENDERER_REGISTRY = {
  'math:funcion_cuadratica:analisis_completo': {
    path: '../renderers/math.quadratic.render.js',
    exportName: 'renderMathQuadraticAnalysis',
  },

  'text:default': {
    path: '../renderers/text.default.render.js',
    exportName: 'renderTextOnly',
  },
};

/* Decide qué renderer usar según los datos */
export function selectRendererKey(data) {
  const meta = data?.meta || {};

  if (meta.layout === 'two-column') return 'math:funcion_cuadratica:analisis_completo';
  if (meta.layout === 'single-column') return 'text:default';

  if (data?.graph && data?.coeffs) {
    return 'math:funcion_cuadratica:analisis_completo';
  }

  return 'text:default';
}

/* Carga dinámica del renderer */
export async function loadRenderer(rendererKey) {
  const info = RENDERER_REGISTRY[rendererKey] || RENDERER_REGISTRY['text:default'];
  const mod = await import(info.path);
  const fn = mod[info.exportName];

  if (typeof fn !== 'function') {
    throw new Error(`Renderer "${rendererKey}" no exporta ${info.exportName}`);
  }

  return fn;
}
