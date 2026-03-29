// components/landing/Hero.tsx
// Bloque hero de la landing — Server Component
// Layout desktop:  2 columnas (collage | texto + selector)
// Layout tablet:   2 columnas (collage pequeño | texto) + selector fila 2
// Layout móvil:    1 columna  (collage → texto → selector)
// DOC-01 §3.1
// DP-04 pendiente: collage usa placeholders de color hasta tener fotos reales

import Link from "next/link";

const profileButtons = [
  { href: "#estudiante",  icon: "🎒", label: "Estudiante"         },
  { href: "#profesor",    icon: "🖊️", label: "Profesor/a"         },
  { href: "#apoderado",   icon: "👨‍👩‍👧", label: "Apoderado/a"       },
  { href: "#profesional", icon: "💼", label: "Profesional / PYME" },
];

export default function Hero() {
  return (
    <>
      <style>{`
        .hero-grid {
          display: grid;
          grid-template-columns: 1fr 2fr;
          grid-template-areas:
            "collage texto"
            "collage selector";
          column-gap: 3rem;
          row-gap: 0;
          align-items: start;
        }
        .hero-collage  { grid-area: collage; }
        .hero-texto    { grid-area: texto; }
        .hero-selector { grid-area: selector; }

        .hero-collage {
          width: 100%;
          max-width: 340px;
          height: 320px;
          position: relative;
          margin: 0 auto;
        }

        @media (max-width: 860px) {
          .hero-grid {
            grid-template-columns: 1fr 2fr;
            grid-template-areas:
              "collage texto"
              "selector selector";
            column-gap: 1.5rem;
            row-gap: 1.5rem;
          }
          .hero-collage {
            max-width: 160px;
            height: 160px;
          }
        }

        @media (max-width: 560px) {
          .hero-grid {
            grid-template-columns: 1fr;
            grid-template-areas:
              "collage"
              "texto"
              "selector";
            row-gap: 1.5rem;
          }
          .hero-collage {
            max-width: 200px;
            height: 200px;
            margin: 0 auto;
          }
        }
      `}</style>

      <section style={{
        minHeight: "100vh",
        padding: "7rem 3rem 4rem",
        position: "relative",
        overflow: "hidden",
        background: "var(--bg)",
      }}>

        {/* Gradiente decorativo */}
        <div style={{
          position: "absolute",
          width: "600px", height: "600px",
          background: "radial-gradient(circle, rgba(186,230,253,.45) 0%, transparent 65%)",
          top: "-100px", right: "-80px", pointerEvents: "none",
        }} />

        <div className="hero-grid">

          {/* ── COLLAGE ── */}
          {/* TODO DP-04: reemplazar placeholders por fotos reales */}
          <div className="hero-collage">
            <div style={{
              position: "absolute",
              borderRadius: "60% 40% 55% 45% / 45% 55% 40% 60%",
              background: "var(--primary-lt)",
              width: "80%", height: "80%",
              top: "10%", left: "5%",
            }} />
            <div style={{
              position: "absolute",
              width: "38%", height: "38%", borderRadius: "50%",
              background: "var(--primary)", opacity: 0.25,
              top: "8%", left: "12%",
              border: "3px solid var(--bg-card)",
            }} />
            <div style={{
              position: "absolute",
              width: "28%", height: "28%",
              borderRadius: "30% 70% 70% 30% / 30% 30% 70% 70%",
              background: "var(--cta)", opacity: 0.2,
              top: "5%", left: "55%",
            }} />
            <div style={{
              position: "absolute",
              width: "24%", height: "24%", borderRadius: "50%",
              background: "var(--accent)", opacity: 0.5,
              top: "55%", left: "8%",
            }} />
            <div style={{
              position: "absolute",
              width: "26%", height: "26%", borderRadius: "50%",
              background: "var(--primary-h)", opacity: 0.2,
              top: "58%", left: "47%",
            }} />
          </div>

          {/* ── TEXTO ── */}
          <div className="hero-texto" style={{ position: "relative", zIndex: 1 }}>

            <div style={{
              display: "inline-flex", alignItems: "center", gap: "0.5rem",
              background: "var(--primary-lt)", border: "1px solid var(--rule-med)",
              color: "var(--primary)", fontSize: "0.72rem", fontWeight: 500,
              letterSpacing: "0.09em", textTransform: "uppercase" as const,
              padding: "0.38rem 1rem", borderRadius: "100px", marginBottom: "1.25rem",
            }}>
              <span style={{
                width: "6px", height: "6px",
                background: "var(--cta)", borderRadius: "50%",
              }} />
              Ciencias · Tecnología · Educación
            </div>

            {/* Título
                Fuente actual: Syne 800
                Para cambiar a Inter: reemplaza var(--font-syne) por var(--font-inter)
                y ajusta fontWeight a 300 o 400 para un look más suave */}
            <h1 style={{
              fontFamily: "var(--font-syne), sans-serif",
              fontWeight: 800,
              fontSize: "clamp(1.5rem, 2.5vw, 2.2rem)",
              lineHeight: 1.15, letterSpacing: "-0.02em",
              color: "var(--txt)", marginBottom: "1rem",
            }}>
              Hola, soy Ángeles
            </h1>

            <p style={{
              fontSize: "0.97rem", fontWeight: 300, lineHeight: 1.8,
              color: "var(--txt-muted)", marginBottom: "0",
            }}>
              Ingeniera en informática y docente.<br />
              Ayudo a las personas a encontrar soluciones y aprender en el proceso.<br />
              ¿Quieres que trabajemos juntos?
            </p>

          </div>

          {/* ── SELECTOR DE PERFIL ── */}
          <div className="hero-selector" style={{ position: "relative", zIndex: 1 }}>

            <div style={{ borderTop: "1px solid var(--rule)", marginBottom: "1.25rem" }} />

            <div style={{
              fontSize: "0.72rem", fontWeight: 500,
              letterSpacing: "0.1em", textTransform: "uppercase" as const,
              color: "var(--txt-muted)", marginBottom: "0.75rem",
            }}>
              ¿Cuál es tu perfil?
            </div>

            <div style={{ display: "flex", flexWrap: "wrap" as const, gap: "0.65rem" }}>
              {profileButtons.map((profile) => (
                <Link
                  key={profile.href}
                  href={profile.href}
                  style={{
                    display: "inline-flex", alignItems: "center", gap: "0.5rem",
                    padding: "0.7rem 1.2rem", borderRadius: "100px",
                    fontFamily: "var(--font-syne), sans-serif",
                    fontWeight: 700, fontSize: "0.85rem",
                    border: "2px solid var(--rule-med)",
                    background: "var(--bg-card)", color: "var(--txt)",
                    textDecoration: "none",
                    boxShadow: "var(--shadow)",
                  }}
                >
                  <span style={{ fontSize: "1rem" }}>{profile.icon}</span>
                  {profile.label}
                </Link>
              ))}
            </div>

            <Link
              href="https://wa.me/56971312255"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "inline-flex" as const,
                alignItems: "center", gap: "0.5rem",
                marginTop: "1.25rem",
                background: "var(--cta)", color: "#fff",
                padding: "0.75rem 1.6rem", borderRadius: "100px",
                fontWeight: 500, fontSize: "0.9rem",
                textDecoration: "none",
                boxShadow: "0 6px 20px rgba(0,0,0,.12)",
              }}
            >
              Agendar diagnóstico gratis →
            </Link>

          </div>

        </div>
      </section>
    </>
  );
}