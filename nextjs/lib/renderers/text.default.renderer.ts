// nextjs/lib/renderers/text.default.renderer.ts

import { ExerciseResponse } from '@/lib/api.client';

function renderMathInto(el: HTMLElement, latex: string): void {
  el.innerHTML = latex ? `$$${latex}$$` : '';
  window.MathJax?.typesetPromise([el]);
}

export function renderTextOnly(root: HTMLElement, data: ExerciseResponse): void {
  root.innerHTML = '';

  const col = document.createElement('div');
  col.className = 'sol-col';

  const math = document.createElement('div');
  math.className = 'mathjax';

  col.appendChild(math);
  root.appendChild(col);

  renderMathInto(math, (data?.latex_solucion as string) ?? '');
}