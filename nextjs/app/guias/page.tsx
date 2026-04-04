// nextjs/app/guias/page.tsx
'use client';

import { useState } from 'react';
import ConfiguradorGuia, { Cantidad } from '@/components/guias/ConfiguradorGuia';
import PreviewGuia from '@/components/guias/PreviewGuia';
import GuiaModal from '@/components/guias/GuiaModal';

const SKILLS_DEFECTO = ['concavity', 'discriminant', 'roots', 'vertex'];

export default function GuiasPage() {
  const [cantidad, setCantidad] = useState<Cantidad>(10);
  const [skills,   setSkills]   = useState<string[]>(SKILLS_DEFECTO);
  const [cargando, setCargando] = useState(false);
  const [error,    setError]    = useState<string | null>(null);

  function toggleSkill(id: string) {
    setSkills((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  }

  async function generarGuia() {
    setCargando(true);
    setError(null);

    try {
      const res = await fetch('/api/guias', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ count: cantidad, skills }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? `Error ${res.status}`);
      }

      const blob = await res.blob();
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement('a');
      a.href     = url;
      a.download = `guia-funcion-cuadratica-${cantidad}ej.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'No se pudo generar la guia. Intenta nuevamente.'
      );
    } finally {
      setCargando(false);
    }
  }

  return (
    <main className="guias-page">
      <div className="guias-header">
        <h1>Guias descargables</h1>
        <p>
          Genera un conjunto de ejercicios en PDF para imprimir o practicar
          sin conexion. Incluye solucionario al final.
        </p>
      </div>

      <ConfiguradorGuia
        cantidad={cantidad}
        skills={skills}
        cargando={cargando}
        error={error}
        onCantidad={setCantidad}
        onToggle={toggleSkill}
        onGenerar={generarGuia}
      />

      <PreviewGuia skills={skills} />

      <GuiaModal visible={cargando} cantidad={cantidad} />
    </main>
  );
}