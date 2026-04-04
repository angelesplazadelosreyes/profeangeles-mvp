export interface Juego {
  id: string;
  name: string;
  icon: string;
  materia: string;
  descripcion: string;
  available: boolean;
}

export const JUEGOS: Juego[] = [
  {
    id: 'tablas',
    name: 'Tablas de multiplicar',
    icon: '✖️',
    materia: 'Matemáticas',
    descripcion: 'Practica las tablas del 1 al 12 contra el tiempo.',
    available: true,
  },
  {
    id: 'factores',
    name: 'Factorización',
    icon: '🧩',
    materia: 'Matemáticas',
    descripcion: 'Descompón números en sus factores primos.',
    available: false,
  },
];