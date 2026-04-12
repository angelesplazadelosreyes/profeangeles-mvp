// nextjs/components/auth/InfoRegistroModal.tsx
'use client';

interface Props {
  visible: boolean;
  onClose: () => void;
  onBackToLogin: () => void;
}

export default function InfoRegistroModal({ visible, onClose, onBackToLogin }: Props) {
  if (!visible) return null;

  return (
    <>
      <style>{`
        @keyframes lm-entrada {
          from { transform: scale(0.88); opacity: 0; }
          to   { transform: scale(1);    opacity: 1; }
        }
        .lm-overlay {
          position: fixed; inset: 0; z-index: 1000;
          background: rgba(0,0,0,0.45);
          backdrop-filter: blur(4px);
          display: flex; align-items: center; justify-content: center;
          padding: 1rem;
        }
        .lm-modal {
          background: var(--bg-card);
          border-radius: 1.25rem;
          padding: 2.5rem 2rem;
          width: 100%; max-width: 420px;
          box-shadow: 0 8px 40px rgba(0,0,0,0.18);
          animation: lm-entrada 0.22s ease;
          display: flex; flex-direction: column; gap: 1rem;
          position: relative;
        }
        .lm-close {
          position: absolute; top: 1rem; right: 1rem;
          background: none; border: none;
          font-size: 1.2rem; cursor: pointer;
          color: var(--txt-muted);
        }
        .lm-title {
          font-size: 1.2rem; font-weight: 800;
          color: var(--txt); text-align: center; margin: 0;
        }
        .lm-body {
          font-size: 0.92rem; line-height: 1.7;
          color: var(--txt); margin: 0;
        }
        .lm-benefit {
          display: flex; align-items: flex-start; gap: 0.6rem;
          font-size: 0.9rem; color: var(--txt);
        }
        .lm-btn-whatsapp {
          width: 100%; padding: 0.8rem;
          background: #23C660;
          color: #fff; font-weight: 700;
          font-size: 0.95rem; text-align: center;
          border: none; border-radius: 0.75rem;
          cursor: pointer; text-decoration: none;
          display: block; box-sizing: border-box;
        }
        .lm-btn-secondary {
          width: 100%; padding: 0.75rem;
          background: none;
          border: 2px solid var(--primary);
          color: var(--primary); font-weight: 700;
          font-size: 0.92rem;
          border-radius: 0.75rem;
          cursor: pointer;
          transition: background 0.2s, color 0.2s;
        }
        .lm-btn-secondary:hover {
          background: var(--primary); color: #fff;
        }
      `}</style>

      <div className="lm-overlay" onClick={onClose}>
        <div className="lm-modal" onClick={e => e.stopPropagation()}>

          <button className="lm-close" onClick={onClose}>✕</button>

          <p className="lm-title">
            <span style={{ fontSize: '1.5rem' }}>🎒</span><br />
            ¿Cómo obtener una cuenta?
          </p>

          <p className="lm-body">
            Las cuentas son para estudiantes de ProfeÁngeles.
            Si tomas clases, escríbeme y te creo una cuenta personalizada.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            <div className="lm-benefit">
              <span>📚</span>
              <span>Tu nivel educativo cargado por defecto en ejercicios y guías</span>
            </div>
            <div className="lm-benefit">
              <span>🏆</span>
              <span>Registro de tus puntajes y progreso en los juegos</span>
            </div>
            <div className="lm-benefit">
              <span>🎯</span>
              <span>Juegos personalizados según tus áreas de mejora</span>
            </div>
            <div className="lm-benefit">
              <span>✨</span>
              <span>Contenido especial para tu nivel</span>
            </div>
          </div>

          <a
            href="https://wa.me/56971312255"
            target="_blank"
            rel="noopener noreferrer"
            className="lm-btn-whatsapp"
          >
            {'💬'} Escríbeme por WhatsApp
          </a>

          <button className="lm-btn-secondary" onClick={onBackToLogin}>
            ← Volver al inicio de sesión
          </button>

        </div>
      </div>
    </>
  );
}