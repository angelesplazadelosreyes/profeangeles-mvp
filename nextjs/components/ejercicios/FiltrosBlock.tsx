// nextjs/components/ejercicios/FiltrosBlock.tsx
'use client';

import { MATH_OPTIONS, Nivel, TipoEjercicio } from '@/data/ejercicios';
import NivelSelector from './NivelSelector';

interface Props {
  nivel: Nivel;
  tema: string;
  subtema: string;
  tipoId: string;
  onNivelChange: (n: Nivel) => void;
  onTemaChange: (t: string) => void;
  onSubtemaChange: (s: string) => void;
  onTipoChange: (id: string) => void;
}

export default function FiltrosBlock({
  nivel, tema, subtema, tipoId,
  onNivelChange, onTemaChange, onSubtemaChange, onTipoChange,
}: Props) {
  const temas = Object.keys(MATH_OPTIONS);
  const subtemas = Object.keys(MATH_OPTIONS[tema] ?? {});
  const tipos: TipoEjercicio[] = (MATH_OPTIONS[tema]?.[subtema] ?? [])
    .filter((t) => t.niveles.includes(nivel));

  return (
    <div className="filtros-block">
      <NivelSelector nivelActivo={nivel} onChange={onNivelChange} />

      <div className="filtro-grupo">
        <span className="filtro-label">Tema y subtema</span>
        <div className="selects-row">
          <select
            className="ejercicios-select"
            value={tema}
            onChange={(e) => onTemaChange(e.target.value)}
          >
            {temas.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>

          <select
            className="ejercicios-select"
            value={subtema}
            onChange={(e) => onSubtemaChange(e.target.value)}
          >
            {subtemas.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="filtro-grupo">
        <span className="filtro-label">Tipo de ejercicio</span>
        <div className="tipos-box">
          <div className="tipos-grid">
            {tipos.length === 0 ? (
              <p style={{ fontSize: 13, gridColumn: '1/-1', color: 'var(--color-text-muted)' }}>
                No hay tipos disponibles para este nivel y subtema.
              </p>
            ) : (
              tipos.map((t) => (
                <div
                  key={t.id}
                  className="tipo-item"
                  onClick={() => onTipoChange(t.id)}
                >
                  <div className={[
                    'tipo-radio',
                    t.id === tipoId ? 'tipo-radio--checked' : '',
                  ].join(' ')} />
                  <span className={[
                    'tipo-label',
                    t.id === tipoId ? 'tipo-label--checked' : '',
                  ].join(' ')}>
                    {t.label}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}