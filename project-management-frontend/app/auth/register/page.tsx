"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { useAuthStore } from "@/stores/authStore"
import { registerService } from "@/services/authService"
import { toast } from "sonner"
import { Loader2, ArrowLeft, ArrowRight } from "lucide-react"
import { Logo } from "@/components/ui/logo"
import { BrutalistInput } from "@/components/ui/brutalist-input"
import { cn } from "@/lib/utils"

const schema = z.object({
  name: z.string().min(2, "Mínimo 2 caracteres"),
  email: z.string().email("Email inválido"),
  password: z.string()
    .min(8, "Mínimo 8 caracteres")
    .regex(/[A-Z]/, "Debe contener al menos una letra mayúscula")
    .regex(/[a-z]/, "Debe contener al menos una letra minúscula")
    .regex(/\d/, "Debe contener al menos un número"),
  confirmPassword: z.string(),
}).refine((d) => d.password === d.confirmPassword, {
  message: "Las contraseñas no coinciden",
  path: ["confirmPassword"],
})

type FormData = z.infer<typeof schema>

export default function RegisterPage() {
  const router = useRouter()
  const login = useAuthStore((s) => s.login)
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const { register, handleSubmit, formState: { errors }, setError, clearErrors, watch } = useForm<FormData>({
    resolver: zodResolver(schema),
    mode: "onChange",
  })

  // Observar valores para feedback visual de validez en tiempo real
  const nameValue = watch("name")
  const emailValue = watch("email")
  const passwordValue = watch("password")
  const confirmPasswordValue = watch("confirmPassword")

  async function onSubmit(data: FormData) {
    setLoading(true)
    clearErrors()
    const result = await registerService({ name: data.name, email: data.email, password: data.password })
    setLoading(false)
    if (!result.success || !result.session) {
      if (result.fieldErrors) {
        Object.entries(result.fieldErrors).forEach(([field, message]) => {
          setError(field as any, { type: "server", message: message as string })
        })
        toast.error("Revisa los campos marcados e intenta de nuevo")
        return
      }
      toast.error(result.error || "Error al registrar")
      return
    }
    login(result.session)
    toast.success("Cuenta creada exitosamente.")
    router.push("/onboarding")
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-background overflow-x-hidden p-6 lg:p-12">
      <style dangerouslySetInnerHTML={{
        __html: `
        @import url("https://fonts.googleapis.com/css2?family=Darker+Grotesque:wght@600;900&display=swap");
        
        .brutalist-bg {
          background-color: color-mix(in srgb, var(--muted) 30%, var(--background));
        }
        .outer-frame {
          pointer-events: none;
          position: fixed;
          inset: 1rem;
          border: 4px solid black;
          z-index: 100;
        }
        .brutalist-btn-shadow {
          position: absolute;
          inset: 0;
          background: black;
          z-index: -1;
        }
        .brutalist-btn:hover .brutalist-btn-content {
          transform: translate(-4px, -4px);
        }
        .brutalist-btn-content {
          transition: transform 0.2s ease;
        }
      `}} />

      {/* ── Marco Exterior Brutalista ── */}
      <div className="outer-frame hidden md:block" />

      {/* ── Fondo de Infinity Loop Centrado ── */}
      <div className="pointer-events-none absolute inset-0 z-0 flex items-center justify-center overflow-hidden opacity-30 lg:opacity-50">
        <style dangerouslySetInnerHTML={{
          __html: `
          .finny {
            stroke-width: 1.43;
            animation: rot 36s linear infinite;
            perspective: 500px;
            width: 80vw;
            height: 60vh;
          }
          .fbottom {
            fill: none;
            stroke-width: inherit;
            stroke: var(--muted-foreground);
            stroke-opacity: 0.2;
          }
          .ll {
            fill: none;
            stroke: var(--primary);
            animation: loop 3s linear infinite;
            stroke-width: 0.35;
            stroke-dasharray: 3 24.5;
            stroke-linecap: round;
            animation-delay: -1.5s;
          }
          .shad {
            animation: raise 3s linear infinite;
          }
          .shad.odd {
            animation-delay: -1.5s;
          }
          .clip-shadow {
            stroke-linecap: butt;
            fill: none;
            opacity: 0.25;
            stroke-width: inherit;
            stroke: url(#sgrad);
          }
          @keyframes raise {
            0%, 20% { opacity: 1; }
            30%, 70% { opacity: 0; }
            80%, 100% { opacity: 1; }
          }
          @keyframes loop {
            0% { stroke-dashoffset: 0.5; }
            100% { stroke-dashoffset: 28; }
          }
          @keyframes rot {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
          #sgrad stop {
            stop-color: var(--primary);
          }
        `}} />
        <svg className="finny" viewBox="-1 -1 12 8">
          <defs>
            <path id="infinite" d="M5 3C4 2 3.1 1 2 1a2 2  0 000 4c1.1 0 2-1 3-2s1.9-2  3-2a2 2 0 010 4C6.9  5 6 4 5 3"></path>
            <radialGradient id="sgrad" gradientUnits="userSpaceOnUse" cx="5" cy="3" r="3.4">
              <stop offset=".25" stopColor="currentColor"></stop>
              <stop offset=".9" stopColor="currentColor" stopOpacity="0"></stop>
            </radialGradient>
            <path id="shad1" className="clip-shadow" d="M4.5 2.5C3.7 1.7 2.9 1 2 1m6 4c-1 0-1.7-.7-2.5-1.5"></path>
          </defs>
          <use href="#infinite" className="fbottom"></use>
          <use href="#shad1" className="shad even" />
          <g className="shad odd">
            <use href="#shad1" transform="translate(0 6) scale(1 , -1)" />
          </g>
          <use href="#infinite" className="ll"></use>
        </svg>
      </div>

      <div className="relative z-10 w-full max-w-2xl flex flex-col items-center">
        {/* Botón Regresar */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="self-start mb-8"
        >
          <Button
            variant="ghost"
            onClick={() => router.push("/")}
            className="font-black uppercase tracking-widest text-[10px] border-2 border-transparent hover:border-black transition-all"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver al inicio
          </Button>
        </motion.div>

        <div className="text-center mb-12 relative w-full">
          <div className="flex flex-col md:flex-row items-center justify-center gap-6 md:gap-8">
            <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tighter leading-none italic scale-y-110">
              Gestiona tu equipo con <span className="text-primary italic">ProGest</span>.
            </h1>

            {/* Logo Rebelde (Opción B) */}
            <motion.div
              initial={{ rotate: -20, scale: 0.5, opacity: 0 }}
              animate={{ rotate: 12, scale: 1, opacity: 1 }}
              transition={{
                type: "spring",
                stiffness: 260,
                damping: 20,
                delay: 0.1
              }}
              className="relative"
            >
              <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full scale-150 animate-pulse pointer-events-none" />
              <Logo
                size={80}
                showText={false}
                className="relative z-10 drop-shadow-[0_10px_20px_rgba(0,0,0,0.15)] animate-float-fast"
              />
            </motion.div>
          </div>
          <p className="text-sm font-bold uppercase tracking-widest text-muted-foreground pt-10">
            Crea tu identidad digital en ProGest
          </p>
        </div>

        {/* Lista de Campos Brutalistas */}
        <form onSubmit={handleSubmit(onSubmit)} className="w-full space-y-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
            <BrutalistInput
              id="name"
              label="Nombre Completo"
              placeholder="Ej. Juan Pérez"
              register={register("name")}
              error={errors.name?.message}
              isValid={!!nameValue && nameValue.length >= 2}
            />
            <BrutalistInput
              id="email"
              label="Email Corporativo"
              type="email"
              placeholder="usuario@progest.com"
              register={register("email")}
              error={errors.email?.message}
              isValid={!!emailValue && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailValue)}
            />
            <BrutalistInput
              id="password"
              label="Contraseña de Acceso"
              placeholder="Mín. 8 caracteres"
              register={register("password")}
              error={errors.password?.message}
              isValid={!!passwordValue && passwordValue.length >= 8 && /[A-Z]/.test(passwordValue)}
              showPasswordToggle
              isPasswordVisible={showPassword}
              onTogglePassword={() => setShowPassword(!showPassword)}
            />
            <BrutalistInput
              id="confirmPassword"
              label="Repetir Contraseña"
              placeholder="Confirmar identidad"
              register={register("confirmPassword")}
              error={errors.confirmPassword?.message}
              isValid={!!confirmPasswordValue && confirmPasswordValue === passwordValue && confirmPasswordValue.length > 0}
              showPasswordToggle
              isPasswordVisible={showConfirmPassword}
              onTogglePassword={() => setShowConfirmPassword(!showConfirmPassword)}
            />
          </div>

          {/* Botón de Registro Brutalista */}
          <div className="relative pt-8 group">
            <div className="absolute inset-0 bg-black translate-y-2 translate-x-2 rounded-none" />
            <Button
              type="submit"
              disabled={loading}
              className={cn(
                "relative w-full h-20 text-2xl font-black uppercase tracking-[0.2em] italic border-4 border-black transition-all",
                "bg-primary text-white hover:bg-primary/90 hover:translate-x-1 hover:translate-y-1 active:translate-x-2 active:translate-y-2"
              )}
            >
              {loading ? (
                <Loader2 className="mr-3 h-6 w-6 animate-spin" />
              ) : (
                <span className="flex items-center gap-4">
                  Sincronizar Acceso <ArrowRight className="w-8 h-8" />
                </span>
              )}
            </Button>
          </div>
        </form>

        <div className="mt-12 text-center">
          <Link href="/auth/login" className="group">
            <span className="text-xs font-black uppercase tracking-widest text-muted-foreground group-hover:text-foreground transition-colors mr-2">
              ¿Ya eres un agente?
            </span>
            <span className="text-xs font-black uppercase tracking-widest text-primary border-b-2 border-primary group-hover:bg-primary group-hover:text-white px-2 py-1 transition-all">
              Log In
            </span>
          </Link>
        </div>
      </div>
    </div>
  )
}
