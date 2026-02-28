"use client"

import { useState } from "react"
import Link from "next/link"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { forgotPasswordService } from "@/services/authService"
import { toast } from "sonner"
import { Loader2, FolderKanban, ArrowLeft, CheckCircle2 } from "lucide-react"

const schema = z.object({ email: z.string().email("Email invalido") })

export default function ForgotPasswordPage() {
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const { register, handleSubmit, formState: { errors } } = useForm<z.infer<typeof schema>>({ resolver: zodResolver(schema) })

  async function onSubmit(data: z.infer<typeof schema>) {
    setLoading(true)
    const result = await forgotPasswordService(data.email)
    setLoading(false)
    if (result.success) {
      setSent(true)
      toast.success(result.message)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <FolderKanban className="h-6 w-6" />
          </div>
          <CardTitle className="text-2xl font-bold">Recuperar Contrasena</CardTitle>
          <CardDescription>Te enviaremos un enlace para restablecer tu contrasena</CardDescription>
        </CardHeader>
        <CardContent>
          {sent ? (
            <div className="flex flex-col items-center gap-4 py-4">
              <CheckCircle2 className="h-12 w-12 text-emerald-500" />
              <p className="text-center text-sm text-muted-foreground">
                Si el email existe en nuestro sistema, recibiras un enlace de recuperacion en tu bandeja de entrada.
              </p>
              <Link href="/auth/login">
                <Button variant="outline">
                  <ArrowLeft className="mr-2 h-4 w-4" /> Volver al login
                </Button>
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="tu@email.com" {...register("email")} />
                {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
              </div>
              <Button type="submit" disabled={loading} className="w-full">
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Enviar enlace
              </Button>
              <Link href="/auth/login" className="text-center text-sm text-muted-foreground hover:text-primary">
                <ArrowLeft className="mr-1 inline h-3 w-3" /> Volver al login
              </Link>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
