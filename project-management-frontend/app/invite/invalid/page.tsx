"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { AlertTriangle } from "lucide-react"

export default function InviteInvalidPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 px-4">
      <Card className="w-full max-w-md text-center">
        <CardContent className="py-10">
          <AlertTriangle className="mx-auto mb-4 h-16 w-16 text-destructive" />
          <h2 className="mb-2 text-xl font-bold">Invitacion Invalida</h2>
          <p className="mb-6 text-sm text-muted-foreground">
            El enlace de invitacion no es valido. Verifica que hayas copiado el enlace correctamente o contacta al administrador del proyecto.
          </p>
          <Link href="/auth/login">
            <Button variant="outline">Ir al Login</Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  )
}
