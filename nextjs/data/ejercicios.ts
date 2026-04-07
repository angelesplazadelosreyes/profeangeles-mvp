// nextjs/data/ejercicios.ts

// ── Tipos ──────────────────────────────────────────────────────────────────

export type Nivel = 'Básica' | 'Media' | 'Universitario';

export interface TipoEjercicio {
  id:      string;
  label:   string;
  niveles: Nivel[];   // qué niveles pueden ver este tipo
}

export interface OpcionesMateria {
  [subtema: string]: TipoEjercicio[];
}

export interface OpcionesEjercicios {
  [tema: string]: OpcionesMateria;
}

// ── Niveles disponibles ────────────────────────────────────────────────────

export const NIVELES: Nivel[] = ['Básica', 'Media', 'Universitario'];

// ── Opciones de Matemáticas ────────────────────────────────────────────────

export const MATH_OPTIONS: OpcionesEjercicios = {
  'Aritmética': {
    'Mínimo Común Múltiplo': [
      {
        id:      'mcm_dos_numeros',
        label:   'MCM de 2 números',
        niveles: ['Básica'],
      },
      {
        id:      'mcm_tres_numeros',
        label:   'MCM de 3 números',
        niveles: ['Básica'],
      },
      {
        id:      'mcm_cuatro_numeros',
        label:   'MCM de 4 números',
        niveles: ['Básica'],
      },
    ],
  },

  'Álgebra': {
    'Función cuadrática': [
      {
        id:      'analisis_completo',
        label:   'Análisis completo (raíces, vértice, dominio y recorrido)',
        niveles: ['Media', 'Universitario'],
      },
      {
        id:      'convert_factorizada_a_general_y_canonica',
        label:   'Conversión: factorizada → general → canónica',
        niveles: ['Media', 'Universitario'],
      },
      {
        id:      'convert_canonica_a_general_y_factorizada',
        label:   'Conversión: canónica → general → factorizada',
        niveles: ['Media', 'Universitario'],
      },
    ],
    'Ecuaciones lineales': [
      {
        id:      'una_incognita',
        label:   'Ecuaciones de una incógnita',
        niveles: ['Básica', 'Media', 'Universitario'],
      },
      {
        id:      'sistema_2x2',
        label:   'Sistema 2×2',
        niveles: ['Media', 'Universitario'],
      },
    ],
  },

  'Geometría': {
    'Triángulos': [
      {
        id:      'angulo_desconocido',
        label:   'Cálculo de ángulo desconocido',
        niveles: ['Básica', 'Media'],
      },
      {
        id:      'area_triangulo',
        label:   'Área de triángulo',
        niveles: ['Básica', 'Media'],
      },
    ],
    'Círculos': [
      {
        id:      'longitud_circunferencia',
        label:   'Longitud de circunferencia',
        niveles: ['Básica', 'Media'],
      },
      {
        id:      'area_circulo',
        label:   'Área de círculo',
        niveles: ['Básica', 'Media'],
      },
    ],
  },
};

// ── Materias disponibles ───────────────────────────────────────────────────

export interface Materia {
  id:          string;
  label:       string;
  disponible:  boolean;
}

export const MATERIAS: Materia[] = [
  { id: 'matematicas', label: 'Matemáticas', disponible: true  },
  { id: 'quimica',     label: 'Química',     disponible: false },
  { id: 'biologia',    label: 'Biología',    disponible: false },
  { id: 'fisica',      label: 'Física',      disponible: false },
];