import Link from 'next/link';
import { JUEGOS } from '@/data/juegos';
import '@/styles/juegos.css';

export const metadata = {
  title: 'Juegos · ProfeÁngeles',
  description: 'Juegos educativos de matemáticas para practicar de forma interactiva.',
};

export default function JuegosPage() {
  return (
    <main className="juegos-page">
      <h1 className="juegos-page__title">Juegos</h1>
      <p className="juegos-page__subtitle">
        Practica matemáticas de forma interactiva. ¡Elige un juego y desafíate!
      </p>

      <div className="juegos-grid">
        {JUEGOS.map(juego => (
          juego.available ? (
            <Link
              key={juego.id}
              href={`/juegos/${juego.id}`}
              className="game-card"
            >
              <span className="game-card__icon">{juego.icon}</span>
              <span className="game-card__name">{juego.name}</span>
              <span className="game-card__desc">{juego.descripcion}</span>
            </Link>
          ) : (
            <div key={juego.id} className="game-card game-card--disabled">
              <span className="game-card__icon">{juego.icon}</span>
              <span className="game-card__name">{juego.name}</span>
              <span className="game-card__desc">{juego.descripcion}</span>
              <span className="game-card__soon">Próximamente</span>
            </div>
          )
        ))}
      </div>
    </main>
  );
}