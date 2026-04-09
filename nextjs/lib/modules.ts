// nextjs/lib/modules.ts
/**
 * Árbol completo de materias, temas, subtemas y niveles.
 * disponible: true  → módulo implementado en el backend
 * disponible: false → próximamente (se muestra deshabilitado en UI)
 */

export interface Modulo {
  key: string        // coincide con la clave en el registry de Flask
  label: string      // texto para mostrar en UI
  nivel: string      // "basica" | "media" | "universitario"
  disponible: boolean
  skills: { id: string; label: string }[]
}

export interface Subtema {
  id: string
  label: string
  modulos: Modulo[]
}

export interface Tema {
  id: string
  label: string
  subtemas: Subtema[]
}

export interface Materia {
  id: string
  label: string
  temas: Tema[]
}

export const MATERIAS: Materia[] = [
  {
    id: 'matematicas',
    label: 'Matemáticas',
    temas: [
      {
        id: 'aritmetica',
        label: 'Aritmética',
        subtemas: [
          {
            id: 'mcm',
            label: 'Mínimo Común Múltiplo',
            modulos: [
              {
                key: 'lcm_basica',
                label: 'MCM — Básica',
                nivel: 'basica',
                disponible: true,
                skills: [
                  { id: 'escalera', label: 'Tabla escalera' },
                  { id: 'mcm',      label: 'Resultado MCM' },
                ],
              },
              {
                key: 'lcm_media',
                label: 'MCM — Media',
                nivel: 'media',
                disponible: false,
                skills: [
                  { id: 'escalera',        label: 'Tabla escalera' },
                  { id: 'factores_primos', label: 'Factores primos' },
                  { id: 'mcm',             label: 'Resultado MCM' },
                ],
              },
            ],
          },
          {
            id: 'mcd',
            label: 'Máximo Común Divisor',
            modulos: [
              {
                key: 'gcd_basica',
                label: 'MCD — Básica',
                nivel: 'basica',
                disponible: false,
                skills: [
                  { id: 'escalera', label: 'Tabla escalera' },
                  { id: 'mcd',      label: 'Resultado MCD' },
                ],
              },
            ],
          },
        ],
      },
      {
        id: 'algebra',
        label: 'Álgebra',
        subtemas: [
          {
            id: 'funcion_cuadratica',
            label: 'Función cuadrática',
            modulos: [
              {
                key: 'quadratic_media',
                label: 'Función cuadrática — Media',
                nivel: 'media',
                disponible: true,
                skills: [
                  { id: 'concavity',       label: 'Concavidad' },
                  { id: 'discriminant',    label: 'Discriminante' },
                  { id: 'roots',           label: 'Raíces' },
                  { id: 'axis',            label: 'Eje de simetría' },
                  { id: 'vertex',          label: 'Vértice' },
                  { id: 'y_intercept',     label: 'Intersección eje Y' },
                  { id: 'domain',          label: 'Dominio' },
                  { id: 'range',           label: 'Recorrido' },
                  { id: 'canonical_form',  label: 'Forma canónica' },
                  { id: 'factorized_form', label: 'Forma factorizada' },
                  { id: 'graph',           label: 'Gráfico' },
                  { id: 'inverse',         label: 'Función inversa' },
                ],
              },
              {
                key: 'quadratic_universitario',
                label: 'Función cuadrática — Universitario',
                nivel: 'universitario',
                disponible: false,
                skills: [
                  { id: 'concavity',       label: 'Concavidad' },
                  { id: 'discriminant',    label: 'Discriminante' },
                  { id: 'roots',           label: 'Raíces' },
                  { id: 'vertex',          label: 'Vértice' },
                  { id: 'domain',          label: 'Dominio' },
                  { id: 'range',           label: 'Recorrido' },
                  { id: 'canonical_form',  label: 'Forma canónica' },
                  { id: 'factorized_form', label: 'Forma factorizada' },
                  { id: 'graph',           label: 'Gráfico' },
                  { id: 'inverse',         label: 'Función inversa' },
                ],
              },
            ],
          },
          {
            id: 'ecuaciones_lineales',
            label: 'Ecuaciones lineales',
            modulos: [
              {
                key: 'linear_media',
                label: 'Ecuaciones lineales — Media',
                nivel: 'media',
                disponible: false,
                skills: [
                  { id: 'despejar',  label: 'Despejar incógnita' },
                  { id: 'verificar', label: 'Verificación' },
                ],
              },
            ],
          },
        ],
      },
      {
        id: 'geometria',
        label: 'Geometría',
        subtemas: [
          {
            id: 'areas',
            label: 'Áreas y perímetros',
            modulos: [
              {
                key: 'geometry_media',
                label: 'Áreas — Media',
                nivel: 'media',
                disponible: false,
                skills: [
                  { id: 'area',      label: 'Área' },
                  { id: 'perimetro', label: 'Perímetro' },
                ],
              },
            ],
          },
        ],
      },
      {
        id: 'estadistica',
        label: 'Estadística',
        subtemas: [
          {
            id: 'medidas_tendencia',
            label: 'Medidas de tendencia central',
            modulos: [
              {
                key: 'stats_media',
                label: 'Estadística — Media',
                nivel: 'media',
                disponible: false,
                skills: [
                  { id: 'media',   label: 'Media' },
                  { id: 'mediana', label: 'Mediana' },
                  { id: 'moda',    label: 'Moda' },
                ],
              },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'fisica',
    label: 'Física',
    temas: [
      {
        id: 'cinematica',
        label: 'Cinemática',
        subtemas: [
          {
            id: 'mrua',
            label: 'Movimiento uniformemente acelerado',
            modulos: [
              {
                key: 'mrua_media',
                label: 'MRUA — Media',
                nivel: 'media',
                disponible: false,
                skills: [
                  { id: 'velocidad',     label: 'Velocidad' },
                  { id: 'aceleracion',   label: 'Aceleración' },
                  { id: 'desplazamiento', label: 'Desplazamiento' },
                ],
              },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'quimica',
    label: 'Química',
    temas: [
      {
        id: 'estequiometria',
        label: 'Estequiometría',
        subtemas: [
          {
            id: 'balanceo',
            label: 'Balanceo de ecuaciones',
            modulos: [
              {
                key: 'balanceo_media',
                label: 'Balanceo — Media',
                nivel: 'media',
                disponible: false,
                skills: [
                  { id: 'balanceo', label: 'Ecuación balanceada' },
                  { id: 'moles',    label: 'Cálculo de moles' },
                ],
              },
            ],
          },
        ],
      },
    ],
  },
]