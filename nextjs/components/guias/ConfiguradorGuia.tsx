// nextjs/components/guias/ConfiguradorGuia.tsx
'use client';

export const SKILLS: { id: string; label: string }[] = [
  { id: 'concavity',        label: 'Concavidad' },
  { id: 'discriminant',     label: 'Discriminante' },
  { id: 'roots',            label: 'Raíces' },
  { id: 'axis',             label: 'Eje de simetría' },
  { id: 'vertex',           label: 'Vértice' },
  { id: 'y_intercept',      label: 'Intersección eje Y' },
  { id: 'domain',           label: 'Dominio' },
  { id: 'range',            label: 'Recorrido' },
  { id: 'canonical_form',   label: 'Forma canónica' },
  { id: 'factorized_form',  label: 'Forma factorizada' },
  { id: 'graph',            label: 'Gráfico' },
  { id: 'inverse',          label: 'Función inversa' },
];

export const CANTIDADES = [5, 10, 20] as const;
export type Cantidad = typeof CANTIDADES[number];

interface Props {
  cantidad:    Cantidad;
  skills:      string[];
  cargando:    boolean;
  onCantidad:  (n: Cantidad) => void;
  onToggle:    (id: string) => void;
  onGenerar:   () => void;
  error:       string | null;
}

export default function ConfiguradorGuia({
  cantidad,
  skills,
  cargando,
  onCantidad,
  onToggle,
  onGenerar,
  error,
}: Props) {
  const ningunaSeleccionada = skills.length === 0;

  return (
    <div className="guias-card">
      {/* Nota cold start */}
      <div className="guias-note">
        <span className="guias-note-icon">⏱</span>
        <span>
          La generación puede tardar unos segundos la primera vez — el servidor
          se despierta al primer uso.
        </span>
      </div>

      {/* Selectores */}
      <div className="guias-config-row">
        <div className="guias-field">
          <label htmlFor="guias-materia">Materia</label>
          <select id="guias-materia" disabled>
            <option>Función cuadrática</option>
          </select>
        </div>

        <div className="guias-field">
          <label htmlFor="guias-cantidad">Cantidad de ejercicios</label>
          <select
            id="guias-cantidad"
            value={cantidad}
            onChange={(e) => onCantidad(Number(e.target.value) as Cantidad)}
            disabled={cargando}
          >
            {CANTIDADES.map((n) => (
              <option key={n} value={n}>
                {n} ejercicios
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Checklist habilidades */}
      <p className="guias-section-title">Habilidades a evaluar</p>
      <div className="guias-skills-grid">
        {SKILLS.map((s) => {
          const activo = skills.includes(s.id);
          return (
            <label
              key={s.id}
              className={`guias-skill-chip${activo ? ' activo' : ''}`}
            >
              <input
                type="checkbox"
                checked={activo}
                onChange={() => onToggle(s.id)}
                disabled={cargando}
              />
              {s.label}
            </label>
          );
        })}
      </div>

      <div className="guias-divider" />

      {/* Acción */}
      <div className="guias-action-row">
        <button
          className="guias-btn-primary"
          onClick={onGenerar}
          disabled={cargando || ningunaSeleccionada}
        >
          {cargando ? 'Generando PDF…' : 'Generar y descargar PDF'}
        </button>
        {ningunaSeleccionada && !cargando && (
          <span className="guias-action-hint">
            Selecciona al menos una habilidad
          </span>
        )}
        {!ningunaSeleccionada && !cargando && (
          <span className="guias-action-hint">
            Recibirás un PDF listo para imprimir
          </span>
        )}
      </div>

      {/* Error */}
      {error && <div className="guias-error">{error}</div>}
    </div>
  );
}
