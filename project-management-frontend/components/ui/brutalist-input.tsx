"use client"

import React from "react"
import { UseFormRegisterReturn } from "react-hook-form"
import { motion, AnimatePresence } from "framer-motion"
import { Check, Loader2, ArrowRight } from "lucide-react"
import { cn } from "@/lib/utils"

interface BrutalistInputProps {
  label: string
  id: string
  type?: string
  placeholder?: string
  register: UseFormRegisterReturn
  error?: string
  isValid?: boolean
  isLoading?: boolean
  className?: string
  showPasswordToggle?: boolean
  onTogglePassword?: () => void
  isPasswordVisible?: boolean
}

/**
 * BrutalistInput - Un componente de entrada con estética "Brutalist Modern".
 * Bordes negros audaces, sombras desplazadas y animaciones elásticas.
 */
export function BrutalistInput({
  label,
  id,
  type = "text",
  placeholder,
  register,
  error,
  isValid = false,
  isLoading = false,
  className,
  showPasswordToggle,
  onTogglePassword,
  isPasswordVisible,
}: BrutalistInputProps) {
  return (
    <div className={cn("relative w-full group py-4", className)}>
      <style dangerouslySetInnerHTML={{ __html: `
        :root {
          --brutalist-elastic: linear(
            0 0%, 0.22 2.1%, 0.86 6.5%, 1.11 8.6%, 1.3 10.7%, 1.35 11.8%, 
            1.37 12.9%, 1.37 13.7%, 1.36 14.5%, 1.32 16.2%, 1.03 21.8%, 
            0.94 24%, 0.89 25.9%, 0.88 26.85%, 0.87 27.8%, 0.87 29.25%, 
            0.88 30.7%, 0.91 32.4%, 0.98 36.4%, 1.01 38.3%, 1.04 40.5%, 
            1.05 42.7%, 1.05 44.1%, 1.04 45.7%, 1 53.3%, 0.99 55.4%, 
            0.98 57.5%, 0.99 60.7%, 1 68.1%, 1.01 72.2%, 1 86.7%, 1 100%
          );
        }
        .brutalist-container {
          transition: transform 300ms ease;
        }
        .brutalist-group:focus-within .brutalist-container,
        .brutalist-group:has(input:not(:placeholder-shown)) .brutalist-container {
          transform: translate(-0.5rem, -0.5rem);
          transition: transform 1000ms var(--brutalist-elastic);
        }
      `}} />

      <div className="brutalist-group relative">
        {/* Sombra/Fondo Negro */}
        <div className="absolute inset-0 bg-foreground rounded-none translate-y-0 translate-x-0" />

        {/* Contenedor Principal */}
        <div className="brutalist-container relative bg-card border-[3.5px] border-foreground overflow-hidden flex items-stretch">
          <div className="flex-1 flex flex-col pt-6 pb-2 px-5 min-h-[4.5rem]">
            {/* Label flotante o estática */}
            <label
              htmlFor={id}
              className={cn(
                "absolute left-5 font-black uppercase text-[10px] tracking-widest transition-all duration-300",
                "top-2 opacity-100 translate-y-0",
                !placeholder && "group-focus-within:opacity-100 group-focus-within:translate-y-0 opacity-0 translate-y-2"
              )}
            >
              {label}
            </label>

            <input
              id={id}
              type={showPasswordToggle ? (isPasswordVisible ? "text" : "password") : type}
              placeholder={placeholder}
              className={cn(
                "w-full bg-transparent border-none outline-none focus:ring-0 p-0 text-lg font-bold placeholder:text-foreground/30 placeholder:uppercase",
                isValid && "pr-12"
              )}
              {...register}
            />
          </div>

          {/* Icon Container (Sólo si es válido o si tiene toggle de password) */}
          <AnimatePresence>
            {(isValid || showPasswordToggle) && (
              <motion.div
                initial={{ x: 60 }}
                animate={{ x: 0 }}
                exit={{ x: 60 }}
                transition={{ type: "spring", stiffness: 260, damping: 20 }}
                className={cn(
                  "flex items-center justify-center aspect-square h-full border-l-[3.5px] border-foreground",
                  isValid ? "bg-emerald-400" : "bg-primary"
                )}
              >
                {showPasswordToggle ? (
                  <button
                    type="button"
                    onClick={onTogglePassword}
                    className="p-3 text-white hover:scale-110 transition-transform active:scale-95"
                  >
                    {isPasswordVisible ? (
                      <motion.div initial={{ scale: 0.5 }} animate={{ scale: 1 }}>
                         {/* El icono del ojo se maneja en el padre, pero aquí ponemos la base */}
                         {isPasswordVisible ? "Ocultar" : "Ver"}
                      </motion.div>
                    ) : "Ver"}
                  </button>
                ) : (
                  isValid && <Check className="text-foreground w-6 h-6 stroke-[3px]" />
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Error Message */}
      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-[11px] font-black uppercase text-destructive mt-1 ml-1 tracking-tighter"
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  )
}
