// nextjs/data/clases.ts

// ── Tipos ──────────────────────────────────────────────────────────────────

export interface PreciosArea {
  unica:  number;
  pack4:  number;
  pack8:  number;
  pack12: number;
}

export interface FaqItem {
  pregunta:  string;
  respuesta: string;
}

export interface NivelPython {
  id:          string;
  nombre:      string;
  descripcion: string;
  precios:     PreciosArea;
}

export interface AreaData {
  titulo:      string;
  descripcion: string;
  dirigidoA:   string;
  materias?:   string[];
  precios?:    PreciosArea;
  niveles?:    NivelPython[];
  faq:         FaqItem[];
}

export type AreaId = 'escolar' | 'paes' | 'universitario' | 'python';

// ── Recargos y referidos ───────────────────────────────────────────────────

export const RECARGO_PRESENCIAL = 5000;

export const REFERIDOS = {
  beneficioReferidor: 'Una clase gratis al completarse la primera clase paga del referido.',
  beneficioReferido:  'Sesion diagnostica gratuita de 20 min + $1.000 de descuento por clase en el primer pack.',
};

// ── Datos por area ─────────────────────────────────────────────────────────

export const AREAS: Record<AreaId, AreaData> = {
  escolar: {
    titulo:      'Clases Escolares',
    descripcion: 'Refuerzo y apoyo académico para estudiantes de educación básica y media. Clases adaptadas al currículo chileno vigente.',
    dirigidoA:   'Estudiantes de 1° básico a 4° medio que necesiten refuerzo, nivelación o apoyo continuo en Matemáticas y Ciencias.',
    materias:    ['Matemáticas', 'Ciencias Naturales', 'Física', 'Química', 'Biología'],
    precios:     { unica: 14000, pack4: 13000, pack8: 12000, pack12: 11000 },
    faq: [
      {
        pregunta:  '¿Cómo sé en qué nivel está mi hijo/a?',
        respuesta: 'Con la sesión diagnóstica gratuita de 20 minutos evaluamos el nivel y definimos el plan de trabajo.',
      },
      {
        pregunta:  '¿Se pueden combinar materias en un pack?',
        respuesta: 'Sí, los packs pueden incluir clases de distintas materias del área escolar.',
      },
    ],
  },

  paes: {
    titulo:      'Preparación PAES',
    descripcion: 'Preparación intensiva y focalizada para la Prueba de Acceso a la Educación Superior. Énfasis en resolución de problemas y gestión del tiempo.',
    dirigidoA:   'Estudiantes de 3° y 4° medio, y egresados que rendirán la PAES en el proceso actual o siguiente.',
    materias:    ['PAES Competencia Matemática M1', 'PAES Competencia Matemática M2', 'PAES Ciencias'],
    precios:     { unica: 16000, pack4: 15000, pack8: 14000, pack12: 13000 },
    faq: [
      {
        pregunta:  '¿Cuánto antes de la PAES debo empezar?',
        respuesta: 'Eso depende de cuales son tus metas y tu nivel actual, pero se recomienda comenzar al menos 6 meses antes para un trabajo integral.',
      },
      {
        pregunta:  '¿Trabajamos con ensayos reales de la PAES?',
        respuesta: 'Sí, se utilizan ensayos oficiales y ejercicios del estilo PAES en todas las clases.',
      },
    ],
  },

  universitario: {
    titulo:      'Nivel Universitario',
    descripcion: 'Apoyo en ramos de ciencias e ingeniería para estudiantes universitarios. Foco en comprensión profunda y resolución de problemas complejos.',
    dirigidoA:   'Estudiantes universitarios de carreras de ingeniería, ciencias o afines que necesiten refuerzo en ramos específicos.',
    materias:    ['Química General', 'Química Orgánica', 'Biología', 'Fisiología', 'Matemáticas'],
    precios:     { unica: 20000, pack4: 18500, pack8: 17000, pack12: 15500 },
    faq: [
      {
        pregunta:  '¿Puedo pedir clases sobre un ramo específico?',
        respuesta: 'Sí, las clases se adaptan completamente al programa de tu universidad y ramo.',
      },
      {
        pregunta:  '¿Hay clases de apoyo para certámenes?',
        respuesta: 'Sí, se pueden programar sesiones focalizadas previas a certámenes o exámenes.',
      },
    ],
  },

  python: {
    titulo:      'Fundamentos de Python',
    descripcion: 'Aprende programación desde cero o avanza a niveles más complejos. Clases prácticas con proyectos reales adaptados a tu nivel.',
    dirigidoA:   'Cualquier persona que quiera aprender a programar, desde principiantes absolutos hasta quienes buscan dominar conceptos intermedios y avanzados.',
    niveles: [
      {
        id:          'nivel01',
        nombre:      'Nivel 0-1: Introducción',
        descripcion: 'Variables, tipos de datos, condicionales, ciclos, funciones básicas.',
        precios:     { unica: 18000, pack4: 16500, pack8: 15000, pack12: 13500 },
      },
      {
        id:          'nivel2',
        nombre:      'Nivel 2: Intermedio',
        descripcion: 'POO, manejo de archivos, módulos, excepciones, estructuras de datos.',
        precios:     { unica: 20000, pack4: 18500, pack8: 17000, pack12: 15500 },
      },
      {
        id:          'nivel3',
        nombre:      'Nivel 3: Avanzado',
        descripcion: 'Librerías científicas, automatización, APIs, proyectos integradores.',
        precios:     { unica: 22000, pack4: 20500, pack8: 19000, pack12: 17500 },
      },
    ],
    faq: [
      {
        pregunta:  '¿Necesito experiencia previa para el Nivel 0?',
        respuesta: 'No. El Nivel 0 está diseñado para personas sin ningún conocimiento de programación.',
      },
      {
        pregunta:  '¿Qué herramientas se usan en clases?',
        respuesta: 'Python 3, VS Code y Google Colab. Todo gratuito y con guía de instalación incluida.',
      },
    ],
  },
};

