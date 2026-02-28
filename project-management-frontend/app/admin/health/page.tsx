"use client"

import { useDataStore } from "@/stores/dataStore"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Activity, CheckCircle2, AlertTriangle, XCircle } from "lucide-react"

export default function HealthPage() {
  const healthChecks = useDataStore((s) => s.healthChecks)

  const healthy = healthChecks.filter((h) => h.status === "healthy").length
  const degraded = healthChecks.filter((h) => h.status === "degraded").length
  const down = healthChecks.filter((h) => h.status === "down").length

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Salud del Sistema</h1>
        <p className="text-muted-foreground">Monitoreo de servicios en tiempo real</p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="flex flex-col items-center gap-2 p-5">
            <CheckCircle2 className="h-6 w-6 text-emerald-500" />
            <span className="text-2xl font-bold">{healthy}</span>
            <span className="text-xs text-muted-foreground">Saludables</span>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex flex-col items-center gap-2 p-5">
            <AlertTriangle className="h-6 w-6 text-amber-500" />
            <span className="text-2xl font-bold">{degraded}</span>
            <span className="text-xs text-muted-foreground">Degradados</span>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex flex-col items-center gap-2 p-5">
            <XCircle className="h-6 w-6 text-red-500" />
            <span className="text-2xl font-bold">{down}</span>
            <span className="text-xs text-muted-foreground">Caidos</span>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col gap-3">
        {healthChecks.map((h) => (
          <Card key={h.service}>
            <CardContent className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <div className={`h-3 w-3 rounded-full ${h.status === "healthy" ? "bg-emerald-500" : h.status === "degraded" ? "bg-amber-500" : "bg-red-500"}`} />
                <div>
                  <p className="text-sm font-medium">{h.service}</p>
                  <p className="text-xs text-muted-foreground">Ultimo chequeo: {new Date(h.last_check).toLocaleString("es-ES")}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-mono text-sm">{h.latency}ms</span>
                <Badge
                  variant={h.status === "healthy" ? "default" : h.status === "degraded" ? "outline" : "destructive"}
                  className={h.status === "healthy" ? "bg-emerald-500 hover:bg-emerald-600" : ""}
                >
                  {h.status === "healthy" ? "OK" : h.status === "degraded" ? "Degradado" : "Caido"}
                </Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
