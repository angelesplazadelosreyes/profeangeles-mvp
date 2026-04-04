// nextjs/components/clases/PreciosTabla.tsx
import { PreciosArea } from '@/data/clases';

function fmt(n: number) {
  return `$${n.toLocaleString('es-CL')}`;
}

interface Props {
  precios:      PreciosArea;
  label?:       string;
  descripcion?: string;
}

export default function PreciosTabla({ precios, label, descripcion }: Props) {
  return (
    <div style={{ marginBottom: '1rem' }}>
      {label && <p style={{ marginBottom: '0.4rem', fontWeight: 600, fontSize: '0.9rem' }}>{label}</p>}
      {descripcion && <p className="nivel-tab-desc">{descripcion}</p>}

      <div className="precios-tabla-wrap">
        <table className="precios-tabla">
          <thead>
            <tr>
              <th>Clase única</th>
              <th>Pack 4</th>
              <th>Pack 8</th>
              <th>Pack 12</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>{fmt(precios.unica)}</strong></td>
              <td>{fmt(precios.pack4)}</td>
              <td>{fmt(precios.pack8)}</td>
              <td>{fmt(precios.pack12)}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}