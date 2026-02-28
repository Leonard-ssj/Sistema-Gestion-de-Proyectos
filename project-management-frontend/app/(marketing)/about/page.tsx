import { Card, CardContent } from "@/components/ui/card"
import { Target, Lightbulb, Heart } from "lucide-react"

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-16">
      <div className="mb-12 text-center">
        <h1 className="mb-3 text-4xl font-bold text-balance">Acerca de ProGest</h1>
        <p className="mx-auto max-w-2xl text-muted-foreground">
          Nacimos con una mision simple: hacer que la gestion de proyectos sea accesible para todos, sin importar la industria o el nivel tecnico de tu equipo.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardContent className="flex flex-col items-center gap-3 p-6 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Target className="h-6 w-6" />
            </div>
            <h3 className="font-semibold">Nuestra Mision</h3>
            <p className="text-sm text-muted-foreground">
              Democratizar la gestion de proyectos con herramientas intuitivas que equipos de marketing, operaciones, academia y finanzas puedan adoptar sin capacitacion especial.
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex flex-col items-center gap-3 p-6 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Lightbulb className="h-6 w-6" />
            </div>
            <h3 className="font-semibold">Nuestra Vision</h3>
            <p className="text-sm text-muted-foreground">
              Ser la plataforma de referencia para equipos no tecnicos que buscan organizarse de forma profesional y eficiente.
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex flex-col items-center gap-3 p-6 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Heart className="h-6 w-6" />
            </div>
            <h3 className="font-semibold">Nuestros Valores</h3>
            <p className="text-sm text-muted-foreground">
              Simplicidad, transparencia, seguridad y enfoque en el usuario. Cada decision de diseno pone al equipo en el centro.
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="mt-16 rounded-xl border bg-muted/30 p-8 text-center">
        <h2 className="mb-3 text-2xl font-bold">El Equipo</h2>
        <p className="mx-auto max-w-2xl text-muted-foreground">
          ProGest es desarrollado por un equipo apasionado de ingenieros, disenadores y profesionales de gestion de proyectos ubicados en Latinoamerica. Creemos que las mejores herramientas nacen de entender profundamente las necesidades reales de los equipos.
        </p>
      </div>
    </div>
  )
}
