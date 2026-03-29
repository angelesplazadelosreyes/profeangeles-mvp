// app/layout.tsx
// Layout raíz — envuelve todas las páginas del sitio
// Server Component por defecto
// Responsabilidades:
//   1. Cargar fuentes Inter y Syne via next/font (sin latencia de red)
//   2. Aplicar paleta desde localStorage antes del primer render (evita FOUC)
//   3. Definir metadata global del sitio
//   4. Renderizar Nav y Footer compartidos (se agregan en pasos siguientes)

import type { Metadata } from "next";
import { Inter, Syne } from "next/font/google";
import "./globals.css";
import Nav from "@/components/layout/Nav";
import Footer from "@/components/layout/Footer";
import PaletteSwitcher from "@/components/ui/PaletteSwitcher";

// Inter — cuerpo de texto, UI, etiquetas
// variable CSS --font-inter disponible en todo el sitio
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["300", "400", "500"],
});

// Syne — logo y títulos de alto impacto
// variable CSS --font-syne disponible en todo el sitio
const syne = Syne({
  variable: "--font-syne",
  subsets: ["latin"],
  weight: ["400", "600", "700", "800"],
});

// Metadata global — se sobreescribe por página donde sea necesario
export const metadata: Metadata = {
  title: "ProfeÁngeles — Clases, ejercicios y herramientas educativas",
  description:
    "Clases online de matemáticas, ciencias e informática. Generador de ejercicios, guías PDF y herramientas tecnológicas para estudiantes, profesores y profesionales.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={`${inter.variable} ${syne.variable}`}>
      <head>
        {/* Script inline — se ejecuta ANTES de que React hidrate el DOM.
            Lee localStorage y aplica la paleta guardada.
            Si no hay paleta guardada, usa la por defecto (índice 0).
            Debe ser inline y estar en <head> para evitar FOUC. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var idx = parseInt(localStorage.getItem('pa-palette') || '0', 10);
                  if (isNaN(idx) || idx < 0 || idx > 6) idx = 0;
                  document.documentElement.setAttribute('data-palette', idx);
                } catch(e) {}
              })();
            `,
          }}
        />
      </head>
      <body>
        <Nav />
        {children}
        <Footer />
        <PaletteSwitcher />
      </body>
    </html>
  );
}