// components/landing/ProfileSections.tsx
// Secciones de perfil de la landing — Server Component
// Una sección por perfil: avatar + texto introductorio + tarjetas de servicios
// Los datos vienen de data/profiles.ts — no hay contenido hardcodeado aquí
// DOC-01 §4

import Link from "next/link";
import { profiles } from "@/data/profiles";

export default function ProfileSections() {
  return (
    <>
      {profiles.map((profile, idx) => (
        <section
          key={profile.id}
          id={profile.id}
          style={{
            padding: "6rem 3rem",
            background: idx % 2 === 0 ? "var(--bg)" : "var(--bg-alt)",
            scrollMarginTop: "64px",
            transition: "background .4s",
          }}
        >
          {/* ── Bloque superior: avatar + texto ── */}
          <div className="profile-intro-grid">

            {/* Avatar + badge — siempre a la izquierda */}
            <div style={{
              display: "flex", flexDirection: "column",
              alignItems: "center", gap: "1rem",
            }}>
              <div style={{
                width: "140px", height: "140px", borderRadius: "50%",
                background: "var(--primary-lt)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "4rem",
                border: "4px solid var(--bg-card)",
                boxShadow: "var(--shadow-lg)",
                transition: "background .4s, border-color .3s",
              }}>
                {profile.icon}
              </div>
              <div style={{
                background: "var(--primary)", color: "#fff",
                fontFamily: "var(--font-inter), sans-serif", fontWeight: 700,
                fontSize: "0.95rem", padding: "0.55rem 1.5rem",
                borderRadius: "100px",
                boxShadow: "0 4px 14px rgba(0,0,0,.12)",
                transition: "background .3s",
              }}>
                {profile.label}
              </div>
            </div>

            {/* Texto introductorio */}
            <div>
              <div style={{
                fontSize: "0.68rem", fontWeight: 500,
                letterSpacing: "0.12em", textTransform: "uppercase" as const,
                color: "var(--cta)", marginBottom: "0.6rem",
                transition: "color .3s",
              }}>
                {profile.tag}
              </div>

              {/* Título de sección
                  Fuente actual: Syne 800
                  Para cambiar fuente: reemplaza var(--font-inter) por var(--font-inter)
                  Para cambiar peso: ajusta fontWeight (300 más suave, 700 más fuerte)
                  Para cambiar tamaño: ajusta los 3 valores de clamp(mínimo, fluido, máximo)
                  Ejemplo más pequeño: clamp(1.2rem, 2vw, 1.8rem)
                  Ejemplo más grande: clamp(2rem, 4vw, 3.2rem) */}
              <h2 style={{
                fontFamily: "var(--font-inter), sans-serif",
                fontWeight: 800,
                fontSize: "clamp(1.2rem, 2vw, 1.8rem)",
                lineHeight: 1.1, letterSpacing: "-0.025em",
                color: "var(--txt)", marginBottom: "0.9rem",
                transition: "color .3s",
              }}>
                {profile.title}
              </h2>

              {/* Descripción del perfil
                  Para cambiar tamaño: ajusta fontSize (ej: "0.85rem" más pequeño)
                  Para cambiar peso: ajusta fontWeight (300 liviano, 400 normal) */}
              <p style={{
                fontSize: "0.97rem", fontWeight: 300, lineHeight: 1.8,
                color: "var(--txt-muted)", maxWidth: "90%",
                transition: "color .3s",
              }}>
                {profile.body}
              </p>
            </div>
          </div>

          {/* ── Tarjetas de servicios ── */}
          <div style={{
            display: "grid",
            // Para cambiar el tamaño mínimo de cada tarjeta: ajusta minmax(210px, 1fr)
            // Más angostas: minmax(160px, 1fr) — Más anchas: minmax(260px, 1fr)
            gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))",
            gap: "1rem",
          }}>
            {profile.cards.map((card) => (
              <div
                key={card.title}
                style={{
                  background: "var(--bg-card)",
                  border: "1px solid var(--rule)",
                  borderRadius: "18px", padding: "1.75rem",
                  position: "relative", overflow: "hidden",
                  boxShadow: "var(--shadow)",
                  transition: "transform .25s, box-shadow .25s, background .4s, border-color .3s",
                  opacity: card.comingSoon ? 0.6 : 1,
                }}
              >
                {/* Barra superior de color */}
                <div style={{
                  position: "absolute", top: 0, left: 0, right: 0, height: "3px",
                  background: "var(--primary)", transition: "background .3s",
                }} />

                {/* Ícono */}
                <div style={{
                  width: "46px", height: "46px", borderRadius: "12px",
                  background: "var(--primary-lt)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "1.3rem", marginBottom: "1rem",
                  transition: "background .3s",
                }}>
                  {card.icon}
                </div>

                {/* Título de tarjeta
                    Para cambiar tamaño: ajusta fontSize (ej: "0.9rem" más pequeño)
                    Para cambiar fuente: reemplaza var(--font-inter) por var(--font-inter) */}
                <h4 style={{
                  fontFamily: "var(--font-inter), sans-serif", fontWeight: 700,
                  fontSize: "1.05rem", color: "var(--txt)",
                  marginBottom: "0.4rem", transition: "color .3s",
                }}>
                  {card.title}
                </h4>

                {/* Descripción de tarjeta
                    Para cambiar tamaño: ajusta fontSize (ej: "0.75rem" más pequeño) */}
                <p style={{
                  fontSize: "0.83rem", fontWeight: 300, lineHeight: 1.65,
                  color: "var(--txt-muted)", marginBottom: "1rem",
                  transition: "color .3s",
                }}>
                  {card.description}
                </p>

                {/* Link de acción o badge Próximamente
                    comingSoon se define en data/profiles.ts por tarjeta */}
                {card.comingSoon ? (
                  <span style={{
                    fontSize: "0.65rem", fontWeight: 500,
                    letterSpacing: "0.07em", textTransform: "uppercase" as const,
                    padding: "0.22rem 0.65rem", borderRadius: "100px",
                    background: "var(--bg)", color: "var(--txt-muted)",
                    border: "1px solid var(--rule)",
                    transition: "background .3s, color .3s, border-color .3s",
                  }}>
                    Próximamente
                  </span>
                ) : (
                  <Link
                    href={card.linkHref}
                    target={card.linkHref.startsWith("http") ? "_blank" : undefined}
                    rel={card.linkHref.startsWith("http") ? "noopener noreferrer" : undefined}
                    style={{
                      fontSize: "0.78rem", fontWeight: 500,
                      color: "var(--primary)", textDecoration: "none",
                      display: "inline-flex", alignItems: "center", gap: "0.3rem",
                      transition: "color .2s",
                    }}
                  >
                    {card.linkText}
                  </Link>
                )}
              </div>
            ))}
          </div>

        </section>
      ))}
    </>
  );
}