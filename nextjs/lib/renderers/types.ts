// nextjs/lib/renderers/types.ts

import { ExerciseResponse } from '@/lib/api.client';

export type RendererFn = (root: HTMLElement, data: ExerciseResponse) => void;

export type RendererKey =
  | 'math:lcm'
  | 'math:funcion_cuadratica:analisis_completo'
  | 'text:default';