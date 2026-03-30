// nextjs/components/ejercicios/Sidebar.tsx
'use client';

import { MATERIAS } from '@/data/ejercicios';

interface Props {
  materiaActiva: string;
  onSelect: (id: string) => void;
}

export default function Sidebar({ materiaActiva, onSelect }: Props) {
  return (
    <aside className="ejercicios-sidebar">
      <div className="sidebar-title">MATERIAS</div>
      {MATERIAS.map((m) => (
        <button
          key={m.id}
          className={[
            'sidebar-item',
            m.id === materiaActiva ? 'sidebar-item--active' : '',
            !m.disponible ? 'sidebar-item--disabled' : '',
          ].join(' ')}
          onClick={() => m.disponible && onSelect(m.id)}
          aria-current={m.id === materiaActiva ? 'page' : undefined}
          disabled={!m.disponible}
        >
          <span className="sidebar-dot" />
          {m.label}
          {!m.disponible && (
            <span className="sidebar-item__soon">pronto</span>
          )}
        </button>
      ))}
    </aside>
  );
}