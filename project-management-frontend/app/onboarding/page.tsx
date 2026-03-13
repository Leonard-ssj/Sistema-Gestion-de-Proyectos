"use client"

import { useEffect, useMemo, useState } from "react"
import { useAuthStore } from "@/stores/authStore"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
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
import { OnboardingAnimatedBackground } from "@/components/marketing/onboarding-animated-background"
import { updateMeService } from "@/services/authService"
import { CircleCheck, Sparkles, Loader2, ArrowRight, AlertCircle, Wand2 } from "lucide-react"
import { createProjectService } from "@/services/projectService"
import { toast } from "sonner"
import { BOTTTs_NEUTRAL_AVATARS } from "@/lib/avatars"

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

const mexicoTimezones = [
  { id: "America/Mexico_City", label: "CDMX / Centro (America/Mexico_City)" },
  { id: "America/Cancun", label: "Cancún (America/Cancun)" },
  { id: "America/Mazatlan", label: "Pacífico Norte (America/Mazatlan)" },
  { id: "America/Hermosillo", label: "Sonora (America/Hermosillo)" },
  { id: "America/Tijuana", label: "Noroeste / Tijuana (America/Tijuana)" },
]

const mexicoStates = [
  "Aguascalientes",
  "Baja California",
  "Baja California Sur",
  "Campeche",
  "Chiapas",
  "Chihuahua",
  "Ciudad de Mexico",
  "Coahuila",
  "Colima",
  "Durango",
  "Guanajuato",
  "Guerrero",
  "Hidalgo",
  "Jalisco",
  "Mexico",
  "Michoacan",
  "Morelos",
  "Nayarit",
  "Nuevo Leon",
  "Oaxaca",
  "Puebla",
  "Queretaro",
  "Quintana Roo",
  "San Luis Potosi",
  "Sinaloa",
  "Sonora",
  "Tabasco",
  "Tamaulipas",
  "Tlaxcala",
  "Veracruz",
  "Yucatan",
  "Zacatecas",
]

const mexicoStatesByTimezone: Record<string, string[]> = {
  "America/Mexico_City": [
    "Aguascalientes",
    "Chiapas",
    "Ciudad de Mexico",
    "Coahuila",
    "Colima",
    "Guanajuato",
    "Guerrero",
    "Hidalgo",
    "Jalisco",
    "Mexico",
    "Michoacan",
    "Morelos",
    "Nuevo Leon",
    "Oaxaca",
    "Puebla",
    "Queretaro",
    "San Luis Potosi",
    "Tabasco",
    "Tamaulipas",
    "Tlaxcala",
    "Veracruz",
    "Zacatecas",
  ],
  "America/Cancun": ["Campeche", "Quintana Roo", "Yucatan"],
  "America/Mazatlan": ["Baja California Sur", "Chihuahua", "Durango", "Nayarit", "Sinaloa"],
  "America/Hermosillo": ["Sonora"],
  "America/Tijuana": ["Baja California"],
}

const schema = z.object({
  name: z.string().trim().min(3, "El nombre debe tener al menos 3 caracteres").max(60, "El nombre no puede superar 60 caracteres"),
  description: z.string().trim().min(20, "La descripcion debe tener al menos 20 caracteres").max(800, "La descripcion no puede superar 800 caracteres"),
  category: z.string().min(1, "Selecciona una categoria"),
  otherCategory: z.string().trim().max(50, "La categoria no puede superar 50 caracteres").optional(),
  timezone: z.string().trim().min(1, "Selecciona una zona horaria de Mexico").max(64),
  state: z.string().trim().min(1, "Selecciona el estado de Mexico"),
  tasks_retention_days: z.number().int().min(0, "Minimo 0 dias").max(365, "Maximo 365 dias"),
  sprint_enabled: z.boolean(),
  sprint_length_days: z.number().int().min(7, "Minimo 7 dias").max(30, "Maximo 30 dias"),
  avatar: z.string().min(1, "Selecciona un avatar"),
}).superRefine((d, ctx) => {
  if (d.category === "Otro") {
    if (!d.otherCategory || d.otherCategory.trim().length < 2) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["otherCategory"],
        message: "Especifica la categoria (minimo 2 caracteres)",
      })
    }
  }

  const allowedStates = mexicoStatesByTimezone[d.timezone] || []
  if (allowedStates.length > 0 && !allowedStates.includes(d.state)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["state"],
      message: "El estado no corresponde a la zona horaria seleccionada",
    })
  }

  if (d.sprint_enabled && !d.sprint_length_days) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["sprint_length_days"],
      message: "Indica la duracion del sprint",
    })
  }
})

