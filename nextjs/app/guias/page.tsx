// nextjs/app/guias/page.tsx
'use client';
import { useState, useEffect } from 'react';
import ConfiguradorGuia, { Cantidad } from '@/components/guias/ConfiguradorGuia';
import PreviewGuia from '@/components/guias/PreviewGuia';
import GuiaModal from '@/components/guias/GuiaModal';
import { type Modulo, MATERIAS } from '@/lib/modules';
import { useNivelDefault } from '@/lib/hooks/useNivelDefault';

const MODULO_DEFECTO = MATERIAS[0].temas[0].subtemas[0].modulos.find(m => m.disponible) ?? null;
const SKILLS_DEFECTO = MODULO_DEFECTO?.skills.slice(0, 4).map(s => s.id) ?? [];

function primerModuloPorNivel(nivel: string): Modulo | null {
  for (const materia of MATERIAS) {
    for (const tema of materia.temas) {
      for (const subtema of tema.subtemas) {
        const m = subtema.modulos.find(m => m.disponible && m.nivel === nivel);
        if (m) return m;
      }
    }
  }
  return null;
}

export default function GuiasPage() {
  const { nivel: nivelBD } = useNivelDefault();

  const [modulo,   setModulo]   = useState<Modulo | null>(MODULO_DEFECTO);
  const [cantidad, setCantidad] = useState<Cantidad>(10);
  const [skills,   setSkills]   = useState<string[]>(SKILLS_DEFECTO);
  const [cargando, setCargando] = useState(false);
  const [error,    setError]    = useState<string | null>(null);

  // Preseleccionar módulo según nivel del usuario autenticado
  useEffect(() => {
    if (!nivelBD) return;
    const moduloNivel = primerModuloPorNivel(nivelBD);
    if (moduloNivel) setModulo(moduloNivel);
  }, [nivelBD]);

  // Al cambiar módulo, resetear skills al defecto del nuevo módulo
  useEffect(() => {
    if (modulo) {
      setSkills(modulo.skills.slice(0, 4).map(s => s.id));
    }
  }, [modulo?.key]);

  function toggleSkill(id: string) {
    setSkills(prev =>
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    );
  }

  async function generarGuia() {
    if (!modulo) return;
    setCargando(true);
    setError(null);
    try {
      const res = await fetch('/api/guias', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          count:  cantidad,
          skills,
          module: modulo.key,
          params: {},
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? `Error ${res.status}`);
      }
      const blob = await res.blob();
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement('a');
      a.href     = url;
      a.download = `guia-${modulo.key}-${cantidad}ej.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'No se pudo generar la guía. Intenta nuevamente.'
      );
    } finally {
      setCargando(false);
    }
  }

  return (
    <main className="guias-page">
      <div className="guias-header">
        <h1>Guías descargables</h1>
        <p>
          Genera un conjunto de ejercicios en PDF para imprimir o practicar
          sin conexión. Incluye solucionario al final.
        </p>
      </div>
      <ConfiguradorGuia
        modulo={modulo}
        cantidad={cantidad}
        skills={skills}
        cargando={cargando}
        error={error}
        onModulo={setModulo}
        onCantidad={setCantidad}
        onToggle={toggleSkill}
        onGenerar={generarGuia}
      />
      <PreviewGuia skills={skills} modulo={modulo} />
      <GuiaModal visible={cargando} cantidad={cantidad} />
    </main>
  );
}