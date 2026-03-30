// nextjs/components/ejercicios/ColdStartModal.tsx
'use client';

import { useState, useEffect } from 'react';

interface Pregunta {
  enunciado: string;
  opciones: number[];
  correcta: number;
}

function generarPregunta(): Pregunta {
  const a = Math.floor(Math.random() * 9) + 1;
  const b = Math.floor(Math.random() * 9) + 1;
  const ops = ['+', '-', '×'] as const;
  const op  = ops[Math.floor(Math.random() * ops.length)];
  const correcta = op === '+' ? a + b : op === '-' ? a - b : a * b;

  const distractores = new Set<number>();
  while (distractores.size < 2) {
    const d = correcta + (Math.floor(Math.random() * 6) - 3);
    if (d !== correcta) distractores.add(d);
  }

  const opciones = [...distractores, correcta].sort(() => Math.random() - 0.5);
  return { enunciado: `${a} ${op} ${b}`, opciones, correcta };
}

interface Props {
  visible: boolean;
}

export default function ColdStartModal({ visible }: Props) {
  const [pregunta,   setPregunta]   = useState<Pregunta | null>(null);
  const [feedback,   setFeedback]   = useState<'ok' | 'error' | null>(null);
  const [aciertos,   setAciertos]   = useState(0);
  const [desaciertos, setDesaciertos] = useState(0);
  const [finalizado, setFinalizado] = useState(false);

  useEffect(() => {
    if (!visible) return;
    setPregunta(generarPregunta());
    setFeedback(null);
    setAciertos(0);
    setDesaciertos(0);
    setFinalizado(false);
  }, [visible]);

  // Mostrar resultado final justo antes de que desaparezca el modal
  useEffect(() => {
    if (!visible && (aciertos + desaciertos) > 0) {
      setFinalizado(true);
    }
  }, [visible]);

  if (!visible && !finalizado) return null;

  function elegir(opcion: number) {
    if (!pregunta || feedback !== null) return;

    if (opcion === pregunta.correcta) {
      setFeedback('ok');
      setAciertos(a => a + 1);
      setTimeout(() => {
        setPregunta(generarPregunta());
        setFeedback(null);
      }, 800);
    } else {
      setFeedback('error');
      setDesaciertos(d => d + 1);
      setTimeout(() => {
        setPregunta(generarPregunta());
        setFeedback(null);
      }, 800);
    }
  }

  const total = aciertos + desaciertos;

  if (finalizado) {
    return (
      <div className="coldstart-overlay">
        <div className="coldstart-modal">
          <p className="coldstart-resultado">
            Le atinaste a {aciertos} de {total} 🎉
          </p>
          {aciertos === total && total > 0 && (
            <p className="coldstart-felicidades">¡Felicidades!</p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="coldstart-overlay">
      <div className="coldstart-modal">
        {pregunta && (
          <div className="coldstart-minijuego">
            <p className="coldstart-pregunta">
              ¿Cuánto es {pregunta.enunciado}?
            </p>
            <div className="coldstart-opciones">
              {pregunta.opciones.map((op) => (
                <button
                  key={op}
                  className={[
                    'coldstart-opcion',
                    feedback === 'ok' && op === pregunta.correcta
                      ? 'coldstart-opcion--ok' : '',
                    feedback === 'error' && op === pregunta.correcta
                      ? 'coldstart-opcion--ok' : '',
                    feedback === 'error' && op !== pregunta.correcta
                      ? 'coldstart-opcion--error' : '',
                  ].join(' ')}
                  onClick={() => elegir(op)}
                >
                  {op}
                </button>
              ))}
            </div>
            {feedback && (
              <p className={`coldstart-feedback coldstart-feedback--${feedback}`}>
                {feedback === 'ok' ? '¡Correcto!' : 'Incorrecto'}
              </p>
            )}
            <p className="coldstart-progreso">
              Aciertos: {aciertos} · Desaciertos: {desaciertos}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}