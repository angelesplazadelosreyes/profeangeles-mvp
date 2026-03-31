// components/landing/Hero.tsx
// Bloque hero de la landing — Server Component
// Layout desktop:  2 columnas (collage | texto + selector)
// Layout tablet:   2 columnas (collage pequeño | texto) + selector fila 2
// Layout móvil:    1 columna  (collage → texto → selector)
// DOC-01 §3.1
// DP-04 pendiente: collage usa placeholders de color hasta tener fotos reales
// Estilos responsive en styles/landing.css

import Link from "next/link";

const profileButtons = [
  { href: "#estudiante",  icon: "🎒", label: "Estudiante"         },
  { href: "#profesor",    icon: "🖊️", label: "Profesor/a"         },
  { href: "#apoderado",   icon: "👨‍👩‍👧", label: "Apoderado/a"       },
  { href: "#profesional", icon: "💼", label: "Profesional / PYME" },
];

export default function Hero() {
  return (
    <section style={{
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

        {/* ── POST-IT ── */}
        <div className="hero-postit-wrapper">
          <svg
            width="100%"
            viewBox="0 0 300 340"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            style={{ maxWidth: "320px", overflow: "visible" }}
          >
            <defs>
              <radialGradient id="wc-vignette" cx="50%" cy="50%" r="65%">
                <stop offset="0%"   stopColor="rgba(255,248,220,0)" />
                <stop offset="70%"  stopColor="rgba(180,140,80,0.08)" />
                <stop offset="100%" stopColor="rgba(120,80,30,0.22)" />
              </radialGradient>

              <filter id="postit-shadow" x="-15%" y="-10%" width="135%" height="130%">
                <feDropShadow dx="5" dy="7" stdDeviation="8"
                  floodColor="rgba(80,50,10,0.28)" />
              </filter>

              <filter id="tack-shadow" x="-40%" y="-30%" width="180%" height="180%">
                <feDropShadow dx="1" dy="2" stdDeviation="3"
                  floodColor="rgba(0,0,0,0.30)" />
              </filter>

              <clipPath id="postit-photo-clip">
                <path d="M 42 28 Q 44 14 58 15 Q 98 10 148 12 Q 198 9 232 13
                        Q 248 14 250 27 Q 253 68 252 128 Q 254 188 251 238
                        Q 250 254 234 256 Q 188 261 148 259 Q 108 261 68 257
                        Q 50 255 44 240 Q 39 190 40 138 Q 38 78 42 28 Z" />
              </clipPath>

              {/* Gradientes chincheta */}
              <radialGradient id="tack-head" cx="35%" cy="30%" r="65%">
                <stop offset="0%"   stopColor="#FFE066" />
                <stop offset="45%"  stopColor="#F5A623" />
                <stop offset="100%" stopColor="#B85C00" />
              </radialGradient>
              <radialGradient id="tack-ring" cx="38%" cy="35%" r="62%">
                <stop offset="0%"   stopColor="#F5A623" />
                <stop offset="60%"  stopColor="#C97B00" />
                <stop offset="100%" stopColor="#7A3E00" />
              </radialGradient>
              <linearGradient id="tack-neck" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%"   stopColor="#A05500" />
                <stop offset="25%"  stopColor="#F5A623" />
                <stop offset="52%"  stopColor="#FFD966" />
                <stop offset="75%"  stopColor="#F5A623" />
                <stop offset="100%" stopColor="#A05500" />
              </linearGradient>
              <radialGradient id="tack-base" cx="38%" cy="30%" r="65%">
                <stop offset="0%"   stopColor="#F5B942" />
                <stop offset="55%"  stopColor="#C97B00" />
                <stop offset="100%" stopColor="#7A3E00" />
              </radialGradient>
              <linearGradient id="tack-pin" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%"   stopColor="#9E9E9E" />
                <stop offset="30%"  stopColor="#E8E8E8" />
                <stop offset="60%"  stopColor="#BDBDBD" />
                <stop offset="100%" stopColor="#757575" />
              </linearGradient>
            </defs>

            {/* Sombra exterior post-it */}
            <g filter="url(#postit-shadow)">
              <path d="M 42 28 Q 44 14 58 15 Q 98 10 148 12 Q 198 9 232 13
                      Q 248 14 250 27 Q 253 68 252 128 Q 254 188 251 238
                      Q 250 254 234 256 Q 188 261 148 259 Q 108 261 68 257
                      Q 50 255 44 240 Q 39 190 40 138 Q 38 78 42 28 Z"
                fill="#FFF8DC" />
            </g>

            {/* Post-it rotado -3° */}
            <g transform="rotate(-3, 150, 137)">

              {/* Fondo amarillo */}
              <path d="M 42 28 Q 44 14 58 15 Q 98 10 148 12 Q 198 9 232 13
                      Q 248 14 250 27 Q 253 68 252 128 Q 254 188 251 238
                      Q 250 254 234 256 Q 188 261 148 259 Q 108 261 68 257
                      Q 50 255 44 240 Q 39 190 40 138 Q 38 78 42 28 Z"
                fill="#FFF8DC" />

              {/* Foto */}
              <image
                href="/images/foto-angeles.png"
                x="44" y="14"
                width="207" height="244"
                clipPath="url(#postit-photo-clip)"
                preserveAspectRatio="xMidYMid slice"
                transform="scale(-1,1) translate(-295, 0)"
              />

              {/* Vignette acuarela encima de la foto */}
              <path d="M 42 28 Q 44 14 58 15 Q 98 10 148 12 Q 198 9 232 13
                      Q 248 14 250 27 Q 253 68 252 128 Q 254 188 251 238
                      Q 250 254 234 256 Q 188 261 148 259 Q 108 261 68 257
                      Q 50 255 44 240 Q 39 190 40 138 Q 38 78 42 28 Z"
                fill="url(#wc-vignette)" />

              {/* Sombras internas acuarela */}
              <path d="M 44 28 Q 46 16 62 17 Q 100 12 148 14"
                fill="none" stroke="rgba(140,100,40,0.13)"
                strokeWidth="10" strokeLinecap="round" />
              <path d="M 44 240 Q 46 254 68 255 Q 108 259 148 257"
                fill="none" stroke="rgba(140,100,40,0.10)"
                strokeWidth="8" strokeLinecap="round" />
              <path d="M 44 28 Q 40 80 40 138 Q 39 188 44 240"
                fill="none" stroke="rgba(140,100,40,0.10)"
                strokeWidth="8" strokeLinecap="round" />
              <path d="M 250 27 Q 253 80 252 138 Q 253 188 250 238"
                fill="none" stroke="rgba(140,100,40,0.10)"
                strokeWidth="8" strokeLinecap="round" />

              {/* Borde dibujado a mano — trazo principal */}
              <path d="M 43 29 Q 40 21 47 17 Q 52 13 65 13 Q 98 9 148 11
                      Q 196 8 228 12 Q 241 13 248 19 Q 253 23 252 31
                      Q 255 75 253 130 Q 255 187 252 238 Q 252 250 244 255
                      Q 237 259 220 260 Q 188 263 148 261 Q 108 263 76 260
                      Q 60 259 50 255 Q 42 251 41 241 Q 37 190 39 138
                      Q 37 75 43 29 Z"
                fill="none" stroke="#5C3D11"
                strokeWidth="2.2" strokeLinejoin="round" strokeLinecap="round" />

              {/* Borde dibujado a mano — trazo secundario (efecto mano) */}
              <path d="M 45 31 Q 43 22 51 18 Q 57 14 70 14 Q 100 10 148 12
                      Q 195 9 227 13 Q 243 14 249 21 Q 254 26 253 34
                      Q 256 77 254 130 Q 256 188 252 238 Q 252 252 243 257
                      Q 236 261 218 262 Q 186 265 148 263 Q 110 265 78 262
                      Q 62 261 52 257 Q 44 253 43 243 Q 39 192 41 140
                      Q 39 77 45 31 Z"
                fill="none" stroke="#5C3D11"
                strokeWidth="0.7" strokeLinejoin="round"
                strokeLinecap="round" opacity={0.4} />

            </g>{/* fin rotate post-it */}

            {/* ── CHINCHETA — centrada x=150, subida, rotada 30° ── */}
            <g filter="url(#tack-shadow)"
              transform="translate(150, -20) rotate(30, 0, 20)">

              {/* Pin metálico */}
              <line x1="0" y1="28" x2="0" y2="52"
                stroke="url(#tack-pin)" strokeWidth="3.5" strokeLinecap="round" />
              <line x1="-0.5" y1="29" x2="-0.5" y2="50"
                stroke="rgba(255,255,255,0.45)" strokeWidth="1" strokeLinecap="round" />

              {/* Aro base */}
              <ellipse cx="0" cy="30" rx="14" ry="5" fill="url(#tack-base)" />
              <ellipse cx="0" cy="31.5" rx="14" ry="4.5"
                fill="url(#tack-base)" opacity={0.55} />
              <ellipse cx="-4" cy="28" rx="5" ry="2"
                fill="rgba(255,220,120,0.4)" transform="rotate(-8,-4,28)" />

              {/* Cuello cilíndrico */}
              <path d="M -9 15 L -9 30 Q 0 33 9 30 L 9 15 Q 0 12 -9 15 Z"
                fill="url(#tack-neck)" />
              <path d="M 0 13 L 0 30"
                stroke="rgba(255,255,255,0.22)" strokeWidth="3" strokeLinecap="round" />

              {/* Aro superior */}
              <ellipse cx="0" cy="15" rx="14" ry="5" fill="url(#tack-ring)" />

              {/* Cabeza disco */}
              <ellipse cx="0" cy="8" rx="14" ry="7" fill="url(#tack-head)" />
              <ellipse cx="0" cy="11" rx="14" ry="6"
                fill="#C97B00" opacity={0.4} />
              <ellipse cx="-4" cy="4" rx="6" ry="3"
                fill="rgba(255,255,255,0.40)" transform="rotate(-15,-4,4)" />
              <ellipse cx="4" cy="3" rx="2.5" ry="1.5"
                fill="rgba(255,255,255,0.22)" />

            </g>{/* fin chincheta */}

          </svg>
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
  );
}