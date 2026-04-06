"use client"

import { useEffect, useMemo, useState } from "react"
import { useAuthStore } from "@/stores/authStore"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Switch } from "@/components/ui/switch"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { updateMeService } from "@/services/authService"
import { 
  CircleCheck, 
  Sparkles, 
  Loader2, 
  ArrowRight, 
  ArrowLeft,
  AlertCircle, 
  Wand2,
  UserCircle,
  Key,
  Check
} from "lucide-react"
import { createProjectService } from "@/services/projectService"
import { toast } from "sonner"
import { BOTTTs_NEUTRAL_AVATARS } from "@/lib/avatars"
import { cn } from "@/lib/utils"

const categories = [
  "Marketing", "Tecnologia", "Educacion", "Salud", 
  "Finanzas", "Operaciones", "Consultoria", "Otro"
]

const mexicoTimezones = [
  { id: "America/Mexico_City", label: "CDMX / Centro" },
  { id: "America/Cancun", label: "Cancún" },
  { id: "America/Mazatlan", label: "Pacífico Norte" },
  { id: "America/Hermosillo", label: "Sonora" },
  { id: "America/Tijuana", label: "Noroeste" },
]

const mexicoStatesByTimezone: Record<string, string[]> = {
  "America/Mexico_City": [
    "Aguascalientes", "Chiapas", "Ciudad de Mexico", "Coahuila", "Colima", "Guanajuato", 
    "Guerrero", "Hidalgo", "Jalisco", "Mexico", "Michoacan", "Morelos", "Nuevo Leon", 
    "Oaxaca", "Puebla", "Queretaro", "San Luis Potosi", "Tabasco", "Tamaulipas", 
    "Tlaxcala", "Veracruz", "Zacatecas"
  ],
  "America/Cancun": ["Campeche", "Quintana Roo", "Yucatan"],
  "America/Mazatlan": ["Baja California Sur", "Chihuahua", "Durango", "Nayarit", "Sinaloa"],
  "America/Hermosillo": ["Sonora"],
  "America/Tijuana": ["Baja California"],
}

const themeOptions = [
  { id: "barney", label: "Barney" },
  { id: "firewatch", label: "Firewatch" },
  { id: "citrus", label: "Citrus" },
  { id: "marsh", label: "Marsh" },
  { id: "frost", label: "Frost" },
  { id: "slate", label: "Slate" },
  { id: "candy", label: "Candy" },
]

const schema = z.object({
  name: z.string().trim().min(3, "El nombre debe tener al menos 3 caracteres").max(60, "Máximo 60 caracteres"),
  description: z.string().trim().min(20, "Minimo 20 caracteres").max(800, "Máximo 800 caracteres"),
  category: z.string().min(1, "Selecciona una categoria"),
  otherCategory: z.string().trim().max(50).optional(),
  timezone: z.string().trim().min(1, "Selecciona una zona horaria"),
  state: z.string().trim().min(1, "Selecciona el estado"),
  tasks_retention_days: z.number().int().min(0).max(365),
  sprint_enabled: z.boolean(),
  sprint_length_days: z.number().int().min(7).max(30),
  avatar: z.string().min(1, "Selecciona un avatar"),
  preferred_theme: z.string().min(1),
}).superRefine((d, ctx) => {
  if (d.category === "Otro" && (!d.otherCategory || d.otherCategory.trim().length < 2)) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["otherCategory"], message: "Especifica la categoria" })
  }
})

type FormData = z.infer<typeof schema>

