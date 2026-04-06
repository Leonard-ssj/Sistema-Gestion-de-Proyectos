"use client"

import { useEffect, useState, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { acceptInviteService } from "@/services/authService"
import { useAuthStore } from "@/stores/authStore"
import { toast } from "sonner"
import { Loader2, CheckCircle2, Eye, EyeOff, UserPlus, ShieldCheck, Sparkles } from "lucide-react"
import { Logo } from "@/components/ui/logo"
import { AuthAnimatedBackground } from "@/components/marketing/auth-animated-background"
import { BOTTTs_NEUTRAL_AVATARS } from "@/lib/avatars"
import { cn } from "@/lib/utils"
import { IridescentButton } from "@/components/ui/iridescent-button"
import { ThemeToggleAnimated } from "@/components/ui/theme-toggle-animated"

const schema = z.object({
  name: z.string().min(2, "Minimo 2 caracteres"),
  avatar: z.string().min(1, "Selecciona un avatar"),
  password: z.string().min(8, "Minimo 8 caracteres"),
  confirmPassword: z.string(),
}).refine((d) => d.password === d.confirmPassword, {
  message: "Las contrasenas no coinciden",
  path: ["confirmPassword"],
})

const containerVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { 
      type: "spring",
      stiffness: 100,
      damping: 15,
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
}

const itemVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: { opacity: 1, x: 0 }
}

function AcceptContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const token = searchParams.get("token") || ""
  const login = useAuthStore((s) => s.login)
  const [done, setDone] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [inviteEmail, setInviteEmail] = useState("")
  const [projectName, setProjectName] = useState("")
  const [isLoadingInfo, setIsLoadingInfo] = useState(true)

  const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: { avatar: BOTTTs_NEUTRAL_AVATARS[2].src }, // Purple one is cool
  })
  const selectedAvatar = watch("avatar")

  useEffect(() => {
    if (!token) {
      router.replace("/invite/invalid")
      return
    }
    
    async function loadInviteInfo() {
      try {
        const { validateInviteToken } = await import("@/services/inviteService")
        const result = await validateInviteToken(token)
        
        if (result.success) {
          setInviteEmail(result.email || "")
          setProjectName(result.projectName || "")
        } else {
          toast.error(result.error || "Invitación inválida")
          router.replace("/invite/invalid")
        }
      } catch (error) {
        console.error("Error loading invite info:", error)
      } finally {
        setIsLoadingInfo(false)
      }
    }
    
    loadInviteInfo()
  }, [token, router])

  async function onSubmit(data: z.infer<typeof schema>) {
    if (!token) return
    
    setSubmitting(true)
    
    try {
      const result = await acceptInviteService(token, data.password, data.name, data.avatar)
      
      if (!result.success) {
        toast.error(result.error || "Error al aceptar la invitación")
        setSubmitting(false)
        return
      }
      
      if (result.session) {
        login(result.session)
      }
      
      setDone(true)
      toast.success("Cuenta creada exitosamente")
      
      setTimeout(() => {
        router.push("/app/dashboard") // Updated to match context's actual dashboard path
      }, 2500)
    } catch (error) {
      console.error("Error accepting invite:", error)
      toast.error("Error al aceptar la invitación")
      setSubmitting(false)
    }
  }

  if (isLoadingInfo) {
    return (
      <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4">
        <AuthAnimatedBackground />
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="text-lg font-medium animate-pulse">Validando invitación...</p>
        </div>
      </div>
    )
  }

  if (done) {
    return (
      <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4">
        <AuthAnimatedBackground />
        
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 20 }}
          className="w-full max-w-md text-center"
        >
          <Card className="overflow-hidden border-2 border-emerald-500/20 bg-background/80 backdrop-blur-xl shadow-2xl">
            <div className="h-2 bg-emerald-500" />
            <CardContent className="py-12">
              <div className="relative mx-auto mb-6 h-24 w-24">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring" }}
                >
                  <CheckCircle2 className="h-24 w-24 text-emerald-500" />
                </motion.div>
                <motion.div
                  animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0, 0.5] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                  className="absolute inset-0 rounded-full bg-emerald-500/20 blur-xl"
                />
              </div>
              <h2 className="mb-2 text-3xl font-bold tracking-tight">¡Bienvenido a Bordo!</h2>
              <p className="mb-8 text-muted-foreground">Tu cuenta ha sido creada con éxito. Estamos preparando tu espacio de trabajo...</p>
              <div className="flex items-center justify-center gap-3 text-emerald-600 dark:text-emerald-400 font-medium">
                <Loader2 className="h-5 w-5 animate-spin" />
                <span>Redirigiendo al Dashboard...</span>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    )
  }

  if (!token) return null

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden py-12 px-4">
      <AuthAnimatedBackground />
      
      {/* Floating Theme Toggle */}
      <div className="fixed top-6 right-6 z-50">
        <ThemeToggleAnimated />
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="w-full max-w-xl"
      >
        <Card className="overflow-hidden border-none bg-background/60 backdrop-blur-2xl shadow-[0_32px_64px_-12px_rgba(0,0,0,0.14)] dark:shadow-[0_32px_64px_-12px_rgba(0,0,0,0.5)] transition-all duration-500">
          {/* Header Solido Premium */}
          <div className="h-32 bg-primary relative flex items-center justify-center overflow-hidden">
            <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_center,white,transparent)]" />
            <motion.div 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="relative z-10 flex flex-col items-center"
            >
              <div className="bg-white p-3 rounded-2xl shadow-xl mb-3 dark:bg-slate-900 border border-white/50 dark:border-white/10">
                <Logo size={48} showText={false} />
              </div>
            </motion.div>
            
            {/* Abstract Shapes */}
            <div className="absolute -top-10 -left-10 h-32 w-32 rounded-full bg-white/10 blur-2xl" />
            <div className="absolute -bottom-10 -right-10 h-32 w-32 rounded-full bg-white/10 blur-2xl" />
          </div>

          <CardHeader className="text-center pt-8">
            <motion.div variants={itemVariants}>
              <CardTitle className="text-3xl font-bold tracking-tight mb-2">Aceptar Invitación</CardTitle>
              <div className="flex flex-col gap-1.5 items-center justify-center">
                <div className="px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium border border-primary/20 flex items-center gap-2">
                  <UserPlus className="h-4 w-4" />
                  <span>{inviteEmail}</span>
                </div>
                {projectName && (
                  <div className="px-4 py-1.5 rounded-full bg-admin-blue/10 text-admin-blue text-sm font-medium border border-admin-blue/20 flex items-center gap-2">
                    <Sparkles className="h-4 w-4" />
                    <span>Proyecto: {projectName}</span>
                  </div>
                )}
              </div>
            </motion.div>
          </CardHeader>

          <CardContent className="px-8 pb-10">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Name Field */}
              <motion.div variants={itemVariants} className="space-y-2">
                <Label htmlFor="name" className="text-sm font-semibold ml-1">Tu Nombre Completo</Label>
                <div className="relative group">
                  <Input 
                    id="name" 
                    placeholder="Escribe tu nombre..." 
                    {...register("name")} 
                    disabled={submitting}
                    className="h-12 bg-background/50 border-white/20 dark:border-white/10 focus:ring-2 focus:ring-primary/50 transition-all rounded-xl pl-4"
                  />
                </div>
                {errors.name && <p className="text-xs text-destructive ml-1">{errors.name.message}</p>}
              </motion.div>

              {/* Avatar Selection */}
              <motion.div variants={itemVariants} className="space-y-3">
                <Label className="text-sm font-semibold ml-1">Elección de Avatar</Label>
                <div className="grid grid-cols-4 gap-3">
                  {BOTTTs_NEUTRAL_AVATARS.map((a, idx) => (
                    <motion.button
                      key={a.id}
                      type="button"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setValue("avatar", a.src, { shouldValidate: true })}
                      aria-label={`Seleccionar avatar ${a.seed}`}
                      disabled={submitting}
                      className={cn(
                        "relative aspect-square rounded-2xl border-2 transition-all duration-300 overflow-hidden group",
                        selectedAvatar === a.src 
                          ? "border-primary bg-primary/5 shadow-[0_0_15px_rgba(29,122,252,0.3)]" 
                          : "border-transparent bg-muted/30 hover:border-white/40 dark:hover:border-white/20"
                      )}
                    >
                      <img 
                        alt="" 
                        src={a.src} 
                        className={cn(
                          "h-full w-full object-cover transition-all duration-500",
                          selectedAvatar === a.src ? "scale-110" : "scale-100 group-hover:scale-105"
                        )} 
                      />
                      {selectedAvatar === a.src && (
                        <div className="absolute inset-0 bg-primary/10 flex items-center justify-center">
                          <div className="bg-primary text-white rounded-full p-0.5 shadow-lg">
                            <CheckCircle2 className="h-4 w-4" />
                          </div>
                        </div>
                      )}
                    </motion.button>
                  ))}
                </div>
                {errors.avatar && <p className="text-xs text-destructive ml-1">{errors.avatar.message}</p>}
              </motion.div>

              {/* Password Fields Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <motion.div variants={itemVariants} className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-semibold ml-1">Contraseña</Label>
                  <div className="relative group">
                    <Input 
                      id="password" 
                      type={showPassword ? "text" : "password"} 
                      placeholder="Seguridad alta" 
                      {...register("password")} 
                      disabled={submitting}
                      className="h-12 bg-background/50 border-white/20 dark:border-white/10 rounded-xl pr-12"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      disabled={submitting}
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                  {errors.password && <p className="text-xs text-destructive ml-1">{errors.password.message}</p>}
                </motion.div>

                <motion.div variants={itemVariants} className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-sm font-semibold ml-1">Confirmar</Label>
                  <div className="relative group">
                    <Input 
                      id="confirmPassword" 
                      type={showConfirmPassword ? "text" : "password"} 
                      placeholder="Repite la clave" 
                      {...register("confirmPassword")} 
                      disabled={submitting}
                      className="h-12 bg-background/50 border-white/20 dark:border-white/10 rounded-xl pr-12"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      disabled={submitting}
                    >
                      {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                  {errors.confirmPassword && <p className="text-xs text-destructive ml-1">{errors.confirmPassword.message}</p>}
                </motion.div>
              </div>

              {/* Submit Button */}
              <motion.div variants={itemVariants} className="pt-4">
                <IridescentButton
                  type="submit"
                  disabled={submitting}
                  size="lg"
                  className="w-full h-14 rounded-2xl text-lg shadow-xl"
                >
                  {submitting ? (
                    <div className="flex items-center gap-2">
                      <Loader2 className="h-5 w-5 animate-spin" />
                      <span>Creando Perfil...</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="h-5 w-5" />
                      <span>Configurar y Unirse</span>
                    </div>
                  )}
                </IridescentButton>
              </motion.div>

              <motion.p variants={itemVariants} className="text-center text-[11px] text-muted-foreground uppercase tracking-widest pt-2">
                Protección de datos de extremo a extremo • AdminHub Premium
              </motion.p>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}

export default function InviteAcceptPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center bg-slate-950"><Loader2 className="h-12 w-12 animate-spin text-primary" /></div>}>
      <AcceptContent />
    </Suspense>
  )
}

