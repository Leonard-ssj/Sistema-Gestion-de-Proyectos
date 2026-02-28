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
import { useAuthStore } from "@/stores/authStore"
import { loginService } from "@/services/authService"
import { getHomeRoute } from "@/lib/guards"
import { toast } from "sonner"
import { Loader2, FolderKanban, Eye, EyeOff, ArrowLeft } from "lucide-react"

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

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  async function onSubmit(data: FormData) {
    setLoading(true)
    const result = await loginService(data.email, data.password)
    setLoading(false)
    if (!result.success || !result.session) {
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
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4">
      {/* Fondo animado con gradiente */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-950 dark:to-indigo-950">
        {/* Círculos animados */}
        <div className="absolute top-0 left-0 w-96 h-96 bg-blue-400/20 dark:bg-blue-600/20 rounded-full mix-blend-multiply dark:mix-blend-lighten filter blur-3xl animate-blob" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-400/20 dark:bg-purple-600/20 rounded-full mix-blend-multiply dark:mix-blend-lighten filter blur-3xl animate-blob animation-delay-2000" />
        <div className="absolute bottom-0 left-1/2 w-96 h-96 bg-indigo-400/20 dark:bg-indigo-600/20 rounded-full mix-blend-multiply dark:mix-blend-lighten filter blur-3xl animate-blob animation-delay-4000" />
      </div>

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
          <CardTitle className="text-2xl font-bold">Iniciar Sesion</CardTitle>
          <CardDescription>Ingresa tus credenciales para acceder a tu cuenta</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="tu@email.com" {...register("email")} />
              {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
            </div>
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Contrasena</Label>
                <Link href="/auth/forgot-password" className="text-xs text-primary hover:underline">
                  Olvidaste tu contrasena?
                </Link>
              </div>
              <div className="relative">
                <Input 
                  id="password" 
                  type={showPw ? "text" : "password"} 
                  placeholder="********" 
                  {...register("password")} 
                  className="pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPw(!showPw)}
                >
                  {showPw ? (
                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <Eye className="h-4 w-4 text-muted-foreground" />
                  )}
                </Button>
              </div>
              {errors.password && <p className="text-sm text-destructive">{errors.password.message}</p>}
            </div>
            <Button type="submit" disabled={loading} className="w-full">
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Iniciar Sesion
            </Button>
          </form>
          <div className="mt-4 text-center text-sm text-muted-foreground">
            No tienes cuenta?{" "}
            <Link href="/auth/register" className="text-primary hover:underline">
              Registrate como Owner
            </Link>
          </div>
          <div className="mt-6 rounded-lg border bg-muted/50 p-3">
            <p className="mb-2 text-xs font-medium text-muted-foreground">Cuentas demo:</p>
            <div className="flex flex-col gap-1 text-xs text-muted-foreground">
              <span><strong>Owner:</strong> owner@demo.com / Owner123!</span>
              <span><strong>Empleado:</strong> employee@demo.com / Emp123!</span>
              <span><strong>Admin:</strong> admin@demo.com / Admin123!</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
