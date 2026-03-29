// components/layout/Nav.tsx
// Barra de navegación — Client Component
// Desktop (>860px): icon + label horizontal
// Móvil (≤860px): logo + botón hamburguesa → menú vertical desplegable
// --nav-bg siempre claro independiente de la paleta (DOC-01 §2.2)

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

interface NavItem {
  href: string;
  icon: string;
  label: string;
}

const navItems: NavItem[] = [
  { href: "/",            icon: "🏠", label: "Inicio"      },
  { href: "/ejercicios",  icon: "✏️", label: "Ejercicios"  },
  { href: "/guias",       icon: "📄", label: "Guías"       },
  { href: "/clases",      icon: "🎓", label: "Clases"      },
  { href: "/informatica", icon: "💻", label: "Informática" },
];

export default function Nav() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <>
      <style>{`
        .nav-desktop { display: flex; }
        .nav-hamburger { display: none; }
        .nav-mobile-menu { display: none; }

        @media (max-width: 860px) {
          .nav-desktop { display: none; }
          .nav-hamburger { display: flex; }
          .nav-mobile-menu {
            display: flex;
            flex-direction: column;
            position: fixed;
            top: 64px; left: 0; right: 0;
            background: var(--nav-bg);
            backdrop-filter: blur(16px);
            border-bottom: 1px solid var(--rule);
            padding: 0.75rem 1.5rem 1rem;
            gap: 0.25rem;
            z-index: 199;
          }
          .nav-mobile-menu.closed { display: none; }
        }
      `}</style>

      {/* ── BARRA PRINCIPAL ── */}
      <nav style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 200,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "0 2.5rem", height: "64px",
        background: "var(--nav-bg)",
        backdropFilter: "blur(16px)",
        borderBottom: "1px solid var(--rule)",
      }}>

        {/* Logo */}
        <Link href="/" style={{
          fontFamily: "var(--font-syne), sans-serif",
          fontWeight: 800, fontSize: "1.2rem",
          letterSpacing: "-0.02em", textDecoration: "none",
          color: "var(--txt)",
        }}>
          Profe<span style={{ color: "var(--cta)" }}>Á</span>ngeles
        </Link>

        {/* ── Desktop: ítems horizontales ── */}
        <ul className="nav-desktop" style={{
          alignItems: "center", gap: "0.25rem",
          listStyle: "none", height: "64px", margin: 0, padding: 0,
        }}>
          {navItems.map((item) => (
            <li key={item.href} style={{ height: "100%", display: "flex", alignItems: "center" }}>
              <Link
                href={item.href}
                style={{
                  display: "flex", flexDirection: "column",
                  alignItems: "center", justifyContent: "center",
                  gap: "3px", padding: "0 1rem", height: "100%",
                  textDecoration: "none", minWidth: "64px",
                  color: isActive(item.href) ? "var(--primary)" : "var(--txt-muted)",
                  borderBottom: isActive(item.href) ? "2px solid var(--primary)" : "2px solid transparent",
                  transition: "color .2s, border-color .2s",
                }}
              >
                <span style={{
                  fontSize: "1.25rem", lineHeight: 1,
                  filter: isActive(item.href) ? "grayscale(0) opacity(1)" : "grayscale(1) opacity(.55)",
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
          ))}

          {/* Inicio sesión */}
          <li style={{ height: "100%", display: "flex", alignItems: "center" }}>
            <button style={{
              display: "flex", flexDirection: "column",
              alignItems: "center", justifyContent: "center",
              gap: "3px", padding: "0 1rem", height: "100%",
              minWidth: "64px", border: "none", background: "none",
              cursor: "pointer", color: "var(--txt-muted)",
              borderBottom: "2px solid transparent",
            }}>
              <span style={{ fontSize: "1.25rem", lineHeight: 1, filter: "grayscale(1) opacity(.55)" }}>👤</span>
              <span style={{ fontSize: "0.65rem", fontWeight: 500, letterSpacing: "0.04em", whiteSpace: "nowrap" }}>
                Inicio sesión
              </span>
            </button>
          </li>
        </ul>

        {/* ── Móvil: botón hamburguesa ── */}
        <button
          className="nav-hamburger"
          onClick={() => setMenuOpen(!menuOpen)}
          style={{
            alignItems: "center", justifyContent: "center",
            width: "40px", height: "40px",
            border: "none", background: "none",
            cursor: "pointer", fontSize: "1.4rem",
            color: "var(--txt)",
          }}
          aria-label={menuOpen ? "Cerrar menú" : "Abrir menú"}
        >
          {menuOpen ? "✕" : "☰"}
        </button>

      </nav>

      {/* ── Móvil: menú desplegable ── */}
      <div className={`nav-mobile-menu${menuOpen ? "" : " closed"}`}>
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => setMenuOpen(false)}
            style={{
              display: "flex", alignItems: "center", gap: "0.75rem",
              padding: "0.75rem 0.5rem",
              borderRadius: "10px",
              textDecoration: "none",
              fontSize: "0.95rem", fontWeight: 500,
              color: isActive(item.href) ? "var(--primary)" : "var(--txt)",
              background: isActive(item.href) ? "var(--primary-lt)" : "transparent",
              borderBottom: "1px solid var(--rule)",
            }}
          >
            <span style={{ fontSize: "1.2rem" }}>{item.icon}</span>
            {item.label}
          </Link>
        ))}

        {/* Inicio sesión en móvil */}
        <button style={{
          display: "flex", alignItems: "center", gap: "0.75rem",
          padding: "0.75rem 0.5rem",
          border: "none", background: "none",
          cursor: "pointer", width: "100%",
          fontSize: "0.95rem", fontWeight: 500,
          color: "var(--txt-muted)",
        }}>
          <span style={{ fontSize: "1.2rem" }}>👤</span>{" "}
          Inicio sesión
        </button>
      </div>
    </>
  );
}