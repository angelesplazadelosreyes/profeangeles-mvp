// data/profiles.ts
// Contenido de las secciones de perfil de la landing.
// Separado del componente para que editar textos no requiera
// tocar código de UI. En Fase 2 parte de esto puede venir de BD.

// Tipo para cada tarjeta de servicio dentro de un perfil
export interface ServiceCard {
  icon: string;       // emoji del servicio
  title: string;      // título de la tarjeta
  description: string; // descripción breve
  linkText: string;   // texto del link de acción
  linkHref: string;   // destino del link
  comingSoon?: boolean; // true si el servicio no está disponible aún
}

// Tipo para cada perfil de usuario
export interface Profile {
  id: string;         // identificador único — usado como id HTML para scroll
  icon: string;       // emoji del perfil
  label: string;      // nombre del perfil
  tag: string;        // etiqueta pequeña sobre el título
  title: string;      // título principal de la sección
  body: string;       // descripción del perfil
  ctaText: string;    // texto del botón principal
  ctaHref: string;    // destino del botón principal
  cards: ServiceCard[]; // tarjetas de servicios disponibles
}

export const profiles: Profile[] = [
  {
    id: "estudiante",
    icon: "🎒",
    label: "Estudiante",
    tag: "Para ti, estudiante",
    title: "Practica, aprende y llega preparado",
    body: "Genera ejercicios al instante para practicar antes de una prueba, descarga guías con lo que más necesitas repasar y agenda una clase cuando algo no queda claro. Sin juicios, a tu ritmo.",
    ctaText: "Empezar a practicar →",
    ctaHref: "/ejercicios",
    cards: [
      {
        icon: "⚡",
        title: "Generador de ejercicios",
        description: "Elige el tema, el subtema y el tipo. Ejercicios únicos con solución paso a paso al instante.",
        linkText: "Ir al generador →",
        linkHref: "/ejercicios",
      },
      {
        icon: "📄",
        title: "Guías PDF",
        description: "Selecciona las habilidades que quieres reforzar y descarga tu guía personalizada con solucionario.",
        linkText: "Ver guías →",
        linkHref: "/guias",
      },
      {
        icon: "🎓",
        title: "Clases individuales",
        description: "Sesión diagnóstica gratuita de 20 minutos. Online. Matemáticas, Ciencias y Python.",
        linkText: "Agendar clase →",
        linkHref: "https://wa.me/56971312255",
      },
      {
        icon: "🕹️",
        title: "Juegos",
        description: "Aprende tablas y operaciones básicas jugando.",
        linkText: "Prueba los juegos →",
        linkHref: "/juegos",
      },
    ],
  },
  {
    id: "profesor",
    icon: "🖊️",
    label: "Profesor/a",
    tag: "Para ti, profesor/a",
    title: "Herramientas para potenciar tus clases",
    body: "Desde talleres para tu colegio hasta guías listas para imprimir y herramientas tecnológicas que te ahorran horas de trabajo. Recursos pensados por alguien que también enseña.",
    ctaText: "Ver servicios →",
    ctaHref: "https://wa.me/56971312255",
    cards: [
      {
        icon: "🏫",
        title: "Talleres para colegios",
        description: "Talleres de Matemáticas, Ciencias o Python para tus estudiantes. Online.",
        linkText: "Ver detalle →",
        linkHref: "https://wa.me/56971312255",
      },
      {
        icon: "📄",
        title: "Guías PDF para clases",
        description: "Genera guías personalizadas con las habilidades que estás evaluando. Listas para imprimir con solucionario.",
        linkText: "Crear guía →",
        linkHref: "/guias",
      },
      {
        icon: "📊",
        title: "Automatización Excel",
        description: "Planillas, automatización de notas, informes. Ahorra tiempo en tareas administrativas repetitivas.",
        linkText: "Ver más →",
        linkHref: "https://wa.me/56971312255",
      },
      {
        icon: "💻",
        title: "Soluciones informáticas",
        description: "QA, talleres de capacitación, gestión de procesos y más.",
        linkText: "Ver más →",
        linkHref: "/informatica",
      },
    ],
  },
  {
    id: "apoderado",
    icon: "👨‍👩‍👧",
    label: "Apoderado/a",
    tag: "Para ti, apoderado/a",
    title: "Acompañamiento real para tu hijo/a",
    body: "No solo clases — un seguimiento honesto del avance. Empezamos con un diagnóstico gratuito para entender exactamente dónde está tu hijo/a y qué necesita para ponerse al día o avanzar.",
    ctaText: "Agendar diagnóstico gratis →",
    ctaHref: "https://wa.me/56971312255",
    cards: [
      {
        icon: "🔍",
        title: "Diagnóstico gratuito",
        description: "20 minutos sin costo para identificar exactamente qué necesita tu hijo/a. Sin compromiso.",
        linkText: "Agendar →",
        linkHref: "https://wa.me/56971312255",
      },
      {
        icon: "🎓",
        title: "Clases individuales",
        description: "Online con seguimiento personalizado y comunicación directa sobre el avance.",
        linkText: "Ver clases →",
        linkHref: "https://wa.me/56971312255",
      },
      {
        icon: "📦",
        title: "Packs mensuales",
        description: "Básico (4 clases), Refuerzo (8 clases) e Intensivo (12 clases). Descuentos hasta 13% en pack intensivo.",
        linkText: "Ver precios →",
        linkHref: "/clases",
      },
      {
        icon: "📄",
        title: "Guías para reforzar en casa",
        description: "Guías PDF para que tu hijo/a practique entre clases, con solucionario incluido.",
        linkText: "Ver guías →",
        linkHref: "/guias",
      },
    ],
  },
  {
    id: "profesional",
    icon: "💼",
    label: "Profesional / PYME",
    tag: "Para ti, profesional o PYME",
    title: "Tecnología y clases para crecer",
    body: "Clases de Python e informática. Automatización de procesos en Excel, desarrollo web y soluciones tecnológicas a medida para profesionales independientes y empresas pequeñas.",
    ctaText: "Ver servicios →",
    ctaHref: "https://wa.me/56971312255",
    cards: [
      {
        icon: "🐍",
        title: "Clases de Python",
        description: "Python e informática para profesionales. Desde cero hasta automatización de tareas.",
        linkText: "Agendar clase →",
        linkHref: "https://wa.me/56971312255",
      },
      {
        icon: "📊",
        title: "Automatización Excel",
        description: "Para inventario, reportes y procesos administrativos. Ahorra horas de trabajo manual.",
        linkText: "Ver más →",
        linkHref: "https://wa.me/56971312255",
      },
      {
        icon: "🌐",
        title: "Desarrollo web",
        description: "Sitios web para profesionales independientes y empresas pequeñas.",
        linkText: "Ver más →",
        linkHref: "/informatica",
      },
      {
        icon: "⚙️",
        title: "Soluciones informáticas",
        description: "QA, control de inventario, gestión de procesos, talleres de capacitación.",
        linkText: "Ver más →",
        linkHref: "/informatica",
      },
    ],
  },
];