"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

import { useAuthStore } from "@/stores/authStore"
import { loginService } from "@/services/authService"
import { getHomeRoute } from "@/lib/guards"
import { toast } from "sonner"
import { AlertCircle, Loader2, Eye, EyeOff, ArrowLeft } from "lucide-react"
import { Logo } from "@/components/ui/logo"

import { VipPass } from "@/components/marketing/vip-pass"

const schema = z.object({
  email: z.string().email("Email invalido"),
  password: z.string().min(1, "La contrasena es requerida"),
})

type FormData = z.infer<typeof schema>

export default function LoginPage() {
  const router = useRouter()
  const login = useAuthStore((s) => s.login)
  const [loading, setLoading] = useState(false)
  const [showPw, setShowPw] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    mode: "onBlur",
    reValidateMode: "onChange",
  })

  async function onSubmit(data: FormData) {
    setLoading(true)
    setServerError(null)
    const result = await loginService(data.email, data.password)
    setLoading(false)
    if (!result.success || !result.session) {
      if (result.errorCode === "MEMBERSHIP_INACTIVE") {
        setServerError(result.error || "Tu acceso al proyecto fue desactivado por el Owner.")
        return
      }
      toast.error(result.error || "Error al iniciar sesion")
      return
    }
    login(result.session)
    toast.success(`Bienvenido, ${result.session.user.name}`)
    const route = getHomeRoute(
      result.session.user.role,
      !!result.session.project,
      !!result.session.membership
    )
    router.push(route)
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background">

      {/* ── Orbes de gradiente Atmosféricos ── */}
      <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
        {/* Orbe Azul */}
        <div className="absolute -top-[10%] -left-[5%] h-[600px] w-[600px] rounded-full animate-blob blur-[100px]"
          style={{ background: "radial-gradient(circle at center, rgba(59,130,246,0.4) 0%, transparent 70%)" }} />
        {/* Orbe Violeta */}
        <div className="absolute -bottom-[10%] -right-[5%] h-[700px] w-[700px] rounded-full animate-blob animation-delay-2000 blur-[120px]"
          style={{ background: "radial-gradient(circle at center, rgba(139,92,246,0.35) 0%, transparent 70%)" }} />
        {/* Orbe Cyan */}
        <div className="absolute top-[20%] right-[10%] h-[400px] w-[400px] rounded-full animate-blob animation-delay-4000 blur-[80px]"
          style={{ background: "radial-gradient(circle at center, rgba(6,182,212,0.3) 0%, transparent 70%)" }} />
      </div>

      {/* Botón de regresar (estilizado) */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="absolute top-8 left-8 z-50"
      >
        <Button
          variant="ghost"
          size="sm"
          className="rounded-full bg-background/20 backdrop-blur-md border border-white/5 hover:bg-background/40"
          onClick={() => router.push("/")}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Regresar al inicio
        </Button>
      </motion.div>

      {/* ── Layout de Dos Columnas ── */}
      <div className="relative z-10 w-full max-w-7xl px-6 lg:px-12 py-12 flex flex-col lg:flex-row items-center justify-center gap-12 lg:gap-24">

        {/* Columna Izquierda: Pase VIP Moiré */}
        <div className="flex-1 w-full max-w-xl">
          <VipPass />

          {/* Texto de Bienvenida VIP (Visible solo en desktop) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1, duration: 0.8 }}
            className="hidden lg:block mt-24 text-center lg:text-left space-y-4"
          >
            <h2 className="text-4xl font-black tracking-tighter text-foreground drop-shadow-sm">
              ACCESO A LA MEJOR<span className="text-primary italic"> HERRAMIENTA </span> DE JIRA.
            </h2>
            <p className="text-lg text-muted-foreground/80 max-w-md font-medium leading-relaxed">
              Jira es una herramienta líder de gestión de proyectos y seguimiento de incidencias (bugs) diseñada para equipos de desarrollo de software ágil.
            </p>
          </motion.div>
        </div>

        {/* Columna Derecha: Formulario de Login */}
        <motion.div
          initial={{ opacity: 0, x: 40, scale: 0.98 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          transition={{ duration: 0.8, ease: "circOut" }}
          className="flex-1 w-full max-w-md"
        >
          <Card
            className="dashed-border relative z-10 border-none backdrop-blur-2xl bg-card/15 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.4)] overflow-hidden rounded-[2.5rem]"
          >
            <CardHeader className="text-center pt-12 pb-8">
              {/* Logo con brillo */}
              <div className="relative mx-auto mb-6 flex items-center justify-center">
                <Logo size={64} showText={false} className="relative z-10" />
              </div>
              <CardTitle className="text-3xl font-black tracking-tight text-foreground">
                PROGEST <span className="font-extralight text-primary/70">LOGIN</span>
              </CardTitle>
              <CardDescription className="text-base font-medium text-muted-foreground/70">
                Identifícate para entrar al sistema
              </CardDescription>
            </CardHeader>

            <CardContent className="px-10 pb-12">
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="space-y-5">
                  {/* Email */}
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-xs font-bold uppercase tracking-widest ml-1 opacity-70">Email corporativo</Label>
                    <div className="relative group">
                      <Input
                        id="email"
                        type="email"
                        placeholder="tu@email.com"
                        className="h-14 rounded-2xl bg-background/40 border-white/5 focus:bg-background/60 transition-all text-base font-medium px-5"
                        {...register("email")}
                      />
                    </div>
                    {errors.email && <p className="text-[10px] uppercase font-black text-destructive tracking-wider ml-1">{errors.email.message}</p>}
                  </div>

                  {/* Password */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between ml-1">
                      <Label htmlFor="password" className="text-xs font-bold uppercase tracking-widest opacity-70">Contraseña</Label>
                      <Link href="/auth/forgot-password" title="Recuperar acceso" className="text-xs font-bold text-primary hover:opacity-80 transition-opacity">
                        ¿Olvidaste el acceso?
                      </Link>
                    </div>
                    <div className="relative group">
                      <Input
                        id="password"
                        type={showPw ? "text" : "password"}
                        placeholder="••••••••"
                        className="h-14 rounded-2xl bg-background/40 border-white/5 focus:bg-background/60 transition-all text-base font-medium px-5 pr-12"
                        {...register("password")}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-2 top-1/2 -translate-y-1/2 hover:bg-transparent text-muted-foreground/50 hover:text-primary transition-colors"
                        onClick={() => setShowPw(!showPw)}
                      >
                        {showPw ? <EyeOff size={20} /> : <Eye size={20} />}
                      </Button>
                    </div>
                    {errors.password && <p className="text-[10px] uppercase font-black text-destructive tracking-wider ml-1">{errors.password.message}</p>}
                  </div>
                </div>

                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full h-16 rounded-2xl text-lg font-black tracking-widest uppercase shadow-lg shadow-primary/20"
                  >
                    {loading ? <Loader2 className="mr-3 h-6 w-6 animate-spin" /> : null}
                    {loading ? "Verificando..." : "Acceso Inmediato"}
                  </Button>
                </motion.div>
              </form>

              <div className="mt-8 text-center">
                <p className="text-sm font-medium text-muted-foreground/60">
                  ¿Aún no tienes acceso?{" "}
                  <Link href="/auth/register" className="text-primary font-black hover:underline underline-offset-4">
                    Únete aquí
                  </Link>
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}

