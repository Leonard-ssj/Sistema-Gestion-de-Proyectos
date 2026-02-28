import { Card, CardContent } from "@/components/ui/card"
import { Shield, Lock, Eye, Server, FileCheck, Users } from "lucide-react"

const items = [
  { icon: Shield, title: "Control de Acceso por Roles", desc: "Tres niveles de acceso: Owner, Employee y SuperAdmin. Cada rol ve solo lo que le corresponde." },
  { icon: Lock, title: "Autenticacion Segura", desc: "Contrasenas hasheadas con bcrypt, sesiones con tokens JWT y proteccion contra ataques de fuerza bruta." },
  { icon: Eye, title: "Auditoria Completa", desc: "Registro de todas las acciones criticas: logins, invitaciones, cambios de estado, desactivaciones." },
  { icon: Server, title: "Aislamiento Multitenant", desc: "Cada proyecto (tenant) esta completamente aislado. Los datos nunca se mezclan entre proyectos." },
  { icon: FileCheck, title: "Validacion de Datos", desc: "Todas las entradas se validan con esquemas Zod tanto en frontend como en el futuro backend." },
  { icon: Users, title: "Invitaciones Seguras", desc: "Invitaciones por token unico con expiracion automatica y validacion de estado." },
]

export default function SecurityPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-16">
      <div className="mb-12 text-center">
        <h1 className="mb-3 text-4xl font-bold text-balance">Seguridad</h1>
        <p className="mx-auto max-w-2xl text-muted-foreground">
          La seguridad es parte del diseno de ProGest desde el primer dia. Asi protegemos tus datos y los de tu equipo.
        </p>
      </div>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => (
          <Card key={item.title} className="group">
            <CardContent className="flex flex-col gap-3 p-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                <item.icon className="h-5 w-5" />
              </div>
              <h3 className="font-semibold">{item.title}</h3>
              <p className="text-sm text-muted-foreground">{item.desc}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