type FormData = z.infer<typeof schema>

export default function OnboardingPage() {
  const router = useRouter()
  const session = useAuthStore((s) => s.session)
  const hydrated = useAuthStore((s) => s.hydrated)
  const hydrate = useAuthStore((s) => s.hydrate)
  const login = useAuthStore((s) => s.login)
  const [step, setStep] = useState<1 | 2 | 3>(1)
  const [loading, setLoading] = useState(false)

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    trigger,
    clearErrors,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    mode: "onBlur",
    reValidateMode: "onChange",
    defaultValues: {
      name: "",
      description: "",
      category: "",
      otherCategory: "",
      timezone: "",
      state: "",
      tasks_retention_days: 30,
      sprint_enabled: true,
      sprint_length_days: 14,
      avatar: "",
    },
  })

  const selectedCategory = watch("category")
  const selectedAvatar = watch("avatar")
  const timezoneValue = watch("timezone")
  const stateValue = watch("state")
  const tasksRetentionDaysValue = watch("tasks_retention_days")
  const sprintEnabledValue = watch("sprint_enabled")
  const sprintLengthDaysValue = watch("sprint_length_days")
  const nameValue = watch("name")
  const descriptionValue = watch("description")
  const otherCategoryValue = watch("otherCategory") || ""

  const errorMessages = useMemo(() => {
    const msgs = Object.values(errors)
      .map((e) => e?.message)
      .filter((m): m is string => typeof m === "string" && m.length > 0)
    return Array.from(new Set(msgs))
  }, [errors])

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

  useEffect(() => {
    if (!hydrated) return
    if (!timezoneValue) {
      const detected = Intl.DateTimeFormat().resolvedOptions().timeZone
      const match = mexicoTimezones.find((t) => t.id === detected)
      if (match) {
        setValue("timezone", match.id, { shouldValidate: true })
      } else {
        setValue("timezone", "America/Mexico_City", { shouldValidate: true })
      }
    }
  }, [hydrated, timezoneValue, setValue])

  const availableStates = useMemo(() => {
    const list = mexicoStatesByTimezone[timezoneValue] || []
    return list.length > 0 ? list : mexicoStates
  }, [timezoneValue])

  useEffect(() => {
    if (!stateValue) return
    if (!availableStates.includes(stateValue)) {
      setValue("state", "", { shouldValidate: true })
    }
  }, [availableStates, stateValue, setValue])

  // Mostrar loader mientras se verifica la autenticación
  if (!hydrated || !session) {
    return (
      <div className="relative flex min-h-screen items-center justify-center bg-background">
        <OnboardingAnimatedBackground />
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  async function goNextFromBasics() {
    clearErrors()
    const ok = await trigger(["name", "description"])
    if (!ok) return
    setStep(2)
  }

  async function goNextFromCategory() {
    clearErrors()
    const ok = await trigger(
      selectedCategory === "Otro"
        ? ["category", "otherCategory", "timezone", "state", "tasks_retention_days", "sprint_enabled", "sprint_length_days"]
        : ["category", "timezone", "state", "tasks_retention_days", "sprint_enabled", "sprint_length_days"]
    )
    if (!ok) return
    setStep(3)
  }

  async function onFinish(data: FormData) {
    if (!session?.user) return

    setLoading(true)
    try {
      const avatarResult = await updateMeService({ avatar: data.avatar })
      if (!avatarResult.success || !avatarResult.user) {
        toast.error(avatarResult.error || "No se pudo guardar tu avatar")
        setLoading(false)
        return
      }

      const categoryToSend = data.category === "Otro" ? (data.otherCategory || "").trim() : data.category.trim()

      const projectResult = await createProjectService({
        name: data.name.trim(),
        description: data.description.trim(),
        category: categoryToSend,
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
        ...session,
        user: {
          ...session.user,
          avatar: avatarResult.user.avatar || "",
        },
        project: projectResult.project,
        membership: {
          id: `mem-${projectResult.project.id}`,
          user_id: session.user.id,
          project_id: projectResult.project.id,
          role: "owner" as const,
          status: "active" as const,
          joined_at: new Date().toISOString(),
        },
      }

      login(updatedSession)
      toast.success("Todo listo. Bienvenido a tu espacio de trabajo.")
      router.push("/app/dashboard")
      router.refresh()
    } catch {
      toast.error("No se pudo completar el onboarding")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative min-h-screen w-full overflow-hidden">
      <OnboardingAnimatedBackground />

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
                  {step > s ? <CircleCheck className="h-4 w-4" /> : s}
                </div>
                {s < 3 && <div className={`h-px w-12 ${step > s ? "bg-primary" : "bg-border"}`} />}
              </div>
            ))}
          </div>

          <Card className="border shadow-2xl backdrop-blur-sm bg-background/95">
            <CardHeader className="text-center">
              <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
                {step === 3 ? <Wand2 className="h-7 w-7" /> : <Sparkles className="h-7 w-7" />}
              </div>
              <CardTitle className="text-2xl">
                {step === 1 && "Dale identidad a tu proyecto"}
                {step === 2 && "Elige una categoria"}
                {step === 3 && "Personaliza tu perfil"}
              </CardTitle>
              <CardDescription>
                {step === 1 && "Unos segundos ahora te ahorran horas despues. Empecemos con lo basico."}
                {step === 2 && "La categoria mejora filtros, reportes y automatizaciones futuras."}
                {step === 3 && "Un toque personal. Esto aparecera en tu panel y en el equipo."}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-6">
              {errorMessages.length > 0 && (
                <Alert variant="destructive">
                  <AlertCircle />
                  <AlertTitle>Falta informacion</AlertTitle>
                  <AlertDescription>
                    <ul className="list-disc pl-4">
                      {errorMessages.map((m) => (
                        <li key={m}>{m}</li>
                      ))}
                    </ul>
                  </AlertDescription>
                </Alert>
              )}

              <form onSubmit={handleSubmit(onFinish)} className="flex flex-col gap-6">
                {step === 1 && (
                  <>
                    <div className="flex flex-col gap-2">
                      <Label htmlFor="project-name">Nombre del Proyecto</Label>
                      <Input
                        id="project-name"
                        placeholder="Ej: Auditoria Financiera Q1 2026"
                        autoFocus
                        maxLength={60}
                        aria-invalid={!!errors.name}
                        aria-describedby={errors.name ? "project-name-error" : "project-name-help"}
                        {...register("name")}
                      />
                      {errors.name ? (
                        <p id="project-name-error" className="text-sm text-destructive">{errors.name.message}</p>
                      ) : (
                        <p id="project-name-help" className="text-xs text-muted-foreground">
                          Usa un nombre corto y claro. Este nombre se vera en el dashboard, tablero y reportes.
                        </p>
                      )}
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] text-muted-foreground">Nombre comercial y reconocible para tu equipo.</span>
                        <span className="text-[11px] text-muted-foreground">{Math.min(nameValue.trim().length, 9999)}/60</span>
                      </div>
                    </div>

                    <div className="flex flex-col gap-2">
                      <Label htmlFor="project-desc">Descripcion</Label>
                      <Textarea
                        id="project-desc"
                        placeholder="Describe el objetivo del proyecto, alcance, entregables y fechas clave..."
                        rows={4}
                        maxLength={800}
                        aria-invalid={!!errors.description}
                        aria-describedby={errors.description ? "project-desc-error" : "project-desc-help"}
                        {...register("description")}
                      />
                      {errors.description ? (
                        <p id="project-desc-error" className="text-sm text-destructive">{errors.description.message}</p>
                      ) : (
                        <p id="project-desc-help" className="text-xs text-muted-foreground">
                          La descripcion ayuda a tu equipo a alinearse. Piensa en objetivos, restricciones y resultado esperado.
                        </p>
                      )}
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] text-muted-foreground">Minimo 20 caracteres.</span>
                        <span className="text-[11px] text-muted-foreground">{Math.min(descriptionValue.trim().length, 9999)}/800</span>
                      </div>
                    </div>

                    <Button type="button" onClick={goNextFromBasics} className="w-full gap-2">
                      Siguiente <ArrowRight className="h-4 w-4" />
                    </Button>
                  </>
                )}

                {step === 2 && (
                  <>
                    <div className="grid grid-cols-2 gap-2">
                      {categories.map((cat) => (
                        <button
                          type="button"
                          key={cat}
                          onClick={() => {
                            setValue("category", cat, { shouldValidate: true })
                            if (cat !== "Otro") setValue("otherCategory", "", { shouldValidate: true })
                          }}
                          className={`rounded-lg border px-4 py-3 text-sm font-medium transition-all ${
                            selectedCategory === cat
                              ? "border-primary bg-primary/10 text-primary"
                              : "border-border bg-card text-foreground hover:border-primary/40"
                          }`}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>

                    {selectedCategory === "Otro" && (
                      <div className="flex flex-col gap-2">
                        <Label htmlFor="other-category">Cual categoria?</Label>
                        <Input
                          id="other-category"
                          placeholder="Ej: Legal, Logistica, Construccion..."
                          maxLength={50}
                          aria-invalid={!!errors.otherCategory}
                          aria-describedby={errors.otherCategory ? "other-category-error" : undefined}
                          {...register("otherCategory")}
                        />
                        {errors.otherCategory && <p id="other-category-error" className="text-sm text-destructive">{errors.otherCategory.message}</p>}
                        <div className="flex items-center justify-end">
                          <span className="text-[11px] text-muted-foreground">{Math.min(otherCategoryValue.trim().length, 9999)}/50</span>
                        </div>
                      </div>
                    )}

                    {errors.category && <p className="text-sm text-destructive">{errors.category.message}</p>}

                    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                      <div className="flex flex-col gap-2">
                        <Label htmlFor="timezone">Zona horaria</Label>
                        <Select
                          value={timezoneValue}
                          onValueChange={(v) => setValue("timezone", v, { shouldValidate: true })}
                        >
                          <SelectTrigger
                            id="timezone"
                            className="w-full"
                            aria-invalid={!!errors.timezone}
                            aria-describedby={errors.timezone ? "timezone-error" : "timezone-help"}
                          >
                            <SelectValue placeholder="Selecciona zona horaria" />
                          </SelectTrigger>
                          <SelectContent>
                            {mexicoTimezones.map((tz) => (
                              <SelectItem key={tz.id} value={tz.id}>
                                {tz.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {errors.timezone ? (
                          <p id="timezone-error" className="text-sm text-destructive">{errors.timezone.message}</p>
                        ) : (
                          <p id="timezone-help" className="text-[11px] text-muted-foreground">
                            Se usa para reportes, calendario y vencimientos. Detectamos:{" "}
                            {timezoneValue || "America/Mexico_City"}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col gap-2">
                      <Label htmlFor="state">Estado de Mexico</Label>
                      <Select
                        value={stateValue}
                        onValueChange={(v) => setValue("state", v, { shouldValidate: true })}
                      >
                        <SelectTrigger
                          id="state"
                          className="w-full"
                          aria-invalid={!!errors.state}
                          aria-describedby={errors.state ? "state-error" : undefined}
                        >
                          <SelectValue placeholder="Selecciona el estado donde opera este proyecto" />
                        </SelectTrigger>
                        <SelectContent>
                          {availableStates.map((st) => (
                            <SelectItem key={st} value={st}>
                              {st}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {errors.state && <p id="state-error" className="text-sm text-destructive">{errors.state.message}</p>}
                    </div>

                    <div className="grid gap-4 rounded-xl border bg-muted/40 p-4">
                      <div className="grid gap-2">
                        <Label htmlFor="tasks-retention-days">Retencion de tareas completadas (dias)</Label>
                        <Input
                          id="tasks-retention-days"
                          type="number"
                          min={0}
                          max={365}
                          aria-invalid={!!errors.tasks_retention_days}
                          disabled={loading}
                          {...register("tasks_retention_days", { valueAsNumber: true })}
                        />
                        {errors.tasks_retention_days && (
                          <p className="text-sm text-destructive">{errors.tasks_retention_days.message as any}</p>
                        )}
                        <p className="text-xs text-muted-foreground">
                          Oculta tareas en Done con mas de X dias desde su completado. Usa 0 para no ocultar.
                        </p>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <p className="text-sm font-medium">Habilitar sprints</p>
                          <p className="text-xs text-muted-foreground">Organiza el trabajo en periodos (planned/active/closed)</p>
                        </div>
                        <Switch
                          checked={!!sprintEnabledValue}
                          onCheckedChange={(v) => setValue("sprint_enabled", v, { shouldValidate: true })}
                          disabled={loading}
                        />
                      </div>

                      <div className="grid gap-2">
                        <Label htmlFor="sprint-length-days">Duracion del sprint (dias)</Label>
                        <Input
                          id="sprint-length-days"
                          type="number"
                          min={7}
                          max={30}
                          aria-invalid={!!errors.sprint_length_days}
                          disabled={loading || !sprintEnabledValue}
                          {...register("sprint_length_days", {
                            valueAsNumber: true,
                            onBlur: () => {
                              const v = typeof sprintLengthDaysValue === "number" ? sprintLengthDaysValue : 14
                              const clamped = Math.min(30, Math.max(7, v))
                              if (clamped !== sprintLengthDaysValue) {
                                setValue("sprint_length_days", clamped, { shouldValidate: true })
                              }
                            },
                          })}
                        />
                        {errors.sprint_length_days && (
                          <p className="text-sm text-destructive">{errors.sprint_length_days.message as any}</p>
                        )}
                        <p className="text-xs text-muted-foreground">
                          La duracion y fechas de un sprint creado no se pueden modificar.
                        </p>
                      </div>
                    </div>

                    <p className="text-xs text-muted-foreground">
                      Formato de fecha fijo en todo el sistema: DD/MM/YYYY.
                    </p>

                    <div className="flex gap-3">
                      <Button type="button" variant="outline" onClick={() => setStep(1)} className="flex-1" disabled={loading}>
                        Atras
                      </Button>
                      <Button type="button" onClick={goNextFromCategory} className="flex-1 gap-2" disabled={loading}>
                        Siguiente <ArrowRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </>
                )}

                {step === 3 && (
                  <>
                    <div className="flex flex-col gap-2">
                      <Label>Elige tu avatar</Label>
                      <div className="grid grid-cols-4 gap-2">
                        {BOTTTs_NEUTRAL_AVATARS.map((a) => (
                          <button
                            type="button"
                            key={a.id}
                            onClick={() => setValue("avatar", a.src, { shouldValidate: true })}
                            className={`rounded-xl border p-2 transition-all ${
                              selectedAvatar === a.src ? "border-primary bg-primary/10 shadow-sm" : "border-border bg-card hover:border-primary/40"
                            }`}
                            aria-label={`Seleccionar avatar ${a.seed}`}
                          >
                            <img src={a.src} alt="" className="h-10 w-10 rounded-full" />
                          </button>
                        ))}
                      </div>
                      {errors.avatar && <p className="text-sm text-destructive">{errors.avatar.message}</p>}
                      <p className="text-xs text-muted-foreground">
                        Tu avatar se mostrara en la parte superior del panel y en futuras colaboraciones.
                      </p>
                    </div>

                    <div className="grid gap-4 md:grid-cols-[140px_1fr]">
                      <div className="rounded-xl border bg-muted/40 p-3">
                        <p className="text-xs font-medium text-muted-foreground">Vista previa</p>
                        <div className="mt-3 flex items-center justify-center">
                          <div className="rounded-full bg-gradient-to-br from-primary/40 via-primary/15 to-transparent p-[2px]">
                            <div className="rounded-full bg-background p-[6px]">
                              <img
                                src={selectedAvatar || BOTTTs_NEUTRAL_AVATARS[0].src}
                                alt=""
                                className="h-20 w-20 rounded-full border border-border bg-card"
                              />
                            </div>
                          </div>
                        </div>
                        <p className="mt-3 text-center text-xs text-muted-foreground">
                          {session.user.name}
                        </p>
                      </div>

                      <div className="rounded-xl border bg-muted/40 p-4">
                        <p className="text-sm font-medium">Resumen</p>
                        <div className="mt-2 grid gap-2 text-sm text-muted-foreground">
                          <div>
                            <p className="text-xs text-muted-foreground">Proyecto</p>
                            <p className="text-foreground">{nameValue.trim() || "-"}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Categoria</p>
                            <p className="text-foreground">{(selectedCategory === "Otro" ? otherCategoryValue.trim() : selectedCategory) || "-"}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Descripcion</p>
                            <p className="text-foreground line-clamp-3">{descriptionValue.trim() || "-"}</p>
                          </div>
                          <div className="grid gap-2 md:grid-cols-2">
                            <div>
                              <p className="text-xs text-muted-foreground">Zona horaria</p>
                              <p className="text-foreground">{timezoneValue || "-"}</p>
                            </div>
                            <div className="md:col-span-2">
                              <p className="text-xs text-muted-foreground">Estado</p>
                              <p className="text-foreground">{stateValue || "-"}</p>
                            </div>
                            <div className="md:col-span-2">
                              <p className="text-xs text-muted-foreground">Retencion Done</p>
                              <p className="text-foreground">{typeof tasksRetentionDaysValue === "number" ? `${tasksRetentionDaysValue} dias` : "-"}</p>
                            </div>
                            <div className="md:col-span-2">
                              <p className="text-xs text-muted-foreground">Sprints</p>
                              <p className="text-foreground">
                                {sprintEnabledValue ? `Habilitados (${sprintLengthDaysValue} dias)` : "Deshabilitados"}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <Button type="button" variant="outline" onClick={() => setStep(2)} className="flex-1" disabled={loading}>
                        Atras
                      </Button>
                      <Button type="submit" className="flex-1 gap-2" disabled={loading}>
                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Crear mi espacio
                      </Button>
                    </div>
                  </>
                )}
              </form>
            </CardContent>
          </Card>

          <p className="mt-4 text-center text-xs text-muted-foreground">
            Puedes actualizar nombre, descripcion, categoria y avatar mas adelante.
          </p>
        </div>
      </div>
    </div>
  )
}
