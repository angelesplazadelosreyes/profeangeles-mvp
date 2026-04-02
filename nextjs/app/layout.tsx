// app/layout.tsx
import type { Metadata } from "next";
import { Inter, Kalam } from "next/font/google";
import "./globals.css";
import Nav from "@/components/layout/Nav";
import Footer from "@/components/layout/Footer";
import PaletteSwitcher from "@/components/ui/PaletteSwitcher";
import "@/styles/landing.css";
import '@/styles/ejercicios.css';
import '@/styles/guias.css';
import '@/styles/clases.css';

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["300", "400", "500"],
});

const kalam = Kalam({
  variable: "--font-kalam",
  subsets: ["latin"],
  weight: ["700"],
});

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
    <html lang="es" className={`${inter.variable} ${kalam.variable}`}>
      <head>
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
        <script
          defer
          src="https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js"
          id="MathJax-script"
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