import Link from 'next/link';
import { JUEGOS } from '@/data/juegos';
import TablasMult from '@/components/juegos/TablasMult';
import '@/styles/juegos.css';

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateStaticParams() {
  return JUEGOS.filter(j => j.available).map(j => ({ id: j.id }));
}

export default async function JuegoPage({ params }: Props) {
  const { id } = await params;
  const juego = JUEGOS.find(j => j.id === id && j.available);

  if (!juego) {
    return (
      <main className="juego-page">
        <Link href="/juegos" className="juego-page__back">← Volver a juegos</Link>
        <p>Juego no encontrado.</p>
      </main>
    );
  }

  return (
    <main className="juego-page">
      <Link href="/juegos" className="juego-page__back">← Volver a juegos</Link>
      {id === 'tablas' && <TablasMult />}
    </main>
  );
}