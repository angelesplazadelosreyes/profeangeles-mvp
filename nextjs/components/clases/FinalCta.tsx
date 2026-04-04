// nextjs/components/clases/FinalCta.tsx

const WA_DIAGNOSTICO = "https://wa.me/56971312255?text=Hola%20Profe%20%C3%81ngeles%2C%20quiero%20agendar%20mi%20clase%20diagn%C3%B3stica%20gratuita";

export default function FinalCta() {
  return (
    <div className="final-cta" style={{ marginTop: '2rem' }}>
      <h3>¿Comenzamos?</h3>
      <p>
        Agenda tu clase diagnostica gratuita hoy. Sin compromiso, en menos
        de 2 minutos por WhatsApp.
      </p>
      <a className="btn-wa" href={WA_DIAGNOSTICO} target="_blank" rel="noopener noreferrer">
        Escribir por WhatsApp
      </a>
    </div>
  );
}