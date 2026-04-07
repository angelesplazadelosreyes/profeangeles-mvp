// nextjs/components/ejercicios/EjercicioArea.tsx
'use client';

import { useEffect, useRef } from 'react';
import { ExerciseResponse } from '@/lib/api.client';
import { selectRendererKey, loadRenderer } from '@/lib/renderers/registry';

interface Props {
  ejercicio: ExerciseResponse | null;
  mostrarSolucion: boolean;
  status: string;
  error: string | null;
  onReintentar: () => void;
}

declare global {
  interface Window {
    MathJax?: {
      typesetPromise: (els?: HTMLElement[]) => Promise<void>;
    };
  }
}

export default function EjercicioArea({
  ejercicio, mostrarSolucion, status, error, onReintentar,
}: Props) {
  const enunciadoRef = useRef<HTMLDivElement>(null);
  const solucionRef  = useRef<HTMLDivElement>(null);

  // Renderiza enunciado cuando cambia el ejercicio
  useEffect(() => {
    if (!ejercicio || !enunciadoRef.current) return;

    const el = enunciadoRef.current;
    const latex = (ejercicio.latex_enunciado as string) ?? '';
    const texto = (ejercicio.enunciado as string) ?? '';

    if (latex) {
      el.innerHTML = `$$${latex}$$`;
      window.MathJax?.typesetPromise([el]);
    } else if (texto) {
      el.innerHTML = '';
      const p = document.createElement('p');
      p.textContent = texto;
      el.appendChild(p);
    } else {
      el.innerHTML = '';
    }
  }, [ejercicio]);

  // Renderiza solución con el renderer correcto
  useEffect(() => {
    if (!ejercicio || !mostrarSolucion || !solucionRef.current) return;

    const root = solucionRef.current;
    root.innerHTML = '';

    const key = selectRendererKey(ejercicio);
    loadRenderer(key).then((renderFn) => {
      renderFn(root, ejercicio);
    });
  }, [ejercicio, mostrarSolucion]);

  if (!ejercicio && !status && !error) return null;

  return (
    <div className="ejercicio-area">
      {status && !error && (
        <p className="ejercicio-status">{status}</p>
      )}
      {error && (
        <p className="ejercicio-status ejercicio-status--error">
          <span>{error}</span>
          <button className="btn-reintentar" onClick={onReintentar}>
            Reintentar
          </button>
        </p>
      )}

      {ejercicio && (
        <>
          <div>
            <div className="ejercicio-seccion-label">Enunciado</div>
            <div className="ejercicio-enunciado" ref={enunciadoRef} />
          </div>

          {mostrarSolucion && (
            <div className="ejercicio-solucion">
              <div className="ejercicio-seccion-label">Solución</div>
              <div ref={solucionRef} />
            </div>
          )}
        </>
      )}
    </div>
  );
}