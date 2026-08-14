import { Lead, Presupuesto, InformeEntrega, SurveyResponse } from '@/types/crm';

export const INITIAL_LEADS: Lead[] = [];

export const INITIAL_PRESUPUESTOS: Presupuesto[] = [
  {
    id: "ppto-215",
    correlativo: "215",
    clientName: "Jorge Barrientos",
    clientCompany: "Tu Café en La Serena",
    clientEmail: "diego@paginaspro.cl",
    clientPhone: "+56 9 6356 3801",
    date: "2026-07-22",
    validityDays: 15,
    items: [
      {
        id: "item-1",
        title: "Auditoría, Resguardo y Actualización de Plataforma WooCommerce",
        description: "1. Resguardo (Backup Integral).\n2. Corrección de errores y memoria PHP.\n3. Limpieza de catálogo y actualización WP/WooCommerce.",
        netAmount: 50000
      }
    ],
    appliesIva: true,
    notes: "Forma de Pago: 50% de anticipo para iniciar los trabajos y respaldos. 50% contra entrega de la plataforma actualizada y probada. Plazo: 24 a 48h hábiles. Garantía 90 días.",
    totalNet: 50000,
    ivaAmount: 9500,
    totalAmount: 59500,
    anticipo50: 29750,
    nicChileFee: 9990,
    status: "enviado"
  },
  {
    id: "ppto-216",
    correlativo: "216",
    clientName: "Nicolás Álvarez Grusic",
    clientCompany: "Base Norte Industrial",
    clientEmail: "diego@paginaspro.cl",
    clientPhone: "+56 9 2376 8452",
    date: "2026-07-22",
    validityDays: 15,
    items: [
      {
        id: "item-1",
        title: "Desarrollo Landing Page Corporativa y Configuración de Correos",
        description: "1. Desarrollo Web One Page Mobile-First.\n2. Configuración técnica, vinculación DNS y activación de correos corporativos en Google Workspace.",
        netAmount: 60000
      }
    ],
    appliesIva: true,
    notes: "Forma de Pago: 50% de anticipo para iniciar los trabajos. 50% contra entrega. Plazo: 2 a 4 días hábiles. Garantía 90 días.",
    totalNet: 60000,
    ivaAmount: 11400,
    totalAmount: 71400,
    anticipo50: 35700,
    nicChileFee: 9990,
    status: "enviado"
  },
  {
    id: "ppto-217-1",
    correlativo: "217-1",
    clientName: "José Luis Hurtado",
    clientCompany: "Rotary Club Distrito 4320",
    clientEmail: "diego@paginaspro.cl",
    clientPhone: "+56 9 8500 8020",
    date: "2026-07-23",
    validityDays: 15,
    items: [
      {
        id: "item-1",
        title: "Puesta a Punto, Seguridad y Correos Corporativos",
        description: "1. Actualización PHP a 8.1+, Elementor y limpieza DB.\n2. Alta de correo @rotary4320.cl con alias.",
        netAmount: 60000
      }
    ],
    appliesIva: true,
    notes: "Forma de Pago: 50% de anticipo para iniciar los trabajos. 50% contra entrega. Plazo: 2 a 3 días hábiles. Garantía 90 días.",
    totalNet: 60000,
    ivaAmount: 11400,
    totalAmount: 71400,
    anticipo50: 35700,
    nicChileFee: 9990,
    status: "enviado"
  },
  {
    id: "ppto-217-2",
    correlativo: "217-2",
    clientName: "José Luis Hurtado",
    clientCompany: "Rotary Club Distrito 4320",
    clientEmail: "diego@paginaspro.cl",
    clientPhone: "+56 9 8500 8020",
    date: "2026-07-23",
    validityDays: 15,
    items: [
      {
        id: "item-1",
        title: "Plan Webmaster Mensual (Gestión Continua)",
        description: "1. Carga de hasta 30 publicaciones al mes.\n2. Mantenimiento técnico, seguridad y soporte 24/7.",
        netAmount: 140000
      }
    ],
    appliesIva: true,
    notes: "Forma de Pago: Facturación los primeros 5 días de cada mes. Requiere suscripción a contrato de 6 o 12 meses.",
    totalNet: 140000,
    ivaAmount: 26600,
    totalAmount: 166600,
    anticipo50: 83300,
    nicChileFee: 9990,
    status: "enviado"
  },
  {
    id: "ppto-217-3",
    correlativo: "217-3",
    clientName: "José Luis Hurtado",
    clientCompany: "Rotary Club Distrito 4320",
    clientEmail: "diego@paginaspro.cl",
    clientPhone: "+56 9 8500 8020",
    date: "2026-07-23",
    validityDays: 15,
    items: [
      {
        id: "item-1",
        title: "Bolsa de Publicaciones a Pedido (Sin Costo Fijo)",
        description: "Carga de contenidos por lote: hasta 30 publicaciones procesadas sin mantenimientos técnicos posteriores.",
        netAmount: 70000
      }
    ],
    appliesIva: true,
    notes: "Forma de Pago: 100% al momento de enviar el material para publicar. Plazo de carga: máximo 48h hábiles.",
    totalNet: 70000,
    ivaAmount: 13300,
    totalAmount: 83300,
    anticipo50: 41650,
    nicChileFee: 9990,
    status: "enviado"
  },
  {
    id: "ppto-218",
    correlativo: "218",
    clientName: "Macarena Herrera",
    clientCompany: "Inversiones Rebus SpA (AndeInfra)",
    clientEmail: "diego@paginaspro.cl",
    clientPhone: "+56 9 8640 7802",
    date: "2026-07-28",
    validityDays: 15,
    items: [
      {
        id: "item-1",
        title: "Desarrollo Landing Page Corporativa y Correo Institucional",
        description: "Landing page mobile-first para obras civiles y correo corporativo enlazado a Gmail.",
        netAmount: 60000
      },
      {
        id: "item-2",
        title: "Inscripción Dominio .cl (NIC Chile - 1 Año)",
        description: "Registro oficial de dominio andeinfra.cl.",
        netAmount: 9990
      }
    ],
    appliesIva: true,
    notes: "Forma de Pago: 50% de anticipo para iniciar los trabajos. 50% contra entrega + arancel dominio NIC Chile ($9.990). Plazo: 2 a 3 días. Garantía 90 días.",
    totalNet: 60000,
    ivaAmount: 11400,
    totalAmount: 81390,
    anticipo50: 40695,
    nicChileFee: 9990,
    status: "enviado"
  },
  {
    id: "ppto-219",
    correlativo: "219",
    clientName: "Nicolás Álvarez Grusic",
    clientCompany: "Base Norte Industrial",
    clientEmail: "diego@paginaspro.cl",
    clientPhone: "+56 9 2376 8452",
    date: "2026-07-29",
    validityDays: 15,
    items: [
      {
        id: "item-1",
        title: "Actualización de Sección Socios y Optimización Fotográfica",
        description: "Redacción de reseña de socio, retoque fotográfico y despliegue en Cloudflare Pages.",
        netAmount: 16000
      }
    ],
    appliesIva: true,
    notes: "Forma de Pago: 100% contra entrega y conformidad. Tarifa preferencial cliente. Plazo: 24h hábiles. Garantía 90 días.",
    totalNet: 16000,
    ivaAmount: 3040,
    totalAmount: 19040,
    anticipo50: 9520,
    nicChileFee: 9990,
    status: "enviado"
  },
  {
    id: "ppto-220-1",
    correlativo: "220-1",
    clientName: "Paola García",
    clientCompany: "Corredora Propiedades",
    clientEmail: "diego@paginaspro.cl",
    clientPhone: "+56 9 6447 1921",
    date: "2026-07-30",
    validityDays: 15,
    items: [
      {
        id: "item-1",
        title: "Desarrollo de Portal Inmobiliario Básico (Hasta 10 Propiedades)",
        description: "1. Portal Inmobiliario Mobile-First con WhatsApp por propiedad.\n2. Configuración técnica, dominio y correos.",
        netAmount: 100000
      }
    ],
    appliesIva: true,
    notes: "Forma de Pago: 50% de anticipo + costo arancel dominio NIC Chile (ref. $9.990). 50% contra entrega. Plazo: 3 a 5 días hábiles. Garantía 90 días.",
    totalNet: 100000,
    ivaAmount: 19000,
    totalAmount: 119000,
    anticipo50: 59500,
    nicChileFee: 9990,
    status: "enviado"
  },
  {
    id: "ppto-220-2",
    correlativo: "220-2",
    clientName: "Paola García",
    clientCompany: "Corredora Propiedades",
    clientEmail: "diego@paginaspro.cl",
    clientPhone: "+56 9 6447 1921",
    date: "2026-07-30",
    validityDays: 15,
    items: [
      {
        id: "item-1",
        title: "Desarrollo de Portal Inmobiliario de Alto Rendimiento (Hasta 50 Propiedades)",
        description: "1. Catálogo 50 inmuebles con filtros y CDN para 500 fotos y 50 videos.\n2. Configuración técnica, dominio y correos.",
        netAmount: 280000
      }
    ],
    appliesIva: true,
    notes: "Forma de Pago: 50% de anticipo + costo arancel dominio NIC Chile (ref. $9.990). 50% contra entrega. Plazo: 5 a 7 días hábiles. Garantía 90 días.",
    totalNet: 280000,
    ivaAmount: 53200,
    totalAmount: 333200,
    anticipo50: 166600,
    nicChileFee: 9990,
    status: "enviado"
  },
  {
    id: "ppto-220-3",
    correlativo: "220-3",
    clientName: "Paola García",
    clientCompany: "Corredora Propiedades",
    clientEmail: "diego@paginaspro.cl",
    clientPhone: "+56 9 6447 1921",
    date: "2026-07-30",
    validityDays: 15,
    items: [
      {
        id: "item-1",
        title: "Módulo de Administración Vía Aplicación Móvil (iOS, Android y Web)",
        description: "1. App móvil autogestionable para administrar propiedades en vivo.\n2. Sesión de capacitación personalizada 1 a 1.",
        netAmount: 50000
      }
    ],
    appliesIva: true,
    notes: "Forma de Pago: 50% de anticipo para iniciar trabajos. 50% contra entrega de la aplicación probada. Plazo: 3 a 7 días hábiles. Garantía 90 días.",
    totalNet: 50000,
    ivaAmount: 9500,
    totalAmount: 59500,
    anticipo50: 29750,
    nicChileFee: 9990,
    status: "enviado"
  },
  {
    id: "ppto-221",
    correlativo: "221",
    clientName: "José Luis Hurtado",
    clientCompany: "Rotary Club Distrito 4320",
    clientEmail: "diego@paginaspro.cl",
    clientPhone: "+56 9 8500 8020",
    date: "2026-07-30",
    validityDays: 15,
    items: [
      {
        id: "item-1",
        title: "Rediseño Web Next.js, Rescate de Contenidos y Asesoría de Dominio",
        description: "1. Rescate integral de contenidos WP y rediseño completo en Next.js ($0/mes hosting).\n2. Asesoría de dominio y correos institucionales.",
        netAmount: 240000
      }
    ],
    appliesIva: true,
    notes: "Forma de Pago: 50% de anticipo para iniciar trabajos. 50% contra entrega de la plataforma publicada. Plazo: 7 a 10 días hábiles. Garantía 90 días.",
    totalNet: 240000,
    ivaAmount: 45600,
    totalAmount: 285600,
    anticipo50: 142800,
    nicChileFee: 9990,
    status: "enviado"
  },
  {
    id: "ppto-222-1",
    correlativo: "222-1",
    clientName: "Paola Zavala",
    clientCompany: "Altavita Salud Integrativa",
    clientEmail: "diego@paginaspro.cl",
    clientPhone: "+56 9 9538 1165",
    date: "2026-08-03",
    validityDays: 15,
    items: [
      {
        id: "item-1",
        title: "Desarrollo Web Centro Médico, Integración Consultorio.me y Tienda Express",
        description: "1. Presencia institucional y catálogo de especialidades.\n2. Integración agenda Consultorio.me.\n3. Tienda Express MercadoPago.\n4. Dominio y correos.",
        netAmount: 120000
      }
    ],
    appliesIva: true,
    notes: "Forma de Pago: 50% de anticipo para iniciar trabajos. Saldo 50% contra entrega y conformidad. Plazo: 3 a 5 días hábiles. Garantía 90 días.",
    totalNet: 120000,
    ivaAmount: 22800,
    totalAmount: 142800,
    anticipo50: 71400,
    nicChileFee: 9990,
    status: "enviado"
  },
  {
    id: "ppto-222-2",
    correlativo: "222-2",
    clientName: "Paola Zavala",
    clientCompany: "Altavita Salud Integrativa",
    clientEmail: "diego@paginaspro.cl",
    clientPhone: "+56 9 9538 1165",
    date: "2026-08-03",
    validityDays: 15,
    items: [
      {
        id: "item-1",
        title: "Desarrollo Web Centro Médico, Integración Consultorio.me y Tienda Pro con App",
        description: "1. Presencia institucional y Consultorio.me.\n2. Tienda Pro MercadoPago.\n3. App Móvil de gestión + Capacitación.\n4. Dominio y correos.",
        netAmount: 160000
      }
    ],
    appliesIva: true,
    notes: "Forma de Pago: 50% de anticipo para iniciar trabajos. Saldo 50% contra entrega y conformidad. Plazo: 3 a 5 días hábiles. Garantía 90 días.",
    totalNet: 160000,
    ivaAmount: 30400,
    totalAmount: 190400,
    anticipo50: 95200,
    nicChileFee: 9990,
    status: "enviado"
  },
  {
    id: "ppto-223",
    correlativo: "223",
    clientName: "Pali Rucci",
    clientCompany: "Pali Rucci",
    clientEmail: "diego@paginaspro.cl",
    clientPhone: "+56 9 8369 8558",
    date: "2026-08-11",
    validityDays: 15,
    items: [
      {
        id: "item-1",
        title: "Desarrollo Web Personal de Presentación e Integración de Agenda Digital",
        description: "1. Landing page marca personal en Cloudflare Pages.\n2. Agenda digital (Cal.com) e integración Google Calendar.\n3. Dominio y correos.",
        netAmount: 70000
      }
    ],
    appliesIva: true,
    notes: "Forma de Pago: 50% de anticipo + costo arancel dominio NIC Chile (ref. $9.990). 50% contra entrega. Plazo: 3 a 5 días hábiles. Garantía 90 días.",
    totalNet: 70000,
    ivaAmount: 13300,
    totalAmount: 83300,
    anticipo50: 41650,
    nicChileFee: 9990,
    status: "enviado"
  },
  {
    id: "ppto-224",
    correlativo: "224",
    clientName: "Pali Rucci",
    clientCompany: "Pali Rucci",
    clientEmail: "diego@paginaspro.cl",
    clientPhone: "+56 9 8369 8558",
    date: "2026-08-12",
    validityDays: 15,
    items: [
      {
        id: "item-1",
        title: "Gestión Mensual, Estrategia y Optimización de Meta Ads (Instagram / Facebook)",
        description: "1. Estrategia y definición de audiencias.\n2. Configuración y administración de campañas Meta Ads.\n3. Asesoría de contenido e informe de prospectos.",
        netAmount: 40000
      }
    ],
    appliesIva: true,
    notes: "Forma de Pago: 100% anticipado al inicio de cada ciclo mensual de gestión. Renovación mensual sin contrato de compromiso o permanencia forzada.",
    totalNet: 40000,
    ivaAmount: 7600,
    totalAmount: 47600,
    anticipo50: 23800,
    nicChileFee: 9990,
    status: "enviado"
  },
  {
    id: "ppto-225",
    correlativo: "225",
    clientName: "Christian Manukian",
    clientCompany: "C.M.H Motors La Serena",
    clientEmail: "diego@paginaspro.cl",
    clientPhone: "+56 9 8681 9172",
    date: "2026-08-13",
    validityDays: 15,
    items: [
      {
        id: "item-1",
        title: "Portal web que actúa como vitrina digital profesional para exponer el stock de vehículos disponibles las 24 horas del día.",
        description: "Vitrina digital profesional mobile-first con ficha técnica, galería HD, video recorrido y botón directo a WhatsApp. $0/mes hosting + correo.",
        netAmount: 100000
      }
    ],
    appliesIva: true,
    notes: "Forma de Pago: 50% de anticipo + costo arancel dominio NIC Chile. Saldo 50% contra entrega conforme y plataforma digital probada. Plazo: 3 a 5 días hábiles. Garantía 90 días.",
    totalNet: 100000,
    ivaAmount: 19000,
    totalAmount: 119000,
    anticipo50: 59500,
    nicChileFee: 9990,
    status: "enviado"
  },
  {
    id: "ppto-226",
    correlativo: "226",
    clientName: "Christian Manukian",
    clientCompany: "C.M.H Motors La Serena",
    clientEmail: "diego@paginaspro.cl",
    clientPhone: "+56 9 8681 9172",
    date: "2026-08-13",
    validityDays: 15,
    items: [
      {
        id: "item-1",
        title: "Producción audiovisual de creación de contenido de alto impacto visual para posicionar el inventario en redes sociales.",
        description: "1 jornada mensual de rodaje/fotos en terreno (Balmaceda), edición de Reels/TikToks dinámicos 4K, plantillas carruseles y gestión de redes.",
        netAmount: 250000
      }
    ],
    appliesIva: true,
    notes: "Forma de Pago: 100% anticipado al inicio de cada mes de trabajo. Renovación mensual sin contrato de compromiso o permanencia forzada.",
    totalNet: 250000,
    ivaAmount: 47500,
    totalAmount: 297500,
    anticipo50: 148750,
    nicChileFee: 9990,
    status: "enviado"
  },
  {
    id: "ppto-227",
    correlativo: "227",
    clientName: "Christian Manukian",
    clientCompany: "C.M.H Motors La Serena",
    clientEmail: "diego@paginaspro.cl",
    clientPhone: "+56 9 8681 9172",
    date: "2026-08-13",
    validityDays: 15,
    items: [
      {
        id: "item-1",
        title: "Estrategia Integral Digital: Gestión de Portal Web, Producción Audiovisual de Alta Gama y Administración de Meta Ads.",
        description: "Solución 360° con producción audiovisual (PPTO 226) + publicidad Meta Ads + mantención web al día + comisión por venta ($50.000/auto).",
        netAmount: 300000
      }
    ],
    appliesIva: true,
    notes: "Forma de Pago: 100% anticipado al inicio de cada mes de trabajo. Comisión por Éxito Comercial: $50.000 CLP neto por vehículo vendido. Renovación mensual.",
    totalNet: 300000,
    ivaAmount: 57000,
    totalAmount: 357000,
    anticipo50: 178500,
    nicChileFee: 9990,
    status: "enviado"
  }
];

export const INITIAL_INFORMES: InformeEntrega[] = [];

export const INITIAL_SURVEYS: SurveyResponse[] = [];
