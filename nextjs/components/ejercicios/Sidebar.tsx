// nextjs/components/ejercicios/Sidebar.tsx
'use client';

import { MATERIAS } from '@/data/ejercicios';

function IconoMatematicas() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none">
      <rect x="2" y="2" width="20" height="20" rx="4" fill="#FF6B35"/>
      <line x1="7" y1="12" x2="17" y2="12" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
      <line x1="12" y1="7" x2="12" y2="17" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
    </svg>
  );
}

function IconoQuimica() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none">
      <rect x="2" y="2" width="20" height="20" rx="4" fill="#A855F7"/>
      <path d="M9 4 L9 10 L5 18 L19 18 L15 10 L15 4 Z" fill="none" stroke="white" strokeWidth="1.8" strokeLinejoin="round"/>
      <line x1="7.5" y1="7" x2="16.5" y2="7" stroke="white" strokeWidth="1.8" strokeLinecap="round"/>
      <circle cx="10" cy="14" r="1.2" fill="white"/>
      <circle cx="14" cy="15.5" r="0.9" fill="white"/>
    </svg>
  );
}

function IconoBiologia() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none">
      <rect x="2" y="2" width="20" height="20" rx="4" fill="#10B981"/>
      <path d="M12 18 C12 18 6 15 6 9 C6 9 9 6 12 6 C15 6 18 9 18 9 C18 15 12 18 12 18 Z"
            fill="white"/>
      <line x1="12" y1="18" x2="12" y2="10" stroke="#10B981" strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M12 14 C12 14 9 12 8 10" stroke="#10B981" strokeWidth="1.2" strokeLinecap="round"/>
      <path d="M12 12 C12 12 15 11 16 9" stroke="#10B981" strokeWidth="1.2" strokeLinecap="round"/>
    </svg>
  );
}

function IconoFisica() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none">
      <rect x="2" y="2" width="20" height="20" rx="4" fill="#F59E0B"/>
      <text x="12" y="17" textAnchor="middle" fontSize="14" fontWeight="700" 
            fill="white" fontFamily="serif">φ</text>
    </svg>
  );
}

const ICONOS: Record<string, React.ReactNode> = {
  matematicas: <IconoMatematicas />,
  quimica:     <IconoQuimica />,
  biologia:    <IconoBiologia />,
  fisica:      <IconoFisica />,
};

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
          <span className="sidebar-icono">{ICONOS[m.id]}</span>
          {m.label}
          {!m.disponible && (
            <span className="sidebar-item__soon">pronto</span>
          )}
        </button>
      ))}
    </aside>
  );
}