// src/subjects/math/options.js
// Opciones de Matemáticas para la página de ejercicios.
// Estructura:
//
// MATH_OPTIONS = {
//   "Tema": {
//      "Subtema": [
//         { id: "tipo_interno", label: "Texto que ve el usuario" },
//         ...
//      ]
//   },
//   ...
// }

export const MATH_OPTIONS = {
  "Álgebra": {
    "Función cuadrática": [
      { id: "analisis_completo", label: "Análisis completo (raíces, vértice, etc.)" },
      { id: "solo_grafico",      label: "Solo gráfico de la función" },
      { id: "solo_raices",       label: "Solo raíces de la función" }
    ],
    "Ecuaciones lineales": [
      { id: "una_incognita", label: "Ecuaciones de una incógnita" },
      { id: "sistema_2x2",   label: "Sistema 2×2" }
    ]
  },

  "Geometría": {
    "Triángulos": [
      { id: "angulo_desconocido", label: "Cálculo de ángulo desconocido" },
      { id: "area_triangulo",     label: "Área de triángulo" }
    ],
    "Círculos": [
      { id: "longitud_circunferencia", label: "Longitud de circunferencia" },
      { id: "area_circulo",            label: "Área de círculo" }
    ]
  }
};
