// nextjs/components/ejercicios/EjercicioArea.tsx
'use client';

import { useEffect, useRef } from 'react';
import { ExerciseResponse } from '@/lib/api.client';

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

  // Renderiza LaTeX cuando cambia el ejercicio
  useEffect(() => {
    if (!ejercicio || !enunciadoRef.current) return;

    const latex = ejercicio.latex_enunciado ?? '';
    enunciadoRef.current.innerHTML = latex ? `$$${latex}$$` : '';

    window.MathJax?.typesetPromise([enunciadoRef.current]);
  }, [ejercicio]);

  // Renderiza solución cuando se pide mostrar
  useEffect(() => {
    if (!ejercicio || !mostrarSolucion || !solucionRef.current) return;

    // Renderizado básico — en la siguiente iteración se integra el registry
    const sol = ejercicio.latex_solucion as string | undefined;
    solucionRef.current.innerHTML = sol ? `$$${sol}$$` : '';
    window.MathJax?.typesetPromise([solucionRef.current]);
  }, [ejercicio, mostrarSolucion]);

  if (!ejercicio && !status && !error) return null;

  return (
    <div className="ejercicio-area">
      {/* Status / error */}
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

      {/* Enunciado */}
      {ejercicio && (
        <>
          <div>
            <div className="ejercicio-seccion-label">Enunciado</div>
            <div className="ejercicio-enunciado" ref={enunciadoRef} />
          </div>

          {/* Solución */}
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