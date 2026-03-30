// nextjs/components/ejercicios/NivelSelector.tsx
'use client';

import { NIVELES, Nivel } from '@/data/ejercicios';

interface Props {
  nivelActivo: Nivel;
  onChange: (nivel: Nivel) => void;
}

export default function NivelSelector({ nivelActivo, onChange }: Props) {
  return (
    <div className="filtro-grupo">
      <span className="filtro-label">Nivel</span>
      <div className="chips-row">
        {NIVELES.map((n) => (
          <button
            key={n}
            className={['chip', n === nivelActivo ? 'chip--selected' : ''].join(' ')}
            onClick={() => onChange(n)}
          >
            {n}
          </button>
        ))}
      </div>
    </div>
  );
}