// nextjs/components/ejercicios/ColdStartModal.tsx
'use client';

import { useState, useEffect } from 'react';

// ── Tipos ─────────────────────────────────────────────────────────────────

interface Pregunta {
  enunciado: string;
  opciones: number[];
  correcta: number;
}

// ── Colores de botones ────────────────────────────────────────────────────

const COLORES_BOTONES = [
  { bg: '#FF6B9D', shadow: '#c2456f' },
  { bg: '#4ECDC4', shadow: '#2a9992' },
  { bg: '#FFD93D', shadow: '#c9a800' },
  { bg: '#6BCB77', shadow: '#3d9e4a' },
  { bg: '#A855F7', shadow: '#7c22d4' },
  { bg: '#FF8C42', shadow: '#c45e10' },
];

function coloresBotones(): typeof COLORES_BOTONES {
  const shuffled = [...COLORES_BOTONES].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, 3);
}

// ── Generador de preguntas ────────────────────────────────────────────────

function generarPregunta(): Pregunta {
  const tipo = Math.floor(Math.random() * 4);

  let a: number, b: number, correcta: number, enunciado: string;

  if (tipo === 0) {
    // Suma: 10–50
    a = Math.floor(Math.random() * 41) + 10;
    b = Math.floor(Math.random() * 41) + 10;
    correcta = a + b;
    enunciado = `${a} + ${b}`;
  } else if (tipo === 1) {
    // Resta: resultado siempre positivo
    a = Math.floor(Math.random() * 41) + 20;
    b = Math.floor(Math.random() * (a - 1)) + 1;
    correcta = a - b;
    enunciado = `${a} − ${b}`;
  } else if (tipo === 2) {
    // Multiplicación: tablas del 2 al 12
    a = Math.floor(Math.random() * 11) + 2;
    b = Math.floor(Math.random() * 11) + 2;
    correcta = a * b;
    enunciado = `${a} × ${b}`;
  } else {
    // División exacta
    b = Math.floor(Math.random() * 10) + 2;
    correcta = Math.floor(Math.random() * 12) + 2;
    a = b * correcta;
    enunciado = `${a} ÷ ${b}`;
  }

  // Distractores plausibles según magnitud
  const rango = Math.max(3, Math.floor(correcta * 0.15));
  const distractores = new Set<number>();
  let intentos = 0;
  while (distractores.size < 2 && intentos < 100) {
    intentos++;
    const delta = Math.floor(Math.random() * rango * 2) - rango;
    const d = correcta + delta;
    if (d !== correcta && d > 0) distractores.add(d);
  }

  const opciones = [...distractores, correcta].sort(() => Math.random() - 0.5);
  return { enunciado, opciones, correcta };
}

// ── Mensajes finales ──────────────────────────────────────────────────────

function mensajeFinal(aciertos: number, total: number): string {
  if (total === 0) return '¡El servidor ya está listo!';
  const pct = aciertos / total;
  if (pct === 1)   return '¡Perfecto! Todas correctas 🏆';
  if (pct >= 0.75) return '¡Muy bien! Casi perfecto 🌟';
  if (pct >= 0.5)  return '¡Bien! Vas por buen camino 👍';
  return '¡Sigue practicando! 💪';
}

// ── Spinner ───────────────────────────────────────────────────────────────

function Spinner() {
  return (
    <div style={{
      width: 36,
      height: 36,
      border: '3px solid #e5e7eb',
      borderTop: '3px solid #6366f1',
      borderRadius: '50%',
      animation: 'cs-spin 0.9s linear infinite',
      margin: '0 auto',
    }} />
  );
}

// ── Props ─────────────────────────────────────────────────────────────────

interface Props {
  visible: boolean;
}

// ── Componente principal ──────────────────────────────────────────────────