export default function OnboardingPage() {
  const router = useRouter()
  const { session, hydrated, hydrate, login } = useAuthStore()
  const [step, setStep] = useState<1 | 2 | 3>(1)
  const [loading, setLoading] = useState(false)
  const [isRotating, setIsRotating] = useState(false)
  const [activeTheme, setActiveTheme] = useState("barney")

  const { register, handleSubmit, setValue, watch, trigger, clearErrors, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    mode: "onBlur",
    defaultValues: {
      name: "",
      description: "",
      category: "",
      otherCategory: "",
      timezone: "America/Mexico_City",
      state: "",
      tasks_retention_days: 30,
      sprint_enabled: true,
      sprint_length_days: 14,
      avatar: "",
      preferred_theme: "barney",
    },
  })

  // Sincronizar tema con hook-form
  useEffect(() => {
    setValue("preferred_theme", activeTheme)
  }, [activeTheme, setValue])

  const nameValue = watch("name")
  const descriptionValue = watch("description")
  const selectedCategory = watch("category")
  const selectedAvatar = watch("avatar")
  const timezoneValue = watch("timezone")
  const stateValue = watch("state")
  const sprintEnabledValue = watch("sprint_enabled")

  const errorMessages = useMemo(() => {
    return Array.from(new Set(Object.values(errors).map(e => e?.message).filter(m => !!m)))
  }, [errors])

  useEffect(() => { hydrate() }, [hydrate])

  useEffect(() => {
    if (!hydrated) return
    if (!session) { router.replace("/auth/login"); return }
    if (session.user.role !== "owner") {
      router.replace(session.user.role === "employee" ? "/work/my-tasks" : "/admin")
      return
    }
    if (session.project) { router.replace("/app/dashboard"); return }
  }, [session, hydrated, router])

  const availableStates = useMemo(() => mexicoStatesByTimezone[timezoneValue] || [], [timezoneValue])

  if (!hydrated || !session) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  const rotateAndSetStep = async (nextStep: 1 | 2 | 3, fields: (keyof FormData)[]) => {
    clearErrors()
    const ok = await trigger(fields)
    if (!ok) return
    
    setIsRotating(true)
    setTimeout(() => setStep(nextStep), 600)
    setTimeout(() => setIsRotating(false), 1200)
  }

  async function onFinish(data: FormData) {
    setLoading(true)
    try {
      // 1. Actualizar perfil (Avatar + Tema)
      const profileResult = await updateMeService({ 
        avatar: data.avatar,
        preferred_theme: data.preferred_theme 
      })
      
      if (!profileResult.success) {
        toast.error(profileResult.error || "No se pudo guardar tu perfil")
        setLoading(false)
        return
      }

      // 2. Crear Proyecto
      const categoryToSend = data.category === "Otro" ? data.otherCategory || "" : data.category
      const projectResult = await createProjectService({
        name: data.name.trim(),
        description: data.description.trim(),
        category: categoryToSend.trim(),
        timezone: data.timezone.trim(),
        date_format: "dd/MM/yyyy",
        state: data.state.trim(),
        tasks_retention_days: data.tasks_retention_days,
        sprint_enabled: data.sprint_enabled,
        sprint_length_days: data.sprint_length_days,
      })

      if (!projectResult.success || !projectResult.project) {
        toast.error(projectResult.error || "Error al crear el proyecto")
        setLoading(false)
        return
      }

      const updatedSession = {
        ...session!,
        user: { ...session!.user, avatar: data.avatar, preferred_theme: data.preferred_theme },
        project: projectResult.project,
        membership: {
          id: `mem-${projectResult.project.id}`,
          user_id: session!.user.id,
          project_id: projectResult.project.id,
          role: "owner" as const,
          status: "active" as const,
          joined_at: new Date().toISOString(),
        },
        access_token: session!.access_token,
        refresh_token: session!.refresh_token,
      } as any // Cast to any temporarily to avoid complex session mapping issues in this step

      login(updatedSession)
      toast.success("Perfil y Proyecto creados con éxito.")
      router.push("/app/dashboard")
    } catch {
      toast.error("Error crítico durante el onboarding")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={cn("onboarding-wrapper", activeTheme)}>
      <style jsx global>{`
        :root {
          --barney-start: #8e2de2; --barney-stop: #4a00e0; --barney-bg: #250070;
          --slate-start: #606c88; --slate-stop: #3f4c6b; --slate-bg: #343e58;
          --candy-start: #009fff; --candy-stop: #ec2f4b; --candy-bg: #00293d;
          --firewatch-start: #ef473a; --firewatch-stop: #cb2d3e; --firewatch-bg: #8f150c;
          --citrus-start: #fdc012; --citrus-stop: #f37335; --citrus-bg: #c0560c;
          --marsh-start: #8dc26f; --marsh-stop: #76b852; --marsh-bg: #518336;
          --frost-start: #004e92; --frost-stop: #000d7a; --frost-bg: #00052d;
        }

        .onboarding-wrapper {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          transition: background-color 600ms ease-in-out;
          font-family: inherit;
          padding: 2rem;
          perspective: 1000px;
        }

        .onboarding-wrapper.barney { background-color: var(--barney-bg); --start: var(--barney-start); --stop: var(--barney-stop); }
        .onboarding-wrapper.slate { background-color: var(--slate-bg); --start: var(--slate-start); --stop: var(--slate-stop); }
        .onboarding-wrapper.candy { background-color: var(--candy-bg); --start: var(--candy-start); --stop: var(--candy-stop); }
        .onboarding-wrapper.firewatch { background-color: var(--firewatch-bg); --start: var(--firewatch-start); --stop: var(--firewatch-stop); }
        .onboarding-wrapper.citrus { background-color: var(--citrus-bg); --start: var(--citrus-start); --stop: var(--citrus-stop); }
        .onboarding-wrapper.marsh { background-color: var(--marsh-bg); --start: var(--marsh-start); --stop: var(--marsh-stop); }
        .onboarding-wrapper.frost { background-color: var(--frost-bg); --start: var(--frost-start); --stop: var(--frost-stop); }

        .theme-picker {
          background: rgba(0,0,0,0.4);
          padding: 8px;
          border-radius: 12px;
          display: flex;
          gap: 10px;
          margin-bottom: 40px;
          backdrop-blur: 8px;
        }

        .theme-dot {
          width: 28px;
          height: 28px;
          border-radius: 6px;
          cursor: pointer;
          transition: transform 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
        }

        .theme-dot:hover { transform: scale(1.15); }
        .theme-dot.active { box-shadow: 0 0 0 2px white; }

        .theme-dot.barney { background: linear-gradient(135deg, var(--barney-start), var(--barney-stop)); }
        .theme-dot.slate { background: linear-gradient(135deg, var(--slate-start), var(--slate-stop)); }
        .theme-dot.candy { background: linear-gradient(135deg, var(--candy-start), var(--candy-stop)); }
        .theme-dot.firewatch { background: linear-gradient(135deg, var(--firewatch-start), var(--firewatch-stop)); }
        .theme-dot.citrus { background: linear-gradient(135deg, var(--citrus-start), var(--citrus-stop)); }
        .theme-dot.marsh { background: linear-gradient(135deg, var(--marsh-start), var(--marsh-stop)); }
        .theme-dot.frost { background: linear-gradient(135deg, var(--frost-start), var(--frost-stop)); }

        .form-3d {
          background: linear-gradient(225deg, var(--start) 16%, var(--stop) 100%);
          width: 100%;
          max-width: 440px;
          border-radius: 16px;
          padding: 32px;
          box-shadow: 0 25px 50px -12px rgba(0,0,0,0.5);
          transform-style: preserve-3d;
          transition: transform 1200ms ease;
          color: white;
        }

        .form-3d.rotating { animation: rotate3D 1200ms linear; }

        @keyframes rotate3D {
          0% { transform: rotateY(0deg); }
          100% { transform: rotateY(360deg); }
        }

        .form-content { transform: translateZ(40px); }

        .input-glass {
          background: rgba(0,0,0,0.25) !important;
          border: 1px solid rgba(255,255,255,0.1) !important;
          color: white !important;
          border-radius: 8px !important;
        }
        .input-glass:focus { background: rgba(0,0,0,0.4) !important; border-color: rgba(255,255,255,0.3) !important; }

        .btn-submit {
          background: rgba(255,255,255,0.15);
          border: 1px solid rgba(255,255,255,0.2);
          color: white;
          width: 100%;
          padding: 12px;
          border-radius: 8px;
          font-weight: 600;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          transition: all 0.2s;
        }
        .btn-submit:hover { background: rgba(255,255,255,0.25); transform: translateY(-1px); }
        .btn-submit:active { transform: translateY(0); }
      `}</style>

      {/* Theme Picker */}
      <div className="theme-picker">
        {themeOptions.map(t => (
          <div 
            key={t.id} 
            className={cn("theme-dot", t.id, activeTheme === t.id && "active")}
            onClick={() => setActiveTheme(t.id)}
            title={t.label}
          >
            {activeTheme === t.id && <Check size={14} />}
          </div>
        ))}
      </div>

      {/* Main 3D Form */}
      <div className={cn("form-3d", isRotating && "rotating")}>
        <form onSubmit={handleSubmit(onFinish)} className="form-content space-y-6">
          <div className="text-center space-y-2">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-md text-white">
              {step === 3 ? <UserCircle className="h-9 w-9" /> : <Sparkles className="h-9 w-9" />}
            </div>
            <h1 className="text-3xl font-bold tracking-tight">
              {step === 1 && "Dale identidad"}
              {step === 2 && "Categoría y Región"}
              {step === 3 && "Tu Perfil"}
            </h1>
            <p className="text-white/70 text-sm">
              {step === 1 && "Empecemos con el nombre de tu nuevo espacio."}
              {step === 2 && "Configura donde opera tu gran proyecto."}
              {step === 3 && "Elige como te verán los demás miembros."}
            </p>
          </div>

          <div className="space-y-4 pt-4">
            {step === 1 && (
              <>
                <div className="space-y-2">
                  <Label className="text-white/90">Nombre del Proyecto</Label>
                  <Input 
                    {...register("name")} 
                    className="input-glass" 
                    placeholder="Ej: Innovación 2026"
                  />
                  {errors.name && <p className="text-xs text-red-200 mt-1">{errors.name.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label className="text-white/90">Descripción</Label>
                  <Textarea 
                    {...register("description")} 
                    className="input-glass min-h-[100px]" 
                    placeholder="¿Cuál es el objetivo principal?"
                  />
                  {errors.description && <p className="text-xs text-red-200 mt-1">{errors.description.message}</p>}
                </div>
                <button type="button" onClick={() => rotateAndSetStep(2, ["name", "description"])} className="btn-submit">
                  Siguiente <ArrowRight size={18} />
                </button>
              </>
            )}

            {step === 2 && (
              <>
                <div className="grid grid-cols-2 gap-2">
                  {categories.map(cat => (
                    <button
                      type="button" key={cat}
                      onClick={() => setValue("category", cat)}
                      className={cn(
                        "rounded-lg border border-white/10 px-3 py-2 text-xs font-medium transition-all",
                        selectedCategory === cat ? "bg-white/30 border-white/40" : "bg-white/5 hover:bg-white/10"
                      )}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label className="text-white/90">Zona Horaria</Label>
                    <Select value={timezoneValue} onValueChange={(v) => setValue("timezone", v)}>
                      <SelectTrigger className="input-glass"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {mexicoTimezones.map(tz => <SelectItem key={tz.id} value={tz.id}>{tz.label}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-white/90">Estado</Label>
                    <Select value={stateValue} onValueChange={(v) => setValue("state", v)}>
                      <SelectTrigger className="input-glass font-medium"><SelectValue placeholder="Estado..." /></SelectTrigger>
                      <SelectContent>
                        {availableStates.map(st => <SelectItem key={st} value={st}>{st}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 rounded-lg bg-black/20">
                  <span className="text-sm">Habilitar Sprints</span>
                  <Switch checked={sprintEnabledValue} onCheckedChange={(v) => setValue("sprint_enabled", v)} />
                </div>

                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setStep(1)} className="btn-submit bg-white/5">
                    <ArrowLeft size={18} />
                  </button>
                  <button type="button" onClick={() => rotateAndSetStep(3, ["category", "timezone", "state"])} className="btn-submit flex-1">
                    Siguiente <ArrowRight size={18} />
                  </button>
                </div>
              </>
            )}

            {step === 3 && (
              <>
                <div className="space-y-3">
                  <Label className="text-white/90">Tu Avatar</Label>
                  <div className="flex flex-wrap justify-center gap-2">
                    {BOTTTs_NEUTRAL_AVATARS.map(a => (
                      <div 
                        key={a.id} 
                        onClick={() => setValue("avatar", a.src)}
                        className={cn(
                          "cursor-pointer rounded-full p-1 transition-transform border-2",
                          selectedAvatar === a.src ? "border-white" : "border-transparent opacity-60 grayscale-[0.5]"
                        )}
                      >
                        <img src={a.src} alt="avatar" className="h-10 w-10 rounded-full bg-white/10" />
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-black/20 p-4 rounded-xl space-y-1">
                  <p className="text-[10px] text-white/50 uppercase tracking-widest">Resumen</p>
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-full border border-white/20 p-1">
                      <img src={selectedAvatar || BOTTTs_NEUTRAL_AVATARS[0].src} className="h-full w-full rounded-full" alt="" />
                    </div>
                    <div>
                      <p className="font-bold">{nameValue || "Sin nombre"}</p>
                      <p className="text-xs text-white/60">{selectedCategory || "Sin categoria"}</p>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setStep(2)} className="btn-submit bg-white/5">
                    <ArrowLeft size={18} />
                  </button>
                  <button type="submit" disabled={loading} className="btn-submit flex-1 bg-white/30">
                    {loading ? <Loader2 className="animate-spin" size={18} /> : "Crear Espacio"}
                  </button>
                </div>
              </>
            )}
          </div>
        </form>
      </div>

      <p className="mt-8 text-white/40 text-[11px] font-medium tracking-wide">PROGEST • SISTEMA DE GESTIÓN AVANZADA</p>
    </div>
  )
}
