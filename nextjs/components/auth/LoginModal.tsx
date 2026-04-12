// nextjs/components/auth/LoginModal.tsx
'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';

interface Props {
  visible: boolean;
  onClose: () => void;
  onInfoClick: () => void;
}

const DOMINIO = '@profeangeles.cl';

export default function LoginModal({ visible, onClose, onInfoClick }: Props) {
  const [usuario, setUsuario]   = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);

  const supabase = createClient();

  async function handleLogin() {
    setError('');
    const nombreLimpio   = usuario.trim().toLowerCase().replace(/\s+/g, '');
    const passwordLimpio = password.trim();

    if (!nombreLimpio)   { setError('Escribe tu nombre de usuario.'); return; }
    if (!passwordLimpio) { setError('Escribe tu contraseña.'); return; }

    setLoading(true);
    const email = `${nombreLimpio}${DOMINIO}`;
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password: passwordLimpio,
    });
    setLoading(false);

    if (error) {
      setError('Usuario o contraseña incorrectos.');
    } else {
      setUsuario('');
      setPassword('');
      onClose();
    }
  }

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
          width: 100%; max-width: 380px;
          box-shadow: 0 8px 40px rgba(0,0,0,0.18);
          animation: lm-entrada 0.22s ease;
          display: flex; flex-direction: column; gap: 1rem;
          position: relative;
        }
        .lm-title {
          font-size: 1.2rem; font-weight: 800;
          color: var(--txt); text-align: center; margin: 0;
        }
        .lm-input {
          width: 100%; padding: 0.75rem 1rem;
          border: 2px solid var(--rule);
          border-radius: 0.75rem;
          background: var(--bg);
          color: var(--txt);
          font-size: 0.95rem;
          outline: none;
          box-sizing: border-box;
          transition: border-color 0.2s;
        }
        .lm-input:focus { border-color: var(--primary); }
        .lm-btn {
          width: 100%; padding: 0.8rem;
          background: var(--primary);
          color: #fff; font-weight: 700;
          font-size: 0.95rem;
          border: none; border-radius: 0.75rem;
          cursor: pointer;
          transition: opacity 0.2s;
        }
        .lm-btn:hover { opacity: 0.88; }
        .lm-btn:disabled { opacity: 0.5; cursor: not-allowed; }
        .lm-error {
          font-size: 0.85rem; color: #dc2626;
          text-align: center; margin: 0;
        }
        .lm-link {
          font-size: 0.82rem; text-align: center;
          color: var(--txt-muted); margin: 0;
        }
        .lm-link button {
          background: none; border: none;
          color: var(--primary); font-weight: 600;
          cursor: pointer; font-size: 0.82rem;
          text-decoration: underline;
        }
        .lm-close {
          position: absolute; top: 1rem; right: 1rem;
          background: none; border: none;
          font-size: 1.2rem; cursor: pointer;
          color: var(--txt-muted);
        }
      `}</style>

      <div className="lm-overlay" onClick={onClose}>
        <div className="lm-modal" onClick={e => e.stopPropagation()}>

          <button className="lm-close" onClick={onClose}>✕</button>

          <p className="lm-title">
            <span style={{ fontSize: '1.5rem' }}>👤</span><br />
            Iniciar sesión
          </p>

          <input
            className="lm-input"
            type="text"
            placeholder="Nombre de usuario"
            value={usuario}
            onChange={e => setUsuario(e.target.value)}
            autoComplete="username"
            autoCapitalize="none"
          />

          <input
            className="lm-input"
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={e => setPassword(e.target.value)}
            autoComplete="current-password"
            onKeyDown={e => e.key === 'Enter' && handleLogin()}
          />

          {error && <p className="lm-error">{error}</p>}

          <button
            className="lm-btn"
            onClick={handleLogin}
            disabled={loading || !usuario || !password}
          >
            {loading ? 'Entrando...' : 'Entrar'}
          </button>

          <p className="lm-link">
            ¿No estás registrado?{' '}
            <button onClick={onInfoClick}>Conoce más aquí</button>
          </p>

        </div>
      </div>
    </>
  );
}