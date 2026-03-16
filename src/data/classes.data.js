// src/data/classes.data.js

export const areasData = {
  escolar: {
    titulo: "Clases Escolares",
    descripcion: "Refuerzo y apoyo académico para estudiantes de educación básica y media. Clases adaptadas al currículo chileno vigente.",
    dirigidoA: "Estudiantes de 1° básico a 4° medio que necesiten refuerzo, nivelación o apoyo continuo en Matemáticas y Ciencias.",
    materias: ["Matemáticas", "Ciencias Naturales", "Física", "Química", "Biología"],
    temario: [], // Se completará próximamente
    precios: {
      unica: 14000,
      pack4: 13000,
      pack8: 12000,
      pack12: 11000,
    },
    faq: [
      {
        pregunta: "¿Cómo sé en qué nivel está mi hijo/a?",
        respuesta: "Con la sesión diagnóstica gratuita de 20 minutos evaluamos el nivel y definimos el plan de trabajo."
      },
      {
        pregunta: "¿Se pueden combinar materias en un pack?",
        respuesta: "Sí, los packs pueden incluir clases de distintas materias del área escolar."
      }
    ]
  },

  paes: {
    titulo: "Preparación PAES",
    descripcion: "Preparación intensiva y focalizada para la Prueba de Acceso a la Educación Superior. Énfasis en resolución de problemas y gestión del tiempo.",
    dirigidoA: "Estudiantes de 3° y 4° medio, y egresados que rendirán la PAES en el proceso actual o siguiente.",
    materias: ["PAES Competencia Matemática M1", "PAES Competencia Matemática M2", "PAES Ciencias"],
    temario: [], // Se completará próximamente
    precios: {
      unica: 16000,
      pack4: 15000,
      pack8: 14000,
      pack12: 13000,
    },
    faq: [
      {
        pregunta: "¿Cuánto antes de la PAES debo empezar?",
        respuesta: "Lo ideal es al menos 3 meses antes. Con el pack Intensivo (12 clases) se cubre el temario principal."
      },
      {
        pregunta: "¿Trabajamos con ensayos reales de la PAES?",
        respuesta: "Sí, se utilizan ensayos oficiales y ejercicios del estilo PAES en todas las clases."
      }
    ]
  },

  universitario: {
    titulo: "Nivel Universitario",
    descripcion: "Apoyo en ramos de ciencias e ingeniería para estudiantes universitarios. Foco en comprensión profunda y resolución de problemas complejos.",
    dirigidoA: "Estudiantes universitarios de carreras de ingeniería, ciencias o afines que necesiten refuerzo en ramos específicos.",
    materias: ["Cálculo I y II", "Álgebra Lineal", "Estadística", "Física General", "Química General"],
    temario: [], // Se completará próximamente
    precios: {
      unica: 20000,
      pack4: 18500,
      pack8: 17000,
      pack12: 15500,
    },
    faq: [
      {
        pregunta: "¿Puedo pedir clases sobre un ramo específico?",
        respuesta: "Sí, las clases se adaptan completamente al programa de tu universidad y ramo."
      },
      {
        pregunta: "¿Hay clases de apoyo para certámenes?",
        respuesta: "Sí, se pueden programar sesiones focalizadas previas a certámenes o exámenes."
      }
    ]
  },

  python: {
    titulo: "Fundamentos de Python",
    descripcion: "Aprende programación desde cero o avanza a niveles más complejos. Clases prácticas con proyectos reales adaptados a tu nivel.",
    dirigidoA: "Cualquier persona que quiera aprender a programar, desde principiantes absolutos hasta quienes buscan dominar conceptos intermedios/avanzados.",
    niveles: [
      {
        id: "nivel01",
        nombre: "Nivel 0–1: Introducción",
        descripcion: "Variables, tipos de datos, condicionales, ciclos, funciones básicas.",
        precios: { unica: 18000, pack4: 16500, pack8: 15000, pack12: 13500 }
      },
      {
        id: "nivel2",
        nombre: "Nivel 2: Intermedio",
        descripcion: "POO, manejo de archivos, módulos, excepciones, estructuras de datos.",
        precios: { unica: 20000, pack4: 18500, pack8: 17000, pack12: 15500 }
      },
      {
        id: "nivel3",
        nombre: "Nivel 3: Avanzado",
        descripcion: "Librerías científicas, automatización, APIs, proyectos integradores.",
        precios: { unica: 22000, pack4: 20500, pack8: 19000, pack12: 17500 }
      }
    ],
    temario: [], // Se completará próximamente
    faq: [
      {
        pregunta: "¿Necesito experiencia previa para el Nivel 0?",
        respuesta: "No. El Nivel 0 está diseñado para personas sin ningún conocimiento de programación."
      },
      {
        pregunta: "¿Qué herramientas se usan en clases?",
        respuesta: "Python 3, VS Code y Google Colab. Todo gratuito y con guía de instalación incluida."
      }
    ]
  }
};

export const recargos = {
  presencial: 5000 // CLP por clase, solo Curicó
};

export const referidos = {
  descuentoPorClase: 1000,
  beneficioReferidor: "Una clase gratis al completarse la primera clase paga del referido.",
  beneficioReferido: "Sesión diagnóstica gratuita de 20 min + $1.000 de descuento por clase en el primer pack."
};