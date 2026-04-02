// nextjs/components/clases/PreciosGrid.tsx
import Link from 'next/link';

const WA_MAT = "https://wa.me/56971312255?text=Hola%20Profe%20%C3%81ngeles%2C%20quiero%20agendar%20una%20clase%20de%20Matem%C3%A1ticas%20o%20Ciencias.";
const WA_PY  = "https://wa.me/56971312255?text=Hola%20Profe%20%C3%81ngeles%2C%20quiero%20agendar%20una%20clase%20de%20Python.";

export default function PreciosGrid() {
  return (
    <div id="precios" style={{ scrollMarginTop: '80px' }}>
      <div className="section-label">Clases disponibles</div>
      <div className="section-title">Elige tu área</div>
      <p className="section-sub">
        Pago por clase, sin compromisos. Transferencia bancaria al confirmar.
      </p>

      <div className="price-grid">
        {/* Matemáticas / Ciencias */}
        <article className="price-card">
          <div className="price-card-header">
            <span className="card-icon">📐</span>
            <div>
              <h3>Matemáticas / Ciencias</h3>
              <p>Escolar, PAES y universitario</p>
            </div>
          </div>

          <div className="price-card-body">
            <div className="price-row">
              <div className="price-level">
                Escolar
                <span>Básica y media</span>
              </div>
              <div className="price-val">$14.000 <small>/ clase</small></div>
            </div>
            <div className="price-row">
              <div className="price-level">
                PAES
                <span>Preparación prueba de admisión</span>
              </div>
              <div className="price-val">$16.000 <small>/ clase</small></div>
            </div>
            <div className="price-row">
              <div className="price-level">
                Universitario
                <span>Biología, Química, Fisiología...</span>
              </div>
              <div className="price-val">$20.000 <small>/ clase</small></div>
            </div>
          </div>

          <div className="price-card-footer">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginBottom: '0.6rem' }}>
              <Link className="btn-detalle" href="/clases/escolar">Ver detalle Escolar →</Link>
              <Link className="btn-detalle" href="/clases/paes">Ver detalle PAES →</Link>
              <Link className="btn-detalle" href="/clases/universitario">Ver detalle Universitario →</Link>
            </div>
            <a className="btn-card-wa" href={WA_MAT} target="_blank" rel="noopener noreferrer">
              Agendar por WhatsApp →
            </a>
          </div>
        </article>

        {/* Python */}
        <article className="price-card">
          <div className="price-card-header">
            <span className="card-icon">🐍</span>
            <div>
              <h3>Fundamentos de Python</h3>
              <p>Desde cero hasta proyectos reales</p>
            </div>
          </div>

          <div className="price-card-body">
            <div className="price-row">
              <div className="price-level">
                Nivel 0-1
                <span>Sin experiencia previa</span>
              </div>
              <div className="price-val">$18.000 <small>/ clase</small></div>
            </div>
            <div className="price-row">
              <div className="price-level">
                Nivel 2
                <span>Funciones, listas, lógica</span>
              </div>
              <div className="price-val">$20.000 <small>/ clase</small></div>
            </div>
            <div className="price-row">
              <div className="price-level">
                Nivel 3
                <span>POO, archivos, proyectos</span>
              </div>
              <div className="price-val">$22.000 <small>/ clase</small></div>
            </div>
          </div>

          <div className="price-card-footer">
            <div style={{ marginBottom: '0.6rem' }}>
              <Link className="btn-detalle" href="/clases/python">Ver detalle Python →</Link>
            </div>
            <a className="btn-card-wa" href={WA_PY} target="_blank" rel="noopener noreferrer">
              Agendar por WhatsApp →
            </a>
          </div>
        </article>
      </div>
    </div>
  );
}