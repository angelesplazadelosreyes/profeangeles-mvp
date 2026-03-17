// src/data/loading.content.js

export const CURIOSITIES = [
  { text: "El cero fue inventado de forma independiente en India y Mesoamérica. Sin él, el álgebra moderna no existiría.", source: "Historia de las Matemáticas" },
  { text: "La palabra 'álgebra' viene del árabe 'al-jabr', del libro de Al-Juarismi escrito en el siglo IX.", source: "Al-Kitāb al-mukhtaṣar" },
  { text: "El número π ha sido calculado con más de 100 billones de decimales, pero con 39 decimales basta para medir el universo observable.", source: "NASA JPL" },
  { text: "Una función cuadrática describe la trayectoria de cualquier objeto lanzado al aire, ignorando la resistencia del viento.", source: "Física clásica" },
  { text: "Euler era casi ciego cuando escribió algunos de sus trabajos más importantes. Decía que sin distracciones, se concentraba mejor.", source: "Biografía de Leonhard Euler" },
  { text: "El discriminante (Δ = b²-4ac) fue formalizado por Lagrange en el siglo XVIII, aunque su uso es anterior.", source: "Historia del Álgebra" },
  { text: "Las parábolas tienen una propiedad única: todos los rayos paralelos al eje de simetría se reflejan hacia el foco. Por eso se usan en antenas y espejos.", source: "Geometría analítica" },
  { text: "Pitágoras tenía una escuela donde las matemáticas eran casi una religión. Sus seguidores creían que todo en el universo era número.", source: "Filosofía griega" },
  { text: "El número de oro φ ≈ 1.618 aparece en la proporción de pétalos de flores, espirales de caracoles y en el Partenón de Atenas.", source: "Matemáticas y naturaleza" },
  { text: "Gauss calculó la suma de los números del 1 al 100 en segundos a los 10 años: notó que 1+100 = 101, 2+99 = 101... son 50 pares.", source: "Biografía de Carl Friedrich Gauss" },
];

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function generateArithmeticExercise() {
  const ops = ['+', '-', '×'];
  const op  = ops[randomInt(0, 2)];

  let a, b, answer, question;

  if (op === '+') {
    a = randomInt(10, 99);
    b = randomInt(10, 99);
    answer = a + b;
    question = `${a} + ${b}`;
  } else if (op === '-') {
    a = randomInt(20, 99);
    b = randomInt(10, a);
    answer = a - b;
    question = `${a} − ${b}`;
  } else {
    a = randomInt(2, 12);
    b = randomInt(2, 12);
    answer = a * b;
    question = `${a} × ${b}`;
  }

  return { question, answer };
}