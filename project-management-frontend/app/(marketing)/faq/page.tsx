"use client"

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

const faqs = [
  { q: "Que es ProGest?", a: "ProGest es una plataforma SaaS de gestion de proyectos disenada para equipos de cualquier industria. Permite organizar tareas, equipos, plazos y generar reportes de forma simple." },
  { q: "Es realmente gratuito?", a: "Si, el plan MVP es completamente gratuito. Incluye 1 proyecto, hasta 10 miembros, tareas ilimitadas, board kanban, timeline, calendario y reportes basicos." },
  { q: "Que roles existen?", a: "Hay tres roles: Owner (crea y administra el proyecto), Employee (miembro que trabaja en tareas asignadas) y SuperAdmin (administra toda la plataforma)." },
  { q: "Cuantos proyectos puedo crear?", a: "En el plan gratuito (MVP), cada owner puede crear 1 proyecto con hasta 10 miembros. Los planes Pro y Enterprise permitiran proyectos multiples." },
  { q: "Como invito miembros a mi equipo?", a: "Desde la seccion 'Equipo' puedes enviar invitaciones por email. El invitado recibe un enlace para crear su cuenta y unirse a tu proyecto." },
  { q: "Es seguro?", a: "Si. ProGest implementa control de acceso por roles, autenticacion con tokens, auditoria completa de acciones y aislamiento multitenant." },
  { q: "Puedo exportar mis datos?", a: "Si, desde la seccion de Reportes puedes exportar tus tareas y metricas en formato CSV." },
  { q: "Funciona en movil?", a: "Si, la interfaz es completamente responsive y funciona en cualquier dispositivo con navegador moderno." },
  { q: "Habra integraciones con otras herramientas?", a: "En el plan Pro (proximamente) se incluiran integraciones con Slack, Google Calendar, y mas herramientas." },
  { q: "Como contacto a soporte?", a: "Puedes escribirnos desde la pagina de Contacto o enviar un email a soporte@progest.com (demo)." },
]

export default function FAQPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16">
      <div className="mb-12 text-center">
        <h1 className="mb-3 text-4xl font-bold text-balance">Preguntas Frecuentes</h1>
        <p className="text-muted-foreground">Respuestas a las dudas mas comunes sobre ProGest.</p>
      </div>
      <Accordion type="single" collapsible className="w-full">
        {faqs.map((f, i) => (
          <AccordionItem key={i} value={`item-${i}`}>
            <AccordionTrigger className="text-left">{f.q}</AccordionTrigger>
            <AccordionContent className="text-muted-foreground">{f.a}</AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  )
}
