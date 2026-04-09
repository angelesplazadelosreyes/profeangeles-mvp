// nextjs/components/guias/ConfiguradorGuia.tsx
'use client';

import { useState, useEffect } from 'react';
import { MATERIAS, type Modulo } from '@/lib/modules';

export const CANTIDADES = [5, 10, 20] as const;
export type Cantidad = typeof CANTIDADES[number];

interface Props {
  modulo:     Modulo | null;
  cantidad:   Cantidad;
  skills:     string[];
  cargando:   boolean;
  onModulo:   (m: Modulo) => void;
  onCantidad: (n: Cantidad) => void;
  onToggle:   (id: string) => void;
  onGenerar:  () => void;
  error:      string | null;
}

export default function ConfiguradorGuia({
  modulo,
  cantidad,
  skills,
  cargando,
  onModulo,
  onCantidad,
  onToggle,
  onGenerar,
  error,
}: Props) {
  const [materiaId,  setMateriaId]  = useState(MATERIAS[0].id);
  const [temaId,     setTemaId]     = useState(MATERIAS[0].temas[0].id);
  const [subtemaId,  setSubtemaId]  = useState(MATERIAS[0].temas[0].subtemas[0].id);

  const materia = MATERIAS.find(m => m.id === materiaId)!;
  const tema    = materia.temas.find(t => t.id === temaId) ?? materia.temas[0];
  const subtema = tema.subtemas.find(s => s.id === subtemaId) ?? tema.subtemas[0];

  // Al cambiar materia, resetear tema y subtema
  useEffect(() => {
    const primerTema = materia.temas[0];
    setTemaId(primerTema.id);
    setSubtemaId(primerTema.subtemas[0].id);
  }, [materiaId]);

  // Al cambiar tema, resetear subtema
  useEffect(() => {
    setSubtemaId(tema.subtemas[0].id);
  }, [temaId]);

  // Al cambiar subtema, seleccionar primer módulo disponible
  useEffect(() => {
    const disponible = subtema.modulos.find(m => m.disponible);
    if (disponible) onModulo(disponible);
  }, [subtemaId]);

  const ningunaSeleccionada = skills.length === 0;
  const moduloActual = modulo;

  return (
    <div className="guias-card">
      <div className="guias-note">
        <span className="guias-note-icon">⏱</span>
        <span>
          La generación puede tardar unos segundos la primera vez — el servidor
          se despierta al primer uso.
        </span>
      </div>

      {/* Selector en cascada */}
      <div className="guias-config-row">
        <div className="guias-field">
          <label htmlFor="guias-materia">Materia</label>
          <select
            id="guias-materia"
            value={materiaId}
            onChange={e => setMateriaId(e.target.value)}
            disabled={cargando}
          >
            {MATERIAS.map(m => (
              <option key={m.id} value={m.id}>{m.label}</option>
            ))}
          </select>
        </div>

        <div className="guias-field">
          <label htmlFor="guias-tema">Tema</label>
          <select
            id="guias-tema"
            value={temaId}
            onChange={e => setTemaId(e.target.value)}
            disabled={cargando}
          >
            {materia.temas.map(t => (
              <option key={t.id} value={t.id}>{t.label}</option>
            ))}
          </select>
        </div>

        <div className="guias-field">
          <label htmlFor="guias-subtema">Subtema</label>
          <select
            id="guias-subtema"
            value={subtemaId}
            onChange={e => setSubtemaId(e.target.value)}
            disabled={cargando}
          >
            {tema.subtemas.map(s => (
              <option key={s.id} value={s.id}>{s.label}</option>
            ))}
          </select>
        </div>

        <div className="guias-field">
          <label htmlFor="guias-cantidad">Cantidad</label>
          <select
            id="guias-cantidad"
            value={cantidad}
            onChange={e => onCantidad(Number(e.target.value) as Cantidad)}
            disabled={cargando}
          >
            {CANTIDADES.map(n => (
              <option key={n} value={n}>{n} ejercicios</option>
            ))}
          </select>
        </div>
      </div>

      {/* Selector de nivel */}
      <p className="guias-section-title">Nivel</p>
      <div className="guias-niveles-row">
        {subtema.modulos.map(m => (
          <label
            key={m.key}
            className={`guias-nivel-chip${moduloActual?.key === m.key && m.disponible ? ' activo' : ''}${!m.disponible ? ' deshabilitado' : ''}`}
          >
            <input
              type="radio"
              name="nivel"
              disabled={!m.disponible || cargando}
              checked={moduloActual?.key === m.key}
              onChange={() => m.disponible && onModulo(m)}
            />
            {m.nivel.charAt(0).toUpperCase() + m.nivel.slice(1)}
            {!m.disponible && (
              <span className="guias-proximamente">Próximamente</span>
            )}
          </label>
        ))}
      </div>

      {/* Checklist habilidades */}
      {moduloActual && (
        <>
          <p className="guias-section-title">Habilidades a evaluar</p>
          <div className="guias-skills-grid">
            {moduloActual.skills.map(s => {
              const activo = skills.includes(s.id);
              return (
                <label
                  key={s.id}
                  className={`guias-skill-chip${activo ? ' activo' : ''}`}
                >
                  <input
                    type="checkbox"
                    checked={activo}
                    onChange={() => onToggle(s.id)}
                    disabled={cargando}
                  />
                  {s.label}
                </label>
              );
            })}
          </div>
        </>
      )}

      <div className="guias-divider" />

      <div className="guias-action-row">
        <button
          className="guias-btn-primary"
          onClick={onGenerar}
          disabled={cargando || ningunaSeleccionada || !moduloActual?.disponible}
        >
          {cargando ? 'Generando PDF…' : 'Generar y descargar PDF'}
        </button>
        {ningunaSeleccionada && !cargando && (
          <span className="guias-action-hint">Selecciona al menos una habilidad</span>
        )}
        {!ningunaSeleccionada && !cargando && (
          <span className="guias-action-hint">Recibirás un PDF listo para imprimir</span>
        )}
      </div>

      {error && <div className="guias-error">{error}</div>}
    </div>
  );
}