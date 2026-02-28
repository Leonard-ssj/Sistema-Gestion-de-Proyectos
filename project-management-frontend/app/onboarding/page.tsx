"use client"

import { useState, useEffect } from "react"
import { useAuthStore } from "@/stores/authStore"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useRouter } from "next/navigation"
import { FolderKanban, ArrowRight, CheckCircle2, Sparkles, Loader2 } from "lucide-react"
import { createProjectService } from "@/services/projectService"
import { toast } from "sonner"

const categories = [
  "Marketing",
  "Tecnologia",
  "Educacion",
  "Salud",
  "Finanzas",
  "Operaciones",
  "Consultoria",
  "Otro",
]

export default function OnboardingPage() {
  const router = useRouter()
  const session = useAuthStore((s) => s.session)
  const hydrated = useAuthStore((s) => s.hydrated)
  const hydrate = useAuthStore((s) => s.hydrate)
  const login = useAuthStore((s) => s.login)
  const [step, setStep] = useState(1)
  const [name, setName] = useState("")
  const [desc, setDesc] = useState("")
  const [category, setCategory] = useState("")
  const [loading, setLoading] = useState(false)

  // Proteger la ruta - solo OWNER sin proyecto puede acceder
  useEffect(() => {
    hydrate()
  }, [hydrate])

  useEffect(() => {
    if (!hydrated) return

    // Si no hay sesión, redirigir a login
    if (!session) {
      router.replace("/auth/login")
      return
    }

    // Si no es OWNER, redirigir según su rol
    if (session.user.role !== "owner") {
      if (session.user.role === "employee") {
        router.replace("/work/my-tasks")
      } else if (session.user.role === "superadmin") {
        router.replace("/admin")
      } else {
        router.replace("/auth/login")
      }
      return
    }

    // Si es OWNER pero ya tiene proyecto, redirigir al dashboard
    if (session.project) {
      router.replace("/app/dashboard")
      return
    }
  }, [session, hydrated, router])

  // Mostrar loader mientras se verifica la autenticación
  if (!hydrated || !session) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  async function handleCreate() {
    if (!name.trim() || !session?.user) return
    
    setLoading(true)
    
    try {
      const result = await createProjectService({
        name: name.trim(),
        description: desc.trim() || undefined,
        category: category.trim() || undefined,
      })
      
      if (!result.success || !result.data) {
        toast.error(result.error || "Error al crear el proyecto")
        setLoading(false)
        return
      }
      
      // Actualizar la sesión con el proyecto creado
      const updatedSession = {
        ...session,
        project: result.data.project,
        membership: {
          id: `mem-${result.data.project.id}`,
          user_id: session.user.id,
          project_id: result.data.project.id.toString(),
          role: "owner" as const,
          status: "active" as const,
          joined_at: new Date().toISOString(),
        }
      }
      
      login(updatedSession)
      
      toast.success("Proyecto creado exitosamente")
      
      // Redirigir al dashboard
      router.push("/app/dashboard")
      router.refresh() // Forzar refresh de la página
    } catch (error) {
      console.error("Error creating project:", error)
      toast.error("Error al crear el proyecto")
      setLoading(false)
    }
  }

  return (
    <div className="relative min-h-screen w-full overflow-hidden">
      {/* Fondo animado con gradiente - ocupa toda la pantalla */}
      <div className="fixed inset-0 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-950 dark:to-indigo-950">
        {/* Círculos animados */}
        <div className="absolute top-0 left-0 w-96 h-96 bg-blue-400/20 dark:bg-blue-600/20 rounded-full mix-blend-multiply dark:mix-blend-lighten filter blur-3xl animate-blob" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-400/20 dark:bg-purple-600/20 rounded-full mix-blend-multiply dark:mix-blend-lighten filter blur-3xl animate-blob animation-delay-2000" />
        <div className="absolute bottom-0 left-1/2 w-96 h-96 bg-indigo-400/20 dark:bg-indigo-600/20 rounded-full mix-blend-multiply dark:mix-blend-lighten filter blur-3xl animate-blob animation-delay-4000" />
      </div>

      {/* Contenido centrado */}
      <div className="relative z-10 flex min-h-screen items-center justify-center px-4 py-8">
        <div className="w-full max-w-lg">
          {/* Progress */}
          <div className="mb-8 flex items-center justify-center gap-3">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex items-center gap-3">
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold transition-colors ${
                    step > s
                      ? "bg-primary text-primary-foreground"
                      : step === s
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground"
                  }`}
                >
                  {step > s ? <CheckCircle2 className="h-4 w-4" /> : s}
                </div>
                {s < 3 && <div className={`h-px w-12 ${step > s ? "bg-primary" : "bg-border"}`} />}
              </div>
            ))}
          </div>

          <Card className="border shadow-2xl backdrop-blur-sm bg-background/95">
            <CardHeader className="text-center">
              <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
                {step === 3 ? <Sparkles className="h-7 w-7" /> : <FolderKanban className="h-7 w-7" />}
              </div>
              <CardTitle className="text-2xl">
                {step === 1 && "Bienvenido a ProGest"}
                {step === 2 && "Describe tu proyecto"}
                {step === 3 && "Elige una categoria"}
              </CardTitle>
              <CardDescription>
                {step === 1 && "Vamos a configurar tu primer proyecto. Solo toma un minuto."}
                {step === 2 && "Una buena descripcion ayuda a tu equipo a entender los objetivos."}
                {step === 3 && "Selecciona la categoria que mejor represente tu proyecto."}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-6">
              {step === 1 && (
                <>
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="project-name">Nombre del Proyecto</Label>
                    <Input
                      id="project-name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Ej: Campana Marketing Q1 2026"
                      autoFocus
                    />
                  </div>
                  <Button onClick={() => setStep(2)} disabled={!name.trim()} className="w-full gap-2">
                    Siguiente <ArrowRight className="h-4 w-4" />
                  </Button>
                </>
              )}
              {step === 2 && (
                <>
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="project-desc">Descripcion (opcional)</Label>
                    <Textarea
                      id="project-desc"
                      value={desc}
                      onChange={(e) => setDesc(e.target.value)}
                      placeholder="Describe los objetivos, alcance o contexto del proyecto..."
                      rows={4}
                    />
                  </div>
                  <div className="flex gap-3">
                    <Button variant="outline" onClick={() => setStep(1)} className="flex-1">
                      Atras
                    </Button>
                    <Button onClick={() => setStep(3)} className="flex-1 gap-2">
                      Siguiente <ArrowRight className="h-4 w-4" />
                    </Button>
                  </div>
                </>
              )}
              {step === 3 && (
                <>
                  <div className="grid grid-cols-2 gap-2">
                    {categories.map((cat) => (
                      <button
                        key={cat}
                        onClick={() => setCategory(cat)}
                        className={`rounded-lg border px-4 py-3 text-sm font-medium transition-all ${
                          category === cat
                            ? "border-primary bg-primary/10 text-primary"
                            : "border-border bg-card text-foreground hover:border-primary/40"
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                  <div className="flex gap-3">
                    <Button variant="outline" onClick={() => setStep(2)} className="flex-1" disabled={loading}>
                      Atras
                    </Button>
                    <Button onClick={handleCreate} className="flex-1 gap-2" disabled={loading}>
                      {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Crear Proyecto <Sparkles className="h-4 w-4" />
                    </Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          <p className="mt-4 text-center text-xs text-muted-foreground">
            Siempre puedes editar esta informacion despues en la configuracion del proyecto.
          </p>
        </div>
      </div>
    </div>
  )
}
