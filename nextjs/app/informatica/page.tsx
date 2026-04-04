// nextjs/app/informatica/page.tsx

export const metadata = {
  title:       'Servicios tecnológicos — ProfeÁngeles',
  description: 'Automatización con Excel, desarrollo web y talleres para colegios. Ingeniera en Informática con experiencia real.',
};

const SERVICIOS = [
  {
    icono:       '📊',
    titulo:      'Automatización con Excel',
    descripcion: 'Planillas de inventario, control de ventas o cualquier proceso que hoy manejas en papel o de forma manual. Entrega en 48 hrs, incluye capacitación.',
    precio:      'Desde $35.000',
    wa:          'https://wa.me/56971312255?text=Hola%20Profe%20%C3%81ngeles%2C%20necesito%20una%20planilla%20Excel%20para%20mi%20negocio.',
  },
  {
    icono:       '🌐',
    titulo:      'Desarrollo web',
    descripcion: 'Sitios web simples y profesionales para negocios, emprendimientos o profesionales independientes. Diseño responsivo, publicación incluida.',
    precio:      'Desde $150.000',
    wa:          'https://wa.me/56971312255?text=Hola%20Profe%20%C3%81ngeles%2C%20me%20interesa%20tener%20un%20sitio%20web.',
  },
  {
    icono:       '🔍',
    titulo:      'Talleres para colegios',
    descripcion: 'Talleres extraprogramáticos de introducción a la programación o nivelación en matemáticas. Hasta 20 estudiantes, material incluido.',
    precio:      'Desde $60.000 por sesión',
    wa:          'https://wa.me/56971312255?text=Hola%20Profe%20%C3%81ngeles%2C%20me%20interesa%20un%20taller%20para%20mi%20colegio.',
  },
];

export default function InformaticaPage() {
  return (
    <main className="informatica-page" style={{ paddingTop: '6rem' }}>
      <div className="section-label">Más allá de las clases</div>
      <div className="section-title">Servicios tecnológicos</div>
      <p className="section-sub">
        Ingeniera en Informática con experiencia en desarrollo web, automatización y QA.
        Soluciones concretas para personas y negocios.
      </p>

      <div className="tech-grid">
        {SERVICIOS.map((s) => (
          <div key={s.titulo} className="tech-card">
            <div className="tech-card-icon">{s.icono}</div>
            <h3>{s.titulo}</h3>
            <p>{s.descripcion}</p>
            <div className="tech-price">{s.precio}</div>
            <a className="btn-card-tech" href={s.wa} target="_blank" rel="noopener noreferrer">
              Consultar →
            </a>
          </div>
        ))}
      </div>
    </main>
  );
}