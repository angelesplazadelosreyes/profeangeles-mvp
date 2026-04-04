// nextjs/lib/renderers/registry.ts

import { ExerciseResponse } from '@/lib/api.client';
import { RendererFn, RendererKey } from './types';

export function selectRendererKey(data: ExerciseResponse): RendererKey {
  if (data?.graph && data?.coeffs) return 'math:funcion_cuadratica:analisis_completo';
  return 'text:default';
}

const RENDERER_LOADERS: Record<RendererKey, () => Promise<RendererFn>> = {
  'math:funcion_cuadratica:analisis_completo': async () => {
    const mod = await import('./math.quadratic.renderer');
    return mod.renderMathQuadraticAnalysis;
  },
  'text:default': async () => {
    const mod = await import('./text.default.renderer');
    return mod.renderTextOnly;
  },
};

export async function loadRenderer(key: RendererKey): Promise<RendererFn> {
  const loader = RENDERER_LOADERS[key] ?? RENDERER_LOADERS['text:default'];
  return loader();
}