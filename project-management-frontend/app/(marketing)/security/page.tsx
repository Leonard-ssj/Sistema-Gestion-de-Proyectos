"use client"

import { motion, Variants } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { ElectricBorder } from "@/components/ui/electric-border"
import { Shield, Lock, Eye, Server, FileCheck, Users } from "lucide-react"

const items = [
  { icon: Shield,    title: "Control de Acceso por Roles",  desc: "Tres niveles de acceso: Owner, Employee y SuperAdmin. Cada rol ve solo lo que le corresponde.", color: "bg-blue-500/10 text-blue-600 dark:text-blue-400",   hover: "group-hover:bg-blue-500 group-hover:text-white",   glow: "from-blue-500/15"   },
  { icon: Lock,      title: "Autenticación Segura",          desc: "Contraseñas hasheadas con bcrypt, sesiones con tokens JWT y protección contra ataques de fuerza bruta.", color: "bg-violet-500/10 text-violet-600 dark:text-violet-400", hover: "group-hover:bg-violet-500 group-hover:text-white", glow: "from-violet-500/15" },
  { icon: Eye,       title: "Auditoría Completa",            desc: "Registro de todas las acciones críticas: logins, invitaciones, cambios de estado, desactivaciones.", color: "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400",   hover: "group-hover:bg-cyan-500 group-hover:text-white",   glow: "from-cyan-500/15"   },
  { icon: Server,    title: "Aislamiento Multitenant",       desc: "Cada proyecto (tenant) está completamente aislado. Los datos nunca se mezclan entre proyectos.", color: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400", hover: "group-hover:bg-emerald-500 group-hover:text-white", glow: "from-emerald-500/15" },
  { icon: FileCheck, title: "Validación de Datos",           desc: "Todas las entradas se validan con esquemas Zod tanto en frontend como en backend.", color: "bg-orange-500/10 text-orange-600 dark:text-orange-400", hover: "group-hover:bg-orange-500 group-hover:text-white", glow: "from-orange-500/15" },
  { icon: Users,     title: "Invitaciones Seguras",          desc: "Invitaciones por token único con expiración automática y validación de estado.", color: "bg-pink-500/10 text-pink-600 dark:text-pink-400",   hover: "group-hover:bg-pink-500 group-hover:text-white",   glow: "from-pink-500/15"   },
]

const containerVariants: Variants = {
  hidden:  {},
  visible: { transition: { staggerChildren: 0.09, delayChildren: 0.2 } },
}
const cardVariants: Variants = {
  hidden:  { opacity: 0, y: 24, scale: 0.97 },
  visible: { opacity: 1, y: 0,  scale: 1, transition: { duration: 0.4, ease: "easeOut" } },
}

export default function SecurityPage() {
  return (
    <motion.div
      className="mx-auto max-w-6xl px-4 py-20 md:py-28"
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      {/* Encabezado */}
      <div className="mb-16 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="mb-4"
        >
          <ElectricBorder>
            <span className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-primary">
              <Shield className="h-3.5 w-3.5" />
              Seguridad por diseño — no como extra
            </span>
          </ElectricBorder>
        </motion.div>
        <motion.h1
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.08 }}
          className="mb-4 text-4xl font-bold tracking-tight text-balance sm:text-5xl"
        >
          Seguridad
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="mx-auto max-w-2xl text-muted-foreground sm:text-lg"
        >
          La seguridad es parte del diseño de ProGest desde el primer día. Así protegemos tus datos y los de tu equipo.
        </motion.p>
      </div>

      {/* Grid */}
      <motion.div
        className="grid gap-5 md:grid-cols-2 lg:grid-cols-3"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {items.map((item) => (
          <motion.div
            key={item.title}
            variants={cardVariants}
            whileHover={{ y: -5, transition: { duration: 0.2 } }}
          >
            <Card className="dashed-border group relative overflow-hidden shadow-sm rounded-sm h-full">
              <div className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${item.glow} to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
              <CardContent className="relative flex flex-col gap-4 p-6">
                <motion.div
                  className={`flex h-11 w-11 items-center justify-center rounded-xl transition-all duration-300 ${item.color} ${item.hover}`}
                  whileHover={{ rotate: [0, -8, 8, 0], transition: { duration: 0.35 } }}
                >
                  <item.icon className="h-5 w-5" />
                </motion.div>
                <div>
                  <h3 className="mb-1.5 font-semibold tracking-tight text-foreground/90">{item.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      {/* Banner de confianza */}
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.55 }}
        className="mt-14 rounded-2xl border border-primary/20 bg-primary/5 p-8 text-center"
      >
        <Lock className="mx-auto mb-3 h-8 w-8 text-primary/60" />
        <h2 className="mb-2 text-xl font-bold">Tu privacidad es nuestra prioridad</h2>
        <p className="mx-auto max-w-xl text-sm text-muted-foreground">
          ProGest nunca vende ni comparte datos personales. Todos los datos se almacenan de forma cifrada y con backups automáticos.
        </p>
      </motion.div>
    </motion.div>
  )
}
