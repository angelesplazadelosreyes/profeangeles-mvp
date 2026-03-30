// nextjs/components/ejercicios/ColdStartModal.tsx
'use client';

import { useState, useEffect } from 'react';

const DATOS_CURIOSOS = [
  'El número π tiene infinitos decimales y nunca se repite.',
  'El cero fue inventado en la India alrededor del siglo VII.',
  'Un googol es 10 elevado a la potencia 100.',
  'Los números de Fibonacci aparecen en la naturaleza: flores, conchas, galaxias.',
  'El número primo más grande conocido tiene más de 24 millones de dígitos.',
];

interface Pregunta {
  enunciado: string;
  respuesta: number;
}

function generarPregunta(): Pregunta {
  const a = Math.floor(Math.random() * 9) + 1;
  const b = Math.floor(Math.random() * 9) + 1;
  const ops = ['+', '-', '×'] as const;
  const op  = ops[Math.floor(Math.random() * ops.length)];
  const respuesta = op === '+' ? a + b : op === '-' ? a - b : a * b;
  return { enunciado: `${a} ${op} ${b} = ?`, respuesta };
}

interface Props {
  visible: boolean;
}

export default function ColdStartModal({ visible }: Props) {
  const [dato, setDato]         = useState('');
  const [pregunta, setPregunta] = useState<Pregunta | null>(null);
  const [input, setInput]       = useState('');
  const [feedback, setFeedback] = useState('');
  const [aciertos, setAciertos] = useState(0);

  useEffect(() => {
    if (!visible) return;
    setDato(DATOS_CURIOSOS[Math.floor(Math.random() * DATOS_CURIOSOS.length)]);
    setPregunta(generarPregunta());
    setInput('');
    setFeedback('');
    setAciertos(0);
  }, [visible]);

  if (!visible) return null;

  function verificar() {
    if (!pregunta) return;
    const intento = parseInt(input, 10);
    if (intento === pregunta.respuesta) {
      const nuevos = aciertos + 1;
      setAciertos(nuevos);
      setFeedback('¡Correcto!');
      setTimeout(() => {
        setPregunta(generarPregunta());
        setInput('');
        setFeedback('');
      }, 800);
    } else {
      setFeedback('Intenta de nuevo');
    }
  }

  return (
    <div className="coldstart-overlay">
      <div className="coldstart-modal">
        <p className="coldstart-title">
          Despertando el servidor… puede tomar hasta 50 segundos.
        </p>

        <div className="coldstart-dato">
          💡 {dato}
        </div>

        {pregunta && (
          <div className="coldstart-minijuego">
            <p className="coldstart-pregunta">
              Mientras esperamos: {pregunta.enunciado}
            </p>
            <div className="coldstart-input-row">
              <input
                className="coldstart-input"
                type="number"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && verificar()}
                autoFocus
              />
              <button className="btn-ejercicio btn-ejercicio--primary" onClick={verificar}>
                Verificar
              </button>
            </div>
            <p className={[
              'coldstart-feedback',
              feedback === '¡Correcto!' ? 'coldstart-feedback--ok' : 'coldstart-feedback--error',
            ].join(' ')}>
              {feedback}
            </p>
            <p className="coldstart-progreso">Aciertos: {aciertos}</p>
          </div>
        )}
      </div>
    </div>
  );
}