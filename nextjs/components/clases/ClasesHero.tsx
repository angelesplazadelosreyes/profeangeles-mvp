// nextjs/components/clases/ClasesHero.tsx

export default function ClasesHero() {
  return (
    <div style={{
      border: '1.5px solid var(--primary, #ddd)',
      borderRadius: '14px',
      background: 'var(--color-bg, #fff)',
      padding: '1.5rem',
      display: 'flex',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
      gap: '1.5rem',
      marginTop: '2.5rem',
      marginBottom: '1.5rem',
      flexWrap: 'wrap',
    }}>
      {/* Columna izquierda */}
      <div style={{ flex: 1, minWidth: '280px' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.9rem' }}>
          <span style={{
            fontSize: '0.8rem',
            padding: '4px 14px',
            borderRadius: '20px',
            border: '1.5px solid var(--primary, #7c6fcd)',
            color: 'var(--primary-dark, #3c3489)',
            background: 'var(--primary-5, #f3f0ff)',
            fontWeight: 500,
          }}>Clases online</span>
          <span style={{
            fontSize: '0.8rem',
            padding: '4px 14px',
            borderRadius: '20px',
            border: '1.5px solid var(--primary, #7c6fcd)',
            color: 'var(--primary-dark, #3c3489)',
            background: 'var(--primary-5, #f3f0ff)',
            fontWeight: 500,
          }}>45 min · hora pedagógica</span>
        </div>

        <h1 style={{
          fontSize: '2rem',
          fontWeight: 800,
          color: 'var(--color-text, #1a1a2e)',
          lineHeight: 1.25,
          marginBottom: '0.6rem',
        }}>
          Aprende <span style={{ color: 'var(--primary, #7c6fcd)' }}>a tu ritmo</span>,<br />
          te ayudo a cumplir tus metas.
        </h1>

        <p style={{
          fontSize: '1rem',
          color: 'var(--color-text-secondary, #555)',
          lineHeight: 1.8,
          maxWidth: '58ch',
          margin: 0,
        }}>
          Clases personalizadas de Matemáticas, Ciencias e Informática online.<br />
          Material incluido, dudas por WhatsApp y seguimiento real de tu avance.
        </p>
      </div>

      {/* Stats derecha */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        border: '2px solid var(--primary, #7c6fcd)',
        borderRadius: '12px',
        overflow: 'hidden',
        minWidth: '120px',
        flexShrink: 0,
        background: 'var(--primary-5, #f3f0ff)',
      }}>
        {[
          { valor: '45',  desc: 'min por clase' },
          { valor: '3',   desc: 'áreas de estudio' },
          { valor: 'PPT', desc: 'incluido' },
          { valor: 'WA',  desc: 'consultas directas' },
        ].map((s, i, arr) => (
          <div key={s.valor} style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            padding: '0.5rem 1rem',
            borderBottom: i < arr.length - 1 ? '1px solid var(--primary-light, #c4bef5)' : 'none',
          }}>
            <strong style={{
              fontSize: '1rem',
              fontWeight: 800,
              color: 'var(--primary-dark, #3c3489)',
            }}>
              {s.valor}
            </strong>
            <span style={{
              fontSize: '0.7rem',
              color: 'var(--primary, #7c6fcd)',
              textAlign: 'center',
              marginTop: '2px',
              fontWeight: 500,
            }}>
              {s.desc}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}