"use client"

import { motion, Variants } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ElectricBorder } from "@/components/ui/electric-border"
import { Target, Lightbulb, Heart, Users, Code2, Globe } from "lucide-react"
import Link from "next/link"

const pillars = [
  { icon: Target, title: "Nuestra Misión", desc: "Democratizar la gestión de proyectos con herramientas intuitivas que equipos de marketing, operaciones, academia y finanzas puedan adoptar sin capacitación especial.", color: "bg-blue-500/10 text-blue-600 dark:text-blue-400", hover: "group-hover:bg-blue-500" },
  { icon: Lightbulb, title: "Nuestra Visión", desc: "Ser la plataforma de referencia para equipos no técnicos que buscan organizarse de forma profesional y eficiente.", color: "bg-amber-500/10 text-amber-600 dark:text-amber-400", hover: "group-hover:bg-amber-500" },
  { icon: Heart, title: "Nuestros Valores", desc: "Simplicidad, transparencia, seguridad y enfoque en el usuario. Cada decisión de diseño pone al equipo en el centro.", color: "bg-rose-500/10 text-rose-600 dark:text-rose-400", hover: "group-hover:bg-rose-500" },
]

const teamItems = [
  { icon: Code2, label: "Desarrollo de Software", desc: "Arquitectura Fullstack, APIs y Despliegue" },
  { icon: Globe, label: "Experiencia de Usuario", desc: "Diseño de Interfaz y Arquitectura de Información" },
  { icon: Users, label: "Gestión y Calidad", desc: "Análisis de Requerimientos e Implantación" },
]

const containerVariants: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1, delayChildren: 0.2 } },
}
const cardVariants: Variants = {
  hidden: { opacity: 0, y: 22, scale: 0.97 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.42, ease: "easeOut" } },
}

export default function AboutPage() {
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
              <Heart className="h-3.5 w-3.5" />
              Hecho con propósito en Latinoamérica
            </span>
          </ElectricBorder>
        </motion.div>
        <motion.h1
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.08 }}
          className="mb-4 text-4xl font-bold tracking-tight text-balance sm:text-5xl"
        >
          Acerca de ProGest
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="mx-auto max-w-2xl text-muted-foreground sm:text-lg"
        >
          Nacimos con una misión simple: hacer que la gestión de proyectos sea accesible para todos,
          sin importar la industria o el nivel técnico de tu equipo.
        </motion.p>
      </div>

      {/* Pilares */}
      <motion.div
        className="grid gap-5 md:grid-cols-3 mb-12"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {pillars.map((p) => (
          <motion.div key={p.title} variants={cardVariants} whileHover={{ y: -5, transition: { duration: 0.2 } }}>
            <Card className="dashed-border group relative overflow-hidden shadow-sm rounded-sm h-full">
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <CardContent className="relative flex flex-col items-center gap-4 p-7 text-center">
                <motion.div
                  whileHover={{ rotate: [0, -10, 10, 0], transition: { duration: 0.4 } }}
                  className={`flex h-14 w-14 items-center justify-center rounded-2xl ${p.color} ${p.hover} group-hover:text-white transition-all duration-300`}
                >
                  <p.icon className="h-7 w-7" />
                </motion.div>
                <div>
                  <h3 className="mb-2 text-base font-semibold tracking-tight text-foreground/90">{p.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{p.desc}</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      {/* Sección Equipo */}
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.45 }}
        className="dashed-border rounded-sm shadow-sm overflow-hidden"
      >
        <div className="border-b border-border/60 px-8 py-6">
          <h2 className="text-2xl font-bold tracking-tight">El Equipo</h2>
          <p className="mt-1.5 text-sm text-muted-foreground max-w-2xl">
            ProGest es desarrollado por un equipo de ingenieros de la Burritec, diseñadores y profesionales de gestión de proyectos ubicados en la CDMX. Creemos que somos el mejor equipo con el mejor proyecto y el más completo.
          </p>
        </div>
        <motion.div
          className="grid md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-border/40"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {teamItems.map((t) => (
            <motion.div
              key={t.label}
              variants={cardVariants}
              whileHover={{ backgroundColor: "hsl(var(--muted) / 0.3)", transition: { duration: 0.15 } }}
              className="flex items-start gap-4 px-8 py-6 rounded-none"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <t.icon className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-foreground/90">{t.label}</h3>
                <p className="mt-0.5 text-xs text-muted-foreground">{t.desc}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>

      {/* CTA */}
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.65 }}
        className="mt-14 flex flex-col items-center gap-4 text-center"
      >
        <p className="text-sm text-muted-foreground">¿Listo para unirte a nuestra misión?</p>
        <div className="flex gap-3">
          <Link href="/auth/register">
            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
              <Button size="lg" className="rounded-xl h-11 px-8 shadow-md shadow-primary/20">Comenzar Gratis</Button>
            </motion.div>
          </Link>
          <Link href="/contact">
            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
              <Button variant="outline" size="lg" className="rounded-xl h-11 px-8">Contáctanos</Button>
            </motion.div>
          </Link>
        </div>
      </motion.div>
    </motion.div>
  )
}
