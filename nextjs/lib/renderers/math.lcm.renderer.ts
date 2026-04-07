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

  // Encabezado
  const thead = document.createElement('thead');
  const trHead = document.createElement('tr');

  const thNums = document.createElement('th');
  thNums.textContent = 'Números';
  thNums.colSpan = solucion.numeros.length;
  trHead.appendChild(thNums);

  const thDiv = document.createElement('th');
  thDiv.textContent = 'Divisor primo';
  thDiv.className = 'lcm-col-divisor';
  trHead.appendChild(thDiv);

  thead.appendChild(trHead);
  tabla.appendChild(thead);

  const tbody = document.createElement('tbody');

  // Primera fila: números originales + divisores[0]
  const trPrimera = document.createElement('tr');
  solucion.numeros.forEach((n) => {
    const td = document.createElement('td');
    td.textContent = String(n);
    trPrimera.appendChild(td);
  });
  const tdDivPrimero = document.createElement('td');
  tdDivPrimero.textContent = String(solucion.divisores[0]);
  tdDivPrimero.className = 'lcm-col-divisor';
  trPrimera.appendChild(tdDivPrimero);
  tbody.appendChild(trPrimera);

  // Filas intermedias: filas[0..N-2] + divisores[1..N-1]
  solucion.filas.slice(0, -1).forEach((fila, i) => {
    const tr = document.createElement('tr');
    fila.valores.forEach((v) => {
      const td = document.createElement('td');
      td.textContent = String(v);
      tr.appendChild(td);
    });
    const tdDiv = document.createElement('td');
    tdDiv.textContent = String(solucion.divisores[i + 1]);
    tdDiv.className = 'lcm-col-divisor';
    tr.appendChild(tdDiv);
    tbody.appendChild(tr);
  });

  // Fila final: última fila de filas (los unos), sin divisor
  const trFinal = document.createElement('tr');
  trFinal.className = 'lcm-fila-final';
  const ultimaFila = solucion.filas[solucion.filas.length - 1];
  ultimaFila.valores.forEach((v) => {
    const td = document.createElement('td');
    td.textContent = String(v);
    trFinal.appendChild(td);
  });
  const tdVacia = document.createElement('td');
  trFinal.appendChild(tdVacia);
  tbody.appendChild(trFinal);

  tabla.appendChild(tbody);
  wrap.appendChild(tabla);

  // ── Resultado ──────────────────────────────────────────────────────────
  const resultado = document.createElement('div');
  resultado.className = 'lcm-resultado';
  resultado.innerHTML = `<span class="lcm-operacion">MCM = ${solucion.operacion}</span>`;
  wrap.appendChild(resultado);

  root.appendChild(wrap);
}