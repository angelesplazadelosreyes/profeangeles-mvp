// components/layout/Footer.tsx
// Footer compartido — Server Component
// Sin referencias geográficas ni clases presenciales (DOC-01 §8)

import Link from "next/link";

export default function Footer() {
  return (
    <footer style={{
      background: "var(--txt)",
      padding: "2.25rem 3rem",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      flexWrap: "wrap",
      gap: "1rem",
    }}>

      {/* Logo */}
      <div style={{
        fontFamily: "var(--font-inter), sans-serif",
        fontWeight: 800, fontSize: "1.05rem", color: "#fff",
      }}>
        Profe<span style={{ color: "var(--cta)" }}>Á</span>ngeles
      </div>

      {/* Copyright */}
      <p style={{ fontSize: "0.75rem", color: "rgba(255,255,255,.35)" }}>
        © {new Date().getFullYear()} ProfeÁngeles
      </p>

      {/* Links de navegación */}
      <ul style={{
        display: "flex", gap: "1.5rem",
        listStyle: "none",
      }}>
        {[
          { href: "/ejercicios", label: "Ejercicios" },
          { href: "/clases",     label: "Clases"     },
          { href: "/guias",      label: "Guías"      },
          { href: "/informatica",label: "Informática"},
        ].map((link) => (
          <li key={link.href}>
            <Link href={link.href} style={{
              fontSize: "0.75rem",
              color: "rgba(255,255,255,.4)",
              textDecoration: "none",
              transition: "color .2s",
            }}>
              {link.label}
            </Link>
          </li>
        ))}
      </ul>

    </footer>
  );
}