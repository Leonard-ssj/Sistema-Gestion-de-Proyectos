"use client"

import { useEffect, useState, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { acceptInviteService } from "@/services/authService"
import { useAuthStore } from "@/stores/authStore"
import { toast } from "sonner"
import { Loader2, FolderKanban, CheckCircle2, Eye, EyeOff } from "lucide-react"
import { AuthAnimatedBackground } from "@/components/marketing/auth-animated-background"
import { BOTTTs_NEUTRAL_AVATARS } from "@/lib/avatars"
import { cn } from "@/lib/utils"

const schema = z.object({
  name: z.string().min(2, "Minimo 2 caracteres"),
  avatar: z.string().min(1, "Selecciona un avatar"),
  password: z.string().min(8, "Minimo 8 caracteres"),
  confirmPassword: z.string(),
}).refine((d) => d.password === d.confirmPassword, {
  message: "Las contrasenas no coinciden",
  path: ["confirmPassword"],
})

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

  const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: { avatar: BOTTTs_NEUTRAL_AVATARS[0].src },
  })
  const selectedAvatar = watch("avatar")

  useEffect(() => {
    // Validar que el token exista
    if (!token) {
      router.replace("/invite/invalid")
      return
    }
    
    // Obtener información de la invitación
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
      
      // Guardar sesión usando login del store
      if (result.session) {
        login(result.session)
      }
      
      setDone(true)
      toast.success("Cuenta creada exitosamente")
      
      // Redirigir después de 2 segundos
      setTimeout(() => {
        router.push("/work/my-tasks")
      }, 2000)
    } catch (error) {
      console.error("Error accepting invite:", error)
      toast.error("Error al aceptar la invitación")
      setSubmitting(false)
    }
  }

  if (done) {
    return (
      <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4">
        <AuthAnimatedBackground />
        
        <Card className="w-full max-w-md text-center backdrop-blur-sm bg-background/95 shadow-xl">
          <CardContent className="py-8">
            <CheckCircle2 className="mx-auto mb-4 h-16 w-16 text-emerald-500" />
            <h2 className="mb-2 text-xl font-bold">Cuenta Creada</h2>
            <p className="mb-4 text-sm text-muted-foreground">Tu cuenta ha sido creada. Redirigiendo a tus tareas...</p>
            <Loader2 className="mx-auto h-6 w-6 animate-spin text-primary" />
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!token) return null

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4">
      <AuthAnimatedBackground />
      
      <Card className="w-full max-w-md backdrop-blur-sm bg-background/95 shadow-xl">
        <CardHeader className="text-center">
          <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <FolderKanban className="h-6 w-6" />
          </div>
          <CardTitle className="text-2xl font-bold">Aceptar Invitacion</CardTitle>
          <CardDescription>
            {inviteEmail && (
              <span className="block mb-1">Invitación para: <span className="font-semibold">{inviteEmail}</span></span>
            )}
            {projectName && (
              <span className="block mb-2">Proyecto: <span className="font-semibold">{projectName}</span></span>
            )}
            Crea tu contrasena para unirte al proyecto
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="name">Nombre</Label>
              <Input 
                id="name" 
                placeholder="Tu nombre" 
                {...register("name")} 
                disabled={submitting}
              />
              {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
            </div>
            <div className="flex flex-col gap-2">
              <Label>Avatar</Label>
              <div className="grid grid-cols-4 gap-2">
                {BOTTTs_NEUTRAL_AVATARS.map((a) => (
                  <button
                    key={a.id}
                    type="button"
                    onClick={() => setValue("avatar", a.src, { shouldValidate: true })}
                    aria-label={`Seleccionar avatar ${a.seed}`}
                    disabled={submitting}
                    className={cn(
                      "relative rounded-lg border bg-background p-1 transition-all hover:shadow-sm",
                      selectedAvatar === a.src ? "ring-2 ring-primary" : "opacity-80 hover:opacity-100"
                    )}
                  >
                    <img alt="" src={a.src} className="h-14 w-full rounded-md object-cover bg-muted/20" />
                  </button>
                ))}
              </div>
              {errors.avatar && <p className="text-sm text-destructive">{errors.avatar.message}</p>}
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="password">Contrasena</Label>
              <div className="relative">
                <Input 
                  id="password" 
                  type={showPassword ? "text" : "password"} 
                  placeholder="Min. 8 caracteres" 
                  {...register("password")} 
                  disabled={submitting}
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  disabled={submitting}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && <p className="text-sm text-destructive">{errors.password.message}</p>}
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="confirmPassword">Confirmar contrasena</Label>
              <div className="relative">
                <Input 
                  id="confirmPassword" 
                  type={showConfirmPassword ? "text" : "password"} 
                  {...register("confirmPassword")} 
                  disabled={submitting}
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  disabled={submitting}
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.confirmPassword && <p className="text-sm text-destructive">{errors.confirmPassword.message}</p>}
            </div>
            <Button type="submit" disabled={submitting} className="w-full">
              {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Crear Cuenta
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

export default function InviteAcceptPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>}>
      <AcceptContent />
    </Suspense>
  )
}
