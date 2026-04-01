// nextjs/components/guias/PreviewGuia.tsx

interface Props {
  skills: string[];
}

const SKILL_LABELS: Record<string, string> = {
  concavity:       'Concavidad',
  discriminant:    'Discriminante',
  roots:           'Raíces',
  axis:            'Eje de simetría',
  vertex:          'Vértice',
  y_intercept:     'Intersección eje Y',
  domain:          'Dominio',
  range:           'Recorrido',
  canonical_form:  'Forma canónica',
  factorized_form: 'Forma factorizada',
  graph:           'Gráfico',
  inverse:         'Función inversa',
};

export default function PreviewGuia({ skills }: Props) {
  const tags = skills.map((id) => SKILL_LABELS[id] ?? id);

  return (
    <div className="guias-preview">
      <p className="guias-preview-label">Así se verá el PDF generado</p>

      {/* Ejercicio 1 */}
      <div className="guias-preview-ex">
        <p className="guias-preview-ex-num">Ejercicio 1</p>
        <p className="guias-preview-ex-body">
          Dada la función <code>f(x) = 2x² − 5x + 3</code>, determina lo
          que se indica.
        </p>
        {tags.length > 0 && (
          <div className="guias-preview-ex-tags">
            {tags.map((t) => (
              <span key={t} className="guias-tag">{t}</span>
            ))}
          </div>
        )}
      </div>

      {/* Ejercicio 2 */}
      <div className="guias-preview-ex">
        <p className="guias-preview-ex-num">Ejercicio 2</p>
        <p className="guias-preview-ex-body">
          Para <code>f(x) = −x² + 4x − 1</code>, determina lo que se indica.
        </p>
        {tags.length > 0 && (
          <div className="guias-preview-ex-tags">
            {tags.map((t) => (
              <span key={t} className="guias-tag">{t}</span>
            ))}
          </div>
        )}
      </div>

      {/* Puntos suspensivos */}
      <p className="guias-preview-dots">· · ·</p>

      {/* Solucionario */}
      <div className="guias-solucionario-sep">
        <p className="guias-solucionario-title">— Solucionario —</p>
        <p className="guias-solucionario-item">
          Ejercicio 1: Raíces x = 1, x = 3/2 · Vértice (5/4, −1/8) · Concavidad hacia arriba
        </p>
        <p className="guias-solucionario-item">
          Ejercicio 2: Raíces x = 2 ± √3 · Vértice (2, 3) · Concavidad hacia abajo
        </p>
      </div>
    </div>
  );
}
