// nextjs/app/clases/[area]/page.tsx
import { notFound }    from 'next/navigation';
import Link            from 'next/link';
import { AREAS, AreaId, REFERIDOS } from '@/data/clases';
import PreciosTabla    from '@/components/clases/PreciosTabla';
import AreaFaq         from '@/components/clases/AreaFaq';

const WA_BASE = "https://wa.me/56971312255?text=Hola%20Profe%20%C3%81ngeles%2C%20quiero%20una%20sesi%C3%B3n%20diagn%C3%B3stica%20para%20el%20%C3%A1rea%20";

export function generateStaticParams() {
  return Object.keys(AREAS).map((area) => ({ area }));
}

export async function generateMetadata({ params }: { params: Promise<{ area: string }> }) {
  const { area } = await params;
  const data = AREAS[area as AreaId];
  if (!data) return {};
  return {
    title:       `${data.titulo} — ProfeAngeles`,
    description: data.descripcion,
  };
}

export default async function AreaPage({ params }: { params: Promise<{ area: string }> }) {
  const { area } = await params;
  const data = AREAS[area as AreaId];

  if (!data) notFound();

  const waUrl = WA_BASE + encodeURIComponent(data.titulo);

  return (
    <main className="area-page">
      <Link className="area-back" href="/clases">
        ← Volver a clases
      </Link>

      <h1 className="area-hero-title">{data.titulo}</h1>
      <p className="area-descripcion">{data.descripcion}</p>

      <div className="area-section">
        <h2>A quien va dirigido?</h2>
        <p style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)', lineHeight: 1.65 }}>
          {data.dirigidoA}
        </p>
      </div>

      {data.materias && (
        <div className="area-section">
          <h2>Materias disponibles</h2>
          <div className="materias-chips">
            {data.materias.map((m) => (
              <span key={m} className="materia-chip">{m}</span>
            ))}
          </div>
        </div>
      )}

      <div className="area-section">
        <h2>Precios</h2>

        {data.precios && (
          <PreciosTabla precios={data.precios} />
        )}

        {data.niveles && data.niveles.map((nivel) => (
          <PreciosTabla
            key={nivel.id}
            precios={nivel.precios}
            label={nivel.nombre}
            descripcion={nivel.descripcion}
          />
        ))}
      </div>

      <div className="referidos-box">
        <h3>Programa de referidos</h3>
        <ul>
          <li><strong>Si refieres a alguien:</strong> {REFERIDOS.beneficioReferidor}</li>
          <li><strong>Si te refirieron:</strong> {REFERIDOS.beneficioReferido}</li>
        </ul>
      </div>

      <AreaFaq items={data.faq} />

      <div className="final-cta">
        <h3>Listo para empezar?</h3>
        <p>Agenda tu sesion diagnostica gratuita de 20 minutos.</p>
        <a className="btn-wa" href={waUrl} target="_blank" rel="noopener noreferrer">
          Contactar por WhatsApp
        </a>
      </div>
    </main>
  );
}