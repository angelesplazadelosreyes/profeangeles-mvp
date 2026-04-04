// nextjs/components/clases/PacksGrid.tsx

const WA_PACKS = "https://wa.me/56971312255?text=Hola%20Profe%20%C3%81ngeles%2C%20quiero%20consultar%20por%20los%20packs%20mensuales.";

export default function PacksGrid() {
  return (
    <div style={{ marginTop: '2rem' }}>
      <div className="section-label">Mayor ahorro + más beneficios</div>
      <div className="section-title">Packs mensuales</div>
      <p className="section-sub">
        Compromiso mensual con precio fijo y beneficios exclusivos que las
        clases sueltas no incluyen.
      </p>

      <div className="packs-grid">
        {/* Básico */}
        <div className="pack-card">
          <div className="pack-name">Pack Básico</div>
          <div className="pack-highlight">4 clases / mes</div>
          <ul className="pack-features">
            <li>Horario fijo semanal</li>
            <li>PPT de cada clase</li>
            <li>Grabación disponible</li>
            <li className="exclusive">Consultas WhatsApp entre clases</li>
          </ul>
          <p className="pack-note">* Precio según nivel y materia. Consulta por WhatsApp.</p>
        </div>

        {/* Refuerzo — destacado */}
        <div className="pack-card featured">
          <div className="pack-badge">Más elegido</div>
          <div className="pack-name">Pack Refuerzo</div>
          <div className="pack-highlight">8 clases / mes · ~7% descuento</div>
          <ul className="pack-features">
            <li>2 clases por semana</li>
            <li>PPT de cada clase</li>
            <li>Grabación disponible</li>
            <li className="exclusive">Consultas WhatsApp entre clases</li>
            <li className="exclusive">Prioridad de horario</li>
            <li className="exclusive">Seguimiento mensual de avance</li>
          </ul>
          <p className="pack-note">* Precio según nivel y materia. Consulta por WhatsApp.</p>
        </div>

        {/* Intensivo */}
        <div className="pack-card">
          <div className="pack-name">Pack Intensivo</div>
          <div className="pack-highlight">12 clases / mes · ~13% descuento</div>
          <ul className="pack-features">
            <li>3 clases por semana</li>
            <li>PPT de cada clase</li>
            <li>Grabación disponible</li>
            <li className="exclusive">Consultas WhatsApp entre clases</li>
            <li className="exclusive">Prioridad máxima de agenda</li>
            <li className="exclusive">Seguimiento mensual de avance</li>
            <li className="exclusive">Guías de ejercicios</li>
          </ul>
          <p className="pack-note">* Precio según nivel y materia. Consulta por WhatsApp.</p>
        </div>
      </div>

      <div style={{ textAlign: 'center', marginTop: '1.25rem' }}>
        <a className="btn-wa" href={WA_PACKS} target="_blank" rel="noopener noreferrer">
          Consultar mi pack ideal
        </a>
      </div>
    </div>
  );
}