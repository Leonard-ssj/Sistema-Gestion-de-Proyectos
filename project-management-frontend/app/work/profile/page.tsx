"use client"

import { useMemo, useState } from "react"
import { useAuthStore } from "@/stores/authStore"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { BOTTTs_NEUTRAL_AVATARS, normalizeAvatarUrl } from "@/lib/avatars"
import { cn } from "@/lib/utils"
import { updateMeService } from "@/services/authService"
import { Switch } from "@/components/ui/switch"
import { useNotificationStore } from "@/stores/notificationStore"

export default function WorkProfilePage() {
  const session = useAuthStore((s) => s.session)
  const login = useAuthStore((s) => s.login)
  const soundEnabled = useNotificationStore((s) => s.soundEnabled)
  const setSoundEnabled = useNotificationStore((s) => s.setSoundEnabled)

  const user = session?.user
  const [name, setName] = useState(user?.name || "")
  const [avatar, setAvatar] = useState<string>(normalizeAvatarUrl(user?.avatar))
  const [saving, setSaving] = useState(false)

  const selectedAvatar = useMemo(() => normalizeAvatarUrl(avatar), [avatar])

  async function handleSave() {
    if (!session) return
    const trimmed = name.trim()
    if (!trimmed) {
      toast.error("El nombre es requerido")
      return
    }
    setSaving(true)
    try {
      const result = await updateMeService({ name: trimmed, avatar: selectedAvatar })
      if (!result.success || !result.user) {
        toast.error(result.error || "No se pudo actualizar tu perfil")
        return
      }
      login({ ...session, user: result.user })
      toast.success("Perfil actualizado")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Mi Perfil</h1>
        <p className="text-muted-foreground">Administra tu informacion personal</p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-2">
          <CardHeader className="pb-2"><CardTitle className="text-sm">Informacion Personal</CardTitle></CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div>
              <Label>Nombre</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div>
              <Label>Email</Label>
              <Input value={user?.email || ""} disabled className="bg-muted" />
              <p className="mt-1 text-xs text-muted-foreground">El email no se puede modificar</p>
            </div>
            <div className="flex flex-col gap-2">
              <Label>Avatar</Label>
              <div className="grid grid-cols-4 gap-2">
                {BOTTTs_NEUTRAL_AVATARS.map((a) => (
                  <button
                    key={a.id}
                    type="button"
                    onClick={() => setAvatar(a.src)}
                    aria-label={`Seleccionar avatar ${a.seed}`}
                    disabled={saving}
                    className={cn(
                      "relative rounded-xl border bg-card p-2 transition-all hover:border-primary/40",
                      selectedAvatar === a.src ? "border-primary bg-primary/10 shadow-sm" : "border-border"
                    )}
                  >
                    <img alt="" src={a.src} className="h-10 w-10 rounded-full" />
                  </button>
                ))}
              </div>
            </div>
            <div className="flex items-center justify-between rounded-lg border bg-muted/20 p-3">
              <div className="space-y-1">
                <p className="text-sm font-medium">Sonido de notificaciones</p>
                <p className="text-xs text-muted-foreground">Reproduce un sonido cuando llegue una notificación</p>
              </div>
              <Switch checked={soundEnabled} onCheckedChange={setSoundEnabled} />
            </div>
            <Button onClick={handleSave} className="self-start">
              {saving ? "Guardando..." : "Guardar"}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm">Resumen</CardTitle></CardHeader>
          <CardContent className="flex flex-col items-center gap-3">
            <img alt="" src={selectedAvatar} className="h-16 w-16 rounded-full border border-border bg-muted/20" />
            <p className="text-sm font-medium">{user?.name}</p>
            <p className="text-xs text-muted-foreground">{user?.email}</p>
            <Badge>Empleado</Badge>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
