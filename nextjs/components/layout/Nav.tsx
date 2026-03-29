// components/layout/Nav.tsx
// Barra de navegación principal — Client Component
// Es "use client" porque usa usePathname() para marcar el ítem activo
// Patrón: icon + label vertical por ítem (decisión de diseño DOC-01 §2)
// --nav-bg siempre claro independiente de la paleta activa (DOC-01 §2.2)

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

// Definición de cada ítem de navegación
interface NavItem {
  href: string;
  icon: string;
  label: string;
}

const navItems: NavItem[] = [
  { href: "/",            icon: "🏠", label: "Inicio"       },
  { href: "/ejercicios",  icon: "✏️", label: "Ejercicios"   },
  { href: "/guias",       icon: "📄", label: "Guías"        },
  { href: "/clases",      icon: "🎓", label: "Clases"       },
  { href: "/informatica", icon: "💻", label: "Informática"  },
];

export default function Nav() {
  // usePathname devuelve la ruta actual, ej: "/ejercicios"
  // Se usa para marcar el ítem activo con color primario
  const pathname = usePathname();

  return (
    <nav style={{
      position: "fixed", top: 0, left: 0, right: 0, zIndex: 200,
      display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "0 2.5rem", height: "64px",
      background: "var(--nav-bg)",
      backdropFilter: "blur(16px)",
      borderBottom: "1px solid var(--rule)",
    }}>

      {/* Logo — "Á" en color primario de la paleta activa */}
      <Link href="/" style={{
        fontFamily: "var(--font-syne), sans-serif",
        fontWeight: 800, fontSize: "1.2rem",
        letterSpacing: "-0.02em", textDecoration: "none",
        color: "var(--txt)",
      }}>
        Profe<span style={{ color: "var(--cta)" }}>Á</span>ngeles
      </Link>

      {/* Ítems de navegación */}
      <ul style={{
        display: "flex", alignItems: "center",
        gap: "0.25rem", listStyle: "none", height: "100%",
      }}>
        {navItems.map((item) => {
          // Un ítem es activo si la ruta actual coincide exactamente
          // Para "/" solo es activo en la raíz, no en subrutas
          const isActive = item.href === "/"
            ? pathname === "/"
            : pathname.startsWith(item.href);

          return (
            <li key={item.href} style={{ height: "100%", display: "flex", alignItems: "center" }}>
              <Link
                href={item.href}
                style={{
                  display: "flex", flexDirection: "column",
                  alignItems: "center", justifyContent: "center",
                  gap: "3px", padding: "0 1rem", height: "100%",
                  textDecoration: "none", minWidth: "64px",
                  color: isActive ? "var(--primary)" : "var(--txt-muted)",
                  borderBottom: isActive ? "2px solid var(--primary)" : "2px solid transparent",
                  transition: "color .2s, border-color .2s",
                }}
              >
                {/* Ícono — grayscale cuando inactivo, color cuando activo */}
                <span style={{
                  fontSize: "1.25rem", lineHeight: 1,
                  filter: isActive ? "grayscale(0) opacity(1)" : "grayscale(1) opacity(.55)",
                  transition: "filter .2s",
                }}>
                  {item.icon}
                </span>
                <span style={{
                  fontSize: "0.65rem", fontWeight: 500,
                  letterSpacing: "0.04em", whiteSpace: "nowrap",
                }}>
                  {item.label}
                </span>
              </Link>
            </li>
          );
        })}

        {/* Botón de inicio de sesión — separado de navItems
            porque es un <button>, no un <Link> */}
        <li style={{ height: "100%", display: "flex", alignItems: "center" }}>
          <button style={{
            display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "center",
            gap: "3px", padding: "0 1rem", height: "100%",
            minWidth: "64px", border: "none", background: "none",
            cursor: "pointer", color: "var(--txt-muted)",
            borderBottom: "2px solid transparent",
          }}>
            <span style={{
              fontSize: "1.25rem", lineHeight: 1,
              filter: "grayscale(1) opacity(.55)",
            }}>👤</span>
            <span style={{
              fontSize: "0.65rem", fontWeight: 500,
              letterSpacing: "0.04em", whiteSpace: "nowrap",
            }}>
              Inicio sesión
            </span>
          </button>
        </li>
      </ul>
    </nav>
  );
}