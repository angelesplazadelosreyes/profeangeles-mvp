// nextjs/components/clases/Testimonios.tsx
import { TESTIMONIOS } from '@/data/clases';

export default function Testimonios() {
  return (
    <div style={{ marginTop: '2rem' }}>
      <div className="section-label">Lo que dicen mis estudiantes</div>
      <div className="section-title">Opiniones reales</div>
      <p className="section-sub">Verificable con capturas de WhatsApp.</p>

      <div className="testimonios-grid">
        {TESTIMONIOS.map((t) => (
          <div key={t.nombre} className="testimonio-card">
            <div className="t-stars">★★★★★</div>
            <p className="t-quote">{t.texto}</p>
            <div className="t-author">
              <div className="t-avatar" style={{ background: t.color }}>
                {t.inicial}
              </div>
              <div className="t-info">
                <strong>{t.nombre}</strong>
                <span>{t.rol}</span>
              </div>
            </div>
            <div className="t-source">Opinion verificada via WhatsApp</div>
          </div>
        ))}
      </div>
    </div>
  );
}