// nextjs/components/clases/FaqList.tsx
import { FAQ_GENERAL } from '@/data/clases';

export default function FaqList() {
  return (
    <div style={{ marginTop: '2rem' }}>
      <div className="section-label">Preguntas frecuentes</div>
      <div className="section-title">Dudas comunes</div>

      <div className="faq-list">
        {FAQ_GENERAL.map((item) => (
          <details key={item.pregunta}>
            <summary>
              {item.pregunta}
            </summary>
            <p>{item.respuesta}</p>
          </details>
        ))}
      </div>
    </div>
  );
}