// nextjs/components/clases/AreaFaq.tsx
import { FaqItem } from '@/data/clases';

interface Props {
  items: FaqItem[];
}

export default function AreaFaq({ items }: Props) {
  return (
    <div className="area-section">
      <h2>Preguntas frecuentes</h2>
      <div className="faq-list">
        {items.map((item) => (
          <details key={item.pregunta}>
            <summary>{item.pregunta}</summary>
            <p>{item.respuesta}</p>
          </details>
        ))}
      </div>
    </div>
  );
}