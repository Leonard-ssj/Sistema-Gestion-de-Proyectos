"use client"

import { useState } from "react"
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
import { registerService } from "@/services/authService"
import { toast } from "sonner"
import { AuthAnimatedBackground } from "@/components/marketing/auth-animated-background"
import { AlertCircle, Loader2, FolderKanban, Eye, EyeOff, ArrowLeft } from "lucide-react"

const schema = z.object({
  name: z.string().min(2, "Minimo 2 caracteres"),
  email: z.string().email("Email invalido"),
  password: z.string()
    .min(8, "Minimo 8 caracteres")
    .regex(/[A-Z]/, "Debe contener al menos una letra mayuscula")
    .regex(/[a-z]/, "Debe contener al menos una letra minuscula")
    .regex(/\d/, "Debe contener al menos un numero"),
  confirmPassword: z.string(),
}).refine((d) => d.password === d.confirmPassword, {
  message: "Las contrasenas no coinciden",
  path: ["confirmPassword"],
})

type FormData = z.infer<typeof schema>

export default function RegisterPage() {
  const router = useRouter()
  const login = useAuthStore((s) => s.login)
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const { register, handleSubmit, formState: { errors }, setError, clearErrors } = useForm<FormData>({
    resolver: zodResolver(schema),
    mode: "onBlur",
    reValidateMode: "onChange",
  })

  async function onSubmit(data: FormData) {
    setLoading(true)
    clearErrors()
    const result = await registerService({ name: data.name, email: data.email, password: data.password })
    setLoading(false)
    if (!result.success || !result.session) {
      if (result.fieldErrors) {
        Object.entries(result.fieldErrors).forEach(([field, message]) => {
          setError(field as any, { type: "server", message })
        })
        toast.error("Revisa los campos marcados e intenta de nuevo")
        return
      }
      
      toast.error(result.error || "Error al registrar")
      return
    }
    // Usar la sesión que viene del backend
    login(result.session)
    toast.success("Cuenta creada. Vamos a configurar tu primer proyecto.")
    router.push("/onboarding")
  }
  
  const errorMessages = Array.from(
    new Set(
      Object.values(errors)
        .map((e) => e?.message)
        .filter((m): m is string => typeof m === "string" && m.length > 0)
    )
  )

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4">
      <AuthAnimatedBackground />

      {/* Botón de regresar */}
      <Button
        variant="ghost"
        size="sm"
        className="absolute top-4 left-4 z-10"
        onClick={() => router.back()}
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Regresar
      </Button>

      {/* Card del formulario */}
      <Card className="relative z-10 w-full max-w-md backdrop-blur-sm bg-background/95 shadow-2xl">
        <CardHeader className="text-center">
          <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <FolderKanban className="h-6 w-6" />
          </div>
          <CardTitle className="text-2xl font-bold">Crear Cuenta (Owner)</CardTitle>
          <CardDescription>Registrate para crear y gestionar tu proyecto</CardDescription>
        </CardHeader>
        <CardContent>
          {errorMessages.length > 0 && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle />
              <AlertTitle>Revisa los campos</AlertTitle>
              <AlertDescription>
                <ul className="list-disc pl-4">
                  {errorMessages.map((m) => (
                    <li key={m}>{m}</li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>
          )}
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="name">Nombre completo</Label>
              <Input
                id="name"
                placeholder="Tu nombre"
                aria-invalid={!!errors.name}
                aria-describedby={errors.name ? "name-error" : undefined}
                {...register("name")}
              />
              {errors.name && <p id="name-error" className="text-sm text-destructive">{errors.name.message}</p>}
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="tu@email.com"
                aria-invalid={!!errors.email}
                aria-describedby={errors.email ? "email-error" : undefined}
                {...register("email")}
              />
              {errors.email && <p id="email-error" className="text-sm text-destructive">{errors.email.message}</p>}
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="password">Contrasena</Label>
              <div className="relative">
                <Input 
                  id="password" 
                  type={showPassword ? "text" : "password"} 
                  placeholder="Min. 8 caracteres" 
                  aria-invalid={!!errors.password}
                  aria-describedby={errors.password ? "password-error" : undefined}
                  {...register("password")}
                  className="pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <Eye className="h-4 w-4 text-muted-foreground" />
                  )}
                </Button>
              </div>
              {errors.password && <p id="password-error" className="text-sm text-destructive">{errors.password.message}</p>}
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="confirmPassword">Confirmar contrasena</Label>
              <div className="relative">
                <Input 
                  id="confirmPassword" 
                  type={showConfirmPassword ? "text" : "password"} 
                  placeholder="Repite la contrasena" 
                  aria-invalid={!!errors.confirmPassword}
                  aria-describedby={errors.confirmPassword ? "confirmPassword-error" : undefined}
                  {...register("confirmPassword")}
                  className="pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <Eye className="h-4 w-4 text-muted-foreground" />
                  )}
                </Button>
              </div>
              {errors.confirmPassword && <p id="confirmPassword-error" className="text-sm text-destructive">{errors.confirmPassword.message}</p>}
            </div>
            <Button type="submit" disabled={loading} className="w-full">
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Registrarme
            </Button>
          </form>
          <div className="mt-4 text-center text-sm text-muted-foreground">
            Ya tienes cuenta?{" "}
            <Link href="/auth/login" className="text-primary hover:underline">
              Inicia sesion
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
