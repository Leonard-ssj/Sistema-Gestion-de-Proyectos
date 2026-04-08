"use client"

import * as React from "react"
import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ElectricBorder } from "@/components/ui/electric-border"
import { ThreeDShape } from "@/components/marketing/three-d-shape"
import { toast } from "sonner"
import { Loader2, CheckCircle2, Mail, MapPin, Phone, MessageSquare, Send } from "lucide-react"

const schema = z.object({
  name: z.string().min(2, "Mínimo 2 caracteres"),
  email: z.string().email("Email inválido"),
  subject: z.string().min(3, "Mínimo 3 caracteres"),
  message: z.string().min(10, "Mínimo 10 caracteres"),
})

const contactInfo = [
  { icon: Mail, label: "Email", value: "soporte@progest.com", color: "from-blue-500/20 to-indigo-500/10", accent: "#3b82f6" },
  { icon: Phone, label: "Teléfono", value: "+52 (55) 123-45678", color: "from-emerald-500/20 to-teal-500/10", accent: "#10b981" },
  { icon: MapPin, label: "Oficina", value: "Unitec Campus Sur, Ciudad de México, México", color: "from-orange-500/20 to-amber-500/10", accent: "#f59e0b" },
]

export default function ContactPage() {
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const { resolvedTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => setMounted(true), [])

  const { register, handleSubmit, formState: { errors } } = useForm<z.infer<typeof schema>>({ resolver: zodResolver(schema) })

  async function onSubmit() {
    setLoading(true)
    await new Promise((r) => setTimeout(r, 800))
    setLoading(false)
    setSent(true)
    toast.success("Mensaje enviado correctamente")
  }

  // Helper para obtener colores según el tema
  const getThemeBlobs = () => {
    switch (resolvedTheme) {
      case "dark": return { b1: "#fbbf24", b2: "#f472b6", b3: "#60a5fa" }
      case "sunset": return { b1: "#C0AB92", b2: "#f472b6", b3: "#fbbf24" }
      case "sunrise": return { b1: "#a04d66", b2: "#e2c0b5", b3: "#ecd2c5" }
      default: return { b1: "#1D7AFC", b2: "#3b82f6", b3: "#93c5fd" }
    }
  }

  if (!mounted) return null
  const colors = getThemeBlobs()

  return (
    <div className="relative min-h-[calc(100vh-3.5rem)] overflow-hidden bg-transparent">

      <div className="container relative z-10 mx-auto px-4 py-20 max-w-6xl">

        {/* Encabezado con Acento 3D */}
        <div className="mb-16 flex flex-col md:flex-row items-center gap-10 md:text-left text-center">
          <div className="flex-1">
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-6 flex md:justify-start justify-center">
              <ElectricBorder>
                <span className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-primary">
                  <MessageSquare className="h-4 w-4" />
                  Respuesta en menos de 24 horas
                </span>
              </ElectricBorder>
            </motion.div>
            <motion.h1 initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} className="text-4xl font-black tracking-tight text-foreground sm:text-6xl uppercase">
              Contacto
            </motion.h1>
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="mt-6 text-lg text-muted-foreground max-w-xl">
              Estamos aquí para ayudarte a transformar la gestión de tus proyectos. Escríbenos y nuestro equipo te responderá en tiempo récord.
            </motion.p>
          </div>

          {/* 🎲 Elemento 3D Interactivo (Representando Interconexión) */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8, rotate: -10 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ duration: 0.8, type: "spring" }}
            className="hidden md:block"
          >
            <ThreeDShape shape="Icosahedron" color={colors.b3} />
          </motion.div>
        </div>

        <div className="grid gap-10 md:grid-cols-12 items-start">

          {/* Columna Formulario (7 slots) */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="md:col-span-7"
          >
            <Card className="dashed-border bg-card/20 backdrop-blur-md shadow-2xl overflow-hidden rounded-3xl">
              <CardHeader className="pb-8 pt-10 px-10">
                <CardTitle className="text-2xl font-bold flex items-center gap-3">
                  <Send className="h-6 w-6 text-primary" />
                  Enviar Mensaje
                </CardTitle>
                <CardDescription className="text-base">Completa los detalles y nos pondremos en contacto.</CardDescription>
              </CardHeader>
              <CardContent className="px-10 pb-12">
                <AnimatePresence mode="wait">
                  {sent ? (
                    <motion.div
                      key="sent"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 1.05 }}
                      className="flex flex-col items-center gap-6 py-12"
                    >
                      <motion.div animate={{ rotate: [0, -10, 10, 0], scale: [1, 1.2, 1] }} transition={{ duration: 0.6 }}>
                        <CheckCircle2 className="h-20 w-20 text-emerald-500 drop-shadow-[0_0_15px_rgba(16,185,129,0.3)]" />
                      </motion.div>
                      <div className="text-center">
                        <h3 className="text-xl font-bold mb-2">¡Mensaje Recibido!</h3>
                        <p className="text-muted-foreground text-sm max-w-xs">
                          Hemos recibido tus datos con éxito. Revisaremos tu solicitud y te contactaremos pronto.
                        </p>
                      </div>
                      <Button variant="outline" className="rounded-2xl h-12 px-8" onClick={() => setSent(false)}>
                        Enviar otro mensaje
                      </Button>
                    </motion.div>
                  ) : (
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                      <div className="grid gap-6 sm:grid-cols-2">
                        {[
                          { id: "name", label: "Tu Nombre", type: "text", placeholder: "Nombre completo", field: "name" },
                          { id: "email", label: "Tu Email", type: "email", placeholder: "tu@ejemplo.com", field: "email" },
                        ].map((f) => (
                          <div key={f.id} className="flex flex-col gap-2 p-1 rounded-2xl transition-all">
                            <Label htmlFor={f.id} className="text-xs font-bold uppercase tracking-widest ml-1 opacity-70">{f.label}</Label>
                            <Input
                              id={f.id}
                              type={f.type}
                              placeholder={f.placeholder}
                              className="rounded-xl h-12 bg-background/50 border-white/10 focus:border-primary/50 transition-all font-medium"
                              {...register(f.field as "name" | "email")}
                            />
                            {errors[f.field as keyof typeof errors] && (
                              <p className="text-[10px] font-bold text-destructive px-1 uppercase">{errors[f.field as keyof typeof errors]?.message}</p>
                            )}
                          </div>
                        ))}
                      </div>

                      <div className="flex flex-col gap-2 p-1 rounded-2xl transition-all">
                        <Label htmlFor="subject" className="text-xs font-bold uppercase tracking-widest ml-1 opacity-70">Asunto</Label>
                        <Input
                          id="subject"
                          placeholder="¿En qué podemos ayudarte?"
                          className="rounded-xl h-12 bg-background/50 border-white/10 focus:border-primary/50 transition-all font-medium"
                          {...register("subject")}
                        />
                        {errors.subject && <p className="text-[10px] font-bold text-destructive px-1 uppercase">{errors.subject.message}</p>}
                      </div>

                      <div className="flex flex-col gap-2 p-1 rounded-2xl transition-all">
                        <Label htmlFor="message" className="text-xs font-bold uppercase tracking-widest ml-1 opacity-70">Mensaje</Label>
                        <Textarea
                          id="message"
                          placeholder="Escribe tu consulta detallada aquí..."
                          rows={4}
                          className="rounded-xl bg-background/50 border-white/10 focus:border-primary/50 transition-all font-medium resize-none"
                          {...register("message")}
                        />
                        {errors.message && <p className="text-[10px] font-bold text-destructive px-1 uppercase">{errors.message.message}</p>}
                      </div>

                      <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }} className="pt-2">
                        <Button type="submit" disabled={loading} className="w-full h-[56px] rounded-2xl text-base font-bold uppercase tracking-widest">
                          {loading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Send className="mr-2 h-5 w-5" />}
                          {loading ? "Enviando..." : "Enviar Mensaje"}
                        </Button>
                      </motion.div>
                    </form>
                  )}
                </AnimatePresence>
              </CardContent>
            </Card>
          </motion.div>

          {/* Info de contacto (5 slots) */}
          <div className="md:col-span-5 flex flex-col gap-6">
            {contactInfo.map((info, i) => (
              <motion.div
                key={info.label}
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + (i * 0.1) }}
                whileHover={{ x: 8 }}
                className="group cursor-default"
              >
                <Card className="dashed-border bg-card/10 border-white/5 overflow-hidden rounded-2xl hover:bg-card/20 transition-all">
                  <CardContent className="flex items-center gap-5 p-6">
                    <div className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${info.color} group-hover:scale-110 transition-transform`}>
                      <info.icon className="h-6 w-6" style={{ color: info.accent }} />
                    </div>
                    <div>
                      <h3 className="text-xs font-bold uppercase tracking-widest opacity-50 mb-0.5">{info.label}</h3>
                      <p className="text-lg font-bold text-foreground transition-colors group-hover:text-primary">{info.value}</p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}

            {/* Horario con Estética Dashboard */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.7 }}
              className="rounded-3xl border border-primary/20 bg-primary/5 p-8 relative overflow-hidden group"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl -translate-y-16 translate-x-16 pointer-events-none" />
              <h4 className="text-sm font-bold uppercase tracking-widest mb-3 flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                Horario de Atención
              </h4>
              <p className="text-sm text-muted-foreground leading-relaxed relative z-10">
                Martes y Viernes, <span className="text-foreground font-semibold">18:00 – 20:00 (UTC-6)</span>.
                Fuera de horario, nuestro sistema de tickets procesará tu consulta para ser atendida la siguiente clase de Implantacion jaja saludos xD.
              </p>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}
