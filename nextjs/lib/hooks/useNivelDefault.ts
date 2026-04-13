// nextjs/lib/hooks/useNivelDefault.ts
import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';

/** Valores canónicos almacenados en BD */
export type NivelBD = 'basica' | 'media' | 'universitario';

/**
 * Lee nivel_default del perfil del usuario autenticado.
 * Retorna null si no hay sesión o si el perfil no existe.
 * loading=true mientras espera la respuesta de Supabase.
 */
export function useNivelDefault(): { nivel: NivelBD | null; loading: boolean } {
  const [nivel,   setNivel]   = useState<NivelBD | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function fetchNivel() {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        if (!cancelled) setLoading(false);
        return;
      }

      const { data } = await supabase
        .from('perfiles')
        .select('nivel_default')
        .eq('id', session.user.id)
        .single();

      if (!cancelled) {
        const raw = data?.nivel_default as string | null;
        const normalizado = raw?.toLowerCase().trim();
        if (
          normalizado === 'basica' ||
          normalizado === 'media' ||
          normalizado === 'universitario'
        ) {
          setNivel(normalizado as NivelBD);
        }
        setLoading(false);
      }
    }

    fetchNivel();
    return () => { cancelled = true; };
  }, []);

  return { nivel, loading };
}