// ── Testimonios ────────────────────────────────────────────────────────────

export interface Testimonio {
  nombre:  string;
  rol:     string;
  texto:   string;
  inicial: string;
  color:   string;
}

export const TESTIMONIOS: Testimonio[] = [
  {
    nombre:  'Javier M.',
    rol:     'Estudiante de Nutricion y Dietetica, Santiago',
    inicial: 'J',
    color:   '#1D9E75',
    texto:   'Pasaba por muchas dificultades para estudiar, y con la ayuda de la profesora Angi logre avanzar en muchas materias como matematicas, quimica, fisica y biologia, profesora muy paciente que explica a detalle todo.',
  },
  {
    nombre:  'Mia S.',
    rol:     'Estudiante de 3 Medio, Santiago',
    inicial: 'M',
    color:   '#FF69B4',
    texto:   'Estoy con la profesora desde octavo basico y actualmente estoy en tercero medio. A lo largo de estos anos me ha ayudado muchisimo en mis anos escolares. Es muy atenta y paciente, y gracias a su apoyo he logrado subir varias de mis notas en Matematica y Quimica.',
  },
];

// ── FAQ general ────────────────────────────────────────────────────────────

export const FAQ_GENERAL: FaqItem[] = [
  {
    pregunta:  '¿Cuánto dura cada clase?',
    respuesta: '45 minutos, equivalente a una hora pedagógica estándar en Chile.',
  },
  {
    pregunta:  '¿Las clases son online?',
    respuesta: 'Sí, todas las clases se realizan por Google Meet. Solo necesitas conexión a internet y un dispositivo con pantalla.',
  },
  {
    pregunta:  '¿Cómo se realizan las clases online?',
    respuesta: '100% por Google Meet. Al confirmar tu clase recibes el link directamente por WhatsApp.',
  },
  {
    pregunta:  '¿Qué incluye la clase diagnóstica gratuita?',
    respuesta: 'Una sesión de 20 minutos donde evaluamos tu nivel, identificamos tus dificultades y recomendamos el plan ideal. Sin costo ni compromiso.',
  },
  {
    pregunta:  '¿Me envían material después de la clase?',
    respuesta: 'Sí. Al terminar cada clase te enviamos la presentación PPT por WhatsApp. La grabación está disponible si la solicitas con anticipación.',
  },
  {
    pregunta:  '¿Puedo hacer preguntas entre clases?',
    respuesta: 'Sí. Consultas puntuales por WhatsApp disponibles para todos los estudiantes.',
  },
  {
    pregunta:  '¿Cómo se paga?',
    respuesta: 'Por transferencia bancaria al confirmar la clase. Los datos se entregan por WhatsApp al agendar.',
  },
  {
    pregunta:  '¿Puedo cambiar o cancelar el horario?',
    respuesta: 'Sí, podemos reagendar sin costo, solo necesitas avisar con al menos 24 horas de anticipación y ver los horarios disponibles.',
  },
];