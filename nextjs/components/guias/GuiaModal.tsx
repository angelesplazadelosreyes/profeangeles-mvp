// nextjs/components/guias/GuiaModal.tsx
'use client';

import { useState, useEffect, useRef } from 'react';

const CURIOSIDADES = [
  {
    icono: '0',
    titulo: 'Sabias que...',
    texto: 'El cero es el unico numero que no es positivo ni negativo. Tardo siglos en ser aceptado como numero valido.',
  },
  {
    icono: 'f(x)',
    titulo: 'Funcion cuadratica',
    texto: 'La trayectoria de un balon de futbol describe una parabola, exactamente la grafica de una funcion cuadratica.',
  },
  {
    icono: 'inf',
    titulo: 'El infinito',
    texto: 'Hay infinitos mas grandes que otros. El conjunto de los numeros reales es "mas infinito" que el de los naturales.',
  },
  {
    icono: 'phi',
    titulo: 'El numero de oro',
    texto: 'El numero aureo 1.618 aparece en las espirales de las conchas, en el arte renacentista y en la naturaleza.',
  },
  {
    icono: '23',
    titulo: 'Paradoja del cumpleanos',
    texto: 'En un grupo de 23 personas, la probabilidad de que dos compartan cumpleanos supera el 50%.',
  },
  {
    icono: 'b2-4ac',
    titulo: 'El discriminante',
    texto: 'El discriminante b2-4ac no solo dice si hay raices: su valor exacto determina si la parabola toca, cruza o evita el eje X.',
  },
  {
    icono: 'pi',
    titulo: 'Pi en todas partes',
    texto: 'El numero pi aparece en formulas de probabilidad, fisica cuantica y estadistica, incluso donde no hay circulos a la vista.',
  },
  {
    icono: 'V',
    titulo: 'Vertice = punto optimo',
    texto: 'El vertice de una parabola representa el maximo o minimo de una funcion. Por eso se usa en economia para maximizar ganancias.',
  },
  {
    icono: 'III a.C.',
    titulo: 'Los griegos y la parabola',
    texto: 'Apolonio de Perga describio la parabola en el siglo III a.C. La palabra viene del griego "parabole", que significa comparacion.',
  },
  {
    icono: 'e',
    titulo: 'El numero de Euler',
    texto: 'El numero e (aprox. 2.718) es la base del crecimiento natural. Aparece en interes compuesto, poblaciones y radioactividad.',
  },
];

function Spinner() {
  return (
    <div style={{
      width: 36,
      height: 36,
      border: '3px solid #e5e7eb',
      borderTop: '3px solid #6366f1',
      borderRadius: '50%',
      animation: 'gm-spin 0.9s linear infinite',
      margin: '0 auto',
    }} />
  );
}

interface Props {
  visible: boolean;
  cantidad?: number;
}

export default function GuiaModal({ visible, cantidad }: Props) {
  const [indice, setIndice]   = useState(0);
  const [fadeIn, setFadeIn]   = useState(true);
  const intervaloRef          = useRef<ReturnType<typeof setInterval> | null>(null);
  const curiosidadesRef       = useRef([...CURIOSIDADES].sort(() => Math.random() - 0.5));

  useEffect(() => {
    if (!visible) {
      if (intervaloRef.current) clearInterval(intervaloRef.current);
      return;
    }

    curiosidadesRef.current = [...CURIOSIDADES].sort(() => Math.random() - 0.5);
    setIndice(0);
    setFadeIn(true);

    intervaloRef.current = setInterval(() => {
      setFadeIn(false);
      setTimeout(() => {
        setIndice((i) => (i + 1) % curiosidadesRef.current.length);
        setFadeIn(true);
      }, 300);
    }, 5000);

    return () => {
      if (intervaloRef.current) clearInterval(intervaloRef.current);
    };
  }, [visible]);

  if (!visible) return null;

  const cur = curiosidadesRef.current[indice];

  return (
    <>
      <style>{`
        @keyframes gm-spin { to { transform: rotate(360deg); } }
        @keyframes gm-entrada {
          from { transform: scale(0.88); opacity: 0; }
          to   { transform: scale(1);    opacity: 1; }
        }
        .gm-fade { transition: opacity 0.3s ease; }
        .gm-fade--on  { opacity: 1; }
        .gm-fade--off { opacity: 0; }
        .gm-icono {
          font-size: 13px;
          font-weight: 800;
          font-family: monospace;
          color: #fff;
          background: #6366f1;
          border-radius: 8px;
          padding: 6px 12px;
          display: inline-block;
          letter-spacing: 0.5px;
        }
      `}</style>

      <div className="coldstart-overlay">
        <div className="coldstart-modal" style={{ animation: 'gm-entrada 0.25s ease' }}>

          <Spinner />
          <p className="coldstart-title" style={{ textAlign: 'center', marginTop: 12 }}>
            Generando tu guia...
          </p>
          <p className="coldstart-dato">
            {cantidad
              ? `Preparando ${cantidad} ejercicios con su solucionario.`
              : 'Preparando los ejercicios con su solucionario.'}
            {' '}Puede tardar unos segundos.
          </p>

          <div className={`coldstart-minijuego gm-fade ${fadeIn ? 'gm-fade--on' : 'gm-fade--off'}`}>
            <div style={{ textAlign: 'center', margin: '8px 0 10px' }}>
              <span className="gm-icono">{cur.icono}</span>
            </div>
            <p style={{
              fontSize: 12,
              fontWeight: 700,
              textAlign: 'center',
              color: '#6366f1',
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              marginBottom: 6,
            }}>
              {cur.titulo}
            </p>
            <p style={{
              fontSize: 14,
              lineHeight: 1.65,
              textAlign: 'center',
              color: '#374151',
              margin: 0,
            }}>
              {cur.texto}
            </p>

            <div style={{ display: 'flex', justifyContent: 'center', gap: 5, marginTop: 14 }}>
              {curiosidadesRef.current.map((_, i) => (
                <div key={i} style={{
                  width: 6,
                  height: 6,
                  borderRadius: '50%',
                  background: i === indice ? '#6366f1' : '#d1d5db',
                  transition: 'background 0.3s',
                }} />
              ))}
            </div>
          </div>

        </div>
      </div>
    </>
  );
}
