"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"
import { Loader2, CheckCircle2, Mail, MapPin, Phone } from "lucide-react"

const schema = z.object({
  name: z.string().min(2, "Minimo 2 caracteres"),
  email: z.string().email("Email invalido"),
  subject: z.string().min(3, "Minimo 3 caracteres"),
  message: z.string().min(10, "Minimo 10 caracteres"),
})

export default function ContactPage() {
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const { register, handleSubmit, formState: { errors } } = useForm<z.infer<typeof schema>>({ resolver: zodResolver(schema) })

  async function onSubmit() {
    setLoading(true)
    await new Promise((r) => setTimeout(r, 600))
    setLoading(false)
    setSent(true)
    toast.success("Mensaje enviado correctamente")
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-16">
      <div className="mb-12 text-center">
        <h1 className="mb-3 text-4xl font-bold text-balance">Contacto</h1>
        <p className="text-muted-foreground">Tienes preguntas? Escribenos y te responderemos lo antes posible.</p>
      </div>
      <div className="grid gap-8 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Enviar Mensaje</CardTitle>
            <CardDescription>Completa el formulario y nos pondremos en contacto contigo.</CardDescription>
          </CardHeader>
          <CardContent>
            {sent ? (
              <div className="flex flex-col items-center gap-4 py-8">
                <CheckCircle2 className="h-12 w-12 text-emerald-500" />
                <p className="text-center text-sm text-muted-foreground">Tu mensaje fue enviado correctamente. Te responderemos pronto.</p>
                <Button variant="outline" onClick={() => setSent(false)}>Enviar otro mensaje</Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="name">Nombre</Label>
                  <Input id="name" placeholder="Tu nombre" {...register("name")} />
                  {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" placeholder="tu@email.com" {...register("email")} />
                  {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="subject">Asunto</Label>
                  <Input id="subject" placeholder="Asunto del mensaje" {...register("subject")} />
                  {errors.subject && <p className="text-sm text-destructive">{errors.subject.message}</p>}
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="message">Mensaje</Label>
                  <Textarea id="message" placeholder="Escribe tu mensaje..." rows={5} {...register("message")} />
                  {errors.message && <p className="text-sm text-destructive">{errors.message.message}</p>}
                </div>
                <Button type="submit" disabled={loading}>
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Enviar Mensaje
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
        <div className="flex flex-col gap-6">
          <Card>
            <CardContent className="flex items-start gap-4 p-6">
              <Mail className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
              <div>
                <h3 className="font-semibold">Email</h3>
                <p className="text-sm text-muted-foreground">soporte@progest.com</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-start gap-4 p-6">
              <Phone className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
              <div>
                <h3 className="font-semibold">Telefono</h3>
                <p className="text-sm text-muted-foreground">+1 (555) 123-4567</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-start gap-4 p-6">
              <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
              <div>
                <h3 className="font-semibold">Oficina</h3>
                <p className="text-sm text-muted-foreground">Ciudad de Mexico, Mexico</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
