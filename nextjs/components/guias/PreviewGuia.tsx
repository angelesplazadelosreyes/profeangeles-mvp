// nextjs/components/guias/PreviewGuia.tsx
import { type Modulo } from '@/lib/modules';

interface Props {
  skills: string[];
  modulo: Modulo | null;
}

export default function PreviewGuia({ skills, modulo }: Props) {
  if (!modulo) return null;

  const skillLabels = modulo.skills
    .filter(s => skills.includes(s.id))
    .map(s => s.label);

  const esCuadratica = modulo.key.startsWith('quadratic');

  return (
    <div className="guias-preview">
      <p className="guias-preview-label">Así se verá el PDF generado</p>

      <div className="guias-preview-ex">
        <p className="guias-preview-ex-num">Ejercicio 1</p>
        <p className="guias-preview-ex-body">
          {esCuadratica
            ? <>Dada la función <code>f(x) = 2x² − 5x + 3</code>, determina lo que se indica.</>
            : <>Encuentra el Mínimo Común Múltiplo de: <code>12 y 18</code>.</>
          }
        </p>
        {skillLabels.length > 0 && (
          <div className="guias-preview-ex-tags">
            {skillLabels.map(t => (
              <span key={t} className="guias-tag">{t}</span>
            ))}
          </div>
        )}
      </div>

      <div className="guias-preview-ex">
        <p className="guias-preview-ex-num">Ejercicio 2</p>
        <p className="guias-preview-ex-body">
          {esCuadratica
            ? <>Para <code>f(x) = −x² + 4x − 1</code>, determina lo que se indica.</>
            : <>Encuentra el Mínimo Común Múltiplo de: <code>8, 12 y 20</code>.</>
          }
        </p>
        {skillLabels.length > 0 && (
          <div className="guias-preview-ex-tags">
            {skillLabels.map(t => (
              <span key={t} className="guias-tag">{t}</span>
            ))}
          </div>
        )}
      </div>

      <p className="guias-preview-dots">· · ·</p>

      <div className="guias-solucionario-sep">
        <p className="guias-solucionario-title">— Solucionario —</p>
        {esCuadratica
          ? <>
              <p className="guias-solucionario-item">Ejercicio 1: Raíces x = 1, x = 3/2 · Vértice (5/4, −1/8)</p>
              <p className="guias-solucionario-item">Ejercicio 2: Raíces x = 2 ± √3 · Vértice (2, 3)</p>
            </>
          : <>
              <p className="guias-solucionario-item">Ejercicio 1: MCM(12, 18) = 36</p>
              <p className="guias-solucionario-item">Ejercicio 2: MCM(8, 12, 20) = 120</p>
            </>
        }
      </div>
    </div>
  );
}