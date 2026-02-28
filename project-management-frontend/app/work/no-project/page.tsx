"use client"

import { Card, CardContent } from "@/components/ui/card"
import { FolderX } from "lucide-react"

export default function NoProjectPage() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <Card className="w-full max-w-md text-center">
        <CardContent className="flex flex-col items-center gap-4 py-12">
          <FolderX className="h-12 w-12 text-muted-foreground" />
          <h2 className="text-lg font-bold">Sin proyecto asignado</h2>
          <p className="text-sm text-muted-foreground">
            Aun no perteneces a ningun proyecto. Pide a un propietario de proyecto que te invite para comenzar a trabajar.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
