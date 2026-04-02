// nextjs/components/clases/Incluye.tsx

const ITEMS = [
  {
    icono: '📊',
    titulo: 'Presentación PPT',
    texto: 'Te la envío por WhatsApp al terminar para que repases cuando quieras.',
  },
  {
    icono: '🎥',
    titulo: 'Grabación disponible',
    texto: 'Pídela con anticipación y te la envío. Ideal si necesitas repasar una explicación.',
  },
  {
    icono: '💬',
    titulo: 'Dudas por WhatsApp',
    texto: 'Consultas puntuales entre clases para que no te quedes atascado.',
  },
  {
    icono: '📅',
    titulo: 'Agendamiento flexible',
    texto: 'Coordina por WhatsApp y recibe el link de Google Meet al instante.',
  },
];

export default function Incluye() {
  return (
    <div style={{ marginBottom: '2rem' }}>
      <div className="section-label">Cada clase incluye</div>
      <div className="includes-grid">
        {ITEMS.map((item) => (
          <div key={item.titulo} className="include-item">
            <span className="include-icon">{item.icono}</span>
            <div className="include-text">
              <strong>{item.titulo}</strong>
              <span>{item.texto}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}