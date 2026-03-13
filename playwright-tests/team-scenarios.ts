export type TeamTaskSpec = {
  title: string
  description: string
  priority: "Alta" | "Media" | "Baja"
  tags: string[]
  checklist: string[]
  assigneeIndex: number
  sprintIndex: number | null
  withStartDate: boolean
  duePreset: "Tomorrow" | "In 3 days" | "In a week" | "In 2 weeks"
  startPreset: "Today" | "Tomorrow"
}

export type TeamScenario = {
  id: "base" | "marketing" | "consultora" | "legal"
  label: string
  category: "Marketing" | "Tecnologia" | "Educacion" | "Salud" | "Finanzas" | "Operaciones" | "Consultoria" | "Otro"
  owner: { name: string }
  employees: { name: string }[]
  sprints: { name: string; offsetDays: number; color: "Azul" | "Turquesa" | "Esmeralda" | "Naranja" }[]
  project: { namePrefix: string; description: string }
  settings: { sprintLengthDays: number; tasksRetentionDays: number }
  tasks: TeamTaskSpec[]
}

export const TEAM_SCENARIOS: Record<TeamScenario["id"], TeamScenario> = {
  base: {
    id: "base",
    label: "Base",
    category: "Finanzas",
    owner: { name: "Maria Garcia" },
    employees: [
      { name: "Leonardo Ruiz" },
      { name: "María Fernanda López" },
      { name: "Carlos Méndez" },
      { name: "Ana Sofía Torres" },
      { name: "Jorge Ramírez" },
      { name: "Paola Hernández" },
      { name: "Ricardo Navarro" },
      { name: "Daniela Cruz" },
      { name: "Santiago Ortega" },
      { name: "Valeria Castillo" },
    ],
    sprints: [
      { name: "Sprint 1", offsetDays: 1, color: "Azul" },
      { name: "Sprint 2", offsetDays: 4, color: "Turquesa" },
      { name: "Sprint 3", offsetDays: 8, color: "Esmeralda" },
      { name: "Sprint 4", offsetDays: 12, color: "Naranja" },
    ],
    project: {
      namePrefix: "Proyecto Real",
      description: "Proyecto de prueba end-to-end con sprints, tareas y equipo",
    },
    settings: { sprintLengthDays: 14, tasksRetentionDays: 40 },
    tasks: Array.from({ length: 15 }).map((_, i) => {
      const action = ["Definir", "Diseñar", "Implementar", "Revisar", "Optimizar", "Validar", "Alinear", "Documentar"][i % 8]
      const deliverable = ["flujo", "reporte", "tablero", "métricas", "plantilla", "automatización", "checklist", "proceso"][i % 8]
      const context = ["operación", "finanzas", "equipo", "sprints", "tareas", "calidad", "calendarización", "reporteo"][i % 8]
      return {
        title: `Tarea ${i + 1}`,
        description: `${action} ${deliverable} para ${context}. Incluye criterios de aceptación y validación final.`,
      priority: i % 3 === 0 ? "Alta" : i % 3 === 1 ? "Media" : "Baja",
      tags: i % 2 === 0 ? ["backlog", "demo"] : ["flujo", "qa"],
      checklist: i % 3 === 0 ? ["Definir alcance", "Validar con equipo", "Cerrar pendiente"] : [],
      assigneeIndex: i % 10,
      sprintIndex: i % 5 === 0 ? null : i % 4,
      withStartDate: i % 2 === 0,
      duePreset: i % 4 === 0 ? "In 3 days" : i % 4 === 1 ? "In a week" : i % 4 === 2 ? "In 2 weeks" : "Tomorrow",
      startPreset: i % 3 === 0 ? "Today" : "Tomorrow",
      }
    }),
  },
  marketing: {
    id: "marketing",
    label: "Campaña de Marketing",
    category: "Marketing",
    owner: { name: "Andrea Salazar" },
    employees: [
      { name: "Sofía Méndez" },
      { name: "Bruno Álvarez" },
      { name: "Camila Ríos" },
      { name: "Diego Navarro" },
      { name: "Valentina Cruz" },
      { name: "Mateo Paredes" },
      { name: "Lucía Ortega" },
      { name: "Emilio Fuentes" },
      { name: "Renata Vargas" },
      { name: "Tomás Ibarra" },
    ],
    sprints: [
      { name: "Brief & Research", offsetDays: 1, color: "Azul" },
      { name: "Producción Creativa", offsetDays: 4, color: "Turquesa" },
      { name: "Lanzamiento", offsetDays: 8, color: "Esmeralda" },
      { name: "Optimización", offsetDays: 12, color: "Naranja" },
    ],
    project: {
      namePrefix: "Campaña Primavera",
      description: "Ejecución completa de campaña 360: creatividad, pauta, contenidos y medición.",
    },
    settings: { sprintLengthDays: 14, tasksRetentionDays: 60 },
    tasks: [
      {
        title: "Definir objetivo y KPIs",
        description: "Alinear objetivo de negocio, audiencia, KPIs y baseline de métricas.",
        priority: "Alta",
        tags: ["kpi", "brief", "prioridad-alta"],
        checklist: ["Objetivo SMART", "KPIs por canal", "Baseline", "Aprobación owner"],
        assigneeIndex: 0,
        sprintIndex: 0,
        withStartDate: true,
        duePreset: "In 3 days",
        startPreset: "Today",
      },
      {
        title: "Calendario editorial",
        description: "Armar calendario de contenidos para redes y blog.",
        priority: "Media",
        tags: ["contenido", "redes", "calendar"],
        checklist: ["Temas por semana", "Formato por canal", "Responsables", "Fechas"],
        assigneeIndex: 2,
        sprintIndex: 0,
        withStartDate: true,
        duePreset: "In a week",
        startPreset: "Tomorrow",
      },
      {
        title: "Set de creatividades (ads)",
        description: "Producir variantes de anuncios para testing A/B.",
        priority: "Alta",
        tags: ["ads", "creatividad", "ab-test"],
        checklist: ["3 copys", "3 artes", "UTMs", "Revisión legal"],
        assigneeIndex: 4,
        sprintIndex: 1,
        withStartDate: false,
        duePreset: "In 2 weeks",
        startPreset: "Tomorrow",
      },
      {
        title: "Landing de campaña",
        description: "Crear landing con formulario y tracking.",
        priority: "Alta",
        tags: ["landing", "tracking", "conversion"],
        checklist: ["Formulario", "Pixel/GA4", "Eventos", "QA"],
        assigneeIndex: 3,
        sprintIndex: 1,
        withStartDate: true,
        duePreset: "In 2 weeks",
        startPreset: "Tomorrow",
      },
      {
        title: "Configurar campañas en Meta",
        description: "Crear campaña, conjuntos, anuncios y audiencias.",
        priority: "Media",
        tags: ["meta", "paid", "setup"],
        checklist: ["Objetivo", "Audiencias", "Presupuesto", "UTMs"],
        assigneeIndex: 1,
        sprintIndex: 2,
        withStartDate: false,
        duePreset: "In a week",
        startPreset: "Tomorrow",
      },
      {
        title: "Reporte semanal",
        description: "Dashboard y reporte con aprendizajes y siguientes pasos.",
        priority: "Media",
        tags: ["reporte", "dashboard", "insights"],
        checklist: ["Gasto vs plan", "KPIs", "Insights", "Acciones"],
        assigneeIndex: 6,
        sprintIndex: 3,
        withStartDate: true,
        duePreset: "In a week",
        startPreset: "Tomorrow",
      },
      ...Array.from({ length: 9 }).map((_, i) => {
        const verb = ["Planear", "Producir", "Publicar", "Medir", "Optimizar", "Coordinar", "Revisar", "Iterar", "Ajustar"][i % 9]
        const item = ["copy", "creatividad", "segmentación", "UTMs", "landing", "anuncio", "email", "reporte", "calendario"][i % 9]
        const goal = ["conversión", "alcance", "CTR", "leads", "engagement", "awareness", "CPL", "retención", "tráfico"][i % 9]
        return {
          title: `Tarea Marketing ${i + 7} - ${item}`,
          description: `${verb} ${item} para mejorar ${goal}. Incluye validación, checklist y seguimiento.`,
        priority: i % 3 === 0 ? "Alta" : i % 3 === 1 ? "Media" : "Baja",
        tags: i % 2 === 0 ? ["marketing", "campaña"] : ["contenido", "operación"],
        checklist: i % 2 === 0 ? ["Preparar", "Ejecutar", "Medir"] : [],
        assigneeIndex: (i + 1) % 10,
        sprintIndex: i % 4,
        withStartDate: i % 2 === 0,
        duePreset: i % 4 === 0 ? "Tomorrow" : i % 4 === 1 ? "In 3 days" : i % 4 === 2 ? "In a week" : "In 2 weeks",
        startPreset: i % 3 === 0 ? "Today" : "Tomorrow",
        }
      }),
    ],
  },
  consultora: {
    id: "consultora",
    label: "Consultora",
    category: "Consultoria",
    owner: { name: "Javier Montero" },
    employees: [
      { name: "Paula Herrera" },
      { name: "Héctor Salinas" },
      { name: "Natalia Campos" },
      { name: "Iván Serrano" },
      { name: "Mariana Soto" },
      { name: "Oscar Quintana" },
      { name: "Daniela Vela" },
      { name: "Arturo Medina" },
      { name: "Fernanda Ureña" },
      { name: "Gonzalo Prieto" },
    ],
    sprints: [
      { name: "Diagnóstico", offsetDays: 1, color: "Azul" },
      { name: "Diseño de Solución", offsetDays: 4, color: "Turquesa" },
      { name: "Implementación", offsetDays: 8, color: "Esmeralda" },
      { name: "Cierre", offsetDays: 12, color: "Naranja" },
    ],
    project: {
      namePrefix: "Transformación Operativa",
      description: "Proyecto de consultoría para optimizar procesos y habilitar métricas de desempeño.",
    },
    settings: { sprintLengthDays: 15, tasksRetentionDays: 45 },
    tasks: Array.from({ length: 15 }).map((_, i) => {
      const doc = ["Diagnóstico", "Mapa de Proceso", "Workshop", "Business Case", "Roadmap", "Matriz RACI", "Dashboard KPI", "Plan de Implementación"][i % 8]
      const area = ["Operaciones", "Finanzas", "Compras", "Logística", "RRHH", "Ventas", "TI", "Atención"][i % 8]
      const focus = ["dolores", "riesgos", "oportunidades", "métricas", "costos", "tiempos", "calidad", "gobernanza"][i % 8]
      return {
        title: `Entregable ${i + 1} - ${doc}`,
        description: `${doc} para ${area}: análisis de ${focus}, evidencia, recomendaciones y próximos pasos acordados.`,
      priority: i % 4 === 0 ? "Alta" : i % 4 === 1 ? "Media" : "Baja",
      tags: i % 2 === 0 ? ["consultoria", "cliente"] : ["workshop", "operaciones"],
      checklist: i % 3 === 0 ? ["Reunión", "Documento", "Feedback"] : [],
      assigneeIndex: i % 10,
      sprintIndex: i % 5 === 0 ? null : i % 4,
      withStartDate: i % 2 === 1,
      duePreset: i % 4 === 0 ? "In 3 days" : i % 4 === 1 ? "In a week" : i % 4 === 2 ? "In 2 weeks" : "Tomorrow",
      startPreset: i % 3 === 0 ? "Today" : "Tomorrow",
      }
    }),
  },
  legal: {
    id: "legal",
    label: "Despacho Legal",
    category: "Otro",
    owner: { name: "Claudia Robles" },
    employees: [
      { name: "Alonso Cárdenas" },
      { name: "Beatriz Molina" },
      { name: "César Aguirre" },
      { name: "Diana Ledesma" },
      { name: "Esteban Rangel" },
      { name: "Fabiola Correa" },
      { name: "Gabriel Sanz" },
      { name: "Helena Duarte" },
      { name: "Ignacio Neri" },
      { name: "Julieta Téllez" },
    ],
    sprints: [
      { name: "Intake", offsetDays: 1, color: "Azul" },
      { name: "Investigación", offsetDays: 4, color: "Turquesa" },
      { name: "Redacción", offsetDays: 8, color: "Esmeralda" },
      { name: "Presentación", offsetDays: 12, color: "Naranja" },
    ],
    project: {
      namePrefix: "Caso Comercial",
      description: "Gestión de caso: intake, investigación, redacción y presentación de documentos.",
    },
    settings: { sprintLengthDays: 14, tasksRetentionDays: 90 },
    tasks: Array.from({ length: 15 }).map((_, i) => {
      const doc = ["Contrato", "Demanda", "Escrito", "Anexo", "Opinión Legal", "Carta", "Convenio", "Revisión"][i % 8]
      const step = ["intake", "investigación", "redacción", "validación", "presentación", "seguimiento", "firma", "archivo"][i % 8]
      const party = ["cliente", "contraparte", "autoridad", "notaría", "juzgado", "equipo interno", "stakeholders", "proveedor"][i % 8]
      return {
        title: `Actividad Legal ${i + 1} - ${doc}`,
        description: `${doc}: preparar y revisar para etapa de ${step}. Coordinación con ${party}, evidencias y control de versiones.`,
      priority: i % 3 === 0 ? "Alta" : i % 3 === 1 ? "Media" : "Baja",
      tags: i % 2 === 0 ? ["legal", "documento"] : ["cliente", "revisión"],
      checklist: i % 4 === 0 ? ["Revisar evidencia", "Redactar", "Validar", "Entregar"] : [],
      assigneeIndex: i % 10,
      sprintIndex: i % 6 === 0 ? null : i % 4,
      withStartDate: i % 2 === 0,
      duePreset: i % 4 === 0 ? "Tomorrow" : i % 4 === 1 ? "In 3 days" : i % 4 === 2 ? "In a week" : "In 2 weeks",
      startPreset: i % 3 === 0 ? "Today" : "Tomorrow",
      }
    }),
  },
}
