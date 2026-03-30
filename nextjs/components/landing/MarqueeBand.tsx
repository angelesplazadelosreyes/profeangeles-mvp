// components/landing/MarqueeBand.tsx
// Banda separadora con íconos en movimiento continuo — Server Component
// Animación CSS pura — sin JavaScript ni librería externa
// Separa el hero de las secciones de perfil

const items = [
  { icon: "🧮", label: "Matemáticas"   },
  { icon: "✏️", label: "Ejercicios"    },
  { icon: "📄", label: "Guías PDF"     },
  { icon: "🎓", label: "Clases"        },
  { icon: "💻", label: "Informática"   },
  { icon: "🐍", label: "Python"        },
  { icon: "📐", label: "Geometría"     },
  { icon: "🔬", label: "Ciencias"      },
];

export default function MarqueeBand() {
  return (
    <div style={{
      background: "var(--primary)",
      borderTop: "1px solid var(--rule-med)",
      borderBottom: "1px solid var(--rule-med)",
      padding: "1rem 0",
      overflow: "hidden",
      position: "relative",
    }}>

      {/* Gradientes en los bordes para efecto de fade */}
      <div style={{
        position: "absolute", top: 0, left: 0, bottom: 0, width: "80px",
        background: "linear-gradient(to right, var(--primary), transparent)",
        zIndex: 2, pointerEvents: "none",
      }} />
      <div style={{
        position: "absolute", top: 0, right: 0, bottom: 0, width: "80px",
        background: "linear-gradient(to left, var(--primary), transparent)",
        zIndex: 2, pointerEvents: "none",
      }} />

      {/* Pista de animación — se duplica para loop infinito sin salto */}
      <div style={{
        display: "flex",
        animation: "marquee 28s linear infinite",
        width: "max-content",
      }}>
        {/* Se renderiza dos veces para que el loop sea continuo */}
        {[...items, ...items].map((item, idx) => (
          <div
            key={`${item.label}-${idx}`}
            style={{
              display: "flex", alignItems: "center", gap: "0.5rem",
              padding: "0 2rem",
              fontSize: "0.85rem", fontWeight: 500,
              color: "rgba(255,255,255,.85)",
              whiteSpace: "nowrap",
            }}
          >
            <span style={{ fontSize: "1.2rem" }}>{item.icon}</span>
            {item.label}
            {/* Separador entre ítems */}
            <span style={{
              marginLeft: "1.5rem",
              color: "rgba(255,255,255,.3)",
              fontSize: "0.6rem",
            }}>
              ◆
            </span>
          </div>
        ))}
      </div>

      {/* Keyframe de la animación — CSS global necesario */}
      <style>{`
        @keyframes marquee {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }
      `}</style>

    </div>
  );
}