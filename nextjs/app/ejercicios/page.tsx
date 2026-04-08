// nextjs/app/ejercicios/page.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import { MATH_OPTIONS, Nivel } from '@/data/ejercicios';
import { ExerciseResponse } from '@/lib/api.client';
import Sidebar from '@/components/ejercicios/Sidebar';
import FiltrosBlock from '@/components/ejercicios/FiltrosBlock';
import EjercicioArea from '@/components/ejercicios/EjercicioArea';
import ColdStartModal from '@/components/ejercicios/ColdStartModal';

const COLD_START_UMBRAL_MS = 2000;

function getPrimerTemaDisponible(n: Nivel): string {
  return Object.keys(MATH_OPTIONS).find((t) =>
    Object.values(MATH_OPTIONS[t]).some((tipos) =>
      tipos.some((tipo) => tipo.niveles.includes(n))
    )
  ) ?? '';
}

function getPrimerSubtemaDisponible(tema: string, n: Nivel): string {
  return Object.keys(MATH_OPTIONS[tema] ?? {}).find((s) =>
    (MATH_OPTIONS[tema]?.[s] ?? []).some((tipo) => tipo.niveles.includes(n))
  ) ?? '';
}

function getPrimerTipo(tema: string, subtema: string, nivel: Nivel): string {
  const tipos = (MATH_OPTIONS[tema]?.[subtema] ?? []).filter((t) =>
    t.niveles.includes(nivel)
  );
  return tipos[0]?.id ?? '';
}

export default function EjerciciosPage() {
  const nivelInicial: Nivel = 'Media';
  const temaInicial         = getPrimerTemaDisponible(nivelInicial);
  const subtemaInicial      = getPrimerSubtemaDisponible(temaInicial, nivelInicial);

  const [materia,         setMateria]         = useState('matematicas');
  const [nivel,           setNivel]           = useState<Nivel>(nivelInicial);
  const [tema,            setTema]            = useState(temaInicial);
  const [subtema,         setSubtema]         = useState(subtemaInicial);
  const [tipoId,          setTipoId]          = useState(() =>
    getPrimerTipo(temaInicial, subtemaInicial, nivelInicial)
  );
  const [mostrarFiltros,  setMostrarFiltros]  = useState(true);
  const [ejercicio,       setEjercicio]       = useState<ExerciseResponse | null>(null);
  const [mostrarSolucion, setMostrarSolucion] = useState(false);
  const [status,          setStatus]          = useState('');
  const [error,           setError]           = useState<string | null>(null);
  const [cargando,        setCargando]        = useState(false);
  const [coldStart,       setColdStart]       = useState(false);

  // Warmup proactivo al montar
  useEffect(() => {
    fetch('/api/ejercicios/health').catch(() => {});
  }, []);

  // Sincronizar tipo cuando cambian tema/subtema/nivel
  useEffect(() => {
    setTipoId(getPrimerTipo(tema, subtema, nivel));
  }, [tema, subtema, nivel]);

  // Handlers de filtros
  function handleNivel(n: Nivel) {
    const nuevoTema    = getPrimerTemaDisponible(n);
    const nuevoSubtema = getPrimerSubtemaDisponible(nuevoTema, n);
    setNivel(n);
    setTema(nuevoTema);
    setSubtema(nuevoSubtema);
    setTipoId(getPrimerTipo(nuevoTema, nuevoSubtema, n));
    setEjercicio(null);
    setMostrarSolucion(false);
  }

  function handleTema(t: string) {
    const nuevoSubtema = getPrimerSubtemaDisponible(t, nivel);
    setTema(t);
    setSubtema(nuevoSubtema);
    setTipoId(getPrimerTipo(t, nuevoSubtema, nivel));
    setEjercicio(null);
    setMostrarSolucion(false);
  }

  function handleSubtema(s: string) {
    setSubtema(s);
    setEjercicio(null);
    setMostrarSolucion(false);
  }

  function handleTipo(id: string) {
    setTipoId(id);
    setEjercicio(null);
    setMostrarSolucion(false);
  }

  // Generar ejercicio
  const generarEjercicio = useCallback(async () => {
    setCargando(true);
    setError(null);
    setStatus('Generando ejercicio…');
    setMostrarSolucion(false);
    setEjercicio(null);

    const timer = setTimeout(() => setColdStart(true), COLD_START_UMBRAL_MS);

    try {
      const params = new URLSearchParams({ topic: tema, subtopic: subtema, type: tipoId });
      const res    = await fetch(`/api/ejercicios?${params.toString()}`);

      if (!res.ok) throw new Error(`Error ${res.status}`);

      const data: ExerciseResponse = await res.json();
      setEjercicio(data);
      setMostrarFiltros(false);
      setStatus('');
    } catch {
      setError('No se pudo generar el ejercicio. ¿La conexión está bien?');
      setStatus('');
    } finally {
      clearTimeout(timer);
      setColdStart(false);
      setCargando(false);
    }
  }, [tema, subtema, tipoId]);

  // Mostrar respuesta
  async function mostrarRespuesta() {
    if (!ejercicio) {
      await generarEjercicio();
    }
    setMostrarSolucion(true);
  }

  const tipoLabel = (MATH_OPTIONS[tema]?.[subtema] ?? [])
    .find((t) => t.id === tipoId)?.label ?? tipoId;

  const NIVELES_LABELS: Record<Nivel, string> = {
    'Básica':        'Básica',
    'Media':         'Media',
    'Universitario': 'Universitario',
  };

  return (
    <main className="ejercicios-page">
      <div className="ejercicios-layout">

        <Sidebar materiaActiva={materia} onSelect={setMateria} />

        <div className="ejercicios-panel">

          <div className="panel-header">
            {mostrarFiltros ? (
              <h1 className="panel-title">Generador de ejercicios · Matemáticas</h1>
            ) : (
              <>
                <div>
                  <h1 className="panel-title">
                    Matemáticas
                    <span className="panel-nivel-badge">{NIVELES_LABELS[nivel]}</span>
                  </h1>
                  <p className="panel-filtros-resumen">
                    {tema} · {subtema} · {tipoLabel}
                  </p>
                </div>
                <button
                  className="panel-filtros-link"
                  onClick={() => setMostrarFiltros(true)}
                >
                  ← cambiar filtros
                </button>
              </>
            )}
          </div>

          {mostrarFiltros && (
            <FiltrosBlock
              nivel={nivel}
              tema={tema}
              subtema={subtema}
              tipoId={tipoId}
              onNivelChange={handleNivel}
              onTemaChange={handleTema}
              onSubtemaChange={handleSubtema}
              onTipoChange={handleTipo}
            />
          )}

          <div className="acciones-row">
            <button
              className="btn-ejercicio btn-ejercicio--primary"
              onClick={generarEjercicio}
              disabled={cargando}
            >
              {cargando ? 'Generando…' : 'Nuevo ejercicio'}
            </button>
            <button
              className="btn-ejercicio btn-ejercicio--secondary"
              onClick={mostrarRespuesta}
              disabled={cargando}
            >
              Mostrar respuesta
            </button>
          </div>

          <EjercicioArea
            ejercicio={ejercicio}
            mostrarSolucion={mostrarSolucion}
            status={status}
            error={error}
            onReintentar={generarEjercicio}
          />
        </div>
      </div>

      <ColdStartModal visible={coldStart} />
    </main>
  );
}