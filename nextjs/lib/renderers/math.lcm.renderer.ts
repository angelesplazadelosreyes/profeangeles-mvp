// nextjs/lib/renderers/math.lcm.renderer.ts

import { ExerciseResponse } from '@/lib/api.client';

interface LcmFila {
  divisor: number;
  valores: number[];
}

interface LcmSolucion {
  numeros:   number[];
  filas:     LcmFila[];
  divisores: number[];
  mcm:       number;
  operacion: string;
}

export function renderLcm(root: HTMLElement, data: ExerciseResponse): void {
  root.innerHTML = '';

  const solucion = data.solucion as LcmSolucion;
  if (!solucion) return;

  const wrap = document.createElement('div');
  wrap.className = 'lcm-solucion';

  // ── Tabla de la escalera ───────────────────────────────────────────────
  const tabla = document.createElement('table');
  tabla.className = 'lcm-tabla';

  // Encabezado con los números originales
  const thead = document.createElement('thead');
  const trHead = document.createElement('tr');

  solucion.numeros.forEach((n) => {
    const th = document.createElement('th');
    th.textContent = String(n);
    trHead.appendChild(th);
  });

  // Columna del divisor
  const thDiv = document.createElement('th');
  thDiv.textContent = 'Divisor';
  thDiv.className = 'lcm-col-divisor';
  trHead.appendChild(thDiv);

  thead.appendChild(trHead);
  tabla.appendChild(thead);

  // Filas de la escalera
  const tbody = document.createElement('tbody');

  solucion.filas.forEach((fila) => {
    const tr = document.createElement('tr');

    fila.valores.forEach((v) => {
      const td = document.createElement('td');
      td.textContent = String(v);
      tr.appendChild(td);
    });

    const tdDiv = document.createElement('td');
    tdDiv.textContent = String(fila.divisor);
    tdDiv.className = 'lcm-col-divisor';
    tr.appendChild(tdDiv);

    tbody.appendChild(tr);
  });

  // Fila final de unos
  const trFinal = document.createElement('tr');
  trFinal.className = 'lcm-fila-final';
  solucion.numeros.forEach(() => {
    const td = document.createElement('td');
    td.textContent = '1';
    trFinal.appendChild(td);
  });
  // Celda vacía en columna divisor
  const tdVacia = document.createElement('td');
  trFinal.appendChild(tdVacia);
  tbody.appendChild(trFinal);

  tabla.appendChild(tbody);
  wrap.appendChild(tabla);

  // ── Operación y resultado ──────────────────────────────────────────────
  const resultado = document.createElement('div');
  resultado.className = 'lcm-resultado';
  resultado.innerHTML = `
    <span class="lcm-operacion">MCM = ${solucion.operacion}</span>
  `;
  wrap.appendChild(resultado);

  root.appendChild(wrap);
}