import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle2, X } from "lucide-react"
import Link from "next/link"

const plans = [
  {
    name: "Gratis (MVP)",
    price: "$0",
    desc: "Ideal para empezar",
    current: true,
    features: [
      { text: "1 proyecto por owner", included: true },
      { text: "Hasta 10 miembros", included: true },
      { text: "Tareas ilimitadas", included: true },
      { text: "Board Kanban", included: true },
      { text: "Timeline", included: true },
      { text: "Calendario", included: true },
      { text: "Reportes basicos", included: true },
      { text: "Exportacion CSV", included: true },
      { text: "Notificaciones in-app", included: true },
      { text: "Soporte por email", included: true },
      { text: "Integraciones externas", included: false },
      { text: "Proyectos multiples", included: false },
    ],
  },
  {
    name: "Pro",
    price: "$19/mes",
    desc: "Para equipos en crecimiento",
    current: false,
    features: [
      { text: "Proyectos ilimitados", included: true },
      { text: "Hasta 50 miembros", included: true },
      { text: "Tareas ilimitadas", included: true },
      { text: "Board Kanban", included: true },
      { text: "Timeline avanzado", included: true },
      { text: "Calendario", included: true },
      { text: "Reportes avanzados", included: true },
      { text: "Exportacion CSV + PDF", included: true },
      { text: "Notificaciones + email", included: true },
      { text: "Soporte prioritario", included: true },
      { text: "Integraciones (Slack, etc.)", included: true },
      { text: "API personalizada", included: false },
    ],
  },
  {
    name: "Enterprise",
    price: "Contacto",
    desc: "Para grandes organizaciones",
    current: false,
    features: [
      { text: "Todo en Pro", included: true },
      { text: "Miembros ilimitados", included: true },
      { text: "SSO / SAML", included: true },
      { text: "API personalizada", included: true },
      { text: "SLA garantizado", included: true },
      { text: "Manager dedicado", included: true },
      { text: "Despliegue on-premise", included: true },
      { text: "Auditoria avanzada", included: true },
      { text: "Soporte 24/7", included: true },
      { text: "Capacitacion incluida", included: true },
      { text: "Contratos anuales", included: true },
      { text: "Personalizacion completa", included: true },
    ],
  },
]

export default function PlansPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-16">
      <div className="mb-12 text-center">
        <h1 className="mb-3 text-4xl font-bold text-balance">Planes y Limites</h1>
        <p className="text-muted-foreground">Elige el plan que mejor se adapte a tu equipo. El MVP es completamente gratuito.</p>
      </div>
      <div className="grid gap-6 md:grid-cols-3">
        {plans.map((p) => (
          <Card key={p.name} className={p.current ? "border-primary shadow-lg" : ""}>
            <CardHeader className="text-center">
              {p.current && <span className="mb-2 inline-block rounded-full bg-primary px-3 py-0.5 text-xs font-medium text-primary-foreground">Plan Actual</span>}
              <CardTitle className="text-xl">{p.name}</CardTitle>
              <div className="text-3xl font-bold">{p.price}</div>
              <p className="text-sm text-muted-foreground">{p.desc}</p>
            </CardHeader>
            <CardContent>
              <ul className="flex flex-col gap-2">
                {p.features.map((f) => (
                  <li key={f.text} className="flex items-center gap-2 text-sm">
                    {f.included ? (
                      <CheckCircle2 className="h-4 w-4 shrink-0 text-primary" />
                    ) : (
                      <X className="h-4 w-4 shrink-0 text-muted-foreground/50" />
                    )}
                    <span className={f.included ? "" : "text-muted-foreground/50"}>{f.text}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-6">
                {p.current ? (
                  <Link href="/auth/register">
                    <Button className="w-full">Comenzar Gratis</Button>
                  </Link>
                ) : (
                  <Button variant="outline" className="w-full" disabled>Proximamente</Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