export default function ColdStartModal({ visible }: Props) {
  const [pregunta,    setPregunta]    = useState<Pregunta | null>(null);
  const [colores,     setColores]     = useState<typeof COLORES_BOTONES>([]);
  const [feedback,    setFeedback]    = useState<'ok' | 'error' | null>(null);
  const [aciertos,    setAciertos]    = useState(0);
  const [desaciertos, setDesaciertos] = useState(0);
  const [finalizado,  setFinalizado]  = useState(false);

  useEffect(() => {
    if (!visible) return;
    const p = generarPregunta();
    setPregunta(p);
    setColores(coloresBotones());
    setFeedback(null);
    setAciertos(0);
    setDesaciertos(0);
    setFinalizado(false);
  }, [visible]);

  useEffect(() => {
    if (!visible && (aciertos + desaciertos) > 0) {
      setFinalizado(true);
      const t = setTimeout(() => setFinalizado(false), 2500);
      return () => clearTimeout(t);
    }
  }, [visible]);

  if (!visible && !finalizado) return null;

  function elegir(opcion: number) {
    if (!pregunta || feedback !== null) return;
    const esCorrecta = opcion === pregunta.correcta;

    if (esCorrecta) {
      setFeedback('ok');
      setAciertos(a => a + 1);
    } else {
      setFeedback('error');
      setDesaciertos(d => d + 1);
    }

    setTimeout(() => {
      const p = generarPregunta();
      setPregunta(p);
      setColores(coloresBotones());
      setFeedback(null);
    }, 900);
  }

  const total = aciertos + desaciertos;

  // ── Pantalla final ──────────────────────────────────────────────────────
  if (finalizado) {
    return (
      <div className="coldstart-overlay">
        <div className="coldstart-modal">
          <p style={{ fontSize: 48, textAlign: 'center', margin: 0 }}>
            {aciertos === total && total > 0 ? '🏆' : '🎯'}
          </p>
          <p className="coldstart-resultado">
            {mensajeFinal(aciertos, total)}
          </p>
          <p className="coldstart-progreso" style={{ textAlign: 'center' }}>
            {aciertos} de {total} correctas
          </p>
        </div>
      </div>
    );
  }

  // ── Modal principal ─────────────────────────────────────────────────────
  return (
    <>
      <style>{`
        @keyframes cs-spin {
          to { transform: rotate(360deg); }
        }
        @keyframes cs-pop {
          0%   { transform: scale(0.85); opacity: 0; }
          100% { transform: scale(1);    opacity: 1; }
        }
        .cs-btn {
          border: none;
          border-radius: 14px;
          font-size: 22px;
          font-weight: 700;
          color: white;
          cursor: pointer;
          padding: 16px 0;
          flex: 1;
          transition: transform 0.1s, filter 0.1s;
          letter-spacing: 0.5px;
        }
        .cs-btn:hover:not(:disabled) {
          filter: brightness(1.08);
          transform: translateY(-2px);
        }
        .cs-btn:active:not(:disabled) {
          transform: translateY(1px);
        }
        .cs-btn:disabled { opacity: 0.6; cursor: default; }
        .cs-btn--ok    { animation: cs-pop 0.2s ease; }
        .cs-btn--error { animation: cs-pop 0.2s ease; }
      `}</style>

      <div className="coldstart-overlay">
        <div className="coldstart-modal">

          {/* Spinner + título */}
          <Spinner />
          <p className="coldstart-title" style={{ textAlign: 'center', marginTop: 12 }}>
            Despertando el servidor…
          </p>
          <p className="coldstart-dato">
            El servidor gratuito se duerme si no lo usan.<br />
            Puede tardar hasta 50 segundos la primera vez.
          </p>

          {/* Mini-juego */}
          {pregunta && (
            <div className="coldstart-minijuego">

              {/* Operación llamativa */}
              <p style={{
                fontSize: 42,
                fontWeight: 800,
                textAlign: 'center',
                color: '#6366f1',
                letterSpacing: 2,
                margin: '8px 0',
                lineHeight: 1.1,
              }}>
                {pregunta.enunciado}
              </p>

              {/* Botones */}
              <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
                {pregunta.opciones.map((op, i) => {
                  const color = colores[i] ?? { bg: '#6366f1', shadow: '#4338ca' };
                  const esCorrecta = op === pregunta.correcta;
                  const claseExtra =
                    feedback === 'ok'    && esCorrecta  ? 'cs-btn--ok'    :
                    feedback === 'error' && esCorrecta  ? 'cs-btn--ok'    :
                    feedback === 'error' && !esCorrecta ? 'cs-btn--error' : '';

                  return (
                    <button
                      key={op}
                      className={`cs-btn ${claseExtra}`}
                      style={{
                        background: color.bg,
                        boxShadow: `0 5px 0 ${color.shadow}`,
                        border: `2px solid ${color.shadow}`,
                      }}
                      onClick={() => elegir(op)}
                      disabled={feedback !== null}
                    >
                      {op}
                    </button>
                  );
                })}
              </div>

              {/* Feedback */}
              {feedback && (
                <p className={`coldstart-feedback coldstart-feedback--${feedback}`}
                   style={{ textAlign: 'center', fontSize: 15, marginTop: 6 }}>
                  {feedback === 'ok' ? '✓ ¡Correcto!' : '✗ Incorrecto'}
                </p>
              )}

              {/* Marcador */}
              <p className="coldstart-progreso" style={{ textAlign: 'right', marginTop: 4 }}>
                Aciertos: {aciertos} · Desaciertos: {desaciertos}
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}