// components/ui/PaletteSwitcher.tsx
// Selector de paletas de color — Client Component
// Lee y escribe en localStorage para persistir la elección entre sesiones
// Aplica las CSS custom properties directamente en document.documentElement (:root)

"use client";

import { useState, useEffect } from "react";
import { palettes } from "@/lib/palettes";

export default function PaletteSwitcher() {
  // Índice de la paleta activa — por defecto 0 (Lila & Cielo)
  const [active, setActive] = useState(0);
  // Controla si el drawer está abierto o cerrado
  const [open, setOpen] = useState(false);

  // Al montar el componente, lee localStorage y aplica la paleta guardada
  useEffect(() => {
    const saved = Number.parseInt(localStorage.getItem("pa-palette") ?? "0", 10);
    const idx = Number.isNaN(saved) || saved < 0 || saved > 6 ? 0 : saved;
    applyPalette(idx);
  }, []);

  // Aplica una paleta: sobreescribe las CSS variables en :root
  // y guarda el índice en localStorage
  function applyPalette(idx: number) {
    const palette = palettes[idx];
    const root = document.documentElement;
    Object.entries(palette.vars).forEach(([key, value]) => {
      root.style.setProperty(key, value);
    });
    localStorage.setItem("pa-palette", String(idx));
    setActive(idx);
  }

  return (
    // Panel fijo en esquina inferior derecha
    <div style={{
      position: "fixed", bottom: "2rem", right: "2rem", zIndex: 999,
      display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "0.75rem",
    }}>

      {/* Drawer — visible solo cuando open === true */}
      {open && (
        <div style={{
          background: "white", borderRadius: "20px", padding: "1.25rem",
          boxShadow: "0 8px 40px rgba(0,0,0,.15)", width: "280px",
          display: "flex", flexDirection: "column", gap: "0.5rem",
          border: "1px solid rgba(0,0,0,.06)",
        }}>
          <div style={{
            fontFamily: "var(--font-inter), sans-serif", fontWeight: 700,
            fontSize: "0.85rem", color: "#1a1a2e", marginBottom: "0.25rem",
            paddingBottom: "0.5rem", borderBottom: "1px solid #f0eeff",
          }}>
            🎨 Elige una paleta
          </div>

          {/* Lista de paletas */}
          {palettes.map((palette) => (
            <button
              key={palette.name}
              onClick={() => applyPalette(palettes.indexOf(palette))}
              style={{
                display: "flex", alignItems: "center", gap: "0.75rem",
                padding: "0.6rem 0.75rem", borderRadius: "12px",
                cursor: "pointer",
                border: active === palettes.indexOf(palette) ? "2px solid #6D28D9" : "2px solid transparent",
                background: active === palettes.indexOf(palette) ? "#f0ebff" : "transparent",
                transition: "background .15s",
                width: "100%", textAlign: "left",
              }}
            >
              {/* Preview de 3 colores */}
              <div style={{ display: "flex", gap: "4px", flexShrink: 0 }}>
                {palette.dots.map((dot) => (
                  <div key={dot} style={{
                    width: "14px", height: "14px", borderRadius: "50%",
                    background: dot, border: "1px solid rgba(0,0,0,.08)",
                  }} />
                ))}
              </div>
              {/* Nombre y descripción */}
              <div>
                <div style={{ fontSize: "0.8rem", fontWeight: 500, color: "#2d2d4e" }}>
                  {palette.name}
                </div>
                <div style={{ fontSize: "0.68rem", color: "#8b7baa" }}>
                  {palette.sub}
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Botón disparador */}
      <button
        onClick={() => setOpen(!open)}
        title="Cambiar paleta"
        style={{
          width: "52px", height: "52px", borderRadius: "50%",
          background: "var(--primary)", border: "none", cursor: "pointer",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: "1.3rem", color: "#fff",
          boxShadow: "0 4px 20px rgba(0,0,0,.2)",
          transition: "transform .2s, background .3s",
        }}
      >
        {open ? "✕" : "🎨"}
      </button>
    </div>
  );
}