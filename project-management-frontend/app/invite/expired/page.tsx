"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Clock } from "lucide-react"

export default function InviteExpiredPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 px-4">
      <Card className="w-full max-w-md text-center">
        <CardContent className="py-10">
          <Clock className="mx-auto mb-4 h-16 w-16 text-orange-500" />
          <h2 className="mb-2 text-xl font-bold">Invitacion Expirada</h2>
          <p className="mb-6 text-sm text-muted-foreground">
            Esta invitacion ha expirado. Contacta al administrador de tu proyecto para recibir una nueva invitacion.
          </p>
          <Link href="/auth/login">
            <Button variant="outline">Ir al Login</Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  )
}
